import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { Database } from "../../types/supabase";
import { getWorkers } from "../../lib/supabase/auth";
import { addTeamMember, removeTeamMember } from "../../lib/supabase/teams";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  currentMembers: Array<{
    id: string;
    user_id: string;
    role: string;
  }>;
  onTeamUpdated: () => Promise<void>;
};

type Worker = Database["public"]["Tables"]["users"]["Row"];

export default function TeamMembersModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  currentMembers,
  onTeamUpdated,
}: Props) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        const { data, error } = await getWorkers();
        if (error) throw error;
        setWorkers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workers");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadWorkers();
    }
  }, [isOpen]);

  const handleAddMember = async (userId: string) => {
    if (!userId) return;
    setUpdating(true);
    setError("");

    try {
      const { error } = await addTeamMember({
        team_id: teamId,
        user_id: userId,
        role: "MEMBER", // Default role for now
        joined_at: new Date().toISOString(),
      });

      if (error) throw error;
      await onTeamUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add team member"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setUpdating(true);
    setError("");

    try {
      const { error } = await removeTeamMember(teamId, userId);
      if (error) throw error;
      await onTeamUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove team member"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Filter out workers who are already team members
  const availableWorkers = workers.filter(
    (worker) => !currentMembers.some((member) => member.user_id === worker.id)
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          if (!updating) onClose();
        }}
      >
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Manage Team Members - {teamName}
                </Dialog.Title>

                {error && (
                  <div className="mt-2 text-sm text-red-600">{error}</div>
                )}

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Current Members
                  </h4>
                  {currentMembers.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No members in this team yet
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {currentMembers.map((member) => {
                        const worker = workers.find(
                          (w) => w.id === member.user_id
                        );
                        return (
                          <li
                            key={member.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-900">
                              {worker?.email || "Loading..."}
                            </span>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-700 disabled:opacity-50"
                              onClick={() => handleRemoveMember(member.user_id)}
                              disabled={updating}
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Add Member
                  </h4>
                  {loading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : availableWorkers.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No available workers to add
                    </p>
                  ) : (
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:opacity-50"
                      onChange={(e) => handleAddMember(e.target.value)}
                      value=""
                      disabled={updating}
                    >
                      <option value="" disabled>
                        Select a worker to add
                      </option>
                      {availableWorkers.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.email}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
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
