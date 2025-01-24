import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { supabase } from "../../lib/supabase/client";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { Database } from "../../types/supabase";

type TicketHeaderProps = {
  ticket: Database["public"]["Tables"]["tickets"]["Row"] & {
    customer: Database["public"]["Tables"]["users"]["Row"];
  };
  userRole: string | null;
  currentUserId: string | null;
  onUpdate: () => Promise<void>;
  updating: boolean;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "bg-yellow-100 text-yellow-800";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "RESOLVED":
      return "bg-green-100 text-green-800";
    case "CLOSED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "text-red-600";
    case "MEDIUM":
      return "text-yellow-600";
    case "LOW":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

export default function TicketHeader({
  ticket,
  userRole,
  currentUserId,
  onUpdate,
  updating,
}: TicketHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(ticket.title);
  const [editedDescription, setEditedDescription] = useState(
    ticket.description
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isCustomer = userRole === "CUSTOMER";
  const canModify =
    isCustomer &&
    currentUserId === ticket.customer_id &&
    ticket.status !== "CLOSED";

  const handleUpdate = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          title: editedTitle,
          description: editedDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticket.id);

      if (error) throw error;
      toast.success(t("ticket.updateSuccess"));
      setIsEditing(false);
      await onUpdate();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error(t("ticket.updateError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // First verify we can read the ticket (RLS check)
      const { data: verifyData, error: verifyError } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", ticket.id)
        .single();

      console.log("Verify ticket access:", { verifyData, verifyError });

      if (verifyError) {
        throw new Error(`Verification failed: ${verifyError.message}`);
      }

      if (!verifyData) {
        throw new Error("Ticket not found or no permission to access");
      }

      // Attempt to delete with explicit return of deleted row
      const { data: deleteData, error: deleteError } = await supabase
        .from("tickets")
        .delete()
        .eq("id", ticket.id)
        .select("*")
        .single();

      console.log("Delete result:", { deleteData, deleteError });

      if (deleteError) {
        throw deleteError;
      }

      if (!deleteData) {
        throw new Error(
          "Ticket was not deleted - no permission or already deleted"
        );
      }

      toast.success(t("ticket.deleteSuccess"));
      // Navigate immediately after successful deletion
      navigate(userRole === "CUSTOMER" ? "/my-tickets" : "/all-tickets", {
        replace: true,
      });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error(
        error instanceof Error ? error.message : t("ticket.deleteError")
      );
      setIsDeleting(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Title section with edit/delete buttons */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("ticket.titlePlaceholder")}
              disabled={updating || isProcessing}
            />
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {ticket.title}
              </h1>
              <div className="flex items-center space-x-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {t(`ticket.status.${ticket.status}`)}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                    ticket.priority
                  )}`}
                >
                  {t(`ticket.priority.${ticket.priority}`)}
                </span>
                <span className="text-sm text-gray-500">
                  {t("ticket.labels.createdBy")}{" "}
                  {ticket.customer?.email || t("ticket.labels.unknown")}{" "}
                  {t("ticket.labels.on")}{" "}
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
        {canModify && (
          <div className="flex gap-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  aria-label={t("common.cancel")}
                  disabled={updating || isProcessing}
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={handleUpdate}
                  className="p-2 text-green-500 hover:text-green-700 rounded-full hover:bg-green-50 disabled:opacity-50"
                  aria-label={t("common.save")}
                  disabled={updating || isProcessing}
                >
                  <Check className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditedTitle(ticket.title);
                  setEditedDescription(ticket.description);
                  setIsEditing(true);
                }}
                className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 disabled:opacity-50"
                aria-label={t("common.edit")}
                disabled={updating || isProcessing}
              >
                <Pencil className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleDelete}
              className={`p-2 rounded-full disabled:opacity-50 ${
                isDeleting
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              aria-label={t("common.delete")}
              disabled={updating || isProcessing}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Description section */}
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          {t("ticket.labels.description")}
        </h2>
        {isEditing ? (
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder={t("ticket.descriptionPlaceholder")}
            disabled={updating || isProcessing}
          />
        ) : (
          <p className="text-gray-600 whitespace-pre-wrap">
            {ticket.description}
          </p>
        )}
      </div>

      {/* Delete Confirmation */}
      {isDeleting && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <p className="text-red-700 font-medium mb-3">
            {t("ticket.deleteConfirmation")}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              disabled={updating || isProcessing}
            >
              {t("common.confirm")}
            </button>
            <button
              onClick={() => setIsDeleting(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
              disabled={updating || isProcessing}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
