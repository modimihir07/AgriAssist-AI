import React, { useState, useRef, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { 
  Leaf, Sun, Moon, Smartphone, Server, Database, Github, CheckCircle2, 
  AlertCircle, Camera, ShieldCheck, Globe, Upload, 
  ScanLine, ArrowRight, Activity, Sprout, Target, Play,
  AlertTriangle, Check, Droplets, ExternalLink, Copy, ThumbsUp, ThumbsDown, Languages, ChevronDown,
  Mic, Volume2, VolumeX, Square, Bug, WifiOff, CloudOff, Share2, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './contexts/ThemeContext';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider } from './firebase';

const translations = {
  en: {
    offline_mode: "Offline Mode",
    offline_desc: "Using local data and cached results",
    slow_network: "Slow Connection",
    slow_desc: "Falling back to local cache",
    cached_result: "Cached Result",
    offline_mock: "Offline Simulation",
    nav_overview: "Project Overview",
    nav_demo: "Live Demo",
    api_online: "API Online",
    api_offline: "API Offline",
    hero_title: "Empowering Farmers with",
    hero_title_accent: "Generative AI",
    hero_subtitle: "Instant crop disease detection, localized treatment recommendations, and predictive insights powered by Gemini AI.",
    btn_try_demo: "Try Web Demo",
    btn_view_source: "View Source",
    demo_title: "Live AI Diagnosis Demo",
    demo_subtitle: "Upload a photo of a crop leaf to instantly detect diseases and get treatment plans.",
    input_title: "Image Input",
    btn_analyze: "Analyze Image",
    btn_analyzing: "Analyzing...",
    results_title: "Analysis Results",
    plant_type: "Plant Type",
    disease: "Disease",
    confidence: "Confidence",
    remedies: "Remedies",
    prevention: "Prevention",
    chat_title: "Chat with AgriBot",
    chat_placeholder: "Type your message...",
    history_title: "Past Conversations",
    btn_new_scan: "New Scan",
    location_detecting: "Detecting location...",
    location_error: "Location access denied",
    sdg_title: "Addressing UN Sustainable Development Goals",
    tech_title: "Powered by Google Technologies",
    identified_crop: "Identified Crop",
    status: "Status",
    ai_confidence: "AI Confidence Score",
    recommended_remedies: "Recommended Remedies",
    prevention_strategies: "Prevention Strategies",
    read_more: "Read more about",
    last_scan: "Last Scan",
    detected_pest: "Detected Pest",
    pest_remedies: "Pest Remedies",
    no_pests_detected: "No pests detected",
    no_results: "Upload an image and click analyze to see AI-generated insights here.",
    consulting_ai: "Consulting Agricultural AI Model...",
    invalid_input_title: "INVALID INPUT!",
    invalid_input_subtitle: "Please upload a clear image of a plant or crop leaf.",
    invalid_input_desc: "Our AI is specifically trained for agricultural analysis and cannot process other types of images.",
    change_image: "Change Image",
    analyze_crop: "Analyze Crop",
    analyzing_gemini: "Analyzing with Gemini...",
    location_active: "Location Active",
    location_label: "Location",
    click_to_upload: "Click to upload leaf image",
    upload_support: "Supports JPG, PNG (Max 10MB)",
    agribot_assistant: "AgriBot Assistant",
    view_history: "View History",
    back_to_chat: "Back to Chat",
    chat_input_placeholder: "Ask AgriBot about this diagnosis... (Press Enter to send)",
    btn_send: "Send",
    suggested_prompts: ['What pesticides should I use?', 'Is this contagious?', 'How much water does it need?'],
    you: "You",
    agribot: "AgriBot",
    copied: "Copied!",
    copy_message: "Copy message",
    sdg_2_title: "Zero Hunger",
    sdg_2_desc: "Preventing crop loss through early disease detection to ensure food security.",
    sdg_12_title: "Responsible Consumption",
    sdg_12_desc: "Optimizing pesticide use by providing targeted, AI-driven treatment plans.",
    sdg_13_title: "Climate Action",
    sdg_13_desc: "Building resilient agricultural practices against climate-induced plant diseases.",
    flutter_title: "Flutter Frontend",
    flutter_desc: "Cross-platform mobile application built with Material 3 design. Features offline caching via Hive, local localization (English/Hindi), and seamless camera integration.",
    node_title: "Node.js + Express API",
    node_desc: "Robust backend architecture handling rate limiting, request validation, and secure AI model orchestration.",
    firebase_title: "Firebase",
    firebase_desc: "Auth & Firestore",
    gemini_title: "Gemini Pro",
    gemini_desc: "Multimodal Vision AI",
    footer_rights: "© 2026 AgriAssist AI. All rights reserved.",
    footer_license: "Released under the MIT License.",
    footer_privacy: "Privacy Policy",
    sign_in: "Sign In",
    sign_out: "Sign Out",
    share_results: "Share Results",
    share_success: "Shared successfully!",
    share_error: "Failed to share"
  },
  hi: {
    offline_mode: "ऑफलाइन मोड",
    offline_desc: "स्थानीय डेटा और कैश किए गए परिणामों का उपयोग करना",
    slow_network: "धीमा कनेक्शन",
    slow_desc: "स्थानीय कैश पर वापस जाना",
    cached_result: "कैश किया गया परिणाम",
    offline_mock: "ऑफलाइन सिमुलेशन",
    nav_overview: "परियोजना अवलोकन",
    nav_demo: "लाइव डेमो",
    api_online: "एपीआई ऑनलाइन",
    api_offline: "एपीआई ऑफलाइन",
    hero_title: "किसानों को सशक्त बनाना",
    hero_title_accent: "जेनरेटिव एआई के साथ",
    hero_subtitle: "जेमिनी 1.5 प्रो विजन द्वारा संचालित तत्काल फसल रोग पहचान, स्थानीय उपचार सिफारिशें और भविष्य कहनेवाला अंतर्दृष्टि।",
    btn_try_demo: "वेब डेमो आज़माएं",
    btn_view_source: "स्रोत देखें",
    demo_title: "लाइव एआई निदान डेमो",
    demo_subtitle: "रोगों का तुरंत पता लगाने और उपचार योजना प्राप्त करने के लिए फसल की पत्ती की एक तस्वीर अपलोड करें।",
    input_title: "छवि इनपुट",
    btn_analyze: "छवि का विश्लेषण करें",
    btn_analyzing: "विश्लेषण हो रहा है...",
    results_title: "विश्लेषण परिणाम",
    plant_type: "पौधे का प्रकार",
    disease: "रोग",
    confidence: "आत्मविश्वास",
    remedies: "उपचार",
    prevention: "रोकथाम",
    chat_title: "एग्रीबॉट के साथ चैट करें",
    chat_placeholder: "अपना संदेश टाइप करें...",
    history_title: "पिछली बातचीत",
    btn_new_scan: "नया स्कैन",
    location_detecting: "स्थान का पता लगाया जा रहा है...",
    location_error: "स्थान पहुंच अस्वीकृत",
    sdg_title: "संयुक्त राष्ट्र सतत विकास लक्ष्यों को संबोधित करना",
    tech_title: "गूगल प्रौद्योगिकियों द्वारा संचालित",
    identified_crop: "पहचाना गया फसल",
    status: "स्थिति",
    ai_confidence: "एआई आत्मविश्वास स्कोर",
    recommended_remedies: "अनुशंसित उपचार",
    prevention_strategies: "रोकथाम रणनीतियाँ",
    read_more: "इसके बारे में और पढ़ें",
    last_scan: "पिछला स्कैन",
    detected_pest: "पता चला कीट",
    pest_remedies: "कीट उपचार",
    no_pests_detected: "कोई कीट नहीं मिला",
    no_results: "एआई-जनित अंतर्दृष्टि देखने के लिए एक छवि अपलोड करें और विश्लेषण पर क्लिक करें।",
    consulting_ai: "कृषि एआई मॉडल से परामर्श कर रहे हैं...",
    invalid_input_title: "अमान्य इनपुट!",
    invalid_input_subtitle: "कृपया पौधे या फसल की पत्ती की स्पष्ट छवि अपलोड करें।",
    invalid_input_desc: "हमारा एआई विशेष रूप से कृषि विश्लेषण के लिए प्रशिक्षित है और अन्य प्रकार की छवियों को संसाधित नहीं कर सकता है।",
    change_image: "छवि बदलें",
    analyze_crop: "फसल का विश्लेषण करें",
    analyzing_gemini: "जेमिनी के साथ विश्लेषण हो रहा है...",
    location_active: "स्थान सक्रिय",
    location_label: "स्थान",
    click_to_upload: "पत्ती की छवि अपलोड करने के लिए क्लिक करें",
    upload_support: "जेपीजी, पीएनजी का समर्थन करता है (अधिकतम 10 एमबी)",
    agribot_assistant: "एग्रीबॉट सहायक",
    view_history: "इतिहास देखें",
    back_to_chat: "चैट पर वापस जाएं",
    chat_input_placeholder: "इस निदान के बारे में एग्रीबॉट से पूछें... (भेजने के लिए एंटर दबाएं)",
    btn_send: "भेजें",
    suggested_prompts: ['मुझे किन कीटनाशकों का उपयोग करना चाहिए?', 'क्या यह संक्रामक है?', 'इसे कितने पानी की आवश्यकता है?'],
    you: "आप",
    agribot: "एग्रीबॉट",
    copied: "कॉपी किया गया!",
    copy_message: "संदेश कॉपी करें",
    sdg_2_title: "शून्य भूख",
    sdg_2_desc: "खाद्य सुरक्षा सुनिश्चित करने के लिए प्रारंभिक रोग पहचान के माध्यम से फसल के नुकसान को रोकना।",
    sdg_12_title: "जिम्मेदार उपभोग",
    sdg_12_desc: "लक्षित, एआई-संचालित उपचार योजनाएं प्रदान करके कीटनाशकों के उपयोग को अनुकूलित करना।",
    sdg_13_title: "जलवायु कार्रवाई",
    sdg_13_desc: "जलवायु-प्रेरित पौधों के रोगों के खिलाफ लचीली कृषि प्रथाओं का निर्माण करना।",
    flutter_title: "फ्लटर फ्रंटेंड",
    flutter_desc: "मटेरियल 3 डिज़ाइन के साथ निर्मित क्रॉस-प्लेटफ़ॉर्म मोबाइल एप्लिकेशन। हाइव के माध्यम से ऑफ़लाइन कैशिंग, स्थानीय स्थानीयकरण (अंग्रेजी/हिंदी) और निर्बाध कैमरा एकीकरण की सुविधा है।",
    node_title: "Node.js + एक्सप्रेस एपीआई",
    node_desc: "मजबूत बैकएंड आर्किटेक्चर दर सीमित करने, अनुरोध सत्यापन और सुरक्षित एआई मॉडल ऑर्केस्ट्रेशन को संभालता है।",
    firebase_title: "फायरबेस",
    firebase_desc: "प्रमाणीकरण और फायरस्टोर",
    gemini_title: "जेमिनी प्रो",
    gemini_desc: "मल्टीमॉडल विजन एआई",
    footer_rights: "© 2026 एग्रीअसिस्ट एआई। सर्वाधिकार सुरक्षित।",
    footer_license: "एमआईटी लाइसेंस के तहत जारी किया गया।",
    footer_privacy: "गोपनीयता नीति",
    sign_in: "साइन इन करें",
    sign_out: "साइन आउट करें",
    share_results: "परिणाम साझा करें",
    share_success: "सफलतापूर्वक साझा किया गया!",
    share_error: "साझा करने में विफल"
  },
  gu: {
    offline_mode: "ઓફલાઇન મોડ",
    offline_desc: "સ્થાનિક ડેટા અને કેશ કરેલા પરિણામોનો ઉપયોગ",
    slow_network: "ધીમું કનેક્શન",
    slow_desc: "સ્થાનિક કેશ પર પાછા જવું",
    cached_result: "કેશ કરેલું પરિણામ",
    offline_mock: "ઓફલાઇન સિમ્યુલેશન",
    nav_overview: "પ્રોજેક્ટ વિહંગાવલોકન",
    nav_demo: "લાઇવ ડેમો",
    api_online: "API ઓનલાઇન",
    api_offline: "API ઓફલાઇન",
    hero_title: "ખેડૂતોને સશક્ત બનાવવું",
    hero_title_accent: "જનરેટિવ AI સાથે",
    hero_subtitle: "જેમિની 1.5 પ્રો વિઝન દ્વારા સંચાલિત ત્વરિત પાક રોગની શોધ, સ્થાનિક સારવાર ભલામણો અને અનુમાનિત આંતરદૃષ્ટિ.",
    btn_try_demo: "વેબ ડેમો અજમાવો",
    btn_view_source: "સોર્સ જુઓ",
    demo_title: "લાઇવ AI નિદાન ડેમો",
    demo_subtitle: "રોગોને તરત જ શોધવા અને સારવાર યોજનાઓ મેળવવા માટે પાકના પાંદડાનો ફોટો અપલોડ કરો.",
    input_title: "છબી ઇનપુટ",
    btn_analyze: "છબીનું વિશ્લેષણ કરો",
    btn_analyzing: "વિશ્લેષણ કરી રહ્યું છે...",
    results_title: "વિશ્લેષણ પરિણામો",
    plant_type: "છોડનો પ્રકાર",
    disease: "રોગ",
    confidence: "આત્મવિશ્વાસ",
    remedies: "ઉપાયો",
    prevention: "નિવારણ",
    chat_title: "AgriBot સાથે ચેટ કરો",
    chat_placeholder: "તમારો સંદેશ લખો...",
    history_title: "ભૂતકાળની વાતચીત",
    btn_new_scan: "નવો સ્કેન",
    location_detecting: "સ્થાન શોધી રહ્યું છે...",
    location_error: "સ્થાન ઍક્સેસ નકારવામાં આવી",
    sdg_title: "યુએન સસ્ટેનેબલ ડેવલપમેન્ટ ગોલ્સને સંબોધિત કરવું",
    tech_title: "Google ટેકનોલોજી દ્વારા સંચાલિત",
    identified_crop: "ઓળખાયેલ પાક",
    status: "સ્થિતિ",
    ai_confidence: "AI આત્મવિશ્વાસ સ્કોર",
    recommended_remedies: "ભલામણ કરેલ ઉપાયો",
    prevention_strategies: "નિવારણ વ્યૂહરચનાઓ",
    read_more: "તેના વિશે વધુ વાંચો",
    last_scan: "છેલ્લો સ્કેન",
    detected_pest: "શોધાયેલ જીવાત",
    pest_remedies: "જીવાત ઉપાયો",
    no_pests_detected: "કોઈ જીવાત મળી નથી",
    no_results: "AI-જનરેટેડ આંતરદૃષ્ટિ જોવા માટે એક છબી અપલોડ કરો અને વિશ્લેષણ પર ક્લિક કરો.",
    consulting_ai: "કૃષિ AI મોડેલની સલાહ લઈ રહ્યા છીએ...",
    invalid_input_title: "અમાન્ય ઇનપુટ!",
    invalid_input_subtitle: "કૃપા કરીને છોડ અથવા પાકના પાંદડાની સ્પષ્ટ છબી અપલોડ કરો.",
    invalid_input_desc: "અમારું AI ખાસ કરીને કૃષિ વિશ્લેષણ માટે તાલીમ પામેલું છે અને અન્ય પ્રકારની છબીઓ પર પ્રક્રિયા કરી શકતું નથી.",
    change_image: "છબી બદલો",
    analyze_crop: "પાકનું વિશ્લેષણ કરો",
    analyzing_gemini: "જેમિની સાથે વિશ્લેષણ કરી રહ્યું છે...",
    location_active: "સ્થાન સક્રિય",
    location_label: "સ્થાન",
    click_to_upload: "પાંદડાની છબી અપલોડ કરવા માટે ક્લિક કરો",
    upload_support: "JPG, PNG ને સપોર્ટ કરે છે (મહત્તમ 10MB)",
    agribot_assistant: "AgriBot સહાયક",
    view_history: "ઇતિહાસ જુઓ",
    back_to_chat: "ચેટ પર પાછા જાઓ",
    chat_input_placeholder: "આ નિદાન વિશે AgriBot ને પૂછો... (મોકલવા માટે એન્ટર દબાવો)",
    btn_send: "મોકલો",
    suggested_prompts: ['મારે કયા જંતુનાશકોનો ઉપયોગ કરવો જોઈએ?', 'શું આ ચેપી છે?', 'તેને કેટલા પાણીની જરૂર છે?'],
    you: "તમે",
    agribot: "AgriBot",
    copied: "નકલ કરી!",
    copy_message: "સંદેશની નકલ કરો",
    sdg_2_title: "ઝીરો હંગર",
    sdg_2_desc: "ખાદ્ય સુરક્ષા સુનિશ્ચિત કરવા માટે પ્રારંભિક રોગની શોધ દ્વારા પાકના નુકસાનને અટકાવવું.",
    sdg_12_title: "જવાબદાર વપરાશ",
    sdg_12_desc: "લક્ષિત, AI-સંચાલિત સારવાર યોજનાઓ પૂરી પાડીને જંતુનાશકોના ઉપયોગને શ્રેષ્ઠ બનાવવો.",
    sdg_13_title: "ક્લાઈમેટ એક્શન",
    sdg_13_desc: "આબોહવા-પ્રેરિત છોડના રોગો સામે સ્થિતિસ્થાપક કૃષિ પદ્ધતિઓનું નિર્માણ કરવું.",
    flutter_title: "ફ્લટર ફ્રન્ટએન્ડ",
    flutter_desc: "મટીરીયલ 3 ડિઝાઇન સાથે બનેલ ક્રોસ-પ્લેટફોર્મ મોબાઇલ એપ્લિકેશન. Hive દ્વારા ઑફલાઇન કેશિંગ, સ્થાનિક સ્થાનિકીકરણ (અંગ્રેજી/હિન્દી) અને સીમલેસ કેમેરા એકીકરણની સુવિધા આપે છે.",
    node_title: "Node.js + એક્સપ્રેસ API",
    node_desc: "મજબૂત બેકએન્ડ આર્કિટેક્ચર રેટ લિમિટિંગ, વિનંતી માન્યતા અને સુરક્ષિત AI મોડેલ ઓર્કેસ્ટ્રેશનનું સંચાલન કરે છે.",
    firebase_title: "ફાયરબેઝ",
    firebase_desc: "ઓથેન્ટિકેશન અને ફાયરસ્ટોર",
    gemini_title: "જેમિની પ્રો",
    gemini_desc: "મલ્ટિમોડલ વિઝન AI",
    footer_rights: "© 2026 AgriAssist AI. સર્વાધિકાર સુરક્ષિત.",
    footer_license: "MIT લાયસન્સ હેઠળ બહાર પાડવામાં આવ્યું.",
    footer_privacy: "ગોપનીયતા નીતિ",
    sign_in: "સાઇન ઇન કરો",
    sign_out: "સાઇન આઉટ કરો",
    share_results: "પરિણામો શેર કરો",
    share_success: "સફળતાપૂર્વક શેર કર્યું!",
    share_error: "શેર કરવામાં નિષ્ફળ"
  },
  es: {
    offline_mode: "Modo Offline",
    offline_desc: "Usando datos locales y resultados en caché",
    slow_network: "Conexión Lenta",
    slow_desc: "Recurriendo a la caché local",
    cached_result: "Resultado en Caché",
    offline_mock: "Simulación Offline",
    nav_overview: "Descripción del Proyecto",
    nav_demo: "Demo en Vivo",
    api_online: "API en Línea",
    api_offline: "API Fuera de Línea",
    hero_title: "Empoderando a los Agricultores con",
    hero_title_accent: "IA Generativa",
    hero_subtitle: "Detección instantánea de enfermedades de cultivos, recomendaciones de tratamiento localizadas e información predictiva impulsada por Gemini 1.5 Pro Vision.",
    btn_try_demo: "Probar Demo Web",
    btn_view_source: "Ver Código Fuente",
    demo_title: "Demo de Diagnóstico por IA en Vivo",
    demo_subtitle: "Sube una foto de una hoja de cultivo para detectar enfermedades al instante y obtener planes de tratamiento.",
    input_title: "Entrada de Imagen",
    btn_analyze: "Analizar Imagen",
    btn_analyzing: "Analizando...",
    results_title: "Resultados del Análisis",
    plant_type: "Tipo de Planta",
    disease: "Enfermedad",
    confidence: "Confianza",
    remedies: "Remedios",
    prevention: "Prevención",
    chat_title: "Chatear con AgriBot",
    chat_placeholder: "Escribe tu mensaje...",
    history_title: "Conversaciones Pasadas",
    btn_new_scan: "Nuevo Escaneo",
    location_detecting: "Detectando ubicación...",
    location_error: "Acceso a la ubicación denegado",
    sdg_title: "Abordar los Objetivos de Desarrollo Sostenible de la ONU",
    tech_title: "Impulsado por Tecnologías de Google",
    identified_crop: "Cultivo Identificado",
    status: "Estado",
    ai_confidence: "Puntuación de Confianza de la IA",
    recommended_remedies: "Remedios Recomendados",
    prevention_strategies: "Estrategias de Prevención",
    read_more: "Leer más sobre",
    last_scan: "Último Escaneo",
    detected_pest: "Plaga Detectada",
    pest_remedies: "Remedios para Plagas",
    no_pests_detected: "No se detectaron plagas",
    no_results: "Sube una imagen y haz clic en analizar para ver aquí los conocimientos generados por la IA.",
    consulting_ai: "Consultando el modelo de IA agrícola...",
    invalid_input_title: "¡ENTRADA INVÁLIDA!",
    invalid_input_subtitle: "Por favor, sube una imagen clara de una planta o de una hoja de cultivo.",
    invalid_input_desc: "Nuestra IA está entrenada específicamente para el análisis agrícola y no puede procesar otros tipos de imágenes.",
    change_image: "Cambiar Imagen",
    analyze_crop: "Analizar Cultivo",
    analyzing_gemini: "Analizando con Gemini...",
    location_active: "Ubicación Activa",
    location_label: "Ubicación",
    click_to_upload: "Haz clic para subir la imagen de la hoja",
    upload_support: "Soporta JPG, PNG (Máx 10MB)",
    agribot_assistant: "Asistente AgriBot",
    view_history: "Ver Historial",
    back_to_chat: "Volver al Chat",
    chat_input_placeholder: "Pregunta a AgriBot sobre este diagnóstico... (Presiona Enter para enviar)",
    btn_send: "Enviar",
    suggested_prompts: ['¿Qué pesticidas debo usar?', '¿Es esto contagioso?', '¿Cuánta agua necesita?'],
    you: "Tú",
    agribot: "AgriBot",
    copied: "¡Copiado!",
    copy_message: "Copiar mensaje",
    sdg_2_title: "Hambre Cero",
    sdg_2_desc: "Prevenir la pérdida de cultivos mediante la detección temprana de enfermedades para garantizar la seguridad alimentaria.",
    sdg_12_title: "Consumo Responsable",
    sdg_12_desc: "Optimizar el uso de pesticidas proporcionando planes de tratamiento específicos impulsados por IA.",
    sdg_13_title: "Acción por el Clima",
    sdg_13_desc: "Crear prácticas agrícolas resilientes contra las enfermedades de las plantas inducidas por el clima.",
    flutter_title: "Frontend Flutter",
    flutter_desc: "Aplicación móvil multiplataforma construida con diseño Material 3. Cuenta con almacenamiento en caché fuera de línea a través de Hive, localización local (inglés/hindi) e integración perfecta de la cámara.",
    node_title: "API de Node.js + Express",
    node_desc: "Arquitectura de backend robusta que maneja la limitación de velocidad, la validación de solicitudes y la orquestación segura de modelos de IA.",
    firebase_title: "Firebase",
    firebase_desc: "Autenticación y Firestore",
    gemini_title: "Gemini Pro",
    gemini_desc: "IA de Visión Multimodal",
    footer_rights: "© 2026 AgriAssist AI. Todos los derechos reservados.",
    footer_license: "Publicado bajo la Licencia MIT.",
    footer_privacy: "Política de Privacidad",
    sign_in: "Iniciar sesión",
    sign_out: "Cerrar sesión",
    share_results: "Compartir resultados",
    share_success: "¡Compartido con éxito!",
    share_error: "Error al compartir"
  },
  fr: {
    offline_mode: "Mode Hors Ligne",
    offline_desc: "Utilisation des données locales et des résultats mis en cache",
    slow_network: "Connexion Lente",
    slow_desc: "Retour à la cache locale",
    cached_result: "Résultat mis en Cache",
    offline_mock: "Simulation Hors Ligne",
    nav_overview: "Aperçu du Projet",
    nav_demo: "Démo en Direct",
    api_online: "API en Ligne",
    api_offline: "API Hors Ligne",
    hero_title: "Autonomiser les Agriculteurs avec",
    hero_title_accent: "l'IA Générative",
    hero_subtitle: "Détection instantanée des maladies des cultures, recommandations de traitement localisées et informations prédictives optimisées par Gemini 1.5 Pro Vision.",
    btn_try_demo: "Essayer la Démo Web",
    btn_view_source: "Voir le Code Source",
    demo_title: "Démo de Diagnostic IA en Direct",
    demo_subtitle: "Téléchargez une photo d'une feuille de culture pour détecter instantanément les maladies et obtenir des plans de traitement.",
    input_title: "Entrée d'Image",
    btn_analyze: "Analyser l'Image",
    btn_analyzing: "Analyse en cours...",
    results_title: "Résultats de l'Analyse",
    plant_type: "Type de Plante",
    disease: "Maladie",
    confidence: "Confiance",
    remedies: "Remèdes",
    prevention: "Prevention",
    chat_title: "Discuter avec AgriBot",
    chat_placeholder: "Tapez votre message...",
    history_title: "Conversations Passées",
    btn_new_scan: "Nouveau Scan",
    location_detecting: "Détection de l'emplacement...",
    location_error: "Accès à l'emplacement refusé",
    sdg_title: "Répondre aux Objectifs de Développement Durable de l'ONU",
    tech_title: "Propulsé par les Technologies Google",
    identified_crop: "Culture Identifiée",
    status: "Statut",
    ai_confidence: "Score de Confiance de l'IA",
    recommended_remedies: "Remèdes Recommandés",
    prevention_strategies: "Stratégies de Prévention",
    read_more: "En savoir plus sur",
    last_scan: "Dernier Scan",
    detected_pest: "Ravageur Détecté",
    pest_remedies: "Remèdes contre les Ravageurs",
    no_pests_detected: "Aucun ravageur détecté",
    no_results: "Téléchargez une image et cliquez sur analyser pour voir ici les informations générées par l'IA.",
    consulting_ai: "Consultation du modèle d'IA agricole...",
    invalid_input_title: "ENTRÉE INVALIDE !",
    invalid_input_subtitle: "Veuillez télécharger une image claire d'une plante ou d'une feuille de culture.",
    invalid_input_desc: "Notre IA est spécifiquement formée pour l'analyse agricole et ne peut pas traiter d'autres types d'images.",
    change_image: "Changer l'Image",
    analyze_crop: "Analyser la Culture",
    analyzing_gemini: "Analyse avec Gemini...",
    location_active: "Localisation Active",
    location_label: "Localisation",
    click_to_upload: "Cliquez pour télécharger l'image de la feuille",
    upload_support: "Prend en charge JPG, PNG (Max 10 Mo)",
    agribot_assistant: "Assistant AgriBot",
    view_history: "Voir l'Historique",
    back_to_chat: "Retour au Chat",
    chat_input_placeholder: "Posez une question à AgriBot sur ce diagnostic... (Appuyez sur Entrée pour envoyer)",
    btn_send: "Envoyer",
    suggested_prompts: ['Quels pesticides dois-je utiliser ?', 'Est-ce contagieux ?', 'De quelle quantité d\'eau a-t-il besoin ?'],
    you: "Vous",
    agribot: "AgriBot",
    copied: "Copié !",
    copy_message: "Copier le message",
    sdg_2_title: "Faim Zéro",
    sdg_2_desc: "Prévenir les pertes de récoltes grâce à la détection précoce des maladies pour assurer la sécurité alimentaire.",
    sdg_12_title: "Consommation Responsable",
    sdg_12_desc: "Optimiser l'utilisation des pesticides en fournissant des plans de traitement ciblés et basés sur l'IA.",
    sdg_13_title: "Action pour le Climat",
    sdg_13_desc: "Mettre en place des pratiques agricoles résilientes face aux maladies des plantes induites par le climat.",
    flutter_title: "Frontend Flutter",
    flutter_desc: "Application mobile multiplateforme construite avec le design Material 3. Comprend la mise en cache hors ligne via Hive, la localisation locale (anglais/hindi) et une intégration fluide de la caméra.",
    node_title: "API Node.js + Express",
    node_desc: "Architecture backend robuste gérant la limitation de débit, la validation des demandes et l'orchestration sécurisée des modèles d'IA.",
    firebase_title: "Firebase",
    firebase_desc: "Authentification et Firestore",
    gemini_title: "Gemini Pro",
    gemini_desc: "IA de Visión Multimodale",
    footer_rights: "© 2026 AgriAssist AI. Tous droits réservés.",
    footer_license: "Publié sous licence MIT.",
    footer_privacy: "Politique de Confidentialité",
    sign_in: "Se connecter",
    sign_out: "Se déconnecter",
    share_results: "Partager les résultats",
    share_success: "Partagé avec succès!",
    share_error: "Échec du partage"
  }
};
const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [backendStatus, setBackendStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [activeTab, setActiveTab] = useState<'overview' | 'demo'>('overview');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isChatLangOpen, setIsChatLangOpen] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('Sign-in popup closed by user');
        return;
      }
      console.error('Error signing in:', error);
      showToast('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const fetchWeather = async (lat: number, lng: number) => {
    if (!isOnline) return;
    console.log(`Fetching weather for: ${lat}, ${lng}`);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lng}`);
      const data = await response.json();
      console.log("Weather API Response:", data);
      
      if (response.ok) {
        setCurrentTemperature(data.temperature);
        setIsWeatherAvailable(data.available !== false);
      } else {
        console.warn("Weather API Error:", data.error || "Unknown error");
        setIsWeatherAvailable(false);
      }
    } catch (err) {
      console.warn("Could not fetch weather data", err);
      setIsWeatherAvailable(false);
    }
  };

  // Demo State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('agribot_current_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.previewUrl || null;
      }
    } catch {}
    return null;
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('agribot_current_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.result || null;
      }
    } catch {}
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', content: string, reactions?: string[]}[]>(() => {
    try {
      const saved = localStorage.getItem('agribot_current_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.chatMessages || [];
      }
    } catch {}
    return [];
  });
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi' | 'es' | 'fr' | 'gu'>(() => {
    try {
      const saved = localStorage.getItem('agribot_current_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.language || 'en';
      }
    } catch {}
    return 'en';
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, name?: string} | null>(() => {
    try {
      const saved = localStorage.getItem('agribot_current_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.userLocation || null;
      }
    } catch {}
    return null;
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('agribot_current_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.currentTemperature || null;
      }
    } catch {}
    return null;
  });
  const [isWeatherAvailable, setIsWeatherAvailable] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('agribot_current_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.isWeatherAvailable !== undefined ? parsed.isWeatherAvailable : true;
      }
    } catch {}
    return true;
  });
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [draftInput, setDraftInput] = useState<string>('');
  const [pastConversations, setPastConversations] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('agribot_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [apiStatus, setApiStatus] = useState<{liveMode: boolean, hasKey: boolean, isMock: boolean} | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const chatLangRef = useRef<HTMLDivElement>(null);

  // Simple hash function for image strings
  const getImageHash = (str: string) => {
    let hash = 0;
    const len = str.length;
    // Hash length and first 1000 chars to be fast but unique enough
    const stringToHash = len + str.substring(0, 1000);
    for (let i = 0; i < stringToHash.length; i++) {
      const char = stringToHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          voicesRef.current = availableVoices;
          console.log(`TTS: Loaded ${availableVoices.length} voices into ref`);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get current location on mount
    if (navigator.geolocation && isOnline) {
      console.log("Getting current location on mount...");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          console.log(`Current location: ${lat}, ${lng}`);
          const newLocation: {lat: number, lng: number, name?: string} = { lat, lng };
          
          try {
            const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, {
              headers: { 'User-Agent': 'AgriAssist-Hackathon-App' }
            });
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              const areaName = geoData.address?.city || geoData.address?.county || geoData.address?.state || geoData.address?.suburb;
              if (areaName) {
                newLocation.name = areaName;
              }
            }
          } catch (e) {
            console.warn("Could not fetch location name on mount");
          }
          
          setUserLocation(newLocation);
          fetchWeather(lat, lng);
        },
        (err) => {
          console.warn("Could not get location on mount:", err.message);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  useEffect(() => {
    if (userLocation) {
      fetchWeather(userLocation.lat, userLocation.lng);
    }
    
    // Refresh weather every 30 minutes
    const interval = setInterval(() => {
      if (userLocation) {
        fetchWeather(userLocation.lat, userLocation.lng);
      }
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userLocation?.lat, userLocation?.lng]);

  // Pre-cache common diseases
  useEffect(() => {
    const commonDiseases = [
      {
        plantType: "Tomato",
        disease: "Early Blight",
        confidence: 0.95,
        remedies: ["Remove infected leaves", "Apply copper-based fungicide", "Improve air circulation"],
        prevention: ["Crop rotation", "Mulching", "Drip irrigation"],
        pestName: "Aphids",
        pestRemedies: ["Neem oil spray", "Insecticidal soap"],
        pestConfidence: 0.88,
        isClear: true,
        isOfflineCache: true
      },
      {
        plantType: "Wheat",
        disease: "Leaf Rust",
        confidence: 0.92,
        remedies: ["Apply triazole fungicides", "Remove volunteer wheat"],
        prevention: ["Resistant varieties", "Early planting"],
        pestName: "Wheat Stem Sawfly",
        pestRemedies: ["Swathing", "Resistant cultivars"],
        pestConfidence: 0.75,
        isClear: true,
        isOfflineCache: true
      },
      {
        plantType: "Corn",
        disease: "Healthy",
        confidence: 0.99,
        remedies: [],
        prevention: ["Balanced fertilization", "Proper spacing"],
        pestName: "Corn Earworm",
        pestRemedies: ["Mineral oil on silks", "Bt application"],
        pestConfidence: 0.82,
        isClear: true,
        isOfflineCache: true
      }
    ];
    
    const cached = localStorage.getItem('agriassist_pre_cache');
    if (!cached) {
      localStorage.setItem('agriassist_pre_cache', JSON.stringify(commonDiseases));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (chatLangRef.current && !chatLangRef.current.contains(event.target as Node)) {
        setIsChatLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangOpen(false);
        setIsChatLangOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const sessionData = {
      chatMessages,
      result,
      language,
      userLocation,
      currentTemperature,
      isWeatherAvailable,
      previewUrl: previewUrl?.startsWith('data:') ? previewUrl : null // Only store base64, not blob URLs
    };
    localStorage.setItem('agribot_current_session', JSON.stringify(sessionData));
  }, [chatMessages, result, language, userLocation, currentTemperature, isWeatherAvailable, previewUrl]);

  // Optimized Mouse position for global hover effect
  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.setProperty('--x', `${e.clientX}px`);
          glowRef.current.style.setProperty('--y', `${e.clientY}px`);
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    fetch('/health')
      .then(res => res.ok ? setBackendStatus('online') : setBackendStatus('offline'))
      .catch(() => setBackendStatus('offline'));
    
    fetch('/api/status')
      .then(res => res.json())
      .then(setApiStatus)
      .catch(() => setApiStatus(null));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [chatInput]);

  // Voice Input (Speech-to-Text)
  const recognitionRef = useRef<any>(null);
  const micTimeoutRef = useRef<any>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const voiceCacheRef = useRef<Record<string, SpeechSynthesisVoice | null>>({});

  useEffect(() => {
    console.log('Language changed to:', language);
  }, [language]);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          voicesRef.current = voices;
          voiceCacheRef.current = {}; // Clear cache when voices change
          console.log(`TTS: Loaded ${voices.length} voices.`);
        }
      }
    };
    loadVoices();
    // Some browsers need a delay or multiple calls
    const interval = setInterval(loadVoices, 1000);
    setTimeout(() => clearInterval(interval), 5000);

    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }


    return () => {
      if (micTimeoutRef.current) clearTimeout(micTimeoutRef.current);
    };
  }, []);

  const toggleListening = async () => {
    console.log('toggleListening called, isListening:', isListening);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      setMicError("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition...');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
      setIsListening(false);
      if (micTimeoutRef.current) clearTimeout(micTimeoutRef.current);
    } else {
      console.log('Starting speech recognition...');
      setMicError(null);
      try {
        // Explicitly request permission first to ensure prompt
        console.log('Requesting microphone permission via getUserMedia...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted.');
        // Stop the stream immediately, as SpeechRecognition will start its own
        stream.getTracks().forEach(track => track.stop());
        
        // Re-create recognition instance to avoid state issues
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        const langMap: Record<string, string> = {
          en: 'en-US',
          hi: 'hi-IN',
          gu: 'gu-IN',
          es: 'es-ES',
          fr: 'fr-FR'
        };
        recognition.lang = langMap[language] || 'en-US';

        recognition.onstart = () => {
          console.log('Speech recognition started event');
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log('Speech recognized:', transcript);
          setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
          if (micTimeoutRef.current) clearTimeout(micTimeoutRef.current);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error event:', event.error);
          setIsListening(false);
          if (micTimeoutRef.current) clearTimeout(micTimeoutRef.current);
          if (event.error === 'not-allowed') {
            setMicError("Microphone access is needed for voice input. Please check your browser permissions.");
          } else if (event.error === 'no-speech') {
            // Silently handle no-speech
          } else {
            setMicError(`Speech recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          console.log('Speech recognition ended event');
          setIsListening(false);
          if (micTimeoutRef.current) clearTimeout(micTimeoutRef.current);
        };

        recognitionRef.current = recognition;
        console.log('Calling recognition.start()...');
        recognition.start();

        // Safety timeout for 10 seconds of silence
        if (micTimeoutRef.current) clearTimeout(micTimeoutRef.current);
        micTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            console.log('Speech recognition safety timeout reached');
            try {
              recognitionRef.current.stop();
            } catch (e) {}
            setIsListening(false);
          }
        }, 10000);
      } catch (err: any) {
        console.error('Error starting speech recognition or getting permission:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setMicError("Microphone access is needed for voice input. Please enable it in your browser settings.");
        } else {
          setMicError("Could not start speech recognition. Please check your microphone connection.");
        }
      }
    }
  };

  // Voice Output (Text-to-Speech)
  const toggleSpeaking = async (text: string, index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('TTS: Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking === index) {
      console.log('TTS: Stopping current speech');
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
    } else {
      console.log('TTS: Preparing to speak message', index, 'in language:', language);
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Small delay to ensure cancellation is processed by the browser engine
      await new Promise(resolve => setTimeout(resolve, 100));

      const utterance = new SpeechSynthesisUtterance(text);
      
      const langMap: Record<string, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        gu: 'gu-IN',
        es: 'es-ES',
        fr: 'fr-FR'
      };
      
      const targetLang = langMap[language] || 'en-US';
      utterance.lang = targetLang;
      
      // Check cache first
      let selectedVoice = voiceCacheRef.current[language];
      
      if (!selectedVoice) {
        // Get all available voices
        let allVoices: SpeechSynthesisVoice[] = [];
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          allVoices = window.speechSynthesis.getVoices();
          if (allVoices.length === 0) {
            console.log('TTS: Voices not loaded, waiting...');
            await new Promise(resolve => setTimeout(resolve, 200));
            allVoices = window.speechSynthesis.getVoices();
          }
        }
        
        // Fallback to ref if window call fails
        if (allVoices.length === 0 && voicesRef.current.length > 0) {
          allVoices = voicesRef.current;
        }
        
        console.log(`TTS: Total voices detected: ${allVoices.length}`);

        // 1. Filter voices by language code (e.g., 'hi', 'en', 'gu')
        const langCode = targetLang.split('-')[0].toLowerCase();
        let langVoices = allVoices.filter(v => {
          const vLang = v.lang.toLowerCase().replace('_', '-');
          return vLang === langCode || vLang.startsWith(langCode + '-');
        });
        
        // 2. Fallback: Search by language name in the voice name if code matching fails
        if (langVoices.length === 0) {
          console.log(`TTS: No voices found for code ${langCode}, trying name search...`);
          const searchTerms: Record<string, string[]> = {
            hi: ['hindi', 'हिन्दी', 'india'],
            es: ['spanish', 'español', 'espanol'],
            fr: ['french', 'français', 'francais'],
            gu: ['gujarati', 'ગુજરાતી', 'india']
          };
          const terms = searchTerms[language] || [];
          langVoices = allVoices.filter(v => 
            terms.some(term => v.name.toLowerCase().includes(term))
          );
        }
        
        // 3. Special fallback for Gujarati: if no gu voices, try hi (Hindi)
        if (language === 'gu' && langVoices.length === 0) {
          console.log('TTS: No Gujarati voice found, falling back to Hindi voices.');
          langVoices = allVoices.filter(v => {
            const vLang = v.lang.toLowerCase().replace('_', '-');
            return vLang === 'hi' || vLang.startsWith('hi-') || v.name.toLowerCase().includes('hindi');
          });
        }

        console.log(`TTS: Found ${langVoices.length} candidate voices for ${language}`);

        // Voice name preferences per language for better quality
        const preferredVoiceNames: Record<string, string[]> = {
          en: ['Google US English', 'Samantha', 'Daniel', 'Google UK English', 'Microsoft Zira', 'Microsoft David'],
          hi: ['Lekha', 'Google हिन्दी', 'Hindi India', 'Kalpana', 'Microsoft Hemant', 'Hindi'],
          es: ['Mónica', 'Google Español', 'Spanish Spain', 'Spanish Mexico', 'Microsoft Helena', 'Spanish'],
          fr: ['Amélie', 'Google Français', 'French France', 'Microsoft Hortense', 'French'],
          gu: ['Google Gujarati', 'Gujarati India', 'Shruti', 'Gujarati']
        };

        const currentPrefs = preferredVoiceNames[language] || [];

        // Try to find a voice by preferred name
        for (const name of currentPrefs) {
          selectedVoice = langVoices.find(v => v.name.toLowerCase().includes(name.toLowerCase())) || null;
          if (selectedVoice) break;
        }

        // If no preferred name match, try generic "Google" or "Natural" voices
        if (!selectedVoice) {
          selectedVoice = langVoices.find(v => 
            v.name.toLowerCase().includes('google') || 
            v.name.toLowerCase().includes('natural') || 
            v.name.toLowerCase().includes('premium') ||
            v.name.toLowerCase().includes('enhanced')
          ) || null;
        }

        // Fallback to any voice for that language
        if (!selectedVoice && langVoices.length > 0) {
          selectedVoice = langVoices[0];
        }
        
        // Cache the result (even if null)
        voiceCacheRef.current[language] = selectedVoice;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang; // Sync lang with the voice
        console.log(`TTS: Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      } else {
        console.warn(`TTS: No suitable voice found for ${language}. Using system default with lang=${targetLang}`);
        utterance.lang = targetLang;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        console.log('TTS: Speech started');
        setIsSpeaking(index);
      };
      
      utterance.onend = () => {
        console.log('TTS: Speech ended');
        setIsSpeaking(null);
      };
      
      utterance.onerror = (event) => {
        console.error('TTS: Speech synthesis error:', event);
        setIsSpeaking(null);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReaction = (index: number, reaction: string) => {
    setChatMessages(prev => prev.map((msg, i) => {
      if (i === index) {
        const currentReactions = msg.reactions || [];
        const newReactions = currentReactions.includes(reaction)
          ? currentReactions.filter(r => r !== reaction)
          : [...currentReactions, reaction];
        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));
  };

  const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error("Failed to load image for compression"));
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      if (chatMessages.length > 1 && result) {
        const newConv = {
          id: Date.now(),
          date: new Date().toISOString(),
          plantType: result.plantType,
          disease: result.disease,
          messages: [...chatMessages]
        };
        setPastConversations(prev => {
          const updated = [newConv, ...prev].slice(0, 20);
          localStorage.setItem('agribot_history', JSON.stringify(updated));
          return updated;
        });
      }
      
      // Revoke old URL if it was a blob
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      const newPreviewUrl = URL.createObjectURL(file);
      setSelectedImage(file);
      setPreviewUrl(newPreviewUrl);
      setResult(null);
      setError(null);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    
    const shareText = `AgriAssist AI Analysis Report
Generated: ${new Date().toLocaleString()}

Plant: ${result.plantType}
Disease: ${result.disease}
Confidence: ${(result.confidence * 100).toFixed(1)}%
${userLocation ? `\nLocation: ${userLocation.name || `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`}` : ''}${currentTemperature !== null ? `\nTemperature: ${currentTemperature}°C` : ''}${(result as any).soilFertilityLevel ? `\n\nSoil Fertility: ${(result as any).soilFertilityLevel}\n${(result as any).soilFertilityRecommendations}` : ''}

Remedies:
${result.remedies.map(r => `- ${r}`).join('\n')}

Prevention:
${result.prevention.map(p => `- ${p}`).join('\n')}
`.trim();

    const downloadFile = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    let pngBlob: Blob | null = null;

    try {
      const reportElement = document.getElementById('analysis-report');
      if (reportElement) {
        // Temporarily show the report title for the screenshot
        const titleElement = reportElement.querySelector('[data-html2canvas-show]');
        if (titleElement) {
          titleElement.classList.remove('hidden');
        }

        pngBlob = await htmlToImage.toBlob(reportElement, {
          backgroundColor: '#1A1F1C', // Match the container background
          pixelRatio: 2, // Higher resolution
          filter: (node) => {
            if (node instanceof HTMLElement && node.hasAttribute('data-html2canvas-ignore')) {
              return false;
            }
            return true;
          }
        });

        // Hide the title again
        if (titleElement) {
          titleElement.classList.add('hidden');
        }
      }
    } catch (error) {
      console.error('Error generating image report:', error);
    }

    // 1. Try to share the generated PNG file
    if (pngBlob) {
      const file = new File([pngBlob], `AgriAssist_Report_${Date.now()}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'AgriAssist AI Analysis Report',
            text: 'Check out this crop analysis report from AgriAssist AI.',
            files: [file],
          });
          showToast(translations[language].share_success || 'Shared successfully!');
          return;
        } catch (error: any) {
          if (error.name === 'AbortError') return;
          console.error('Error sharing file:', error);
        }
      }
    }

    // 2. Fallback: Generate a plain text file (.txt)
    const txtBlob = new Blob([shareText], { type: 'text/plain' });
    const txtFile = new File([txtBlob], `AgriAssist_Report_${Date.now()}.txt`, { type: 'text/plain' });

    if (navigator.canShare && navigator.canShare({ files: [txtFile] })) {
      try {
        await navigator.share({
          title: 'AgriAssist AI Analysis Report',
          text: 'Check out this crop analysis report from AgriAssist AI.',
          files: [txtFile],
        });
        showToast(translations[language].share_success || 'Shared successfully!');
        return;
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('Error sharing TXT file:', error);
      }
    } else {
      // 3. If file sharing is not possible at all, fall back to downloading the file
      try {
        if (pngBlob) {
          downloadFile(pngBlob, `AgriAssist_Report_${Date.now()}.png`);
          showToast('Report downloaded successfully!');
        } else {
          downloadFile(txtBlob, `AgriAssist_Report_${Date.now()}.txt`);
          showToast('Text report downloaded successfully!');
        }
        return;
      } catch (downloadError) {
        console.error('Error downloading file:', downloadError);
      }
    }

    // Ultimate Fallback: Just share text or copy to clipboard
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AgriAssist AI Analysis',
          text: shareText,
        });
        showToast(translations[language].share_success || 'Shared successfully!');
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error('Error sharing text:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast(translations[language].share_success || 'Copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        showToast(translations[language].share_error || 'Failed to share.');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    if (chatMessages.length > 1 && result) {
      const newConv = {
        id: Date.now(),
        date: new Date().toISOString(),
        plantType: result.plantType,
        disease: result.disease,
        messages: [...chatMessages]
      };
      setPastConversations(prev => {
        const updated = [newConv, ...prev].slice(0, 20); // keep last 20
        localStorage.setItem('agribot_history', JSON.stringify(updated));
        return updated;
      });
    }

    setIsAnalyzing(true);
    setError(null);
    setLocationError(null);
    setIsSlowNetwork(false);

    // Try to get location before analyzing
    let currentLocation = userLocation;
    if (!currentLocation && navigator.geolocation && isOnline) {
      try {
        const pos: any = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        
        currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        
        // Try to get location name
        try {
          const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lng}&zoom=10&addressdetails=1`, {
            headers: { 'User-Agent': 'AgriAssist-Hackathon-App' }
          });
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            const areaName = geoData.address?.city || geoData.address?.county || geoData.address?.state;
            if (areaName) {
              currentLocation.name = areaName;
            }
          }
        } catch (e) {
          console.warn("Could not fetch location name");
        }
        
        setUserLocation(currentLocation);
        if (currentLocation) {
          fetchWeather(currentLocation.lat, currentLocation.lng);
        }
      } catch (err) {
        console.warn("Location access denied or timed out. Proceeding without location.");
        setLocationError("Location access denied. Analysis will not include regional climate factors.");
      }
    }
    
    try {
      let base64data = "";
      let mimeType = selectedImage?.type || "image/jpeg";

      if (selectedImage) {
        try {
          const compressedData = await compressImage(selectedImage);
          base64data = compressedData.split(',')[1];
        } catch (err) {
          console.error("Compression Error:", err);
          setError("Failed to compress image. Please try again.");
          setIsAnalyzing(false);
          return;
        }
      } else if (previewUrl?.startsWith('data:')) {
        base64data = previewUrl.split(',')[1];
        const match = previewUrl.match(/^data:(.*);base64,/);
        if (match) mimeType = match[1];
      }

      const imageHash = getImageHash(base64data);
      
      // Check cache first if offline or slow
      const checkCache = () => {
        const cachedResults = localStorage.getItem('agriassist_analysis_cache');
        if (cachedResults) {
          const cache = JSON.parse(cachedResults);
          if (cache[imageHash]) {
            return { ...cache[imageHash], isFromCache: true };
          }
        }
        return null;
      };

      const getMockResult = () => {
        const preCachedDiseases = [
          {
            isClear: true,
            plantType: "Tomato",
            disease: "Early Blight",
            confidence: 0.85,
            remedies: [
              "Remove and destroy infected leaves.",
              "Apply copper-based fungicide.",
              "Ensure proper spacing for air circulation."
            ],
            prevention: [
              "Water at the base of the plant to keep leaves dry.",
              "Rotate crops every year.",
              "Use mulch to prevent soil splashing."
            ],
            soilFertilityLevel: "Medium",
            soilFertilityRecommendations: "Consider adding organic compost and a balanced NPK fertilizer to support fruit development.",
            isOfflineMock: true
          },
          {
            isClear: true,
            plantType: "Wheat",
            disease: "Leaf Rust",
            confidence: 0.92,
            remedies: [
              "Apply appropriate foliar fungicides.",
              "Monitor fields regularly for early detection."
            ],
            prevention: [
              "Plant rust-resistant wheat varieties.",
              "Eradicate volunteer wheat which can harbor the disease.",
              "Adjust planting dates if possible."
            ],
            soilFertilityLevel: "High",
            soilFertilityRecommendations: "The soil appears well-suited for wheat, but ensure adequate nitrogen levels during the growing season.",
            isOfflineMock: true
          },
          {
            isClear: true,
            plantType: "Corn",
            disease: "Northern Corn Leaf Blight",
            confidence: 0.88,
            remedies: [
              "Apply fungicide if disease is severe and spreading.",
              "Harvest early if crop is mature to minimize losses."
            ],
            prevention: [
              "Plant resistant hybrids.",
              "Practice crop rotation.",
              "Tillage to bury infected crop residue."
            ],
            soilFertilityLevel: "High",
            soilFertilityRecommendations: "Corn is a heavy feeder; maintain high nitrogen levels and consider side-dressing with urea if leaves yellow.",
            isOfflineMock: true
          }
        ];

        // Use a simple hash of the image data to pick a consistent mock result
        let hash = 0;
        const urlToHash = previewUrl || '';
        for (let i = 0; i < Math.min(urlToHash.length, 1000); i++) {
          hash = ((hash << 5) - hash) + urlToHash.charCodeAt(i);
          hash |= 0; 
        }
        const index = Math.abs(hash) % preCachedDiseases.length;
        return preCachedDiseases[index];
      };

      if (!isOnline) {
        const cached = checkCache();
        if (cached) {
          setResult(cached);
        } else {
          setResult(getMockResult());
        }
        setIsAnalyzing(false);
        return;
      }

      // Online analysis with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setIsSlowNetwork(true);
      }, 10000);

      try {
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : 'demo-token-123';
        const response = await fetch('/api/disease/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            imageBase64: base64data,
            mimeType: mimeType,
            location: currentLocation,
            temperature: currentTemperature,
            language: language
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to analyze image');
        }
        
        // Save to cache
        const cachedResults = localStorage.getItem('agriassist_analysis_cache');
        const cache = cachedResults ? JSON.parse(cachedResults) : {};
        cache[imageHash] = data;
        // Limit cache size (keep last 50)
        const keys = Object.keys(cache);
        if (keys.length > 50) {
          delete cache[keys[0]];
        }
        localStorage.setItem('agriassist_analysis_cache', JSON.stringify(cache));

        const getInitialMessage = () => {
          switch(language) {
            case 'hi': return `नमस्ते! मैंने आपकी छवि का विश्लेषण किया है। यह ${data.plantType} के साथ ${data.disease} जैसा लग रहा है। मैं आपकी और कैसे सहायता कर सकता हूँ?`;
            case 'es': return `¡Hola! He analizado tu imagen. Parece ser ${data.plantType} con ${data.disease}. ¿Cómo puedo ayudarte más?`;
            case 'fr': return `Bonjour ! J'ai analysé votre image. Il semble s'agir de ${data.plantType} avec ${data.disease}. Comment puis-je vous aider davantage ?`;
            case 'gu': return `નમસ્તે! મેં તમારી છબીનું વિશ્લેષણ કર્યું છે. તે ${data.plantType} સાથે ${data.disease} જેવું લાગે છે. હું તમને વધુ કેવી રીતે મદદ કરી શકું?`;
            default: return `Hello! I've analyzed your image. It looks like ${data.plantType} with ${data.disease}. How can I help you further?`;
          }
        };
        
        setResult(data);
        setChatMessages([{ role: 'bot', content: getInitialMessage() }]);
        setIsAnalyzing(false);

        // Save to Firestore
        if (auth.currentUser) {
          try {
            let finalImageUrl = previewUrl;
            
            // Upload to Firebase Storage if it's a base64 string
            if (previewUrl && previewUrl.startsWith('data:image')) {
              try {
                const storageRef = ref(storage, `users/${auth.currentUser.uid}/analyses/${Date.now()}.jpg`);
                await uploadString(storageRef, previewUrl, 'data_url');
                finalImageUrl = await getDownloadURL(storageRef);
              } catch (storageError) {
                console.error("Failed to upload image to Storage:", storageError);
                // Fallback to base64 if storage fails
              }
            }

            await addDoc(collection(db, `users/${auth.currentUser.uid}/analyses`), {
              plantType: data.plantType,
              disease: data.disease,
              confidence: data.confidence,
              remedies: data.remedies,
              prevention: data.prevention,
              timestamp: serverTimestamp(),
              language: language,
              imageUrl: finalImageUrl
            });
          } catch (dbError) {
            console.error("Failed to save analysis to Firestore:", dbError);
          }
        }

      } catch (err: any) {
        if (err.name === 'AbortError' || !isOnline) {
          const cached = checkCache();
          if (cached) {
            setResult(cached);
          } else {
            setResult(getMockResult());
          }
        } else {
          throw err;
        }
        setIsAnalyzing(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
      setIsAnalyzing(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !result || isChatting) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage = chatInput.trim();
    
    setInputHistory(prev => {
      if (prev.length > 0 && prev[prev.length - 1] === userMessage) {
        return prev;
      }
      return [...prev, userMessage];
    });
    setHistoryIndex(-1);
    setDraftInput('');
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatting(true);

    try {
      let base64data = "";
      let mimeType = selectedImage?.type || "image/jpeg";

      if (selectedImage) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => {
            base64data = (reader.result as string).split(',')[1];
            resolve(null);
          };
          reader.readAsDataURL(selectedImage);
        });
      } else if (previewUrl?.startsWith('data:')) {
        base64data = previewUrl.split(',')[1];
        const match = previewUrl.match(/^data:(.*);base64,/);
        if (match) mimeType = match[1];
      }

      if (!isOnline) {
        const mockReply = language === 'hi' ? "मैं अभी ऑफलाइन हूँ, लेकिन मैं आपकी पिछली जानकारी के आधार पर मदद कर सकता हूँ।" : 
                          language === 'gu' ? "હું અત્યારે ઓફલાઇન છું, પરંતુ હું તમારી અગાઉની માહિતીના આધારે મદદ કરી શકું છું." :
                          "I am currently offline, but I can help based on your previous analysis results.";
        setChatMessages(prev => [...prev, { role: 'bot', content: mockReply }]);
        setIsChatting(false);
        return;
      }

      const token = auth.currentUser ? await auth.currentUser.getIdToken() : 'demo-token-123';
      const response = await fetch('/api/disease/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          context: result,
          message: userMessage,
          location: userLocation,
          imageBase64: base64data,
          mimeType: mimeType,
          language: language
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setChatMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'bot', content: `Sorry, I encountered an error processing your request: ${err.message}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F0D] text-slate-800 dark:text-slate-200 font-sans selection:bg-emerald-500/30 relative flex flex-col overflow-x-hidden">
      {/* Offline Banner */}
      <AnimatePresence>
        {(!isOnline || isSlowNetwork) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`fixed top-0 w-full z-[100] ${isOnline ? 'bg-amber-500' : 'bg-red-500'} text-white py-2 px-4 flex items-center justify-center gap-3 shadow-lg`}
          >
            {isOnline ? <WifiOff className="w-4 h-4 animate-pulse" /> : <CloudOff className="w-4 h-4" />}
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <span className="font-bold text-sm">
                {isOnline ? translations[language].slow_network : translations[language].offline_mode}
              </span>
              <span className="text-xs opacity-90">
                {isOnline ? translations[language].slow_desc : translations[language].offline_desc}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Status Banner */}
      <AnimatePresence>
        {apiStatus && (apiStatus.isMock || !apiStatus.hasKey) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 w-full z-[100] bg-amber-600 text-white py-2 px-4 flex items-center justify-center gap-3 shadow-lg"
            style={{ marginTop: (!isOnline || isSlowNetwork) ? '48px' : '0' }}
          >
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <span className="font-bold text-sm">
                {apiStatus.isMock ? 'Gemini API: Demo Mode Active' : 'Gemini API: Configuration Required'}
              </span>
              <span className="text-xs opacity-90">
                {apiStatus.isMock 
                  ? 'The application is using simulated AI responses due to an invalid or leaked API key.' 
                  : 'Please configure a valid GEMINI_API_KEY in your environment variables.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Hover Glow Effect - Optimized with CSS variables */}
      <div 
        ref={glowRef}
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--x, -1000px) var(--y, -1000px), rgba(16, 185, 129, 0.08), transparent 40%)`
        }}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg shadow-emerald-500/25 font-medium text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0A0F0D]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('overview')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveTab('overview');
              }
            }}
          >
            <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <Leaf className="w-6 h-6 text-slate-900 dark:text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AgriAssist<span className="text-emerald-600 dark:text-emerald-400">.AI</span></span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10"
          >
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 w-36 flex items-center justify-center whitespace-nowrap ${activeTab === 'overview' ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
            >
              {translations[language].nav_overview}
            </button>
            <button 
              onClick={() => setActiveTab('demo')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 w-36 whitespace-nowrap ${activeTab === 'demo' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`}
            >
              <Play className="w-4 h-4" /> {translations[language].nav_demo}
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-sm"
              aria-label="Toggle Theme"
            >
              <motion.div
                key={theme}
                initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </motion.div>
            </button>
            <div className="relative flex-shrink-0" ref={langRef}>
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Select Language"
                aria-haspopup="true"
                aria-expanded={isLangOpen}
                className="h-10 flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 backdrop-blur-md px-3 rounded-xl border border-slate-200 dark:border-white/10 transition-all duration-300 group whitespace-nowrap shadow-sm"
              >
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span className="text-slate-900 dark:text-white text-sm font-medium uppercase">{language}</span>
                <ChevronDown className={`w-3 h-3 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-40 bg-white/90 dark:bg-[#0A0F0D]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                  >
                    <div className="p-1.5">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as any);
                            setIsLangOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                            language === lang.code 
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold' 
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:text-white'
                          }`}
                        >
                          <span>{lang.native}</span>
                          {language === lang.code && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`h-10 flex items-center gap-2 px-3 rounded-full text-xs font-medium border transition-colors ${
              backendStatus === 'online' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
              backendStatus === 'offline' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
            }`}>
              <Activity className="w-3 h-3" />
              <span className="hidden sm:inline">{backendStatus === 'online' ? translations[language].api_online : translations[language].api_offline}</span>
            </div>

            {/* Auth Section */}
            {!isAuthLoading && (
              <div className="flex items-center">
                {user ? (
                  <div className="h-10 flex items-center gap-3 bg-slate-100 dark:bg-white/5 pl-2 pr-4 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                      {user.displayName || user.email}
                    </span>
                    <button 
                      onClick={handleSignOut}
                      className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:text-red-400 transition-colors"
                      title={translations[language].sign_out || "Sign Out"}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleSignIn}
                    className="h-10 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 rounded-full text-sm font-medium transition-colors shadow-lg shadow-emerald-500/25 whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="hidden sm:inline">{translations[language].sign_in || "Sign In"}</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Section */}
              <div className="py-20 text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-emerald-500/20 rounded-full blur-[80px] md:blur-[120px] -z-10 pointer-events-none" />
                
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8"
                >
                  <Target className="w-4 h-4" />
                  Google Solution Challenge 2026
                </motion.div>
                
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight"
                  >
                    {translations[language].hero_title} <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      {translations[language].hero_title_accent}
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                  >
                    {translations[language].hero_subtitle}
                  </motion.p>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-4 relative z-40"
                  >
                    <motion.button 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('demo')}
                      className="px-8 py-4 rounded-full bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
                    >
                      {translations[language].btn_try_demo} <ArrowRight className="w-5 h-5" />
                    </motion.button>
                    <motion.a 
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      href="https://github.com/modimihir07/AgriAssist-AI.git" 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-8 py-4 rounded-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold text-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <Github className="w-5 h-5" /> {translations[language].btn_view_source}
                    </motion.a>
                </motion.div>
              </div>

              {/* UN SDGs Section */}
              <div className="py-16 relative z-40">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">{translations[language].sdg_title}</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { num: "2", title: "Zero Hunger", desc: "Preventing crop loss through early disease detection to ensure food security.", color: "from-yellow-500/20 to-amber-600/20", border: "border-yellow-500/30", text: "text-yellow-400", link: "https://sdgs.un.org/goals/goal2" },
                    { num: "12", title: "Responsible Consumption", desc: "Optimizing pesticide use by providing targeted, AI-driven treatment plans.", color: "from-orange-500/20 to-red-600/20", border: "border-orange-500/30", text: "text-orange-400", link: "https://sdgs.un.org/goals/goal12" },
                    { num: "13", title: "Climate Action", desc: "Building resilient agricultural practices against climate-induced plant diseases.", color: "from-emerald-500/20 to-green-600/20", border: "border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400", link: "https://sdgs.un.org/goals/goal13" }
                  ].map((sdg, i) => (
                    <motion.a 
                      href={sdg.link}
                      target="_blank"
                      rel="noreferrer"
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`block p-8 rounded-3xl bg-gradient-to-br ${sdg.color} border ${sdg.border} backdrop-blur-sm group cursor-pointer relative overflow-hidden`}
                    >
                      <ExternalLink className={`absolute top-6 right-6 w-5 h-5 ${sdg.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className={`text-5xl font-black ${sdg.text} opacity-50 mb-4 transition-transform group-hover:scale-110 origin-left`}>SDG {sdg.num}</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{sdg.title}</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{sdg.desc}</p>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Tech Stack Bento Grid */}
              <div className="py-16 relative z-40">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">{translations[language].tech_title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
                  <motion.a 
                    href="https://flutter.dev" target="_blank" rel="noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="block md:col-span-2 md:row-span-2 bg-white dark:bg-[#1A1F1C] rounded-3xl p-8 border border-slate-200 dark:border-white/5 relative overflow-hidden group cursor-pointer"
                  >
                    <ExternalLink className="absolute top-6 right-6 w-5 h-5 text-slate-900 dark:text-white/20 group-hover:text-blue-400 transition-colors" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
                    <Smartphone className="w-12 h-12 text-blue-400 mb-6 group-hover:scale-110 transition-transform origin-left" />
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Flutter Frontend</h3>
                    <p className="text-slate-500 dark:text-slate-400">Cross-platform mobile application built with Material 3 design. Features offline caching via Hive, local localization (English/Hindi), and seamless camera integration.</p>
                  </motion.a>
                  
                  <motion.a 
                    href="https://nodejs.org" target="_blank" rel="noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="block md:col-span-2 bg-white dark:bg-[#1A1F1C] rounded-3xl p-8 border border-slate-200 dark:border-white/5 relative overflow-hidden group cursor-pointer"
                  >
                    <ExternalLink className="absolute top-6 right-6 w-5 h-5 text-slate-900 dark:text-white/20 group-hover:text-emerald-600 dark:text-emerald-400 transition-colors" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                    <Server className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform origin-left" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Node.js + Express API</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Robust backend architecture handling rate limiting, request validation, and secure AI model orchestration.</p>
                  </motion.a>

                  <motion.a 
                    href="https://firebase.google.com" target="_blank" rel="noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="block bg-white dark:bg-[#1A1F1C] rounded-3xl p-6 border border-slate-200 dark:border-white/5 flex flex-col justify-center items-center text-center hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group cursor-pointer relative"
                  >
                    <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-slate-900 dark:text-white/20 group-hover:text-amber-600 dark:text-amber-400 transition-colors" />
                    <Database className="w-10 h-10 text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Firebase</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Auth & Firestore</p>
                  </motion.a>

                  <motion.a 
                    href="https://ai.google.dev" target="_blank" rel="noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="block bg-white dark:bg-[#1A1F1C] rounded-3xl p-6 border border-slate-200 dark:border-white/5 flex flex-col justify-center items-center text-center hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group cursor-pointer relative"
                  >
                    <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-slate-900 dark:text-white/20 group-hover:text-purple-400 transition-colors" />
                    <ScanLine className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Gemini Pro</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Multimodal Vision AI</p>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="demo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="py-10 relative z-40"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{translations[language].demo_title}</h2>
                <p className="text-slate-500 dark:text-slate-400">{translations[language].demo_subtitle}</p>
              </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Upload Section */}
                <div className="bg-white dark:bg-[#1A1F1C] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 shrink-0">
                      <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> {translations[language].input_title}
                    </h3>
                    {userLocation && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="truncate max-w-[150px] sm:max-w-none">
                          {userLocation.name ? `Location: ${userLocation.name}` : 'Location Active'}
                        </span>
                        {currentTemperature !== null ? ` • ${currentTemperature}°C` : !isWeatherAvailable ? ' • –' : ''}
                      </div>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    onClick={(e) => { e.currentTarget.value = ''; }}
                  />

                  {!previewUrl ? (
                    <motion.div 
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                    >
                      <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-slate-900 dark:text-white font-medium mb-1">Click to upload leaf image</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Supports JPG, PNG (Max 10MB)</p>
                    </motion.div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden h-80 bg-slate-200/50 dark:bg-black/50 border border-slate-200 dark:border-white/10">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      
                      {isAnalyzing && (
                        <motion.div 
                          initial={{ top: 0 }}
                          animate={{ top: '100%' }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_5px_rgba(16,185,129,0.5)] z-10"
                        />
                      )}
                      
                      <button 
                        onClick={() => { 
                          if (chatMessages.length > 1 && result) {
                            const newConv = {
                              id: Date.now(),
                              date: new Date().toISOString(),
                              plantType: result.plantType,
                              disease: result.disease,
                              messages: [...chatMessages]
                            };
                            setPastConversations(prev => {
                              const updated = [newConv, ...prev].slice(0, 20);
                              localStorage.setItem('agribot_history', JSON.stringify(updated));
                              return updated;
                            });
                          }
                          setPreviewUrl(null); 
                          setSelectedImage(null); 
                          setResult(null); 
                          setChatMessages([]);
                        }}
                        className="absolute top-4 right-4 bg-slate-200/50 dark:bg-black/50 backdrop-blur-md text-slate-900 dark:text-white px-3 py-1 rounded-full text-xs hover:bg-slate-300/80 dark:hover:bg-black/80 transition-colors cursor-pointer"
                        disabled={isAnalyzing}
                      >
                        Change Image
                      </button>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: selectedImage && !isAnalyzing ? 1.02 : 1 }} 
                    whileTap={{ scale: selectedImage && !isAnalyzing ? 0.98 : 1 }}
                    onClick={handleAnalyze}
                    disabled={!selectedImage || isAnalyzing}
                    className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                      !selectedImage ? 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 cursor-not-allowed' : 
                      isAnalyzing ? 'bg-emerald-500/50 text-white cursor-wait' : 
                      'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 cursor-pointer'
                    }`}
                  >
                    {isAnalyzing ? (
                      <><ScanLine className="w-5 h-5 animate-spin" /> Analyzing with Gemini...</>
                    ) : (
                      <><Sprout className="w-5 h-5" /> Analyze Crop</>
                    )}
                  </motion.button>
                </div>

                {/* Results Section */}
                <div id="analysis-report" className="bg-white dark:bg-[#1A1F1C] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" data-html2canvas-ignore>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 shrink-0">
                      <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> {translations[language].results_title || "Analysis Results"}
                    </h3>
                    {result && result.isClear && (
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors w-fit"
                        title={translations[language].share_results || "Share Results"}
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{translations[language].share_results || "Share"}</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Title for the report (only visible in canvas) */}
                  <div className="hidden" data-html2canvas-show>
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
                      <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-2 rounded-xl">
                        <Leaf className="w-6 h-6 text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">AgriAssist<span className="text-emerald-600 dark:text-emerald-400">.AI</span> Report</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date().toLocaleString()}</p>
                      </div>
                    </div>
                    {previewUrl && (
                      <div className="mb-6 rounded-2xl overflow-hidden h-64 bg-slate-200/50 dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                        <img src={previewUrl} alt="Analyzed Crop" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    {(result as any)?.soilFertilityLevel && (
                      <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <h4 className="text-amber-600 dark:text-amber-400 font-bold mb-2">Soil Fertility: {(result as any).soilFertilityLevel}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">{(result as any).soilFertilityRecommendations}</p>
                      </div>
                    )}
                  </div>

                  {!result && !error && !isAnalyzing && (
                    <div className="h-80 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-center">
                      <ScanLine className="w-12 h-12 mb-4 opacity-20" />
                      <p>Upload an image and click analyze to see<br/>AI-generated insights here.</p>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="h-80 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">Consulting Agricultural AI Model...</p>
                    </div>
                  )}

                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </motion.div>
                  )}

                  {locationError && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{locationError}</p>
                    </motion.div>
                  )}

                  {result && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {!result.isClear ? (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="p-8 bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-500/30 rounded-3xl text-center relative overflow-hidden shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500 animate-pulse" />
                          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500 animate-bounce" />
                          <h4 className="font-black text-3xl mb-2 tracking-tight text-red-500">INVALID INPUT!</h4>
                          <p className="text-red-200/90 font-medium text-lg mb-2">Please upload a clear image of a plant or crop leaf.</p>
                          <p className="text-red-300/60 text-sm">Our AI is specifically trained for agricultural analysis and cannot process other types of images.</p>
                        </motion.div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between pb-6 border-b border-slate-200 dark:border-white/10">
                            <div>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Identified Crop</p>
                              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{result.plantType}</h4>
                              {(result.isMock || result.isFromCache || result.isOfflineMock) && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {result.isMock && (
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                                      result.quotaExceeded 
                                        ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' 
                                        : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                                    }`}>
                                      {result.quotaExceeded ? 'AI Quota Exceeded (Showing Simulation)' : 'Mock Data (API Key Missing/Invalid)'}
                                    </span>
                                  )}
                                  {result.isFromCache && (
                                    <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                      <Database className="w-3 h-3" /> {translations[language].cached_result}
                                    </span>
                                  )}
                                  {result.isOfflineMock && (
                                    <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                      <CloudOff className="w-3 h-3" /> {translations[language].offline_mock}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Status</p>
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                                result.disease === 'Healthy' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'
                              }`}>
                                {result.disease === 'Healthy' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                {result.disease}
                              </div>
                            </div>
                          </div>

                          {userLocation && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                              <Globe className="w-4 h-4 text-emerald-500" />
                              <span>Location: <span className="text-slate-800 dark:text-slate-200 font-medium">{userLocation.name || `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`}</span>{currentTemperature !== null ? ` • 🌡️ ${currentTemperature}°C` : !isWeatherAvailable ? ' • 🌡️ –' : ''}</span>
                            </div>
                          )}

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-500 dark:text-slate-400">AI Confidence Score</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${result.confidence * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                              />
                            </div>
                          </div>

                          {result.disease !== 'Healthy' && (
                            <div className="space-y-4">
                              <div className="flex justify-end">
                                <a 
                                  href={`https://www.google.com/search?q=${encodeURIComponent(`${result.plantType} ${result.disease} treatment`)}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" /> Read more about {result.disease}
                                </a>
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                  <Droplets className="w-4 h-4 text-blue-400" /> Recommended Remedies
                                </h5>
                                <ul className="space-y-2">
                                  {result.remedies?.map((remedy: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/5">
                                      {remedy}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Prevention Strategies
                                </h5>
                                <ul className="space-y-2">
                                  {result.prevention?.map((prev: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/5">
                                      {prev}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Pest Detection Section */}
                          <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                            {result.pestName ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{translations[language].detected_pest}</p>
                                    <h5 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                      <Bug className="w-5 h-5 text-amber-600 dark:text-amber-400" /> {result.pestName}
                                    </h5>
                                  </div>
                                  {result.pestConfidence > 0 && (
                                    <div className="text-right">
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pest Confidence</p>
                                      <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{(result.pestConfidence * 100).toFixed(0)}%</span>
                                    </div>
                                  )}
                                </div>
                                
                                {result.pestRemedies && result.pestRemedies.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" /> {translations[language].pest_remedies}
                                    </h5>
                                    <ul className="space-y-2">
                                      {result.pestRemedies.map((remedy: string, i: number) => (
                                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 bg-amber-500/5 px-4 py-2 rounded-lg border border-amber-500/10">
                                          {remedy}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                                {translations[language].no_pests_detected}
                              </div>
                            )}
                          </div>

                          {/* Soil Fertility Section */}
                          {result.soilFertilityLevel && (
                            <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-4">
                              <div className="space-y-4">
                                <div>
                                  <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Soil Fertility & Recommendations
                                  </h5>
                                  <div className={`text-sm p-4 rounded-xl border leading-relaxed ${
                                    result.soilFertilityLevel?.toLowerCase() === 'high' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-100' :
                                    result.soilFertilityLevel?.toLowerCase() === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-100' :
                                    result.soilFertilityLevel?.toLowerCase() === 'low' ? 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-100' :
                                    'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-300'
                                  }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-bold uppercase tracking-wider text-xs opacity-80">Level:</span>
                                      <span className={`font-bold ${
                                        result.soilFertilityLevel?.toLowerCase() === 'high' ? 'text-emerald-600 dark:text-emerald-400' :
                                        result.soilFertilityLevel?.toLowerCase() === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                                        result.soilFertilityLevel?.toLowerCase() === 'low' ? 'text-red-600 dark:text-red-400' :
                                        'text-slate-500 dark:text-slate-400'
                                      }`}>{result.soilFertilityLevel}</span>
                                    </div>
                                    <p className="opacity-90">{result.soilFertilityRecommendations}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Chat Section */}
              {result && result.isClear && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 max-w-5xl mx-auto bg-white dark:bg-[#1A1F1C] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col h-[500px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> AgriBot Assistant
                      {apiStatus && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          apiStatus.liveMode 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {apiStatus.liveMode ? 'LIVE' : 'DEMO MODE'}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="relative" ref={chatLangRef}>
                        <button 
                          onClick={() => setIsChatLangOpen(!isChatLangOpen)}
                          aria-label="Select Language"
                          aria-haspopup="true"
                          aria-expanded={isChatLangOpen}
                          className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 transition-all duration-300 group"
                        >
                          <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform" />
                          <span className="text-slate-900 dark:text-white text-xs font-medium uppercase">{language}</span>
                          <ChevronDown className={`w-3 h-3 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isChatLangOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isChatLangOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-40 bg-white/90 dark:bg-[#0A0F0D]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                            >
                              <div className="p-1.5">
                                {languages.map((lang) => (
                                  <button
                                    key={lang.code}
                                    onClick={() => {
                                      setLanguage(lang.code as any);
                                      setIsChatLangOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
                                      language === lang.code 
                                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:text-white'
                                    }`}
                                  >
                                    <span>{lang.native}</span>
                                    {language === lang.code && <Check className="w-3 h-3" />}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {pastConversations.length > 0 && (
                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {showHistory ? 'Back to Chat' : 'View History'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {showHistory ? (
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
                      {pastConversations.map((conv) => (
                        <div key={conv.id} className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{conv.plantType} - {conv.disease}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(conv.date).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-3">
                            {conv.messages.slice(1).map((msg: any, i: number) => (
                              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                                  msg.role === 'user' 
                                    ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' 
                                    : 'bg-slate-200/40 dark:bg-black/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5'
                                }`}>
                                  <span className="font-bold text-xs opacity-50 mb-1 block">
                                    {msg.role === 'user' ? 'You' : 'AgriBot'}
                                  </span>
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl relative group ${
                              msg.role === 'user' 
                                ? 'bg-emerald-500 text-white rounded-br-sm' 
                                : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-bl-sm'
                            }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              
                              <div className={`absolute top-2 ${msg.role === 'user' ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
                                <button 
                                  onClick={() => handleCopyMessage(msg.content)}
                                  className="p-1.5 bg-slate-200/50 dark:bg-black/50 rounded-lg hover:bg-slate-300/70 dark:hover:bg-black/70 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors relative"
                                  title="Copy message"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  {copySuccess && (
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                                      Copied!
                                    </span>
                                  )}
                                </button>
                                {msg.role === 'bot' && (
                                  <button 
                                    onClick={() => toggleSpeaking(msg.content, i)}
                                    className={`p-1.5 rounded-lg transition-colors relative ${
                                      isSpeaking === i ? 'bg-emerald-500 text-white' : 'bg-slate-200/50 dark:bg-black/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-300/70 dark:hover:bg-black/70'
                                    }`}
                                    title={isSpeaking === i ? "Stop speaking" : "Read aloud"}
                                  >
                                    {isSpeaking === i ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {msg.role === 'bot' && (
                              <div className="flex items-center gap-2 mt-1 ml-1">
                                <button 
                                  onClick={() => handleReaction(i, '👍')}
                                  className={`text-xs p-1 rounded-md transition-colors flex items-center gap-1 ${msg.reactions?.includes('👍') ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => handleReaction(i, '👎')}
                                  className={`text-xs p-1 rounded-md transition-colors flex items-center gap-1 ${msg.reactions?.includes('👎') ? 'bg-red-500/20 text-red-700 dark:text-red-400' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        {isChatting && (
                          <div className="flex justify-start">
                            <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {['What pesticides should I use?', 'Is this contagious?', 'How much water does it need?'].map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => setChatInput(prompt)}
                            className="text-xs bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>

                      {micError && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{micError}</span>
                          <button onClick={() => setMicError(null)} className="ml-auto hover:text-slate-900 dark:text-white">✕</button>
                        </motion.div>
                      )}

                      <form onSubmit={handleChatSubmit} className="flex gap-2 relative items-end">
                        <div className="flex-grow relative">
                          <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleChatSubmit(e);
                              } else if (e.key === 'ArrowUp') {
                                const target = e.target as HTMLTextAreaElement;
                                if (target.selectionStart === 0 && target.selectionEnd === 0) {
                                  if (inputHistory.length > 0) {
                                    e.preventDefault();
                                    const nextIndex = historyIndex + 1;
                                    if (nextIndex < inputHistory.length) {
                                      if (historyIndex === -1) {
                                        setDraftInput(chatInput);
                                      }
                                      setHistoryIndex(nextIndex);
                                      setChatInput(inputHistory[inputHistory.length - 1 - nextIndex]);
                                    }
                                  }
                                }
                              } else if (e.key === 'ArrowDown') {
                                const target = e.target as HTMLTextAreaElement;
                                if (target.selectionStart === chatInput.length && target.selectionEnd === chatInput.length) {
                                  if (historyIndex > -1) {
                                    e.preventDefault();
                                    const nextIndex = historyIndex - 1;
                                    if (nextIndex === -1) {
                                      setHistoryIndex(-1);
                                      setChatInput(draftInput);
                                    } else {
                                      setHistoryIndex(nextIndex);
                                      setChatInput(inputHistory[inputHistory.length - 1 - nextIndex]);
                                    }
                                  }
                                }
                              }
                            }}
                            placeholder={isListening ? "Listening..." : "Ask AgriBot about this diagnosis... (Press Enter to send)"}
                            disabled={isChatting}
                            rows={1}
                            className="w-full bg-slate-200/50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pr-12 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 resize-none overflow-hidden min-h-[48px]"
                            style={{ height: 'auto' }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              console.log('Mic button clicked');
                              e.preventDefault();
                              toggleListening();
                            }}
                            disabled={isChatting || !((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)}
                            className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-all ${
                              isListening 
                                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                            title={!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) ? "Speech recognition not supported in this browser" : isListening ? "Stop listening" : "Voice input"}
                          >
                            {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isChatting}
                          className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 h-12 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                        >
                          Send
                        </button>
                      </form>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer & License */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0A0F0D]/80 backdrop-blur-md py-8 mt-auto relative z-40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span>© 2026 AgriAssist AI. All rights reserved.</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-6">
            <span>Released under the <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">MIT License</a>.</span>
            <a href="#" className="hover:text-emerald-600 dark:text-emerald-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
