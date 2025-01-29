# Building a Context-Aware Outreach Agent for Clothing CRM

This document provides a comprehensive guide for building OutreachGPT, an intelligent agent workflow for your clothing retail CRM using LangChain, LangSmith, and LangGraph. This agent automates personalized customer communications based on purchase history, support tickets, and customer interactions.

## Feature Overview: OutreachGPT

What's one of the most time-consuming parts of customer service? Crafting personalized, context-aware messages that strike the right tone and include relevant details about orders, returns, and customer preferences. While template emails exist, they often feel generic and miss important context from the customer's shopping journey.

OutreachGPT transforms your communication workflow by:
- Generating personalized responses to customer inquiries
- Considering past purchase history and support tickets
- Understanding product preferences and sizing information
- Maintaining consistent tone and brand voice
- Tracking customer satisfaction and response patterns

### Example Use Case

Instead of copying and pasting templates, a customer service representative clicks the OutreachGPT icon and says "Draft a follow-up email for Sarah Miller about her recent return request for the blue summer dress, mentioning our new collection that matches her style preferences." The system crafts a personalized message that:
- References the specific return case
- Pulls relevant details from her purchase history
- Suggests similar items from new collections
- Maintains the brand's tone of voice
- Includes specific talking points based on her shopping preferences

## Technical Implementation

### I. Core Technologies

#### LangChain
- Models: `langchain_community.chat_models`
- Prompts: `langchain.prompts`
- Chains: `langchain.chains`
- Memory: `langchain.memory`
- Tools: `langchain.tools`
- Agents: `langchain.agents`
- Output Parsers: `langchain.output_parsers`
- Retrievers: `langchain.retrievers`

#### LangSmith
- Tracing and debugging
- Evaluation metrics
- Production monitoring

#### LangGraph
- Workflow definition
- State management
- Human-in-the-loop approvals

### II. Environment Setup

\`\`\`bash
pip install langchain langchain-openai langchain-community langchainhub httpx tiktoken tenacity langsmith
\`\`\`

Required environment variables:
\`\`\`
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LANGCHAIN_API_KEY=your_langsmith_key
\`\`\`

### III. Core Components

#### 1. Database Access (Supabase)

\`\`\`python
from langchain_community.utilities import SQLDatabase
from sqlalchemy import create_engine

def get_sql_db():
    """Set up SQL Database connection to Supabase"""
    DATABASE_URL = os.getenv("SUPABASE_URL")
    engine = create_engine(DATABASE_URL)
    db = SQLDatabase(engine)
    return db
\`\`\`

#### 2. Email Tool

\`\`\`python
from langchain.tools import tool
from smtplib import SMTP_SSL
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Sends an email to a customer"""
    EMAIL_SENDER = os.getenv("EMAIL_SENDER")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
    
    msg = MIMEMultipart()
    msg['From'] = EMAIL_SENDER
    msg['To'] = to
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
        return f"Successfully sent email to {to}"
    except Exception as e:
        return f"Failed to send email to {to}: {e}"
\`\`\`

#### 3. Prompt Templates

\`\`\`python
SQL_PROMPT = PromptTemplate.from_template(
    """Given an input question, create a syntactically correct SQLite query to run.
    Pay attention to use only the column names you can see in the tables below.
    
    Tables:
    - customers (id, name, email, preferences, size_info)
    - orders (id, customer_id, status, created_at)
    - tickets (id, customer_id, type, status, description)
    - products (id, name, category, size, color)
    
    Question: {question}
    SQL Query:"""
)

EMAIL_TEMPLATE = PromptTemplate.from_template(
    """You are a helpful customer service agent for a clothing store.
    
    Customer Information:
    {customer_info}
    
    Recent Interactions:
    {history}
    
    Based on the above info, draft a personalized email addressing their inquiry.
    Include relevant details about their orders, preferences, or tickets.
    
    Email draft:"""
)
\`\`\`

### IV. Agent Implementation

\`\`\`python
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import BaseMessage, AIMessage
from langgraph.graph import StateGraph, END

class AgentState:
    """Represents the state of our customer service agent."""
    chat_history: List[BaseMessage]
    customer_info: dict
    current_ticket: dict | None = None
    
def create_agent(tools):
    """Creates the agent with access to tools and customer context."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful customer service agent for a clothing store."),
        MessagesPlaceholder(variable_name="chat_history"),
        ["human", "{input}"],
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    
    llm_with_tools = model.bind_tools(tools)
    return RunnableSequence.from([
        {
            "input": lambda x: x.task,
            "agent_scratchpad": lambda x: format_agent_steps(x.intermediate_steps),
            "chat_history": lambda x: x.chat_history
        },
        prompt,
        llm_with_tools,
        OpenAIFunctionsAgentOutputParser(),
    ])
\`\`\`

### V. Evaluation Metrics

Key metrics to track in LangSmith:

1. Response Accuracy
   - Correct identification of customer issue
   - Accurate product recommendations
   - Proper handling of size/color preferences

2. Personalization Quality
   - Use of customer name and history
   - Reference to specific orders/tickets
   - Relevant product suggestions

3. Technical Accuracy
   - Correct database queries
   - Proper field updates
   - Accurate order/ticket status updates

4. Customer Satisfaction
   - Response tone appropriateness
   - Resolution time
   - Follow-up needed

### VI. Example Test Cases

1. Order Status Inquiry
   ```json
   {
     "input": "Check status of order #12345 for customer Jane Doe",
     "expected": {
       "action": "query_order_status",
       "response_elements": ["order_number", "current_status", "shipping_info"],
       "personalization": ["customer_name", "previous_orders"]
     }
   }
   ```

2. Return Request
   ```json
   {
     "input": "Process return for blue dress, too small, order #54321",
     "expected": {
       "action": "create_return_ticket",
       "response_elements": ["return_policy", "size_guide", "return_label"],
       "personalization": ["size_history", "style_preferences"]
     }
   }
   ```

### VII. Deployment Checklist

1. Environment Setup
   - [ ] All required API keys configured
   - [ ] Database connections tested
   - [ ] Email service configured

2. Monitoring
   - [ ] Error logging configured
   - [ ] Performance metrics tracking
   - [ ] Customer satisfaction monitoring

3. Security
   - [ ] PII handling compliance
   - [ ] API key rotation
   - [ ] Access control implementation

## Next Steps

1. Start with basic email generation
2. Add context awareness gradually
3. Implement feedback loop
4. Scale to batch processing
5. Add proactive outreach features

Remember to regularly update test cases and evaluation metrics as new features are added. 