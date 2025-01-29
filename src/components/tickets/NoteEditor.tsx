import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { generateTicketResponse } from "../../services/aiService";

type NoteEditorProps = {
  onSubmit: (note: { content: string; internal: boolean }) => Promise<void>;
  disabled?: boolean;
  hideInternalToggle?: boolean;
  ticketContent?: string;
};

export default function NoteEditor({
  onSubmit,
  disabled,
  hideInternalToggle,
  ticketContent = "",
}: NoteEditorProps) {
  const [content, setContent] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit({ content, internal: isInternalNote });
    setContent(""); // Clear the editor after submission
  };

  const handleAIAssist = async () => {
    if (!ticketContent || isGeneratingAI) return;

    setIsGeneratingAI(true);
    try {
      const response = await generateTicketResponse(ticketContent);
      if (response.content) {
        setContent(response.content);
      } else if (response.error) {
        console.error("AI generation failed:", response.error);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Configure Quill modules/formats
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <ReactQuill
          value={content}
          onChange={setContent}
          modules={modules}
          theme="snow"
          readOnly={disabled}
          placeholder="Add a note..."
        />
      </div>

      <div className="flex items-center justify-between space-x-4">
        {!hideInternalToggle && (
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              disabled={disabled}
            />
            <span className="ml-2 text-sm text-gray-600">Internal Note</span>
          </label>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleAIAssist}
            disabled={disabled || isGeneratingAI || !ticketContent}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isGeneratingAI ? (
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
                Generating...
              </>
            ) : (
              "AI Assist"
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || disabled}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            Add Message
          </button>
        </div>
      </div>
    </div>
  );
}
