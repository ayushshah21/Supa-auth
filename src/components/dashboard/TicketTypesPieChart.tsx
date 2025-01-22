import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface TicketPriority {
  priority: string;
  count: number;
}

interface TicketTypesPieChartProps {
  data: TicketPriority[];
  loading?: boolean;
}

const COLORS = {
  HIGH: "#ef4444", // red-500
  MEDIUM: "#f59e0b", // amber-500
  LOW: "#10b981", // emerald-500
};

export default function TicketTypesPieChart({
  data,
  loading,
}: TicketTypesPieChartProps) {
  if (loading) {
    return (
      <div className="animate-pulse h-[250px] bg-gray-100 rounded-lg"></div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Types</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
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
              {data.map((entry) => (
                <Cell
                  key={entry.priority}
                  fill={
                    COLORS[entry.priority as keyof typeof COLORS] || "#9ca3af"
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
