/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser, getUserRole, getWorkers } from "../lib/supabase/auth";
import { getTeams, getTeamsForWorker } from "../lib/supabase/teams";
import { getTickets } from "../lib/supabase/tickets";
import {
  updateTicketStatus,
  updateTicketAssignment,
  claimTicket,
  releaseTicket,
  updateTicketTeam,
} from "../services/ticketsService";
import { createNote } from "../lib/supabase/notes";
import {
  createStatusChangeInteraction,
  createAssignmentInteraction,
  createNoteInteraction,
} from "../lib/supabase/interactions/mutations";
import { supabase } from "../lib/supabase/client";
import type { Database, UserRole } from "../types/supabase";
import TicketHeader from "../components/tickets/TicketHeader";
import TicketManagementModal from "../components/tickets/TicketManagementModal";
import InteractionTimeline from "../components/tickets/InteractionTimeline";
import FeedbackForm from "../components/tickets/FeedbackForm";
import RatingForm from "../components/tickets/RatingForm";
import FeedbackSection from "../components/tickets/FeedbackSection";
import AssignmentSection from "../components/tickets/AssignmentSection";
import NoteEditor from "../components/tickets/NoteEditor";
import { toast } from "react-hot-toast";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [workers, setWorkers] = useState<
    Database["public"]["Tables"]["users"]["Row"][]
  >([]);
  const [teams, setTeams] = useState<
    Database["public"]["Tables"]["teams"]["Row"][]
  >([]);
  const [updating, setUpdating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [hasRating, setHasRating] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

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

          // Load teams based on role
          if (role === "ADMIN") {
            const { data: teamsData } = await getTeams();
            if (teamsData) setTeams(teamsData);
          } else if (role === "WORKER") {
            const { data: teamsData } = await getTeamsForWorker(user.id);
            if (teamsData) setTeams(teamsData);
          }
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

      const { error } = await updateTicketStatus(ticketId, newStatus);
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

  const handleAssignmentChange = async (assigneeId: string | null) => {
    if (!ticket || !ticketId) return;
    setUpdating(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not found");

      // Check if this is a team ID by looking it up in the teams array
      const isTeamAssignment = teams.some((team) => team.id === assigneeId);

      if (isTeamAssignment) {
        // If it's a team assignment, use updateTicketTeam
        const { error } = await updateTicketTeam(ticketId, assigneeId);
        if (error) throw error;
      } else {
        // If it's a worker assignment, use updateTicketAssignment
        const { error } = await updateTicketAssignment(ticketId, assigneeId);
        if (error) throw error;
      }

      await createAssignmentInteraction(
        ticketId,
        user.id,
        ticket.assigned_to?.id || null,
        assigneeId,
        ticket.assigned_to?.email,
        workers.find((w) => w.id === assigneeId)?.email
      );

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

  // Add handlers for claiming and releasing tickets
  const handleClaimTicket = async () => {
    if (!ticketId || !currentUserId || updating) return;
    setUpdating(true);
    try {
      const { error } = await claimTicket(ticketId, currentUserId);
      if (error) throw error;
      await fetchTicket();
      toast.success("Ticket claimed successfully");
    } catch (error) {
      console.error("[TicketDetailPage] Error claiming ticket:", error);
      toast.error("Failed to claim ticket");
    } finally {
      setUpdating(false);
    }
  };

  const handleReleaseTicket = async () => {
    if (!ticketId || updating) return;
    setUpdating(true);
    try {
      const { error } = await releaseTicket(ticketId);
      if (error) throw error;
      await fetchTicket();
      toast.success("Ticket released successfully");
    } catch (error) {
      console.error("[TicketDetailPage] Error releasing ticket:", error);
      toast.error("Failed to release ticket");
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

  if (error)
    return (
      <div className="text-red-600 p-4 text-center">
        {t("common.error")}: {error}
      </div>
    );

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
          {t("common.backToTickets")}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <TicketHeader
            ticket={ticket}
            userRole={userRole}
            currentUserId={currentUserId}
            onUpdate={fetchTicket}
            updating={updating}
          />

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
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsManagementModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={updating}
                >
                  Manage Ticket
                </button>
              </div>

              <AssignmentSection assignedTo={ticket.assigned_to} />

              <div className="mt-6">
                <FeedbackSection ticketId={ticket.id} />
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {t("ticket.actions.addNote")}
                </h2>
                <NoteEditor
                  onSubmit={async ({ content, internal }) => {
                    await handleAddNote({ content, internal });
                  }}
                  disabled={updating}
                />
              </div>

              <TicketManagementModal
                isOpen={isManagementModalOpen}
                onClose={() => setIsManagementModalOpen(false)}
                ticket={ticket}
                workers={workers}
                onStatusChange={handleStatusChange}
                onAssignmentChange={handleAssignmentChange}
                onClaimTicket={handleClaimTicket}
                onReleaseTicket={handleReleaseTicket}
                updating={updating}
                userRole={userRole || ""}
                currentUserId={currentUserId || ""}
              />
            </>
          )}

          {userRole === "CUSTOMER" && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                {t("ticket.actions.addNote")}
              </h2>
              <NoteEditor
                onSubmit={async ({ content }) => {
                  await handleAddNote({ content, internal: false });
                }}
                disabled={updating}
                hideInternalToggle={true}
              />
            </div>
          )}

          <div className="mt-6">
            <InteractionTimeline
              ticketId={ticket.id}
              userRole={userRole}
              customerEmail={ticket.customer?.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
