import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_clarity_challenge_pdf(output_path: Path):
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=45, leftMargin=45,
        topMargin=45, bottomMargin=45
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=10
    )
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0284C7"),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=8
    )
    warning_style = ParagraphStyle(
        'DocWarning',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#B91C1C"),
        spaceAfter=8
    )
    callout_style = ParagraphStyle(
        'DocCallout',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#475569")
    )
    
    story = []
    
    # ---------------- PAGE 1 ----------------
    story.append(Paragraph("[SYNTHETIC DEMO] APEX FELLOWSHIP & INNOVATION GRANT 2026", title_style))
    story.append(Paragraph("<b>Official Application Guidelines & Eligibility Manual</b>", body_style))
    story.append(Paragraph("<i>Notice Ref: AFG-2026-V1.0 | Issued by the Global Education Directorate</i>", callout_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=5, spaceAfter=12))
    
    story.append(Paragraph("<b>1.0 PROGRAM PURPOSE & ELIGIBILITY CRITERIA</b>", h2_style))
    story.append(Paragraph(
        "The Apex Fellowship Program offers merit-based financial support and mentorship to emerging technologists and researchers. "
        "Applicants must be currently enrolled full-time in an accredited undergraduate degree program in science, engineering, or mathematics. "
        "Candidates shall maintain a minimum cumulative grade point average (GPA) of 3.2 on a 4.0 scale (or equivalent 80% mark). "
        "Applicants must submit proof of active university enrollment issued within the last 60 days.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Important Exception:</b> Final-year undergraduate students who have completed all coursework but have not yet received their final diploma "
        "are eligible to apply, provided they furnish an official provisional degree clearance letter from their dean.",
        body_style
    ))
    
    story.append(Paragraph("<b>2.0 IMPORTANT DATES & TIMELINE</b>", h2_style))
    story.append(Paragraph(
        "Application registration opens on August 15, 2026 at 9:00 AM EST. "
        "The preliminary document review period will commence on September 20, 2026. "
        "The final submission deadline is October 15, 2026 at 11:59 PM EST. "
        "No late submissions or supplemental documents will be accepted after this cutoff.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Application Fee:</b> Applicants must pay a non-refundable application fee of $50 USD through the payment gateway before submission.",
        warning_style
    ))
    
    story.append(PageBreak())
    
    # ---------------- PAGE 2 ----------------
    story.append(Paragraph("<b>3.0 MANDATORY VS. OPTIONAL DOCUMENTS</b>", h2_style))
    story.append(Paragraph(
        "All application dossiers must contain certified documentation. "
        "Review the checklist below carefully. Incomplete dossiers will be rejected during technical triage without substantive evaluation.",
        body_style
    ))
    
    table_data = [
        [Paragraph("<b>Document Name</b>", callout_style), Paragraph("<b>Format & Specs</b>", callout_style), Paragraph("<b>Requirement Status</b>", callout_style)],
        [Paragraph("Official Academic Transcript", body_style), Paragraph("PDF format, signed and stamped by Registrar", body_style), Paragraph("Mandatory", body_style)],
        [Paragraph("Government-Issued Photo ID", body_style), Paragraph("Passport or National Identity Card (Color scan)", body_style), Paragraph("Mandatory", body_style)],
        [Paragraph("Statement of Purpose (SOP)", body_style), Paragraph("Maximum 1,000 words, 12pt font, double-spaced", body_style), Paragraph("Mandatory", body_style)],
        [Paragraph("Letters of Recommendation (2)", body_style), Paragraph("Direct upload by academic mentors on official letterhead", body_style), Paragraph("Mandatory", body_style)],
        [Paragraph("Project Portfolio / GitHub Link", body_style), Paragraph("Public URL or compressed ZIP under 10MB", body_style), Paragraph("Optional / Recommended", body_style)],
        [Paragraph("Standardized Test Scores (GRE/GATE)", body_style), Paragraph("Official score report within last 2 years", body_style), Paragraph("Optional", body_style)]
    ]
    t = Table(table_data, colWidths=[180, 220, 120])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 14))
    
    story.append(Paragraph("<b>4.0 APPLICATION COMPLETION PROCEDURES</b>", h2_style))
    story.append(Paragraph(
        "Candidates shall complete all eight sections of the online application portal. "
        "Applicants must verify their personal contact details and permanent address. "
        "The Statement of Purpose must explicitly address the candidate's proposed research impact, technical milestones, and societal relevance. "
        "Candidates are encouraged to attach a portfolio highlighting previous open-source software contributions.",
        body_style
    ))
    
    story.append(PageBreak())
    
    # ---------------- PAGE 3 ----------------
    story.append(Paragraph("<b>5.0 SUBMISSION INSTRUCTIONS & DISCREPANCY DISCLOSURE</b>", h2_style))
    story.append(Paragraph(
        "Applicants must submit their finalized application through the official Apex Portal. "
        "Upon submission, candidates shall retain the unique 10-digit application tracking number. "
        "Applicants must verify that all uploaded PDF files are readable and corruption-free prior to pressing final submit.",
        body_style
    ))
    
    # Intentional realistic contradiction for demonstration:
    story.append(Paragraph("<b>Section 5.3 Extension Clause & Final Cutoff</b>", h2_style))
    story.append(Paragraph(
        "Due to anticipated server maintenance, the final submission deadline is November 1, 2026 at 5:00 PM EST. "
        "All supporting materials and recommendation letters must be received by this extended date.",
        warning_style
    ))
    
    # Another intentional contradiction: Fee discrepancy
    story.append(Paragraph(
        "<b>Fee Exemption Notice:</b> In recognition of global education equity, there is no application fee for any candidate. "
        "The $50 fee mentioned previously has been waived for all 2026 applicants.",
        body_style
    ))
    
    story.append(Paragraph("<b>6.0 SUPPORT & INQUIRIES</b>", h2_style))
    story.append(Paragraph(
        "For technical portal issues or requirement clarification, contact the Apex Fellowship Helpdesk at "
        "<b>support@apexfellowship2026.org</b> or call +1 (555) 234-5678. Official portal URL: https://portal.apexfellowship2026.org",
        body_style
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=15, spaceAfter=8))
    story.append(Paragraph(
        "<i>Notice: This synthetic document was generated as a benchmark challenge document for testing PAPERTRAIL document intelligence.</i>",
        callout_style
    ))
    
    doc.build(story)

if __name__ == "__main__":
    out_dir = Path(__file__).resolve().parent
    out_file = out_dir / "apex_fellowship_guidelines_2026.pdf"
    generate_clarity_challenge_pdf(out_file)
    print(f"Generated sample synthetic PDF at: {out_file}")
