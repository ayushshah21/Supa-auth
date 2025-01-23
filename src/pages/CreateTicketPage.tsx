/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../lib/supabase/auth";
import { createTicket } from "../lib/supabase/tickets";
import type { TicketPriority } from "../types/supabase";

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      console.log("[CreateTicketPage] Starting ticket creation...");

      const user = await getCurrentUser();
      if (!user) {
        console.error("[CreateTicketPage] No authenticated user found");
        setError(t("auth.errors.notAuthenticated"));
        return;
      }

      console.log("[CreateTicketPage] Current user:", {
        id: user.id,
        email: user.email,
      });

      const ticketData = {
        title,
        description,
        priority,
        customer_id: user.id,
        status: "OPEN" as const,
        assigned_to_id: null,
        resolved_at: null,
      };

      console.log(
        "[CreateTicketPage] Preparing to create ticket with data:",
        ticketData
      );

      const { error: ticketError } = await createTicket(ticketData);

      if (ticketError) {
        console.error("[CreateTicketPage] Error creating ticket:", ticketError);
        setError(ticketError.message);
        return;
      }

      console.log(
        "[CreateTicketPage] Ticket created successfully, navigating to my-tickets"
      );
      navigate("/my-tickets");
    } catch (err: any) {
      console.error("[CreateTicketPage] Unexpected error:", err);
      setError(t("ticket.messages.error") || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t("ticket.create")}</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            {t("ticket.labels.title")}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            placeholder={t("ticket.placeholders.titleHint")}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            {t("ticket.labels.description")}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            placeholder={t("ticket.placeholders.descriptionHint")}
          />
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700"
          >
            {t("ticket.labels.priority")}
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="LOW">{t("ticket.priority.LOW")}</option>
            <option value="MEDIUM">{t("ticket.priority.MEDIUM")}</option>
            <option value="HIGH">{t("ticket.priority.HIGH")}</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? t("common.creating") : t("ticket.create")}
          </button>
        </div>
      </form>
    </div>
  );
}
