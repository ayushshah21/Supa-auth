from typing import List, Dict

# Test cases for outreach generation
TEST_CASES = [
    {
        "name": "Unresolved Ticket Follow-up",
        "customer_id": "test_user_1",
        "context": {
            "active_tickets": [
                {
                    "id": "T123",
                    "status": "open",
                    "type": "size_exchange",
                    "product": "Slim Fit Jeans",
                    "created_at": "2024-03-01",
                    "last_update": "2024-03-02",
                }
            ],
            "preferences": {"size": "32x34", "style": "casual"},
        },
        "request": "Generate follow-up email for open ticket T123",
        "expected_elements": [
            "reference ticket T123",
            "acknowledge size exchange request",
            "provide status update",
            "next steps",
        ],
    },
    {
        "name": "Post-Resolution Product Recommendation",
        "customer_id": "test_user_2",
        "context": {
            "resolved_tickets": [
                {
                    "id": "T100",
                    "status": "resolved",
                    "type": "product_inquiry",
                    "product": "Designer Jeans",
                    "resolution_date": "2024-03-01",
                    "satisfaction": "high",
                }
            ],
            "purchase_history": [{"item": "Designer Jeans", "date": "2024-03-02"}],
        },
        "request": "Generate product recommendation based on recent jean purchase",
        "expected_elements": [
            "reference recent purchase",
            "complementary products",
            "similar style suggestions",
            "personalized recommendations",
        ],
    },
    {
        "name": "Multiple Ticket Status Update",
        "customer_id": "test_user_3",
        "context": {
            "active_tickets": [
                {
                    "id": "T201",
                    "status": "open",
                    "type": "shipping_inquiry",
                    "created_at": "2024-03-01",
                },
                {
                    "id": "T202",
                    "status": "pending",
                    "type": "return_request",
                    "created_at": "2024-03-02",
                },
            ]
        },
        "request": "Generate consolidated update for all open tickets",
        "expected_elements": [
            "address both tickets",
            "clear status for each",
            "prioritized handling",
            "next steps for each issue",
        ],
    },
    {
        "name": "Customer Service Follow-up",
        "customer_id": "test_user_4",
        "context": {
            "resolved_tickets": [
                {
                    "id": "T300",
                    "status": "resolved",
                    "type": "customer_service",
                    "resolution_date": "2024-03-01",
                    "satisfaction": "pending_feedback",
                }
            ],
            "interaction_history": [
                {
                    "type": "support_call",
                    "date": "2024-03-01",
                    "topic": "product_guidance",
                }
            ],
        },
        "request": "Generate satisfaction follow-up email",
        "expected_elements": [
            "reference recent interaction",
            "ask for feedback",
            "offer additional assistance",
            "thank for business",
        ],
    },
]


def get_test_cases() -> List[Dict]:
    """Return the test cases for outreach testing"""
    return TEST_CASES


def get_test_case_by_name(name: str) -> Dict:
    """Get a specific test case by name"""
    return next((case for case in TEST_CASES if case["name"] == name), None)


def get_evaluation_criteria() -> Dict[str, str]:
    """Return the evaluation criteria for outreach messages"""
    return {
        "ticket_context_usage": "Does the message correctly reference and use ticket information?",
        "customer_history_integration": "Does the message incorporate relevant customer history and previous interactions?",
        "response_relevance": "Is the response directly addressing the current situation/ticket?",
        "action_clarity": "Are next steps or required actions clearly communicated?",
        "tone_appropriateness": "Does the tone match the ticket context (support, follow-up, sales)?",
        "personalization": "Does the message use available customer context for personalization?",
    }
