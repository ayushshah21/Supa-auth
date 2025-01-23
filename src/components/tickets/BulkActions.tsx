import type { Database, TicketStatus } from "../../types/supabase";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {t("ticket.bulk.selected", { count: selectedCount })}
        </span>
        <select
          onChange={(e) => onStatusUpdate(e.target.value as TicketStatus)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={updating}
        >
          <option value="">{t("ticket.bulk.changeStatus")}</option>
          <option value="OPEN">{t("ticket.status.OPEN")}</option>
          <option value="IN_PROGRESS">{t("ticket.status.IN_PROGRESS")}</option>
          <option value="RESOLVED">{t("ticket.status.RESOLVED")}</option>
          <option value="CLOSED">{t("ticket.status.CLOSED")}</option>
        </select>
        <select
          onChange={(e) => onAssign(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={updating}
        >
          <option value="">{t("ticket.bulk.assignTo")}</option>
          <option value="">{t("ticket.labels.unassigned")}</option>
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
        {t("ticket.bulk.clearSelection")}
      </button>
    </div>
  );
}
