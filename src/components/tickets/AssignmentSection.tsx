import { useTranslation } from "react-i18next";
import type { Database } from "../../types/supabase";

interface AssignmentSectionProps {
  assignedTo: Database["public"]["Tables"]["users"]["Row"] | null;
}

export default function AssignmentSection({
  assignedTo,
}: AssignmentSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-2">
        {t("ticket.sections.assignment")}
      </h2>
      <p className="text-gray-600">
        {t("ticket.sections.assignedTo")}:{" "}
        {assignedTo?.email || t("ticket.labels.unassigned")}
      </p>
    </div>
  );
}
