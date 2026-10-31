# The Five-Minute Live Demonstration Script
## PAPERTRAIL — The Clarity Engine | MLH × DEV 2026

**Presenter**: Lead Developer / Architect  
**Audience**: MLH Hackathon Judges, DEV Challenge Reviewers, and Open-Source Community  
**Total Duration**: Exactly 5 Minutes (0:00 to 5:00)

---

### [0:00 – 0:30] — THE PROBLEM
* **Action**: Open the raw PDF `apex_fellowship_guidelines_2026.pdf`.
* **Spoken Script**:
  > *"Every single day, students, job applicants, and ordinary citizens are confronted with complex official documents—scholarship guidelines, job notices, and government circulars. Important requirements, hidden conditions, exceptions, and deadlines are scattered across dense paragraphs and tables. A single missed requirement means automatic disqualification. Most people ask: 'What am I actually supposed to do? What is the real deadline? Where does the document actually say this?' Generic AI chatbots just summarize or hallucinate. That's why we built PAPERTRAIL — The Clarity Engine."*

---

### [0:30 – 1:10] — THE TRANSFORMATION
* **Action**: Open PAPERTRAIL web app. Click **"Demo Challenge"** (or drag & drop `apex_fellowship_guidelines_2026.pdf`).
* **Visual**: Watch the stage progress indicators:
  1. *Uploading document...*
  2. *Parsing layout & sections...*
  3. *Extracting requirements & dates...*
  4. *Grounding Proofline citations...*
* **Spoken Script**:
  > *"In under 200 milliseconds, PAPERTRAIL transforms this intimidating 3-page fellowship circular into a clean, structured workspace. It has classified the document, mapped its sections, identified 17 structured requirements, extracted all stated deadlines, and highlighted support contacts."*

---

### [1:10 – 2:00] — THE MAGIC: PROOFLINE IN ACTION
* **Action**: In the right panel, point to the **Action Plan** tab. Show the 6 categorized stages (*Eligibility Verification*, *Documents to Prepare*, *Submission*).
* **Click Interaction**: Click on the requirement: **"Official Academic Transcript"**.
* **Visual**:
  - The center **Smart Document Explorer** immediately flips to **Page 2**.
  - A glowing blue **Proofline Target Passage** banner appears, highlighting the exact table row and registrar signature specification in the source document.
* **Spoken Script**:
  > *"This is what separates PAPERTRAIL from every generic chatbot: PROOFLINE. Every single extracted requirement has an unbreakable link to the source document. When I click 'Official Academic Transcript', the document viewer instantly jumps to Page 2 and highlights the exact clause. You never have to trust an AI blindly—you can verify the truth in one click."*

---

### [2:00 – 3:00] — ASK THE DOCUMENT: EVIDENCE-GROUNDED RAG
* **Action**: Switch the right panel to **"Ask AI"**.
* **Click Interaction**: Click the preset chip: *"What is the minimum GPA required to be eligible?"*
* **Visual**:
  - The assistant responds with the verbatim quote: *"minimum cumulative grade point average (GPA) of 3.2 on a 4.0 scale"*.
  - Displays the Proofline Citation card with **Page 1**, **Section 1.0**, and **Verified (100%)** badge.
* **Click Interaction**: Click the citation badge; viewer jumps to Page 1, highlighting the eligibility paragraph.
* **Spoken Script**:
  > *"When you ask PAPERTRAIL a question, it retrieves the exact supporting passage before synthesizing an answer. Notice the Proofline citation card below the response showing Page 1, Section 1.0 with 100% verification confidence. If you ask a question not present in the document, it will honestly refuse to hallucinate."*

---

### [3:00 – 4:00] — FIND THE PROBLEM: CONTRADICTION DETECTOR
* **Action**: Point to the Left Panel's **Conflict Detected** banner, or click the **Workflow Graph / Deadlines** view.
* **Visual**: Show the **Contradiction Alert Card**:
  - **Clause A (Page 1)**: *"The final submission deadline is October 15, 2026 at 11:59 PM EST."*
  - **Clause B (Page 3)**: *"Due to anticipated server maintenance, the final submission deadline is November 1, 2026 at 5:00 PM EST."*
  - **Fee Contradiction**: *$50 USD non-refundable fee* vs *fee waived in Section 5.3*.
* **Spoken Script**:
  > *"Real-world documents are messy and often contradictory. Look at this: PAPERTRAIL's contradiction engine detected that Section 2.0 states the deadline is October 15, while Section 5.3 states November 1. It displays both passages side-by-side with exact citations, giving actionable advice to check with the issuing desk rather than silently picking one date."*

---

### [4:00 – 4:40] — READY TO SUBMIT?
* **Action**: Click the **"Ready to Submit?"** button in the top navigation bar.
* **Visual**: The **Pre-Submission Audit Modal** opens.
  - Overall status: **Contradictions Requiring Resolution** / **Incomplete Tasks**.
  - Shows **Readiness Score**, completed mandatory tasks counter, and actionable recommendations.
  - Highlights the explicit legal disclaimer at the bottom.
* **Spoken Script**:
  > *"Before anyone hits submit, they open 'READY TO SUBMIT?'. PAPERTRAIL audits your checklist completion, unverified quotes, and blocking contradictions. It gives you an honest score—it never pretends to officially approve or submit on your behalf. It helps you prepare with complete confidence."*

---

### [4:40 – 5:00] — FINAL MESSAGE
* **Action**: Close modal. Return to the clean 3-panel workspace.
* **Spoken Script**:
  > *"PAPERTRAIL doesn't just summarize text. It bridges the gap between confusing instructions, verifiable evidence, and clear human action.  
  **PAPERTRAIL — Understand the requirements. Know what to do. Never submit blindly.**  
  Thank you."*
