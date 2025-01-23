import { useTranslation } from "react-i18next";

type Props = {
  ticket: {
    title: string;
    status: string;
    priority: string;
    created_at: string;
    customer?: { email: string } | null;
  };
};

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

export default function TicketHeader({ ticket }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {ticket.title}
        </h1>
        <p className="text-sm text-gray-500">
          {t("ticket.labels.createdBy")}{" "}
          {ticket.customer?.email || t("ticket.labels.unknown")}{" "}
          {t("ticket.labels.on")}{" "}
          {new Date(ticket.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex space-x-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            ticket.status
          )}`}
        >
          {t(`ticket.status.${ticket.status}`)}
        </span>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
            ticket.priority
          )}`}
        >
          {t(`ticket.priority.${ticket.priority}`)}
        </span>
      </div>
    </div>
  );
}
