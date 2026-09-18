import base64
import os
import re
import time
from typing import Dict, Any, List, Optional
from ..config.settings import settings
from ..schemas.copilot_schemas import ChatRequest, ChatResponse, MessageItem, FileEvidenceItem
from .context_builder import context_builder

# Import official Google GenAI SDK
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print('Warning: google-genai library not imported. Operating in deterministic mode.')

def detect_text_language(text: str) -> str:
    """Detects primary language script from text if not explicitly provided."""
    if re.search(r'[\u0D00-\u0D7F]', text):
        return 'ml'
    if re.search(r'[\u0B80-\u0BFF]', text):
        return 'ta'
    if re.search(r'[\u0900-\u097F]', text):
        return 'hi'
    if re.search(r'[\u0C80-\u0CFF]', text):
        return 'kn'
    if re.search(r'[\u0C00-\u0C7F]', text):
        return 'te'
    return 'en'

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or 'gemini-2.0-flash'
        self._client = None
        self._init_client()

    def set_api_key(self, new_key: str):
        """Allows dynamic configuration of Gemini API Key."""
        self.api_key = new_key.strip()
        self._init_client()

    def _init_client(self):
        key = self.api_key or os.getenv('GEMINI_API_KEY', '')
        if GENAI_AVAILABLE and key and key.strip() != 'your_gemini_api_key_here':
            try:
                self._client = genai.Client(api_key=key.strip())
                print(f"✅ Google GenAI Client successfully initialized (Model: {self.model_name})")
            except Exception as e:
                print(f'Error initializing Google GenAI Client: {e}')
                self._client = None
        else:
            self._client = None

    def generate_chat_response(self, request: ChatRequest) -> ChatResponse:
        if self._client is None:
            self.api_key = os.getenv('GEMINI_API_KEY', settings.GEMINI_API_KEY)
            self._init_client()

        conv_id = request.conversation_id or f'conv-{int(time.time()*1000)}'
        context_data = context_builder.build_copilot_context(request)

        # Detect language from input if auto
        detected_lang = detect_text_language(request.message)
        effective_lang = request.language if (request.language and request.language != 'auto') else detected_lang

        if self._client is not None:
            try:
                return self._call_gemini_api(request, context_data, conv_id, effective_lang)
            except Exception as e:
                print(f'Gemini API invocation error ({e}), engaging deterministic fallback')
                return self._generate_deterministic_fallback(request, context_data, conv_id, effective_lang, error_reason=str(e))
        else:
            return self._generate_deterministic_fallback(request, context_data, conv_id, effective_lang)

    def _call_gemini_api(self, request: ChatRequest, context_data: Dict[str, Any], conv_id: str, effective_lang: str) -> ChatResponse:
        contents: List[Any] = []
        contents.append(context_data['context_text'])

        if request.history:
            recent_history = request.history[-6:]
            history_text = '\n=== RECENT CONVERSATION HISTORY ==='
            for msg in recent_history:
                sender_label = 'USER' if msg.role == 'user' else 'NIVARA COPILOT'
                history_text += f'\n{sender_label}: {msg.content}'
            contents.append(history_text)

        if request.files_evidence:
            for file_item in request.files_evidence:
                if file_item.is_image and file_item.image_base64:
                    try:
                        raw_bytes = base64.b64decode(file_item.image_base64)
                        mime = file_item.file_type or 'image/jpeg'
                        img_part = types.Part.from_bytes(data=raw_bytes, mime_type=mime)
                        contents.append(img_part)
                        contents.append(f'Visual Evidence Attachment: {file_item.file_name}')
                    except Exception as img_err:
                        print(f'Failed to attach image part for {file_item.file_name}: {img_err}')

        contents.append(f'\nUSER QUERY ({effective_lang.upper()}): {request.message}')

        config = types.GenerateContentConfig(
            system_instruction=context_data['system_instruction'],
            temperature=0.35,
            max_output_tokens=1200
        )

        candidate_models = [self.model_name, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash']
        unique_models = []
        for m in candidate_models:
            if m not in unique_models:
                unique_models.append(m)

        model_to_use = self.model_name
        response = None
        for candidate_model in unique_models:
            try:
                response = self._client.models.generate_content(
                    model=candidate_model,
                    contents=contents,
                    config=config
                )
                model_to_use = candidate_model
                break
            except Exception as m_err:
                print(f'Model {candidate_model} failed: {m_err}')
                continue

        if response is None or not response.text:
            raise RuntimeError('Received empty response from Gemini API.')

        return ChatResponse(
            message=response.text.strip(),
            conversation_id=conv_id,
            language=effective_lang,
            safety_status=context_data['safety_status'],
            metrics=context_data['metric_pills'],
            citations=context_data['citations'],
            action_button=context_data['action_button'],
            route_info=context_data['route_blueprint'],
            is_fallback=False,
            model_used=model_to_use
        )

    def _generate_deterministic_fallback(
        self,
        request: ChatRequest,
        context_data: Dict[str, Any],
        conv_id: str,
        effective_lang: str,
        error_reason: Optional[str] = None
    ) -> ChatResponse:
        q = request.message.lower().strip()
        loc = context_data['location_name']
        village_short = loc.split(' ')[0]
        status = context_data['safety_status']
        lang = effective_lang.lower()

        # 1. Casual Greetings & Small Talk
        if 'how are you' in q:
            text = "I'm doing great! 😊 Ready to help with NIVARA. What are we checking today?"
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if any(w in q for w in ['thank you', 'thanks', 'thx', 'dhanyavad', 'nandri', 'nandi']):
            text = "You're welcome! 😊 Let me know if you need anything else."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if q in ['ok', 'okay', 'sure', 'alright', 'got it', 'fine', 'cool']:
            text = '👍 Sure! Let me know whenever you need help.'
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if 'interesting' in q:
            text = "One interesting part of NIVARA is that it doesn't only identify risky areas. It also looks at how many people are affected and whether there is enough relocation capacity (CCAS), which helps turn risk information into an actual disaster-management decision."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        greeting_words = ['hi', 'hello', 'hey', 'hii', 'heyy', 'halo', 'greetings', 'vanakkam', 'namaskaram', 'namaste', 'namaskara', 'namaskaramu', 'hlo']
        if q in greeting_words or any(q.startswith(kw + ' ') for kw in greeting_words):
            if lang in ['ml', 'malayalam']:
                text = 'ഹലോ! 👋 ഞാൻ നിവാര (NIVARA) കോപൈലറ്റാണ്.\n\nവയനാട്ടിലെ ദുരന്ത സാധ്യതകൾ, മഴ വിവരങ്ങൾ, ഉരുൾപൊട്ടൽ സാധ്യത, പുനരധിവാസം എന്നിവയെക്കുറിച്ച് എന്നോട് ചോദിക്കാം. എന്താണ് അറിയേണ്ടത്?'
            elif lang in ['ta', 'tamil']:
                text = 'வணக்கம்! 👋 நான் நிவாரா (NIVARA) கோபைலட்.\n\nவயநாடு பேரிடர் அபாயங்கள், மழை நிலவரம், நிலச்சரிவு எச்சரிக்கை மற்றும் பாதுகாப்பான இடங்கள் குறித்து என்னிடம் கேட்கலாம். நான் எவ்வாறு உதவட்டும்?'
            elif lang in ['hi', 'hindi']:
                text = 'नमस्ते! 👋 मैं निवारा (NIVARA) कोपायलट हूँ।\n\nवायनाड में आपदा जोखिम, वर्षा, भूस्खलन चेतावनी और सुरक्षित पुनर्वास स्थलों के बारे में आप मुझसे पूछ सकते हैं। आप क्या जानना चाहते हैं?'
            elif lang in ['kn', 'kannada']:
                text = 'ನಮಸ್ಕಾರ! 👋 ನಾನು ನಿವಾರಾ (NIVARA) ಕೋಪೈಲಟ್.\n\nವಯನಾಡಿನ ವಿಪತ್ತು ಅಪಾಯಗಳು, ಮಳೆ ವಿವರ, ಭೂಕುಸಿತ ಎಚ್ಚರಿಕೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಸ್ಥಳಾಂತರ ತಾಣಗಳ ಬಗ್ಗೆ ನೀವು ನನ್ನನ್ನು ಕೇಳಬಹುದು.'
            elif lang in ['te', 'telugu']:
                text = 'నమస్కారం! 👋 నేను నివార (NIVARA) కోపైలట్.\n\nవయనాడ్ విపత్తు ప్రమాదాలు, వర్షపాతం వివరాలు, కొండచరియలు విరిగిపడే హెచ్చరికలు మరియు పునరావాస ప్రాంతాల గురించి మీరు నన్ను అడగవచ్చు.'
            elif lang in ['es', 'spanish']:
                text = '¡Hola! 👋 Soy NIVARA Copilot. Puedo ayudarte a comprender los riesgos de desastres, lluvias y reubicación segura en Wayanad. ¿En qué puedo ayudarte hoy?'
            elif lang in ['fr', 'french']:
                text = 'Bonjour! 👋 Je suis le copilote NIVARA. Je peux vous aider à comprendre les risques de catastrophe, la pluie et la réinstallation à Wayanad. Comment puis-je vous aider?'
            else:
                text = "Hey! 👋 I'm NIVARA Copilot.\n\nI can help you understand disaster risk areas, rainfall, landslides, floods, relocation, and even analyze uploaded photos or field reports. What would you like to know?"

            return ChatResponse(
                message=text,
                conversation_id=conv_id,
                language=lang,
                metrics=[],
                is_fallback=True,
                model_used='NIVARA-Conversational-Fallback'
            )

        # 1.4 Flood Intelligence (Dibrugarh District, Assam, India)
        is_flood_query = (
            request.active_view == 'flood-intelligence' or
            any(w in q for w in [
                'dibrugarh', 'assam', 'brahmaputra', 'chabua', 'moran', 'naharkatia',
                'tengakhat', 'tingkhong', 'multi chapari', 'kopili', 'fsi', 'flood hazard',
                'inundation', 'asdma'
            ])
        )

        if is_flood_query:
            # 1. Highest risk / worst circle
            if any(w in q for w in ['highest', 'worst', 'which circle', 'which village', 'most vulnerable', 'hotspot', 'critical']):
                text = (
                    "Based on the Assam Disaster Management Authority (ASDMA 2022) records and ISRO Bhuvan multi-temporal satellite analysis, **Chabua Revenue Circle** and **Dibrugarh West** have the highest flood risk in Dibrugarh:\n\n"
                    "• **Chabua Circle:** 320,132 persons affected, 6,197 ha crop submerged, Flood Hazard Score 88.5/100, Risk Class **CRITICAL** (84.6/100, RPI Priority: P1 - IMMEDIATE).\n"
                    "• **Dibrugarh West Circle:** 37,064 persons affected, 11,185 ha crop loss along the Brahmaputra active bank cut, Risk Class **CRITICAL** (81.3/100).\n"
                    "• **Most Critical Village:** **Multi Chapari** (river sandbar island with 420 households / 1,850 persons, RPI 91.2), followed by **Dikom Naharani** (510 households, RPI 89.6).\n\n"
                    "Immediate relocation to vetted inland safe campuses (Barbaruah Higher Secondary Campus & Panitola Hub) is recommended."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    route_info=context_data['route_blueprint'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 2. Methodology / MCA / AHP / Formula
            if any(w in q for w in ['methodology', 'formula', 'mca', 'ahp', 'calculate', 'fsi', 'weights', 'how is']):
                text = (
                    "NIVARA's Flood Intelligence model is grounded in the **Kopili River Basin, Assam Multi-Criteria Analysis (MCA)** scientific framework:\n\n"
                    "1. **Flood Hazard (FSI):** $FSI = \\sum_{i=1}^{8} (W_i \\times R_i)$ across 8 standardized thematic layers:\n"
                    "   • **Rainfall Depth:** 0.20 (20%)\n"
                    "   • **Distance from River:** 0.15 (15%)\n"
                    "   • **Elevation (DEM):** 0.15 (15%)\n"
                    "   • **Slope Gradient:** 0.15 (15%)\n"
                    "   • **Drainage Density & TWI:** 0.20 (20%)\n"
                    "   • **LULC / Cropland:** 0.10 (10%)\n"
                    "   • **Soil Infiltration:** 0.05 (5%)\n"
                    "   *AHP Consistency: $\\lambda_{max} = 8.32, CI = 0.046, RI = 1.41, CR = 0.033 < 0.10$ (Mathematically Validated ✅)*\n\n"
                    "2. **Total Vulnerability:** $V = 0.40 \\times \\text{Social} + 0.30 \\times \\text{Infrastructure} + 0.30 \\times \\text{Land-Use}$\n\n"
                    "3. **Overall Flood Risk:** $\\text{Flood Risk} = \\text{Flood Hazard} \\times \\text{Total Vulnerability}$\n\n"
                    "4. **Accuracy Assessment:** ROC-AUC of **0.87** (Precision 84.6%, Recall 88.2%) validated against Sentinel-1 SAR observations."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 3. Relocation / Safe sites / CCAS
            if any(w in q for w in ['relocat', 'where can', 'safe site', 'safe land', 'destination', 'accommodate', 'ccas', 'capacity']):
                text = (
                    "NIVARA's Cognitive Relocation Engine has evaluated candidate inland safe sites in Dibrugarh against humanitarian Sphere standards:\n\n"
                    "1. **Barbaruah Higher Secondary & Sports Campus (CCAS: 92.4 / 100):**\n"
                    "   • **Allocated For:** Multi Chapari & Matak Kaibartagaon (3,470 persons)\n"
                    "   • **Distance:** 6.8 km via NH-37 protected arterial (~16 mins convoy)\n"
                    "   • **Capacity:** 3,800 persons (3,350 available) | 285,000 L/day potable water | 190 latrines.\n\n"
                    "2. **Panitola Central Resettlement Hub (CCAS: 89.8 / 100):**\n"
                    "   • **Allocated For:** Dikom Naharani & Lengrai (3,850 persons)\n"
                    "   • **Distance:** 7.4 km along elevated ridge corridor (~18 mins convoy)\n"
                    "   • **Capacity:** 4,200 persons (3,600 available) | 315,000 L/day water.\n\n"
                    "3. **Dibrugarh University Eastern Ridgeline Reserve (CCAS: 94.6 / 100):**\n"
                    "   • Safe Holding Capacity: 5,000 persons (4,150 available) outside inundation buffers.\n\n"
                    "Total safe holding capacity across the 6 vetted inland hubs is **18,500 persons**."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    route_info=context_data['route_blueprint'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 4. IIT Delhi India Flood Inventory (IFI) historical query
            if any(w in q for w in ['ifi', 'inventory', 'history', 'historical', 'past flood', '1974', '2004', 'fatality', 'fatalities', 'how many events', 'saharia', 'hydrosense']):
                text = (
                    "🏛️ **IIT Delhi India Flood Inventory (IFI v3.0) — Historical Grounding:**\n\n"
                    "Published by **HydroSense Lab, IIT Delhi & IMD** in Springer Nature (*Saharia et al., 2021*):\n"
                    "• **Total Recorded Events in Dibrugarh:** **155 verified historical flood events** (1971–2023)\n"
                    "• **Statewide Assam Context:** 916 events across Assam (6,876 events nationwide)\n"
                    "• **Percent Flooded Area:** **11.91%** of district area inundated (Permanent water: 4.81%)\n"
                    "• **Mean Inundation Duration:** **10.0 continuous days** per event\n"
                    "• **Cumulative Fatalities:** **147 lives lost** (47 injured) recorded across the official registry\n\n"
                    "**Historic Milestones:**\n"
                    "1. **1974 Cloudburst & River Swell:** 93 continuous days inundation (longest on record)\n"
                    "2. **1990 Dyke Collapse:** 54 days inundation, 118 lives lost in Chabua and Dibrugarh West\n"
                    "3. **2004 Brahmaputra Mega-Flood:** 48 days, 248 fatalities, >80% cropland submerged\n"
                    "4. **2002 & 2003 Tributary Breaches:** 50 & 44 days, over 30 ring embankment failures"
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    route_info=context_data['route_blueprint'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 5. Assam Flood Ecosystem (SDRF Financing & DRIMS Loss) query
            if any(w in q for w in ['sdrf', 'tender', 'procurement', 'drims', 'financing', 'expenditure', 'livestock', 'animal', 'cattle', 'crop loss', 'loss and damage']):
                text = (
                    "💰 **Assam Flood Data Ecosystem — Public Financing & Loss Grounding (DRIMS / SDRF):**\n\n"
                    "From ASDMA & CivicDataLab repository (448 monthly records across Dibrugarh's 7 circles):\n"
                    "• **Total Public Procurement Tenders:** **₹211.34 Crore** (₹2.11 Billion) awarded for flood mitigation\n"
                    "• **SDRF Sanctions Total:** **₹109.67 Crore** (State Disaster Response Fund allocation)\n"
                    "• **Total Livestock Affected:** **493,413 animals** (big cattle, small ruminants & poultry)\n"
                    "• **Submerged Crop Area:** **19,204.5 hectares** of agricultural land\n\n"
                    "**Circle-Level Procurement Highlights:**\n"
                    "• **Chabua:** ₹66.28 Cr Tenders | ₹15.67 Cr SDRF | ₹79.02 Cr Immediate Works | 260,841 livestock affected\n"
                    "• **Dibrugarh East:** ₹51.29 Cr Tenders | ₹51.29 Cr Immediate Measures | 6,510 livestock\n"
                    "• **Dibrugarh West:** ₹16.65 Cr Tenders | 7,763.6 ha crop damage (highest agricultural loss) | 76,872 livestock\n"
                    "• **Tingkhong:** ₹51.64 Cr Tenders | ₹72.03 Cr Repair & Restoration tenders\n"
                    "• **Tengakhat:** ₹19.21 Cr Tenders | 35,077 population affected"
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    route_info=context_data['route_blueprint'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 6. Default Dibrugarh Flood response
            text = (
                "🌊 **Dibrugarh Flood Intelligence Summary (Assam, India):**\n\n"
                "• **Monitored Study Area:** Dibrugarh District (~3,381 sq. km, 7 Revenue Circles)\n"
                "• **Total Population Affected:** 412,571 persons (Peak displacement: 188,381)\n"
                "• **Critical Red Zones:** Chabua (320,132 affected) & Dibrugarh West (11,185 ha crop loss)\n"
                "• **Mean Flood Susceptibility Index (FSI):** 68.4 / 100 (AHP CR = 0.033 < 0.10)\n"
                "• **Validation Accuracy:** ROC-AUC = 0.87 (Sentinel-1 SAR Ground Truth)\n"
                "• **Historical Record (IIT Delhi IFI):** 155 events (1971–2023), 11.91% flooded area, 147 fatalities\n"
                "• **Public Disaster Financing (SDRF):** ₹211.34 Cr tenders awarded, 493,413 livestock impacted\n"
                "• **Safe Available Capacity:** 18,500 persons across 6 vetted inland hubs\n\n"
                "Ask about specific revenue circles, historical floods (1974, 2004), SDRF financing, vulnerable habitations (Multi Chapari), or click below to view relocation plans."
            )
            return ChatResponse(
                message=text,
                conversation_id=conv_id,
                language=lang,
                metrics=context_data['metric_pills'],
                action_button=context_data['action_button'],
                route_info=context_data['route_blueprint'],
                is_fallback=True,
                model_used='NIVARA-Conversational-Fallback'
            )

        # 1.5 Coastal Erosion Intelligence (Brahmapur Coast, Ganjam, Odisha)
        is_coastal_query = (
            request.active_view == 'coastal-erosion' or
            any(w in q for w in [
                'coast', 'coastal', 'erosion', 'shoreline', 'brahmapur', 'ganjam', 
                'gopalpur', 'podampeta', 'boxipalli', 'arjipalli', 'aryapalli', 'haripur',
                'phailin', 'titli', 'cvi', 'pvi', 'svi', 'dsas', 'mndwi', 'bsi', 'transect'
            ])
        )

        if is_coastal_query:
            # 1. Highest risk village / hotspot
            if any(w in q for w in ['highest', 'worst', 'which village', 'most vulnerable', 'hotspot', 'critical village']):
                text = (
                    "Based on the 12-year DSAS multi-temporal remote sensing analysis (2013–2024), **Podampeta Estuarine Spit (Ganjam Block)** has the highest coastal erosion risk along the Brahmapur coastline:\n\n"
                    "• **Erosion Rate:** -6.85 m/year (localized transect scarp retreats reach -42.91 m/yr)\n"
                    "• **CVI Score:** 82.4 / 100 (Critical Risk)\n"
                    "• **RPI Priority:** 88.5 / 100 (Category: CRITICAL — Immediate Relocation Required)\n"
                    "• **Exposed Population:** 180 families (820 persons) living within 50m of the active tidal scarp\n"
                    "• **Recommended Relocation Site:** Humma Elevated Ridge Colony (4.8 km inland via NH-516 corridor, CCAS 86.4 / 100)\n\n"
                    "**Boxipalli** is the second most critical hotspot (-6.02 m/yr, 195 families, RPI 82.3), assigned to Gopalpur Hilltop Campus Buffer (3.2 km)."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    route_info=context_data['route_blueprint'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 2. Why classified as very high / factors / CVI
            if any(w in q for w in ['why', 'classified', 'factors', 'causes', 'cvi', 'pvi', 'svi', 'very high']):
                text = (
                    "The Brahmapur Coast (specifically sectors like Podampeta and Boxipalli) is classified as **High/Critical Risk (CVI = 68.4 / 100)** due to a confluence of physical and socio-economic drivers:\n\n"
                    "1. **Physical Vulnerability Index (PVI = 71.4 / 100):**\n"
                    "   • **Shoreline Change Rate:** Up to -7.87 m/yr localized retreat (AHP Weight: 0.28)\n"
                    "   • **Coastal Slope:** Extremely flat 1.8° average slope allowing deep storm wave inundation (Weight: 0.19)\n"
                    "   • **Coastal Geomorphology:** Sandy barrier spits and unconsolidated dunes prone to tidal breaches (Weight: 0.16)\n"
                    "   • **Mean Wave Height:** 1.76 m high-energy wave regime (Weight: 0.14)\n"
                    "   • **Elevation:** 0–8 m low barrier topography vulnerable to storm surge (Weight: 0.11)\n"
                    "   • **Sea-Level Rise:** +3.1 mm/yr regional trend in the Bay of Bengal (Weight: 0.07)\n\n"
                    "2. **Socio-Economic Vulnerability Index (SVI = 65.4 / 100):**\n"
                    "   • High population density (480 persons/km²) directly in the tidal run-up zone\n"
                    "   • Significant loss of natural intertidal buffer zone (-19.9% over 12 years)\n"
                    "   • Disruption of coastal artisanal fishing livelihoods and roads\n\n"
                    "AHP consistency check confirms a Consistency Ratio (CR) of **0.042 < 0.10**, mathematically validating the index weighting."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 3. Shoreline change rate / LRR / EPR / statistics
            if any(w in q for w in ['rate', 'shoreline change', 'lrr', 'epr', 'nsm', 'meters', 'statistics', 'change rate']):
                text = (
                    "Key Shoreline Change Statistics across 119 DSAS transects along the Brahmapur Coastline (2013–2024):\n\n"
                    "• **Mean Linear Regression Rate (LRR):** -0.222 m/year (43.7% of monitored coast is eroding)\n"
                    "• **Mean End Point Rate (EPR):** -0.082 m/year\n"
                    "• **Net Shoreline Movement (NSM):** -0.90 m average cumulative shift\n"
                    "• **Maximum Localized Erosion:** -7.867 m/year (unmitigated scarp retreats reach -42.91 m/yr)\n"
                    "• **Maximum Accretion:** +7.832 m/year (sediment deposition south of Gopalpur Port)\n"
                    "• **Worst Erosion Period:** 2022→2023 with -7.624 m net annual shoreline retreat\n"
                    "• **Peak Accretion Period:** 2017→2018 with +6.126 m expansion."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 4. Relocation site / safe land / accommodate families
            if any(w in q for w in ['relocat', 'where can', 'safe site', 'accommodate', 'destination', 'safe land', 'families', 'evacuat']):
                text = (
                    "NIVARA's Coastal Relocation Decision Engine has evaluated inland safe zones for Brahmapur's vulnerable coastal habitations:\n\n"
                    "1. **Humma Elevated Ridge Resettlement Colony (CCAS: 86.4 / 100):**\n"
                    "   • **Allocated For:** Podampeta Estuarine Spit (180 families / 820 persons)\n"
                    "   • **Distance & Transit:** 4.8 km via NH-516 / Humma Spur (~12 mins transit)\n"
                    "   • **Site Safety:** Elevation 22m above MSL (outside storm surge inundation)\n"
                    "   • **Sphere Standards:** 42 m²/person land buffer, 85 L/person/day potable water capacity.\n\n"
                    "2. **Gopalpur Hilltop Campus Buffer (CCAS: 88.2 / 100):**\n"
                    "   • **Allocated For:** Boxipalli Coastal Hamlet (195 families / 950 persons)\n"
                    "   • **Distance & Transit:** 3.2 km via Gopalpur-Rangeilunda Road (~8 mins transit)\n"
                    "   • **Site Safety:** Elevated lateritic ridge (elevation 18m MSL) with civic utilities."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    route_info=context_data['route_blueprint'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 5. Historical cyclones / Phailin and Titli
            if any(w in q for w in ['cyclone', 'phailin', 'titli', 'storm', 'surge', 'validation', 'historical']):
                text = (
                    "The 12-year remote sensing dataset directly validates the catastrophic coastal impacts of two major Bay of Bengal cyclones:\n\n"
                    "• **Cyclone Phailin (October 12, 2013):**\n"
                    "  - Made landfall directly at Gopalpur Coast as a Category 5-equivalent storm with 260 km/h winds and a 3.5 m storm surge.\n"
                    "  - Caused an immediate -6.36 m shoreline retreat in 2013–2014, breaching sand spits and severely degrading dune crests at Podampeta and Boxipalli.\n\n"
                    "• **Cyclone Titli (October 11, 2018):**\n"
                    "  - Made landfall near Palasa (southwest of Gopalpur) with 150 km/h winds and extreme 430 mm/24h rainfall.\n"
                    "  - Induced severe riverine backwater flooding along the Rushikulya estuary, carving secondary tidal breach channels through barrier bars."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 6. Default coastal response
            text = (
                "🌊 **Brahmapur Coast Coastal Erosion Analysis (2013–2024 Reference Study):**\n\n"
                "• **Monitored Coastline:** 37.0 km (~25.5 km DSAS stretch across 119 transects)\n"
                "• **Mean Shoreline Change Rate:** -0.222 m/year (43.7% eroding, max -7.867 m/year)\n"
                "• **Vulnerability Indices:** CVI 68.4 / 100 (High Risk) | PVI 71.4 / 100 | SVI 65.4 / 100\n"
                "• **AHP Validation:** Consistency Ratio CR = 0.042 (< 0.10, Consistent)\n"
                "• **Most Critical Hotspot:** Podampeta (-6.85 m/yr erosion, 180 families, RPI 88.5)\n"
                "• **Assigned Relocation:** Humma Elevated Ridge Colony (CCAS 86.4 / 100, 4.8 km inland)\n\n"
                "You can ask about specific hotspot villages, cyclone impacts (Phailin & Titli), shoreline statistics, or click below to view relocation plans."
            )
            return ChatResponse(
                message=text,
                conversation_id=conv_id,
                language=lang,
                metrics=context_data['metric_pills'],
                action_button=context_data['action_button'],
                route_info=context_data['route_blueprint'],
                is_fallback=True,
                model_used='NIVARA-Conversational-Fallback'
            )

        # 1.6 Uttarakhand Cloudburst Intelligence & Day-Ahead Risk Prediction
        is_cloudburst_query = (
            request.active_view == 'cloudburst-intelligence' or
            any(w in q for w in [
                'cloudburst', 'uttarakhand', 'kedarnath', 'badrinath', 'mandakini',
                'malpa', 'joshimath', 'mussoorie', 'chamoli', 'rudraprayag',
                'pithoragarh', 'uttarkashi', 'tehri', 'dehradun', 'nainital',
                'dharali', 'ghansali', 'rh2m', 'prectot', 'staging hub', 'guptkashi'
            ])
        )

        if is_cloudburst_query:
            # 1. Kedarnath or Famous Disaster Backtest query
            if any(w in q for w in ['kedarnath', 'backtest', 'disaster', '2013', 'malpa', 'mandakini', 'catch', '1998']):
                text = (
                    "⛈️ **Uttarakhand Cloudburst Intelligence — Historical Disaster Backtest Validation:**\n\n"
                    "NIVARA evaluated the day-ahead Random Forest model across 12 prominent Himalayan cloudburst disasters:\n\n"
                    "• **Kedarnath Disaster (16 Jun 2013):**\n"
                    "  - **Predicted Day-Ahead Probability:** **85.8% (CRITICAL CATCH)**\n"
                    "  - **Telemetry Ground Truth:** 116.3 mm precipitation, 85% relative humidity, 12.1°C temperature\n"
                    "  - **Outcome:** Model successfully triggered a day-ahead red warning prior to the catastrophic Chorabari lake outburst and Mandakini valley torrent.\n\n"
                    "• **Malpa Rockfall & Cloudburst (18 Aug 1998):**\n"
                    "  - **Predicted Probability:** **87.2% (CRITICAL CATCH)**\n"
                    "  - **Rainfall:** **377.8 mm** (highest 24h deluge recorded in the 36-year dataset)\n\n"
                    "• **Joshimath Chamoli Disaster (7 Feb 2021 — Non-Cloudburst Test):**\n"
                    "  - **Predicted Probability:** **15.1% (LOW RISK - Correct Negative Reject)**\n"
                    "  - **Telemetry:** Only 4.8 mm rain, 42% RH\n"
                    "  - **Scientific Significance:** Correctly rejected non-cloudburst periglacial rock-ice failure from convective cloudbursts (**Zero False Positive ✅**)."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    route_info=context_data['route_blueprint'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 2. Machine Learning & Predictive Features
            if any(w in q for w in ['feature', 'ml', 'random forest', 'model', 'importance', 'accuracy', 'rh2m', 'threshold', 'predict']):
                text = (
                    "🤖 **Cloudburst Machine Learning Architecture & Feature Importance:**\n\n"
                    "Trained on **36 years of daily NASA POWER meteorological records (1988–2024)** across 20 Himalayan hotspots with zero lookahead leakage:\n\n"
                    "• **Model:** Tuned Random Forest Day-Ahead Classifier\n"
                    "• **Classification Threshold:** **0.50** | **ROC-AUC:** **0.88** | **Precision:** 84.2% | **Recall:** 86.5%\n\n"
                    "**Top Predictive Meteorological Features:**\n"
                    "1. **RH2M (Relative Humidity at 2m):** **8.87%** — Atmospheric column saturation trigger\n"
                    "2. **PRECTOT_3d_mean (3-Day Antecedent Rain):** **7.92%** — Orogenic catchment pre-saturation\n"
                    "3. **WS2M_lag1 (Lagged 2m Wind Speed):** **7.49%** — Valley convective shear & moisture advection\n"
                    "4. **T2M (2m Air Temperature):** **6.92%** — Thermal buoyancy driving rapid updrafts\n"
                    "5. **T2M_RANGE (Diurnal Temp Range):** **6.87%** — Cloud-deck insolation dampening\n"
                    "6. **PRECTOT_lag1 (Day-1 Antecedent Rain):** **6.81%** — Immediate convective precursor\n"
                    "7. **PRECTOT_7d_sum (7-Day Cumulative Rain):** **6.77%** — Deep soil pore-pressure trigger."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    route_info=context_data['route_blueprint'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 3. Safe Staging Hubs & Evacuation Blueprint
            if any(w in q for w in ['evacuat', 'staging', 'safe hub', 'shelter', 'route', 'where can', 'guptkashi', 'capacity']):
                text = (
                    "🏔️ **Uttarakhand Safe High-Ground Staging Hubs (Sphere Humanitarian Standard):**\n\n"
                    "NIVARA identified 6 vetted non-inundation ridge hubs situated outside torrent runout zones:\n\n"
                    "1. **Guptkashi Resilient Helipad & Stadium Hub (Rudraprayag, 1,319m):**\n"
                    "   • **Capacity:** 4,500 persons (3,800 available) | **CCAS Score:** 93.2 / 100\n"
                    "   • **Target Influx:** Kedarnath & Mandakini Valley evacuees via NH-107 (38 km, 45 min convoy)\n"
                    "   • **Sphere Utilities:** 360,000 L/day potable water, dual medical airlift pads\n\n"
                    "2. **Joshimath Safe Cantonment Plateau (Chamoli, 1,890m):**\n"
                    "   • **Capacity:** 5,200 persons (4,400 available) | **CCAS Score:** 91.8 / 100\n"
                    "   • **Target Influx:** Badrinath, Mana, and Tapovan pilgrims\n\n"
                    "3. **Pithoragarh Naini-Saini Logistics Hub (Pithoragarh, 1,550m):**\n"
                    "   • **Capacity:** 6,000 persons | **CCAS Score:** 94.5 / 100 | Runway evacuation support\n\n"
                    "**Total Safe Capacity:** **35,500 persons** across 6 high-ground staging hubs."
                )
                return ChatResponse(
                    message=text,
                    conversation_id=conv_id,
                    language=lang,
                    metrics=context_data['metric_pills'],
                    action_button=context_data['action_button'],
                    route_info=context_data['route_blueprint'],
                    is_fallback=True,
                    model_used='NIVARA-Conversational-Fallback'
                )

            # 4. Default Uttarakhand Cloudburst response
            text = (
                "⛈️ **Uttarakhand Cloudburst Intelligence & Risk Assessment:**\n\n"
                "• **Monitored Scope:** 20 Critical Himalayan Hotspots across all 13 Uttarakhand Districts (Elevations 640m – 3,583m)\n"
                "• **Data Grounding:** 36 Years of NASA POWER Daily Meteorological Data (1988–2024, 167 recorded cloudburst events)\n"
                "• **ML Model:** Day-Ahead Random Forest Classifier (ROC-AUC 0.88, Tuned Threshold 0.50)\n"
                "• **Critical Hotspots:** Kedarnath (RPI 94.2), Malpa (RPI 93.8, max 377.8 mm), Mandakini Valley (RPI 91.5)\n"
                "• **Disaster Backtests:** 12 verified events including Kedarnath 2013 (85.8% Catch) & Joshimath 2021 (15.1% Reject)\n"
                "• **Safe High-Ground Staging:** 35,500 persons total capacity across 6 vetted non-inundation ridge hubs (Guptkashi, Joshimath, Pithoragarh, Dehradun, Pauri, Uttarkashi)\n"
                "• **Operational Status:** `● HISTORICAL / MODEL ANALYSIS`\n\n"
                "Ask about the Kedarnath backtest, top meteorological features, safe evacuation routes, or explore the interactive GIS command map."
            )
            return ChatResponse(
                message=text,
                conversation_id=conv_id,
                language=lang,
                metrics=context_data['metric_pills'],
                action_button=context_data['action_button'],
                route_info=context_data['route_blueprint'],
                is_fallback=True,
                model_used='NIVARA-Conversational-Fallback'
            )

        # 2. Concept Explanations (HRI, Bayesian, FoS, XGBoost, CCAS)
        if any(w in q for w in ['what is hri', 'explain hri', 'hri simply', 'hri']):
            if lang == 'ml':
                text = "HRI എന്നത് നിവാരയുടെ പ്രധാന അപകട സൂചികയാണ് (0 മുതൽ 100 വരെ risk score). മഴയുടെ അളവ്, മലഞ്ചെരുവിന്റെ ചരിവ്, മണ്ണിലെ ഈർപ്പം എന്നിവയെല്ലാം ഒരുമിച്ച് ചേർത്ത് ഒരു പ്രദേശത്തിന്റെ അപകടസാധ്യത എളുപ്പത്തിൽ മനസ്സിലാക്കാൻ HRI സഹായിക്കുന്നു."
            elif lang == 'ta':
                text = "HRI (Hazard Risk Index) என்பது நிவாராவின் ஒட்டுமொத்த அபாயக் குறியீடு (0 முதல் 100 risk score). மழையளவு, நிலச்சரிவு கோணம் மற்றும் மண்ணின் ஈரப்பதத்தை ஒருங்கிணைத்து ஆபத்தை கணக்கிடுகிறது."
            elif lang == 'hi':
                text = "HRI (Hazard Risk Index) निवारा का समग्र risk score है (0 से 100)। यह वर्षा, ढलान और मिट्टी की नमी को मिलाकर क्षेत्र के खतरे को दर्शाता है।"
            else:
                text = "HRI is simply NIVARA's overall risk score (from 0 to 100). It combines important hazard factors—like rainfall, slope angle, and soil moisture—into one single number so we can quickly understand how risky an area is."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=context_data['metric_pills'][:2], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if any(w in q for w in ['what is bayesian', 'bayesian probability', 'explain bayesian']):
            if lang == 'ml':
                text = "ബയേസിയൻ പ്രോബബിലിറ്റി (Bayesian probability): പഴയ ചരിത്രപരമായ വിവരങ്ങളും തത്സമയ മഴയും മണ്ണിലെ ഈർപ്പവും ഒന്നിച്ച് വിശകലനം ചെയ്ത് ഉരുൾപൊട്ടൽ സാധ്യത 95% കൃത്യതയോടെ കണക്കാക്കാൻ ഇത് സഹായിക്കുന്നു."
            elif lang == 'ta':
                text = "பேய்சியன் நிகழ்தகவு (Bayesian probability): முந்தைய பேரிடர் வரலாற்றுத் தகவல்களுடன் நேரடி மழையளவை இணைத்து நிலச்சரிவு ஏற்படும் வாய்ப்பை 95% துல்லியத்துடன் கணிக்கிறது."
            elif lang == 'hi':
                text = "बायेसियन प्रायिकता (Bayesian probability): यह ऐतिहासिक आपदा रिकॉर्ड और वास्तविक समय की बारिश के आंकड़ों को मिलाकर 95% विश्वसनीयता के साथ भूस्खलन की संभावना का अनुमान लगाता है।"
            else:
                text = "Bayesian probability is a way of estimating how likely something is when we have different pieces of evidence.\n\nIn NIVARA, we combine historical disaster rates with live evidence—like recent rainfall and soil wetness—to calculate the updated chance of a landslide with a 95% confidence interval."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=context_data['metric_pills'][:2], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if any(w in q for w in ['what is fos', 'factor of safety', 'explain fos']):
            text = "FoS means **Factor of Safety**.\n\nIt tells us whether a hillside slope is physically stable against sliding:\n• **Above 1.0:** Generally stable\n• **Below 1.0:** Potentially unstable and prone to sliding under heavy saturation."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=context_data['metric_pills'][:2], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if any(w in q for w in ['what is xgboost', 'explain xgboost', 'why xgboost']):
            text = "XGBoost is a machine-learning algorithm. In NIVARA, it learns patterns from past hazard data (like slope, rainfall, and drainage distance) and uses those patterns to predict whether an area is at high risk with 94.10% accuracy."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=context_data['metric_pills'][:2], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if any(w in q for w in ['what is ccas', 'explain ccas', 'carrying capacity']):
            text = "CCAS (Carrying Capacity Assessment Score) evaluates candidate safe sites against humanitarian Sphere standards. It checks whether a site has enough land (3.5 m2/person), clean water (70 L/person/day), toilets (1 per 20 people), and healthcare before assigning displaced families there."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=context_data['metric_pills'][:2], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        # 3. Project Questions & Viva / Presentation
        if 'what is nivara' in q or 'explain this project' in q or 'explain nivara' in q:
            text = "NIVARA is a disaster-management decision-support system designed for Wayanad, Kerala. It identifies high-risk areas using machine learning and physics models, and automatically matches affected families with safe, resource-equipped relocation sites."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if 'why leaflet' in q or 'why map' in q:
            text = "We use Leaflet to display lightweight, interactive GIS vector maps that render cadastral land parcels, hazard zones, and safe sites smoothly in the browser."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if 'why open-meteo' in q:
            text = "Open-Meteo provides free, high-resolution weather telemetry and soil moisture observations for our Chembra Peak monitoring station without restrictive API key limits."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if 'why pandas' in q:
            text = "Pandas helps us efficiently clean, filter, and analyze tabular datasets—like census population counts, IMD rainfall logs, and land registries—using DataFrames."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if 'why numpy' in q:
            text = "NumPy enables fast, vectorised mathematical calculations for our Mohr-Coulomb geotechnical equations and Bayesian matrix updates."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if 'viva' in q:
            text = (
                "Key Viva Questions & Answers for NIVARA:\n\n"
                "Q1: What makes NIVARA different from standard hazard maps?\n"
                "A: NIVARA combines hazard prediction (HRI & XGBoost) with a carrying-capacity solver (CCAS) to allocate displaced families to vetted safe lands.\n\n"
                "Q2: Why use both Bayesian inference and XGBoost?\n"
                "A: XGBoost identifies non-linear feature patterns from empirical data, while Bayesian inference handles epistemic uncertainty and provides 95% Credible Intervals.\n\n"
                "Q3: How does the system calculate Factor of Safety (FoS)?\n"
                "A: Using the infinite slope Mohr-Coulomb equation incorporating soil cohesion (12.5 kPa), friction angle (28 deg), slope gradient, and pore water pressure."
            )
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        # 4. Emergency Helplines
        if any(w in q for w in ['help', 'helpline', 'phone', 'number', 'call', 'contact', 'ndrf']):
            text = (
                "24x7 Disaster Emergency Helplines (Wayanad / Kerala):\n\n"
                "• Wayanad District Control Room: 1077 / 04936-204151\n"
                "• State Emergency Operations (SEOC): 1070 (Toll Free)\n"
                "• Police Assistance: 112 / 100\n"
                "• Ambulance: 108\n"
                "• Fire & Rescue: 101\n"
                "• NDRF Rescue HQ: 0471-2331639"
            )
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=[], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        # 5. Location-Specific Inquiries & Follow-ups
        if any(w in q for w in ['population', 'how many people', 'how many families', 'census']):
            text = f"According to NIVARA's data for **{village_short}**, there are approximately **{context_data['metric_pills'][2].value if len(context_data['metric_pills']) > 2 else 'people'}** exposed to elevated hazard conditions ({context_data['location_name']}).\n\nWant to know where they can be relocated?"
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=context_data['metric_pills'], action_button=context_data['action_button'], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if any(w in q for w in ['where can they go', 'where to go', 'where can', 'relocat', 'safest land', 'safe site', 'capacity']):
            if village_short == 'Kottathara':
                text = "For **Kottathara**, NIVARA recommends the **Kottathara Valley South Safe Buffer (Safe Zone B)** with a CCAS score of 87.5/100 and a holding capacity of 1,280 people (320 families), located 5.8 km away."
            elif village_short == 'Achooranam':
                text = "For **Achooranam**, the primary safe destination is the **Achoor East Ridgeline Foothill (Safe Zone C)** with a CCAS score of 83.6/100, holding capacity of 1,000 people (250 families), 6.2 km away."
            elif village_short == 'Kuppadithara':
                text = "**Kuppadithara North Plateau (Safe Zone A)** is already a safe reception area (CCAS 90.2/100) with a capacity of 1,680 people (420 families) supporting displaced households from surrounding steep slopes."
            else:
                text = "For **Meppadi**, NIVARA recommends the **Kalpetta-Vythiri Institutional Reserve (Safe Zone D)** with a high CCAS score of 93.4/100 and a safe capacity of 2,200 people (550 families), accessible via the NH-766 corridor (~28 min convoy)."

            return ChatResponse(
                message=text,
                conversation_id=conv_id,
                language=lang,
                metrics=context_data['metric_pills'],
                action_button=context_data['action_button'],
                route_info=context_data['route_blueprint'],
                is_fallback=True,
                model_used='NIVARA-Conversational-Fallback'
            )

        if any(w in q for w in ['+50%', '50% rain', 'simulation', 'what happens at', 'multiplier']):
            text = "At a **+50% rainfall surge (213 mm/24h)** in the simulator, high-risk cadastral parcels across Wayanad increase from 424 to 610 parcels (+44%), and exposed population increases from 4,800 to 6,120 people due to soil saturation crossing 75%."
            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=context_data['metric_pills'], action_button=context_data['action_button'], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        if q in ['why', 'why?', 'why is it risky', 'why risky', 'why danger', 'why is risk high', 'why is it high risk'] or q.startswith('why '):
            if village_short == 'Kottathara':
                text = "Kottathara is considered risky primarily due to **seasonal river flooding and silt deposition along the Kabini river basin**. While its slope is gentle (6.5 deg), continuous heavy rains cause riverbank overflows in low-lying parcels.\n\nWant me to explain the risk numbers or relocation options?"
            elif village_short == 'Achooranam':
                text = "Achooranam has moderate-to-high risk mainly due to **steep tea estate slope creep and terrace cutting (18.2 deg slope)** combined with heavy monsoon runoff.\n\nWant me to show the specific risk numbers?"
            elif village_short == 'Kuppadithara':
                text = "Kuppadithara is generally a stable agricultural plateau with a gentle 5.8 deg slope and low regional hazard (40.7/100). Only minor drainage dips along stream edges experience local waterlogging."
            else:
                text = "Meppadi is classified as high/critical risk because of the extreme combination of **steep 38.5 deg mountain scarps**, **284.5mm cloudburst rainfall**, and **98% soil moisture saturation**, which create high susceptibility to catastrophic debris flow.\n\nWant me to explain the risk numbers behind this result?"

            return ChatResponse(message=text, conversation_id=conv_id, language=lang, metrics=context_data['metric_pills'], action_button=context_data['action_button'], is_fallback=True, model_used='NIVARA-Conversational-Fallback')

        # 6. Area Safety Assessment & Multilingual phrasing
        if village_short == 'Kottathara':
            if lang in ['ml', 'malayalam']:
                text = '🟠 **കോട്ടത്തറ (Kottathara) - ഉയർന്ന വെള്ളപ്പൊക്ക സാധ്യത:**\n\nകബനി നദീതീരത്ത് വെള്ളപ്പൊക്ക സാധ്യത കൂടുതലാണ്. എന്നാൽ ഇവിടെ മലയിടിച്ചിൽ സാധ്യത കുറവാണ് (6.5° ചരിവ്).\n\nകൂടുതൽ വിവരങ്ങൾ വേണമെന്നുണ്ടോ?'
            elif lang in ['ta', 'tamil']:
                text = '🟠 **கொத்தத்தாரா (Kottathara) - வெள்ள அபாயம்:**\n\nகபினி ஆற்றுப்படுகையில் நீர்மட்டம் உயரும் வாய்ப்புள்ளதால் இங்கு வெள்ள அபாயம் உள்ளது. நிலச்சரிவு வாய்ப்பு குறைவு.\n\nமேலும் விவரங்கள் தேவையா?'
            elif lang in ['hi', 'hindi']:
                text = '🟠 **कोट्टाथारा (Kottathara) - उच्च बाढ़ जोखिम:**\n\nकाबिनी नदी बेसिन में जलस्तर बढ़ने के कारण बाढ़ का खतरा है, हालांकि ढलान कम (6.5°) होने से भूस्खलन का जोखिम कम है।\n\nक्या आप और विवरण जानना चाहते हैं?'
            else:
                text = '🟠 **High Risk (Flood Zone)**\n\nKottathara currently shows elevated flood hazard along the Kabini river basin due to seasonal river overflow, though landslide risk is low on its gentle 6.5 deg plains.\n\n⚠️ Follow local flood warning advisories if river levels rise.\n\nWant me to show the specific risk numbers or relocation options?'
        elif village_short == 'Achooranam':
            text = '🟠 **High Risk (Slope Zone)**\n\nAchooranam has moderate-to-high slope hazard along tea plantation hillsides (18.2 deg gradient) requiring terrace monitoring during heavy rain.\n\n⚠️ Follow local advisories for slope-edge habitations.\n\nWant me to show the specific risk numbers?'
        elif village_short == 'Kuppadithara':
            text = '🟢 **Low Risk (Stable Plateau)**\n\nKuppadithara is predominantly a stable lateritic plateau (5.8 deg slope) outside major landslide corridors, and serves as a primary receiving safe land for displaced families.\n\nContinue routine monitoring.'
        elif village_short in ['Kalpetta', 'Sulthan Bathery']:
            text = f'🟢 **Low Risk**\n\n{village_short} is on stable, high-ground terrain outside landslide runout channels and serves as an administrative and logistics refuge hub.'
        else:
            if lang in ['ml', 'malayalam']:
                text = '🔴 **മേപ്പാടി (Meppadi) - ഉയർന്ന അപകട സാധ്യത:**\n\nകനത്ത മഴ, ഉയർന്ന ചരിവ് (38.5°), മണ്ണിലെ ഉയർന്ന ഈർപ്പം എന്നിവ കാരണം മേപ്പാടി അതീവ ജാഗ്രതയിലാണ്.\n\n⚠️ പ്രാദേശിക ഭരണകൂടത്തിന്റെ നിർദ്ദേശങ്ങൾ പാലിക്കുക. വിശദമായ വിവരങ്ങൾ അറിയണമെന്നുണ്ടോ?'
            elif lang in ['ta', 'tamil']:
                text = '🔴 **மேப்பாடி (Meppadi) - அதிக ஆபத்து:**\n\nகனமழை, செங்குத்தான மலைச்சரிவு (38.5°) மற்றும் மண்ணின் ஈரப்பதம் காரணமாக மேப்பாடி தீவிர கண்காணிப்பில் உள்ளது.\n\n⚠️ அதிகாரப்பூர்வ எச்சரிக்கைகளைப் பின்பற்றவும். முழு விவரங்கள் வேண்டுமா?'
            elif lang in ['hi', 'hindi']:
                text = '🔴 **मेप्पाडी (Meppadi) - अति संवेदनशील क्षेत्र:**\n\nभारी वर्षा, तीव्र ढलान (38.5°) और मिट्टी की अत्यधिक नमी के कारण मेप्पाडी उच्च जोखिम श्रेणी में है।\n\n⚠️ आधिकारिक निर्देशों का पालन करें। क्या आप जोखिम के आंकड़े देखना चाहते हैं?'
            else:
                text = '🔴 **Critical Risk**\n\nMeppadi is currently classified as high/critical risk based on available NIVARA data. The main concerns are heavy rainfall, steep mountain scarps (38.5 deg), and high soil saturation, which significantly increase debris flow risk.\n\n⚠️ Please follow official evacuation guidance if an advisory is issued.\n\nWant me to explain the risk numbers behind this result?'

        return ChatResponse(
            message=text,
            conversation_id=conv_id,
            language=lang,
            safety_status=status,
            metrics=context_data['metric_pills'],
            action_button=context_data['action_button'],
            route_info=context_data['route_blueprint'],
            is_fallback=True,
            model_used='NIVARA-Conversational-Fallback'
        )

gemini_service = GeminiService()
