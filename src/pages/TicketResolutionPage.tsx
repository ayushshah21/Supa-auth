/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { Database } from "../types/supabase";
import type { Interaction } from "../lib/supabase/interactions/types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

type Ticket = Database["public"]["Tables"]["tickets"]["Row"];

type ResolutionResult = {
  success: boolean;
  resolution?: string;
  ticket_id?: string;
  error?: string;
  ticket?: Ticket;
  interaction?: Interaction[];
  message?: string;
};

export default function TicketResolutionPage() {
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ResolutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTicketSearch, setShowTicketSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle input changes including @ mentions
  const handleInputChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setCommand(value);

    // Find the last @ symbol
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      setShowTicketSearch(true);
      setIsSearching(true);

      try {
        // Fetch open tickets
        const { data: tickets, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("status", "OPEN")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSearchResults(tickets || []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowTicketSearch(false);
    }
  };

  const handleTicketSelect = (ticket: Ticket) => {
    setShowTicketSearch(false);
    setCommand(
      `@Agent resolve ticket ${ticket.id} - Resolving ticket: ${ticket.title}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    // Extract the full ticket ID - look for word boundaries around the UUID
    const ticketIdMatch = command.match(/\b([a-zA-Z0-9-]{36})\b/);
    const ticketId = ticketIdMatch ? ticketIdMatch[1] : null;

    if (!ticketId) {
      setError("Please include a valid ticket ID in your command");
      setIsProcessing(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      console.log("Sending request with:", {
        command,
        ticket_id: ticketId,
      });

      const response = await fetch(`${BACKEND_URL}/api/resolution/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          command,
          ticket_id: ticketId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ticket Resolution</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative mb-4">
          <label
            htmlFor="command"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Resolution Command
          </label>
          <textarea
            id="command"
            value={command}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Type @ to search for open tickets, then add your resolution message"
          />

          {/* Ticket Search Popup */}
          {showTicketSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  Searching tickets...
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="py-1">
                  {searchResults.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleTicketSelect(ticket)}
                    >
                      <div className="font-medium">{ticket.title}</div>
                      <div className="text-sm text-gray-500">
                        ID: {ticket.id}
                        <span className="ml-2">
                          Priority: {ticket.priority}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No open tickets found
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isProcessing || !command.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Process Command"}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-white border border-gray-200 rounded-md shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Resolution Result</h2>

          {/* Status Badge */}
          <div className="flex items-center">
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                result.success
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {result.success ? "Success" : "Failed"}
            </span>
            {result.message && (
              <span className="ml-2 text-gray-600 text-sm">
                {result.message}
              </span>
            )}
          </div>

          {/* Resolution Message */}
          {result.resolution && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Resolution Message</h3>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                {result.resolution}
              </div>
            </div>
          )}

          {/* Interaction */}
          {result.interaction?.[0] && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Resolution Record</h3>
              <div className="text-sm text-gray-600">
                Created:{" "}
                {new Date(result.interaction[0].created_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
