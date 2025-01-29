import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Function to get ticket data
async function getTicketData(ticketId: string) {
  const { data: ticket, error: ticketError } = await supabaseClient
    .from("tickets")
    .select(
      `
      *,
      customer:users!tickets_customer_id_fkey(
        id,
        name,
        email
      ),
      assigned_to:users!tickets_assigned_to_id_fkey(
        id,
        name,
        email
      )
    `,
    )
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    console.error("Error fetching ticket data:", ticketError);
    return null;
  }

  return ticket;
}

// Function to get customer's ticket history
async function getCustomerTicketHistory(customerId: string) {
  const { data: tickets, error } = await supabaseClient
    .from("tickets")
    .select(
      `
      *,
      customer:users!tickets_customer_id_fkey(
        id,
        name,
        email
      )
    `,
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error || !tickets) {
    console.error("Error fetching customer history:", error);
    return null;
  }

  return tickets;
}

// Function to handle the agent's tasks
async function handleAgentTask(query: string, ticketId?: string) {
  let systemMessage =
    `You are an AI assistant for a clothing store's customer service team. Your task is to help draft professional and helpful responses to customer inquiries.`;

  // If we have a ticket ID, get the ticket data
  if (ticketId) {
    const ticketData = await getTicketData(ticketId);
    if (ticketData) {
      const customerHistory = await getCustomerTicketHistory(
        ticketData.customer_id,
      );

      systemMessage += `\n\nTicket Context:
- Customer Name: ${ticketData.customer?.name || ""}
- Customer Email: ${ticketData.customer?.email || ""}
- Ticket Title: ${ticketData.title}
- Ticket Description: ${ticketData.description}
- Ticket Status: ${ticketData.status}
- Ticket Priority: ${ticketData.priority}
- Created At: ${new Date(ticketData.created_at).toLocaleDateString()}
${
        ticketData.resolved_at
          ? `- Resolved At: ${
            new Date(ticketData.resolved_at).toLocaleDateString()
          }`
          : ""
      }

Customer History:
${
        customerHistory?.map((ticket) =>
          `- ${
            new Date(ticket.created_at).toLocaleDateString()
          }: ${ticket.title}`
        ).join("\n") || "No previous tickets"
      }

Always use the customer's name and reference their specific ticket details in your response. Be empathetic and solution-focused.`;
    }
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: query,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return completion.choices[0].message.content;
}

serve(async (req) => {
  console.log("Request received:", {
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    url: req.url,
  });

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers":
          "Authorization, authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Credentials": "true",
        "Content-Length": "0",
        "Content-Type": "text/plain",
      },
    });
  }

  try {
    // Verify request method
    if (req.method !== "POST") {
      console.log("Method not allowed:", req.method);
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json",
          },
        },
      );
    }

    const startTime = performance.now();

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header received:", authHeader ? "Present" : "Missing");

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Invalid auth header format");
      return new Response(
        JSON.stringify({ error: "Invalid authorization header" }),
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Get user
    const token = authHeader.replace("Bearer ", "");
    console.log("Attempting to get user with token");
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError) {
      console.log("Auth error:", authError);
    }

    if (!user) {
      console.log("No user found");
    }

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
      });
    }

    console.log("User authenticated successfully:", user.id);

    // Parse request
    const { query, ticketId } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
      });
    }

    const response = await handleAgentTask(query, ticketId);
    const endTime = performance.now();
    const timeTaken = endTime - startTime;

    // Log the interaction
    await supabaseClient.from("agent_logs").insert({
      query,
      output: response,
      time_taken_ms: timeTaken,
      user_id: user.id,
      ticket_id: ticketId,
      success: true,
    });

    return new Response(
      JSON.stringify({ response }),
      {
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
        status: 500,
      },
    );
  }
});
