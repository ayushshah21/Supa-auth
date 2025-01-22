import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type NoteEditorProps = {
  onSubmit: (note: { content: string; internal: boolean }) => Promise<void>;
  disabled?: boolean;
};

export default function NoteEditor({ onSubmit, disabled }: NoteEditorProps) {
  const [content, setContent] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(true);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit({ content, internal: isInternalNote });
    setContent(""); // Clear the editor after submission
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

        <button
          onClick={handleSubmit}
          disabled={!content.trim() || disabled}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Add Note
        </button>
      </div>
    </div>
  );
}
