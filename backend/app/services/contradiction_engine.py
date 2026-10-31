import re
from typing import List, Dict, Optional
from pathlib import Path

from app.models.schemas import Contradiction, ExtractedDate, Requirement, ProoflineCitation
from app.services.proofline_service import ProoflineService

class ContradictionEngine:
    @staticmethod
    def detect_contradictions(
        doc_id: str,
        doc_name: str,
        pages_text: Dict[int, str],
        dates: List[ExtractedDate],
        requirements: List[Requirement],
        pdf_path: Optional[Path] = None
    ) -> List[Contradiction]:
        contradictions: List[Contradiction] = []
        c_count = 1
        
        # 1. Conflicting Deadlines
        # Look for explicit conflicting submission dates
        deadline_candidates = [
            d for d in dates if any(k in d.event_description.lower() for k in [
                "deadline", "due date", "last date", "submission close", "cutoff", "applications due"
            ])
        ]
        
        if len(deadline_candidates) >= 2:
            # Check if dates mention different days/months
            for i in range(len(deadline_candidates)):
                for j in range(i + 1, len(deadline_candidates)):
                    d1 = deadline_candidates[i]
                    d2 = deadline_candidates[j]
                    
                    # If date texts are distinct and not referring to different phases (e.g., draft vs final)
                    t1 = d1.date_text.strip().lower()
                    t2 = d2.date_text.strip().lower()
                    if t1 != t2 and ("final" in d1.event_description.lower() or "final" in d2.event_description.lower() or "submission" in d1.event_description.lower()):
                        contradictions.append(Contradiction(
                            id=f"contra_{c_count}",
                            title="Conflicting Application Deadlines",
                            topic="deadline",
                            passage_a=d1.citation,
                            passage_b=d2.citation,
                            discrepancy_explanation=(
                                f"The document provides two different final dates: '{d1.date_text}' (Page {d1.citation.page_number}) "
                                f"and '{d2.date_text}' (Page {d2.citation.page_number}). "
                                "It is unclear whether one is an extension or a clerical inconsistency."
                            ),
                            severity="critical",
                            suggested_action="Contact the issuing authority immediately to verify the true binding cutoff date before planning your submission."
                        ))
                        c_count += 1
                        break
                if contradictions:
                    break

        # 2. Conflicting Fee Information
        all_text = " ".join([f"[Page {p}] {t}" for p, t in pages_text.items()])
        fee_matches = list(re.finditer(r"(?:fee|cost|payment|amount)[^.\n]{0,60}(\$\s*\d+|\b\d+\s*USD|\bfree\b|\bwaived\b|\bno\s+fee\b)", all_text, re.IGNORECASE))
        if len(fee_matches) >= 2:
            fee_values = set()
            snippets = []
            for fm in fee_matches:
                val = fm.group(1).lower().strip()
                val_clean = re.sub(r"\s+", "", val)
                if val_clean not in fee_values:
                    fee_values.add(val_clean)
                    # Extract surrounding passage
                    start = max(0, fm.start() - 20)
                    end = min(len(all_text), fm.end() + 80)
                    snippets.append((val, all_text[start:end].strip()))
                    
            if len(fee_values) >= 2:
                # We have distinct fee statements!
                val1, pass1 = snippets[0]
                val2, pass2 = snippets[1]
                cite1 = ProoflineService.create_citation(doc_id, doc_name, pass1, pages_text, pdf_path)
                cite2 = ProoflineService.create_citation(doc_id, doc_name, pass2, pages_text, pdf_path)
                contradictions.append(Contradiction(
                    id=f"contra_{c_count}",
                    title="Inconsistent Application Fee Requirement",
                    topic="fee",
                    passage_a=cite1,
                    passage_b=cite2,
                    discrepancy_explanation=(
                        f"One section references a fee structure of '{val1}', while another section states '{val2}'. "
                        "This could indicate either conditional fee waivers or conflicting instructions."
                    ),
                    severity="warning",
                    suggested_action="Verify fee requirements with the program billing coordinator prior to final payment submission."
                ))
                c_count += 1

        # 3. Conflicting Submission Instructions (e.g. Online Portal vs Postal Mail)
        online_matches = list(re.finditer(r"(?:online\s+portal\s+only|digital\s+submissions?\s+exclusively|no\s+hard\s+copies|upload\s+via\s+website)[^.\n]*\.", all_text, re.IGNORECASE))
        postal_matches = list(re.finditer(r"(?:mail\s+hard\s+copies|physical\s+copy\s+required|send\s+by\s+post|submit\s+in\s+person)[^.\n]*\.", all_text, re.IGNORECASE))
        
        if online_matches and postal_matches:
            pass_online = online_matches[0].group(0).strip()
            pass_postal = postal_matches[0].group(0).strip()
            cite_online = ProoflineService.create_citation(doc_id, doc_name, pass_online, pages_text, pdf_path)
            cite_postal = ProoflineService.create_citation(doc_id, doc_name, pass_postal, pages_text, pdf_path)
            contradictions.append(Contradiction(
                id=f"contra_{c_count}",
                title="Conflicting Submission Method (Digital vs Physical)",
                topic="submission",
                passage_a=cite_online,
                passage_b=cite_postal,
                discrepancy_explanation=(
                    "The document states in one part that submissions are exclusively online, but another clause mentions "
                    "physical copies or postal delivery."
                ),
                severity="critical",
                suggested_action="Confirm with the submission desk whether a physical duplicate must be dispatched following digital submission."
            ))
            c_count += 1

        # 4. Conflicting Eligibility Clauses (e.g. Undergrad only vs Graduate students permitted)
        undergrad_only = list(re.finditer(r"(?:open\s+exclusively\s+to\s+undergraduates|only\s+enrolled\s+undergraduate\s+students)[^.\n]*\.", all_text, re.IGNORECASE))
        grad_allowed = list(re.finditer(r"(?:graduate\s+students\s+may\s+apply|master's\s+and\s+phd\s+candidates\s+are\s+eligible)[^.\n]*\.", all_text, re.IGNORECASE))
        if undergrad_only and grad_allowed:
            p_under = undergrad_only[0].group(0).strip()
            p_grad = grad_allowed[0].group(0).strip()
            cite_under = ProoflineService.create_citation(doc_id, doc_name, p_under, pages_text, pdf_path)
            cite_grad = ProoflineService.create_citation(doc_id, doc_name, p_grad, pages_text, pdf_path)
            contradictions.append(Contradiction(
                id=f"contra_{c_count}",
                title="Ambiguous Eligibility Scope",
                topic="eligibility",
                passage_a=cite_under,
                passage_b=cite_grad,
                discrepancy_explanation=(
                    "Contradictory eligibility criteria detected regarding student degree level: one section specifies "
                    "undergraduates exclusively, while another admits graduate researchers."
                ),
                severity="warning",
                suggested_action="Confirm your enrollment tier eligibility with the program committee."
            ))
            c_count += 1

        return contradictions
