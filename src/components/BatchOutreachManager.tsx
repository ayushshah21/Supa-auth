import { useState, useRef, useCallback } from "react";
import { generateBatchOutreach, sendBatchEmails } from "../lib/outreachGpt";
import debounce from "lodash/debounce";

interface SelectedUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface DraftEmail {
  userId: string;
  content: string;
  status: "draft" | "edited" | "approved" | "sent";
}

export default function BatchOutreachManager() {
  const [inputValue, setInputValue] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SelectedUser[]>([]);
  const [drafts, setDrafts] = useState<DraftEmail[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<{
    success?: boolean;
    message?: string;
    errors?: { userId: string; error: string }[];
  } | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const searchUrl = `${backendUrl}/api/users/search?q=${encodeURIComponent(
        query
      )}`;
      console.log("Backend URL:", backendUrl);
      console.log("Making search request to:", searchUrl);

      try {
        const response = await fetch(searchUrl);
        console.log("Search response status:", response.status);
        const contentType = response.headers.get("content-type");
        console.log("Content-Type:", contentType);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response body:", errorText);
          throw new Error(
            `Search failed: ${response.status} ${response.statusText}`
          );
        }

        // Verify we're getting JSON before trying to parse it
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Unexpected content type:", contentType);
          throw new Error(`Expected JSON but got ${contentType}`);
        }

        const data = await response.json();
        console.log("Search results:", data);
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle input changes including @ mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Find the last @ symbol and extract the search query
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const query = value.slice(lastAtIndex + 1);
      setSearchQuery(query);
      setShowUserSearch(true);
      debouncedSearch(query);
    } else {
      setShowUserSearch(false);
    }
  };

  // Handle keyboard navigation in search results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showUserSearch) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSearchIndex((prev) =>
          Math.min(prev + 1, searchResults.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSearchIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (searchResults[selectedSearchIndex]) {
          handleUserSelect(searchResults[selectedSearchIndex]);
        }
        break;
      case "Escape":
        setShowUserSearch(false);
        break;
    }
  };

  // Handle user selection from search
  const handleUserSelect = (user: SelectedUser) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setShowUserSearch(false);
    setInputValue(inputValue.replace(/@$/, "")); // Remove the @ symbol
  };

  // Generate drafts for all selected users
  const handleGenerateDrafts = async () => {
    setIsGenerating(true);
    try {
      console.log("Selected users:", selectedUsers);
      console.log("Input value:", inputValue);

      if (!selectedUsers.length) {
        console.error("No users selected");
        return;
      }
      if (!inputValue.trim()) {
        console.error("No prompt provided");
        return;
      }

      // Format users to ensure all fields are strings
      const formattedUsers = selectedUsers.map((user) => ({
        id: String(user.id),
        name: String(user.name),
        email: String(user.email),
        avatar_url: user.avatar_url || "", // Convert null to empty string
      }));

      const response = await generateBatchOutreach({
        users: formattedUsers,
        prompt: inputValue,
      });
      console.log("Generate drafts response:", response);
      setDrafts(response.drafts);
    } catch (error) {
      console.error("Error generating drafts:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmails = async (draftsToSend: DraftEmail[]) => {
    setIsSending(true);
    setSendingStatus(null);

    try {
      const response = await sendBatchEmails(
        draftsToSend.map((draft) => ({
          userId: draft.userId,
          content: draft.content,
          email: selectedUsers.find((u) => u.id === draft.userId)?.email || "",
          subject: "Your Custom Message from Our Team", // You might want to make this configurable
        }))
      );

      if (response.success) {
        setSendingStatus({
          success: true,
          message: `Successfully sent ${response.sent_count} emails`,
        });

        // Update drafts status
        setDrafts(
          drafts.map((draft) =>
            draftsToSend.some((d) => d.userId === draft.userId)
              ? { ...draft, status: "sent" }
              : draft
          )
        );
      } else {
        setSendingStatus({
          success: false,
          message: "Some emails failed to send",
          errors: response.errors,
        });
      }
    } catch (error) {
      setSendingStatus({
        success: false,
        message: "Failed to send emails",
        errors: [{ userId: "unknown", error: String(error) }],
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Batch Outreach Manager
        </h2>

        {/* Selected Users Display */}
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              <span>{user.name}</span>
              <button
                onClick={() =>
                  setSelectedUsers(
                    selectedUsers.filter((u) => u.id !== user.id)
                  )
                }
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Main Input Area */}
        <div className="relative mb-4">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type @ to mention users, then describe your outreach message..."
            rows={4}
          />

          {/* User Search Popup */}
          {showUserSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <svg
                    className="animate-spin h-5 w-5 mx-auto mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching users...
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="py-1">
                  {searchResults.map((user, index) => (
                    <li
                      key={user.id}
                      className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center ${
                        index === selectedSearchIndex ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleUserSelect(user)}
                      onMouseEnter={() => setSelectedSearchIndex(index)}
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-sm text-gray-600">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : searchQuery ? (
                <div className="p-4 text-center text-gray-500">
                  No users found matching "{searchQuery}"
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Type to search for users
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setSelectedUsers([]);
              setInputValue("");
            }}
            className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            onClick={handleGenerateDrafts}
            disabled={
              selectedUsers.length === 0 || !inputValue.trim() || isGenerating
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Drafts...
              </span>
            ) : (
              "Generate Drafts"
            )}
          </button>
        </div>

        {/* Drafts Display */}
        {drafts.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Generated Drafts
              </h3>
              <button
                onClick={() =>
                  handleSendEmails(
                    drafts.filter((d) => d.status === "approved")
                  )
                }
                disabled={
                  isSending ||
                  !drafts.some((d) => d.status === "approved") ||
                  drafts.every((d) => d.status === "sent")
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending All...
                  </span>
                ) : (
                  "Send All Approved"
                )}
              </button>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {drafts.map((draft, index) => {
                const user = selectedUsers.find((u) => u.id === draft.userId);
                return (
                  <div
                    key={draft.userId}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {user?.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-lg">
                                {user?.name?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 text-lg">
                              {user?.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1.5 text-sm rounded-full ${
                              draft.status === "sent"
                                ? "bg-green-100 text-green-800"
                                : draft.status === "approved"
                                ? "bg-blue-100 text-blue-800"
                                : draft.status === "edited"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {draft.status.charAt(0).toUpperCase() +
                              draft.status.slice(1)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const newDrafts = [...drafts];
                                newDrafts[index] = {
                                  ...draft,
                                  status: "approved",
                                };
                                setDrafts(newDrafts);
                              }}
                              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleSendEmails([draft])}
                              disabled={isSending || draft.status === "sent"}
                              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              {isSending
                                ? "Sending..."
                                : draft.status === "sent"
                                ? "Sent ✓"
                                : "Send"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <textarea
                        value={draft.content}
                        onChange={(e) => {
                          const newDrafts = [...drafts];
                          newDrafts[index] = {
                            ...draft,
                            content: e.target.value,
                            status: "edited",
                          };
                          setDrafts(newDrafts);
                        }}
                        className="w-full h-96 p-4 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-base leading-relaxed resize-none"
                        placeholder="Email content..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {sendingStatus && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  sendingStatus.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center">
                  {sendingStatus.success ? (
                    <svg
                      className="h-5 w-5 text-green-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-red-400 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <p
                    className={`font-medium ${
                      sendingStatus.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {sendingStatus.message}
                  </p>
                </div>
                {sendingStatus.errors && sendingStatus.errors.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-red-700">
                    {sendingStatus.errors.map((error, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">•</span>
                        {selectedUsers.find((u) => u.id === error.userId)?.name}
                        : {error.error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
