import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

interface TicketTrend {
  date: string;
  total_tickets: number;
}

interface TicketsOverTimeGraphProps {
  data: TicketTrend[];
  loading?: boolean;
  title?: string;
}

export default function TicketsOverTimeGraph({
  data,
  loading,
  title,
}: TicketsOverTimeGraphProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="animate-pulse h-[250px] bg-gray-100 rounded-lg"></div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {title || t("dashboard.charts.ticketsOverTime")}
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 30,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              interval={4}
              dy={10}
            />
            <YAxis allowDecimals={false} dx={-10} width={40} />
            <Tooltip
              labelFormatter={(date) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              formatter={(value) => [value, t("dashboard.charts.tickets")]}
            />
            <Line
              type="monotone"
              dataKey="total_tickets"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name={t("dashboard.charts.tickets")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
