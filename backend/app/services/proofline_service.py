import re
import uuid
from typing import Dict, Optional, Tuple, List
from pathlib import Path
import pymupdf as fitz

from app.models.schemas import ProoflineCitation, BoundingBox

class ProoflineService:
    @staticmethod
    def create_citation(
        doc_id: str,
        doc_name: str,
        passage: str,
        pages_text: Dict[int, str],
        pdf_path: Optional[Path] = None,
        preferred_page: Optional[int] = None,
        section_hint: Optional[str] = None
    ) -> ProoflineCitation:
        clean_passage = passage.strip()
        found_page, char_start, char_end, matched_text, confidence = ProoflineService._find_passage(
            clean_passage, pages_text, preferred_page
        )
        
        # Bounding box for PDF navigation
        bbox = None
        if pdf_path and pdf_path.exists() and pdf_path.suffix.lower() == ".pdf" and found_page > 0:
            bbox = ProoflineService._extract_pdf_bbox(pdf_path, found_page, matched_text or clean_passage)
            
        section_heading = section_hint or ProoflineService._infer_section_heading(
            pages_text.get(found_page, ""), char_start
        )
        
        verified = confidence >= 0.85
        
        return ProoflineCitation(
            id=f"cite_{uuid.uuid4().hex[:10]}",
            document_id=doc_id,
            document_name=doc_name,
            page_number=max(1, found_page),
            section_heading=section_heading,
            exact_passage=matched_text if matched_text else clean_passage,
            char_start=char_start,
            char_end=char_end,
            bounding_box=bbox,
            confidence=confidence,
            verified=verified,
            explanation=f"Found on Page {max(1, found_page)} under '{section_heading}'" if verified else "Partial match located in text"
        )

    @staticmethod
    def _find_passage(
        passage: str, pages_text: Dict[int, str], preferred_page: Optional[int] = None
    ) -> Tuple[int, int, int, str, float]:
        norm_passage = re.sub(r"\s+", " ", passage.lower()).strip()
        if not norm_passage:
            return (1, 0, 0, passage, 0.5)

        # Check preferred page first if specified
        order = []
        if preferred_page and preferred_page in pages_text:
            order.append(preferred_page)
        for p in sorted(pages_text.keys()):
            if p not in order:
                order.append(p)
                
        # 1. Exact case-insensitive match
        for page_num in order:
            page_content = pages_text[page_num]
            norm_page = re.sub(r"\s+", " ", page_content)
            
            # Substring match
            idx = norm_page.lower().find(norm_passage)
            if idx != -1:
                # Find matching slice in original page text
                matched_slice = norm_page[idx:idx + len(norm_passage)]
                return (page_num, idx, idx + len(norm_passage), matched_slice, 1.0)
                
        # 2. Windowed match with word n-grams
        words = norm_passage.split()
        if len(words) >= 4:
            # Try sub-phrase (first 5 words or last 5 words)
            sub_phrase = " ".join(words[:min(6, len(words))])
            for page_num in order:
                page_content = pages_text[page_num]
                norm_page = re.sub(r"\s+", " ", page_content)
                idx = norm_page.lower().find(sub_phrase)
                if idx != -1:
                    matched_slice = norm_page[idx:min(idx + len(passage) + 40, len(norm_page))]
                    return (page_num, idx, idx + len(matched_slice), matched_slice, 0.92)

        # 3. Keyword density fallback
        best_page = 1
        best_score = 0
        best_idx = 0
        keywords = [w for w in words if len(w) > 3]
        if keywords:
            for page_num in order:
                content = pages_text[page_num].lower()
                matches = sum(1 for kw in keywords if kw in content)
                score = matches / len(keywords)
                if score > best_score:
                    best_score = score
                    best_page = page_num
                    first_kw = next((kw for kw in keywords if kw in content), None)
                    if first_kw:
                        best_idx = content.find(first_kw)
                        
            if best_score > 0.5:
                return (best_page, best_idx, best_idx + 100, passage[:150], round(best_score, 2))
                
        return (preferred_page or 1, 0, len(passage), passage, 0.6)

    @staticmethod
    def _extract_pdf_bbox(pdf_path: Path, page_num: int, search_phrase: str) -> Optional[BoundingBox]:
        try:
            doc = fitz.open(str(pdf_path))
            if page_num > len(doc) or page_num < 1:
                doc.close()
                return None
            page = doc[page_num - 1]
            
            # Search for up to the first 40 chars of the phrase
            terms = [
                search_phrase[:40].strip(),
                " ".join(search_phrase.split()[:4]),
                search_phrase.split()[0] if search_phrase.split() else ""
            ]
            
            for term in terms:
                if not term:
                    continue
                rects = page.search_for(term)
                if rects:
                    r = rects[0]
                    doc.close()
                    return BoundingBox(
                        x0=round(r.x0, 2),
                        y0=round(r.y0, 2),
                        x1=round(r.x1, 2),
                        y1=round(r.y1, 2)
                    )
            doc.close()
        except Exception:
            pass
        return None

    @staticmethod
    def _infer_section_heading(page_text: str, char_pos: int) -> str:
        lines = page_text.split("\n")
        current_heading = "General"
        running_char = 0
        
        for line in lines:
            running_char += len(line) + 1
            sline = line.strip()
            if not sline:
                continue
            is_header = (
                (len(sline) < 60 and sline.isupper() and len(sline) > 3)
                or re.match(r"^(SECTION\s+[A-Z0-9]+|ARTICLE\s+[0-9]+|\d+\.\d+|PART\s+[A-Z0-9]+)", sline, re.IGNORECASE)
                or sline.endswith(":")
            )
            if is_header:
                current_heading = sline.rstrip(":")
            if running_char >= char_pos and char_pos > 0:
                break
                
        return current_heading

    @staticmethod
    def validate_citation(citation: ProoflineCitation, pages_text: Dict[int, str]) -> bool:
        page_content = pages_text.get(citation.page_number, "")
        if not page_content:
            return False
        clean_citation = re.sub(r"\s+", " ", citation.exact_passage.lower()).strip()
        clean_page = re.sub(r"\s+", " ", page_content.lower())
        
        # Exact or partial match
        if clean_citation in clean_page:
            return True
            
        words = clean_citation.split()
        if len(words) >= 3:
            subset = " ".join(words[:4])
            return subset in clean_page
            
        return False
