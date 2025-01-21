import { useState } from "react";
import { getCurrentUser } from "../../lib/supabase/auth";
import { 
  updateTicketStatus, 
  updateTicketAssignment, 
  createTicketNote 
} from "../../services/ticketsService";
import { 
  createStatusChangeInteraction,
  createAssignmentInteraction,
  createNoteInteraction 
} from "../../lib/supabase/interactions/mutations";
import type { Database } from "../../types/supabase";

type TicketStatus = Database["public"]["Tables"]["tickets"]["Row"]["status"];

interface UseTicketActionsReturn {
  updating: boolean;
  error: string | null;
  updateStatus: (newStatus: TicketStatus, currentStatus: TicketStatus) => Promise<void>;
  updateAssignment: (workerId: string | null, currentAssigneeId: string | null, currentAssigneeEmail?: string, newAssigneeEmail?: string) => Promise<void>;
  addNote: (params: { content: string; internal: boolean }) => Promise<void>;
  clearError: () => void;
}

export function useTicketActions(ticketId: string): UseTicketActionsReturn {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (newStatus: TicketStatus, currentStatus: TicketStatus) => {
    try {
      setUpdating(true);
      setError(null);

      const user = await getCurrentUser();
      if (!user) throw new Error("User not found");

      // Update ticket status
      const { error: updateError } = await updateTicketStatus(ticketId, newStatus);
      if (updateError) throw updateError;

      // Create status change interaction
      await createStatusChangeInteraction(
        ticketId,
        user.id,
        currentStatus,
        newStatus
      );

    } catch (err) {
      console.error("[useTicketActions] Error updating status:", err);
      setError(err instanceof Error ? err.message : "Failed to update status");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const updateAssignment = async (
    workerId: string | null,
    currentAssigneeId: string | null,
    currentAssigneeEmail?: string,
    newAssigneeEmail?: string
  ) => {
    try {
      setUpdating(true);
      setError(null);

      const user = await getCurrentUser();
      if (!user) throw new Error("User not found");

      // Update ticket assignment
      const { error: updateError } = await updateTicketAssignment(ticketId, workerId);
      if (updateError) throw updateError;

      // Create assignment interaction
      await createAssignmentInteraction(
        ticketId,
        user.id,
        currentAssigneeId,
        workerId,
        currentAssigneeEmail,
        newAssigneeEmail
      );

    } catch (err) {
      console.error("[useTicketActions] Error updating assignment:", err);
      setError(err instanceof Error ? err.message : "Failed to update assignment");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async ({ content, internal }: { content: string; internal: boolean }) => {
    try {
      setUpdating(true);
      setError(null);

      const user = await getCurrentUser();
      if (!user) throw new Error("User not found");

      // Create note
      const { error: noteError } = await createTicketNote({
        ticketId,
        content,
        internal,
        authorId: user.id,
      });
      if (noteError) throw noteError;

      // Create note interaction
      await createNoteInteraction(ticketId, user.id, content, internal);

    } catch (err) {
      console.error("[useTicketActions] Error adding note:", err);
      setError(err instanceof Error ? err.message : "Failed to add note");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    updating,
    error,
    updateStatus,
    updateAssignment,
    addNote,
    clearError
  };
} 