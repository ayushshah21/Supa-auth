import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { getCurrentUser, getUserRole, signOut } from "../lib/supabase";
import type { UserRole } from "../types/supabase";
import ProfileManager from "../components/profile/ProfileManager";

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);

      const userRole = await getUserRole(currentUser.id);
      setRole(userRole);
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load user data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error) return <div className="text-red-600 p-4 text-center">{error}</div>;

  if (!user || !role) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Role: {role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        <ProfileManager user={user} onUpdate={loadUser} />

        {/* Add your role-specific dashboard content below */}
        <div className="mt-8 space-y-4">
          {/* Customer specific content */}
          {role === "CUSTOMER" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
              {/* Add customer specific content */}
            </div>
          )}

          {/* Worker specific content */}
          {(role === "WORKER" || role === "ADMIN") && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Assigned Tickets</h2>
              {/* Add worker specific content */}
            </div>
          )}

          {/* Admin specific content */}
          {role === "ADMIN" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">System Overview</h2>
              {/* Add admin specific content */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
