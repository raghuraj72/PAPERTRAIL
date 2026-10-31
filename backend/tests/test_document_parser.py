import pytest
from pathlib import Path
from app.services.document_parser import DocumentParser

def test_parse_pdf():
    sample_path = Path("backend/app/sample_data/apex_fellowship_guidelines_2026.pdf")
    doc = DocumentParser.parse_file(sample_path, sample_path.name)
    assert doc.page_count == 3
    assert "apex" in doc.document_title.lower() or "fellowship" in doc.document_title.lower()
    assert doc.file_type == "pdf"
    assert len(doc.pages_text) == 3
    assert "minimum cumulative grade point average" in doc.pages_text[1]

def test_parse_txt(tmp_path):
    txt_file = tmp_path / "instructions.txt"
    txt_file.write_text("# FELLOWSHIP NOTICE\nApplicants must submit proof of ID.\nFee is $25.", encoding="utf-8")
    doc = DocumentParser.parse_file(txt_file, "instructions.txt")
    assert doc.page_count == 1
    assert "FELLOWSHIP NOTICE" in doc.document_title
    assert "Applicants must submit proof of ID" in doc.pages_text[1]
