import type { Database } from '../../types/supabase';
import { supabase } from './client';

export type InteractionType = 'NOTE' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'CREATION' | 'FEEDBACK' | 'RATING';

type BaseInteraction = {
  id: string;
  ticket_id: string;
  author_id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
  author?: Database['public']['Tables']['users']['Row'];
};

type StatusChangeContent = {
  type: 'STATUS_CHANGE';
  content: {
    oldStatus: string;
    newStatus: string;
  };
};

type AssignmentContent = {
  type: 'ASSIGNMENT';
  content: {
    oldAssigneeId: string | null;
    newAssigneeId: string | null;
    oldAssigneeEmail?: string;
    newAssigneeEmail?: string;
  };
};

type NoteContent = {
  type: 'NOTE';
  content: {
    text: string;
    internal: boolean;
  };
};

type FeedbackContent = {
  type: 'FEEDBACK';
  content: {
    feedback: string;
  };
};

type RatingContent = {
  type: 'RATING';
  content: {
    rating: number;
    comment?: string;
  };
};

type CreationContent = {
  type: 'CREATION';
  content: Record<string, never>;
};

export type Interaction = BaseInteraction & (
  | StatusChangeContent
  | AssignmentContent
  | NoteContent
  | FeedbackContent
  | RatingContent
  | CreationContent
);

export const getInteractions = async (ticketId: string) => {
  console.log('[interactions.ts] Fetching interactions for ticket:', ticketId);
  
  try {
    // First get the interactions
    const { data: interactionsData, error: interactionsError } = await supabase
      .from('interactions')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    console.log('[interactions.ts] Initial query result:', { interactionsData, interactionsError });

    if (interactionsError) {
      console.error('[interactions.ts] Error fetching interactions:', interactionsError);
      return { data: null, error: interactionsError };
    }

    // Then get the authors for these interactions
    if (interactionsData && interactionsData.length > 0) {
      console.log('[interactions.ts] Found interactions, fetching authors');
      const authorIds = [...new Set(interactionsData.map(i => i.author_id))];
      console.log('[interactions.ts] Author IDs to fetch:', authorIds);

      const { data: authorsData, error: authorsError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', authorIds);

      console.log('[interactions.ts] Authors query result:', { authorsData, authorsError });

      if (authorsError) {
        console.error('[interactions.ts] Error fetching authors:', authorsError);
        return { data: null, error: authorsError };
      }

      // Combine the data
      const data = interactionsData.map(interaction => {
        const author = authorsData?.find(author => author.id === interaction.author_id);
        console.log('[interactions.ts] Mapping interaction:', { interaction, foundAuthor: author });
        return {
          ...interaction,
          author
        };
      });

      console.log('[interactions.ts] Final combined data:', data);
      return { data: data as Interaction[] | null, error: null };
    }

    console.log('[interactions.ts] No interactions found, returning empty data');
    return { data: interactionsData as Interaction[] | null, error: null };
  } catch (error) {
    console.error('[interactions.ts] Caught unexpected error:', error);
    return { data: null, error };
  }
};

export const createInteraction = async (interaction: Omit<Interaction, 'id' | 'created_at' | 'author'>) => {
  const { data, error } = await supabase
    .from('interactions')
    .insert(interaction)
    .select()
    .single();

  return { data, error };
};

// Helper function to create a status change interaction
export const createStatusChangeInteraction = async (
  ticketId: string,
  authorId: string,
  oldStatus: string,
  newStatus: string
) => {
  const { data, error } = await supabase
    .from('interactions')
    .insert({
      ticket_id: ticketId,
      author_id: authorId,
      type: 'STATUS_CHANGE',
      content: {
        oldStatus,
        newStatus,
      },
    })
    .select()
    .single();

  return { data, error };
};

// Helper function to create an assignment interaction
export const createAssignmentInteraction = async (
  ticketId: string,
  authorId: string,
  oldAssigneeId: string | null,
  newAssigneeId: string,
  oldAssigneeEmail?: string,
  newAssigneeEmail?: string
) => {
  const { data, error } = await supabase
    .from('interactions')
    .insert({
      ticket_id: ticketId,
      author_id: authorId,
      type: 'ASSIGNMENT',
      content: {
        oldAssigneeId,
        newAssigneeId,
        oldAssigneeEmail,
        newAssigneeEmail,
      },
    })
    .select()
    .single();

  return { data, error };
};

// Helper function to create a note interaction
export const createNoteInteraction = async (
  ticketId: string,
  authorId: string,
  text: string,
  internal: boolean
) => {
  const { data, error } = await supabase
    .from('interactions')
    .insert({
      ticket_id: ticketId,
      author_id: authorId,
      type: 'NOTE',
      content: {
        text,
        internal,
      },
    })
    .select()
    .single();

  return { data, error };
};

// Helper function to create a feedback interaction
export const createFeedbackInteraction = async (
  ticketId: string,
  authorId: string,
  feedback: string
) => {
  console.log("[interactions.ts] Creating feedback interaction:", {
    ticketId,
    authorId,
    feedback,
  });

  try {
    const { data, error } = await supabase
      .from("interactions")
      .insert({
        ticket_id: ticketId,
        author_id: authorId,
        type: 'FEEDBACK',
        content: {
          feedback,
        },
      })
      .select()
      .single();

    console.log("[interactions.ts] Feedback interaction creation result:", {
      data,
      error,
    });

    return { data, error };
  } catch (err) {
    console.error("[interactions.ts] Error creating feedback interaction:", err);
    return { data: null, error: err };
  }
};

export const getWorkerAverageRatings = async () => {
  console.log("[interactions.ts] Fetching worker average ratings");

  try {
    // First get all tickets with their assigned workers and ratings
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('interactions')
      .select(`
        content,
        ticket_id,
        tickets!inner (
          assigned_to_id
        )
      `)
      .eq('type', 'RATING')
      .returns<{
        content: RatingContent['content'];
        ticket_id: string;
        tickets: { assigned_to_id: string };
      }[]>();

    if (ratingsError) {
      console.error("[interactions.ts] Error fetching ratings:", ratingsError);
      return { data: null, error: ratingsError };
    }

    // Get all workers
    const { data: workersData, error: workersError } = await supabase
      .from('users')
      .select('*')
      .in('role', ['WORKER', 'ADMIN']);

    if (workersError) {
      console.error("[interactions.ts] Error fetching workers:", workersError);
      return { data: null, error: workersError };
    }

    // Calculate average rating for each worker
    const workerRatings = workersData.map(worker => {
      const workerRatings = ratingsData
        .filter(rating => rating.tickets.assigned_to_id === worker.id)
        .map(rating => rating.content.rating);

      const averageRating = workerRatings.length > 0
        ? workerRatings.reduce((a, b) => a + b, 0) / workerRatings.length
        : null;

      return {
        worker,
        averageRating,
        totalRatings: workerRatings.length
      };
    });

    console.log("[interactions.ts] Worker ratings calculated:", workerRatings);
    return { data: workerRatings, error: null };
  } catch (error) {
    console.error("[interactions.ts] Error calculating worker ratings:", error);
    return { data: null, error };
  }
}; 