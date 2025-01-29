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

interface BatchOutreachRequest {
  users: {
    id: string;
    name: string;
    email: string;
  }[];
  prompt: string;
}

interface BatchOutreachResponse {
  drafts: {
    userId: string;
    content: string;
    status: "draft" | "edited" | "approved" | "sent";
  }[];
}

interface BatchEmailResponse {
  success: boolean;
  sent_count: number;
  errors?: { userId: string; error: string }[];
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

export async function generateBatchOutreach(
  request: BatchOutreachRequest,
): Promise<BatchOutreachResponse> {
  try {
    console.log("Starting batch outreach generation with request:", request);
    console.log("Users:", request.users);
    console.log("Prompt:", request.prompt);

    const response = await fetch(`${API_URL}/api/generate-batch-outreach`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    console.log("Response status:", response.status);
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        console.error("Parsed error data:", errorData);
        throw new Error(
          errorData.detail || "Failed to generate batch response",
        );
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    try {
      const data = JSON.parse(responseText);
      console.log("Parsed response data:", data);
      if (!data || !data.drafts) {
        throw new Error("Invalid response format from server");
      }
      return data;
    } catch (parseError) {
      console.error("Error parsing success response:", parseError);
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    console.error("Error in generateBatchOutreach:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to generate batch response");
  }
}

export async function sendBatchEmails(
  drafts: {
    userId: string;
    content: string;
    email: string;
    subject: string;
  }[],
): Promise<BatchEmailResponse> {
  try {
    const response = await fetch(`${API_URL}/api/send-batch-emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ drafts }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to send batch emails");
    }

    return response.json();
  } catch (error) {
    console.error("Error sending batch emails:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to send batch emails");
  }
}
