import json
import uuid
import datetime
from pathlib import Path
from typing import List, Optional, Dict

from app.config import settings
from app.models.schemas import Workspace, DocumentParsed, Requirement, Contradiction
from app.services.contradiction_engine import ContradictionEngine

class StorageService:
    @staticmethod
    def get_workspace_path(workspace_id: str) -> Path:
        return settings.WORKSPACE_DIR / f"{workspace_id}.json"

    @staticmethod
    def create_workspace(name: str = "My Clarity Workspace") -> Workspace:
        ws_id = f"ws_{uuid.uuid4().hex[:8]}"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        ws = Workspace(
            id=ws_id,
            name=name,
            created_at=now,
            updated_at=now,
            documents=[],
            combined_requirements=[],
            combined_contradictions=[],
            action_plan_completed_count=0,
            action_plan_total_count=0
        )
        StorageService.save_workspace(ws)
        return ws

    @staticmethod
    def save_workspace(ws: Workspace) -> None:
        ws.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        # Compute combined counts
        ws.action_plan_total_count = len(ws.combined_requirements)
        ws.action_plan_completed_count = sum(1 for r in ws.combined_requirements if r.status == "Completed")
        
        path = StorageService.get_workspace_path(ws.id)
        with open(path, "w", encoding="utf-8") as f:
            f.write(ws.model_dump_json(indent=2))

    @staticmethod
    def get_workspace(workspace_id: str) -> Optional[Workspace]:
        path = StorageService.get_workspace_path(workspace_id)
        if not path.exists():
            return None
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return Workspace.model_validate(data)

    @staticmethod
    def list_workspaces() -> List[Dict]:
        results = []
        for p in settings.WORKSPACE_DIR.glob("*.json"):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    results.append({
                        "id": data.get("id"),
                        "name": data.get("name"),
                        "created_at": data.get("created_at"),
                        "updated_at": data.get("updated_at"),
                        "documents_count": len(data.get("documents", [])),
                        "total_tasks": data.get("action_plan_total_count", 0),
                        "completed_tasks": data.get("action_plan_completed_count", 0),
                    })
            except Exception:
                continue
        results.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return results

    @staticmethod
    def delete_workspace(workspace_id: str) -> bool:
        path = StorageService.get_workspace_path(workspace_id)
        if path.exists():
            path.unlink()
            return True
        return False

    @staticmethod
    def add_document(workspace: Workspace, doc: DocumentParsed) -> Workspace:
        # Check if already present
        workspace.documents = [d for d in workspace.documents if d.id != doc.id]
        workspace.documents.append(doc)
        
        # Merge requirements
        all_reqs: List[Requirement] = []
        for d in workspace.documents:
            all_reqs.extend(d.requirements)
        workspace.combined_requirements = all_reqs
        
        # Compute cross-document contradictions
        all_pages: Dict[int, str] = {}
        page_counter = 1
        all_dates = []
        for d in workspace.documents:
            for p_num, text in d.pages_text.items():
                all_pages[page_counter] = text
                page_counter += 1
            all_dates.extend(d.dates)
            
        combined_contradictions = ContradictionEngine.detect_contradictions(
            doc_id="workspace_all",
            doc_name="Workspace Documents",
            pages_text=all_pages,
            dates=all_dates,
            requirements=all_reqs
        )
        workspace.combined_contradictions = combined_contradictions
        
        StorageService.save_workspace(workspace)
        return workspace
