import { useState, useEffect } from "react";
import { getTicketById, subscribeToTicketChanges, checkTicketFeedback } from "../../services/ticketsService";
import type { Database } from "../../types/supabase";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"] & {
  customer: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  notes: Database["public"]["Tables"]["notes"]["Row"][];
};

interface UseTicketDataReturn {
  ticket: Ticket | null;
  loading: boolean;
  error: string | null;
  hasFeedback: boolean;
  hasRating: boolean;
  refetch: () => Promise<void>;
}

export function useTicketData(ticketId: string): UseTicketDataReturn {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [hasRating, setHasRating] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch ticket data
      const { data, error: ticketError } = await getTicketById(ticketId);
      if (ticketError) throw ticketError;
      if (!data) throw new Error("Ticket not found");
      
      setTicket(data);

      // Check feedback status
      const { hasFeedback: hasF, hasRating: hasR, error: feedbackError } = 
        await checkTicketFeedback(ticketId);
      
      if (feedbackError) throw feedbackError;
      
      setHasFeedback(hasF);
      setHasRating(hasR);

    } catch (err) {
      console.error("[useTicketData] Error fetching ticket data:", err);
      setError(err instanceof Error ? err.message : "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();

    // Set up realtime subscription
    const unsubscribe = subscribeToTicketChanges(ticketId, () => {
      console.log("[useTicketData] Ticket updated, refetching...");
      fetchTicket();
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [ticketId]);

  return {
    ticket,
    loading,
    error,
    hasFeedback,
    hasRating,
    refetch: fetchTicket
  };
} 