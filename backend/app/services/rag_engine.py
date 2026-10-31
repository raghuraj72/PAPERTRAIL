import re
from typing import List, Dict, Optional, Tuple
from pathlib import Path

from app.models.schemas import ProoflineCitation
from app.services.proofline_service import ProoflineService

class Chunk:
    def __init__(self, doc_id: str, doc_name: str, page_number: int, section_heading: str, text: str):
        self.doc_id = doc_id
        self.doc_name = doc_name
        self.page_number = page_number
        self.section_heading = section_heading
        self.text = text
        self.tokens = set(re.findall(r"\w+", text.lower()))

class RAGEngine:
    @staticmethod
    def chunk_document(doc_id: str, doc_name: str, pages_text: Dict[int, str]) -> List[Chunk]:
        chunks: List[Chunk] = []
        for page_num, text in sorted(pages_text.items()):
            # Divide page by paragraphs / double newlines
            raw_paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
            if not raw_paragraphs:
                raw_paragraphs = [text.strip()] if text.strip() else []
                
            current_heading = "General"
            for p in raw_paragraphs:
                lines = p.split("\n")
                first_line = lines[0].strip()
                if (len(first_line) < 60 and first_line.isupper() and len(first_line) > 3) or first_line.endswith(":"):
                    current_heading = first_line.rstrip(":")
                    
                # If paragraph is very long, break it into 400-char subchunks
                if len(p) > 600:
                    sentences = re.split(r"(?<=[.!?])\s+", p)
                    buf = []
                    curr_len = 0
                    for s in sentences:
                        buf.append(s)
                        curr_len += len(s)
                        if curr_len >= 350:
                            sub_text = " ".join(buf).strip()
                            chunks.append(Chunk(doc_id, doc_name, page_num, current_heading, sub_text))
                            buf = []
                            curr_len = 0
                    if buf:
                        chunks.append(Chunk(doc_id, doc_name, page_num, current_heading, " ".join(buf).strip()))
                else:
                    chunks.append(Chunk(doc_id, doc_name, page_num, current_heading, p))
                    
        return chunks

    @staticmethod
    def retrieve(
        query: str,
        chunks: List[Chunk],
        top_k: int = 4
    ) -> List[Tuple[Chunk, float]]:
        q_tokens = set(re.findall(r"\w+", query.lower()))
        # Remove common stop words
        stops = {"what", "is", "the", "a", "an", "and", "or", "in", "on", "to", "for", "of", "with", "do", "i", "can", "how", "this", "that"}
        meaningful_q = q_tokens - stops
        if not meaningful_q:
            meaningful_q = q_tokens
            
        scored: List[Tuple[Chunk, float]] = []
        
        for c in chunks:
            overlap = len(meaningful_q.intersection(c.tokens))
            if overlap == 0:
                continue
                
            # Score: Jaccard-like + keyword frequency
            freq_score = sum(c.text.lower().count(token) for token in meaningful_q)
            score = (overlap * 2.0 + freq_score * 0.5) / (len(meaningful_q) + 1.0)
            
            # Boost if section heading contains query tokens
            sec_tokens = set(re.findall(r"\w+", c.section_heading.lower()))
            if sec_tokens.intersection(meaningful_q):
                score += 1.5
                
            scored.append((c, round(score, 3)))
            
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
