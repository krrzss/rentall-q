from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ChurnFeatures(BaseModel):
    days_since_last_booking: int
    cancellation_count: int
    late_payment_count: int
    total_bookings: Optional[int] = 0


class CustomerChurnAssessment(BaseModel):
    customer_id: str
    customer_name: str
    churn_probability: float
    risk_level: str  # "HIGH" | "MEDIUM" | "LOW"
    model_type: str  # "rule-based" | "ML-trained"
    features: ChurnFeatures
    recommended_action: str
    insight: str
    reasoning: str


class ChurnInput(BaseModel):
    business_id: Optional[str] = None
    customer_id: Optional[str] = None
    auth_token: Optional[str] = None
    customers: Optional[List[Dict[str, Any]]] = None
    bookings: Optional[List[Dict[str, Any]]] = None
    payments: Optional[List[Dict[str, Any]]] = None
    days_since_last_booking: Optional[int] = None
    total_bookings: Optional[int] = None
    cancellations_count: Optional[int] = None
    late_payment_count: Optional[int] = None


class ChurnOutput(BaseModel):
    agent_name: str = "churn"
    business_id: Optional[str] = None
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    churn_probability: float
    risk_level: str
    model_type: str  # "rule-based" or "ML-trained"
    features: Optional[Dict[str, Any]] = None
    recommended_action: str
    insight: Optional[str] = None
    reasoning: Optional[str] = None
    confidence_score: Optional[int] = None
    total_customers_analyzed: Optional[int] = 0
    high_risk_count: Optional[int] = 0
    customers: Optional[List[Dict[str, Any]]] = None
