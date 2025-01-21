import { useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { createFeedbackInteraction } from "../../lib/supabase/interactions";

type Props = {
  ticketId: string;
  userId: string;
  onSubmit?: () => void;
};

export default function FeedbackForm({ ticketId, userId, onSubmit }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      console.log(
        "[FeedbackForm] Starting feedback submission for ticket:",
        ticketId
      );

      // Create feedback record
      console.log("[FeedbackForm] Creating feedback record with:", {
        ticket_id: ticketId,
        user_id: userId,
        content: content.trim(),
      });

      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .insert({
          ticket_id: ticketId,
          user_id: userId,
          content: content.trim(),
        })
        .select()
        .single();

      console.log("[FeedbackForm] Feedback creation result:", {
        feedbackData,
        feedbackError,
      });

      if (feedbackError) throw feedbackError;

      // Create feedback interaction
      console.log("[FeedbackForm] Creating feedback interaction");
      const { data: interactionData, error: interactionError } =
        await createFeedbackInteraction(ticketId, userId, content.trim());

      console.log("[FeedbackForm] Interaction creation result:", {
        interactionData,
        interactionError,
      });

      if (interactionError) throw interactionError;

      setContent("");
      onSubmit?.();
    } catch (err) {
      console.error("[FeedbackForm] Error submitting feedback:", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit feedback"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900">Share Your Feedback</h3>
      <p className="mt-1 text-sm text-gray-500">
        Please share your thoughts about how we handled your ticket. Your
        feedback helps us improve our service.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What did you think about our service? How can we improve?"
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            disabled={submitting}
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}
