from typing import List, Dict

from app.models.schemas import (
    Workspace,
    ReadinessReport,
    TaskStatus,
    Priority,
    Contradiction,
    ExtractedDate
)

class ReadinessService:
    @staticmethod
    def evaluate_readiness(workspace: Workspace) -> ReadinessReport:
        requirements = workspace.combined_requirements
        contradictions = workspace.combined_contradictions
        
        mandatory_reqs = [r for r in requirements if r.is_mandatory]
        optional_reqs = [r for r in requirements if not r.is_mandatory]
        
        mandatory_total = len(mandatory_reqs)
        mandatory_completed = sum(1 for r in mandatory_reqs if r.status == TaskStatus.COMPLETED)
        
        optional_total = len(optional_reqs)
        optional_completed = sum(1 for r in optional_reqs if r.status == TaskStatus.COMPLETED)
        
        # Check unverified citations
        unverified_count = sum(1 for r in requirements if not r.citation.verified)
        
        # Critical contradictions
        blocking_contradictions = [c for c in contradictions if c.severity == "critical"]
        
        # Missing information from documents
        missing_critical_info: List[str] = []
        for doc in workspace.documents:
            missing_critical_info.extend(doc.missing_or_unclear)
        missing_critical_info = list(set(missing_critical_info))
        
        # Upcoming / critical deadlines
        all_dates: List[ExtractedDate] = []
        for doc in workspace.documents:
            all_dates.extend([d for d in doc.dates if d.is_critical])
            
        # Compute Readiness Score (0 - 100)
        # Base weight: mandatory tasks (50%), optional tasks (15%), contradictions (20%), citations verified (15%)
        score = 0.0
        if mandatory_total > 0:
            score += (mandatory_completed / mandatory_total) * 50.0
        else:
            score += 50.0
            
        if optional_total > 0:
            score += (optional_completed / optional_total) * 15.0
        else:
            score += 15.0
            
        if not blocking_contradictions:
            score += 20.0
        else:
            score += max(0.0, 20.0 - (len(blocking_contradictions) * 10.0))
            
        if requirements:
            verified_ratio = (len(requirements) - unverified_count) / len(requirements)
            score += verified_ratio * 15.0
        else:
            score += 15.0
            
        final_score = int(round(score))
        
        # Determine overall status
        recommendations = []
        if blocking_contradictions:
            overall_status = "CONTRADICTIONS_DETECTED"
            recommendations.append("Resolve blocking contradictions with the issuing desk before finalizing your application.")
        elif mandatory_completed < mandatory_total:
            overall_status = "INCOMPLETE_TASKS"
            missing_count = mandatory_total - mandatory_completed
            recommendations.append(f"You have {missing_count} mandatory requirement(s) that are not yet marked as completed.")
        elif missing_critical_info:
            overall_status = "MORE_INFO_NEEDED"
            recommendations.append("Certain administrative details (fees, contact, or file specs) are absent from the document.")
        else:
            overall_status = "READY_FOR_USER_REVIEW"
            recommendations.append("All mandatory tasks are marked complete. Review all uploads one last time before final submission.")

        checklist_summary = {
            "Total Requirements": len(requirements),
            "Mandatory Completed": mandatory_completed,
            "Mandatory Pending": mandatory_total - mandatory_completed,
            "Optional Completed": optional_completed,
            "Blocking Contradictions": len(blocking_contradictions),
            "Unverified Citations": unverified_count
        }

        return ReadinessReport(
            overall_status=overall_status,
            readiness_score=final_score,
            mandatory_completed=mandatory_completed,
            mandatory_total=mandatory_total,
            optional_completed=optional_completed,
            optional_total=optional_total,
            unverified_citations_count=unverified_count,
            blocking_contradictions=blocking_contradictions,
            missing_critical_info=missing_critical_info,
            upcoming_deadlines=all_dates[:5],
            checklist_summary=checklist_summary,
            recommendations=recommendations
        )
