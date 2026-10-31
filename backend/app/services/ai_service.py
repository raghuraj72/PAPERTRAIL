import os
import re
import json
import httpx
from typing import List, Optional, Dict
from pathlib import Path

from app.config import settings
from app.models.schemas import (
    Workspace,
    DocumentParsed,
    AskPapertrailResponse,
    ProoflineCitation,
)
from app.services.rag_engine import RAGEngine, Chunk
from app.services.proofline_service import ProoflineService

class AIService:
    @staticmethod
    def answer_question(
        workspace: Workspace,
        question: str,
        document_id: Optional[str] = None,
        target_language: str = "en"
    ) -> AskPapertrailResponse:
        # 1. Gather relevant documents
        docs_to_search: List[DocumentParsed] = []
        if document_id:
            docs_to_search = [d for d in workspace.documents if d.id == document_id]
        if not docs_to_search:
            docs_to_search = workspace.documents
            
        if not docs_to_search:
            return AskPapertrailResponse(
                answer="No documents are currently loaded in this workspace. Please upload a document first.",
                confidence=0.0,
                citations=[],
                is_inferred=False,
                uncertainty_warning="Empty workspace"
            )

        # 2. Chunk documents and retrieve top passages
        all_chunks: List[Chunk] = []
        for doc in docs_to_search:
            all_chunks.extend(RAGEngine.chunk_document(doc.id, doc.filename, doc.pages_text))
            
        retrieved = RAGEngine.retrieve(question, all_chunks, top_k=4)
        
        # 3. Grounding check: if no relevant passages found
        if not retrieved or retrieved[0][1] < 0.8:
            return AskPapertrailResponse(
                answer="The uploaded document does not provide enough information to answer this confidently. Please review the document or contact the issuing authority.",
                confidence=0.1,
                citations=[],
                is_inferred=False,
                uncertainty_warning="Information absent from uploaded materials",
                suggested_next_questions=[
                    "What documents are required?",
                    "What are the application deadlines?",
                    "Am I eligible according to this notice?"
                ]
            )

        # 4. Generate Answer using chosen provider
        provider = settings.DEFAULT_PROVIDER.lower()
        if provider == "gemini" and settings.GEMINI_API_KEY:
            try:
                return AIService._gemini_answer(question, retrieved, target_language, docs_to_search)
            except Exception as e:
                # Fallback gracefully to deterministic engine
                pass
        elif provider == "ollama":
            try:
                return AIService._ollama_answer(question, retrieved, target_language, docs_to_search)
            except Exception as e:
                pass
                
        # High-precision deterministic grounded engine
        return AIService._deterministic_answer(question, retrieved, target_language, docs_to_search)

    @staticmethod
    def _deterministic_answer(
        question: str,
        retrieved: List[tuple],
        target_language: str,
        docs: List[DocumentParsed]
    ) -> AskPapertrailResponse:
        top_chunk, score = retrieved[0]
        citations: List[ProoflineCitation] = []
        
        # Collect distinct citations from top chunks
        seen_pages = set()
        for chunk, s in retrieved:
            if chunk.page_number in seen_pages:
                continue
            seen_pages.add(chunk.page_number)
            
            # Find the best sentence in the chunk that answers the query
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", chunk.text) if len(s.strip()) > 15]
            q_words = set(re.findall(r"\w+", question.lower()))
            best_sentence = chunk.text[:200]
            max_w_overlap = 0
            for sent in sentences:
                overlap = len(set(re.findall(r"\w+", sent.lower())).intersection(q_words))
                if overlap > max_w_overlap:
                    max_w_overlap = overlap
                    best_sentence = sent
                    
            target_doc = next((d for d in docs if d.id == chunk.doc_id), docs[0])
            cite = ProoflineService.create_citation(
                doc_id=chunk.doc_id,
                doc_name=chunk.doc_name,
                passage=best_sentence,
                pages_text=target_doc.pages_text,
                preferred_page=chunk.page_number,
                section_hint=chunk.section_heading
            )
            citations.append(cite)

        # Format concise answer directly backed by the primary passage
        primary_passage = citations[0].exact_passage if citations else top_chunk.text
        page_ref = citations[0].page_number if citations else top_chunk.page_number
        section_ref = citations[0].section_heading if citations else top_chunk.section_heading
        
        answer_en = (
            f"Based on Page {page_ref} (Section '{section_ref}'):\n\n"
            f"\"{primary_passage}\"\n\n"
            "This requirement is directly grounded in the official document text. "
            "Please click the Proofline citation below to view the exact page and highlight."
        )
        
        if target_language == "hi":
            answer_text = (
                f"आधिकारिक दस्तावेज़ के पृष्ठ {page_ref} (अनुभाग '{section_ref}') के अनुसार:\n\n"
                f"\"{primary_passage}\"\n\n"
                "यह जानकारी सीधे दस्तावेज़ के आधार पर है। विवरण देखने के लिए नीचे दिए गए Proofline स्रोत पर क्लिक करें।"
            )
        elif target_language == "hinglish":
            answer_text = (
                f"Document ke Page {page_ref} (Section '{section_ref}') ke mutabik:\n\n"
                f"\"{primary_passage}\"\n\n"
                "Yeh requirement directly document se verified hai. Proofline citation par click karke original page dekh sakte hain."
            )
        else:
            answer_text = answer_en

        confidence = min(0.98, max(0.75, score / 4.0))
        
        # Suggested next questions
        suggested = [
            "Are there any exceptions or waivers mentioned?",
            "What happens if I miss the stated deadline?",
            "Which documents are mandatory vs optional?"
        ]

        return AskPapertrailResponse(
            answer=answer_text,
            confidence=round(confidence, 2),
            citations=citations,
            is_inferred=False,
            uncertainty_warning=None if confidence >= 0.85 else "Partially confident match",
            suggested_next_questions=suggested
        )

    @staticmethod
    def _gemini_answer(
        question: str,
        retrieved: List[tuple],
        target_language: str,
        docs: List[DocumentParsed]
    ) -> AskPapertrailResponse:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        context_blocks = []
        for chunk, _ in retrieved:
            context_blocks.append(f"[Doc: {chunk.doc_name} | Page: {chunk.page_number} | Section: {chunk.section_heading}]\n{chunk.text}")
        context_str = "\n\n---\n\n".join(context_blocks)
        
        system_instruction = (
            "You are PAPERTRAIL AI, an evidence-grounded document assistant. "
            "Answer the user's question using ONLY the provided document excerpts. "
            "For every key statement, cite the exact quote and page number. "
            "If the document does not contain the answer, explicitly state: "
            "'The uploaded document does not provide enough information to answer this confidently.' "
            "Never invent facts, deadlines, or eligibility decisions."
        )
        
        prompt = (
            f"DOCUMENT EXCERPTS:\n{context_str}\n\n"
            f"USER QUESTION: {question}\n\n"
            f"TARGET LANGUAGE: {target_language}\n"
            "Provide your response clearly and concisely."
        )
        
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={"system_instruction": system_instruction}
        )
        
        answer_text = response.text or "Unable to generate response from model."
        
        # Extract citations from the top chunks
        citations = []
        for chunk, _ in retrieved[:2]:
            target_doc = next((d for d in docs if d.id == chunk.doc_id), docs[0])
            cite = ProoflineService.create_citation(
                doc_id=chunk.doc_id,
                doc_name=chunk.doc_name,
                passage=chunk.text[:180],
                pages_text=target_doc.pages_text,
                preferred_page=chunk.page_number,
                section_hint=chunk.section_heading
            )
            citations.append(cite)
            
        return AskPapertrailResponse(
            answer=answer_text,
            confidence=0.95,
            citations=citations,
            is_inferred=False,
            suggested_next_questions=[
                "Which documents are required?",
                "What is the final deadline?",
                "Are there any fees?"
            ]
        )

    @staticmethod
    def _ollama_answer(
        question: str,
        retrieved: List[tuple],
        target_language: str,
        docs: List[DocumentParsed]
    ) -> AskPapertrailResponse:
        context_blocks = [f"[Page {c.page_number} - {c.section_heading}]: {c.text}" for c, _ in retrieved]
        context_str = "\n\n".join(context_blocks)
        
        prompt = (
            f"You are PAPERTRAIL AI. Answer ONLY based on these document passages:\n{context_str}\n\n"
            f"Question: {question}\n"
            "Answer concisely with exact citations:"
        )
        
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": settings.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False
                }
            )
            if resp.status_code == 200:
                result = resp.json().get("response", "")
                citations = []
                for chunk, _ in retrieved[:2]:
                    target_doc = next((d for d in docs if d.id == chunk.doc_id), docs[0])
                    cite = ProoflineService.create_citation(
                        doc_id=chunk.doc_id,
                        doc_name=chunk.doc_name,
                        passage=chunk.text[:180],
                        pages_text=target_doc.pages_text,
                        preferred_page=chunk.page_number,
                        section_hint=chunk.section_heading
                    )
                    citations.append(cite)
                return AskPapertrailResponse(
                    answer=result,
                    confidence=0.92,
                    citations=citations,
                    is_inferred=False
                )
        raise RuntimeError("Ollama connection failed")
