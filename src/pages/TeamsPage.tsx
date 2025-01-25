/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUserRole, getWorkers } from "../lib/supabase/auth";
import {
  getTeams,
  getTeamsForWorker,
} from "../lib/supabase/teams";
import type { Database, UserRole } from "../types/supabase";
import CreateTeamModal from "../components/teams/CreateTeamModal";
import TeamMembersModal from "../components/teams/TeamMembersModal";
import TeamSpecialtiesEditor from "../components/teams/TeamSpecialtiesEditor";
import { supabase } from "../lib/supabase/client";

type Team = Database["public"]["Tables"]["teams"]["Row"] & {
  members: Database["public"]["Tables"]["team_members"]["Row"][];
  specialties: {
    team_id: string;
    tag_id: string;
    tag: Database["public"]["Tables"]["tags"]["Row"];
  }[];
};

export default function TeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] =
    useState(false);
  const [workers, setWorkers] = useState<
    Database["public"]["Tables"]["users"]["Row"][]
  >([]);
  const [isSpecialtiesModalOpen, setIsSpecialtiesModalOpen] = useState(false);

  const loadTeams = async (userId: string, role: UserRole) => {
    try {
      const { data: teamsData, error: teamsError } =
        role === "ADMIN" ? await getTeams() : await getTeamsForWorker(userId);

      if (teamsError) throw teamsError;

      // Fetch specialties for each team
      if (teamsData) {
        const teamsWithSpecialties = await Promise.all(
          teamsData.map(async (team) => {
            const { data: specialtiesData, error: specialtiesError } =
              await supabase
                .from("team_specialties")
                .select(`*, tag:tags(*)`)
                .eq("team_id", team.id);

            if (specialtiesError) {
              console.error(
                "Error fetching team specialties:",
                specialtiesError
              );
              return { ...team, specialties: [] };
            }

            return { ...team, specialties: specialtiesData || [] };
          })
        );

        setTeams(teamsWithSpecialties);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserAndTeams = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate("/login");
          return;
        }

        const role = await getUserRole(currentUser.id);
        setUserRole(role);

        if (role !== "ADMIN" && role !== "WORKER") {
          navigate("/");
          return;
        }

        // Load workers for displaying member emails
        const { data: workersData } = await getWorkers();
        if (workersData) setWorkers(workersData);

        await loadTeams(currentUser.id, role);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndTeams();
  }, [navigate]);

  // Store current user ID for callbacks
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const setUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    setUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {userRole === "ADMIN" ? "Team Management" : "My Teams"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {userRole === "ADMIN"
              ? "Create and manage support teams, assign team members, and define team responsibilities."
              : "View and manage your team assignments and responsibilities."}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:justify-between sm:items-center mb-6">
              <h2 className="text-xl font-semibold mb-4 sm:mb-0">
                {userRole === "ADMIN" ? "All Teams" : "My Teams"}
              </h2>
              {userRole === "ADMIN" && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Team
                </button>
              )}
            </div>

            {teams.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No teams have been created yet
                </p>
                {userRole === "ADMIN" && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create your first team
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {team.name}
                      </h3>
                      {team.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {team.description}
                        </p>
                      )}
                      <div className="mt-3 space-y-2">
                        {userRole === "ADMIN" && (
                          <button
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              setIsManageMembersModalOpen(true);
                            }}
                            className="w-full px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Manage Members
                          </button>
                        )}
                        {(userRole === "ADMIN" ||
                          (userRole === "WORKER" &&
                            team.members.some(
                              (m) => m.user_id === currentUserId
                            ))) && (
                          <button
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              setIsSpecialtiesModalOpen(true);
                            }}
                            className="w-full px-3 py-1.5 text-sm font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Edit Specialties
                          </button>
                        )}
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          Team Members ({team.members.length})
                        </h4>
                        <div className="mt-2 space-y-1">
                          {team.members.map((member) => {
                            const memberUser = workers.find(
                              (w) => w.id === member.user_id
                            );
                            return (
                              <div
                                key={member.id}
                                className="flex items-center text-sm text-gray-600"
                              >
                                <span>{memberUser?.email || "Loading..."}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          Team Specialties ({team.specialties.length})
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {team.specialties.length === 0 ? (
                            <p className="text-sm text-gray-500">
                              No specialties defined
                            </p>
                          ) : (
                            team.specialties.map((specialty) => (
                              <span
                                key={specialty.tag_id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: specialty.tag.color
                                    ? `${specialty.tag.color}20`
                                    : "#E5E7EB",
                                  color: specialty.tag.color || "#374151",
                                }}
                              >
                                {specialty.tag.name}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={async () => {
          if (userRole && currentUserId) {
            await loadTeams(currentUserId, userRole);
          }
        }}
      />

      {selectedTeamId && (
        <TeamMembersModal
          isOpen={isManageMembersModalOpen}
          onClose={() => {
            setIsManageMembersModalOpen(false);
            setSelectedTeamId(null);
          }}
          teamId={selectedTeamId}
          teamName={teams.find((t) => t.id === selectedTeamId)?.name || ""}
          currentMembers={
            teams.find((t) => t.id === selectedTeamId)?.members || []
          }
          onTeamUpdated={async () => {
            if (userRole && currentUserId) {
              await loadTeams(currentUserId, userRole);
            }
          }}
        />
      )}

      {selectedTeamId && isSpecialtiesModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <TeamSpecialtiesEditor
                teamId={selectedTeamId}
                teamName={
                  teams.find((t) => t.id === selectedTeamId)?.name || ""
                }
                onClose={() => {
                  setIsSpecialtiesModalOpen(false);
                  setSelectedTeamId(null);
                }}
                onSaved={async () => {
                  if (userRole && currentUserId) {
                    await loadTeams(currentUserId, userRole);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
