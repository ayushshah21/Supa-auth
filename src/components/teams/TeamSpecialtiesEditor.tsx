import { useEffect, useState } from "react";
import { getTags, deleteTag } from "../../lib/supabase/tags";
import {
  getTeamSpecialties,
  updateTeamSpecialties,
} from "../../lib/supabase/teams";
import type { Database } from "../../types/supabase";
import { toast } from "react-hot-toast";
import CreateTagModal from "./CreateTagModal";
import { Trash2 } from "lucide-react";

interface Props {
  teamId: string;
  teamName: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function TeamSpecialtiesEditor({
  teamId,
  teamName,
  onClose,
  onSaved,
}: Props) {
  const [allTags, setAllTags] = useState<
    Database["public"]["Tables"]["tags"]["Row"][]
  >([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Get all available tags
      const { data: tagsData, error: tagsError } = await getTags();
      if (tagsError) throw tagsError;
      if (tagsData) {
        // Sort tags by name
        setAllTags(tagsData.sort((a, b) => a.name.localeCompare(b.name)));
      }

      // 2. Get current team specialties
      const { data: specialtiesData, error: specError } =
        await getTeamSpecialties(teamId);
      if (specError) throw specError;
      if (specialtiesData) {
        const existingTagIds = specialtiesData.map((row) => row.tag_id);
        setSelectedTagIds(existingTagIds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teamId]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const { error: updateError } = await updateTeamSpecialties(
        teamId,
        selectedTagIds
      );
      if (updateError) throw updateError;

      toast.success("Team specialties updated successfully");
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update team specialties"
      );
      toast.error("Failed to update team specialties");
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const { error: deleteError } = await deleteTag(tagId);
      if (deleteError) throw deleteError;

      // Remove the tag from selected tags if it was selected
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));

      // Refresh the tags list
      await loadData();
      toast.success("Tag deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tag");
      toast.error("Failed to delete tag");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-4">
        Manage Team Specialties - {teamName}
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            Select the areas of expertise for this team. These specialties will
            be used to automatically route tickets.
          </p>
          <button
            onClick={() => setIsCreateTagModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Create New Tag
          </button>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200">
        {allTags.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No tags available.</p>
            <p className="text-sm text-gray-500">
              Create your first tag to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {allTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group"
              >
                <label className="flex items-center flex-1 min-w-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={saving}
                  />
                  <div className="ml-3 flex items-center">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color || "#E5E7EB" }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {tag.name}
                    </span>
                    {tag.description && (
                      <span className="ml-2 text-sm text-gray-500 truncate">
                        - {tag.description}
                      </span>
                    )}
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 focus:outline-none"
                  disabled={saving || loading}
                  title="Delete tag"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <CreateTagModal
        isOpen={isCreateTagModalOpen}
        onClose={() => setIsCreateTagModalOpen(false)}
        onTagCreated={loadData}
      />
    </div>
  );
}
