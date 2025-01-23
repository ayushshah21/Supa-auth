import { useEffect, useState } from "react";
import type { Interaction } from "../../lib/supabase/interactions/types";
import type { UserRole } from "../../types/supabase";
import { supabase } from "../../lib/supabase/client";
import { getInteractions } from "../../lib/supabase/interactions/queries";
import { sendChatNotification } from "../../lib/supabase/email";
import { toast } from "react-hot-toast";

type Props = {
  ticketId: string;
  userRole: UserRole | null;
  customerEmail?: string;
};

export default function InteractionTimeline({
  ticketId,
  userRole,
  customerEmail,
}: Props) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const { data, error } = await getInteractions(ticketId);

        if (error) {
          console.error(
            "[InteractionTimeline] Error fetching interactions:",
            error
          );
          setLoading(false);
          return;
        }

        if (data) {
          setInteractions(data);
        }
        setLoading(false);
      } catch (error) {
        console.error("[InteractionTimeline] Caught error:", error);
        setLoading(false);
      }
    };

    fetchInteractions();

    // Set up realtime subscription
    const channel = supabase
      .channel(`public:interactions:${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interactions",
          filter: `ticket_id=eq.${ticketId}`,
        },
        async (payload) => {
          console.log(
            "[InteractionTimeline] Realtime update received:",
            payload
          );
          await fetchInteractions();
        }
      )
      .subscribe((status) => {
        console.log("[InteractionTimeline] Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, userRole]);

  const renderInteractionContent = (interaction: Interaction) => {
    const date = new Date(interaction.created_at).toLocaleString();
    const author = interaction.author?.email || "Unknown";

    switch (interaction.type) {
      case "FEEDBACK":
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
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
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{author}</span> provided feedback
              </p>
              <div className="mt-1 text-sm bg-purple-50 rounded-md p-3">
                {interaction.content.feedback}
              </div>
              <p className="text-xs text-gray-400 mt-1">{date}</p>
            </div>
          </div>
        );

      case "RATING":
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">
                <span className="font-medium">{author}</span> rated this ticket
              </p>
              <div className="mt-1 text-sm bg-yellow-50 rounded-md p-3">
                <div className="flex space-x-1 text-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= interaction.content.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({interaction.content.rating} out of 5)
                  </span>
                </div>
                {interaction.content.comment && (
                  <p className="mt-2 text-gray-700">
                    {interaction.content.comment}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{date}</p>
            </div>
          </div>
        );

      case "STATUS_CHANGE":
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">
                Status changed from{" "}
                <span className="font-medium">
                  {interaction.content.oldStatus}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {interaction.content.newStatus}
                </span>{" "}
                by {author}
              </p>
              <p className="text-xs text-gray-400">{date}</p>
            </div>
          </div>
        );

      case "ASSIGNMENT":
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">
                Assigned from{" "}
                <span className="font-medium">
                  {interaction.content.oldAssigneeEmail || "Unassigned"}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {interaction.content.newAssigneeEmail || "Unassigned"}
                </span>{" "}
                by {author}
              </p>
              <p className="text-xs text-gray-400">{date}</p>
            </div>
          </div>
        );

      case "NOTE":
        if (interaction.content.internal && userRole === "CUSTOMER") {
          return null;
        }
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div
                className={`h-8 w-8 rounded-full ${
                  interaction.content.internal ? "bg-yellow-100" : "bg-gray-100"
                } flex items-center justify-center`}
              >
                <svg
                  className={`h-5 w-5 ${
                    interaction.content.internal
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">{author}</span>{" "}
                  {interaction.content.internal && (
                    <span className="text-yellow-600">(Internal) </span>
                  )}
                  added a note
                </p>
                {!interaction.content.internal &&
                  userRole !== "CUSTOMER" &&
                  customerEmail && (
                    <button
                      onClick={async () => {
                        const success = await sendChatNotification({
                          ticketId,
                          customerEmail,
                          messageContent: interaction.content.text,
                        });
                        if (success) {
                          toast.success("Email notification sent!");
                        } else {
                          toast.error("Failed to send email notification");
                        }
                      }}
                      className="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Notify
                    </button>
                  )}
              </div>
              <div
                className={`mt-1 text-sm prose prose-sm prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 max-w-none ${
                  interaction.content.internal ? "bg-yellow-50" : "bg-gray-50"
                } rounded-md p-3`}
                dangerouslySetInnerHTML={{
                  __html: interaction.content.text || "",
                }}
              />
              <p className="text-xs text-gray-400 mt-1">{date}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-100 rounded"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Activity Timeline
      </h2>
      <div className="flow-root">
        <ul className="-mb-8">
          {interactions.map((interaction, idx) => {
            const content = renderInteractionContent(interaction);
            if (!content) return null;

            return (
              <li key={interaction.id}>
                <div className="relative pb-8">
                  {idx !== interactions.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  {content}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
