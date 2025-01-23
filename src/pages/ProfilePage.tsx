import { useState, useEffect } from "react";
import { getCurrentUser, getUserRole, updateUser } from "../lib/supabase/auth";
import { supabase } from "../lib/supabaseClient";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setError(t("profile.errors.loadProfile"));
        return;
      }

      setEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");

      const userRole = await getUserRole(user.id);
      setRole(userRole || "");
    } catch (error) {
      console.error("Error loading profile:", error);
      setError(t("profile.errors.loadProfile"));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const user = await getCurrentUser();
      if (!user) {
        setError(t("profile.errors.unauthorized"));
        return;
      }

      // Upload to Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setError(t("profile.errors.avatarUpload"));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = await getCurrentUser();
      if (!user) {
        setError(t("profile.errors.unauthorized"));
        return;
      }

      await updateUser(user.id, {
        name: fullName,
        avatar_url: avatarUrl,
      });

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      setError(t("profile.errors.saveProfile"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">{t("profile.title")}</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded mb-4">{error}</div>
        )}

        {/* Avatar Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={avatarUrl || "https://via.placeholder.com/150"}
                alt={t("profile.avatarAlt")}
                className="w-24 h-24 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                <Upload className="h-4 w-4 text-gray-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {fullName || t("profile.setName")}
              </h2>
              <p className="text-gray-600">
                {t("profile.role")}: {t(`users.roles.${role}`)}
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.labels.fullName")}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.labels.email")}
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
            />
            <p className="mt-1 text-sm text-gray-500">
              {t("profile.emailNotEditable")}
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t("profile.saving") : t("profile.saveChanges")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
