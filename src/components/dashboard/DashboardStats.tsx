import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import MetricCard from "./MetricCard";
import TicketTypesPieChart from "./TicketTypesPieChart";
import TicketsOverTimeGraph from "./TicketsOverTimeGraph";

interface TicketPriority {
  priority: string;
  count: number;
}

interface TicketTrend {
  date: string;
  total_tickets: number;
}

interface WorkerStats {
  open_tickets: number;
  resolved_last_7_days: number;
  avg_resolution_hours: number;
  total_tickets: number;
}

export default function DashboardStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerStats, setWorkerStats] = useState<WorkerStats | null>(null);
  const [ticketPriorities, setTicketPriorities] = useState<TicketPriority[]>(
    []
  );
  const [ticketTrends, setTicketTrends] = useState<TicketTrend[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch worker stats
        const { data: statsData, error: statsError } = await supabase.rpc(
          "get_worker_stats"
        );
        if (statsError) throw statsError;
        setWorkerStats(Array.isArray(statsData) ? statsData[0] : statsData);

        // Fetch ticket priorities
        const { data: priorityData, error: priorityError } = await supabase.rpc(
          "get_tickets_by_priority"
        );
        if (priorityError) throw priorityError;
        setTicketPriorities(priorityData);

        // Fetch ticket trends
        const { data: trendData, error: trendError } = await supabase.rpc(
          "get_tickets_over_time",
          {
            days_back: 30,
          }
        );
        if (trendError) throw trendError;
        setTicketTrends(trendData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Open Tickets"
          value={loading ? "-" : workerStats?.open_tickets || 0}
        />
        <MetricCard
          title="Recently Resolved"
          value={loading ? "-" : workerStats?.resolved_last_7_days || 0}
          description="Last 7 days"
        />
        <MetricCard
          title="Avg. Resolution Time"
          value={
            loading
              ? "-"
              : workerStats?.avg_resolution_hours
              ? `${workerStats.avg_resolution_hours.toFixed(1)}h`
              : "0h"
          }
        />
        <MetricCard
          title="Total Tickets"
          value={loading ? "-" : workerStats?.total_tickets || 0}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TicketTypesPieChart data={ticketPriorities} loading={loading} />
        <TicketsOverTimeGraph data={ticketTrends} loading={loading} />
      </div>
    </div>
  );
}
