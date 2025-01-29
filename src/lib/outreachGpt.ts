interface OutreachRequest {
  query: string;
  ticketId?: string;
}

interface OutreachResponse {
  response: string;
}

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  ticketId: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  id?: string;
}

// API URL configuration
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
console.log("API Service URL:", API_URL); // Debug log

export async function generateOutreachResponse(
  request: OutreachRequest,
): Promise<OutreachResponse> {
  try {
    console.log(
      "Making outreach request to:",
      `${API_URL}/api/generate-outreach`,
    ); // Debug log
    const response = await fetch(`${API_URL}/api/generate-outreach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(errorData.detail || "Failed to generate response");
    }

    const data = await response.json();
    if (!data || !data.response) {
      throw new Error("Invalid response format from server");
    }

    return data;
  } catch (error) {
    console.error("Error in generateOutreachResponse:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to generate response");
  }
}

export async function sendEmail(request: EmailRequest): Promise<EmailResponse> {
  console.log("Sending email request to:", `${API_URL}/api/send-email`); // Debug log
  const response = await fetch(`${API_URL}/api/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to send email");
  }

  return response.json();
}
