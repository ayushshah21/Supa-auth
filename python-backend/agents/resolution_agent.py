from dotenv import load_dotenv
import os
import uuid
from typing import List, Dict, Optional
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from langchain.schema.runnable import Runnable, RunnablePassthrough
from langsmith.run_helpers import traceable
from datetime import datetime
import json
import time
from utils.db import supabase
from utils.email_utils import send_email
from langsmith import Client
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.tracers import LangChainTracer
import asyncio

# Load environment variables
load_dotenv()

# Initialize LangSmith client with project
LANGSMITH_PROJECT = "ticket-resolution-project"
langsmith_client = Client()

# Create a tracer for the project
tracer = LangChainTracer(project_name=LANGSMITH_PROJECT, client=langsmith_client)
callback_manager = CallbackManager([tracer])

# Try to create project only if it doesn't exist
try:
    # First check if project exists
    projects = langsmith_client.list_projects()
    project_exists = any(p.name == LANGSMITH_PROJECT for p in projects)

    if not project_exists:
        langsmith_client.create_project(
            LANGSMITH_PROJECT,
            description="Ticket Resolution System - Tracking metrics for resolution accuracy and performance",
        )
        print(f"✓ Created new LangSmith project: {LANGSMITH_PROJECT}")
    else:
        print(f"✓ Using existing LangSmith project: {LANGSMITH_PROJECT}")
except Exception as e:
    print(f"Note: Using default project. Details: {str(e)}")


class ResolutionAgent:
    def __init__(self, callbacks=None):
        # Combine custom callbacks with our tracer
        self.combined_callbacks = [tracer]
        if callbacks:
            self.combined_callbacks.extend(callbacks)

        # Initialize the model with combined callbacks
        self.model = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            callbacks=self.combined_callbacks,
            tags=["ticket_resolution"],
        )

        # Set the project for tracing
        os.environ["LANGCHAIN_PROJECT"] = LANGSMITH_PROJECT
        os.environ["LANGCHAIN_TRACING_V2"] = "true"

        # Create a tracer for this instance
        self.client = Client()

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
        ).with_config(
            {"callbacks": self.combined_callbacks, "tags": ["ticket_resolution_chain"]}
        )

        # Initialize dataset if it doesn't exist
        try:
            langsmith_client.create_dataset(
                "ticket_resolutions",
                description="Ticket resolution examples for manual review and accuracy tracking",
            )
        except Exception as e:
            if "already exists" not in str(e).lower():
                print(f"Warning creating dataset: {str(e)}")

    async def _create_run_feedback(self, run_id: str, metrics: Dict):
        """Create comprehensive feedback for a run in LangSmith"""
        try:
            # Track all metrics
            for key, value in metrics.items():
                if isinstance(value, (int, float)):
                    langsmith_client.create_feedback(
                        run_id,
                        key=key,
                        score=float(value),
                        comment=self._get_metric_description(key),
                    )
                else:
                    langsmith_client.create_feedback(
                        run_id,
                        key=key,
                        value=str(value),
                        comment=self._get_metric_description(key),
                    )
        except Exception as e:
            print(f"Error creating run feedback: {str(e)}")

    def _get_metric_description(self, metric_key: str) -> str:
        """Get description for each metric type"""
        descriptions = {
            "action_correct": "Whether the agent correctly identified and took the appropriate action (1.0 = correct, 0.0 = incorrect)",
            "response_quality": "Quality of the response in terms of clarity and helpfulness (0.0-1.0)",
            "resolution_success": "Whether the issue was successfully resolved (1.0 = full success, 0.5 = partial, 0.0 = failed)",
            "latency_seconds": "Time taken to process the request in seconds",
            "error_type": "Type of error encountered during processing",
            "field_update_accuracy": "Accuracy of database field updates (1.0 = all correct, 0.0 = incorrect)",
        }
        return descriptions.get(metric_key, "Additional metric being tracked")

    @traceable(
        run_type="ticket_resolution", name="get_ticket_context", tags=["context"]
    )
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

            # Format the ticket context - omit customer info if unknown
            context = f"""
            Ticket Information:
            - ID: {ticket_data.get('id')}
            - Title: {ticket_data.get('title')}
            - Status: {ticket_data.get('status')}
            - Priority: {ticket_data.get('priority')}
            - Created: {ticket_data.get('created_at')}
            - Description: {ticket_data.get('description')}
            """

            # Only add customer info if it's known
            customer_name = ticket_data.get("customer", {}).get("name")
            customer_email = ticket_data.get("customer", {}).get("email")
            if (
                customer_name
                and customer_name.lower() != "unknown"
                and customer_email
                and customer_email.lower() != "unknown"
            ):
                context += f"""
                Customer Information:
                - Name: {customer_name}
                - Email: {customer_email}
                """

            # Add interactions if they exist
            interactions = self.format_interactions(ticket_data.get("interactions", []))
            if interactions != "No interactions recorded":
                context += f"""
                Recent Interactions:
                {interactions}
                """

            return context.strip()

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

    @traceable(run_type="ticket_resolution", name="resolve_ticket", tags=["resolution"])
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
                await self._create_run_feedback(
                    run_id=ticket_id,
                    metrics={"action_correct": 0.0, "error_type": "ticket_not_found"},
                )
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
            email_success = True
            if customer_email:
                email_success = await self.send_resolution_email(
                    to_email=customer_email,
                    ticket_title=ticket_data.get("title", ""),
                    resolution_text=resolution_text,
                    ticket_id=ticket_id,
                )
                if not email_success:
                    print("Warning: Failed to send resolution email")

            # Create feedback for the resolution
            await self._create_run_feedback(
                run_id=ticket_id,
                metrics={
                    "action_correct": 1.0,
                    "resolution_success": 1.0 if email_success else 0.5,
                    "response_quality": 1.0,
                    "resolution_response": resolution_text,
                },
            )

            return {
                "success": True,
                "message": f"Ticket resolved and customer notified at {customer_email}",
                "ticket_data": ticket_data,  # Return the full ticket data
                "email_sent": email_success,
            }

        except Exception as e:
            await self._create_run_feedback(
                run_id=ticket_id,
                metrics={
                    "action_correct": 0.0,
                    "error_type": "resolution_error",
                },
            )
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

    @traceable(run_type="ticket_resolution", name="process_command", tags=["command"])
    async def process_command(
        self, command: str, ticket_id: str, author_id: str
    ) -> Dict:
        """Process a natural language command to resolve a ticket"""
        start_time = time.time()
        error_type = None
        parent_run_id = None

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

            # Start async tracking in background
            asyncio.create_task(
                self._track_metrics(
                    ticket_id=ticket_id,
                    command=command,
                    resolution=resolution,
                    author_id=author_id,
                    start_time=start_time,
                )
            )

            # Return response immediately
            return {
                "success": True,
                "resolution": resolution,
                "ticket_id": ticket_id,
                "message": "Resolution in progress",
            }

        except Exception as e:
            print(f"Error processing command: {str(e)}")
            return {"success": False, "error": str(e)}

    async def _track_metrics(
        self,
        ticket_id: str,
        command: str,
        resolution: str,
        author_id: str,
        start_time: float,
    ):
        """Handle all the metrics tracking and LangSmith updates asynchronously"""
        try:
            # Create parent run
            try:
                parent_run = self.client.create_run(
                    name=f"Ticket Resolution - {ticket_id}",
                    run_type="chain",
                    inputs={"command": command, "ticket_id": ticket_id},
                    project_name=LANGSMITH_PROJECT,
                    tags=["ticket_resolution", "parent_run"],
                    metadata={
                        "ticket_id": ticket_id,
                        "author_id": author_id,
                        "start_time": datetime.now().isoformat(),
                    },
                )
                parent_run_id = parent_run.id if parent_run else None
                if parent_run_id:
                    self.client.update_run(run_id=parent_run_id, status="running")
            except Exception as e:
                print(f"Warning: Failed to create parent run: {str(e)}")
                parent_run_id = None

            # Resolve the ticket in background
            result = await self.resolve_ticket(ticket_id, resolution, author_id)

            # Calculate latency
            latency = time.time() - start_time

            # Update parent run with success metrics
            if parent_run_id:
                self.client.update_run(
                    run_id=parent_run_id,
                    status="completed",
                    outputs={
                        "resolution": resolution,
                        "success": result["success"],
                        "latency_seconds": latency,
                        "resolution_details": {
                            "new_status": "RESOLVED",
                            "resolved_at": datetime.utcnow().isoformat(),
                            "email_sent": result.get("email_sent", False),
                        },
                    },
                )

            # Add metrics
            await self._create_run_feedback(
                run_id=parent_run_id or ticket_id,
                metrics={
                    "action_correct": 1.0 if result["success"] else 0.0,
                    "response_quality": 1.0,
                    "latency_seconds": latency,
                    "field_update_accuracy": 1.0 if result["success"] else 0.0,
                    "resolution_response": resolution,
                },
            )

            # Add to annotation queue
            try:
                ticket_data = result.get("ticket_data", {})
                if ticket_data:
                    langsmith_client.create_example(
                        inputs={
                            "ticket_id": ticket_id,
                            "command": command,
                            "ticket_context": {
                                "title": ticket_data.get("title", ""),
                                "description": ticket_data.get("description", ""),
                                "priority": ticket_data.get("priority", ""),
                                "status": ticket_data.get("status", ""),
                                "created_at": ticket_data.get("created_at", ""),
                            },
                        },
                        outputs={
                            "resolution_text": resolution,
                            "success": result["success"],
                            "latency_seconds": latency,
                            "error_type": None,
                            "timestamp": datetime.utcnow().isoformat(),
                            "resolution_details": {
                                "new_status": "RESOLVED",
                                "resolved_at": datetime.utcnow().isoformat(),
                                "resolution_type": "AGENT_RESOLUTION",
                                "email_sent": result.get("email_sent", False),
                            },
                            "metrics_to_annotate": [
                                {
                                    "name": "response_quality",
                                    "description": "Rate the quality and appropriateness of the response (0-1)",
                                },
                                {
                                    "name": "action_correct",
                                    "description": "Was the correct action taken for this ticket? (0-1)",
                                },
                                {
                                    "name": "field_update_accuracy",
                                    "description": "Were all database fields updated correctly? (0-1)",
                                },
                            ],
                        },
                        dataset_name="ticket_resolutions",
                    )
                    print("Successfully added resolution to annotation queue")
            except Exception as e:
                print(f"Error adding to annotation queue: {str(e)}")

        except Exception as e:
            if parent_run_id:
                self.client.update_run(
                    run_id=parent_run_id,
                    status="failed",
                    error=str(e),
                    outputs={
                        "error_type": "background_processing_error",
                        "latency_seconds": time.time() - start_time,
                    },
                )
            print(f"Error in background metrics tracking: {str(e)}")
