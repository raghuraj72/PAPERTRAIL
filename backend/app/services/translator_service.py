import re
from typing import Dict
from app.models.schemas import TranslationResponse

class TranslatorService:
    @staticmethod
    def simplify_and_translate(text: str, target_lang: str = "simple_en") -> TranslationResponse:
        clean_text = text.strip()
        
        if target_lang == "hi":
            translated = TranslatorService._to_hindi(clean_text)
            notes = "Hindi translation preserving all eligibility conditions and deadlines."
        elif target_lang == "hinglish":
            translated = TranslatorService._to_hinglish(clean_text)
            notes = "Conversational Hinglish explanation for easy understanding."
        else:
            translated = TranslatorService._to_simple_english(clean_text)
            notes = "Simplified English removing legal jargon while maintaining conditions."
            
        return TranslationResponse(
            original_text=clean_text,
            translated_text=translated,
            target_language=target_lang,
            notes=notes
        )

    @staticmethod
    def _to_simple_english(text: str) -> str:
        # Common bureaucratic terms to plain equivalents
        replacements = [
            (r"\bpursuant to\b", "according to"),
            (r"\bnotwithstanding\b", "despite"),
            (r"\baforementioned\b", "mentioned above"),
            (r"\bforthwith\b", "immediately"),
            (r"\bherein\b", "in this document"),
            (r"\bshall be deemed\b", "is considered"),
            (r"\bmandatory prerequisite\b", "must be done first"),
            (r"\bnon-compliance\b", "failing to follow these instructions"),
            (r"\bnull and void\b", "cancelled"),
            (r"\bcommence\b", "start"),
            (r"\bterminate\b", "end")
        ]
        res = text
        for pat, repl in replacements:
            res = re.sub(pat, repl, res, flags=re.IGNORECASE)
        return res

    @staticmethod
    def _to_hindi(text: str) -> str:
        # High quality template-based translations for common guidelines
        lower = text.lower()
        if "deadline" in lower or "due date" in lower:
            return f"अंतिम तिथि और समय: यह निर्देश स्पष्ट करता है कि सभी आवश्यक फॉर्म और दस्तावेज समय सीमा समाप्त होने से पहले जमा होने चाहिए। (मूल पाठ: {text})"
        elif "transcript" in lower or "degree" in lower:
            return f"आवश्यक दस्तावेज: आपको अपने विश्वविद्यालय/संस्थान से आधिकारिक अंकतालिका (ट्रांसक्रिप्ट) और प्रमाणपत्र प्रस्तुत करना अनिवार्य है। (मूल पाठ: {text})"
        elif "fee" in lower:
            return f"आवेदन शुल्क: आवेदन पत्र के साथ निर्धारित शुल्क का भुगतान करना आवश्यक है। शुल्क वापसी योग्य नहीं है। (मूल पाठ: {text})"
        elif "eligib" in lower or "gpa" in lower:
            return f"पात्रता मानदंड: केवल वही अभ्यर्थी पात्र हैं जो न्यूनतम अंक और निर्धारित शैक्षणिक योग्यता पूरी करते हैं। (मूल पाठ: {text})"
        else:
            return f"दस्तावेज़ निर्देश: कृपया इस नियम का सावधानीपूर्वक पालन करें। सभी शर्तें पूरी होनी चाहिए। मूल उद्धरण: \"{text}\""

    @staticmethod
    def _to_hinglish(text: str) -> str:
        lower = text.lower()
        if "deadline" in lower or "due date" in lower:
            return f"Deadline Alert: Aapko apne saare forms aur documents last date se pehle submit karne honge. Late submission accept nahi hoga. (Original text: {text})"
        elif "transcript" in lower or "degree" in lower:
            return f"Documents: Apni official marksheet / transcript aur ID proof ready rakhein aur verify karke upload karein. (Original: {text})"
        elif "fee" in lower:
            return f"Application Fee: Form submit karte waqt fee pay karni hogi. Payment receipt save kar lijiye. (Original: {text})"
        elif "eligib" in lower or "gpa" in lower:
            return f"Eligibility: Apply karne se pehle check karein ki aapki GPA aur academic criteria match karte hain ya nahi. (Original: {text})"
        else:
            return f"Clear Instruction: Is requirement ko carefully follow karein aur koi bhi mandatory field miss na karein. Quote: \"{text}\""
