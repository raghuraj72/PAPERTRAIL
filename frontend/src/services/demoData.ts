import { Workspace } from "../types";

export const DEMO_WORKSPACE: Workspace = {
  id: "ws_demo_clarity_2026",
  name: "Apex Fellowship & Innovation Grant 2026",
  created_at: "2026-10-31T18:00:00.000Z",
  updated_at: "2026-10-31T18:30:00.000Z",
  action_plan_completed_count: 0,
  action_plan_total_count: 15,
  documents: [
    {
      id: "doc_apex_2026",
      filename: "apex_fellowship_guidelines_2026.pdf",
      file_type: "pdf",
      file_size_bytes: 6526,
      upload_timestamp: "2026-10-31T18:00:00.000Z",
      page_count: 3,
      document_title: "Apex Fellowship & Innovation Grant 2026",
      document_type: "Scholarship & Grant Guidelines",
      summary: "Official application guidelines and eligibility manual for the Apex Fellowship & Innovation Grant 2026 issued by the Global Education Directorate. Outlines GPA thresholds, required academic documentation, portal submission steps, and conflicting deadline addenda.",
      sections: [
        {
          id: "sec_1",
          title: "1.0 PROGRAM PURPOSE & ELIGIBILITY CRITERIA",
          page_number: 1,
          char_start: 0,
          char_end: 80,
          content_snippet: "The Apex Fellowship Program offers merit-based financial support and mentorship to emerging technologists and researchers.",
          level: 1
        },
        {
          id: "sec_2",
          title: "2.0 IMPORTANT DATES & TIMELINE",
          page_number: 1,
          char_start: 0,
          char_end: 60,
          content_snippet: "Application registration opens on August 15, 2026. Final submission deadline is October 15, 2026.",
          level: 1
        },
        {
          id: "sec_3",
          title: "3.0 MANDATORY VS. OPTIONAL DOCUMENTS",
          page_number: 2,
          char_start: 0,
          char_end: 70,
          content_snippet: "All application dossiers must contain certified documentation according to the official table checklist.",
          level: 1
        },
        {
          id: "sec_4",
          title: "4.0 APPLICATION COMPLETION PROCEDURES",
          page_number: 2,
          char_start: 0,
          char_end: 60,
          content_snippet: "Candidates shall complete all eight sections of the online application portal.",
          level: 1
        },
        {
          id: "sec_5",
          title: "5.0 SUBMISSION INSTRUCTIONS & DISCREPANCY DISCLOSURE",
          page_number: 3,
          char_start: 0,
          char_end: 70,
          content_snippet: "Applicants must submit their finalized application through the official Apex Portal.",
          level: 1
        },
        {
          id: "sec_6",
          title: "Section 5.3 Extension Clause & Final Cutoff",
          page_number: 3,
          char_start: 0,
          char_end: 65,
          content_snippet: "Due to server maintenance, final submission deadline is November 1, 2026 at 5:00 PM EST.",
          level: 2
        },
        {
          id: "sec_7",
          title: "6.0 SUPPORT & INQUIRIES",
          page_number: 3,
          char_start: 0,
          char_end: 45,
          content_snippet: "Helpdesk support: support@apexfellowship2026.org",
          level: 1
        }
      ],
      pages_text: {
        1: `[SYNTHETIC DEMO] APEX FELLOWSHIP & INNOVATION GRANT 2026
Official Application Guidelines & Eligibility Manual
Notice Ref: AFG-2026-V1.0 | Issued by the Global Education Directorate

1.0 PROGRAM PURPOSE & ELIGIBILITY CRITERIA
The Apex Fellowship Program offers merit-based financial support and mentorship to emerging technologists and researchers. Applicants must be currently enrolled full-time in an accredited undergraduate degree program in science, engineering, or mathematics. Candidates shall maintain a minimum cumulative grade point average (GPA) of 3.2 on a 4.0 scale (or equivalent 80% mark). Applicants must submit proof of active university enrollment issued within the last 60 days.

Important Exception: Final-year undergraduate students who have completed all coursework but have not yet received their final diploma are eligible to apply, provided they furnish an official provisional degree clearance letter from their dean.

2.0 IMPORTANT DATES & TIMELINE
Application registration opens on August 15, 2026 at 9:00 AM EST. The preliminary document review period will commence on September 20, 2026. The final submission deadline is October 15, 2026 at 11:59 PM EST. No late submissions or supplemental documents will be accepted after this cutoff.

Application Fee: Applicants must pay a non-refundable application fee of $50 USD through the payment gateway before submission.`,
        2: `3.0 MANDATORY VS. OPTIONAL DOCUMENTS
All application dossiers must contain certified documentation. Review the checklist below carefully. Incomplete dossiers will be rejected during technical triage without substantive evaluation.

Document Name | Format & Specs | Requirement Status
---------------------------------------------------------------------------------------------------
Official Academic Transcript | PDF format, signed and stamped by Registrar | Mandatory
Government-Issued Photo ID | Passport or National Identity Card (Color scan) | Mandatory
Statement of Purpose (SOP) | Maximum 1,000 words, 12pt font, double-spaced | Mandatory
Letters of Recommendation (2) | Direct upload by academic mentors on official letterhead | Mandatory
Project Portfolio / GitHub Link | Public URL or compressed ZIP under 10MB | Optional / Recommended
Standardized Test Scores (GRE/GATE) | Official score report within last 2 years | Optional

4.0 APPLICATION COMPLETION PROCEDURES
Candidates shall complete all eight sections of the online application portal. Applicants must verify their personal contact details and permanent address. The Statement of Purpose must explicitly address the candidate's proposed research impact, technical milestones, and societal relevance. Candidates are encouraged to attach a portfolio highlighting previous open-source software contributions.`,
        3: `5.0 SUBMISSION INSTRUCTIONS & DISCREPANCY DISCLOSURE
Applicants must submit their finalized application through the official Apex Portal. Upon submission, candidates shall retain the unique 10-digit application tracking number. Applicants must verify that all uploaded PDF files are readable and corruption-free prior to pressing final submit.

Section 5.3 Extension Clause & Final Cutoff
Due to anticipated server maintenance, the final submission deadline is November 1, 2026 at 5:00 PM EST. All supporting materials and recommendation letters must be received by this extended date.

Fee Exemption Notice: In recognition of global education equity, there is no application fee for any candidate. The $50 fee mentioned previously has been waived for all 2026 applicants.

6.0 SUPPORT & INQUIRIES
For technical portal issues or requirement clarification, contact the Apex Fellowship Helpdesk at support@apexfellowship2026.org or call +1 (555) 234-5678. Official portal URL: https://portal.apexfellowship2026.org

Notice: This synthetic document was generated as a benchmark challenge document for testing PAPERTRAIL document intelligence.`
      },
      requirements: [],
      dates: [],
      contradictions: [],
      missing_or_unclear: [
        "Confirm whether recommendation letters must be uploaded directly by mentors or sent via separate email link."
      ],
      contact_details: [
        "Email: support@apexfellowship2026.org",
        "Phone: +1 (555) 234-5678",
        "Portal: https://portal.apexfellowship2026.org"
      ],
      fee_info: "$50 USD (Waived to $0 in Section 5.3 Addendum)"
    }
  ],
  combined_requirements: [
    {
      id: "req_1",
      title: "Minimum Cumulative GPA 3.2 on 4.0 Scale",
      plain_language: "Mandatory: Confirm that your cumulative GPA is at least 3.2 on a 4.0 scale (or minimum 80% mark) before applying.",
      original_wording: "Candidates shall maintain a minimum cumulative grade point average (GPA) of 3.2 on a 4.0 scale (or equivalent 80% mark).",
      category: "Eligibility Verification",
      is_mandatory: true,
      deadline: null,
      deadline_context: null,
      dependencies: [],
      confidence: 0.98,
      citation: {
        id: "cite_1",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 1,
        section_heading: "1.0 PROGRAM PURPOSE & ELIGIBILITY CRITERIA",
        exact_passage: "Candidates shall maintain a minimum cumulative grade point average (GPA) of 3.2 on a 4.0 scale (or equivalent 80% mark).",
        confidence: 0.98,
        verified: true,
        explanation: "Stated as minimum baseline qualification on Page 1."
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_2",
      title: "Full-Time Undergraduate Enrollment Proof (Issued within 60 Days)",
      plain_language: "Mandatory: Provide an official certificate or letter confirming current full-time enrollment in STEM, dated within the last 60 days.",
      original_wording: "Applicants must submit proof of active university enrollment issued within the last 60 days.",
      category: "Eligibility Verification",
      is_mandatory: true,
      deadline: null,
      deadline_context: null,
      dependencies: [],
      confidence: 0.97,
      citation: {
        id: "cite_2",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 1,
        section_heading: "1.0 PROGRAM PURPOSE & ELIGIBILITY CRITERIA",
        exact_passage: "Applicants must submit proof of active university enrollment issued within the last 60 days.",
        confidence: 0.97,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_3",
      title: "Dean's Provisional Degree Clearance Letter (Final-Year Exemption)",
      plain_language: "Conditional Exemption: If you are in your final year without a diploma, obtain a signed provisional clearance letter from your Dean.",
      original_wording: "Final-year undergraduate students who have completed all coursework but have not yet received their final diploma are eligible to apply, provided they furnish an official provisional degree clearance letter from their dean.",
      category: "Eligibility Verification",
      is_mandatory: false,
      deadline: null,
      deadline_context: null,
      dependencies: [],
      confidence: 0.94,
      citation: {
        id: "cite_3",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 1,
        section_heading: "Important Exception",
        exact_passage: "provided they furnish an official provisional degree clearance letter from their dean.",
        confidence: 0.94,
        verified: true
      },
      status: "Not Started",
      priority: "Medium"
    },
    {
      id: "req_4",
      title: "Apex Portal Account Registration (Opens Aug 15)",
      plain_language: "Mandatory: Create your profile on the official Apex Portal once registration opens on August 15, 2026 at 9:00 AM EST.",
      original_wording: "Application registration opens on August 15, 2026 at 9:00 AM EST.",
      category: "Before Applying",
      is_mandatory: true,
      deadline: "August 15, 2026 at 9:00 AM EST",
      deadline_context: "Portal Registration Kickoff",
      dependencies: ["req_1", "req_2"],
      confidence: 0.95,
      citation: {
        id: "cite_4",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 1,
        section_heading: "2.0 IMPORTANT DATES & TIMELINE",
        exact_passage: "Application registration opens on August 15, 2026 at 9:00 AM EST.",
        confidence: 0.95,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_5",
      title: "Technical Guidelines & Triage Criteria Review",
      plain_language: "Mandatory: Read all document specifications carefully; incomplete application dossiers will be rejected during triage without evaluation.",
      original_wording: "Review the checklist below carefully. Incomplete dossiers will be rejected during technical triage without substantive evaluation.",
      category: "Before Applying",
      is_mandatory: true,
      deadline: null,
      deadline_context: null,
      dependencies: [],
      confidence: 0.92,
      citation: {
        id: "cite_5",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 2,
        section_heading: "3.0 MANDATORY VS. OPTIONAL DOCUMENTS",
        exact_passage: "Incomplete dossiers will be rejected during technical triage without substantive evaluation.",
        confidence: 0.92,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_6",
      title: "Official Academic Transcript (Registrar Stamped PDF)",
      plain_language: "Mandatory: Obtain your official academic marksheet/transcript in PDF format, signed and stamped by the university Registrar.",
      original_wording: "Official Academic Transcript: PDF format, signed and stamped by Registrar. Status: Mandatory.",
      category: "Documents to Prepare",
      is_mandatory: true,
      deadline: null,
      deadline_context: null,
      dependencies: ["req_1"],
      confidence: 0.99,
      citation: {
        id: "cite_6",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 2,
        section_heading: "3.0 MANDATORY VS. OPTIONAL DOCUMENTS",
        exact_passage: "Official Academic Transcript | PDF format, signed and stamped by Registrar | Mandatory",
        confidence: 0.99,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_7",
      title: "Government-Issued Photo ID (Passport or National ID)",
      plain_language: "Mandatory: Color scan of your valid Passport or National Identity Card.",
      original_wording: "Government-Issued Photo ID: Passport or National Identity Card (Color scan). Status: Mandatory.",
      category: "Documents to Prepare",
      is_mandatory: true,
      deadline: null,
      deadline_context: null,
      dependencies: [],
      confidence: 0.99,
      citation: {
        id: "cite_7",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 2,
        section_heading: "3.0 MANDATORY VS. OPTIONAL DOCUMENTS",
        exact_passage: "Government-Issued Photo ID | Passport or National Identity Card (Color scan) | Mandatory",
        confidence: 0.99,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_8",
      title: "Two Letters of Recommendation (On Official Letterhead)",
      plain_language: "Mandatory: Two academic mentors must submit letters on official university letterhead directly into the portal.",
      original_wording: "Letters of Recommendation (2): Direct upload by academic mentors on official letterhead. Status: Mandatory.",
      category: "Documents to Prepare",
      is_mandatory: true,
      deadline: "November 1, 2026 at 5:00 PM EST",
      deadline_context: "Letters must be received by final cutoff",
      dependencies: ["req_4"],
      confidence: 0.98,
      citation: {
        id: "cite_8",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 2,
        section_heading: "3.0 MANDATORY VS. OPTIONAL DOCUMENTS",
        exact_passage: "Letters of Recommendation (2) | Direct upload by academic mentors on official letterhead | Mandatory",
        confidence: 0.98,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_9",
      title: "Standardized Test Scores (GRE/GATE) [Optional]",
      plain_language: "Optional: Official test score report taken within the last 2 years. Submitting scores is completely voluntary.",
      original_wording: "Standardized Test Scores (GRE/GATE): Official score report within last 2 years. Status: Optional.",
      category: "Documents to Prepare",
      is_mandatory: false,
      deadline: null,
      deadline_context: null,
      dependencies: [],
      confidence: 0.95,
      citation: {
        id: "cite_9",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 2,
        section_heading: "3.0 MANDATORY VS. OPTIONAL DOCUMENTS",
        exact_passage: "Standardized Test Scores (GRE/GATE) | Official score report within last 2 years | Optional",
        confidence: 0.95,
        verified: true
      },
      status: "Not Started",
      priority: "Low"
    },
    {
      id: "req_10",
      title: "Statement of Purpose (SOP - Max 1,000 Words, 12pt Font)",
      plain_language: "Mandatory: Write an essay under 1,000 words detailing research impact, milestones, and societal relevance.",
      original_wording: "Statement of Purpose (SOP): Maximum 1,000 words, 12pt font, double-spaced. Must explicitly address research impact, technical milestones, and societal relevance.",
      category: "Application Completion",
      is_mandatory: true,
      deadline: null,
      deadline_context: null,
      dependencies: ["req_6"],
      confidence: 0.98,
      citation: {
        id: "cite_10",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 2,
        section_heading: "4.0 APPLICATION COMPLETION PROCEDURES",
        exact_passage: "The Statement of Purpose must explicitly address the candidate's proposed research impact, technical milestones, and societal relevance.",
        confidence: 0.98,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_11",
      title: "Complete All Eight Online Portal Sections",
      plain_language: "Mandatory: Fill out all 8 sections of the online portal, verifying contact numbers and permanent address.",
      original_wording: "Candidates shall complete all eight sections of the online application portal. Applicants must verify their personal contact details and permanent address.",
      category: "Application Completion",
      is_mandatory: true,
      deadline: null,
      deadline_context: null,
      dependencies: ["req_4", "req_7"],
      confidence: 0.97,
      citation: {
        id: "cite_11",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 2,
        section_heading: "4.0 APPLICATION COMPLETION PROCEDURES",
        exact_passage: "Candidates shall complete all eight sections of the online application portal. Applicants must verify their personal contact details and permanent address.",
        confidence: 0.97,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_12",
      title: "Project Portfolio / GitHub Link [Optional / Recommended]",
      plain_language: "Optional: Provide a public GitHub URL or project ZIP (<10MB) showcasing previous open-source software contributions.",
      original_wording: "Project Portfolio / GitHub Link: Public URL or compressed ZIP under 10MB. Candidates are encouraged to attach a portfolio highlighting previous open-source software contributions.",
      category: "Application Completion",
      is_mandatory: false,
      deadline: null,
      deadline_context: null,
      dependencies: [],
      confidence: 0.94,
      citation: {
        id: "cite_12",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 2,
        section_heading: "4.0 APPLICATION COMPLETION PROCEDURES",
        exact_passage: "Candidates are encouraged to attach a portfolio highlighting previous open-source software contributions.",
        confidence: 0.94,
        verified: true
      },
      status: "Not Started",
      priority: "Medium"
    },
    {
      id: "req_13",
      title: "Fee Waiver Verification ($50 Waived in Section 5.3)",
      plain_language: "Review Step: Verify that the payment gateway reflects $0. The initial $50 application fee was waived in Section 5.3 for 2026 applicants.",
      original_wording: "Fee Exemption Notice: In recognition of global education equity, there is no application fee for any candidate. The $50 fee mentioned previously has been waived for all 2026 applicants.",
      category: "Final Review",
      is_mandatory: true,
      deadline: null,
      deadline_context: null,
      dependencies: ["req_11"],
      confidence: 0.96,
      citation: {
        id: "cite_13",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 3,
        section_heading: "Section 5.3 Extension Clause & Final Cutoff",
        exact_passage: "In recognition of global education equity, there is no application fee for any candidate. The $50 fee mentioned previously has been waived for all 2026 applicants.",
        confidence: 0.96,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_14",
      title: "Uploaded PDF Readability & File Corruption Audit",
      plain_language: "Mandatory: Open and inspect every uploaded document file to ensure they are crisp, uncorrupted, and legible before submitting.",
      original_wording: "Applicants must verify that all uploaded PDF files are readable and corruption-free prior to pressing final submit.",
      category: "Final Review",
      is_mandatory: true,
      deadline: null,
      deadline_context: null,
      dependencies: ["req_6", "req_7"],
      confidence: 0.97,
      citation: {
        id: "cite_14",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 3,
        section_heading: "5.0 SUBMISSION INSTRUCTIONS & DISCREPANCY DISCLOSURE",
        exact_passage: "Applicants must verify that all uploaded PDF files are readable and corruption-free prior to pressing final submit.",
        confidence: 0.97,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    },
    {
      id: "req_15",
      title: "Final Application Submission & 10-Digit Tracking Archival",
      plain_language: "Mandatory: Transmit finalized materials before the cutoff and save the generated 10-digit tracking number for verification.",
      original_wording: "Applicants must submit their finalized application through the official Apex Portal. Upon submission, candidates shall retain the unique 10-digit application tracking number.",
      category: "Submission",
      is_mandatory: true,
      deadline: "October 15, 2026 (or Nov 1 Addendum)",
      deadline_context: "Conflicting cutoff dates stated",
      dependencies: ["req_10", "req_11", "req_14"],
      confidence: 0.99,
      citation: {
        id: "cite_15",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 3,
        section_heading: "5.0 SUBMISSION INSTRUCTIONS & DISCREPANCY DISCLOSURE",
        exact_passage: "Applicants must submit their finalized application through the official Apex Portal. Upon submission, candidates shall retain the unique 10-digit application tracking number.",
        confidence: 0.99,
        verified: true
      },
      status: "Not Started",
      priority: "High"
    }
  ],
  combined_contradictions: [
    {
      id: "contra_deadline",
      title: "Conflicting Application Submission Deadlines",
      topic: "deadline",
      passage_a: {
        id: "cite_c1_a",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 1,
        section_heading: "2.0 IMPORTANT DATES & TIMELINE",
        exact_passage: "The final submission deadline is October 15, 2026 at 11:59 PM EST. No late submissions or supplemental documents will be accepted after this cutoff.",
        confidence: 0.98,
        verified: true
      },
      passage_b: {
        id: "cite_c1_b",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 3,
        section_heading: "Section 5.3 Extension Clause & Final Cutoff",
        exact_passage: "Due to anticipated server maintenance, the final submission deadline is November 1, 2026 at 5:00 PM EST. All supporting materials and recommendation letters must be received by this extended date.",
        confidence: 0.98,
        verified: true
      },
      discrepancy_explanation: "Page 1 states an absolute cutoff of October 15, 2026 at 11:59 PM EST. However, Section 5.3 on Page 3 announces an extension to November 1, 2026 at 5:00 PM EST due to scheduled server maintenance.",
      severity: "critical",
      suggested_action: "Aim for October 15 to remain strictly safe, and contact support@apexfellowship2026.org to verify if the server maintenance extension applies to all tracks."
    },
    {
      id: "contra_fee",
      title: "Contradictory Application Fee Information",
      topic: "fee",
      passage_a: {
        id: "cite_c2_a",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 1,
        section_heading: "2.0 IMPORTANT DATES & TIMELINE",
        exact_passage: "Applicants must pay a non-refundable application fee of $50 USD through the payment gateway before submission.",
        confidence: 0.96,
        verified: true
      },
      passage_b: {
        id: "cite_c2_b",
        document_id: "doc_apex_2026",
        document_name: "apex_fellowship_guidelines_2026.pdf",
        page_number: 3,
        section_heading: "Section 5.3 Extension Clause & Final Cutoff",
        exact_passage: "In recognition of global education equity, there is no application fee for any candidate. The $50 fee mentioned previously has been waived for all 2026 applicants.",
        confidence: 0.97,
        verified: true
      },
      discrepancy_explanation: "Section 2.0 initially demands a non-refundable $50 fee, but Section 5.3 explicitly overrides this policy by issuing a blanket equity waiver for all 2026 candidates.",
      severity: "warning",
      suggested_action: "Do not pay any fee through unauthorized links. Ensure the portal checkout displays $0.00."
    }
  ]
};
