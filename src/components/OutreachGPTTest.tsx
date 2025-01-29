import { useState } from "react";
import { generateOutreachResponse, sendEmail } from "../lib/outreachGpt";

// Import API_URL from a central location
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
console.log("Component API_URL:", API_URL); // Debug log

interface ErrorDetails {
  message: string;
  type?: string;
}

interface OutreachResponse {
  response: string;
}

export default function OutreachGPTTest() {
  const [query, setQuery] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse("");
    setCopySuccess(false);

    try {
      const result: OutreachResponse = await generateOutreachResponse({
        query,
        ticketId: ticketId || undefined,
      });
      setResponse(result.response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate response";
      setError({
        message: errorMessage,
        type: err instanceof Error ? err.name : "Unknown",
      });
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError({ message: "Failed to copy to clipboard" });
    }
  };

  const handleSendEmail = async () => {
    if (!ticketId) {
      setError({ message: "Ticket ID is required to send email" });
      return;
    }

    setSendingEmail(true);
    setError(null);
    setEmailSuccess(false);

    try {
      // First, get the ticket data to get the customer's email
      console.log(
        "Fetching ticket data from:",
        `${API_URL}/api/tickets/${ticketId}`
      ); // Debug log
      const ticketResponse = await fetch(`${API_URL}/api/tickets/${ticketId}`);
      if (!ticketResponse.ok) {
        throw new Error("Failed to fetch ticket data");
      }
      const ticketData = await ticketResponse.json();
      console.log("Ticket data received:", ticketData); // Debug log

      // Check for customer data in both possible locations
      const customerEmail =
        ticketData.customer?.email || ticketData.users?.email;
      console.log("Customer email found:", customerEmail); // Debug log

      if (!customerEmail) {
        throw new Error(
          "Customer email not found in ticket data. Customer data: " +
            JSON.stringify(ticketData.customer || ticketData.users)
        );
      }

      await sendEmail({
        to: customerEmail,
        subject: "Response from Ticket.ai Support",
        body: response,
        ticketId: ticketId,
      });

      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send email";
      setError({
        message: errorMessage,
        type: err instanceof Error ? err.name : "Unknown",
      });
      console.error("Error sending email:", err);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          OutreachGPT Test
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Query
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
                placeholder="E.g., Draft an apology email for shipping delay to customer John Smith"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticket ID (optional)
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="E.g., T123"
                />
                {ticketId && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Ticket Context Enabled
                  </span>
                )}
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Generating Response...
              </>
            ) : (
              "Generate Response"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error: {error.message}
                </h3>
                {error.type && (
                  <p className="mt-1 text-xs text-red-700">
                    Type: {error.type}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {response && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                Generated Response:
              </h3>
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {copySuccess ? (
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
            <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap text-gray-800">
              {response}
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !ticketId}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingEmail ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Sending...
                  </>
                ) : emailSuccess ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                    Sent!
                  </>
                ) : (
                  "Send Email"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
