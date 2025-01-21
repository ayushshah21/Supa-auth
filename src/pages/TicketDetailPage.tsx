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
import FeedbackForm from "../components/tickets/FeedbackForm";
import RatingForm from "../components/tickets/RatingForm";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

type Feedback = {
  id: string;
  content: {
    feedback: string;
  };
  created_at: string;
  user_id: string;
  type: string;
};

function FeedbackSection({ ticketId }: { ticketId: string }) {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      console.log("[FeedbackSection] Fetching feedback for ticket:", ticketId);

      const { data, error } = await supabase
        .from("interactions")
        .select("*")
        .eq("ticket_id", ticketId)
        .eq("type", "FEEDBACK")
        .order("created_at", { ascending: false });

      console.log("[FeedbackSection] Raw feedback data:", data);

      if (!error && data) {
        // Validate the data structure
        const validFeedback = data.map((item) => ({
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          user_id: item.user_id,
          type: item.type,
        }));
        console.log(
          "[FeedbackSection] Processed feedback data:",
          validFeedback
        );
        setFeedbackList(validFeedback);
      } else if (error) {
        console.error("[FeedbackSection] Error fetching feedback:", error);
      }
      setLoading(false);
    };

    fetchFeedback();
  }, [ticketId]);

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded"></div>;
  }

  if (feedbackList.length === 0) {
    return (
      <div className="bg-gray-50 rounded-md p-4">
        <p className="text-gray-500 text-sm">No feedback provided yet.</p>
      </div>
    );
  }

  console.log("[FeedbackSection] Rendering feedback list:", feedbackList);

  return (
    <div className="space-y-4">
      {feedbackList.map((feedback) => {
        console.log("[FeedbackSection] Rendering feedback item:", feedback);
        return (
          <div key={feedback.id} className="bg-purple-50 rounded-md p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Customer Feedback
              </h3>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap">
              {feedback.content.feedback}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Submitted on {new Date(feedback.created_at).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [workers, setWorkers] = useState<
    Database["public"]["Tables"]["users"]["Row"][]
  >([]);
  const [updating, setUpdating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [hasRating, setHasRating] = useState(false);

  const fetchTicket = async () => {
    try {
      const { data, error: ticketsError } = await getTickets();
      if (ticketsError) throw ticketsError;

      const foundTicket = data?.find((t) => t.id === ticketId);
      if (!foundTicket) throw new Error("Ticket not found");

      setTicket(foundTicket as Ticket);

      // Check if this ticket already has feedback and rating
      if (ticketId) {
        console.log(
          "[TicketDetailPage] Checking feedback and rating for ticket:",
          ticketId
        );

        // Check feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("interactions")
          .select("id")
          .eq("ticket_id", ticketId)
          .eq("type", "FEEDBACK")
          .maybeSingle();

        console.log("[TicketDetailPage] Feedback check result:", {
          feedbackData,
          feedbackError,
        });

        // Check rating
        const { data: ratingData, error: ratingError } = await supabase
          .from("interactions")
          .select("id")
          .eq("ticket_id", ticketId)
          .eq("type", "RATING")
          .maybeSingle();

        console.log("[TicketDetailPage] Rating check result:", {
          ratingData,
          ratingError,
        });

        setHasFeedback(!!feedbackData);
        setHasRating(!!ratingData);

        // Show feedback form for resolved tickets without feedback
        if (foundTicket.status === "RESOLVED" && !feedbackData) {
          console.log(
            "[TicketDetailPage] Showing feedback form for resolved ticket without feedback"
          );
          setShowFeedback(true);
        }

        // Show rating form for resolved tickets without rating
        if (foundTicket.status === "RESOLVED" && !ratingData) {
          console.log(
            "[TicketDetailPage] Showing rating form for resolved ticket without rating"
          );
          setShowRating(true);
        }
      }
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
        setCurrentUserId(user.id);

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

      // Show feedback form when ticket is resolved and user is the customer and hasn't given feedback yet
      if (newStatus === "RESOLVED" && userRole === "CUSTOMER" && !hasFeedback) {
        setShowFeedback(true);
      }
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

  const isCustomer = userRole === "CUSTOMER";
  const shouldShowFeedback =
    isCustomer && ticket.status === "RESOLVED" && showFeedback && !hasFeedback;
  const shouldShowRating =
    isCustomer && ticket.status === "RESOLVED" && showRating && !hasRating;

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

          {shouldShowFeedback && currentUserId && (
            <div className="mt-6">
              <FeedbackForm
                ticketId={ticket.id}
                userId={currentUserId}
                onSubmit={() => {
                  setShowFeedback(false);
                  setHasFeedback(true);
                }}
              />
            </div>
          )}

          {shouldShowRating && currentUserId && (
            <div className="mt-6">
              <RatingForm
                ticketId={ticket.id}
                userId={currentUserId}
                onSubmit={() => {
                  setShowRating(false);
                  setHasRating(true);
                }}
              />
            </div>
          )}

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

              <div className="mt-6">
                <FeedbackSection ticketId={ticket.id} />
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

          <div className="mt-6">
            <InteractionTimeline ticketId={ticket.id} userRole={userRole} />
          </div>
        </div>
      </div>
    </div>
  );
}
