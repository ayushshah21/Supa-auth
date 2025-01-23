/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getUsers, updateUserRole } from "../lib/supabase/auth";
import type { Database, UserRole } from "../types/supabase";

type User = Database["public"]["Tables"]["users"]["Row"];

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await getUsers();
        if (error) throw error;
        setUsers(data || []);
      } catch (err: any) {
        setError(err.message || t("users.errors.loadUsers"));
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [t]);

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      setUpdating(userId);
      await updateUserRole(userId, newRole);
      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err: any) {
      setError(err.message || t("users.errors.updateRole"));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {t("common.error")}
            </h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t("users.manageUsers")}
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("users.labels.email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("users.labels.name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("users.labels.currentRole")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("users.labels.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "WORKER"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {t(`users.roles.${user.role}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {user.role !== "CUSTOMER" && (
                        <button
                          onClick={() => handleRoleUpdate(user.id, "CUSTOMER")}
                          disabled={updating === user.id}
                          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                          {updating === user.id
                            ? t("users.actions.updating")
                            : t("users.actions.changeToCustomer")}
                        </button>
                      )}
                      {user.role !== "WORKER" && (
                        <button
                          onClick={() => handleRoleUpdate(user.id, "WORKER")}
                          disabled={updating === user.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          {updating === user.id
                            ? t("users.actions.updating")
                            : t("users.actions.changeToWorker")}
                        </button>
                      )}
                      {user.role !== "ADMIN" && (
                        <button
                          onClick={() => handleRoleUpdate(user.id, "ADMIN")}
                          disabled={updating === user.id}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                        >
                          {updating === user.id
                            ? t("users.actions.updating")
                            : t("users.actions.changeToAdmin")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
