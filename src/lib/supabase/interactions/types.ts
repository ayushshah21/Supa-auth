import type { Database } from '../../../types/supabase';

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