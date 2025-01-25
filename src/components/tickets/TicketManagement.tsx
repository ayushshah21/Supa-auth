import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Database } from "../../types/supabase";
import { getTeams } from "../../lib/supabase/teams";
import NoteEditor from "./NoteEditor";

type Props = {
  ticket: {
    status: Database["public"]["Tables"]["tickets"]["Row"]["status"];
    assigned_to: { id: string; email: string } | null;
    team_id: string | null;
  };
  workers: Database["public"]["Tables"]["users"]["Row"][];
  onStatusChange: (
    status: Database["public"]["Tables"]["tickets"]["Row"]["status"]
  ) => Promise<void>;
  onAssignmentChange: (workerId: string) => Promise<void>;
  onAddNote: (note: { content: string; internal: boolean }) => Promise<void>;
  updating: boolean;
  userRole: string;
};

type Team = Database["public"]["Tables"]["teams"]["Row"];
type AssignmentType = "NONE" | "TEAM" | "INDIVIDUAL";

export default function TicketManagement({
  ticket,
  workers,
  onStatusChange,
  onAssignmentChange,
  onAddNote,
  updating,
  userRole,
}: Props) {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [assignmentType, setAssignmentType] = useState<AssignmentType>(() => {
    if (ticket.team_id) return "TEAM";
    if (ticket.assigned_to) return "INDIVIDUAL";
    return "NONE";
  });

  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const { data: teamsData, error } = await getTeams();
        if (error) throw error;
        setTeams(teamsData || []);
      } catch (error) {
        console.error("[TicketManagement] Error loading teams:", error);
      }
    };

    if (isAdmin) {
      loadTeams();
    }
  }, [isAdmin]);

  console.log("[TicketManagement] Current state:", {
    ticketStatus: ticket.status,
    assignedToId: ticket.assigned_to?.id,
    teamId: ticket.team_id,
    availableWorkers: workers.map((w) => ({ id: w.id, email: w.email })),
    isUpdating: updating,
  });

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-lg font-medium text-gray-900 mb-2">
        {t("ticket.management.title")}
      </h2>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("ticket.labels.status")}
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={ticket.status}
            onChange={(e) =>
              onStatusChange(
                e.target
                  .value as Database["public"]["Tables"]["tickets"]["Row"]["status"]
              )
            }
            disabled={updating}
          >
            <option value="OPEN">{t("ticket.status.OPEN")}</option>
            <option value="IN_PROGRESS">
              {t("ticket.status.IN_PROGRESS")}
            </option>
            <option value="RESOLVED">{t("ticket.status.RESOLVED")}</option>
            <option value="CLOSED">{t("ticket.status.CLOSED")}</option>
          </select>
        </div>

        {/* Only show assignment options for admin */}
        {isAdmin && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("ticket.labels.assignmentType")}
            </label>
            <div className="flex space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  value="NONE"
                  checked={assignmentType === "NONE"}
                  onChange={(e) =>
                    setAssignmentType(e.target.value as AssignmentType)
                  }
                  disabled={updating}
                />
                <span className="ml-2">{t("ticket.labels.unassigned")}</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  value="TEAM"
                  checked={assignmentType === "TEAM"}
                  onChange={(e) =>
                    setAssignmentType(e.target.value as AssignmentType)
                  }
                  disabled={updating}
                />
                <span className="ml-2">{t("ticket.labels.assignToTeam")}</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  value="INDIVIDUAL"
                  checked={assignmentType === "INDIVIDUAL"}
                  onChange={(e) =>
                    setAssignmentType(e.target.value as AssignmentType)
                  }
                  disabled={updating}
                />
                <span className="ml-2">
                  {t("ticket.labels.assignToIndividual")}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Show team selection when assignmentType is TEAM */}
        {isAdmin && assignmentType === "TEAM" && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("ticket.labels.assignedTeam")}
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={ticket.team_id || ""}
              onChange={(e) => onAssignmentChange(e.target.value)}
              disabled={updating}
            >
              <option value="">{t("ticket.labels.unassigned")}</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show individual assignment when assignmentType is INDIVIDUAL */}
        {assignmentType === "INDIVIDUAL" && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("ticket.labels.assignedTo")}
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={ticket.assigned_to?.id || ""}
              onChange={(e) => onAssignmentChange(e.target.value)}
              disabled={updating}
            >
              <option value="">{t("ticket.labels.unassigned")}</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.email}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("ticket.actions.addNote")}
        </label>
        <NoteEditor onSubmit={onAddNote} disabled={updating} />
      </div>
    </div>
  );
}
