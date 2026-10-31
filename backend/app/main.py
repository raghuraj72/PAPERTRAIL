import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse, JSONResponse

from app.config import settings
from app.models.schemas import (
    Workspace,
    DocumentParsed,
    TaskUpdateRequest,
    AskPapertrailRequest,
    AskPapertrailResponse,
    ReadinessReport,
    DocumentComparisonResult,
    TranslationRequest,
    TranslationResponse,
    Requirement
)
from app.services.document_parser import DocumentParser
from app.services.requirement_engine import RequirementEngine
from app.services.proofline_service import ProoflineService
from app.services.contradiction_engine import ContradictionEngine
from app.services.ai_service import AIService
from app.services.action_plan_service import ActionPlanService
from app.services.readiness_service import ReadinessService
from app.services.comparison_engine import ComparisonEngine
from app.services.translator_service import TranslatorService
from app.services.storage_service import StorageService

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="PAPERTRAIL — The Clarity Engine. Understand the requirements. Know what to do. Never submit blindly.",
    version=settings.VERSION
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "ai_provider": settings.DEFAULT_PROVIDER,
        "gemini_available": bool(settings.GEMINI_API_KEY),
        "workspaces_count": len(StorageService.list_workspaces())
    }

# --- WORKSPACE MANAGEMENT ---

@app.get("/api/workspaces")
def list_workspaces():
    return StorageService.list_workspaces()

@app.post("/api/workspaces", response_model=Workspace)
def create_workspace(name: str = Form("My Application Workspace")):
    return StorageService.create_workspace(name=name)

@app.get("/api/workspaces/{workspace_id}", response_model=Workspace)
def get_workspace(workspace_id: str):
    ws = StorageService.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws

@app.delete("/api/workspaces/{workspace_id}")
def delete_workspace(workspace_id: str):
    success = StorageService.delete_workspace(workspace_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return {"status": "deleted", "workspace_id": workspace_id}

# --- DOCUMENT UPLOAD & PARSING ---

@app.post("/api/workspaces/{workspace_id}/upload", response_model=DocumentParsed)
async def upload_document(
    workspace_id: str,
    file: UploadFile = File(...)
):
    ws = StorageService.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
        
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
        
    # Save file temporarily
    file_path = settings.UPLOAD_DIR / f"{ws.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # 1. Parse document structure & layout
        doc_parsed = DocumentParser.parse_file(file_path, file.filename)
        
        # 2. Extract structured requirements and dates
        requirements, dates = RequirementEngine.extract_requirements_and_dates(
            doc_id=doc_parsed.id,
            doc_name=doc_parsed.filename,
            pages_text=doc_parsed.pages_text,
            pdf_path=file_path if ext == ".pdf" else None
        )
        doc_parsed.requirements = requirements
        doc_parsed.dates = dates
        
        # 3. Detect intra-document contradictions
        contradictions = ContradictionEngine.detect_contradictions(
            doc_id=doc_parsed.id,
            doc_name=doc_parsed.filename,
            pages_text=doc_parsed.pages_text,
            dates=dates,
            requirements=requirements,
            pdf_path=file_path if ext == ".pdf" else None
        )
        doc_parsed.contradictions = contradictions
        
        # 4. Save to workspace
        StorageService.add_document(ws, doc_parsed)
        
        return doc_parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.get("/api/workspaces/{workspace_id}/documents/{doc_id}/file")
def get_document_file(workspace_id: str, doc_id: str):
    ws = StorageService.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    target_doc = next((d for d in ws.documents if d.id == doc_id), None)
    if not target_doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Check upload dir
    file_path = settings.UPLOAD_DIR / f"{ws.id}_{target_doc.filename}"
    if not file_path.exists():
        # Check sample dir
        sample_path = settings.SAMPLE_DIR / target_doc.filename
        if sample_path.exists():
            file_path = sample_path
        else:
            raise HTTPException(status_code=404, detail="File on disk not found")
            
    media_type = "application/pdf" if target_doc.file_type == "pdf" else "application/octet-stream"
    return FileResponse(file_path, media_type=media_type, filename=target_doc.filename)

# --- ONE-CLICK DEMO LOADER ---

@app.post("/api/workspaces/demo/clarity-challenge", response_model=Workspace)
def load_demo_workspace():
    # Check if sample PDF exists
    sample_pdf = settings.SAMPLE_DIR / "apex_fellowship_guidelines_2026.pdf"
    if not sample_pdf.exists():
        from app.sample_data.generate_samples import generate_clarity_challenge_pdf
        generate_clarity_challenge_pdf(sample_pdf)
        
    ws = StorageService.create_workspace("Demo: The Application Clarity Challenge (2026)")
    
    # Copy to uploads
    target_dest = settings.UPLOAD_DIR / f"{ws.id}_{sample_pdf.name}"
    shutil.copy(sample_pdf, target_dest)
    
    # Process
    doc_parsed = DocumentParser.parse_file(target_dest, sample_pdf.name)
    requirements, dates = RequirementEngine.extract_requirements_and_dates(
        doc_id=doc_parsed.id,
        doc_name=doc_parsed.filename,
        pages_text=doc_parsed.pages_text,
        pdf_path=target_dest
    )
    doc_parsed.requirements = requirements
    doc_parsed.dates = dates
    
    contradictions = ContradictionEngine.detect_contradictions(
        doc_id=doc_parsed.id,
        doc_name=doc_parsed.filename,
        pages_text=doc_parsed.pages_text,
        dates=dates,
        requirements=requirements,
        pdf_path=target_dest
    )
    doc_parsed.contradictions = contradictions
    
    StorageService.add_document(ws, doc_parsed)
    return ws

# --- ACTION PLAN & TASKS ---

@app.patch("/api/workspaces/{workspace_id}/tasks/{task_id}", response_model=Requirement)
def update_task(workspace_id: str, task_id: str, update: TaskUpdateRequest):
    ws = StorageService.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    updated = ActionPlanService.update_task(ws, task_id, update)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    StorageService.save_workspace(ws)
    return updated

# --- ASK PAPERTRAIL AI ---

@app.post("/api/workspaces/{workspace_id}/ask", response_model=AskPapertrailResponse)
def ask_papertrail(workspace_id: str, request: AskPapertrailRequest):
    ws = StorageService.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return AIService.answer_question(
        workspace=ws,
        question=request.question,
        document_id=request.document_id,
        target_language=request.target_language or "en"
    )

# --- READINESS REVIEW ---

@app.get("/api/workspaces/{workspace_id}/readiness", response_model=ReadinessReport)
def get_readiness_review(workspace_id: str):
    ws = StorageService.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ReadinessService.evaluate_readiness(ws)

# --- DOCUMENT COMPARISON ---

@app.get("/api/workspaces/{workspace_id}/compare", response_model=DocumentComparisonResult)
def compare_documents(
    workspace_id: str,
    doc_a_id: str = Query(...),
    doc_b_id: str = Query(...)
):
    ws = StorageService.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    doc_a = next((d for d in ws.documents if d.id == doc_a_id), None)
    doc_b = next((d for d in ws.documents if d.id == doc_b_id), None)
    if not doc_a or not doc_b:
        raise HTTPException(status_code=400, detail="Both documents must exist in workspace for comparison")
    return ComparisonEngine.compare_documents(doc_a, doc_b)

# --- TRANSLATION ---

@app.post("/api/translate", response_model=TranslationResponse)
def translate_text(req: TranslationRequest):
    return TranslatorService.simplify_and_translate(req.text, req.target_language)

# --- EXPORT ---

@app.get("/api/workspaces/{workspace_id}/export/{format_type}")
def export_action_plan(workspace_id: str, format_type: str):
    ws = StorageService.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    fmt = format_type.lower()
    if fmt == "markdown" or fmt == "md":
        content = ActionPlanService.export_markdown(ws)
        return PlainTextResponse(content, media_type="text/markdown", headers={
            "Content-Disposition": f"attachment; filename=action_plan_{workspace_id}.md"
        })
    elif fmt == "csv":
        content = ActionPlanService.export_csv(ws)
        return PlainTextResponse(content, media_type="text/csv", headers={
            "Content-Disposition": f"attachment; filename=action_plan_{workspace_id}.csv"
        })
    elif fmt == "json":
        content = ActionPlanService.export_json(ws)
        return PlainTextResponse(content, media_type="application/json", headers={
            "Content-Disposition": f"attachment; filename=action_plan_{workspace_id}.json"
        })
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Supported: markdown, csv, json")
