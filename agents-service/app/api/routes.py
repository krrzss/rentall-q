import json
from app.agents.orchestrator import AgentOrchestrator

orchestrator = AgentOrchestrator()


def handle_agent_request(path: str, method: str, body_data: dict) -> tuple[int, dict]:
    """Lightweight API route handler for internal Next.js HTTP calls."""
    # Pattern: /api/v1/agents/{agent_name}/run or /api/v1/agents/{agent_name}
    parts = path.strip("/").split("/")
    if method == "POST" and len(parts) >= 4 and parts[0] == "api" and parts[1] == "v1" and parts[2] == "agents":
        agent_name = parts[3]
        if agent_name.endswith("/run"):
            agent_name = agent_name.replace("/run", "")
        
        try:
            result = orchestrator.dispatch(agent_name, body_data)
            return 200, result
        except ValueError as val_err:
            return 404, {"error": str(val_err)}
        except Exception as exc:
            return 500, {"error": f"Agent execution failed: {str(exc)}"}

    return 404, {"error": "Not Found"}
