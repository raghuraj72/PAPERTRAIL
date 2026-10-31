import re
import uuid
from typing import List, Dict, Tuple, Optional
from pathlib import Path

from app.models.schemas import (
    Requirement,
    RequirementCategory,
    TaskStatus,
    Priority,
    ExtractedDate,
    ProoflineCitation,
)
from app.services.proofline_service import ProoflineService

class RequirementEngine:
    @staticmethod
    def extract_requirements_and_dates(
        doc_id: str,
        doc_name: str,
        pages_text: Dict[int, str],
        pdf_path: Optional[Path] = None
    ) -> Tuple[List[Requirement], List[ExtractedDate]]:
        requirements: List[Requirement] = []
        dates: List[ExtractedDate] = []
        
        # Regex patterns for requirements
        patterns = [
            # Direct imperatives / obligation
            (r"(?:applicants?|candidates?|students?|participants?)\s+(?:must|shall|are required to)\s+([^.\n]{15,200}\.)", True),
            (r"\b(?:must|shall)\s+(?:submit|provide|upload|complete|verify|attach|pay|ensure)\s+([^.\n]{15,200}\.)", True),
            (r"\b(?:mandatory|compulsory)\s*:\s*([^.\n]{15,200}\.)", True),
            (r"\b(?:required\s+documents?|documents?\s+required)\s*:\s*([^.\n]{15,250}\.)", True),
            (r"\b(?:eligibility\s+criteria|minimum\s+qualifications?)\s*:\s*([^.\n]{15,250}\.)", True),
            # Optional / recommended
            (r"(?:applicants?|candidates?)\s+(?:may|can optionally|are encouraged to|are advised to)\s+([^.\n]{15,200}\.)", False),
            (r"\b(?:optional|recommended)\s*:\s*([^.\n]{15,200}\.)", False),
            # Bullet point items in requirement-heavy sections
            (r"(?:^|\n)\s*[-•*]\s*([A-Z][^.\n]{20,200}\.)", None),
        ]
        
        # Extract dates patterns
        date_patterns = [
            r"\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:AM|PM|EST|PST|IST|UTC|GMT)?)?)",
            r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})",
            r"\b((?:deadline|due\s+date|last\s+date|closes\s+on)\s*(?:is|:)?\s*[^.\n]{5,60})",
        ]
        
        seen_passages = set()
        req_counter = 1
        
        for page_num, text in sorted(pages_text.items()):
            lines = text.split("\n")
            current_section = "General"
            
            # 1. Scan for dates
            for pat in date_patterns:
                for match in re.finditer(pat, text, re.IGNORECASE):
                    d_text = match.group(0).strip()
                    if d_text.lower() in seen_passages:
                        continue
                    seen_passages.add(d_text.lower())
                    
                    # Context line
                    line_start = max(0, text.rfind("\n", 0, match.start()))
                    line_end = text.find("\n", match.end())
                    if line_end == -1:
                        line_end = len(text)
                    context_line = text[line_start:line_end].strip()
                    
                    # Determine date type & priority
                    is_deadline = any(w in context_line.lower() for w in ["deadline", "due", "last date", "close", "cutoff", "final"])
                    event_desc = context_line[:120] if len(context_line) > 10 else f"Date mentioned: {d_text}"
                    
                    cite = ProoflineService.create_citation(
                        doc_id=doc_id,
                        doc_name=doc_name,
                        passage=context_line if len(context_line) > 10 else d_text,
                        pages_text=pages_text,
                        pdf_path=pdf_path,
                        preferred_page=page_num,
                        section_hint=current_section
                    )
                    
                    dates.append(ExtractedDate(
                        id=f"date_{len(dates)+1}",
                        date_text=d_text,
                        normalized_date=RequirementEngine._normalize_date(d_text),
                        event_description=event_desc,
                        date_type="stated_deadline" if is_deadline else "stated_milestone",
                        citation=cite,
                        is_critical=is_deadline
                    ))

            # 2. Scan for sections & requirements
            for line_idx, line in enumerate(lines):
                sline = line.strip()
                if not sline:
                    continue
                # Heading detection
                if (len(sline) < 60 and sline.isupper() and len(sline) > 3) or sline.endswith(":") or re.match(r"^\d+\.\d+", sline):
                    current_section = sline.rstrip(":")

            # 3. Apply requirement patterns
            for pat, mandatory_override in patterns:
                for match in re.finditer(pat, text, re.IGNORECASE | re.MULTILINE):
                    passage = match.group(0).strip()
                    # Clean passage
                    norm_pass = re.sub(r"\s+", " ", passage)
                    if len(norm_pass) < 25 or norm_pass.lower() in seen_passages:
                        continue
                        
                    # Filter out purely informational lines
                    lower_p = norm_pass.lower()
                    if not any(k in lower_p for k in [
                        "must", "shall", "require", "eligible", "submit", "document", "gpa", "fee",
                        "form", "upload", "provide", "verify", "deadline", "certificate", "id",
                        "proof", "transcripts", "letter", "enroll", "application", "recommendation"
                    ]):
                        continue
                        
                    seen_passages.add(norm_pass.lower())
                    
                    # Determine if mandatory
                    if mandatory_override is not None:
                        is_mandatory = mandatory_override
                    else:
                        is_mandatory = not any(w in lower_p for w in ["optional", "may", "if applicable", "encouraged", "recommended"])
                        
                    # Categorize requirement
                    category = RequirementEngine._classify_category(norm_pass, current_section)
                    
                    # Generate concise title and plain language explanation
                    title, plain_lang = RequirementEngine._generate_plain_summary(norm_pass, category, is_mandatory)
                    
                    # Extract associated deadline if mentioned in passage
                    req_deadline = None
                    for d in dates:
                        if d.date_text.lower() in norm_pass.lower():
                            req_deadline = d.date_text
                            break
                            
                    cite = ProoflineService.create_citation(
                        doc_id=doc_id,
                        doc_name=doc_name,
                        passage=norm_pass,
                        pages_text=pages_text,
                        pdf_path=pdf_path,
                        preferred_page=page_num,
                        section_hint=current_section
                    )
                    
                    priority = Priority.HIGH if is_mandatory else Priority.MEDIUM
                    if category == RequirementCategory.SUBMISSION:
                        priority = Priority.HIGH
                    elif category == RequirementCategory.DOCUMENTS_TO_PREPARE and not is_mandatory:
                        priority = Priority.LOW
                        
                    requirements.append(Requirement(
                        id=f"req_{req_counter}",
                        title=title,
                        plain_language=plain_lang,
                        original_wording=norm_pass,
                        category=category,
                        is_mandatory=is_mandatory,
                        deadline=req_deadline,
                        deadline_context=f"Associated with {title}" if req_deadline else None,
                        dependencies=[],
                        confidence=0.94 if is_mandatory else 0.88,
                        citation=cite,
                        status=TaskStatus.NOT_STARTED,
                        priority=priority
                    ))
                    req_counter += 1

            # 4. Extract table and checklist items (e.g. document tables)
            table_keywords = [
                "transcript", "photo id", "statement of purpose", "recommendation",
                "portfolio", "test scores", "resume", "cv", "certificate", "degree",
                "identity card", "passport", "proof of enrollment", "bank statement"
            ]
            for idx, line in enumerate(lines):
                sline = line.strip()
                if not sline or len(sline) < 4:
                    continue
                lower_l = sline.lower()
                if any(tk in lower_l for tk in table_keywords):
                    # Check surrounding lines (next 3 lines) for mandatory/optional and specs
                    surrounding = " ".join([lines[k].strip() for k in range(idx, min(len(lines), idx + 4))])
                    norm_surr = re.sub(r"\s+", " ", surrounding)
                    if norm_surr.lower() in seen_passages:
                        continue
                    seen_passages.add(norm_surr.lower())
                    
                    is_mand = "mandatory" in norm_surr.lower() or not any(w in norm_surr.lower() for w in ["optional", "recommended"])
                    cat = RequirementCategory.DOCUMENTS_TO_PREPARE
                    if "purpose" in lower_l or "sop" in lower_l or "form" in lower_l:
                        cat = RequirementCategory.APPLICATION_COMPLETION
                    elif "enrollment" in lower_l or "gpa" in lower_l:
                        cat = RequirementCategory.ELIGIBILITY_VERIFICATION
                        
                    clean_title = sline.strip()
                    title, plain_lang = RequirementEngine._generate_plain_summary(f"Provide {clean_title}. {norm_surr}", cat, is_mand)
                    title = clean_title
                    
                    cite = ProoflineService.create_citation(
                        doc_id=doc_id,
                        doc_name=doc_name,
                        passage=norm_surr,
                        pages_text=pages_text,
                        pdf_path=pdf_path,
                        preferred_page=page_num,
                        section_hint=current_section
                    )
                    
                    requirements.append(Requirement(
                        id=f"req_{req_counter}",
                        title=title,
                        plain_language=plain_lang,
                        original_wording=norm_surr,
                        category=cat,
                        is_mandatory=is_mand,
                        deadline=None,
                        dependencies=[],
                        confidence=0.96,
                        citation=cite,
                        status=TaskStatus.NOT_STARTED,
                        priority=Priority.HIGH if is_mand else Priority.MEDIUM
                    ))
                    req_counter += 1

        # Fallback if no requirements detected (e.g. short document)
        if not requirements:
            requirements = RequirementEngine._fallback_requirements(doc_id, doc_name, pages_text, pdf_path)

        # Build realistic dependencies between requirement stages
        RequirementEngine._assign_dependencies(requirements)
        
        return requirements, dates

    @staticmethod
    def _classify_category(text: str, section: str) -> RequirementCategory:
        combined = (text + " " + section).lower()
        if any(w in combined for w in ["eligib", "gpa", "who can apply", "qualif", "prerequisite", "citizenship", "age limit", "enrolled"]):
            return RequirementCategory.ELIGIBILITY_VERIFICATION
        elif any(w in combined for w in ["transcript", "document", "id proof", "certificate", "resume", "cv", "portfolio", "recommendation", "photo"]):
            return RequirementCategory.DOCUMENTS_TO_PREPARE
        elif any(w in combined for w in ["before apply", "read guide", "register account", "create portal"]):
            return RequirementCategory.BEFORE_APPLYING
        elif any(w in combined for w in ["form", "fill out", "essay", "statement of purpose", "questionnaire", "personal info"]):
            return RequirementCategory.APPLICATION_COMPLETION
        elif any(w in combined for w in ["review", "verify accuracy", "fee payment", "check checklist", "declaration"]):
            return RequirementCategory.FINAL_REVIEW
        elif any(w in combined for w in ["submit", "portal", "mail", "send", "upload final", "confirmation", "receipt"]):
            return RequirementCategory.SUBMISSION
        return RequirementCategory.APPLICATION_COMPLETION

    @staticmethod
    def _generate_plain_summary(passage: str, category: RequirementCategory, is_mandatory: bool) -> Tuple[str, str]:
        p = passage.strip()
        # Clean title
        first_clause = re.split(r"[,;—.]", p)[0]
        title = first_clause.strip()
        if len(title) > 65:
            title = title[:62] + "..."
            
        # Clean prefix words like "applicants must", "candidates shall"
        title = re.sub(r"^(applicants?\s+(?:must|shall|are required to)\s+|must\s+|shall\s+|required:\s*)", "", title, flags=re.IGNORECASE).capitalize()
        
        status_word = "Mandatory: " if is_mandatory else "Optional: "
        plain_lang = f"{status_word}You need to {title.lower()}. Make sure to fulfill all stated criteria before proceeding."
        if category == RequirementCategory.DOCUMENTS_TO_PREPARE:
            plain_lang = f"{status_word}Obtain and format this required document exactly as specified by the guidelines."
        elif category == RequirementCategory.ELIGIBILITY_VERIFICATION:
            plain_lang = f"{status_word}Confirm that you satisfy this eligibility condition before spending time on the application."
        elif category == RequirementCategory.SUBMISSION:
            plain_lang = f"{status_word}Submit the finalized materials through the authorized channel before the cutoff."
            
        return title, plain_lang

    @staticmethod
    def _assign_dependencies(requirements: List[Requirement]):
        # Dependency logic:
        # Eligibility Verification items are prerequisites for Application Completion
        # Documents to Prepare are prerequisites for Submission
        # Application Completion is prerequisite for Final Review & Submission
        elig_ids = [r.id for r in requirements if r.category == RequirementCategory.ELIGIBILITY_VERIFICATION]
        doc_ids = [r.id for r in requirements if r.category == RequirementCategory.DOCUMENTS_TO_PREPARE]
        app_ids = [r.id for r in requirements if r.category == RequirementCategory.APPLICATION_COMPLETION]
        
        for r in requirements:
            if r.category == RequirementCategory.APPLICATION_COMPLETION and elig_ids:
                r.dependencies = elig_ids[:2]
            elif r.category == RequirementCategory.FINAL_REVIEW and app_ids:
                r.dependencies = app_ids[:2]
            elif r.category == RequirementCategory.SUBMISSION:
                deps = []
                if doc_ids:
                    deps.extend(doc_ids[:2])
                if app_ids:
                    deps.append(app_ids[0])
                r.dependencies = deps

    @staticmethod
    def _normalize_date(date_str: str) -> Optional[str]:
        # Simple normalizer for standard display
        cleaned = re.sub(r"\s+", " ", date_str).strip()
        return cleaned

    @staticmethod
    def _fallback_requirements(doc_id: str, doc_name: str, pages_text: Dict[int, str], pdf_path: Optional[Path]) -> List[Requirement]:
        page_1 = pages_text.get(1, "")
        lead = page_1[:200].strip() or "Review document guidelines"
        cite = ProoflineService.create_citation(
            doc_id=doc_id,
            doc_name=doc_name,
            passage=lead,
            pages_text=pages_text,
            pdf_path=pdf_path,
            preferred_page=1,
            section_hint="Overview"
        )
        return [
            Requirement(
                id="req_1",
                title="Review Stated Document Instructions",
                plain_language="Read through the official instructions carefully to confirm all submission procedures.",
                original_wording=lead,
                category=RequirementCategory.BEFORE_APPLYING,
                is_mandatory=True,
                dependencies=[],
                confidence=0.85,
                citation=cite,
                status=TaskStatus.NOT_STARTED,
                priority=Priority.HIGH
            )
        ]
