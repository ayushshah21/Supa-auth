/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { getCurrentUser } from "../lib/supabase/auth";

type WorkerStats = {
  open_tickets: number;
  resolved_last_7_days: number;
  avg_resolution_hours: number;
  total_tickets: number;
};

export default function StatsPage() {
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setError("No user found");
          setLoading(false);
          return;
        }


        const { data, error: statsError } = await supabase.rpc(
          "get_worker_stats",
          {
            _worker_id: user.id,
          }
        );

        if (statsError) {
          console.error("[StatsPage] Error fetching stats:", statsError);
          setError(statsError.message);
          setLoading(false);
          return;
        }

        if (!data) {
          console.error("[StatsPage] No data returned");
          setError("No stats data available");
          setLoading(false);
          return;
        }

        // Handle both array and single object responses
        const statsData = Array.isArray(data) ? data[0] : data;

        setStats(statsData);
      } catch (err) {
        console.error("[StatsPage] Caught error:", err);
        setError("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-100 rounded"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!stats) {
    return <div>No stats available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        Performance Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Open Tickets */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Open Tickets
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.open_tickets}
            </dd>
          </div>
        </div>

        {/* Recently Resolved */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Resolved (Last 7 Days)
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.resolved_last_7_days}
            </dd>
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Avg. Resolution Time
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.avg_resolution_hours.toFixed(1)}h
            </dd>
          </div>
        </div>

        {/* Total Tickets */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Tickets Handled
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.total_tickets}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}
