import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate
import time
import json
import base64
import aiohttp
from datetime import datetime
import re

# Load environment variables
load_dotenv()

# Email configuration
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = "ticketai.tech"  # Your domain
SENDER_EMAIL = f"postmaster@{MAILGUN_DOMAIN}"

# Validate API key format (optional but helpful)
if MAILGUN_API_KEY:
    is_valid_api_key = bool(
        re.match(r"^[a-f0-9]{32}-[a-f0-9]{8}-[a-f0-9]{8}$", MAILGUN_API_KEY)
    )
    if not is_valid_api_key:
        print("Warning: Mailgun API key format appears invalid")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Development
        "https://ticket-ai-chi.vercel.app",  # Production frontend
        "https://supa-auth.onrender.com",  # Render backend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", ""), os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
)

# Initialize OpenAI client through LangChain
llm = ChatOpenAI(
    model="gpt-4o-mini", temperature=0.7, openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Initialize ChatOpenAI
model = ChatOpenAI(model="gpt-4-0125-preview", temperature=0.7)


class GenerateRequest(BaseModel):
    query: str
    ticketId: Optional[str] = None


class OutreachRequest(BaseModel):
    query: str
    ticketId: Optional[str] = None


class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str
    ticketId: str


async def get_ticket_data(ticket_id: str):
    """Fetch ticket data from Supabase."""
    try:
        # First try to get the ticket with joined data
        response = (
            supabase.table("tickets")
            .select(
                """
                *,
                customer:users!tickets_customer_id_fkey (
                    id,
                    name,
                    email
                ),
                assigned_to:users!tickets_assigned_to_id_fkey (
                    id,
                    name,
                    email
                )
                """
            )
            .eq("id", ticket_id)
            .single()
            .execute()
        )

        ticket_data = response.data

        # If customer data is not properly joined, fetch it separately
        if (
            ticket_data
            and ticket_data.get("customer_id")
            and not ticket_data.get("customer")
        ):
            customer_response = (
                supabase.table("users")
                .select("id, name, email")
                .eq("id", ticket_data["customer_id"])
                .single()
                .execute()
            )
            if customer_response.data:
                ticket_data["customer"] = customer_response.data

        if not ticket_data:
            raise HTTPException(status_code=404, detail="Ticket not found")

        return ticket_data
    except Exception as e:
        print(f"Error fetching ticket data: {str(e)}")
        raise HTTPException(status_code=404, detail=f"Ticket not found: {str(e)}")


async def get_customer_history(customer_id: str):
    """Fetch customer's ticket history."""
    try:
        response = (
            supabase.table("tickets")
            .select(
                """
            *,
            customer:users!tickets_customer_id_fkey (
                id,
                name,
                email
            )
            """
            )
            .eq("customer_id", customer_id)
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        )

        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=404, detail=f"Customer history not found: {str(e)}"
        )


@app.post("/generate")
async def generate_response(req: GenerateRequest):
    """Generate a response using LangChain and ticket context."""
    try:
        # Base system message
        system_message = "You are an AI assistant for a clothing store's customer service team. Your task is to help draft professional and helpful responses to customer inquiries."

        # If we have a ticket ID, get the context
        if req.ticketId:
            ticket_data = await get_ticket_data(req.ticketId)
            if ticket_data:
                customer_history = await get_customer_history(
                    ticket_data["customer_id"]
                )

                # Add ticket context to system message
                system_message += f"""
                \nTicket Context:
                - Customer Name: {ticket_data["customer"]["name"]}
                - Customer Email: {ticket_data["customer"]["email"]}
                - Ticket Title: {ticket_data["title"]}
                - Ticket Description: {ticket_data["description"]}
                - Ticket Status: {ticket_data["status"]}
                - Ticket Priority: {ticket_data["priority"]}
                - Created At: {ticket_data["created_at"]}
                """

                if ticket_data.get("resolved_at"):
                    system_message += f"- Resolved At: {ticket_data['resolved_at']}\n"

                # Add customer history
                if customer_history:
                    history_text = "\nCustomer History:\n"
                    for ticket in customer_history:
                        history_text += f"- {ticket['created_at']}: {ticket['title']}\n"
                    system_message += history_text

                system_message += "\nAlways use the customer's name and reference their specific ticket details in your response. Be empathetic and solution-focused."

        # Generate response using LangChain
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=req.query),
        ]

        response = llm.generate([messages])
        generated_text = response.generations[0][0].text

        return {"response": generated_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-outreach")
async def generate_outreach_response(request: OutreachRequest):
    try:
        start_time = time.time()
        context = {}
        assigned_user_id = None

        # If ticketId is provided, fetch comprehensive ticket information
        if request.ticketId:
            print(f"Fetching data for ticket: {request.ticketId}")
            ticket_data = (
                supabase.table("tickets")
                .select(
                    """
                    *,
                    users!tickets_customer_id_fkey (
                        id,
                        name,
                        email,
                        role
                    ),
                    users!tickets_assigned_to_id_fkey (
                        id,
                        name,
                        email
                    ),
                    teams!tickets_team_id_fkey (
                        id,
                        name
                    ),
                    ticket_tags (
                        tags (
                            name,
                            description
                        )
                    )
                    """
                )
                .eq("id", request.ticketId)
                .single()
                .execute()
            )

            if ticket_data.data:
                context["ticket"] = ticket_data.data
                # Get assigned_user_id from the assigned_to relationship
                assigned_user_id = ticket_data.data.get("assigned_to_id")

                # Debug log for customer information
                customer_data = ticket_data.data.get("users", {})
                customer_name = customer_data.get("name")
                print(f"Raw ticket data: {json.dumps(ticket_data.data, indent=2)}")

                # Fallback query if the join didn't work
                try:
                    customer = (
                        supabase.table("users")
                        .select("name, email, role")
                        .eq("id", ticket_data.data.get("customer_id"))
                        .single()
                        .execute()
                    )
                    if customer.data:
                        context["ticket"]["customer"] = customer.data
                        customer_name = customer.data.get("name")
                        print(
                            f"Retrieved customer data through fallback - Name: {customer_name}"
                        )
                except Exception as e:
                    print(f"Failed to fetch customer data: {e}")

                if not customer_name:
                    print("Warning: No customer name found in ticket data")

                # Fetch recent interactions
                interactions = (
                    supabase.table("interactions")
                    .select("*")
                    .eq("ticket_id", request.ticketId)
                    .order("created_at", desc=True)
                    .limit(5)
                    .execute()
                )
                if interactions.data:
                    context["recent_interactions"] = interactions.data

                # Fetch customer's ticket history
                if context["ticket"].get("customer_id"):
                    customer_history = (
                        supabase.table("tickets")
                        .select("id, title, status, created_at")
                        .eq("customer_id", context["ticket"]["customer_id"])
                        .order("created_at", desc=True)
                        .limit(5)
                        .execute()
                    )
                    if customer_history.data:
                        context["customer_history"] = customer_history.data

        # Create prompt template with detailed context
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a helpful customer service agent for a clothing store, representing Ticket.ai. 
                Generate a professional and empathetic response based on the following context.
                
                Guidelines:
                - ALWAYS start with "Hello [Full Name]," - for example "Hello John Smith," (using their exact name from context.ticket.customer.name)
                - Never use generic greetings like "Hello" or "Dear Customer"
                - If no customer name is found (which shouldn't happen), alert the user with "ERROR: No customer name found"
                - Reference relevant ticket history if provided
                - Maintain a professional but friendly tone
                - Include specific details from the ticket when relevant
                - If tags are present, consider their context in the response
                - Sign off simply as "Ticket.ai" with no additional text
                - Don't include placeholder information like [Phone Number] or [Email]
                - For contact information, simply say "please don't hesitate to contact us" without specific methods
                - Keep the response focused on actual available information from the context
                """,
                ),
                (
                    "user",
                    """Context Information:
                {context}
                
                Query: {query}
                
                Generate a response:""",
                ),
            ]
        )

        # Format messages and get response
        messages = prompt.format_messages(
            context=json.dumps(context, indent=2), query=request.query
        )

        response = model.invoke(messages)

        # Log the agent interaction only if we have an assigned user
        if assigned_user_id:  # Only log if we have a valid user_id
            time_taken = (time.time() - start_time) * 1000  # Convert to milliseconds
            log_entry = {
                "user_id": assigned_user_id,  # Use the actual assigned user ID
                "query": request.query,
                "output": response.content,
                "time_taken_ms": time_taken,
                "ticket_id": request.ticketId,
                "success": True,
            }

            try:
                supabase.table("agent_logs").insert(log_entry).execute()
            except Exception as log_error:
                print(f"Failed to log agent interaction: {log_error}")
                # Continue execution even if logging fails

        return {"response": response.content}

    except Exception as e:
        # Log error only if we have a ticket ID and user ID
        if request.ticketId and assigned_user_id:
            error_log = {
                "user_id": assigned_user_id,
                "query": request.query,
                "output": str(e),
                "time_taken_ms": (time.time() - start_time) * 1000,
                "ticket_id": request.ticketId,
                "success": False,
                "error_type": type(e).__name__,
            }
            try:
                supabase.table("agent_logs").insert(error_log).execute()
            except Exception as log_error:
                print(f"Failed to log error: {log_error}")

        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


async def send_email(
    to: str,
    subject: str,
    body: str,
    ticket_id: str,
    origin: str = "http://localhost:5173",
):
    """Send email using Mailgun API."""
    if not MAILGUN_API_KEY:
        raise HTTPException(status_code=500, detail="Mailgun API key not configured")

    ticket_url = f"{origin}/ticket/{ticket_id}"

    # Create HTML email template
    email_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 40px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; margin: 0; font-size: 24px;">TicketAI Support</h1>
                </div>
                <div style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    {body}
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="{ticket_url}" 
                       style="display: inline-block; 
                              background-color: #4f46e5; 
                              color: white; 
                              padding: 12px 24px; 
                              text-decoration: none; 
                              border-radius: 6px; 
                              font-weight: 500;">
                        View Ticket Details
                    </a>
                </div>
            </div>
            <div style="text-align: center; color: #718096; font-size: 14px; margin-top: 20px;">
                <p style="margin: 0;">This is an automated message from TicketAI Support System.</p>
                <p style="margin: 5px 0;">Please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Prepare authentication
    auth = base64.b64encode(f"api:{MAILGUN_API_KEY}".encode()).decode()

    # Prepare form data
    data = {"from": SENDER_EMAIL, "to": to, "subject": subject, "html": email_body}

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
                headers={"Authorization": f"Basic {auth}"},
                data=data,
            ) as response:
                response_text = await response.text()

                if not response.ok:
                    print(f"Mailgun API error: {response.status} - {response_text}")
                    if response.status == 401:
                        raise HTTPException(
                            status_code=401,
                            detail="Email service authentication failed",
                        )
                    elif response.status == 429:
                        raise HTTPException(
                            status_code=429, detail="Email rate limit exceeded"
                        )
                    else:
                        raise HTTPException(
                            status_code=500,
                            detail=f"Failed to send email: {response_text}",
                        )

                # Log email in the database
                try:
                    email_log = {
                        "ticket_id": ticket_id,
                        "recipient_email": to,
                        "sent_at": datetime.utcnow().isoformat(),
                        "status": "SENT",
                        "source": "AI",  # Changed from 'AI_GENERATED' to 'AI' to match constraint
                    }
                    supabase.table("email_logs").insert(email_log).execute()
                except Exception as e:
                    print(f"Failed to log email: {e}")

                return await response.json()

        except aiohttp.ClientError as e:
            print(f"Email sending failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to send email")


@app.post("/api/send-email")
async def handle_send_email(request: EmailRequest):
    """Handle email sending request."""
    try:
        result = await send_email(
            to=request.to,
            subject=request.subject,
            body=request.body,
            ticket_id=request.ticketId,
        )
        return {
            "success": True,
            "message": "Email sent successfully",
            "id": result.get("id"),
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """Get ticket data including customer information."""
    try:
        ticket_data = await get_ticket_data(ticket_id)
        if not ticket_data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return ticket_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
