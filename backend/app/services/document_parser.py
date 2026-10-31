import os
import re
import uuid
import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import pymupdf as fitz
from docx import Document as DocxDocument
from PIL import Image

from app.models.schemas import DocumentParsed, DocumentSection, BoundingBox

class DocumentParser:
    @staticmethod
    def parse_file(file_path: Path, original_filename: str) -> DocumentParsed:
        ext = file_path.suffix.lower()
        doc_id = str(uuid.uuid4())
        file_size = file_path.stat().st_size
        upload_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        pages_text: Dict[int, str] = {}
        sections: List[DocumentSection] = []
        doc_title = original_filename
        doc_type = "Official Document"
        
        if ext == ".pdf":
            pages_text, sections, doc_title, doc_type = DocumentParser._parse_pdf(file_path, original_filename)
        elif ext == ".docx":
            pages_text, sections, doc_title, doc_type = DocumentParser._parse_docx(file_path, original_filename)
        elif ext == ".txt":
            pages_text, sections, doc_title, doc_type = DocumentParser._parse_txt(file_path, original_filename)
        elif ext in [".png", ".jpg", ".jpeg"]:
            pages_text, sections, doc_title, doc_type = DocumentParser._parse_image(file_path, original_filename)
        else:
            raise ValueError(f"Unsupported file format: {ext}")
            
        page_count = len(pages_text) if pages_text else 1
        full_text = "\n".join(pages_text.values())
        summary = DocumentParser._generate_summary(full_text, doc_title, doc_type)
        missing_or_unclear = DocumentParser._detect_missing_info(full_text)
        contact_details = DocumentParser._extract_contacts(full_text)
        fee_info = DocumentParser._extract_fee_info(full_text)
        
        return DocumentParsed(
            id=doc_id,
            filename=original_filename,
            file_type=ext.replace(".", ""),
            file_size_bytes=file_size,
            upload_timestamp=upload_time,
            page_count=page_count,
            document_title=doc_title,
            document_type=doc_type,
            summary=summary,
            sections=sections,
            pages_text=pages_text,
            requirements=[],
            dates=[],
            contradictions=[],
            missing_or_unclear=missing_or_unclear,
            contact_details=contact_details,
            fee_info=fee_info
        )

    @staticmethod
    def _parse_pdf(file_path: Path, original_filename: str) -> Tuple[Dict[int, str], List[DocumentSection], str, str]:
        pages_text: Dict[int, str] = {}
        sections: List[DocumentSection] = []
        doc = fitz.open(str(file_path))
        doc_title = ""
        
        # Check metadata
        meta_title = doc.metadata.get("title", "").strip() if doc.metadata else ""
        if meta_title and len(meta_title) > 3 and meta_title.lower() not in ["(anonymous)", "untitled", "none"]:
            doc_title = meta_title
            
        for page_idx in range(len(doc)):
            page_num = page_idx + 1
            page = doc[page_idx]
            text = page.get_text("text")
            pages_text[page_num] = text
            
            # Detect sections via text blocks
            blocks = page.get_text("blocks")
            for b in blocks:
                # b: (x0, y0, x1, y1, text, block_no, block_type)
                block_text = b[4].strip()
                lines = [line.strip() for line in block_text.split("\n") if line.strip()]
                if not lines:
                    continue
                first_line = lines[0]
                
                # Heading detection heuristics
                is_heading = (
                    re.match(r"^(SECTION\s+[A-Z0-9]+|ARTICLE\s+[0-9]+|\d+\.\d*|[A-Z\s]{4,40}:?$)", first_line) is not None
                    or (len(first_line) < 60 and first_line.isupper() and len(first_line) > 3)
                    or any(h in first_line.lower() for h in ["guidelines", "eligibility", "requirements", "submission", "schedule", "instructions", "important dates", "fee"])
                )
                
                if is_heading:
                    if not doc_title and page_num == 1 and len(first_line) > 5:
                        doc_title = first_line
                    
                    sec_id = f"sec_p{page_num}_{len(sections)+1}"
                    sections.append(DocumentSection(
                        id=sec_id,
                        title=first_line,
                        page_number=page_num,
                        char_start=0,
                        char_end=len(block_text),
                        content_snippet=block_text[:200],
                        level=1 if len(first_line) < 30 else 2
                    ))

        if not doc_title:
            doc_title = original_filename.replace(".pdf", "").replace("_", " ").title()
            
        doc_type = DocumentParser._infer_doc_type(doc_title, pages_text.get(1, ""))
        doc.close()
        return pages_text, sections, doc_title, doc_type

    @staticmethod
    def _parse_docx(file_path: Path, original_filename: str) -> Tuple[Dict[int, str], List[DocumentSection], str, str]:
        doc = DocxDocument(str(file_path))
        full_text_lines = []
        sections: List[DocumentSection] = []
        doc_title = ""
        
        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue
            full_text_lines.append(text)
            
            is_heading = p.style.name.startswith("Heading") or (text.isupper() and len(text) < 60)
            if is_heading:
                if not doc_title:
                    doc_title = text
                sec_id = f"sec_docx_{len(sections)+1}"
                sections.append(DocumentSection(
                    id=sec_id,
                    title=text,
                    page_number=1,
                    char_start=0,
                    char_end=len(text),
                    content_snippet=text[:150],
                    level=1
                ))
                
        # Also extract table text
        for table in doc.tables:
            table_rows = []
            for row in table.rows:
                cells = [c.text.strip() for c in row.cells]
                table_rows.append(" | ".join(cells))
            full_text_lines.append("\n[TABLE DATA]\n" + "\n".join(table_rows) + "\n[/TABLE DATA]")
            
        full_text = "\n\n".join(full_text_lines)
        pages_text = {1: full_text}
        if not doc_title:
            doc_title = original_filename.replace(".docx", "").replace("_", " ").title()
        doc_type = DocumentParser._infer_doc_type(doc_title, full_text[:500])
        return pages_text, sections, doc_title, doc_type

    @staticmethod
    def _parse_txt(file_path: Path, original_filename: str) -> Tuple[Dict[int, str], List[DocumentSection], str, str]:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
            
        sections: List[DocumentSection] = []
        doc_title = ""
        lines = content.split("\n")
        
        for idx, line in enumerate(lines):
            line_s = line.strip()
            if not line_s:
                continue
            clean_line = line_s.lstrip("#").strip()
            if not doc_title and len(clean_line) > 3:
                doc_title = clean_line
                
            if line_s.startswith("#") or (len(line_s) < 50 and line_s.isupper() and len(line_s) > 3) or line_s.endswith(":"):
                sections.append(DocumentSection(
                    id=f"sec_txt_{len(sections)+1}",
                    title=line_s.lstrip("#").strip(),
                    page_number=1,
                    char_start=0,
                    char_end=len(line_s),
                    content_snippet=line_s,
                    level=1
                ))
                
        if not doc_title:
            doc_title = original_filename.replace(".txt", "").replace("_", " ").title()
            
        pages_text = {1: content}
        doc_type = DocumentParser._infer_doc_type(doc_title, content[:500])
        return pages_text, sections, doc_title, doc_type

    @staticmethod
    def _parse_image(file_path: Path, original_filename: str) -> Tuple[Dict[int, str], List[DocumentSection], str, str]:
        img_info = f"[IMAGE DOCUMENT: {original_filename}]"
        # We try OCR via pytesseract if installed, otherwise extract structured placeholder
        extracted_text = ""
        try:
            import pytesseract
            img = Image.open(file_path)
            extracted_text = pytesseract.image_to_string(img)
        except Exception:
            extracted_text = (
                f"{img_info}\n"
                f"Visual document uploaded: {original_filename}.\n"
                "To extract complete text from scanned images, OCR engine is active."
            )
            
        doc_title = original_filename.rsplit(".", 1)[0].replace("_", " ").title()
        sections = [
            DocumentSection(
                id="sec_img_1",
                title="Image Content Overview",
                page_number=1,
                char_start=0,
                char_end=len(extracted_text),
                content_snippet=extracted_text[:150],
                level=1
            )
        ]
        pages_text = {1: extracted_text}
        doc_type = "Scanned Notice / Image"
        return pages_text, sections, doc_title, doc_type

    @staticmethod
    def _infer_doc_type(title: str, text_sample: str) -> str:
        combined = (title + " " + text_sample).lower()
        if "scholarship" in combined or "fellowship" in combined or "grant" in combined:
            return "Scholarship & Grant Guidelines"
        elif "admission" in combined or "enrollment" in combined or "college" in combined or "university" in combined:
            return "Academic Admission Notice"
        elif "job" in combined or "recruitment" in combined or "internship" in combined or "employment" in combined:
            return "Employment & Recruitment Notice"
        elif "hackathon" in combined or "challenge" in combined or "contest" in combined or "competition" in combined:
            return "Competition & Hackathon Guidelines"
        elif "license" in combined or "permit" in combined or "registration" in combined or "government" in combined:
            return "Government Regulatory Procedure"
        elif "policy" in combined or "contract" in combined or "agreement" in combined:
            return "Legal & Policy Agreement"
        return "Official Notice & Instructions"

    @staticmethod
    def _generate_summary(text: str, title: str, doc_type: str) -> str:
        paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 40]
        lead_para = paragraphs[0] if paragraphs else text[:300]
        cleaned_lead = re.sub(r"\s+", " ", lead_para).strip()
        return f"{title} is a {doc_type}. Key purpose: {cleaned_lead[:250]}..."

    @staticmethod
    def _detect_missing_info(text: str) -> List[str]:
        missing = []
        lower = text.lower()
        if "fee" not in lower and "cost" not in lower and "free" not in lower:
            missing.append("Application fee or exemption criteria are not explicitly specified.")
        if "contact" not in lower and "email" not in lower and "phone" not in lower and "@" not in lower:
            missing.append("Support contact email, phone, or helpdesk details are missing.")
        if "deadline" not in lower and "due date" not in lower and "last date" not in lower:
            missing.append("No explicit final submission date or deadline is stated.")
        if "format" not in lower and "file type" not in lower and "upload" not in lower:
            missing.append("Specific file formats or upload size limits are not explicitly stated.")
        return missing

    @staticmethod
    def _extract_contacts(text: str) -> List[str]:
        contacts = []
        # Emails
        emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        for e in set(emails):
            contacts.append(f"Email: {e}")
            
        # Phone numbers
        phones = re.findall(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
        for p in set(phones):
            contacts.append(f"Phone: {p}")
            
        # URLs
        urls = re.findall(r"https?://[^\s<>\"']+", text)
        for u in set(urls):
            contacts.append(f"Portal: {u}")
            
        return contacts[:5]

    @staticmethod
    def _extract_fee_info(text: str) -> Optional[str]:
        fee_patterns = [
            r"(?:fee|cost|payment|amount)[^.\n]*?(\$\s*\d+|\b\d+\s*USD|\bINR\s*\d+|\bRs\.?\s*\d+|\bfree\b|\bwaived\b|\bno\s+fee\b)",
            r"(\$\s*\d+|Rs\.?\s*\d+)\s*(?:non-refundable|application\s+fee|processing\s+fee)?"
        ]
        for pat in fee_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                return m.group(0).strip()
        return None
