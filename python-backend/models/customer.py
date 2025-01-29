from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class CustomerPreferences(BaseModel):
    preferred_contact_time: List[str]
    preferred_communication_style: str
    interests: List[str]
    size_preferences: dict
    favorite_categories: List[str]


class Interaction(BaseModel):
    id: str
    timestamp: datetime
    type: str  # email, purchase, support, etc.
    description: str
    sentiment: Optional[str]
    response_time: Optional[float]
    was_successful: Optional[bool]


class Purchase(BaseModel):
    id: str
    timestamp: datetime
    items: List[dict]
    total_amount: float
    status: str
    feedback: Optional[str]


class EngagementMetrics(BaseModel):
    response_rate: float
    average_response_time: float
    preferred_communication_times: List[str]
    successful_message_styles: List[str]
    last_contact: datetime
    engagement_score: float


class Customer(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime
    preferences: CustomerPreferences
    interactions: List[Interaction]
    purchases: List[Purchase]
    engagement_metrics: EngagementMetrics
    segments: List[str]  # e.g., "premium", "regular", "new"
    lifetime_value: float
