import re
from typing import List, Dict, Any

from app.models.schemas import (
    DocumentParsed,
    DocumentComparisonResult,
    Requirement
)

class ComparisonEngine:
    @staticmethod
    def compare_documents(doc_a: DocumentParsed, doc_b: DocumentParsed) -> DocumentComparisonResult:
        # Map requirements by normalized title/essence
        reqs_a_map = {re.sub(r"\W+", " ", r.title.lower()).strip(): r for r in doc_a.requirements}
        reqs_b_map = {re.sub(r"\W+", " ", r.title.lower()).strip(): r for r in doc_b.requirements}
        
        added_requirements: List[Requirement] = []
        removed_requirements: List[Requirement] = []
        modified_requirements: List[Dict[str, Any]] = []
        
        # Check added in B
        for key_b, req_b in reqs_b_map.items():
            if key_b not in reqs_a_map:
                # Check for partial matches
                partial = any(key_b in key_a or key_a in key_b for key_a in reqs_a_map)
                if not partial:
                    added_requirements.append(req_b)
            else:
                # Exists in both: compare changes
                req_a = reqs_a_map[key_b]
                diffs = []
                if req_a.is_mandatory != req_b.is_mandatory:
                    diffs.append(f"Mandatory changed from {req_a.is_mandatory} to {req_b.is_mandatory}")
                if req_a.deadline != req_b.deadline and req_b.deadline:
                    diffs.append(f"Deadline changed from '{req_a.deadline}' to '{req_b.deadline}'")
                if req_a.original_wording.strip() != req_b.original_wording.strip():
                    diffs.append("Wording updated")
                    
                if diffs:
                    modified_requirements.append({
                        "requirement_title": req_b.title,
                        "differences": diffs,
                        "doc_a_passage": req_a.citation.exact_passage,
                        "doc_b_passage": req_b.citation.exact_passage
                    })
                    
        # Check removed in B
        for key_a, req_a in reqs_a_map.items():
            if key_a not in reqs_b_map:
                partial = any(key_a in key_b or key_b in key_a for key_b in reqs_b_map)
                if not partial:
                    removed_requirements.append(req_a)

        # Changed Deadlines
        dates_a = {re.sub(r"\s+", " ", d.date_text.lower()): d for d in doc_a.dates}
        dates_b = {re.sub(r"\s+", " ", d.date_text.lower()): d for d in doc_b.dates}
        changed_deadlines = []
        for db_text, db in dates_b.items():
            if db_text not in dates_a:
                changed_deadlines.append({
                    "date": db.date_text,
                    "event": db.event_description,
                    "change_type": "New or Updated Date",
                    "doc_name": doc_b.filename
                })

        summary_parts = []
        if added_requirements:
            summary_parts.append(f"{len(added_requirements)} new requirement(s) introduced in {doc_b.filename}.")
        if removed_requirements:
            summary_parts.append(f"{len(removed_requirements)} requirement(s) eliminated from {doc_a.filename}.")
        if modified_requirements:
            summary_parts.append(f"{len(modified_requirements)} existing requirement(s) modified.")
        if changed_deadlines:
            summary_parts.append(f"{len(changed_deadlines)} date difference(s) detected.")
        if not summary_parts:
            summary_parts.append("Both versions are substantially identical with no significant requirement alterations.")

        return DocumentComparisonResult(
            doc_a_name=doc_a.filename,
            doc_b_name=doc_b.filename,
            added_requirements=added_requirements,
            removed_requirements=removed_requirements,
            modified_requirements=modified_requirements,
            changed_deadlines=changed_deadlines,
            summary_of_changes=" ".join(summary_parts)
        )
