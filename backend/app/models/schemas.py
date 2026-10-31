from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class RequirementCategory(str, Enum):
    BEFORE_APPLYING = "Before Applying"
    DOCUMENTS_TO_PREPARE = "Documents to Prepare"
    ELIGIBILITY_VERIFICATION = "Eligibility Verification"
    APPLICATION_COMPLETION = "Application Completion"
    FINAL_REVIEW = "Final Review"
    SUBMISSION = "Submission"

class TaskStatus(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    BLOCKED = "Blocked"
    WAIVED = "Waived"

class Priority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class BoundingBox(BaseModel):
    x0: float
    y0: float
    x1: float
    y1: float

class ProoflineCitation(BaseModel):
    id: str
    document_id: str
    document_name: str
    page_number: int = Field(..., description="1-indexed page number")
    section_heading: str = Field("General", description="Section where the passage occurs")
    exact_passage: str = Field(..., description="Verbatim quote from original document")
    char_start: Optional[int] = None
    char_end: Optional[int] = None
    bounding_box: Optional[BoundingBox] = None
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    verified: bool = Field(default=True, description="True if passage matches document text")
    explanation: Optional[str] = None

class Requirement(BaseModel):
    id: str
    title: str
    plain_language: str
    original_wording: str
    category: RequirementCategory
    is_mandatory: bool = True
    deadline: Optional[str] = None
    deadline_context: Optional[str] = None
    dependencies: List[str] = Field(default_factory=list, description="IDs of prerequisite requirements")
    confidence: float = Field(default=0.92, ge=0.0, le=1.0)
    citation: ProoflineCitation
    status: TaskStatus = TaskStatus.NOT_STARTED
    personal_notes: Optional[str] = None
    user_reminder: Optional[str] = None
    priority: Priority = Priority.HIGH

class ExtractedDate(BaseModel):
    id: str
    date_text: str
    normalized_date: Optional[str] = None
    event_description: str
    date_type: str = Field("stated_deadline", description="stated_deadline | stated_milestone | user_entered | calculated")
    citation: ProoflineCitation
    is_critical: bool = True

class Contradiction(BaseModel):
    id: str
    title: str
    topic: str = Field(..., description="deadline | fee | eligibility | documents | submission")
    passage_a: ProoflineCitation
    passage_b: ProoflineCitation
    discrepancy_explanation: str
    severity: str = Field("warning", description="critical | warning | note")
    suggested_action: str

class DocumentSection(BaseModel):
    id: str
    title: str
    page_number: int
    char_start: int
    char_end: int
    content_snippet: str
    level: int = 1

class DocumentParsed(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size_bytes: int
    upload_timestamp: str
    page_count: int
    document_title: str
    document_type: str
    summary: str
    sections: List[DocumentSection] = Field(default_factory=list)
    pages_text: Dict[int, str] = Field(default_factory=dict)
    requirements: List[Requirement] = Field(default_factory=list)
    dates: List[ExtractedDate] = Field(default_factory=list)
    contradictions: List[Contradiction] = Field(default_factory=list)
    missing_or_unclear: List[str] = Field(default_factory=list)
    contact_details: List[str] = Field(default_factory=list)
    fee_info: Optional[str] = None

class Workspace(BaseModel):
    id: str
    name: str
    created_at: str
    updated_at: str
    documents: List[DocumentParsed] = Field(default_factory=list)
    combined_requirements: List[Requirement] = Field(default_factory=list)
    combined_contradictions: List[Contradiction] = Field(default_factory=list)
    action_plan_completed_count: int = 0
    action_plan_total_count: int = 0

class ReadinessReport(BaseModel):
    overall_status: str = Field(..., description="READY_FOR_USER_REVIEW | INCOMPLETE_TASKS | MORE_INFO_NEEDED | CONTRADICTIONS_DETECTED")
    readiness_score: int = Field(..., ge=0, le=100)
    mandatory_completed: int
    mandatory_total: int
    optional_completed: int
    optional_total: int
    unverified_citations_count: int
    blocking_contradictions: List[Contradiction] = Field(default_factory=list)
    missing_critical_info: List[str] = Field(default_factory=list)
    upcoming_deadlines: List[ExtractedDate] = Field(default_factory=list)
    checklist_summary: Dict[str, int] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)
    disclaimer: str = (
        "PAPERTRAIL assists with document understanding and preparation. "
        "It does not approve applications, guarantee eligibility, or submit on your behalf."
    )

class AskPapertrailRequest(BaseModel):
    workspace_id: str
    question: str
    document_id: Optional[str] = None
    target_language: Optional[str] = "en"  # en | hi | hinglish

class AskPapertrailResponse(BaseModel):
    answer: str
    confidence: float
    citations: List[ProoflineCitation] = Field(default_factory=list)
    is_inferred: bool = False
    uncertainty_warning: Optional[str] = None
    suggested_next_questions: List[str] = Field(default_factory=list)

class DocumentComparisonResult(BaseModel):
    doc_a_name: str
    doc_b_name: str
    added_requirements: List[Requirement] = Field(default_factory=list)
    removed_requirements: List[Requirement] = Field(default_factory=list)
    modified_requirements: List[Dict[str, Any]] = Field(default_factory=list)
    changed_deadlines: List[Dict[str, Any]] = Field(default_factory=list)
    summary_of_changes: str

class TaskUpdateRequest(BaseModel):
    status: Optional[TaskStatus] = None
    personal_notes: Optional[str] = None
    user_reminder: Optional[str] = None
    priority: Optional[Priority] = None

class TranslationRequest(BaseModel):
    text: str
    target_language: str = "hi"  # hi | hinglish | simple_en

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str
    notes: Optional[str] = None
