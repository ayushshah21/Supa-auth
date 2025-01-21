/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUserRole, getWorkers } from "../lib/supabase/auth";
import { getTickets, updateTickets } from "../lib/supabase/tickets";
import type { Database, TicketStatus } from "../types/supabase";
import BulkActions from "../components/tickets/BulkActions";
import TicketTable from "../components/tickets/TicketTable";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

export default function AllTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [workers, setWorkers] = useState<
    Database["public"]["Tables"]["users"]["Row"][]
  >([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const userRole = await getUserRole(user.id);
        if (userRole === "CUSTOMER") {
          navigate("/my-tickets");
          return;
        }

        // Load workers for assignment
        if (userRole === "WORKER" || userRole === "ADMIN") {
          const { data: workersData } = await getWorkers();
          if (workersData) setWorkers(workersData);
        }

        const { data, error: ticketsError } = await getTickets(
          statusFilter === "ALL" ? undefined : { status: statusFilter }
        );

        if (ticketsError) throw ticketsError;
        setTickets(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate, statusFilter]);

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

      // Refresh tickets
      const { data } = await getTickets(
        statusFilter === "ALL" ? undefined : { status: statusFilter }
      );
      setTickets(data || []);
      setSelectedTickets([]);
    } catch (err: any) {
      setError(err.message || "Failed to update tickets");
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

      // Refresh tickets
      const { data } = await getTickets(
        statusFilter === "ALL" ? undefined : { status: statusFilter }
      );
      setTickets(data || []);
      setSelectedTickets([]);
    } catch (err: any) {
      setError(err.message || "Failed to assign tickets");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error) return <div className="text-red-600 p-4 text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Support Tickets</h1>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TicketStatus | "ALL")
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
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
      />
    </div>
  );
}
