import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "PAPERTRAIL" in data["app"]

def test_workspace_crud_and_demo():
    # Load demo
    demo_resp = client.post("/api/workspaces/demo/clarity-challenge")
    assert demo_resp.status_code == 200
    ws_data = demo_resp.json()
    ws_id = ws_data["id"]
    assert len(ws_data["documents"]) >= 1
    assert len(ws_data["combined_requirements"]) >= 5
    
    # Get workspace
    get_resp = client.get(f"/api/workspaces/{ws_id}")
    assert get_resp.status_code == 200
    
    # Ask AI
    ask_resp = client.post(
        f"/api/workspaces/{ws_id}/ask",
        json={"workspace_id": ws_id, "question": "What is the minimum GPA required?", "target_language": "en"}
    )
    assert ask_resp.status_code == 200
    ask_data = ask_resp.json()
    assert "3.2" in ask_data["answer"] or "GPA" in ask_data["answer"]
    assert len(ask_data["citations"]) >= 1
    
    # Readiness review
    readiness_resp = client.get(f"/api/workspaces/{ws_id}/readiness")
    assert readiness_resp.status_code == 200
    
    # Export
    export_resp = client.get(f"/api/workspaces/{ws_id}/export/markdown")
    assert export_resp.status_code == 200
    assert "Action Plan" in export_resp.text
    
    # Clean up
    del_resp = client.delete(f"/api/workspaces/{ws_id}")
    assert del_resp.status_code == 200
