import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useTranslation } from "react-i18next";

interface TicketPriority {
  priority: string;
  count: number;
}

interface TicketTypesPieChartProps {
  data: TicketPriority[];
  loading?: boolean;
  title?: string;
}

const COLORS = {
  HIGH: "#ef4444", // red-500
  MEDIUM: "#f59e0b", // amber-500
  LOW: "#10b981", // emerald-500
};

export default function TicketTypesPieChart({
  data,
  loading,
  title,
}: TicketTypesPieChartProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="animate-pulse h-[250px] bg-gray-100 rounded-lg"></div>
    );
  }

  // Transform data to use translated priority labels
  const translatedData = data.map((item) => ({
    ...item,
    priority: t(`ticket.priority.${item.priority}`),
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {title || t("dashboard.charts.ticketsByPriority")}
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={translatedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="priority"
              label={({ priority, percent }) =>
                `${priority} ${(percent * 100).toFixed(0)}%`
              }
            >
              {translatedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[data[index].priority as keyof typeof COLORS] ||
                    "#9ca3af"
                  }
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
