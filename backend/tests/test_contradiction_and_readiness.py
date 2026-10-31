import pytest
from app.services.contradiction_engine import ContradictionEngine
from app.services.readiness_service import ReadinessService
from app.services.storage_service import StorageService
from app.models.schemas import Workspace, ExtractedDate, ProoflineCitation, Requirement, RequirementCategory, TaskStatus

def test_detect_conflicting_deadlines():
    pages = {
        1: "Final submission deadline is October 15, 2026 at 11:59 PM.",
        3: "Final submission deadline is November 1, 2026 at 5:00 PM."
    }
    dates = [
        ExtractedDate(
            id="d1",
            date_text="October 15, 2026",
            event_description="Final submission deadline is October 15, 2026",
            date_type="stated_deadline",
            citation=ProoflineCitation(
                id="c1", document_id="doc1", document_name="notice.pdf",
                page_number=1, exact_passage="Final submission deadline is October 15, 2026"
            )
        ),
        ExtractedDate(
            id="d2",
            date_text="November 1, 2026",
            event_description="Final submission deadline is November 1, 2026",
            date_type="stated_deadline",
            citation=ProoflineCitation(
                id="c2", document_id="doc1", document_name="notice.pdf",
                page_number=3, exact_passage="Final submission deadline is November 1, 2026"
            )
        )
    ]
    contradictions = ContradictionEngine.detect_contradictions(
        doc_id="doc1",
        doc_name="notice.pdf",
        pages_text=pages,
        dates=dates,
        requirements=[]
    )
    assert len(contradictions) >= 1
    assert any(c.topic == "deadline" for c in contradictions)

def test_readiness_scoring():
    ws = StorageService.create_workspace("Test WS")
    req1 = Requirement(
        id="r1",
        title="Submit Transcript",
        plain_language="Provide official transcript",
        original_wording="Official Academic Transcript",
        category=RequirementCategory.DOCUMENTS_TO_PREPARE,
        is_mandatory=True,
        citation=ProoflineCitation(
            id="c1", document_id="d1", document_name="test.pdf",
            page_number=1, exact_passage="Official Academic Transcript"
        ),
        status=TaskStatus.COMPLETED
    )
    ws.combined_requirements = [req1]
    report = ReadinessService.evaluate_readiness(ws)
    assert report.mandatory_completed == 1
    assert report.readiness_score > 70
    assert report.overall_status in ["READY_FOR_USER_REVIEW", "MORE_INFO_NEEDED"]
