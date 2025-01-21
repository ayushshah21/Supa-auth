/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../client';
import type { Interaction } from './types';
import type { Database } from '../../../types/supabase';

type WorkerRating = {
  worker: Database['public']['Tables']['users']['Row'];
  averageRating: number | null;
  totalRatings: number;
};

type RatingQueryResult = {
  content: { rating: number };
  ticket_id: string;
  tickets: {
    assigned_to_id: string;
    users: Database['public']['Tables']['users']['Row'];
  };
};

export const getInteractions = async (ticketId: string) => {
  console.log('[interactions/queries] Fetching interactions for ticket:', ticketId);
  
  try {
    // First get the interactions
    const { data: interactionsData, error: interactionsError } = await supabase
      .from('interactions')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    console.log('[interactions/queries] Initial query result:', { interactionsData, interactionsError });

    if (interactionsError) {
      console.error('[interactions/queries] Error fetching interactions:', interactionsError);
      return { data: null, error: interactionsError };
    }

    // Then get the authors for these interactions
    if (interactionsData && interactionsData.length > 0) {
      console.log('[interactions/queries] Found interactions, fetching authors');
      const authorIds = [...new Set(interactionsData.map(i => i.author_id))];
      console.log('[interactions/queries] Author IDs to fetch:', authorIds);

      const { data: authorsData, error: authorsError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', authorIds);

      console.log('[interactions/queries] Authors query result:', { authorsData, authorsError });

      if (authorsError) {
        console.error('[interactions/queries] Error fetching authors:', authorsError);
        return { data: null, error: authorsError };
      }

      // Combine the data
      const data = interactionsData.map(interaction => {
        const author = authorsData?.find(author => author.id === interaction.author_id);
        console.log('[interactions/queries] Mapping interaction:', { interaction, foundAuthor: author });
        return {
          ...interaction,
          author
        };
      });

      console.log('[interactions/queries] Final combined data:', data);
      return { data: data as Interaction[] | null, error: null };
    }

    console.log('[interactions/queries] No interactions found, returning empty data');
    return { data: interactionsData as Interaction[] | null, error: null };
  } catch (error) {
    console.error('[interactions/queries] Caught unexpected error:', error);
    return { data: null, error };
  }
};

export const getWorkerAverageRatings = async (): Promise<{ data: WorkerRating[] | null; error: any }> => {
  try {
    const { data: ratings, error: ratingsError } = await supabase
      .from('interactions')
      .select(`
        content,
        ticket_id,
        tickets!inner (
          assigned_to_id,
          users!tickets_assigned_to_id_fkey!inner (*)
        )
      `)
      .eq('type', 'RATING')
      .returns<RatingQueryResult[]>();

    if (ratingsError) throw ratingsError;

    // Process the ratings data
    const workerRatings = new Map<string, WorkerRating>();

    ratings?.forEach((rating) => {
      const workerId = rating.tickets.assigned_to_id;
      const worker = rating.tickets.users;
      const ratingValue = rating.content.rating;

      if (!workerRatings.has(workerId)) {
        workerRatings.set(workerId, {
          worker,
          averageRating: null,
          totalRatings: 0
        });
      }

      const workerData = workerRatings.get(workerId)!;
      const currentTotal = workerData.averageRating !== null 
        ? workerData.averageRating * workerData.totalRatings 
        : 0;
      workerData.totalRatings++;
      workerData.averageRating = (currentTotal + ratingValue) / workerData.totalRatings;
    });

    return {
      data: Array.from(workerRatings.values()),
      error: null
    };
  } catch (error) {
    console.error('[interactions/queries] Error fetching worker ratings:', error);
    return { data: null, error };
  }
}; 