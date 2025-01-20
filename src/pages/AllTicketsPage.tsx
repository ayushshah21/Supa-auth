/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUserRole } from "../lib/supabase/auth";
import { getTickets } from "../lib/supabase/tickets";
import type { Database, TicketStatus } from "../types/supabase";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-gray-600";
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

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tickets found.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/ticket/${ticket.id}`)}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Customer: {ticket.customer?.email || "Unknown"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                      <span
                        className={`text-xs font-medium ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <div>
                      Created:{" "}
                      {new Date(ticket.created_at).toLocaleDateString()}
                      {ticket.notes?.length > 0 && (
                        <span className="ml-4">
                          {ticket.notes.length} note
                          {ticket.notes.length === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                    <div>
                      {ticket.assigned_to ? (
                        <span>Assigned to: {ticket.assigned_to.email}</span>
                      ) : (
                        <span className="text-yellow-600">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
