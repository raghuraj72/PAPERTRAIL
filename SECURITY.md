# Security Policy

## Privacy-First Architecture

PAPERTRAIL processes sensitive official instructions, application documents, and personal records. Privacy is a foundational engineering principle:

1. **Local Processing by Default**: The default grounded RAG engine operates 100% locally on your machine. No document bytes are transmitted to any cloud server or LLM provider unless explicitly configured by the user.
2. **Explicit Consent for Cloud Models**: If a user configures Gemini or external inference, documents are processed turn-by-turn with transparent indicators.
3. **Zero Automated Submissions**: PAPERTRAIL is an assistance and clarity tool. It never automatically submits forms, handles payment credentials, or signs documents on a user's behalf.
4. **Local Data Persistence**: Uploaded files and workspace states are stored in the local `backend/data` directory and can be deleted at any time with one click from the UI.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within PAPERTRAIL, please report it via private email to:

`security@papertrail-engine.dev`

Please include:
- Description of the vulnerability.
- Steps to reproduce.
- Potential impact.

We respond to security reports within 48 hours and coordinate patch releases responsibly.
