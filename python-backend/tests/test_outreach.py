import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone
import json

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

# Load and verify environment variables
env_path = Path(__file__).parent.parent / ".env"
print(f"Looking for .env file at: {env_path}")
load_dotenv(env_path)

# Debug environment variables
print("\nChecking environment variables:")
print(f"SUPABASE_URL: {'set' if os.getenv('SUPABASE_URL') else 'not set'}")
print(
    f"SUPABASE_SERVICE_ROLE_KEY: {'set' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else 'not set'}"
)
print(f"PINECONE_API_KEY: {'set' if os.getenv('PINECONE_API_KEY') else 'not set'}")
print(
    f"PINECONE_ENVIRONMENT: {'set' if os.getenv('PINECONE_ENVIRONMENT') else 'not set'}"
)
print(f"PINECONE_INDEX: {'set' if os.getenv('PINECONE_INDEX') else 'not set'}")

from agents.outreach_agent import OutreachAgent

# Constants
TEST_CUSTOMER_ID = "61fd0e93-5aad-4c4f-b550-40a2cddd8d6c"


async def test_pinecone_connection():
    """Test Pinecone connection and basic operations"""
    try:
        print("\n=== Testing Pinecone Connection ===")

        # Initialize Pinecone
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        print("✓ Pinecone initialized successfully")

        # Print available indexes
        indexes = pc.list_indexes()
        print(f"✓ Available Pinecone indexes: {indexes.names()}")

        # Get index stats
        index = pc.Index(os.getenv("PINECONE_INDEX"))
        stats = index.describe_index_stats()

        # Convert stats to dictionary
        stats_dict = {
            "namespaces": stats.namespaces,
            "dimension": stats.dimension,
            "index_fullness": stats.index_fullness,
            "total_vector_count": stats.total_vector_count,
        }
        print(f"✓ Index stats: {json.dumps(stats_dict, indent=2)}")

        return True
    except Exception as e:
        print(f"❌ Error testing Pinecone connection: {str(e)}")
        import traceback

        print(f"Traceback: {traceback.format_exc()}")
        return False


async def test_outreach_agent():
    """Test OutreachAgent functionality"""
    try:
        print("\n=== Testing OutreachAgent ===")
        agent = OutreachAgent()
        print("✓ OutreachAgent initialized successfully")

        # Test customer context retrieval
        print(f"\nTesting customer context retrieval for ID: {TEST_CUSTOMER_ID}")
        context = await agent.get_customer_context(TEST_CUSTOMER_ID)
        print(f"✓ Retrieved customer context: {json.dumps(context, indent=2)}")

        # Test interaction storage
        print("\nTesting interaction storage...")
        test_messages = [
            "Hello! I noticed you recently purchased our premium denim collection. How are you enjoying your new items?",
            "We have a special offer on winter jackets that matches your style preferences.",
            "Thank you for being a valued customer! We'd love to hear your feedback on your recent purchase.",
        ]

        for message in test_messages:
            print(f"\nStoring test message: {message[:50]}...")
            await agent.store_interaction(TEST_CUSTOMER_ID, message, True)
            print("✓ Stored successfully")

        # Test similar interaction retrieval
        print("\nTesting similar interaction retrieval...")
        test_queries = [
            "customer feedback request",
            "product recommendation",
            "purchase follow-up",
        ]

        for query in test_queries:
            print(f"\nSearching for interactions similar to: {query}")
            similar = await agent.get_similar_interactions(TEST_CUSTOMER_ID, query)
            print(f"✓ Found similar interactions: {similar}")

        return True
    except Exception as e:
        print(f"❌ Error testing OutreachAgent: {str(e)}")
        import traceback

        print(f"Traceback: {traceback.format_exc()}")
        return False


async def main():
    """Run all tests"""
    print("Starting tests...")

    # Test Pinecone connection
    pinecone_ok = await test_pinecone_connection()

    if pinecone_ok:
        # Test OutreachAgent
        agent_ok = await test_outreach_agent()

        if agent_ok:
            print("\n✅ All tests completed successfully!")
        else:
            print("\n❌ OutreachAgent tests failed")
    else:
        print("\n❌ Pinecone connection tests failed")


if __name__ == "__main__":
    asyncio.run(main())
