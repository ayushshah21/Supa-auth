/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUser, getUserRole } from "../lib/supabase/auth";
import { getTickets } from "../lib/supabase/tickets";
import type { Database, UserRole } from "../types/supabase";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const role = await getUserRole(user.id);
        setUserRole(role);

        const { data, error: ticketError } = await getTickets();
        if (ticketError) throw ticketError;

        const foundTicket = data?.find((t) => t.id === ticketId);
        if (!foundTicket) {
          throw new Error("Ticket not found");
        }

        // Check if user has access to this ticket
        if (role === "CUSTOMER" && foundTicket.customer_id !== user.id) {
          navigate("/my-tickets");
          return;
        }

        setTicket(foundTicket as Ticket);
      } catch (err: any) {
        setError(err.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, navigate]);

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

  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <button
          onClick={() =>
            navigate(userRole === "CUSTOMER" ? "/my-tickets" : "/all-tickets")
          }
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Tickets
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {ticket.title}
              </h1>
              <p className="text-sm text-gray-500">
                Created by {ticket.customer?.email || "Unknown"} on{" "}
                {new Date(ticket.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  ticket.status
                )}`}
              >
                {ticket.status}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                  ticket.priority
                )}`}
              >
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {userRole !== "CUSTOMER" && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Assignment
              </h2>
              <p className="text-gray-600">
                {ticket.assigned_to ? (
                  <>Assigned to: {ticket.assigned_to.email}</>
                ) : (
                  <span className="text-yellow-600">Unassigned</span>
                )}
              </p>
            </div>
          )}

          {ticket.notes && ticket.notes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
              <div className="space-y-4">
                {ticket.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-lg ${
                      note.internal && userRole !== "CUSTOMER"
                        ? "bg-yellow-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-600">{note.content}</p>
                      <div className="text-xs text-gray-500">
                        {new Date(note.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
