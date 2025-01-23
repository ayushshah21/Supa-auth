import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { getCurrentUser, getUserRole } from "../lib/supabase";
import { getTickets } from "../lib/supabase/tickets";
import { supabase } from "../lib/supabase/client";
import type { Database, UserRole } from "../types/supabase";
import TicketTable from "../components/tickets/TicketTable";
import DashboardStats from "../components/dashboard/DashboardStats";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);

      const userRole = await getUserRole(currentUser.id);
      setRole(userRole);
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t("common.error.loadUser");
      setError(errorMessage);
    }
  };

  const fetchTickets = async () => {
    try {
      if (!user) return;

      // Fetch tickets based on role
      const { data, error: ticketsError } = await getTickets(
        role === "CUSTOMER" ? { customer_id: user.id } : { status: "OPEN" }
      );

      if (ticketsError) throw ticketsError;
      setTickets(data || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t("common.error.loadTickets")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [navigate]);

  useEffect(() => {
    if (user && role) {
      fetchTickets();

      // Set up realtime subscription for workers/admins
      if (role === "WORKER" || role === "ADMIN") {
        const channel = supabase
          .channel("public:tickets-changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "tickets" },
            async () => {
              await fetchTickets();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [user, role]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error) return <div className="text-red-600 p-4 text-center">{error}</div>;

  if (!user || !role) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("common.dashboard")}
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Worker/Admin View */}
          {(role === "WORKER" || role === "ADMIN") && (
            <>
              {/* Dashboard Stats */}
              <DashboardStats />

              {/* Recent Open Tickets */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="sm:flex sm:justify-between sm:items-center mb-6">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">
                      {t("dashboard.recentOpenTickets")}
                    </h2>
                  </div>

                  <TicketTable
                    tickets={tickets
                      .filter((t) => t.status === "OPEN")
                      .slice(0, 5)}
                    selectedTickets={[]}
                    onSelectAll={() => {}}
                    onSelectTicket={() => {}}
                    hideSelectionColumn={true}
                  />
                </div>
              </div>
            </>
          )}

          {/* Customer View */}
          {role === "CUSTOMER" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:justify-between sm:items-center mb-6">
                  <h2 className="text-xl font-semibold mb-4 sm:mb-0">
                    {t("dashboard.mySupportTickets")}
                  </h2>
                  <button
                    onClick={() => navigate("/create-ticket")}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t("ticket.create")}
                  </button>
                </div>

                {tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      {t("dashboard.noTicketsYet")}
                    </p>
                    <button
                      onClick={() => navigate("/create-ticket")}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t("dashboard.createFirstTicket")}
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <TicketTable
                      tickets={tickets}
                      selectedTickets={[]}
                      onSelectAll={() => {}}
                      onSelectTicket={() => {}}
                      hideSelectionColumn={true}
                      hideCustomerColumn={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
