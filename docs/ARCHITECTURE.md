# System Architecture & Technical Specifications

**PAPERTRAIL — The Clarity Engine**  
*Tagline: "Understand the requirements. Know what to do. Never submit blindly."*

---

## 1. Architectural Overview

PAPERTRAIL is designed with an **evidence-first, privacy-conscious** architecture. Rather than treating documents as generic token streams for loose summarization, PAPERTRAIL parses documents into structured entities (Requirements, Dates, Contradictions, Sections) with verified **Proofline** citations.

```
                           +--------------------------------------+
                           |          PAPERTRAIL Client           |
                           |  React 19 + TypeScript + Tailwind 4  |
                           +-------------------+------------------+
                                               |
                                     HTTP REST / JSON API
                                               |
                                               v
+-----------------------------------------------------------------------------------------+
|                                    FastAPI Backend                                      |
|                                                                                         |
|  +-----------------------+   +------------------------+   +--------------------------+  |
|  |    Document Parser    |   |   Requirement Engine   |   |   Contradiction Engine   |  |
|  | (PyMuPDF, docx, PIL)  |   | (Stages, Dependencies) |   | (Dual-Passage Detection) |  |
|  +-----------+-----------+   +-----------+------------+   +------------+-------------+  |
|              |                           |                             |                |
|              +---------------------------+-----------------------------+                |
|                                          |                                              |
|                                          v                                              |
|                           +-------------------------------+                             |
|                           |       Proofline Service       |                             |
|                           | (Passage Locator & Verifier)  |                             |
|                           +--------------+----------------+                             |
|                                          |                                              |
|       +----------------------------------+----------------------------------+           |
|       |                                  |                                  |           |
|       v                                  v                                  v           |
|  +-------------------------+  +----------------------+  +----------------------------+  |
|  | Deterministic Grounded  |  |    Gemini 2.5 Flash  |  |    Ollama / Gemma:2b       |  |
|  |     Engine (Local)      |  |   (Cloud - Optional) |  |     (Local Open-Weight)    |  |
|  +-------------------------+  +----------------------+  +----------------------------+  |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
                                           |
                                Local Storage Engine
                                (JSON Workspaces & Files)
```

---

## 2. Core Subsystems

### A. Document Parser (`document_parser.py`)
- **PyMuPDF (`pymupdf`)**: Extracts layout, blocks, lines, character offsets, and bounding boxes `(x0, y0, x1, y1)` page-by-page.
- **python-docx**: Traverses XML paragraph styles, headings (`Heading 1-3`), and table row structures.
- **Image / OCR**: Prepares visual documents for OCR character recognition.
- **Metadata Cleaner**: Sanitizes anonymous default PDF metadata strings and detects document classification (Academic, Fellowship, Job, Regulatory).

### B. Requirement Extraction & Action Plan Pipeline (`requirement_engine.py`)
- Identifies modal obligations (`must`, `shall`, `required`, `mandatory`) vs recommendations (`optional`, `recommended`, `encouraged`).
- Parses document tables and checklists into categorized task objects.
- Maps each requirement into one of 6 lifecycle stages:
  1. **Eligibility Verification** (prerequisites, GPA, citizenship)
  2. **Before Applying** (reading guidelines, account setup)
  3. **Documents to Prepare** (transcripts, IDs, recommendation letters)
  4. **Application Completion** (questionnaires, SOP, research statements)
  5. **Final Review** (fee verification, file format checks)
  6. **Submission** (portal transmission, confirmation tracking)
- Establishes topological dependencies between stages (e.g. Eligibility items must precede Application Completion).

### C. PROOFLINE — The Evidence Engine (`proofline_service.py`)
- **No Hallucinated Citations**: Every requirement and AI answer receives a `ProoflineCitation`.
- **Passage Locator**: Performs normalized substring matching, sliding window n-gram checks, and keyword density scoring to locate exact page and character offsets.
- **PDF Bounding Boxes**: When a PDF is present, uses `page.search_for()` to calculate real PDF coordinate rectangles `(x0, y0, x1, y1)` for glowing UI highlight overlays.
- **Veracity Validation**: Compares citation strings against the document text before presenting them in the interface.

### D. Contradiction Detection Engine (`contradiction_engine.py`)
- Evaluates documents for internal inconsistencies:
  - **Conflicting Cutoffs**: Scans for multiple final dates (e.g., October 15, 2026 vs November 1, 2026).
  - **Inconsistent Fees**: Detects clauses indicating a non-refundable fee vs fee waivers.
  - **Eligibility Mismatches**: Flags contradictory enrollment status requirements.
- Presents **dual-passage citations** with severity level and suggested user resolution actions.

### E. Multi-Provider AI & Retrieval Pipeline (`rag_engine.py`, `ai_service.py`)
- **Chunking**: Preserves document ID, page number, section heading, and token index.
- **Top-k Retrieval**: Ranks passages using query overlap and section heading boosting.
- **Provider Abstraction**:
  1. `deterministic`: Operates completely offline with zero API keys. Extracts exact matching passages and formats grounded answers.
  2. `gemini`: Uses official `google-genai` SDK with strict system prompts enforcing groundedness.
  3. `ollama`: Uses local REST endpoint for Gemma models (`gemma:2b`).
- **Uncertainty Guardrail**: If query has no overlap with document text, returns:  
  *"The uploaded document does not provide enough information to answer this confidently."*

### F. Readiness Review ("READY TO SUBMIT?") (`readiness_service.py`)
- Performs an automated audit prior to submission:
  - Mandatory checklist item completion ratio.
  - Blocking contradictions count.
  - Unverified citations check.
  - Missing administrative details (fees, contact info, file specs).
- Calculates a transparent readiness score (0-100%) and displays mandatory legal disclaimer.
