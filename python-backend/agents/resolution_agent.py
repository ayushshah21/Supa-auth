from dotenv import load_dotenv
import os
import uuid
from typing import List, Dict, Optional
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from langchain.schema.runnable import Runnable, RunnablePassthrough
from langsmith.run_helpers import traceable
from datetime import datetime
import json
from utils.db import supabase
from utils.email_utils import send_email


class ResolutionAgent:
    def __init__(self, callbacks=None):
        # Initialize the model with callbacks if provided
        self.model = ChatOpenAI(
            model="gpt-4o-mini", temperature=0.7, callbacks=callbacks
        )

        # Define the base prompt template for ticket resolution
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a customer service resolution agent. Generate concise, direct responses.
                Focus on:
                1. The actual resolution
                2. Clear next steps for the customer
                3. Any follow-up actions needed

                DO NOT:
                - Use placeholders like [Your Name]
                - Use meta-language about what you're going to do
                - Include unnecessary formatting
                - Repeat phrases about contacting for assistance
                - Include multiple signatures or closings

                Structure your response as:
                1. Main resolution message
                2. Next steps (if any)
                3. Single closing with "Best regards, TicketAI"

                Keep the message clear and avoid redundancy.
                """,
                ),
                ("human", "{command}"),
            ]
        )

        # Define the chain with callbacks
        self.chain = (
            {
                "ticket_context": RunnablePassthrough(),
                "customer_history": RunnablePassthrough(),
                "command": lambda x: x["command"],
            }
            | self.prompt
            | self.model
            | StrOutputParser()
        )

    @traceable(run_type="ticket_resolution")
    async def get_ticket_context(self, ticket_id: str) -> str:
        """Fetch comprehensive ticket context from Supabase"""
        try:
            # First check if ticket exists
            ticket_response = (
                supabase.table("tickets")
                .select("*")
                .eq("id", ticket_id)
                .single()
                .execute()
            )

            if not ticket_response.data:
                return f"No ticket found with ID: {ticket_id}"

            ticket_data = ticket_response.data

            # Format the ticket context
            context = f"""
            Ticket Information:
            - ID: {ticket_data.get('id')}
            - Title: {ticket_data.get('title')}
            - Status: {ticket_data.get('status')}
            - Priority: {ticket_data.get('priority')}
            - Created: {ticket_data.get('created_at')}
            - Description: {ticket_data.get('description')}

            Customer Information:
            - Name: {ticket_data.get('customer', {}).get('name', 'Unknown')}
            - Email: {ticket_data.get('customer', {}).get('email', 'Unknown')}

            Recent Interactions:
            {self.format_interactions(ticket_data.get('interactions', []))}
            """

            return context

        except Exception as e:
            print(f"Error fetching ticket context: {str(e)}")
            return f"Error: Could not find ticket with ID {ticket_id}"

    def format_interactions(self, interactions: List[Dict]) -> str:
        """Format interactions in a readable way"""
        if not interactions:
            return "No interactions recorded"

        formatted = []
        for interaction in interactions:
            created_at = interaction.get("created_at", "Unknown date")
            interaction_type = interaction.get("type", "Unknown type")
            content = interaction.get("content", {})

            formatted.append(
                f"""
            Date: {created_at}
            Type: {interaction_type}
            Content: {json.dumps(content, indent=2)}
            """
            )

        return "\n".join(formatted)

    @traceable(run_type="resolve_ticket")
    async def resolve_ticket(
        self, ticket_id: str, resolution_text: str, author_id: str
    ) -> Dict:
        """Resolve a ticket and create appropriate interactions"""
        try:
            # 1. Get ticket and customer info
            ticket_response = (
                supabase.table("tickets")
                .select("*, customer:customer_id(*)")
                .eq("id", ticket_id)
                .single()
                .execute()
            )

            if not ticket_response.data:
                return {"success": False, "error": "Ticket not found"}

            ticket_data = ticket_response.data
            customer_email = ticket_data.get("customer", {}).get("email")

            # 2. Update ticket status
            ticket_update = (
                supabase.table("tickets")
                .update(
                    {
                        "status": "RESOLVED",
                        "resolved_at": datetime.utcnow().isoformat(),
                    }
                )
                .eq("id", ticket_id)
                .execute()
            )

            # 3. Create AGENT_RESOLUTION interaction
            interaction_data = {
                "ticket_id": ticket_id,
                "author_id": author_id,
                "type": "AGENT_RESOLUTION",
                "content": {"resolution_text": resolution_text, "automated": True},
            }

            interaction_insert = (
                supabase.table("interactions").insert(interaction_data).execute()
            )

            # 4. Send email to customer
            if customer_email:
                email_sent = await self.send_resolution_email(
                    to_email=customer_email,
                    ticket_title=ticket_data.get("title", ""),
                    resolution_text=resolution_text,
                    ticket_id=ticket_id,
                )
                if not email_sent:
                    print("Warning: Failed to send resolution email")

            return {
                "success": True,
                "message": f"Ticket resolved and customer notified at {customer_email}",
                "ticket": ticket_update.data if ticket_update else None,
                "interaction": interaction_insert.data if interaction_insert else None,
            }

        except Exception as e:
            print(f"Error resolving ticket: {str(e)}")
            return {"success": False, "error": str(e)}

    async def send_resolution_email(
        self, to_email: str, ticket_title: str, resolution_text: str, ticket_id: str
    ):
        """Send resolution email to customer using Mailgun"""
        try:
            subject = f"Resolution: {ticket_title}"

            # Clean up resolution text to remove any duplicate closings
            cleaned_resolution = (
                resolution_text.replace("Best regards,\nTicketAI", "")
                .replace("If you have any questions", "")
                .strip()
            )

            email_body = f"""
            <h2 style="color: #2d3748; margin-bottom: 20px;">Dear Customer,</h2>
            
            <div style="margin-bottom: 24px;">
                {cleaned_resolution}
            </div>
            
            <div class="signature">
                Best regards,<br>
                TicketAI
            </div>
            """

            await send_email(
                to=to_email,
                subject=subject,
                body=email_body,
                ticket_id=ticket_id,
            )
            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

    @traceable(run_type="process_command")
    async def process_command(
        self, command: str, ticket_id: str, author_id: str
    ) -> Dict:
        """Process a natural language command to resolve a ticket"""
        try:
            # Get context using the provided ticket_id directly
            ticket_context = await self.get_ticket_context(ticket_id)

            if "No ticket found" in ticket_context:
                return {"success": False, "error": f"Ticket not found: {ticket_id}"}

            # Generate resolution using the chain
            resolution = await self.chain.ainvoke(
                {
                    "ticket_context": ticket_context,
                    "customer_history": "Customer history will be implemented",
                    "command": command,
                }
            )

            # Resolve the ticket
            result = await self.resolve_ticket(ticket_id, resolution, author_id)

            return {
                "success": result["success"],
                "resolution": resolution,
                "ticket_id": ticket_id,
                **result,
            }

        except Exception as e:
            print(f"Error processing command: {str(e)}")
            return {"success": False, "error": str(e)}
