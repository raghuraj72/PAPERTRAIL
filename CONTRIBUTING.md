# Contributing to PAPERTRAIL

Thank you for your interest in contributing to **PAPERTRAIL — The Clarity Engine**! 

We welcome bug reports, new document extractors, OCR enhancements, translation improvements, and UI refinements.

---

## Getting Started

1. **Fork the Repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/papertrail.git
   cd papertrail
   ```

3. **Backend Setup**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r backend/requirements.txt
   ```

4. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Start Backend**:
   ```bash
   # In a separate terminal with venv active:
   uvicorn app.main:app --reload --port 8000
   ```

---

## Running Tests & Benchmarks

Before opening a pull request, run the test and benchmark suites:

```bash
# Run unit & integration tests
pytest backend/tests

# Run ground truth evaluation benchmark
python backend/evaluate.py
```

All 8 test suites must pass, and evaluation metrics must be genuine.

---

## Code Style & Conventions

- **Python**: Follow PEP 8. Use typing annotations on all service methods and Pydantic models.
- **TypeScript**: Strict type checking with React 19 and Tailwind CSS.
- **Evidence-First Rule**: Never generate ungrounded requirements or fictitious citations. Every extracted insight must link to a valid source passage.

---

## Submitting Pull Requests

1. Create a feature branch: `git checkout -b feature/my-enhancement`.
2. Commit your changes: `git commit -m "feat: add table extractor for scanned PDFs"`.
3. Push to your fork: `git push origin feature/my-enhancement`.
4. Open a Pull Request with a clear description and evaluation run output.
