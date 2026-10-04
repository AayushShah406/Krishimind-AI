from typing import Dict, Any, List

class LanguageService:
    SUPPORTED_LANGUAGES = ["en", "hi", "gu"]
    
    CROP_TRANSLATIONS = {
        "wheat": {"en": "Wheat", "hi": "गेहूं", "gu": "ઘઉં"},
        "rice": {"en": "Rice", "hi": "चावल / धान", "gu": "ડાંગર / ચોખા"},
        "cotton": {"en": "Cotton", "hi": "कपास", "gu": "કપાસ"},
        "groundnut": {"en": "Groundnut", "hi": "मूंगफली", "gu": "મગફળી"},
        "tomato": {"en": "Tomato", "hi": "टमाटर", "gu": "ટામેટાં"}
    }
    
    STAGE_TRANSLATIONS = {
        "germination": {"en": "Germination", "hi": "अंकुरण", "gu": "અંકુરણ"},
        "tillering": {"en": "Tillering", "hi": "कल्ले निकलना", "gu": "ફૂટ / કિલ્લા નીકળવા"},
        "vegetative": {"en": "Vegetative", "hi": "वानस्पतिक वृद्धि", "gu": "વાનસ્પતિક વૃદ્ધિ"},
        "flowering": {"en": "Flowering", "hi": "फूल आने की अवस्था", "gu": "ફૂલ આવવાની અવસ્થા"},
        "grain_filling": {"en": "Grain Filling", "hi": "दाना भरने की अवस्था", "gu": "દાણા ભરાવાની અવસ્થા"},
        "maturity": {"en": "Maturity", "hi": "परिपक्वता", "gu": "પરિપક્વતા"},
        "harvest": {"en": "Harvest Ready", "hi": "कटाई के लिए तैयार", "gu": "કાપણી માટે તૈયાર"}
    }

    CONFIDENCE_TRANSLATIONS = {
        "HIGH": {"en": "High", "hi": "उच्च", "gu": "ઉચ્ચ"},
        "MEDIUM": {"en": "Medium", "hi": "मध्यम", "gu": "મધ્યમ"},
        "LOW": {"en": "Low", "hi": "कम", "gu": "ઓછું"}
    }

    SEVERITY_TRANSLATIONS = {
        "LOW": {"en": "Low", "hi": "कम", "gu": "ઓછી"},
        "MODERATE": {"en": "Moderate", "hi": "मध्यम", "gu": "મધ્યમ"},
        "HIGH": {"en": "High", "hi": "उच्च", "gu": "ગંભીર"},
        "CRITICAL": {"en": "Critical", "hi": "अति गंभीर", "gu": "અતિ ગંભીર"}
    }

    @classmethod
    def resolve_language(cls, lang: str = None, user_lang: str = None) -> str:
        if lang and lang in cls.SUPPORTED_LANGUAGES:
            return lang
        if user_lang and user_lang in cls.SUPPORTED_LANGUAGES:
            return user_lang
        return "en"

    @classmethod
    def get_crop_name(cls, canonical: str, lang: str = "en") -> str:
        key = canonical.lower().strip()
        if key in cls.CROP_TRANSLATIONS:
            return cls.CROP_TRANSLATIONS[key].get(lang, canonical)
        return canonical

    @classmethod
    def get_stage_name(cls, canonical: str, lang: str = "en") -> str:
        key = canonical.lower().strip().replace(" ", "_")
        if key in cls.STAGE_TRANSLATIONS:
            return cls.STAGE_TRANSLATIONS[key].get(lang, canonical)
        return canonical

    @classmethod
    def get_ai_language_prompt_instruction(cls, lang: str) -> str:
        if lang == "hi":
            return (
                "You MUST generate the entire human-readable response strictly in HINDI (Devanagari script). "
                "Keep all numerical measurements (e.g. 71%, 31°C, 18 mm, pH 6.8) EXACT and unaltered. "
                "Output JSON with exact field keys."
            )
        elif lang == "gu":
            return (
                "You MUST generate the entire human-readable response strictly in GUJARATI script. "
                "Keep all numerical measurements (e.g. 71%, 31°C, 18 mm, pH 6.8) EXACT and unaltered. "
                "Output JSON with exact field keys."
            )
        else:
            return (
                "You MUST generate the response in ENGLISH. "
                "Keep all numerical measurements exact and unaltered. "
                "Output JSON with exact field keys."
            )

language_service = LanguageService()
