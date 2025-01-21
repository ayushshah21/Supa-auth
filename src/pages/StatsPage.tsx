/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { getCurrentUser, getUserRole } from "../lib/supabase/auth";
import { getWorkerAverageRatings } from "../lib/supabase/interactions/queries";
import type { Database, UserRole } from "../types/supabase";

type WorkerStats = {
  open_tickets: number;
  resolved_last_7_days: number;
  avg_resolution_hours: number;
  total_tickets: number;
};

type WorkerRating = {
  worker: Database["public"]["Tables"]["users"]["Row"];
  averageRating: number | null;
  totalRatings: number;
};

export default function StatsPage() {
  const [stats, setStats] = useState<WorkerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerRatings, setWorkerRatings] = useState<WorkerRating[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setError("No user found");
          setLoading(false);
          return;
        }
        setCurrentUserId(user.id);

        const role = await getUserRole(user.id);
        setUserRole(role);

        // Only fetch stats if user is a worker or admin
        if (role === "WORKER" || role === "ADMIN") {
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
        }
      } catch (err) {
        console.error("[StatsPage] Caught error:", err);
        setError("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }

    const loadRatings = async () => {
      try {
        // Only fetch ratings if user is a worker or admin
        const role = await getUserRole(currentUserId!);
        if (role === "WORKER" || role === "ADMIN") {
          const { data: ratings, error: ratingsError } =
            await getWorkerAverageRatings();
          if (ratingsError) throw ratingsError;
          if (ratings) {
            setWorkerRatings(ratings);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load statistics");
      }
    };

    fetchStats();
    if (currentUserId) {
      loadRatings();
    }
  }, [currentUserId]);

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

  const renderRatingsSection = () => {
    if (!userRole || !currentUserId) return null;

    // For workers, only show their own rating
    if (userRole === "WORKER") {
      const workerRating = workerRatings.find(
        (rating) => rating.worker.id === currentUserId
      );
      if (!workerRating) return null;

      return (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Rating</h2>
            <p className="mt-1 text-sm text-gray-500">
              Your average rating from customer feedback
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= Math.round(workerRating.averageRating || 0)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-600 ml-2">
                {workerRating.averageRating !== null
                  ? `(${workerRating.averageRating.toFixed(1)} out of 5)`
                  : "(N/A)"}
              </span>
              <span className="text-sm text-gray-500 ml-4">
                Based on {workerRating.totalRatings} rating
                {workerRating.totalRatings === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // For admins, show all worker ratings
    if (userRole === "ADMIN") {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Worker Performance
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Average ratings and feedback from customers
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Rating
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Ratings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workerRatings.map(
                    ({ worker, averageRating, totalRatings }) => (
                      <tr key={worker.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {worker.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {averageRating !== null ? (
                            <div className="flex items-center space-x-1">
                              <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={
                                      star <= Math.round(averageRating)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-gray-600">
                                ({averageRating.toFixed(1)})
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {totalRatings}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        Performance Dashboard
      </h1>

      {/* Only show stats for workers and admins */}
      {(userRole === "WORKER" || userRole === "ADMIN") && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Open Tickets */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Open Tickets
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats?.open_tickets}
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
                {stats?.resolved_last_7_days}
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
                {stats?.avg_resolution_hours.toFixed(1)}h
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
                {stats?.total_tickets}
              </dd>
            </div>
          </div>
        </div>
      )}

      {renderRatingsSection()}
    </div>
  );
}
