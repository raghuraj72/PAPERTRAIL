export type RequirementCategory =
  | 'Before Applying'
  | 'Documents to Prepare'
  | 'Eligibility Verification'
  | 'Application Completion'
  | 'Final Review'
  | 'Submission';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked' | 'Waived';

export type Priority = 'High' | 'Medium' | 'Low';

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface ProoflineCitation {
  id: string;
  document_id: string;
  document_name: string;
  page_number: number;
  section_heading: string;
  exact_passage: string;
  char_start?: number | null;
  char_end?: number | null;
  bounding_box?: BoundingBox | null;
  confidence: number;
  verified: boolean;
  explanation?: string | null;
}

export interface Requirement {
  id: string;
  title: string;
  plain_language: string;
  original_wording: string;
  category: RequirementCategory;
  is_mandatory: boolean;
  deadline?: string | null;
  deadline_context?: string | null;
  dependencies: string[];
  confidence: number;
  citation: ProoflineCitation;
  status: TaskStatus;
  personal_notes?: string | null;
  user_reminder?: string | null;
  priority: Priority;
}

export interface ExtractedDate {
  id: string;
  date_text: string;
  normalized_date?: string | null;
  event_description: string;
  date_type: string;
  citation: ProoflineCitation;
  is_critical: boolean;
}

export interface Contradiction {
  id: string;
  title: string;
  topic: 'deadline' | 'fee' | 'eligibility' | 'documents' | 'submission';
  passage_a: ProoflineCitation;
  passage_b: ProoflineCitation;
  discrepancy_explanation: string;
  severity: 'critical' | 'warning' | 'note';
  suggested_action: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  page_number: number;
  char_start: number;
  char_end: number;
  content_snippet: string;
  level: number;
}

export interface DocumentParsed {
  id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  upload_timestamp: string;
  page_count: number;
  document_title: string;
  document_type: string;
  summary: string;
  sections: DocumentSection[];
  pages_text: Record<number, string>;
  requirements: Requirement[];
  dates: ExtractedDate[];
  contradictions: Contradiction[];
  missing_or_unclear: string[];
  contact_details: string[];
  fee_info?: string | null;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  documents_count: number;
  total_tasks: number;
  completed_tasks: number;
}

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  documents: DocumentParsed[];
  combined_requirements: Requirement[];
  combined_contradictions: Contradiction[];
  action_plan_completed_count: number;
  action_plan_total_count: number;
}

export interface ReadinessReport {
  overall_status: 'READY_FOR_USER_REVIEW' | 'INCOMPLETE_TASKS' | 'MORE_INFO_NEEDED' | 'CONTRADICTIONS_DETECTED';
  readiness_score: number;
  mandatory_completed: number;
  mandatory_total: number;
  optional_completed: number;
  optional_total: number;
  unverified_citations_count: number;
  blocking_contradictions: Contradiction[];
  missing_critical_info: string[];
  upcoming_deadlines: ExtractedDate[];
  checklist_summary: Record<string, number>;
  recommendations: string[];
  disclaimer: string;
}

export interface AskPapertrailResponse {
  answer: string;
  confidence: number;
  citations: ProoflineCitation[];
  is_inferred: boolean;
  uncertainty_warning?: string | null;
  suggested_next_questions: string[];
}

export interface DocumentComparisonResult {
  doc_a_name: string;
  doc_b_name: string;
  added_requirements: Requirement[];
  removed_requirements: Requirement[];
  modified_requirements: Array<{
    requirement_title: string;
    differences: string[];
    doc_a_passage: string;
    doc_b_passage: string;
  }>;
  changed_deadlines: Array<{
    date: string;
    event: string;
    change_type: string;
    doc_name: string;
  }>;
  summary_of_changes: string;
}

export interface TranslationResponse {
  original_text: string;
  translated_text: string;
  target_language: string;
  notes?: string | null;
}
