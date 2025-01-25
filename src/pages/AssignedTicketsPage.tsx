/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getCurrentUser, getUserRole } from "../lib/supabase";
import { getTicketsForWorker } from "../lib/supabase/tickets";
import type { UserRole } from "../types/supabase";
import type { Ticket } from "../types/tickets";
import TicketTable from "../components/tickets/TicketTable";

export default function AssignedTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        const role = await getUserRole(user.id);
        setUserRole(role);

        const { data, error: ticketsError } = await getTicketsForWorker(
          user.id
        );
        if (ticketsError) throw ticketsError;

        // Filter for active tickets (OPEN and IN_PROGRESS)
        const activeTickets = (data || []).filter(
          (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
        );
        setTickets(activeTickets);
      } catch (err: any) {
        setError(err.message || t("common.error.loadTickets"));
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        {t("common.error")}: {error}
      </div>
    );
  }

  if (!userRole) return null;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t("ticket.assignedTickets")}
        </h2>

        {tickets.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {t("ticket.noAssignedTickets")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <TicketTable
              tickets={tickets}
              selectedTickets={[]}
              onSelectAll={() => {}}
              onSelectTicket={() => {}}
              hideSelectionColumn={true}
              userRole={userRole}
            />
          </div>
        )}
      </div>
    </div>
  );
}
