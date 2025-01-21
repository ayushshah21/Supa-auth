import type { Database } from "../../types/supabase";
import type { UserRole } from "../../types/supabase";

type Props = {
  notes: Database["public"]["Tables"]["notes"]["Row"][];
  userRole: UserRole | null;
};

export default function TicketNotes({ notes, userRole }: Props) {
  if (!notes || notes.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-lg ${
              note.internal && userRole !== "CUSTOMER"
                ? "bg-yellow-50"
                : "bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div
                className="text-sm text-gray-600 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
              <div className="text-xs text-gray-500 ml-4 shrink-0">
                {new Date(note.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
