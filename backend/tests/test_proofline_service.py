import pytest
from app.services.proofline_service import ProoflineService

def test_proofline_citation_exact_match():
    pages = {
        1: "Welcome to the fellowship. The application deadline is October 15, 2026 at 11:59 PM EST.",
        2: "All applicants must submit two letters of recommendation."
    }
    cite = ProoflineService.create_citation(
        doc_id="d1",
        doc_name="fellowship.pdf",
        passage="The application deadline is October 15, 2026",
        pages_text=pages
    )
    assert cite.page_number == 1
    assert cite.verified is True
    assert cite.confidence >= 0.95
    assert ProoflineService.validate_citation(cite, pages) is True

def test_proofline_citation_fuzzy_match():
    pages = {
        1: "Applicants must provide proof of active university enrollment issued recently."
    }
    cite = ProoflineService.create_citation(
        doc_id="d1",
        doc_name="guidelines.pdf",
        passage="Applicants must provide proof of active university enrollment",
        pages_text=pages
    )
    assert cite.page_number == 1
    assert cite.verified is True
