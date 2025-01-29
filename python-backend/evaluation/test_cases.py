"""
Test case definitions for manual evaluation of the Clothing CRM system.
"""

from dataclasses import dataclass
from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum


class RequestType(Enum):
    """Types of requests that can be made to the CRM"""

    INVENTORY_UPDATE = "inventory_update"
    CUSTOMER_INQUIRY = "customer_inquiry"
    ORDER_STATUS = "order_status"
    PRODUCT_RECOMMENDATION = "product_recommendation"
    RETURN_PROCESS = "return_process"
    SIZE_RECOMMENDATION = "size_recommendation"


@dataclass
class ExpectedDatabaseChange:
    """Expected changes to the database after request processing"""

    table: str
    operation: str  # INSERT, UPDATE, DELETE
    fields: Dict[str, Any]
    conditions: Optional[Dict[str, Any]] = None


@dataclass
class TestCase:
    """Test case for evaluating CRM responses"""

    id: str
    request_type: RequestType
    request: str
    context: Dict[str, Any]
    expected_output: str
    expected_db_changes: List[ExpectedDatabaseChange]
    success_criteria: List[str]
    complexity: str
    manual_evaluation_notes: Optional[str] = None
    actual_response: Optional[str] = None
    human_rating: Optional[float] = None
    evaluation_timestamp: Optional[datetime] = None
    evaluator_id: Optional[str] = None


@dataclass
class TestTicket:
    """Represents a customer service ticket for testing"""

    title: str
    description: str
    status: str
    created_at: datetime
    resolution: Optional[str] = None


def create_inventory_update_test() -> TestCase:
    """Create a test case for inventory update"""
    return TestCase(
        id="INV001",
        request_type=RequestType.INVENTORY_UPDATE,
        request="Update inventory for blue denim jeans size 32 to show 15 units in stock",
        context={
            "product_id": "DNM32-BLU",
            "current_stock": 10,
            "location": "main_warehouse",
        },
        expected_output="Inventory updated successfully. Blue denim jeans size 32 now shows 15 units in stock.",
        expected_db_changes=[
            ExpectedDatabaseChange(
                table="inventory",
                operation="UPDATE",
                fields={"stock_quantity": 15},
                conditions={"product_id": "DNM32-BLU"},
            )
        ],
        success_criteria=[
            "Correctly identifies product",
            "Updates correct quantity",
            "Confirms update in response",
            "Professional tone",
        ],
        complexity="SIMPLE",
    )


def create_size_recommendation_test() -> TestCase:
    """Create a test case for size recommendation"""
    return TestCase(
        id="SZR001",
        request_type=RequestType.SIZE_RECOMMENDATION,
        request="What size should I order for a customer who is 5'10\", 160lbs, usually wears medium in other brands?",
        context={
            "product_type": "t_shirt",
            "brand": "premium_basics",
            "customer_measurements": {
                "height": "5'10\"",
                "weight": "160lbs",
                "usual_size": "M",
            },
        },
        expected_output="Based on the customer's measurements and our sizing chart, I recommend ordering a size Large in our Premium Basics t-shirts. Our shirts run slightly slim, and sizing up ensures a comfortable fit. The Large will provide adequate length for their height while maintaining a proper fit through the chest and shoulders.",
        expected_db_changes=[],  # No DB changes for recommendations
        success_criteria=[
            "Considers all measurements",
            "References brand-specific sizing",
            "Provides reasoning",
            "Includes fit details",
            "Professional tone",
        ],
        complexity="COMPLEX",
    )


def create_return_process_test() -> TestCase:
    """Create a test case for return process handling"""
    return TestCase(
        id="RET001",
        request_type=RequestType.RETURN_PROCESS,
        request="Customer wants to return a dress purchased 10 days ago due to wrong size. Order #ORD-123456",
        context={
            "order_id": "ORD-123456",
            "purchase_date": datetime.now().replace(day=datetime.now().day - 10),
            "product": "Evening Dress - Black",
            "reason": "Wrong Size",
            "customer_id": "CUST-789",
        },
        expected_output="I've initiated the return process for Order #ORD-123456. Since the purchase was made within our 30-day return window, I'll email the return shipping label to the customer. Once received, we'll process a full refund to the original payment method. Would they like to order a different size?",
        expected_db_changes=[
            ExpectedDatabaseChange(
                table="orders",
                operation="UPDATE",
                fields={"status": "RETURN_INITIATED"},
                conditions={"order_id": "ORD-123456"},
            ),
            ExpectedDatabaseChange(
                table="returns",
                operation="INSERT",
                fields={
                    "order_id": "ORD-123456",
                    "reason": "Wrong Size",
                    "status": "INITIATED",
                },
            ),
        ],
        success_criteria=[
            "Verifies return eligibility",
            "Mentions return window",
            "Explains return process",
            "Offers size exchange",
            "Professional tone",
        ],
        complexity="COMPLEX",
    )
