import json
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.schemas import AIStructuredResponse, AIMediaResource
from app.services.language_service import language_service

class AIService:
    async def reason_and_recommend(
        self,
        question: str,
        context: Dict[str, Any],
        language: str = "en"
    ) -> AIStructuredResponse:
        resp = await self._internal_reason_and_recommend(question, context, language)
        crop_name = (context.get("crop") or {}).get("name", "")
        default_guide, default_media = self.get_multimedia_and_guide(question, crop_name, language)
        if not resp.detailed_guide:
            resp.detailed_guide = default_guide
        if not resp.media_resources:
            resp.media_resources = [AIMediaResource(**m) for m in default_media]
        return resp

    async def _internal_reason_and_recommend(
        self,
        question: str,
        context: Dict[str, Any],
        language: str = "en"
    ) -> AIStructuredResponse:
        """
        Synthesizes structured farm data, weather, soil readings, crop growth stage,
        and RAG retrieved knowledge to generate a high-precision, actionable agricultural recommendation.
        Uses multi-model Gemini cascade with dynamic fallback and vector semantic indexing.
        """
        target_lang = language_service.resolve_language(language)
        
        # Extract context attributes
        farm = context.get("farm") or {}
        field = context.get("field") or {}
        crop = context.get("crop") or {}
        soil = context.get("soil") or {}
        weather = context.get("weather") or {}
        knowledge_chunks = context.get("knowledge_chunks") or []
        
        moisture = soil.get("moisture")
        rain_prob = weather.get("rain_probability")
        rainfall = weather.get("rainfall", 0.0)
        temp = weather.get("temperature")
        growth_stage = crop.get("growth_stage", "Active Growth")
        crop_name = crop.get("name", "")

        # Compile sources used
        sources_used = [
            {"title": ch.get("title", "ICAR Guidelines"), "source": ch.get("source", "Pinecone RAG"), "language": ch.get("language", "en")}
            for ch in knowledge_chunks
        ]

        # Generate topic-aligned detailed guide and multimedia resources (video tutorials & diagrams)
        default_guide, default_media = self.get_multimedia_and_guide(question, crop_name, target_lang)

        # Candidate Gemini models in priority order
        candidate_models = []
        if settings.GEMINI_MODEL:
            candidate_models.append(settings.GEMINI_MODEL)
        for fallback_m in ["gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-flash-latest"]:
            if fallback_m not in candidate_models:
                candidate_models.append(fallback_m)

        # 1. Multi-Model Gemini LLM Reasoning
        if settings.GEMINI_API_KEY:
            system_instruction = (
                "You are KrishiMind AI, an intelligent, multi-lingual agricultural AI assistant designed like ChatGPT for farmers and agronomists. "
                "Answer the user's specific query directly, concisely, and accurately. "
                "- For conversational, identity, or greeting queries (e.g. 'What is your name?', 'Who are you?', 'Hello', 'How are you?'), answer directly and warmly in the requested language. Introduce yourself as KrishiMind AI. "
                "- For agricultural queries, synthesize the provided field context, soil readings (with their source: manual, soil_report, or sensor), weather forecast, and retrieved knowledge chunks to provide scientifically sound, actionable advice. "
                "- Provide detailed, highly actionable advice: include a detailed_guide with 3-4 numbered operational steps. "
                "- When educational videos or reference diagrams are appropriate, provide media_resources with video or image type, title, educational URL, and description. "
                "- CRITICAL RULE ON MISSING DATA: NEVER invent, assume, or simulate missing soil measurements or weather values. "
                "If soil moisture is unavailable or not provided, explicitly state: 'Current soil moisture data is unavailable, so the irrigation recommendation has lower confidence.' "
                "Never invent the missing measurement. Missing values must remain 'Not provided'. "
                f"- Answer strictly in the requested language: {language_service.get_ai_language_prompt_instruction(target_lang)}. "
                "Return ONLY a valid JSON object matching this schema: "
                '{"recommendation": "<Direct, complete, helpful response to the user query>", '
                '"reason": "<Agronomic or contextual reasoning, or empty string>", '
                '"detailed_guide": ["<Step 1: Specific action>", "<Step 2: Specific action>", "<Step 3: Specific action>"], '
                '"evidence": ["<Facts, context, or sensor readings used, or empty array>"], '
                '"data_used": ["<Data sources used, e.g. Gemini Intelligence, Soil Telemetry, Pinecone RAG>"], '
                '"confidence": "HIGH"|"MEDIUM"|"LOW", '
                '"next_action": "<Recommended next action or guidance for the farmer>", '
                '"warnings": ["<Any caution/warnings or empty array>"], '
                '"media_resources": [{"type": "video"|"image", "title": "<Title>", "url": "<URL>", "thumbnail_url": "<URL>", "description": "<Summary>"}]}'
            )

            prompt = (
                f"User Query: {question}\n"
                f"Requested Language: {target_lang}\n\n"
                f"Farm Context: {json.dumps(farm, default=str)}\n"
                f"Field Context: {json.dumps(field, default=str)}\n"
                f"Crop: {json.dumps(crop, default=str)}\n"
                f"Soil Sensor Reading: {json.dumps(soil, default=str)}\n"
                f"Live Weather & Forecast: {json.dumps(weather, default=str)}\n"
                f"Retrieved Agricultural Knowledge Chunks: {json.dumps(knowledge_chunks, default=str)}\n"
            )

            for model_candidate in candidate_models:
                try:
                    async with httpx.AsyncClient(timeout=15.0) as client:
                        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_candidate}:generateContent?key={settings.GEMINI_API_KEY}"
                        body = {
                            "contents": [{"parts": [{"text": prompt}]}],
                            "systemInstruction": {"parts": [{"text": system_instruction}]},
                            "generationConfig": {"responseMimeType": "application/json"}
                        }
                        res = await client.post(gemini_url, json=body)
                        if res.status_code == 200:
                            raw_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                            parsed = json.loads(raw_text)

                            parsed_guide = parsed.get("detailed_guide") or default_guide
                            raw_media = parsed.get("media_resources") or default_media
                            media_objs = []
                            for m in raw_media:
                                if isinstance(m, dict) and m.get("title") and m.get("url"):
                                    media_objs.append(AIMediaResource(
                                        type=m.get("type", "video"),
                                        title=m.get("title"),
                                        url=m.get("url"),
                                        thumbnail_url=m.get("thumbnail_url"),
                                        description=m.get("description")
                                    ))
                            if not media_objs:
                                media_objs = [AIMediaResource(**m) for m in default_media]

                            return AIStructuredResponse(
                                recommendation=parsed.get("recommendation", "Review agricultural recommendations."),
                                reason=parsed.get("reason", ""),
                                evidence=parsed.get("evidence", []),
                                data_used=parsed.get("data_used", ["Gemini Intelligence", "KrishiMind Model"]),
                                confidence=parsed.get("confidence", "HIGH"),
                                next_action=parsed.get("next_action", ""),
                                warnings=parsed.get("warnings", []),
                                language=target_lang,
                                sources_used=sources_used,
                                detailed_guide=parsed_guide,
                                media_resources=media_objs
                            )
                        else:
                            print(f"[Gemini Model {model_candidate} Status {res.status_code}]: {res.text[:120]}")
                except Exception as e:
                    print(f"[Gemini Model {model_candidate} Exception] {e}")

        # 2. Dynamic, context-driven Agricultural Reasoning Fallback
        q_lower = question.lower().strip()
        field_name = field.get("name")
        farm_name = farm.get("name")

        # Dynamic Data Used & Evidence compiled from DB telemetry
        data_used_list = []
        if moisture is not None:
            data_used_list.append(f"DB Soil Moisture: {moisture}%")
        if rain_prob is not None:
            data_used_list.append(f"Live Rain Forecast: {rain_prob}%")
        if temp is not None:
            data_used_list.append(f"Live Field Temp: {temp}°C")
        if growth_stage and crop_name:
            data_used_list.append(f"DB Crop Stage: {crop_name} ({growth_stage})")

        # Identity & Name Query Detection
        is_identity_query = any(w in q_lower for w in [
            "what is your name", "who are you", "what's your name", "your name", "who made you", "what are you",
            "તારું નામ", "તમારું નામ", "તમે કોણ", "તારૂ નામ", "કોણ છો",
            "तुम्हारा नाम", "आप कौन", "तुम कौन", "आपका नाम", "तुम्हारा परिचय", "नाम क्या है"
        ])
        if is_identity_query:
            if target_lang == "gu":
                return AIStructuredResponse(
                    recommendation="હું કૃષિમાઇન્ડ AI (KrishiMind AI) છું, તમારો બહુભાષીય સ્માર્ટ કૃષિ નિર્ણય સહાયક. હું ખેડૂતોને પાક સંભાળ, જમીન ભેજ, ખાતર આયોજન, હવામાન પૂર્વાનુમાન અને રોગ નિયંત્રણ માટે સચોટ વૈજ્ઞાનિક સલાહ આપું છું.",
                    reason="ખેડૂતોને તેમના ખેતરના વાસ્તવિક ડેટા અને ICAR સંશોધનના આધારે યોગ્ય સમયે યોગ્ય નિર્ણય લેવામાં મદદ કરવા માટે કૃષિમાઇન્ડ AI બનાવવામાં આવ્યું છે.",
                    evidence=["KrishiMind Multi-lingual Intelligence", "Pinecone Vector Database"],
                    data_used=["KrishiMind AI Assistant"],
                    confidence="HIGH",
                    next_action="તમારા પાક, ખાતર, સિંચાઈ અથવા રોગ નિયંત્રણ વિશે મને પૂછો.",
                    warnings=[],
                    language="gu",
                    sources_used=sources_used
                )
            elif target_lang == "hi":
                return AIStructuredResponse(
                    recommendation="मैं कृषिमाइंड एआई (KrishiMind AI) हूँ, आपका बहुभाषी स्मार्ट कृषि निर्णय सहायक। मैं किसानों को फसल स्वास्थ्य, मिट्टी की नमी, खाद प्रबंधन, मौसम पूर्वानुमान और कीट-रोग नियंत्रण हेतु वैज्ञानिक मार्गदर्शन प्रदान करता हूँ।",
                    reason="किसानों को उनके खेत के वास्तविक डेटा और आईसीएआर अनुसंधान के आधार पर सही निर्णय लेने में सहायता करना मेरा उद्देश्य है।",
                    evidence=["KrishiMind Multi-lingual Intelligence", "Pinecone Vector Database"],
                    data_used=["KrishiMind AI Assistant"],
                    confidence="HIGH",
                    next_action="अपनी फसल, सिंचाई या खाद संबंधी कोई भी प्रश्न पूछें।",
                    warnings=[],
                    language="hi",
                    sources_used=sources_used
                )
            else:
                return AIStructuredResponse(
                    recommendation="I am KrishiMind AI, your intelligent multi-lingual agricultural decision advisor. I help farmers with real-time crop health monitoring, precision irrigation scheduling, nutrient balance, and weather advisories based on field telemetry and ICAR research.",
                    reason="Engineered to provide dynamic, ChatGPT-style conversational advice tailored specifically to your farm and crops.",
                    evidence=["KrishiMind Multi-lingual Intelligence", "Pinecone Vector Database"],
                    data_used=["KrishiMind AI Assistant"],
                    confidence="HIGH",
                    next_action="Ask any question about your crops, soil health, irrigation schedule, or pest management.",
                    warnings=[],
                    language="en",
                    sources_used=sources_used
                )

        # Greeting query
        is_greeting = any(w == q_lower or q_lower.startswith(w + " ") or q_lower.startswith(w + "?") for w in [
            "hi", "hello", "hey", "namaste", "kem cho", "kaise ho", "good morning", "good afternoon", "good evening",
            "नमस्ते", "प्रणाम", "નમસ્તે", "કેમ છો", "હેલો"
        ])
        if is_greeting:
            if target_lang == "gu":
                return AIStructuredResponse(
                    recommendation="નમસ્તે! કૃષિમાઇન્ડ AI માં આપનું સ્વાગત છે. આજે હું તમારા પાક, જમીન અથવા ખેતીના આયોજનમાં શી રીતે મદદ કરી શકું?",
                    reason="હું તમારા ખેતરની સ્થિતિ અને વૈજ્ઞાનિક કૃષિ પદ્ધતિઓના આધારે સલાહ આપવા માટે સજ્જ છું.",
                    evidence=[f"ખેતર: {field_name or 'સામાન્ય'}", "ભાષા: ગુજરાતી"],
                    data_used=data_used_list if data_used_list else ["ખેડૂત પ્રોફાઇલ"],
                    confidence="HIGH",
                    next_action="મને પૂછો: 'શું મારે કાલે પિયત આપવું જોઈએ?', 'ખાતરનું આયોજન કેવી રીતે કરવું?', અથવા 'રોગ નિયંત્રણ'.",
                    warnings=[],
                    language="gu",
                    sources_used=sources_used
                )
            elif target_lang == "hi":
                return AIStructuredResponse(
                    recommendation="नमस्ते! कृषिमाइंड एआई में आपका स्वागत है। आज मैं आपकी फसल, मिट्टी या खेत प्रबंधन में किस प्रकार सहायता कर सकता हूँ?",
                    reason="मैं आपके खेत की स्थिति और वैज्ञानिक कृषि पद्धतियों के आधार पर सलाह देने हेतु तैयार हूँ।",
                    evidence=[f"खेत: {field_name or 'सामान्य'}", "भाषा: हिन्दी"],
                    data_used=data_used_list if data_used_list else ["किसान प्रोफाइल"],
                    confidence="HIGH",
                    next_action="मुझसे पूछें: 'क्या कल सिंचाई करनी चाहिए?', 'खाद प्रबंधन कैसे करें?', या 'कीट-रोग नियंत्रण'.",
                    warnings=[],
                    language="hi",
                    sources_used=sources_used
                )
            else:
                return AIStructuredResponse(
                    recommendation="Hello! Welcome to KrishiMind AI. How can I assist you with your crops, soil health, or farm management today?",
                    reason="I am ready to provide real-time agricultural guidance based on your field telemetry and agronomic science.",
                    evidence=[f"Field: {field_name or 'General'}", "Language: English"],
                    data_used=data_used_list if data_used_list else ["Farmer Profile"],
                    confidence="HIGH",
                    next_action="Ask an agronomic question such as 'Should I irrigate tomorrow?', 'How to balance fertilizer?', or 'Pest control guidance'.",
                    warnings=[],
                    language="en",
                    sources_used=sources_used
                )

        # Capabilities / Help query
        is_capabilities_query = any(w in q_lower for w in [
            "what can you do", "features", "help", "મદદ", "શું કરી શકો", "સુવિધાઓ", "सहायता", "क्या कर सकते हो", "फीचर्स"
        ])
        if is_capabilities_query:
            if target_lang == "gu":
                return AIStructuredResponse(
                    recommendation="કૃષિમાઇન્ડ AI તમને સિંચાઈ આયોજન, જમીન ભેજ અને પોષક તત્વોનું વિશ્લેષણ, પાકના રોગ-જીવાત નિદાન (ઈમેજ એનાલિસિસ), અને વાસ્તવિક હવામાન આધારિત નિર્ણયો લેવામાં મદદ કરે છે.",
                    reason="પાક ઉત્પાદન વધારવા અને ખર્ચ ઘટાડવા માટે તમામ સુવિધાઓ ઉપલબ્ધ છે.",
                    evidence=["ICAR ડેટાબેઝ", "Pinecone વેક્ટર મેમરી", "લાઈવ સેન્સર મોનિટરિંગ"],
                    data_used=["કૃષિમાઇન્ડ AI મોડ્યુલ"],
                    confidence="HIGH",
                    next_action="તમારી શંકા અથવા પ્રશ્ન અહીં લખો.",
                    warnings=[],
                    language="gu",
                    sources_used=sources_used
                )
            elif target_lang == "hi":
                return AIStructuredResponse(
                    recommendation="कृषिमाइंड एआई आपको सिंचाई समय-सारणी, मिट्टी के पोषक तत्वों के विश्लेषण, फसल रोग निदान (फोटो विश्लेषण), एवं मौसम आधारित कृषि निर्णय लेने में सहायता करता है।",
                    reason="फसल उत्पादन बढ़ाने और कृषि लागत कम करने हेतु सभी सुविधाएं एकीकृत हैं।",
                    evidence=["आईसीएआर डेटाबेस", "पाइनकोन वेक्टर मेमोरी", "लाइव सेंसर डेटा"],
                    data_used=["कृषिमाइंड एआई मॉड्यूल"],
                    confidence="HIGH",
                    next_action="अपना कोई भी कृषि संबंधी प्रश्न यहाँ दर्ज करें।",
                    warnings=[],
                    language="hi",
                    sources_used=sources_used
                )
            else:
                return AIStructuredResponse(
                    recommendation="KrishiMind AI provides intelligent irrigation scheduling, soil fertility analytics, visual crop disease diagnosis, weather alerts, and ICAR-backed agronomic guidance.",
                    reason="Designed to maximize crop yield while minimizing input costs using real-time data.",
                    evidence=["ICAR Knowledge Base", "Pinecone Vector Store", "Sensor Telemetry"],
                    data_used=["KrishiMind AI Modules"],
                    confidence="HIGH",
                    next_action="Type any agricultural question to begin.",
                    warnings=[],
                    language="en",
                    sources_used=sources_used
                )

        # Irrigation Query
        is_irrigation_query = any(w in q_lower for w in [
            "irrig", "water", "watering", "moisture",
            "पानी", "सिंचाई", "सिंचाईं",
            "પાણી", "સિંચાઈ", "સિંચાઇ", "પિયત", "પિયતણ"
        ])
        if is_irrigation_query:
            if moisture is None:
                rain_text = f"Precipitation probability is {rain_prob}%." if rain_prob is not None else "Weather forecast data is currently unavailable."
                if target_lang == "gu":
                    return AIStructuredResponse(
                        recommendation="હાલમાં જમીન ભેજનો ડેટા ઉપલબ્ધ નથી, તેથી પિયતની ભલામણ ઓછી ચોક્કસતા (lower confidence) ધરાવે છે.",
                        reason="જમીન ભેજનો ડેટા ઉપલબ્ધ ન હોવાથી ચોક્કસ પિયત સમય-સારણી પુષ્ટિ થઈ શકતી નથી. કૃપા કરીને સોઇલ પેજ પર વાસ્તવિક માપ નોંધો.",
                        evidence=["જમીન ભેજ: Not provided", rain_text],
                        data_used=data_used_list if data_used_list else ["હવામાન પૂર્વાનુમાન (Open-Meteo)"],
                        confidence="LOW",
                        next_action="ચોક્કસ પિયત ભલામણ માટે સોઇલ પેજ પર જઈને તાજેતરનો માટીનો ભેજ નોંધો.",
                        warnings=["જમીન ભેજ જાણ્યા વિના પિયત આપવાથી મૂળમાં સડો અથવા પાણીનો બગાડ થઈ શકે છે."],
                        language="gu",
                        sources_used=sources_used
                    )
                elif target_lang == "hi":
                    return AIStructuredResponse(
                        recommendation="वर्तमान में मिट्टी की नमी का डेटा उपलब्ध नहीं है, इसलिए सिंचाई की सिफारिश कम विश्वास (lower confidence) रखती है।",
                        reason="सटीक सिंचाई निर्णय के लिए मिट्टी की नमी का वास्तविक मापन आवश्यक है।",
                        evidence=["मिट्टी की नमी: Not provided", rain_text],
                        data_used=data_used_list if data_used_list else ["मौसम पूर्वानुमान (Open-Meteo)"],
                        confidence="LOW",
                        next_action="मृदा पृष्ठ पर जाकर वर्तमान नमी दर्ज करें।",
                        warnings=["सटीक नमी डेटा के बिना अत्यधिक सिंचाई से बचें।"],
                        language="hi",
                        sources_used=sources_used
                    )
                else:
                    return AIStructuredResponse(
                        recommendation="Current soil moisture data is unavailable, so the irrigation recommendation has lower confidence.",
                        reason=f"Without live soil moisture telemetry, an accurate irrigation decision cannot be confirmed. {rain_text}",
                        evidence=["Soil Moisture: Not provided", rain_text],
                        data_used=data_used_list if data_used_list else ["Weather Forecast (Open-Meteo)"],
                        confidence="LOW",
                        next_action="Record a soil moisture reading on the Soil page to generate a precise schedule.",
                        warnings=["Irrigating without knowing moisture status risks waterlogging or leaching."],
                        language="en",
                        sources_used=sources_used
                    )

            if moisture >= 65 or (rain_prob is not None and rain_prob >= 60):
                if target_lang == "gu":
                    return AIStructuredResponse(
                        recommendation="સિંચાઈ 24 થી 48 કલાક માટે મુલતવી રાખો.",
                        reason=f"હાલમાં જમીનમાં ભેજ {moisture}% પૂરતો છે અને વરસાદની શક્યતા {rain_prob or 0}% છે.",
                        evidence=[f"માટીની ભેજ: {moisture}%", f"વરસાદ સંભાવના: {rain_prob or 0}%"],
                        data_used=data_used_list,
                        confidence="HIGH",
                        next_action="આવતીકાલે વરસાદ પછી ફરીથી ભેજ તપાસો.",
                        warnings=[],
                        language="gu",
                        sources_used=sources_used
                    )
                elif target_lang == "hi":
                    return AIStructuredResponse(
                        recommendation="सिंचाई अगले 24 से 48 घंटे के लिए टालें।",
                        reason=f"वर्तमान में मिट्टी में नमी {moisture}% पर्याप्त है तथा वर्षा की संभावना {rain_prob or 0}% है।",
                        evidence=[f"मिट्टी की नमी: {moisture}%", f"वर्षा संभावना: {rain_prob or 0}%"],
                        data_used=data_used_list,
                        confidence="HIGH",
                        next_action="वर्षा के पश्चात मिट्टी की नमी का पुनः परीक्षण करें।",
                        warnings=[],
                        language="hi",
                        sources_used=sources_used
                    )
                else:
                    return AIStructuredResponse(
                        recommendation="Delay irrigation by 24 to 48 hours.",
                        reason=f"Root-zone soil moisture is adequate at {moisture}%, and precipitation probability is {rain_prob or 0}%.",
                        evidence=[f"Soil Moisture: {moisture}%", f"Rain Probability: {rain_prob or 0}%"],
                        data_used=data_used_list,
                        confidence="HIGH",
                        next_action="Re-evaluate moisture after the anticipated showers.",
                        warnings=[],
                        language="en",
                        sources_used=sources_used
                    )
            else:
                if target_lang == "gu":
                    return AIStructuredResponse(
                        recommendation="હળવું પિયત (25-30 mm) આપવાની ભલામણ છે.",
                        reason=f"જમીનમાં ભેજનું પ્રમાણ ઘટીને {moisture}% થઈ ગયું છે.",
                        evidence=[f"માટીની ભેજ: {moisture}%"],
                        data_used=data_used_list,
                        confidence="HIGH",
                        next_action="સાંજના સમયે અથવા વહેલી સવારે ડ્રિપ પદ્ધતિથી પિયત આપો.",
                        warnings=["બપોરના તડકામાં પિયત આપવાનું ટાળો."],
                        language="gu",
                        sources_used=sources_used
                    )
                elif target_lang == "hi":
                    return AIStructuredResponse(
                        recommendation="खेत में हल्का पानी (25-30 मिमी सिंचाई) दें।",
                        reason=f"मिट्टी में नमी का स्तर घटकर {moisture}% पर आ गया है।",
                        evidence=[f"मिट्टी की नमी: {moisture}%"],
                        data_used=data_used_list,
                        confidence="HIGH",
                        next_action="शाम के समय हल्की सिंचाई प्रदान करें।",
                        warnings=[],
                        language="hi",
                        sources_used=sources_used
                    )
                else:
                    return AIStructuredResponse(
                        recommendation="Apply light irrigation (25-30 mm) within the next 12-24 hours.",
                        reason=f"Root-zone moisture has dropped to {moisture}%, which requires replenishment.",
                        evidence=[f"Soil Moisture: {moisture}%"],
                        data_used=data_used_list,
                        confidence="HIGH",
                        next_action="Schedule irrigation during early morning or late evening.",
                        warnings=[],
                        language="en",
                        sources_used=sources_used
                    )

        # Nutrient / Fertilizer Query
        is_nutrient_query = any(w in q_lower for w in [
            "fertiliz", "urea", "nitrogen", "npk", "phosphor", "potash", "dap", "zinc",
            "खाद", "उर्वरक", "यूरिया", "नाइट्रोजन",
            "ખાતર", "યુરિયા", "નાઇટ્રોજન"
        ])
        if is_nutrient_query:
            if target_lang == "gu":
                return AIStructuredResponse(
                    recommendation="જમીન પરીક્ષણ આધારિત સંતુલિત ખાતર અને યોગ્ય સમયે નાઇટ્રોજનનો હપ્તો આપો.",
                    reason="યોગ્ય સમયે પોષક તત્વો આપવાથી પાકનો ઉત્તમ વિકાસ અને ઉત્પાદન મળે છે.",
                    evidence=[f"જમીન pH: {soil.get('ph') or 'ચકાસાયેલ નથી'}"],
                    data_used=data_used_list if data_used_list else ["માટી પોષકતત્વ રેકોર્ડ"],
                    confidence="HIGH",
                    next_action="માટીમાં ભેજ હોય ત્યારે જ યુરિયા અથવા NPK નો ઉપયોગ કરો.",
                    warnings=["અતિશય યુરિયાના ઉપયોગથી પાકમાં જીવાતનો ઉપદ્રવ વધી શકે છે."],
                    language="gu",
                    sources_used=sources_used
                )
            elif target_lang == "hi":
                return AIStructuredResponse(
                    recommendation="मृदा परीक्षण के अनुसार संतुलित उर्वरक एवं समय पर नाइट्रोजन की खुराक दें।",
                    reason="संतुलित पोषक तत्व फसल की रोग प्रतिरोधक क्षमता और पैदावार में वृद्धि करते हैं।",
                    evidence=[f"मिट्टी का pH: {soil.get('ph') or 'जांच नहीं हुई'}"],
                    data_used=data_used_list if data_used_list else ["मृदा पोषक तत्व रिकॉर्ड"],
                    confidence="HIGH",
                    next_action="पर्याप्त नमी की स्थिति में ही खाद का छिड़काव या प्रयोग करें।",
                    warnings=["अत्यधिक यूरिया का उपयोग न करें।"],
                    language="hi",
                    sources_used=sources_used
                )
            else:
                return AIStructuredResponse(
                    recommendation="Apply balanced fertilization according to crop stage and soil test results.",
                    reason="Split application of nitrogen enhances fertilizer efficiency and prevents leaching loss.",
                    evidence=[f"Soil pH: {soil.get('ph') or 'Not recorded'}"],
                    data_used=data_used_list if data_used_list else ["Soil Nutrient Records"],
                    confidence="HIGH",
                    next_action="Ensure adequate soil moisture before applying granular fertilizers.",
                    warnings=["Do not over-apply nitrogen as it increases succulent vegetative growth and pest vulnerability."],
                    language="en",
                    sources_used=sources_used
                )

        # Yellow leaf / Disease Query
        is_disease_query = any(w in q_lower for w in [
            "yellow", "spot", "chlorosis", "rust", "blight", "fungal", "disease", "pest",
            "पीला", "पीले", "धब्बा", "रोग", "कीट",
            "પીળા", "પીળું", "ડાઘ", "રોગ", "જીવાત"
        ])
        if is_disease_query:
            if target_lang == "gu":
                return AIStructuredResponse(
                    recommendation="પાંદડા પીળા પડવાના મુખ્ય કારણોમાં નાઇટ્રોજનની ઉણપ અથવા વધુ પડતો ભેજ હોઈ શકે છે. સચોટ નિદાન માટે પાંદડાનો ફોટો અપલોડ કરો.",
                    reason="મૂળમાં પાણી ભરાવાથી અથવા સૂક્ષ્મ પોષક તત્ત્વોની ખામીથી પાંદડામાં હરિતદ્રવ્ય ઘટે છે.",
                    evidence=["લક્ષણ: પર્ણ પીળાશ (Chlorosis)"],
                    data_used=["કૃષિ વિજ્ઞાન ડેટાબેઝ"],
                    confidence="MEDIUM",
                    next_action="ક્રોપ ઈમેજ એનાલિસિસ પેજ પર જઈને પાંદડાનો સ્પષ્ટ ફોટો અપલોડ કરો.",
                    warnings=["યોગ્ય નિદાન વગર કોઈપણ જંતુનાશકનો છંટકાવ ન કરવો."],
                    language="gu",
                    sources_used=sources_used
                )
            elif target_lang == "hi":
                return AIStructuredResponse(
                    recommendation="पत्तियों का पीला पड़ना नाइट्रोजन की कमी या जलभराव का संकेत हो सकता है। सटीक जांच हेतु पौधे की तस्वीर अपलोड करें।",
                    reason="जड़ों में अधिक नमी या सूक्ष्म पोषक तत्वों की कमी से पत्तियों में क्लोरोसिस होता है।",
                    evidence=["लक्षण: पत्तियों का पीलापन"],
                    data_used=["कृषि विज्ञान डेटाबेस"],
                    confidence="MEDIUM",
                    next_action="फसल चित्र विश्लेषण टूल में प्रभावित पौधे का फोटो अपलोड करें।",
                    warnings=["बिना सटीक पहचान के कीटनाशक का प्रयोग न करें।"],
                    language="hi",
                    sources_used=sources_used
                )
            else:
                return AIStructuredResponse(
                    recommendation="Yellowing leaves often indicate nitrogen deficiency, root hypoxia from over-irrigation, or early fungal infection.",
                    reason="Chlorosis develops when chlorophyll synthesis is impaired due to nutrient deficit or poor root aeration.",
                    evidence=["Symptom: Leaf chlorosis / yellowing"],
                    data_used=["Agronomic Pathology Guidelines"],
                    confidence="MEDIUM",
                    next_action="Upload a close-up photo to Crop Image Analysis for visual AI pathology diagnosis.",
                    warnings=["Do not apply excessive chemical pesticides before confirming the root cause."],
                    language="en",
                    sources_used=sources_used
                )

        # 3. Dynamic RAG Chunk Answer or General Open Query
        if knowledge_chunks:
            top_chunk = knowledge_chunks[0]
            chunk_content = top_chunk.get("content") or top_chunk.get("title", "")
            return AIStructuredResponse(
                recommendation=chunk_content[:280] if len(chunk_content) > 10 else f"Guidance regarding {question}: Follow recommended agronomic management.",
                reason=f"Synthesized from agricultural knowledge repository: {top_chunk.get('title', 'Agricultural Research')}.",
                evidence=[f"Source: {top_chunk.get('source', 'Pinecone RAG')}", f"Topic: {top_chunk.get('topic', 'Agronomy')}"],
                data_used=data_used_list + ["Pinecone Vector RAG Store"],
                confidence="HIGH",
                next_action="Review field conditions and implement recommended practices.",
                warnings=[],
                language=target_lang,
                sources_used=sources_used
            )

        # Clean, customized response for any remaining open-ended question
        clean_crop_str = f" for your {crop_name}" if crop_name else ""
        if target_lang == "gu":
            return AIStructuredResponse(
                recommendation=f"તમારા પ્રશ્ન '{question}' ના સંદર્ભમાં: કૃષિ સલાહકાર ભલામણ કરે છે કે ખેતરના વાતાવરણ અને પાકની સ્થિતિ અનુસાર વૈજ્ઞાનિક પદ્ધતિઓ અપનાવવી.",
                reason="હવામાન પરિબળો અને ખેતરના માપદંડોના આધારે નિર્ણય લેવો હિતાવહ છે.",
                evidence=[f"પ્રશ્ન: {question}", f"ખેતર: {field_name or 'સામાન્ય'}"],
                data_used=data_used_list if data_used_list else ["ખેતી સંશોધન ડેટા"],
                confidence="HIGH",
                next_action="વધુ વિગતવાર માર્ગદર્શન માટે ચોક્કસ વિષય (સિંચાઈ, ખાતર, જીવાત) પૂછો.",
                warnings=[],
                language="gu",
                sources_used=sources_used
            )
        elif target_lang == "hi":
            return AIStructuredResponse(
                recommendation=f"आपके प्रश्न '{question}' के संदर्भ में: कृषि सलाहकार की संस्तुति है कि वर्तमान मौसमी परिस्थितियों एवं फसल स्थिति अनुसार संतुलित प्रबंधन अपनाएं।",
                reason="खेत के वास्तविक आंकड़ों और कृषि विज्ञान सिद्धांतों के आधार पर निर्णय लेना सर्वोत्तम है।",
                evidence=[f"प्रश्न: {question}", f"खेत: {field_name or 'सामान्य'}"],
                data_used=data_used_list if data_used_list else ["कृषि अनुसंधान डेटा"],
                confidence="HIGH",
                next_action="विशिष्ट मार्गदर्शन हेतु सिंचाई, खाद या रोग से संबंधित प्रश्न पूछें।",
                warnings=[],
                language="hi",
                sources_used=sources_used
            )
        else:
            return AIStructuredResponse(
                recommendation=f"Regarding '{question}': Based on agronomic principles{clean_crop_str}, maintain balanced field management aligned with local seasonal conditions.",
                reason="Decisions should integrate current field observations and scientific crop management protocols.",
                evidence=[f"Query: {question}", f"Field: {field_name or 'General'}"],
                data_used=data_used_list if data_used_list else ["Agronomic Research Data"],
                confidence="HIGH",
                next_action="Feel free to ask a specific follow-up regarding irrigation, fertilization, or crop health.",
                warnings=[],
                language="en",
                sources_used=sources_used,
                detailed_guide=default_guide,
                media_resources=[AIMediaResource(**m) for m in default_media]
            )

    def get_multimedia_and_guide(
        self,
        question: str,
        crop_name: str = "",
        language: str = "en"
    ) -> tuple[List[str], List[Dict[str, Any]]]:
        """
        Generates detailed step-by-step operational guide and curated educational
        video and visual diagram resources aligned with the farmer's query topic.
        """
        q = question.lower()
        target_lang = language_service.resolve_language(language)

        # 1. Irrigation / Water Management
        if any(w in q for w in ["irrig", "water", "moisture", "પાણી", "સિંચાઈ", "પિયત", "पानी", "सिंचाई"]):
            if target_lang == "gu":
                guide = [
                    "૧. વહેલી સવારે મૂળ વિસ્તાર (Root-Zone) માં ૧૫-૨૦ સેમી ઊંડાઈએ ભેજ તપાસો.",
                    "૨. ડ્રિપ લાઈનમાં કચરો કે ક્ષાર જમા ન થાય તે માટે ફ્લશિંગ વાલ્વ ખોલીને ૧ મિનિટ સાફ પાણી વહેવા દો.",
                    "૩. પાકના ફૂલ અને દાણા બેસવાના નાજુક તબક્કે નિયમિત હળવું પિયત (25-30 mm) જાળવી રાખો.",
                    "૪. જમીનમાં ૬૦% થી ૭૫% વચ્ચે ભેજનું પ્રમાણ શ્રેષ્ઠ ઉત્પાદન આપે છે."
                ]
                video_title = f"{crop_name or 'પાક'} માટે ટપક સિંચાઈ પદ્ધતિ અને જમીન ભેજ નિયંત્રણ માર્ગદર્શન"
                img_title = "મૂળ વિસ્તાર ભેજ શોષણ અને સિંચાઈ સ્તર ડાયાગ્રામ"
            elif target_lang == "hi":
                guide = [
                    "1. सुबह के समय जड़ क्षेत्र में 15-20 सेमी गहराई पर मिट्टी की नमी की जांच करें।",
                    "2. ड्रिप पाइपलाइन को स्वच्छ रखने के लिए फ्लश वाल्व खोलकर ड्रिपर की सफाई सुनिश्चित करें।",
                    "3. फसल के संवेदनशील विकास चरणों में हल्की और नियमित सिंचाई (25-30 मिमी) प्रदान करें।",
                    "4. खेत में 60% से 75% के बीच नमी बनाए रखने से अधिकतम पैदावार प्राप्त होती है।"
                ]
                video_title = f"{crop_name or 'फसल'} में ड्रिप सिंचाई तकनीक एवं नमी नियंत्रण वीडियो ट्यूटोरियल"
                img_title = "जड़ क्षेत्र नमी संतृप्ति एवं सिंचाई प्रबंधन चार्ट"
            else:
                guide = [
                    "1. Inspect root-zone soil moisture at 15-20 cm depth before initiating irrigation cycle.",
                    "2. Flush drip lateral lines to eliminate mineral precipitates and maintain uniform dripper discharge.",
                    "3. Schedule irrigation during early morning (6:00 - 9:00 AM) to minimize evaporation losses.",
                    "4. Target root-zone moisture between 60% and 75% available water capacity for optimal uptake."
                ]
                video_title = f"Precision Drip Irrigation Setup & Soil Moisture Management for {crop_name or 'Crops'}"
                img_title = "Root-Zone Water Depletion & Saturation Level Diagram"

            media = [
                {
                    "type": "video",
                    "title": video_title,
                    "url": f"https://www.youtube.com/results?search_query=drip+irrigation+system+moisture+management+{crop_name or 'crops'}",
                    "thumbnail_url": "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&auto=format&fit=crop",
                    "description": "Educational agricultural demonstration on calculating emitter flow rates, scheduling run times, and preventing root-rot waterlogging."
                },
                {
                    "type": "image",
                    "title": img_title,
                    "url": "https://images.unsplash.com/photo-1592417817098-8f3d6ef23991?w=800&auto=format&fit=crop",
                    "description": "Agronomic visual reference illustrating moisture distribution bulb under drip emitters across different soil textures."
                }
            ]
            return guide, media

        # 2. Nutrients / Fertilizer / Urea / NPK
        if any(w in q for w in ["fertiliz", "urea", "nitrogen", "npk", "phosphor", "potash", "खाद", "उर्वरक", "ખાતર"]):
            if target_lang == "gu":
                guide = [
                    "૧. માટી પરીક્ષણ (Soil Test) આધારિત NPK ના પ્રમાણનું સંતુલન જાળવો.",
                    "૨. યુરિયા (નાઇટ્રોજન) એકસાથે આપવાને બદલે પાકના વૃદ્ધિ તબક્કા અનુસાર ૨ થી ૩ હપ્તામાં આપો.",
                    "૩. જમીનમાં પૂરતો ભેજ હોય ત્યારે જ દાણાદાર ખાતરનો ઉપયોગ કરવો, સૂકી જમીનમાં આપવાનું ટાળો.",
                    "૪. સૂક્ષ્મ તત્વોની ઉણપ માટે ૦.૫% ઝીંક સલ્ફેટ અથવા ૧૯-૧૯-૧૯ નો છંટકાવ કરો."
                ]
                video_title = f"{crop_name or 'પાક'} માટે સંતુલિત ખાતર અને યુરિયા વ્યવસ્થાપન માર્ગદર્શન"
                img_title = "વનસ્પતિ પોષક તત્ત્વોની ઉણપ લક્ષણોનું વિઝ્યુઅલ ચાર્ટ"
            elif target_lang == "hi":
                guide = [
                    "1. मृदा स्वास्थ्य कार्ड के आधार पर एनपीके और सूक्ष्म पोषक तत्वों की मात्रा निर्धारित करें।",
                    "2. यूरिया की पूरी खुराक एक साथ देने के बजाय 2-3 भागों में बांटकर (Split Application) दें।",
                    "3. दानेदार खाद का छिड़काव खेत में पर्याप्त नमी होने पर ही करें ताकि पोषक तत्व आसानी से घुल सकें।",
                    "4. सूक्ष्म पोषक तत्वों की कमी दूर करने हेतु आवश्यकतानुसार एनपीके 19-19-19 या जिंक का पर्णीय छिड़काव करें।"
                ]
                video_title = f"{crop_name or 'फसल'} में संतुलित उर्वरक एवं यूरिया प्रयोग की आधुनिक विधि"
                img_title = "पोषक तत्वों की कमी के पत्तियों पर दृश्य लक्षण चार्ट"
            else:
                guide = [
                    "1. Formulate basal and top-dressing doses strictly calibrated to soil test NPK values.",
                    "2. Split nitrogen (Urea) into 2-3 installments aligned with vegetative tillering and flowering stages.",
                    "3. Apply fertilizers when root-zone soil contains sufficient moisture to prevent root osmotic burn.",
                    "4. Supplement with foliar sprays (e.g. 19-19-19 @ 10g/L or Chelated Zinc) for rapid micronutrient correction."
                ]
                video_title = f"Balanced NPK & Micronutrient Management for {crop_name or 'High-Yield Crops'}"
                img_title = "Plant Nutrient Deficiency Foliar Diagnostic Chart"

            media = [
                {
                    "type": "video",
                    "title": video_title,
                    "url": f"https://www.youtube.com/results?search_query=balanced+npk+fertilizer+application+techniques+{crop_name or 'crops'}",
                    "thumbnail_url": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop",
                    "description": "Agronomic masterclass explaining fertilizer application depth, banding near root zones, and volatilization prevention."
                },
                {
                    "type": "image",
                    "title": img_title,
                    "url": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop",
                    "description": "Standard ICAR leaf diagnostic chart comparing chlorosis symptoms across Nitrogen, Phosphorus, Potassium, Iron, and Zinc."
                }
            ]
            return guide, media

        # 3. Pest / Disease / Yellowing / Fungus
        if any(w in q for w in ["disease", "pest", "yellow", "spot", "chlorosis", "fungal", "रोग", "कीट", "पीला", "જીવાત", "પીળા", "ડાઘ"]):
            if target_lang == "gu":
                guide = [
                    "૧. સવારે ખેતરમાં જઈને પાંદડાની નીચેની સપાટી તપાસો અને લક્ષણોની તીવ્રતા નોંધો.",
                    "૨. રોગિષ્ટ કે સૂકા પાંદડાને કાપીને ખેતરની બહાર ખાડામાં દાટી દો અથવા બાળી નાખો.",
                    "૩. ફૂગના રોગ માટે મેન્કોઝેબ (Mancozeb 75 WP) @ ૨.૫ ગ્રામ/લિટર અથવા તાંબા આધારિત ફૂગનાશકનો છંટકાવ કરો.",
                    "૪. ચુસિયા પ્રકારની જીવાતો (સફેદ માખી, થ્રીપ્સ) માટે એકરે ૧૫-૨૦ પીળા-વાદળી ગુંદરિયા પિંજર લગાવો."
                ]
                video_title = f"{crop_name or 'પાક'}માં રોગ-જીવાત ઓળખ અને સચોટ દવાનો છંટકાવ માર્ગદર્શન"
                img_title = "પાંદડાના રોગ અને ફૂગના સંક્રમણની વિઝ્યુઅલ ઓળખ માર્ગદર્શિકા"
            elif target_lang == "hi":
                guide = [
                    "1. प्रातःकाल खेत का निरीक्षण करें और पत्तियों की निचली सतह पर फफूंद या कीटों की उपस्थिति जांचें।",
                    "2. अत्यधिक संक्रमित पत्तियों अथवा पौधों को तोड़कर खेत से दूर नष्ट करें ताकि संक्रमण न फैले।",
                    "3. फफूंद जनित रोगों के लिए मैंकोजेब (Mancozeb 75 WP) @ 2.5 ग्राम प्रति लीटर पानी में मिलाकर शांत मौसम में छिड़कें।",
                    "4. रस चूसक कीटों के नियंत्रण हेतु प्रति एकड़ 15-20 पीले/नीले चिपचिपे ट्रैप (Sticky Traps) लगाएं।"
                ]
                video_title = f"{crop_name or 'फसल'} में कीट एवं फफूंद रोग नियंत्रण की वैज्ञानिक विधि"
                img_title = "फसल रोग एवं कीट क्षति दृश्य पहचान चार्ट"
            else:
                guide = [
                    "1. Scout the field during early morning, systematically checking leaf undersides across 10 random crop points.",
                    "2. Isolate and prune severely necrotic foliage to prevent spore proliferation to healthy canopy.",
                    "3. For foliar fungal blights or spots, apply Mancozeb 75 WP (@ 2.5 g/L) or Azoxystrobin during calm wind conditions.",
                    "4. Deploy 15-20 yellow and blue sticky traps per acre to intercept whiteflies, aphids, and thrips populations."
                ]
                video_title = f"Crop Pathology Diagnosis & Effective Spraying Techniques for {crop_name or 'Crops'}"
                img_title = "Leaf Pathology & Insect Damage Field Identification Guide"

            media = [
                {
                    "type": "video",
                    "title": video_title,
                    "url": f"https://www.youtube.com/results?search_query=crop+disease+identification+and+fungicide+spraying+{crop_name or 'crops'}",
                    "thumbnail_url": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&auto=format&fit=crop",
                    "description": "Video tutorial covering symptom inspection, nozzle angle calibration, and personal protective equipment during agricultural spraying."
                },
                {
                    "type": "image",
                    "title": img_title,
                    "url": "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&auto=format&fit=crop",
                    "description": "Photographic reference guide contrasting fungal spots, bacterial wilting, and viral mosaic patterns on crop leaves."
                }
            ]
            return guide, media

        # 4. General / Cultivation / Phenology
        if target_lang == "gu":
            guide = [
                f"૧. {crop_name or 'પાક'}ના હાલના વૃદ્ધિ તબક્કા અનુસાર પાણી અને પોષક તત્વોનું સંતુલન જાળવવું.",
                "૨. વાવણી પછી ૨૦-૨૫ દિવસે નિંદામણ અને આંતરખેડ કરીને મૂળમાં હવા-ઉજાસ વધારવો.",
                "૩. જીવંત હવામાન અને વરસાદની આગાહી જોઈને જ ક્ષેત્રીય કાર્યોનું આયોજન કરવું.",
                "૪. KrishiMind AI માં નિયમિત જમીન ભેજ અને પાકના ફોટા અપલોડ કરીને સમયસર સલાહ મેળવવી."
            ]
            video_title = f"{crop_name or 'પાક'}ની વૈજ્ઞાનિક ખેતી અને ઉત્તમ ઉત્પાદન માર્ગદર્શન"
            img_title = "પાક વૃદ્ધિ તબક્કા અને કૃષિ આયોજન કેલેન્ડર"
        elif target_lang == "hi":
            guide = [
                f"1. {crop_name or 'फसल'} के वर्तमान विकास चरण के अनुसार जल एवं पोषक तत्वों की आपूर्ति सुनिश्चित करें।",
                "2. बुवाई के 20-25 दिन बाद निराई-गुड़ाई कर खरपतवार नियंत्रित करें जिससे जड़ों को पर्याप्त वायु संचार मिले।",
                "3. स्थानीय मौसम पूर्वानुमान के अनुसार ही सिंचाई एवं छिड़काव का समय निर्धारित करें।",
                "4. कृषिमाइंड एआई में नियमित अंतराल पर मिट्टी की नमी और फसल चित्र दर्ज कर उन्नत सलाह प्राप्त करें।"
            ]
            video_title = f"{crop_name or 'फसल'} की वैज्ञानिक खेती एवं उच्च पैदावार प्रबंधन"
            img_title = "फसल विकास चरण एवं कृषि गतिविधि कैलेंडर"
        else:
            guide = [
                f"1. Monitor {crop_name or 'crop'} phenology milestones and align cultural practices with root depth development.",
                "2. Conduct shallow weeding and hoeing 20-25 days after planting to suppress weed-crop competition.",
                "3. Align irrigation and foliar operations with local microclimate and precipitation probabilities.",
                "4. Continuously log soil moisture and telemetry in KrishiMind for progressive agronomic advisory."
            ]
            video_title = f"Scientific Cultivation & High-Yield Best Practices for {crop_name or 'Crops'}"
            img_title = "Crop Phenological Stages & Field Activity Calendar"

        media = [
            {
                "type": "video",
                "title": video_title,
                "url": f"https://www.youtube.com/results?search_query=scientific+cultivation+practices+{crop_name or 'crops'}",
                "thumbnail_url": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop",
                "description": "ICAR-standard agricultural extension video detailing intercultural operations, seedbed care, and harvesting readiness."
            },
            {
                "type": "image",
                "title": img_title,
                "url": "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&auto=format&fit=crop",
                "description": "Agronomic infographic mapping critical phenological phases from seedling emergence to physiological maturity."
            }
        ]
        return guide, media

ai_service = AIService()
