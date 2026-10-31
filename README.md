<div align="center">

# PAPERTRAIL — THE CLARITY ENGINE
### *Understand the requirements. Know what to do. Never submit blindly.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind_v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Tests Passing](https://img.shields.io/badge/Tests-8%20Passed-success.svg)](backend/tests)
[![Evaluation Recall](https://img.shields.io/badge/Requirement_Recall-100%25-brightgreen.svg)](backend/evaluate.py)

**An evidence-first, open-source document intelligence engine that transforms confusing official notices, scholarship guidelines, application requirements, and regulatory PDFs into interactive, traceable action plans.**

[Live Demo Walkthrough](docs/FIVE_MINUTE_DEMO.md) · [Architecture Specs](docs/ARCHITECTURE.md) · [DEV Article Draft](docs/DEV_ARTICLE.md) · [Benchmark Report](docs/EVALUATION_REPORT.json)

</div>

---

## 1. The Real-World Problem

Every day, millions of people receive complicated documents:
- **Students & Graduates**: College admission notices, scholarship guidelines, internship criteria.
- **Job Applicants**: Dense employment requirements, credential verification checklists.
- **Researchers & Founders**: Grant solicitations, competition rules, patent requirements.
- **Citizens & Small Businesses**: Government permits, licensing rules, tax forms, insurance policies.

These documents bury vital instructions inside long paragraphs, multi-column tables, and scattered addenda. A single overlooked condition or missed deadline can result in rejection.

### Why Existing "Chat with PDF" Tools Are Not Enough
Most document AI products simply generate summaries or open an ungrounded chat box. They suffer from critical flaws:
1. **Hallucinations & Fabricated Rules**: They invent deadlines or state that requirements exist when they don't.
2. **Fake or Missing Citations**: They give generic answers without pointing to the exact page or verbatim line in the text.
3. **Passive Summaries, Not Action Plans**: Summaries don't tell the user what to complete first, which documents to prepare, or what remains missing.
4. **Silent Decisions on Inconsistencies**: When a document contains conflicting dates (e.g. Page 1 says October 15, Page 3 says November 1), generic chatbots pick one at random.

---

## 2. What PAPERTRAIL Does Differently

PAPERTRAIL converts unstructured documents into **actionable, traceable, verifiable preparation workflows**:

```
[Uploaded Document] (PDF, DOCX, TXT, Image)
         |
         v  Layout & Section Decomposition (PyMuPDF)
[Extracted Entities]
  ├── Structured Requirements (Mandatory vs Optional)
  ├── Extracted Dates & Cutoffs (Contextual Meaning)
  ├── Tables & Required Documents Dossier
  └── Intra-Document Contradiction Detector (Dual Citations)
         |
         v  Evidence Grounding Engine
[PROOFLINE Citations] (Page Number, Section, Verbatim Quote, Bounding Box)
         |
         v  User Action Space
[Interactive 6-Stage Action Plan] + [Grounded RAG Assistant] + [READY TO SUBMIT? Audit]
```

---

## 3. Core Features

### 🔍 PROOFLINE — Every Answer Has A Source
Every single requirement, deadline, and AI response is tied to a verifiable `ProoflineCitation`.
- Displays **Source Document**, **Page Number**, **Section Heading**, **Verbatim Passage**, and **Confidence Score**.
- Click any Proofline citation to **instantly jump to the original document page** and highlight the supporting text.

### 📋 Interactive 6-Stage Action Plan
Converts instructions into a prioritized checklist:
1. **Eligibility Verification** (prerequisites, GPA, citizenship)
2. **Before Applying** (reading guidelines, account registration)
3. **Documents to Prepare** (transcripts, identity cards, recommendation letters)
4. **Application Completion** (questionnaires, Statement of Purpose)
5. **Final Review** (fee receipts, file specifications)
6. **Submission** (official dispatch, confirmation tracking)
- Check off completed tasks, add personal notes, set reminders, adjust priority, and filter status.
- Export as **Markdown**, **CSV**, or **JSON**.

### ⚠️ Contradiction Detection Engine
Detects conflicting deadlines, inconsistent fee structures, or mismatched eligibility rules across different sections. Shows both clauses side-by-side with exact citations and provides actionable guidance.

### 🤖 Grounded Conversational AI
Ask questions in natural language:
- *"What is the minimum GPA required?"*
- *"Which documents are mandatory vs optional?"*
- *"When is the final cutoff?"*
Every answer cites the document. If information is absent, it responds:
> *"The uploaded document does not provide enough information to answer this confidently."*

### 🌐 Plain-Language Explainer & Multilingual Translation
Simplifies complex bureaucratic legalese into **Simple English**, **हिंदी (Hindi)**, or **Hinglish**, while strictly preserving all stated conditions and exceptions.

### 🛡️ Pre-Submission Audit ("READY TO SUBMIT?")
Before finalizing an application, click **"Ready to Submit?"** to audit your preparation:
- Evaluates mandatory vs optional task completion.
- Flags unverified citations and blocking contradictions.
- Checks for missing administrative details (fees, contact info, file specs).
- Displays an honest readiness score (0-100%) and mandatory legal disclaimer.

### ♿ Accessibility Mode
- Adjustable font scaling (A- / A+).
- High-contrast mode with WCAG-compliant color ratios.
- Reduced-motion toggle.
- Clean responsive layout for desktop, tablet, and mobile.

---

## 4. Benchmark Evaluation & Performance

PAPERTRAIL includes an automated ground-truth benchmark suite (`backend/evaluate.py`) running against **The Application Clarity Challenge** (a realistic synthetic 3-page fellowship document featuring distributed requirements, tables, multiple dates, and intentional contradictions).

Run the benchmark yourself:
```bash
python backend/evaluate.py
```

### Measured Benchmark Results
| Metric | Result | Benchmark Target | Status |
| :--- | :--- | :--- | :--- |
| **Text Extraction Success** | **100%** (3/3 pages) | 100% | ✅ PASS |
| **Requirement Recall** | **100.0%** (17/17 items) | ≥ 90% | ✅ PASS |
| **Requirement Precision** | **100.0%** | ≥ 90% | ✅ PASS |
| **Date Intelligence Accuracy** | **100.0%** (4/4 dates) | 100% | ✅ PASS |
| **Proofline Citation Veracity** | **100.0%** verified quotes | 100% | ✅ PASS |
| **Contradiction Recall** | **100.0%** (Deadline & Fee) | 100% | ✅ PASS |
| **RAG Passage Relevance** | **100.0%** | ≥ 90% | ✅ PASS |
| **Total Pipeline Latency** | **135.0 ms** | < 2,000 ms | ✅ PASS |

---

## 5. Quickstart & Local Installation

### Prerequisites
- **Python 3.11+**
- **Node.js 20+** and **npm**

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/papertrail.git
cd papertrail
```

### Step 2: Setup Backend
```bash
# Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### Step 3: Setup Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 4: Run the Application
In terminal 1 (Backend):
```bash
# Windows:
$env:PYTHONPATH="backend"; .\venv\Scripts\uvicorn app.main:app --reload --port 8000
# macOS/Linux:
PYTHONPATH=backend uvicorn app.main:app --reload --port 8000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

Click **"Demo Challenge"** in the top navigation bar to immediately experience PAPERTRAIL with one click!

---

## 6. Docker Deployment

Run the complete multi-container stack with Docker Compose:

```bash
docker-compose up --build
```
Access the application at `http://localhost:5173`.

---

## 7. Configuration & AI Provider Options

PAPERTRAIL works **100% locally out of the box with zero external API keys required** using its high-precision Deterministic Grounded Engine.

To optionally connect external LLM providers, configure `.env`:

```env
# AI Provider: deterministic | gemini | ollama
AI_PROVIDER="deterministic"

# Optional: Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"

# Optional: Local Ollama / Gemma
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="gemma:2b"
```

---

## 8. Privacy & Security

- **Local Storage by Default**: Uploaded files and workspace data are stored locally in `backend/data/`.
- **Zero Third-Party Telemetry**: Your private documents are never transmitted to external providers without explicit consent.
- **No Automated Impersonation**: PAPERTRAIL assists with understanding and preparation. It never automatically submits forms or handles sensitive credentials.
- **One-Click Deletion**: Workspaces and associated files can be permanently deleted directly from the user interface.

---

## 9. Current Limitations & Roadmap

- **Scanned Image Quality**: OCR accuracy for low-resolution, hand-written mobile camera photos depends on system Tesseract installation.
- **Complex Multi-Page Form Filling**: Currently focuses on extraction and checklist preparation; auto-generating filled PDF form overlays is on the roadmap.
- **Calendar Integration**: Exporting deadlines directly to `.ics` / Google Calendar format.

---

## 10. Contributing & License

We welcome contributions from developers, UX designers, and legal/technical writers! Please see [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
<strong>PAPERTRAIL</strong> — <em>Understand the requirements. Know what to do. Never submit blindly.</em>
</div>
