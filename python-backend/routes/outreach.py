from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime
import uuid
from utils.email_utils import send_email
from utils.db import supabase
from agents import agent

router = APIRouter()


# Model definitions
class OutreachRequest(BaseModel):
    request: str
    customer_id: str
    options: Optional[dict] = None


class BatchOutreachRequest(BaseModel):
    users: List[Dict[str, str]]
    prompt: str
    options: Optional[Dict] = None

    class Config:
        extra = "allow"


class BatchOutreachResponse(BaseModel):
    drafts: List[Dict]
    metadata: Optional[Dict] = None


class UserSearchResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar_url: Optional[str] = None


class EmailDraft(BaseModel):
    userId: str
    content: str
    email: str
    subject: str


class BatchEmailRequest(BaseModel):
    drafts: List[EmailDraft]


class BatchEmailResponse(BaseModel):
    success: bool
    sent_count: int
    errors: Optional[List[Dict[str, str]]] = None


@router.post("/generate-outreach")
async def generate_outreach(request: OutreachRequest):
    """Generate a personalized outreach message for a single customer"""
    try:
        result = await agent.generate_outreach(
            request.request, request.customer_id, request.options
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-batch-outreach", response_model=BatchOutreachResponse)
async def generate_batch_outreach(request: BatchOutreachRequest):
    """Generate personalized outreach messages for multiple users"""
    print(f"\n=== Starting batch outreach generation ===")
    print(f"Request data: {request}")

    # Validate request data
    if not request.users:
        raise HTTPException(status_code=422, detail="No users provided in request")
    if not request.prompt:
        raise HTTPException(status_code=422, detail="No prompt provided in request")

    try:
        # Create a batch session to track this operation
        batch_id = str(uuid.uuid4())
        session_data = {
            "customer_ids": [user["id"] for user in request.users],
            "prompt": request.prompt,
            "timestamp": datetime.now().isoformat(),
        }

        # Create an outreach session for tracking
        session_response = (
            supabase.table("agent_outreach_sessions")
            .insert(
                {
                    "customer_id": request.users[0]["id"],  # Primary target
                    "status": "ACTIVE",
                    "session_goals": {
                        "type": "batch_outreach",
                        "prompt": request.prompt,
                        "target_count": len(request.users),
                    },
                    "metadata": {
                        "batch_id": batch_id,
                        "all_targets": [user["id"] for user in request.users],
                    },
                }
            )
            .execute()
        )

        session_id = session_response.data[0]["id"]

        # Format requests for the agent
        requests = [
            {"customer_id": user["id"], "request": request.prompt}
            for user in request.users
        ]

        # Generate drafts using the agent
        results = await agent.generate_batch_outreach(requests, request.options)

        # Store drafts in email_logs and prepare response
        drafts = []
        for user, result in zip(request.users, results):
            try:
                if "error" in result:
                    draft_content = f"Error: {result['error']}"
                    status = "error"
                else:
                    draft_content = result["response"]
                    status = "draft"

                # Log the email draft
                email_log = {
                    "recipient_email": user["email"],
                    "status": "FAILED",  # Start with FAILED
                    "ai_draft": draft_content,
                    "source": "AI",
                    "error_message": result.get("error") if "error" in result else None,
                    "created_at": datetime.now().isoformat(),
                }

                log_response = supabase.table("email_logs").insert(email_log).execute()

                drafts.append(
                    {
                        "userId": user["id"],
                        "content": draft_content,
                        "status": status,
                        "email_log_id": (
                            log_response.data[0]["id"] if log_response.data else None
                        ),
                    }
                )

            except Exception as e:
                print(f"Error processing result for user {user['id']}: {str(e)}")
                drafts.append(
                    {
                        "userId": user["id"],
                        "content": f"Error: {str(e)}",
                        "status": "error",
                    }
                )

        # Update session status
        supabase.table("agent_outreach_sessions").update(
            {
                "status": "COMPLETED",
                "completion_metrics": {
                    "total_processed": len(drafts),
                    "successful": len([d for d in drafts if d["status"] != "error"]),
                    "failed": len([d for d in drafts if d["status"] == "error"]),
                    "completed_at": datetime.now().isoformat(),
                },
            }
        ).eq("id", session_id).execute()

        response = BatchOutreachResponse(
            drafts=drafts,
            metadata={
                "batch_id": batch_id,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "total_drafts": len(drafts),
                "successful_drafts": len([d for d in drafts if d["status"] != "error"]),
            },
        )
        return response

    except Exception as e:
        print(f"Error in generate_batch_outreach: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback

        print(f"Traceback: {traceback.format_exc()}")

        # Update session status if we have a session_id
        if "session_id" in locals():
            try:
                supabase.table("agent_outreach_sessions").update(
                    {
                        "status": "FAILED",
                        "completion_metrics": {
                            "error": str(e),
                            "failed_at": datetime.now().isoformat(),
                        },
                    }
                ).eq("id", session_id).execute()
            except Exception as update_error:
                print(f"Error updating session status: {str(update_error)}")

        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customer-context/{customer_id}")
async def get_customer_context(customer_id: str):
    """Get the full context for a customer"""
    try:
        context = await agent.get_customer_context(customer_id)
        return {"context": context}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/engagement-metrics/{customer_id}")
async def get_engagement_metrics(customer_id: str):
    """Get engagement metrics for a customer"""
    try:
        # TODO: Implement actual metrics retrieval
        return {
            "metrics": {
                "response_rate": 0.85,
                "average_response_time": 3600,  # in seconds
                "preferred_times": ["morning", "evening"],
                "successful_styles": ["formal", "friendly"],
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/track-engagement")
async def track_engagement(customer_id: str, message_id: str, metrics: dict):
    """Track engagement metrics for a sent message"""
    try:
        # TODO: Implement actual metrics tracking
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/search", response_model=List[UserSearchResponse])
async def search_users(q: str = Query(..., min_length=1)):
    """Search for users by name or email"""
    print(f"\n=== Starting user search ===")
    print(f"Search query: {q}")

    try:
        # Search in Supabase using the correct OR syntax
        print("Executing Supabase query...")
        response = (
            supabase.table("users")
            .select("id, name, email, avatar_url")
            .ilike("name", f"%{q}%")
            .execute()
        )
        print(f"Raw Supabase response: {response}")

        name_matches = response.data if response and hasattr(response, "data") else []

        # Search by email in a separate query
        email_response = (
            supabase.table("users")
            .select("id, name, email, avatar_url")
            .ilike("email", f"%{q}%")
            .execute()
        )

        email_matches = (
            email_response.data
            if email_response and hasattr(email_response, "data")
            else []
        )

        # Combine and deduplicate results
        all_users = name_matches + [
            user
            for user in email_matches
            if user["id"] not in [u["id"] for u in name_matches]
        ]

        # Limit to 10 results
        users = all_users[:10]

        print(f"Found {len(users)} users")
        return [
            {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "avatar_url": user.get("avatar_url"),
            }
            for user in users
        ]

    except Exception as e:
        print(f"Error in search_users: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback

        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to search users: {str(e)}")


@router.post("/send-batch-emails", response_model=BatchEmailResponse)
async def send_batch_emails(request: BatchEmailRequest):
    """Send multiple emails to users"""
    try:
        sent_count = 0
        errors = []

        for draft in request.drafts:
            try:
                # Update existing email log or create new one
                email_log_data = {
                    "recipient_email": draft.email,
                    "status": "FAILED",  # Start with FAILED, update to SENT on success
                    "ai_draft": draft.content,
                    "source": "AI",
                    "sent_at": datetime.now().isoformat(),
                    "error_message": None,  # Will be updated if there's an error
                }

                # Try to send the email using the send_email function
                try:
                    await send_email(
                        to=draft.email,
                        subject=draft.subject,
                        body=draft.content,
                        ticket_id=draft.userId,  # Using userId as ticket_id for now
                    )

                    email_log_data["status"] = "SENT"
                    sent_count += 1
                    print(f"Successfully sent email to {draft.email}")

                except Exception as e:
                    error_msg = f"Failed to send email: {str(e)}"
                    print(error_msg)
                    email_log_data["error_message"] = error_msg
                    errors.append(
                        {
                            "userId": draft.userId,
                            "email": draft.email,
                            "error": error_msg,
                        }
                    )

                # Update or create email log
                supabase.table("email_logs").insert(email_log_data).execute()

            except Exception as e:
                print(f"Error processing draft for user {draft.userId}: {str(e)}")
                errors.append(
                    {"userId": draft.userId, "email": draft.email, "error": str(e)}
                )

        return BatchEmailResponse(
            success=len(errors) == 0,
            sent_count=sent_count,
            errors=errors if errors else None,
        )

    except Exception as e:
        print(f"Error in send_batch_emails: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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


@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """Get ticket data including customer information."""
    try:
        ticket_data = await get_ticket_data(ticket_id)
        if not ticket_data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return ticket_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
