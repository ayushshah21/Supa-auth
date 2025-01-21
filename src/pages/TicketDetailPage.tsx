/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUser, getUserRole, getWorkers } from "../lib/supabase/auth";
import { getTickets, updateTicket } from "../lib/supabase/tickets";
import { createNote } from "../lib/supabase/notes";
import {
  createStatusChangeInteraction,
  createAssignmentInteraction,
  createNoteInteraction,
} from "../lib/supabase/interactions";
import { supabase } from "../lib/supabase/client";
import type { Database, UserRole } from "../types/supabase";
import TicketHeader from "../components/tickets/TicketHeader";
import TicketManagement from "../components/tickets/TicketManagement";
import InteractionTimeline from "../components/tickets/InteractionTimeline";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [workers, setWorkers] = useState<
    Database["public"]["Tables"]["users"]["Row"][]
  >([]);
  const [updating, setUpdating] = useState(false);

  const fetchTicket = async () => {
    try {
      const { data, error: ticketsError } = await getTickets();
      if (ticketsError) throw ticketsError;

      const foundTicket = data?.find((t) => t.id === ticketId);
      if (!foundTicket) throw new Error("Ticket not found");

      setTicket(foundTicket as Ticket);
    } catch (err: any) {
      setError(err.message || "Failed to load ticket");
    }
  };

  useEffect(() => {
    const setupPage = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate("/login");
          return;
        }

        const role = await getUserRole(user.id);
        setUserRole(role);

        if (role === "WORKER" || role === "ADMIN") {
          const { data: workersData } = await getWorkers();
          if (workersData) setWorkers(workersData);
        }

        await fetchTicket();
      } catch (err: any) {
        setError(err.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    setupPage();

    // Set up realtime subscriptions
    const ticketsChannel = supabase
      .channel("public:tickets-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tickets",
          filter: `id=eq.${ticketId}`,
        },
        async () => {
          console.log("Ticket updated, refreshing...");
          await fetchTicket();
        }
      )
      .subscribe();

    const notesChannel = supabase
      .channel("public:notes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          filter: `ticket_id=eq.${ticketId}`,
        },
        async () => {
          console.log("Notes updated, refreshing...");
          await fetchTicket();
        }
      )
      .subscribe();

    const interactionsChannel = supabase
      .channel("public:interactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interactions",
          filter: `ticket_id=eq.${ticketId}`,
        },
        async () => {
          console.log("Interactions updated, refreshing...");
          await fetchTicket();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(notesChannel);
      supabase.removeChannel(interactionsChannel);
    };
  }, [navigate, ticketId]);

  const handleStatusChange = async (
    newStatus: Database["public"]["Tables"]["tickets"]["Row"]["status"]
  ) => {
    if (!ticket || !ticketId) return;
    setUpdating(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not found");

      const { error } = await updateTicket(ticketId, { status: newStatus });
      if (error) throw error;

      await createStatusChangeInteraction(
        ticketId,
        user.id,
        ticket.status,
        newStatus
      );

      setTicket({ ...ticket, status: newStatus });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignmentChange = async (workerId: string) => {
    if (!ticket || !ticketId) return;
    setUpdating(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not found");

      const { error } = await updateTicket(ticketId, {
        assigned_to_id: workerId,
      });
      if (error) throw error;

      const assignedWorker = workers.find((w) => w.id === workerId);
      await createAssignmentInteraction(
        ticketId,
        user.id,
        ticket.assigned_to?.id || null,
        workerId,
        ticket.assigned_to?.email,
        assignedWorker?.email
      );

      setTicket({ ...ticket, assigned_to: assignedWorker || null });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async ({
    content,
    internal,
  }: {
    content: string;
    internal: boolean;
  }) => {
    if (!ticket || !ticketId) return;
    setUpdating(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not found");

      const { error: noteError } = await createNote({
        ticket_id: ticketId,
        content,
        internal,
        author_id: user.id,
        metadata: null,
      });
      if (noteError) throw noteError;

      await createNoteInteraction(ticketId, user.id, content, internal);

      const { data } = await getTickets();
      const updatedTicket = data?.find((t) => t.id === ticketId);
      if (updatedTicket) {
        setTicket(updatedTicket as Ticket);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          <TicketHeader ticket={ticket} />

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {userRole !== "CUSTOMER" && (
            <>
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

              <TicketManagement
                ticket={ticket}
                workers={workers}
                onStatusChange={handleStatusChange}
                onAssignmentChange={handleAssignmentChange}
                onAddNote={handleAddNote}
                updating={updating}
              />
            </>
          )}

          {ticketId && (
            <InteractionTimeline ticketId={ticketId} userRole={userRole} />
          )}
        </div>
      </div>
    </div>
  );
}
