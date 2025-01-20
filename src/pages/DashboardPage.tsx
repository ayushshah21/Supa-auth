import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { User as UserIcon } from "lucide-react";
import { getCurrentUser, getUserRole, signOut } from "../lib/supabase";
import type { UserRole } from "../types/supabase";

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
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

          <div className="space-y-4">
            {/* User Profile Section */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                {user.user_metadata.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">User Information</h2>
                  <p className="mt-2">
                    Full Name: {user.user_metadata.full_name}
                  </p>
                  <p>Email: {user.email}</p>
                  <p>
                    Last Sign In:{" "}
                    {new Date(user.last_sign_in_at || "").toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Role-specific content */}
            {role === "CUSTOMER" && (
              <div className="p-4 bg-white border rounded-lg">
                <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/create-ticket")}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create New Ticket
                  </button>
                  <button
                    onClick={() => navigate("/my-tickets")}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    View My Tickets
                  </button>
                </div>
              </div>
            )}

            {(role === "WORKER" || role === "ADMIN") && (
              <div className="space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">All Tickets</h2>
                  <button
                    onClick={() => navigate("/all-tickets")}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View All Tickets
                  </button>
                </div>

                {role === "ADMIN" && (
                  <div className="p-4 bg-white border rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">
                      Admin Controls
                    </h2>
                    {/* Add admin controls component */}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
