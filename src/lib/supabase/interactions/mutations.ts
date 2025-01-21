import { supabase } from '../client';
import type { Interaction } from './types';

export const createInteraction = async (interaction: Omit<Interaction, 'id' | 'created_at' | 'author'>) => {
  const { data, error } = await supabase
    .from('interactions')
    .insert(interaction)
    .select()
    .single();

  return { data, error };
};

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

export async function createAssignmentInteraction(
  ticketId: string,
  userId: string,
  previousAssigneeId: string | null,
  newAssigneeId: string | null,
  previousAssigneeEmail?: string,
  newAssigneeEmail?: string
) {
  const { error } = await supabase.from("interactions").insert({
    ticket_id: ticketId,
    author_id: userId,
    type: "ASSIGNMENT",
    content: {
      previous_assignee_id: previousAssigneeId,
      new_assignee_id: newAssigneeId,
      previous_assignee_email: previousAssigneeEmail,
      new_assignee_email: newAssigneeEmail
    }
  });

  if (error) {
    console.error("[interactions/mutations] Error creating assignment interaction:", error);
    throw error;
  }
}

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

export const createFeedbackInteraction = async (
  ticketId: string,
  authorId: string,
  feedback: string
) => {
  console.log("[interactions/mutations] Creating feedback interaction:", {
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

    console.log("[interactions/mutations] Feedback interaction creation result:", {
      data,
      error,
    });

    return { data, error };
  } catch (err) {
    console.error("[interactions/mutations] Error creating feedback interaction:", err);
    return { data: null, error: err };
  }
};

export const createRatingInteraction = async (
  ticketId: string,
  authorId: string,
  rating: number,
  comment?: string
) => {
  const { data, error } = await supabase
    .from('interactions')
    .insert({
      ticket_id: ticketId,
      author_id: authorId,
      type: 'RATING',
      content: {
        rating,
        comment,
      },
    })
    .select()
    .single();

  return { data, error };
}; 