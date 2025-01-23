import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Database } from "../../types/supabase";

type Props = {
  tickets: Array<
    Database["public"]["Tables"]["tickets"]["Row"] & {
      customer: Database["public"]["Tables"]["users"]["Row"];
      assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
      notes: Database["public"]["Tables"]["notes"]["Row"][];
    }
  >;
  selectedTickets: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectTicket: (ticketId: string, checked: boolean) => void;
  hideSelectionColumn?: boolean;
  hideCustomerColumn?: boolean;
};

export default function TicketTable({
  tickets,
  selectedTickets,
  onSelectAll,
  onSelectTicket,
  hideSelectionColumn = false,
  hideCustomerColumn = false,
}: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("ticket.noTicketsFound")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {!hideSelectionColumn && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedTickets.length === tickets.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("ticket.labels.title")}
            </th>
            {!hideCustomerColumn && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("ticket.labels.customer")}
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("ticket.labels.status")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("ticket.labels.priority")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("ticket.labels.assignedTo")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === "INPUT") return;
                navigate(`/ticket/${ticket.id}`);
              }}
            >
              {!hideSelectionColumn && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedTickets.includes(ticket.id)}
                    onChange={(e) =>
                      onSelectTicket(ticket.id, e.target.checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {ticket.title}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {ticket.description}
                  </div>
                </div>
              </td>
              {!hideCustomerColumn && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ticket.customer?.email}
                  </div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {t(`ticket.status.${ticket.status}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`text-xs font-medium ${getPriorityColor(
                    ticket.priority
                  )}`}
                >
                  {t(`ticket.priority.${ticket.priority}`)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ticket.assigned_to?.email || t("ticket.labels.unassigned")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
