import { supabase } from "../lib/supabase/client";
import type { Database } from "../types/supabase";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

export async function getTicketById(ticketId: string): Promise<{ data: Ticket | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        customer:users!tickets_customer_id_fkey(*),
        assigned_to:users!tickets_assigned_to_id_fkey(*),
        notes(*)
      `)
      .eq("id", ticketId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("[ticketsService] Error fetching ticket:", error);
    return { data: null, error: error as Error };
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: Database["public"]["Tables"]["tickets"]["Row"]["status"]
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from("tickets")
      .update({ status })
      .eq("id", ticketId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("[ticketsService] Error updating ticket status:", error);
    return { error: error as Error };
  }
}

export async function updateTicketAssignment(
  ticketId: string,
  workerId: string | null
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from("tickets")
      .update({ assigned_to_id: workerId })
      .eq("id", ticketId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("[ticketsService] Error updating ticket assignment:", error);
    return { error: error as Error };
  }
}

export async function createTicketNote(params: {
  ticketId: string;
  content: string;
  internal: boolean;
  authorId: string;
}): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from("notes").insert({
      ticket_id: params.ticketId,
      content: params.content,
      internal: params.internal,
      author_id: params.authorId,
      metadata: null,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("[ticketsService] Error creating note:", error);
    return { error: error as Error };
  }
}

export function subscribeToTicketChanges(
  ticketId: string,
  onTicketChange: () => void
): () => void {
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
      () => {
        console.log("[ticketsService] Ticket updated, notifying subscriber");
        onTicketChange();
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
      () => {
        console.log("[ticketsService] Notes updated, notifying subscriber");
        onTicketChange();
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    ticketsChannel.unsubscribe();
    notesChannel.unsubscribe();
  };
}

export async function checkTicketFeedback(ticketId: string): Promise<{ 
  hasFeedback: boolean; 
  hasRating: boolean;
  error: Error | null;
}> {
  try {
    // Check feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("interactions")
      .select("id")
      .eq("ticket_id", ticketId)
      .eq("type", "FEEDBACK")
      .maybeSingle();

    if (feedbackError) throw feedbackError;

    // Check rating
    const { data: ratingData, error: ratingError } = await supabase
      .from("interactions")
      .select("id")
      .eq("ticket_id", ticketId)
      .eq("type", "RATING")
      .maybeSingle();

    if (ratingError) throw ratingError;

    return {
      hasFeedback: !!feedbackData,
      hasRating: !!ratingData,
      error: null
    };
  } catch (error) {
    console.error("[ticketsService] Error checking ticket feedback:", error);
    return { hasFeedback: false, hasRating: false, error: error as Error };
  }
} 