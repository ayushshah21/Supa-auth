import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TicketTrend {
  date: string;
  total_tickets: number;
}

interface TicketsOverTimeGraphProps {
  data: TicketTrend[];
  loading?: boolean;
}

export default function TicketsOverTimeGraph({
  data,
  loading,
}: TicketsOverTimeGraphProps) {
  if (loading) {
    return (
      <div className="animate-pulse h-[300px] bg-gray-100 rounded-lg"></div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Tickets Over Time
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value) => [value, "Tickets"]}
            />
            <Line
              type="monotone"
              dataKey="total_tickets"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Tickets"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
