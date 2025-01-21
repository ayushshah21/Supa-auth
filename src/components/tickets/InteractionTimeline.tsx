import { useEffect, useState } from "react";
import type { Interaction } from "../../lib/supabase/interactions";
import type { UserRole } from "../../types/supabase";
import { supabase } from "../../lib/supabase/client";
import { getInteractions } from "../../lib/supabase/interactions";

type Props = {
  ticketId: string;
  userRole: UserRole | null;
};

export default function InteractionTimeline({ ticketId, userRole }: Props) {
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
              <p className="text-sm text-gray-500">
                <span className="font-medium">{author}</span>{" "}
                {interaction.content.internal && (
                  <span className="text-yellow-600">(Internal) </span>
                )}
                added a note
              </p>
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
