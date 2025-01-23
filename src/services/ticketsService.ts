import { supabase } from "../lib/supabase/client";
import { sendEmailNotification } from "../lib/supabase/email";
import type { Database } from "../types/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

type CustomerData = {
  id: string;
  customer: {
    id: string;
    email: string;
  };
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

export const updateTicketStatus = async (
  ticketId: string,
  newStatus: Database["public"]["Tables"]["tickets"]["Row"]["status"]
) => {
  console.log(`[ticketsService/updateTicketStatus] Starting status update for ticket ${ticketId} to ${newStatus}`);
  try {
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId)
      .select("*")
      .single();

    if (ticketError) {
      console.error("[ticketsService/updateTicketStatus] Error updating ticket:", ticketError);
      return { error: ticketError };
    }

    if (newStatus === "RESOLVED") {
      console.log("[ticketsService/updateTicketStatus] Ticket resolved, fetching customer data");
      const { data: customerData, error: customerError } = await supabase
        .from("tickets")
        .select(`
          id,
          customer:users!tickets_customer_id_fkey (
            id,
            email
          )
        `)
        .eq("id", ticketId)
        .single() as { data: CustomerData | null; error: PostgrestError | null };

      if (customerError) {
        console.error("[ticketsService/updateTicketStatus] Error fetching customer data:", customerError);
        return { error: customerError };
      }

      if (customerData?.customer?.email) {
        console.log(`[ticketsService/updateTicketStatus] Sending email notification to ${customerData.customer.email}`);
        await sendEmailNotification({
          ticketId,
          templateName: "ticket_resolved",
          variables: {
            ticket_id: ticketId,
            customer_email: customerData.customer.email
          }
        });
      } else {
        console.warn("[ticketsService/updateTicketStatus] No customer email found for notification");
      }
    }

    console.log("[ticketsService/updateTicketStatus] Status update completed successfully");
    return { data: ticket, error: null };
  } catch (error) {
    console.error("[ticketsService/updateTicketStatus] Unexpected error:", error);
    return { error };
  }
};

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

export async function updateTickets(
  ticketIds: string[],
  updates: Database["public"]["Tables"]["tickets"]["Update"]
): Promise<{ error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .update(updates)
      .in("id", ticketIds)
      .select(`
        *,
        customer:users!tickets_customer_id_fkey(*)
      `);

    if (error) throw error;

    // Send email notifications if tickets are resolved
    if (updates.status === "RESOLVED" && data) {
      await Promise.all(
        data.map((ticket) =>
          sendEmailNotification({
            ticketId: ticket.id,
            templateName: "ticket_resolved",
            variables: {
              ticket_id: ticket.id,
              customer_email: ticket.customer.email
            }
          })
        )
      );
    }

    return { error: null };
  } catch (error) {
    console.error("[ticketsService] Error updating tickets:", error);
    return { error: error as Error };
  }
} 