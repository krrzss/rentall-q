import pytest
from app.agents.churn.agent import ChurnPredictionAgent


def test_churn_prediction_agent_low_risk():
    agent = ChurnPredictionAgent()
    input_data = {
        "customer_id": "cust-001",
        "days_since_last_booking": 10,
        "total_bookings": 8,
        "cancellations_count": 0
    }
    output = agent.run(input_data)

    assert output["agent_name"] == "churn"
    assert output["customer_id"] == "cust-001"
    assert output["risk_level"] == "LOW"
    assert output["churn_probability"] < 0.35


def test_churn_prediction_agent_high_risk():
    agent = ChurnPredictionAgent()
    input_data = {
        "customer_id": "cust-002",
        "days_since_last_booking": 60,
        "total_bookings": 2,
        "cancellations_count": 2,
        "late_payment_count": 1
    }
    output = agent.run(input_data)

    assert output["risk_level"] == "HIGH"
    assert output["churn_probability"] >= 0.70


def test_orchestrator_dispatch(orchestrator):
    result = orchestrator.dispatch("churn", {"customer_id": "cust-003"})
    assert result["agent_name"] == "churn"
    assert result["customer_id"] == "cust-003"
