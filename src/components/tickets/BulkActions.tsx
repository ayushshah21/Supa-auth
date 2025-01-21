import type { Database, TicketStatus } from "../../types/supabase";

type Props = {
  selectedCount: number;
  onStatusUpdate: (status: TicketStatus) => Promise<void>;
  onAssign: (workerId: string) => Promise<void>;
  onClearSelection: () => void;
  workers: Database["public"]["Tables"]["users"]["Row"][];
  updating: boolean;
};

export default function BulkActions({
  selectedCount,
  onStatusUpdate,
  onAssign,
  onClearSelection,
  workers,
  updating,
}: Props) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {selectedCount} ticket{selectedCount === 1 ? "" : "s"} selected
        </span>
        <select
          onChange={(e) => onStatusUpdate(e.target.value as TicketStatus)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={updating}
        >
          <option value="">Change Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          onChange={(e) => onAssign(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={updating}
        >
          <option value="">Assign To</option>
          <option value="">Unassigned</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.email}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onClearSelection}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Clear Selection
      </button>
    </div>
  );
}
