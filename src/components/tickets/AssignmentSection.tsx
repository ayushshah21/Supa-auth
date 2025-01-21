import type { Database } from "../../types/supabase";

interface AssignmentSectionProps {
  assignedTo: Database["public"]["Tables"]["users"]["Row"] | null;
}

export default function AssignmentSection({
  assignedTo,
}: AssignmentSectionProps) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-2">Assignment</h2>
      <p className="text-gray-600">
        {assignedTo ? (
          <>Assigned to: {assignedTo.email}</>
        ) : (
          <span className="text-yellow-600">Unassigned</span>
        )}
      </p>
    </div>
  );
}
