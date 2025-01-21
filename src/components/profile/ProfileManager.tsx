import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { User as UserIcon, Upload } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { updateUser } from "../../lib/supabase/auth";

interface ProfileManagerProps {
  user: User;
  onUpdate: () => void;
}

export default function ProfileManager({
  user,
  onUpdate,
}: ProfileManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(user.user_metadata.full_name || "");

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: name },
      });

      if (updateError) throw updateError;

      // Update the users table as well
      const { error: dbError } = await updateUser(user.id, {
        name: name,
      });

      if (dbError) throw dbError;

      onUpdate();
    } catch (err) {
      console.error("Error updating name:", err);
      setError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update both auth metadata and users table
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      // Update the users table with the avatar URL
      const { error: dbError } = await updateUser(user.id, {
        avatar_url: publicUrl,
      });

      if (dbError) throw dbError;

      onUpdate();
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          {user.user_metadata.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="User avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-gray-500" />
            </div>
          )}
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-50"
          >
            <Upload className="w-4 h-4 text-gray-600" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            disabled={loading}
          />
        </div>

        <form onSubmit={handleNameUpdate} className="flex-1">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Email: {user.email} (cannot be changed)
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
