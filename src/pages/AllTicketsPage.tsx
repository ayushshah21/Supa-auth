/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { getCurrentUser, getUserRole, getWorkers } from "../lib/supabase";
import { getTickets, updateTickets } from "../lib/supabase/tickets";
import { supabase } from "../lib/supabase/client";
import type { Database, UserRole, TicketStatus } from "../types/supabase";
import BulkActions from "../components/tickets/BulkActions";
import TicketTable from "../components/tickets/TicketTable";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

const AllTicketsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ticket management state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">(
    "OPEN"
  );
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [workers, setWorkers] = useState<
    Database["public"]["Tables"]["users"]["Row"][]
  >([]);
  const [updating, setUpdating] = useState(false);

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

      // Load workers for assignment if worker/admin
      if (userRole === "WORKER" || userRole === "ADMIN") {
        const { data: workersData } = await getWorkers();
        if (workersData) setWorkers(workersData);
      }
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load user data";
      setError(errorMessage);
    }
  };

  const fetchTickets = async () => {
    try {
      if (!user) return;

      // Fetch tickets based on role
      const { data, error: ticketsError } = await getTickets(
        role === "CUSTOMER"
          ? { customer_id: user.id }
          : statusFilter === "ALL"
          ? undefined
          : { status: statusFilter }
      );

      if (ticketsError) throw ticketsError;
      setTickets(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
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
  }, [user, role, statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(tickets.map((t) => t.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    if (checked) {
      setSelectedTickets((prev) => [...prev, ticketId]);
    } else {
      setSelectedTickets((prev) => prev.filter((id) => id !== ticketId));
    }
  };

  const handleBulkStatusUpdate = async (newStatus: TicketStatus) => {
    if (selectedTickets.length === 0) return;
    setUpdating(true);
    try {
      const { error } = await updateTickets(selectedTickets, {
        status: newStatus,
      });
      if (error) throw error;
      setSelectedTickets([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update tickets");
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkAssign = async (workerId: string) => {
    if (selectedTickets.length === 0) return;
    setUpdating(true);
    try {
      const { error } = await updateTickets(selectedTickets, {
        assigned_to_id: workerId || null,
      });
      if (error) throw error;
      setSelectedTickets([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to assign tickets");
    } finally {
      setUpdating(false);
    }
  };

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
            {t("ticket.allTickets")}
          </h1>
          <p className="text-sm text-gray-500">
            {t("ticket.manageAllTickets")}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Worker/Admin View */}
          {(role === "WORKER" || role === "ADMIN") && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:justify-between sm:items-center mb-6">
                  <h2 className="text-xl font-semibold mb-4 sm:mb-0">
                    {t("ticket.supportTickets")}
                  </h2>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as TicketStatus | "ALL")
                    }
                    className="w-full sm:w-auto rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ALL">{t("ticket.filter.allStatus")}</option>
                    <option value="OPEN">{t("ticket.status.OPEN")}</option>
                    <option value="IN_PROGRESS">
                      {t("ticket.status.IN_PROGRESS")}
                    </option>
                    <option value="RESOLVED">
                      {t("ticket.status.RESOLVED")}
                    </option>
                    <option value="CLOSED">{t("ticket.status.CLOSED")}</option>
                  </select>
                </div>

                <BulkActions
                  selectedCount={selectedTickets.length}
                  onStatusUpdate={handleBulkStatusUpdate}
                  onAssign={handleBulkAssign}
                  onClearSelection={() => setSelectedTickets([])}
                  workers={workers}
                  updating={updating}
                />

                <TicketTable
                  tickets={tickets}
                  selectedTickets={selectedTickets}
                  onSelectAll={handleSelectAll}
                  onSelectTicket={handleSelectTicket}
                  userRole={role}
                />
              </div>
            </div>
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

                <TicketTable
                  tickets={tickets}
                  selectedTickets={[]}
                  onSelectAll={() => {}}
                  onSelectTicket={() => {}}
                  hideSelectionColumn={true}
                  userRole={role}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTicketsPage;
