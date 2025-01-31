import os
import base64
import aiohttp
from datetime import datetime
from fastapi import HTTPException
from typing import Optional
from dotenv import load_dotenv
from .db import supabase

# Load environment variables
load_dotenv()

# Email configuration
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = "ticketai.tech"
SENDER_EMAIL = f"postmaster@{MAILGUN_DOMAIN}"

# Frontend URL configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
DEFAULT_FRONTEND_URL = (
    "http://localhost:5173"
    if ENVIRONMENT == "development"
    else "https://ticket-ai-chi.vercel.app"
)
FRONTEND_URL = os.getenv("FRONTEND_URL", DEFAULT_FRONTEND_URL)

if not MAILGUN_API_KEY:
    raise ValueError(
        "Missing Mailgun API key. Please ensure MAILGUN_API_KEY is set in your .env file"
    )


async def send_email(
    to: str,
    subject: str,
    body: str,
    ticket_id: Optional[str] = None,
):
    """Send email using Mailgun API."""
    if not MAILGUN_API_KEY:
        raise HTTPException(status_code=500, detail="Mailgun API key not configured")

    # Create HTML email template with better styling and conditional ticket link
    email_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            .content {{
                color: #4a5568;
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 30px;
            }}
            .button {{
                background-color: #4f46e5;
                color: #ffffff !important;  /* Force white text */
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                display: inline-block;
                margin: 20px 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }}
            .button:hover {{
                background-color: #4338ca;
            }}
            .divider {{
                border-top: 1px solid #e2e8f0;
                margin: 20px 0;
            }}
            .footer {{
                color: #718096;
                font-size: 14px;
                text-align: center;
            }}
            .signature {{
                margin-top: 24px;
                color: #4a5568;
            }}
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; border-radius: 8px; padding: 40px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1a1a1a; margin: 0; font-size: 24px;">TicketAI Support</h1>
                </div>
                
                <div class="content">
                    {body}
                </div>

                <div class="divider"></div>

                <div style="text-align: center;">
                    {generate_action_button(ticket_id)}
                </div>
            </div>
            
            <div class="footer">
                <p style="margin: 5px 0;">This is an automated message from TicketAI Support System.</p>
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

                # Log email in the database only if ticket_id is provided
                if ticket_id:
                    try:
                        email_log = {
                            "ticket_id": ticket_id,
                            "recipient_email": to,
                            "sent_at": datetime.utcnow().isoformat(),
                            "status": "SENT",
                            "source": "AI",
                        }
                        supabase.table("email_logs").insert(email_log).execute()
                    except Exception as e:
                        print(f"Failed to log email: {e}")

                return await response.json()

        except aiohttp.ClientError as e:
            print(f"Email sending failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to send email")


def generate_action_button(ticket_id: Optional[str] = None) -> str:
    """Generate the appropriate action button based on whether a ticket_id is provided"""
    if ticket_id:
        # For resolution emails - link to specific ticket
        return f"""
        <a href="{FRONTEND_URL.rstrip('/')}/ticket/{ticket_id}" 
           class="button">
            View Ticket Details
        </a>
        """
    else:
        # For outreach emails - link directly to dashboard
        return f"""
        <a href="{FRONTEND_URL.rstrip('/')}/dashboard" 
           class="button">
            View Dashboard
        </a>
        """
