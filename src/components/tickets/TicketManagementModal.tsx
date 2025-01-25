import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { Database } from "../../types/supabase";
import { getTeams, getTeamsForWorker } from "../../lib/supabase/teams";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ticket: Database["public"]["Tables"]["tickets"]["Row"] & {
    customer: Database["public"]["Tables"]["users"]["Row"];
    assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
  };
  workers: Database["public"]["Tables"]["users"]["Row"][];
  onStatusChange: (
    status: Database["public"]["Tables"]["tickets"]["Row"]["status"]
  ) => Promise<void>;
  onAssignmentChange: (workerId: string | null) => Promise<void>;
  onClaimTicket: () => Promise<void>;
  onReleaseTicket: () => Promise<void>;
  updating: boolean;
  userRole: string;
  currentUserId: string;
};

type Team = Database["public"]["Tables"]["teams"]["Row"];
type AssignmentType = "NONE" | "TEAM" | "INDIVIDUAL";

export default function TicketManagementModal({
  isOpen,
  onClose,
  ticket,
  workers,
  onStatusChange,
  onAssignmentChange,
  onClaimTicket,
  onReleaseTicket,
  updating,
  userRole,
  currentUserId,
}: Props) {
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
        if (isAdmin) {
          const { data: teamsData, error } = await getTeams();
          if (error) throw error;
          setTeams(teamsData || []);
        } else if (currentUserId) {
          const { data: teamsData, error } = await getTeamsForWorker(
            currentUserId
          );
          if (error) throw error;
          setTeams(teamsData || []);
        }
      } catch (error) {
        console.error("[TicketManagementModal] Error loading teams:", error);
      }
    };

    if (isOpen) {
      loadTeams();
    }
  }, [isAdmin, isOpen, currentUserId]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Ticket Management
                </Dialog.Title>

                <div className="space-y-6">
                  {/* Status Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
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
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  {/* Assignment Section - Modified for both admin and workers */}
                  {(isAdmin || userRole === "WORKER") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assignment Type
                      </label>
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                        {isAdmin && (
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio text-blue-600"
                              value="NONE"
                              checked={assignmentType === "NONE"}
                              onChange={(e) =>
                                setAssignmentType(
                                  e.target.value as AssignmentType
                                )
                              }
                              disabled={updating}
                            />
                            <span className="ml-2">Unassigned</span>
                          </label>
                        )}
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            value="TEAM"
                            checked={assignmentType === "TEAM"}
                            onChange={(e) =>
                              setAssignmentType(
                                e.target.value as AssignmentType
                              )
                            }
                            disabled={updating}
                          />
                          <span className="ml-2">Assign to Team</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            value="INDIVIDUAL"
                            checked={assignmentType === "INDIVIDUAL"}
                            onChange={(e) =>
                              setAssignmentType(
                                e.target.value as AssignmentType
                              )
                            }
                            disabled={updating}
                          />
                          <span className="ml-2">Assign to Self</span>
                        </label>
                      </div>

                      {/* Team Selection - Modified to show only teams the worker is part of */}
                      {assignmentType === "TEAM" && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assigned Team
                          </label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={ticket.team_id || ""}
                            onChange={(e) => onAssignmentChange(e.target.value)}
                            disabled={updating}
                          >
                            <option value="">Select a team</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Individual Assignment - Modified to only allow self-assignment for workers */}
                      {assignmentType === "INDIVIDUAL" && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assigned To
                          </label>
                          {isAdmin ? (
                            <select
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              value={ticket.assigned_to?.id || ""}
                              onChange={(e) =>
                                onAssignmentChange(e.target.value)
                              }
                              disabled={updating}
                            >
                              <option value="">Select a worker</option>
                              {workers.map((worker) => (
                                <option key={worker.id} value={worker.id}>
                                  {worker.email}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                onAssignmentChange(currentUserId || "")
                              }
                              disabled={updating || !currentUserId}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              Assign to Myself
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Note Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add Note
                    </label>
                  </div>

                  {/* Claim/Release Section - Only for workers */}
                  {userRole === "WORKER" && ticket.team_id && !isAdmin && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          Ticket Assignment
                        </label>
                        {ticket.assigned_to?.id === currentUserId ? (
                          <button
                            type="button"
                            onClick={onReleaseTicket}
                            disabled={updating}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                          >
                            Release Ticket
                          </button>
                        ) : !ticket.assigned_to?.id ? (
                          <button
                            type="button"
                            onClick={onClaimTicket}
                            disabled={updating}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            Claim Ticket
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Claimed by {ticket.assigned_to.email}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                    disabled={updating}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
