import { useState } from "react";
import type { Database } from "../../types/supabase";

type Props = {
  ticket: {
    status: Database["public"]["Tables"]["tickets"]["Row"]["status"];
    assigned_to: { id: string; email: string } | null;
  };
  workers: Database["public"]["Tables"]["users"]["Row"][];
  onStatusChange: (
    status: Database["public"]["Tables"]["tickets"]["Row"]["status"]
  ) => Promise<void>;
  onAssignmentChange: (workerId: string) => Promise<void>;
  onAddNote: (note: { content: string; internal: boolean }) => Promise<void>;
  updating: boolean;
};

export default function TicketManagement({
  ticket,
  workers,
  onStatusChange,
  onAssignmentChange,
  onAddNote,
  updating,
}: Props) {
  const [newNote, setNewNote] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(true);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await onAddNote({ content: newNote, internal: isInternalNote });
    setNewNote("");
  };

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">
        Ticket Management
      </h2>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={ticket.status}
            onChange={(e) =>
              onStatusChange(
                e.target
                  .value as Database["public"]["Tables"]["tickets"]["Row"]["status"]
              )
            }
            disabled={updating}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={ticket.assigned_to?.id || ""}
            onChange={(e) => onAssignmentChange(e.target.value)}
            disabled={updating}
          >
            <option value="">Unassigned</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Note
        </label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          disabled={updating}
        />
        <div className="mt-2 flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              disabled={updating}
            />
            <span className="ml-2 text-sm text-gray-600">Internal Note</span>
          </label>
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || updating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
