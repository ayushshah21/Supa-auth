import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase/client";

interface FeedbackSectionProps {
  ticketId: string;
}

interface Feedback {
  id: string;
  content: {
    feedback: string;
  };
  created_at: string;
  user_id: string;
  type: string;
}

export default function FeedbackSection({ ticketId }: FeedbackSectionProps) {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from("interactions")
          .select("*")
          .eq("ticket_id", ticketId)
          .eq("type", "FEEDBACK");

        if (error) throw error;
        setFeedbackList(data || []);
      } catch (err) {
        console.error("[FeedbackSection] Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [ticketId]);

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded"></div>;
  }

  if (feedbackList.length === 0) {
    return (
      <div className="bg-gray-50 rounded-md p-4">
        <p className="text-gray-500 text-sm">No feedback provided yet.</p>
      </div>
    );
  }

  console.log("[FeedbackSection] Rendering feedback list:", feedbackList);

  return (
    <div className="space-y-4">
      {feedbackList.map((feedback) => {
        console.log("[FeedbackSection] Rendering feedback item:", feedback);
        return (
          <div key={feedback.id} className="bg-purple-50 rounded-md p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Customer Feedback
              </h3>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap">
              {feedback.content.feedback}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Submitted on {new Date(feedback.created_at).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
