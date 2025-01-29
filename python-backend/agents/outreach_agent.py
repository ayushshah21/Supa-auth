from dotenv import load_dotenv
import os

# Load environment variables at the very beginning
load_dotenv()

from typing import List, Dict, Optional
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from langchain.schema.runnable import Runnable, RunnablePassthrough
from langchain.smith import RunEvalConfig, run_on_dataset
from langsmith.run_helpers import traceable
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Pinecone
from pinecone import Pinecone as PineconeClient
from datetime import datetime
import json
from utils.db import supabase

# Initialize Pinecone
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index_name = os.getenv("PINECONE_INDEX", "ticket-ai")

if not pinecone_api_key:
    raise ValueError(
        "Missing Pinecone API key. Please ensure PINECONE_API_KEY is set in your .env file"
    )

# Initialize Pinecone client
pc = PineconeClient(api_key=pinecone_api_key)

# Initialize embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
)


class OutreachAgent:
    def __init__(self):
        # Initialize the model
        self.model = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

        # Initialize vector store
        try:
            self.vector_store = Pinecone.from_existing_index(
                index_name=pinecone_index_name,
                embedding=embeddings,
                namespace="outreach",
            )
            print(f"✓ Successfully connected to Pinecone index: {pinecone_index_name}")
        except Exception as e:
            print(f"Error initializing Pinecone: {e}")
            raise

        # Define the base prompt template
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are an intelligent customer engagement agent for a clothing CRM system.
            Your task is to generate personalized messages that consider the customer's full context.
            
            Guidelines:
            - Maintain a professional yet warm tone
            - Include specific details from the customer's history
            - Reference past interactions when relevant
            - Ensure the message aligns with the brand voice
            - Consider the customer's preferences and past engagement patterns
            
            Context Sections:
            {db_context}
            
            Similar Successful Interactions:
            {similar_interactions}
            """,
                ),
                ("human", "{request}"),
            ]
        )

        # Define the chain
        self.chain = (
            {
                "db_context": lambda x: self.get_customer_context(x["customer_id"]),
                "similar_interactions": lambda x: self.get_similar_interactions(
                    x["customer_id"], x["request"]
                ),
                "request": lambda x: x["request"],
            }
            | self.prompt
            | self.model
            | StrOutputParser()
        )

    @traceable(run_type="customer_context")
    async def get_customer_context(self, customer_id: str) -> str:
        """Fetch comprehensive customer context from Supabase"""
        try:
            # Fetch user data with preferences
            user_response = (
                supabase.table("users")
                .select("*, preferences")
                .eq("id", customer_id)
                .single()
                .execute()
            )

            if not user_response or not user_response.data:
                print(f"No user found for ID: {customer_id}")
                return "No user data available"

            user_data = user_response.data
            print(f"Retrieved user data for {customer_id}: {user_data}")  # Debug log

            # Fetch tickets first since they're most important
            tickets_response = (
                supabase.table("tickets")
                .select("*")
                .eq("customer_id", customer_id)
                .order("created_at", desc=True)
                .limit(5)
                .execute()
            )

            tickets = []
            if tickets_response and hasattr(tickets_response, "data"):
                tickets = tickets_response.data
                print(
                    f"Found {len(tickets)} tickets for user {customer_id}"
                )  # Debug log
            else:
                print(f"No tickets found for user {customer_id}")  # Debug log

            # Fetch recent interactions
            interactions_response = (
                supabase.table("interactions")
                .select("*")
                .eq("author_id", customer_id)
                .order("created_at", desc=True)
                .limit(5)
                .execute()
            )

            recent_interactions = []
            if interactions_response and hasattr(interactions_response, "data"):
                recent_interactions = interactions_response.data
                print(
                    f"Found {len(recent_interactions)} interactions for user {customer_id}"
                )  # Debug log
            else:
                print(f"No interactions found for user {customer_id}")  # Debug log

            # Format context with more structure and handle missing data
            context = f"""
            Customer Profile:
            - Name: {user_data.get('name', 'Unknown')}
            - Email: {user_data.get('email', 'Unknown')}
            
            Active Tickets:
            {self.format_tickets(tickets) if tickets else "No active tickets found"}
            
            Recent Interactions:
            {self.format_interactions(recent_interactions) if recent_interactions else "No recent interactions found"}
            
            Customer Preferences:
            {json.dumps(user_data.get('preferences', {}), indent=2) if user_data.get('preferences') else "No specific preferences recorded"}
            """

            return context

        except Exception as e:
            print(f"Error fetching customer context: {str(e)}")
            import traceback

            print(f"Traceback: {traceback.format_exc()}")
            return f"Error fetching customer data: {str(e)}"

    def format_interactions(self, interactions: List[Dict]) -> str:
        """Format interactions in a readable way with better null handling"""
        if not interactions:
            return "No recent interactions"

        formatted = []
        for interaction in interactions:
            if interaction is None:
                continue

            # Safely get values with defaults
            created_at = interaction.get("created_at", "Unknown date")
            interaction_type = interaction.get("type", "Unknown type")
            content = interaction.get("content", "No content")

            # Safely handle nested metadata
            metadata = interaction.get("metadata", {})
            success = (
                "Unknown" if metadata is None else metadata.get("success", "Unknown")
            )

            formatted.append(
                f"""
            Date: {created_at}
            Type: {interaction_type}
            Content: {content}
            Success: {success}
            """
            )

        return "\n".join(formatted) if formatted else "No valid interactions found"

    def format_tickets(self, tickets: List[Dict]) -> str:
        """Format tickets in a readable way, organizing by status and highlighting purchases"""
        if not tickets:
            return "No recent tickets"

        # Separate tickets by status
        open_tickets = []
        resolved_tickets = []
        purchase_history = []

        for ticket in tickets:
            status = ticket.get("status", "").upper()
            tags = [
                tag["tags"]["name"]
                for tag in ticket.get("ticket_tags", [])
                if tag.get("tags")
            ]

            formatted_ticket = f"""
            Title: {ticket.get('title')}
            Status: {status}
            Priority: {ticket.get('priority')}
            Created: {ticket.get('created_at')}
            Tags: {', '.join(tags) if tags else 'None'}
            Description: {ticket.get('description')}
            """

            # Categorize tickets
            if "PURCHASE" in tags or "ORDER" in tags:
                purchase_history.append(formatted_ticket)
            elif status in ["RESOLVED", "CLOSED", "COMPLETED"]:
                resolved_tickets.append(formatted_ticket)
            else:
                open_tickets.append(formatted_ticket)

        # Combine sections with headers
        sections = []
        if open_tickets:
            sections.append("=== Open Tickets ===\n" + "\n".join(open_tickets))
        if purchase_history:
            sections.append("=== Purchase History ===\n" + "\n".join(purchase_history))
        if resolved_tickets:
            sections.append("=== Recently Resolved ===\n" + "\n".join(resolved_tickets))

        return "\n\n".join(sections)

    @traceable(run_type="similar_interactions")
    async def get_similar_interactions(self, customer_id: str, query: str) -> str:
        """Find similar successful interactions from Pinecone"""
        try:
            # Search for similar interactions
            results = self.vector_store.similarity_search(
                query, filter={"customer_id": customer_id, "success": True}, k=3
            )

            return "\n".join(str(r.page_content) for r in results)

        except Exception as e:
            print(f"Error finding similar interactions: {str(e)}")
            return "No similar interactions found"

    @traceable(run_type="store_interaction")
    async def store_interaction(self, customer_id: str, message: str, success: bool):
        """Store interaction in both Supabase and Pinecone"""
        try:
            # Store in Supabase
            interaction_data = {
                "author_id": customer_id,
                "content": message,
                "type": "outreach",
                "metadata": {
                    "success": success,
                    "timestamp": datetime.now().isoformat(),
                },
            }
            supabase.table("interactions").insert(interaction_data).execute()

            # Store in Pinecone
            vector = embeddings.embed_query(message)
            self.vector_store.add_texts(
                texts=[message],
                metadatas=[
                    {
                        "customer_id": customer_id,
                        "success": success,
                        "timestamp": datetime.now().isoformat(),
                    }
                ],
                embeddings=[vector],
            )

        except Exception as e:
            print(f"Error storing interaction: {str(e)}")

    @traceable(run_type="generate_outreach")
    async def generate_outreach(
        self, request: str, customer_id: str, options: Optional[Dict] = None
    ) -> Dict:
        """Generate a personalized outreach message"""
        try:
            start_time = datetime.now()

            result = await self.chain.ainvoke(
                {
                    "request": request,
                    "customer_id": customer_id,
                    "options": options or {},
                }
            )

            response_time = (datetime.now() - start_time).total_seconds()

            # Store the interaction
            await self.store_interaction(customer_id, result, True)

            return {
                "response": result,
                "metadata": {
                    "response_time": response_time,
                    "model_used": "gpt-4o-mini",
                    "timestamp": datetime.now().isoformat(),
                },
            }

        except Exception as e:
            await self.store_interaction(customer_id, str(e), False)
            print(f"Error generating outreach: {str(e)}")
            raise

    @traceable(run_type="batch_outreach")
    async def generate_batch_outreach(
        self, requests: List[Dict], options: Optional[Dict] = None
    ) -> List[Dict]:
        """Generate personalized outreach messages for multiple users"""
        results = []
        for request in requests:
            try:
                # Get customer context
                context = await self.get_customer_context(request["customer_id"])

                if context == "No user data available":
                    raise ValueError(
                        f"No user data found for customer {request['customer_id']}"
                    )

                # Create prompt template with stronger emphasis on using actual data
                prompt = ChatPromptTemplate.from_messages(
                    [
                        (
                            "system",
                            """You are a proactive customer engagement agent for a clothing store, representing Ticket.ai. 
                Your primary goals are to:
                1. Follow up on UNRESOLVED tickets that need attention
                2. Turn past purchases into opportunities for personalized recommendations
                3. Drive engagement and sales while maintaining excellent customer service
                
                Guidelines:
                - ALWAYS start with "Hello [Full Name]," using their exact name
                - Only mention UNRESOLVED tickets that need attention - do not bring up resolved issues
                - Use past purchases and preferences to make relevant product recommendations
                - Look for opportunities to suggest complementary items or new arrivals
                - Be professional, friendly, and sales-oriented while addressing any outstanding concerns
                - Keep the focus positive and forward-looking
                - Sign off as "Ticket.ai"
                
                IMPORTANT:
                - Check ticket status before mentioning any issues
                - Never fabricate product recommendations - use actual customer history
                - If making suggestions, tie them to their demonstrated preferences
                - Balance addressing open issues with creating sales opportunities
                """,
                        ),
                        (
                            "user",
                            """Customer Context:
                {context}
                
                Query to respond to: {query}
                
                Remember: Focus on unresolved issues and sales opportunities based on their actual history.
                Generate a response:""",
                        ),
                    ]
                )

                # Format messages and get response
                messages = prompt.format_messages(
                    context=context, query=request["request"]
                )

                response = await self.model.ainvoke(messages)

                results.append(
                    {
                        "customer_id": request["customer_id"],
                        "response": response.content,
                        "metadata": {
                            "timestamp": datetime.now().isoformat(),
                            "model": "gpt-4o-mini",
                        },
                    }
                )

            except Exception as e:
                print(
                    f"Error generating outreach for customer {request['customer_id']}: {str(e)}"
                )
                results.append({"customer_id": request["customer_id"], "error": str(e)})

        return results

    def evaluate_performance(self, eval_dataset: List[Dict]):
        """Evaluate agent performance on a test dataset"""
        eval_config = RunEvalConfig(
            evaluators=[
                "qa",  # Checks if the response answers the query
                "criteria",  # Checks if response meets specified criteria
            ],
            custom_evaluators=[
                # Add custom evaluators for:
                # - Tone consistency
                # - Personal detail inclusion
                # - Brand voice alignment
            ],
        )

        # Run evaluation
        eval_results = run_on_dataset(
            client=self.tracer.client,
            dataset=eval_dataset,
            llm_or_chain=self.chain,
            evaluation=eval_config,
            project_name="outreach_gpt_eval",
        )

        return eval_results
