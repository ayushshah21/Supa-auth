/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/supabase/auth";
import { getTickets } from "../lib/supabase/tickets";
import type { Database } from "../types/supabase";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error: ticketsError } = await getTickets({
          customer_id: user.id,
        });

        if (ticketsError) throw ticketsError;
        setTickets(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

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
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Support Tickets</h1>
        <button
          onClick={() => navigate("/create-ticket")}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You haven't created any tickets yet.
          </p>
          <button
            onClick={() => navigate("/create-ticket")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first ticket
          </button>
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
                    <h3 className="text-sm font-medium text-gray-900">
                      {ticket.title}
                    </h3>
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
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {new Date(ticket.created_at).toLocaleDateString()}
                    {ticket.notes?.length > 0 && (
                      <span className="ml-4">
                        {ticket.notes.length} note
                        {ticket.notes.length === 1 ? "" : "s"}
                      </span>
                    )}
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
