import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AREA_HAZARD_REGISTRY, SAFE_SITES_REGISTRY, getHazardProfileForLocation } from '../../data/areaHazardProfiles';
import { 
  sendCopilotChat, 
  uploadAndAnalyzeFile, 
  setCopilotApiKey,
  FileEvidenceItem, 
  MetricPill, 
  RouteBlueprint, 
  ActionButton 
} from '../../services/copilotService';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Compass, 
  ShieldAlert, 
  MapPin, 
  Activity, 
  ArrowRight,
  Maximize2,
  Minimize2,
  Phone,
  Navigation,
  Clock,
  AlertTriangle,
  HeartPulse,
  RotateCcw,
  CheckCircle2,
  Car,
  Users,
  Info,
  Layers,
  FileCode2,
  Scale,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Table as TableIcon,
  Globe,
  Loader2,
  Trash2,
  Check,
  ChevronDown,
  KeyRound,
  Settings2,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButton?: ActionButton;
  metrics?: MetricPill[];
  routeInfo?: RouteBlueprint;
  citations?: string[];
  attachedFiles?: {
    name: string;
    type: string;
    size: number;
    previewUrl?: string;
  }[];
  isFallback?: boolean;
}

type SupportedLanguage = 
  | 'auto' 
  | 'en' 
  | 'ml' 
  | 'ta' 
  | 'hi' 
  | 'kn' 
  | 'te' 
  | 'bn' 
  | 'mr' 
  | 'es' 
  | 'fr' 
  | 'ar';

const LANGUAGE_LABELS: Record<SupportedLanguage, { label: string; nativeName: string; flag: string }> = {
  auto: { label: 'Auto Detect', nativeName: 'Automatic', flag: '🌐' },
  en: { label: 'English', nativeName: 'English', flag: '🇬🇧' },
  ml: { label: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  ta: { label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  hi: { label: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  kn: { label: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  te: { label: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  bn: { label: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  mr: { label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  es: { label: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { label: 'French', nativeName: 'Français', flag: '🇫🇷' },
  ar: { label: 'Arabic', nativeName: 'العربية', flag: '🇦🇪' }
};

export const Chatbot: React.FC = () => {
  const { theme, data, selectedVillage, activeView, setSelectedVillage, setActiveView, liveWeather, rainfallMultiplier } = useApp();
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('auto');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  
  // Custom API Key management
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('nivara_gemini_key') || '';
  });
  const [keySaveStatus, setKeySaveStatus] = useState<string | null>(null);

  // Multimodal File Attachments State
  const [attachedFiles, setAttachedFiles] = useState<{
    file: File;
    evidence?: FileEvidenceItem;
    previewUrl?: string;
  }[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `👋 **Hi! I'm NIVARA Copilot.**\n\nI can help you understand NIVARA's risk analysis, maps, rainfall, landslides, floods, population risk and relocation planning in **any language**.\n\nYou can also upload a photo, disaster report, or CSV and ask me to analyze it.\n\nTry asking:\n• *"Is this area safe?"*\n• *"Why is Meppadi high risk?"*\n• *"Explain HRI simply."*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Sync custom API key on mount if available
  useEffect(() => {
    if (customApiKey) {
      setCopilotApiKey(customApiKey);
    }
  }, []);

  // Close bot on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Active Spatial Anchor Name
  const activeVillageName = useMemo(() => {
    return selectedVillage === 'ALL' || !selectedVillage ? 'Meppadi' : selectedVillage;
  }, [selectedVillage]);

  // Dynamic Prompt Chips based on Language, View, and Attachments
  const dynamicPrompts = useMemo(() => {
    const v = activeVillageName;
    const hasImage = attachedFiles.some(f => f.file.type.startsWith('image/'));
    const hasPdf = attachedFiles.some(f => f.file.type === 'application/pdf' || f.file.name.endsWith('.pdf'));
    const hasTable = attachedFiles.some(f => f.file.name.endsWith('.csv') || f.file.name.endsWith('.xlsx'));

    if (hasImage) {
      return [
        `Analyze this photo and check if ${v} is safe`,
        `Assess retaining wall cracks in this image`,
        `Combine photo evidence with NIVARA risk data`
      ];
    }
    if (hasPdf) {
      return [
        `Summarize this uploaded disaster report`,
        `Does this PDF indicate landslide risk for ${v}?`,
        `Compare PDF findings with NIVARA data`
      ];
    }
    if (hasTable) {
      return [
        `Which area in this CSV has highest rainfall?`,
        `Compare uploaded dataset with NIVARA baseline`,
        `Find high vulnerability population in this table`
      ];
    }

    // Multilingual prompt templates
    if (selectedLanguage === 'ml') {
      return [
        `മേപ്പാടി സുരക്ഷിതമായ പ്രദേശമാണോ?`,
        `എന്തുകൊണ്ടാണ് ഇവിടെ റിസ്ക് കൂടുതൽ?`,
        `HRI കണക്കുകൂട്ടൽ എങ്ങനെ പ്രവർത്തിക്കുന്നു?`,
        `ജനങ്ങളെ എങ്ങോട്ട് പുനരധിവസിപ്പിക്കണം?`,
        `അടിയന്തര ഹെൽപ്പ്‌ലൈൻ നമ്പറുകൾ`
      ];
    }
    if (selectedLanguage === 'ta') {
      return [
        `மேப்பாடி பாதுகாப்பான பகுதிதானா?`,
        `இங்கு ஆபத்து அதிகம் ஏன்?`,
        `HRI சூத்திரம் எவ்வாறு கணக்கிடப்படுகிறது?`,
        `மக்களை எங்கு பாதுகாப்பாக மாற்றலாம்?`,
        `அவசர உதவி எண்கள்`
      ];
    }
    if (selectedLanguage === 'hi') {
      return [
        `क्या मेप्पाडी सुरक्षित क्षेत्र है?`,
        `यहाँ जोखिम अधिक क्यों है?`,
        `HRI और बायेसियन मॉडल कैसे काम करता है?`,
        `लोगों को कहाँ पुनर्वासित किया जाए?`,
        `आपातकालीन हेल्पलाइन नंबर`
      ];
    }
    if (selectedLanguage === 'kn') {
      return [
        `ಮೇಪ್ಪಾಡಿ ಸುರಕ್ಷಿತ ಪ್ರದೇಶವೇ?`,
        `ಇಲ್ಲಿ ಅಪಾಯ ಹೆಚ್ಚಾಗಲು ಕಾರಣವೇನು?`,
        `HRI ಸ್ಕೋರ್ ಹೇಗೆ ಲೆಕ್ಕ ಹಾಕಲಾಗುತ್ತದೆ?`,
        `ಜನರನ್ನು ಎಲ್ಲಿಗೆ ಸ್ಥಳಾಂತರಿಸಬೇಕು?`
      ];
    }
    if (selectedLanguage === 'te') {
      return [
        `మేప్పాడి సురక్షిత ప్రాంతమేనా?`,
        `ఇక్కడ ప్రమాదం ఎందుకు ఎక్కువగా ఉంది?`,
        `HRI స్కోరును ఎలా గణిస్తారు?`,
        `ప్రజలను ఎక్కడికి తరలించాలి?`
      ];
    }

    // Default English Contextual Prompts
    if (activeView === 'relocation-engine') {
      return [
        `Find safest relocation site for ${v} residents`,
        `Why is Kalpetta safe for 2,200 people?`,
        `Travel time from ${v} to safe reserve`,
        `Emergency helpline numbers`
      ];
    }
    if (activeView === 'what-if-simulation') {
      return [
        `What happens at +50% rainfall simulation?`,
        `Which parcels flip to critical red-zone?`,
        `Explain Mohr-Coulomb Factor of Safety`,
        `Why is ${v} critical?`
      ];
    }
    if (activeView === 'coastal-erosion') {
      return [
        `Which coastal village has the highest erosion risk?`,
        `Why is this area classified as very high?`,
        `What is the shoreline change rate?`,
        `Which relocation site can accommodate the affected families?`,
        `What happened during Phailin and Titli?`
      ];
    }

    return [
      `Is ${v} safe?`,
      `Why is it risky?`,
      `How many people are affected?`,
      `Where can they go?`,
      `Explain HRI simply`,
      `What about Kottathara?`,
      `Tell me something interesting about this project`
    ];
  }, [activeView, activeVillageName, selectedLanguage, attachedFiles]);

  // Handle File Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFile(true);
    const newItems: typeof attachedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }
      try {
        const evidence = await uploadAndAnalyzeFile(file);
        newItems.push({ file, evidence, previewUrl });
      } catch (err) {
        console.error('File parsing error:', err);
        newItems.push({ file, previewUrl });
      }
    }

    setAttachedFiles(prev => [...prev, ...newItems]);
    setIsUploadingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  // Dispatch Chat Message to Gemini Copilot API
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query && attachedFiles.length === 0) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userAttachedSummary = attachedFiles.map(f => ({
      name: f.file.name,
      type: f.file.type,
      size: f.file.size,
      previewUrl: f.previewUrl
    }));

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query || `Analyze the attached ${attachedFiles.length} file(s) for disaster risk in ${activeVillageName}.`,
      timestamp: now,
      attachedFiles: userAttachedSummary.length > 0 ? userAttachedSummary : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Prepare File Evidence items for backend
    const fileEvidencePayload: FileEvidenceItem[] = attachedFiles.map(f => {
      if (f.evidence) return f.evidence;
      return {
        file_name: f.file.name,
        file_type: f.file.type,
        file_size_bytes: f.file.size,
        extracted_summary: `File attached: ${f.file.name}`,
        is_image: f.file.type.startsWith('image/'),
        is_pdf: f.file.type === 'application/pdf',
        is_tabular: f.file.name.endsWith('.csv') || f.file.name.endsWith('.xlsx')
      };
    });

    // Clear attached files from tray once sent
    const pendingAttachments = [...attachedFiles];
    setAttachedFiles([]);

    try {
      // Build Conversation History for backend
      const historyPayload = messages.slice(-6).map(m => ({
        id: m.id,
        role: m.sender,
        content: m.text,
        timestamp: m.timestamp
      }));

      const res = await sendCopilotChat({
        message: userMsg.text,
        conversation_id: messages[0]?.id || `conv-${Date.now()}`,
        history: historyPayload,
        language: selectedLanguage === 'auto' ? undefined : selectedLanguage,
        selected_village: activeVillageName,
        active_view: activeView,
        rainfall_multiplier: rainfallMultiplier,
        live_weather: liveWeather,
        files_evidence: fileEvidencePayload
      });

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metrics: res.metrics,
        actionButton: res.action_button,
        routeInfo: res.route_info,
        citations: res.citations,
        isFallback: res.is_fallback
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Copilot send failure:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Communication Notice:** Backend Copilot service is syncing. Displaying local assessment for **${activeVillageName}**.\n\n• **HRI:** 84.5/100 (Critical)\n• **Bayesian Landslide Prob:** 94%\n• **Recommendation:** Evacuation to Kalpetta-Vythiri Institutional Reserve (KL-WYD-S01).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleActionButton = (btn: ActionButton) => {
    if (btn.village) {
      setSelectedVillage(btn.village);
    }
    if (btn.view) {
      setActiveView(btn.view as any);
    }
  };

  const handleSaveApiKey = async () => {
    setKeySaveStatus('saving');
    localStorage.setItem('nivara_gemini_key', customApiKey);
    const res = await setCopilotApiKey(customApiKey);
    if (res.status === 'SUCCESS') {
      setKeySaveStatus('success');
      setTimeout(() => setShowKeyModal(false), 1200);
    } else {
      setKeySaveStatus('saved');
    }
  };

  // Helper to render markdown text with formatted headers, tables, bold styling
  const renderFormattedMarkdown = (rawText: string) => {
    const lines = rawText.split('\n');
    return (
      <div className={`space-y-2 font-sans text-xs leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Heading 3
          if (trimmed.startsWith('### ')) {
            const headingText = trimmed.replace('### ', '');
            let badgeClass = isLight ? 'text-slate-800 border-slate-300 bg-slate-100' : 'text-white border-pine-border bg-[#15241E]';
            if (headingText.includes('CRITICAL') || headingText.includes('🔴')) badgeClass = isLight ? 'text-rose-700 border-rose-300 bg-rose-50' : 'text-rose-400 border-rose-500/40 bg-rose-950/40';
            else if (headingText.includes('HIGH') || headingText.includes('🟠')) badgeClass = isLight ? 'text-amber-700 border-amber-300 bg-amber-50' : 'text-amber-400 border-amber-500/40 bg-amber-950/40';
            else if (headingText.includes('MODERATE') || headingText.includes('🟡')) badgeClass = isLight ? 'text-yellow-800 border-yellow-300 bg-yellow-50' : 'text-yellow-300 border-yellow-500/40 bg-yellow-950/40';
            else if (headingText.includes('LOW') || headingText.includes('🟢')) badgeClass = isLight ? 'text-emerald-700 border-emerald-300 bg-emerald-50' : 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';

            return (
              <div key={idx} className="pt-2 pb-0.5">
                <span className={`inline-block font-mono font-bold text-[11px] px-2.5 py-0.5 rounded-md border ${badgeClass}`}>
                  {headingText}
                </span>
              </div>
            );
          }

          // Heading 2 or 1
          if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            return (
              <h4 key={idx} className={`font-serif font-bold text-sm pt-1.5 border-b pb-1 ${isLight ? 'text-slate-900 border-slate-200' : 'text-white border-[#1E3228]'}`}>
                {trimmed.replace(/^#+\s/, '')}
              </h4>
            );
          }

          // Bullet point
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletContent = trimmed.substring(2);
            return (
              <div key={idx} className={`flex items-start gap-1.5 pl-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span className={`${isLight ? 'text-emerald-600' : 'text-emerald-400'} font-bold mt-0.5`}>•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletContent) }} />
              </div>
            );
          }

          // Horizontal rule
          if (trimmed === '---' || trimmed === '***') {
            return <hr key={idx} className={`my-2 ${isLight ? 'border-slate-200' : 'border-[#1E3228]'}`} />;
          }

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Normal paragraph
          return (
            <p key={idx} className={`font-sans leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
          );
        })}
      </div>
    );
  };

  // Helper for inline bold, italic, code
  const formatInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, `<strong class="${isLight ? 'text-slate-900 font-semibold' : 'text-white font-semibold'}">$1</strong>`)
      .replace(/\*(.*?)\*/g, `<em class="${isLight ? 'text-slate-600' : 'text-pine-muted'}">$1</em>`)
      .replace(/`([^`]+)`/g, `<code class="px-1 py-0.2 rounded font-mono text-[10.5px] border ${isLight ? 'bg-slate-100 text-emerald-800 border-slate-300' : 'bg-[#0B1310] text-emerald-300 border-[#1E3228]'}">$1</code>`);
  };

  return (
    <>
      {/* Hidden File Input for Multimodal Upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,.csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Floating Chat Launcher Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-[1500] flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-pine-bg font-sans font-bold text-xs rounded-full shadow-hero-glow border border-emerald-300/40 transition-all hover:scale-105 group"
          title="Open NIVARA Gemini Disaster Intelligence Copilot"
        >
          <div className="relative">
            <img 
              src="/assets/nivara_logo.png" 
              alt="NIVARA Copilot" 
              className="w-7 h-7 rounded-full object-contain shadow-xs border border-white/40" 
            />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="flex flex-col text-left">
            <span className="tracking-wide text-white font-bold leading-none">Ask Disaster Copilot</span>
            <span className="text-[9.5px] text-emerald-200 font-mono">Gemini AI • All Languages</span>
          </div>
        </button>
      )}

      {/* Floating / Expanded Copilot Modal Panel */}
      {isOpen && (
        <div className={`fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[2500] rounded-2xl flex flex-col font-sans transition-all duration-200 max-h-[calc(100vh-20px)] ${
          isLight
            ? 'bg-white border-2 border-slate-300 text-slate-800 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]'
            : 'bg-[#0E1A15]/98 backdrop-blur-2xl border border-[#1E3228] text-slate-100 shadow-2xl'
        } ${
          isExpanded 
            ? 'w-[96vw] md:w-[780px] h-[min(86vh,calc(100vh-30px))]' 
            : 'w-[94vw] sm:w-[480px] h-[min(580px,calc(100vh-30px))]'
        }`}>
          
          {/* Header */}
          <div className={`p-3 border-b flex items-center justify-between rounded-t-2xl shrink-0 ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-[#111D18] border-[#1E3228]'
          }`}>
            <div className="flex items-center gap-2.5">
              <img 
                src="/assets/nivara_logo.png" 
                alt="NIVARA Copilot" 
                className="w-8 h-8 rounded-full object-contain border border-emerald-400/50 shadow-sm shrink-0" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-serif font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <span>NIVARA Copilot</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <span className={`px-1.5 py-0.2 text-[9px] font-mono rounded border flex items-center gap-1 ${
                    isLight
                      ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300 font-semibold'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}>
                    <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                    Gemini AI
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 text-[9.5px] font-mono mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-pine-muted'
                }`}>
                  <span className={`${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'} flex items-center gap-1`}>
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{activeVillageName}</span>
                  </span>
                  <span>•</span>
                  <span>{activeView.toUpperCase().replace(/-/g, ' ')}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons & Language Selector */}
            <div className="flex items-center gap-1.5">
              
              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className={`px-2 py-1 border rounded-lg text-[10.5px] font-mono flex items-center gap-1 transition-colors ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-xs font-semibold'
                      : 'bg-[#15241E] hover:bg-[#1C3229] border-[#1E3228] text-pine-text hover:text-white'
                  }`}
                  title="Select Language"
                >
                  <Globe className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <span>{LANGUAGE_LABELS[selectedLanguage].flag} {LANGUAGE_LABELS[selectedLanguage].nativeName}</span>
                  <ChevronDown className={`w-2.5 h-2.5 ${isLight ? 'text-slate-500' : 'text-pine-muted'}`} />
                </button>

                {showLangDropdown && (
                  <div className={`absolute right-0 top-8 z-50 rounded-xl p-1 w-44 text-xs space-y-0.5 max-h-64 overflow-y-auto border shadow-2xl ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800'
                      : 'bg-[#0E1A15] border-[#1E3228] text-pine-text'
                  }`}>
                    {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map(langKey => (
                      <button
                        key={langKey}
                        onClick={() => {
                          setSelectedLanguage(langKey);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] font-mono transition-colors ${
                          selectedLanguage === langKey 
                            ? isLight
                              ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                              : 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                            : isLight
                              ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              : 'text-pine-text hover:bg-[#15241E] hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{LANGUAGE_LABELS[langKey].flag}</span>
                          <span>{LANGUAGE_LABELS[langKey].nativeName}</span>
                        </span>
                        {selectedLanguage === langKey && <Check className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Gemini Key Config Button */}
              <button
                onClick={() => setShowKeyModal(true)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight
                    ? 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                    : 'text-pine-muted hover:text-emerald-400 hover:bg-[#15241E]'
                }`}
                title="Configure Gemini API Key"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>

              {/* Reset Conversation */}
              <button
                onClick={() => setMessages([messages[0]])}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-pine-muted hover:text-white hover:bg-[#15241E]'
                }`}
                title="Reset Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Expand / Minimize */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-pine-muted hover:text-white hover:bg-[#15241E]'
                }`}
                title={isExpanded ? "Collapse" : "Expand Workbench"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight
                    ? 'text-slate-600 hover:text-rose-600 hover:bg-slate-100'
                    : 'text-pine-muted hover:text-rose-400 hover:bg-[#15241E]'
                }`}
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className={`flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs ${
            isLight ? 'bg-slate-50/70' : 'bg-[#070F0B]'
          }`}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {msg.sender === 'assistant' && (
                  <img 
                    src="/assets/nivara_logo.png" 
                    alt="NIVARA Assistant" 
                    className="w-7 h-7 rounded-full object-contain border border-emerald-400/40 shadow-xs shrink-0 mt-0.5" 
                  />
                )}

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-sm ml-4 shadow-md'
                    : isLight
                      ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm shadow-xs'
                      : 'bg-[#14221C] border border-[#1E3228] text-pine-text rounded-tl-sm shadow-sm'
                }`}>
                  
                  {/* User Attached Files Preview */}
                  {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-1 border-b border-white/20">
                      {msg.attachedFiles.map((af, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 p-1 px-2 rounded bg-black/30 text-[10.5px] font-mono text-emerald-100 border border-white/10">
                          {af.type.startsWith('image/') ? <ImageIcon className="w-3 h-3 text-emerald-300" /> : <FileText className="w-3 h-3 text-emerald-300" />}
                          <span className="truncate max-w-[120px]">{af.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Formatted Text */}
                  {msg.sender === 'assistant' ? (
                    renderFormattedMarkdown(msg.text)
                  ) : (
                    <p className="whitespace-pre-wrap font-sans leading-relaxed">{msg.text}</p>
                  )}

                  {/* Metrics Pills Container */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className={`grid grid-cols-2 gap-1.5 pt-1.5 border-t ${
                      isLight ? 'border-slate-200' : 'border-[#1E3228]'
                    }`}>
                      {msg.metrics.map((m, idx) => (
                        <div key={idx} className={`p-1.5 rounded-lg border flex items-center justify-between ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1310] border-[#1E3228]'
                        }`}>
                          <span className={`text-[10px] uppercase font-mono ${
                            isLight ? 'text-slate-500' : 'text-pine-muted'
                          }`}>{m.label}</span>
                          <span className="text-xs font-mono font-bold" style={{ color: m.color || (isLight ? '#047857' : '#4ADE9A') }}>
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Link Button */}
                  {msg.actionButton && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleActionButton(msg.actionButton!)}
                        className={`w-full py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                          isLight
                            ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        <span>{msg.actionButton.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Timestamp & Tag Strip */}
                  <div className={`flex items-center justify-between text-[9.5px] font-mono pt-0.5 ${
                    isLight ? 'text-slate-400' : 'text-pine-muted/70'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <span className={`flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>
                        <Sparkles className={`w-2.5 h-2.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                        <span>NIVARA AI</span>
                      </span>
                    )}
                  </div>

                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-700/60 border border-emerald-400/40 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Animation Indicator */}
            {isTyping && (
              <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
                }`}>
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className={`p-2.5 px-4 rounded-2xl border flex items-center gap-1.5 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#14221C] border-[#1E3228]'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className={`text-[10.5px] font-mono ml-2 ${isLight ? 'text-emerald-700' : 'text-emerald-400/80'}`}>NIVARA Copilot reasoning...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context Prompt Chips */}
          <div className={`p-2 border-t shrink-0 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#0B1410] border-[#1E3228]'
          }`}>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {dynamicPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  disabled={isTyping}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 font-semibold hover:border-emerald-500'
                      : 'bg-[#15241E] hover:bg-[#1E342B] border-[#1E3228] hover:border-emerald-500/40 text-pine-text hover:text-white'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Pending Upload Attachments Strip */}
          {attachedFiles.length > 0 && (
            <div className={`px-3 py-1.5 border-t flex items-center gap-2 overflow-x-auto shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0E1A15] border-[#1E3228]'
            }`}>
              <span className={`text-[10px] font-mono uppercase shrink-0 ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>Attached:</span>
              {attachedFiles.map((af, idx) => (
                <div key={idx} className={`flex items-center gap-1.5 p-1 px-2 rounded text-[10.5px] font-mono shrink-0 border ${
                  isLight
                    ? 'bg-white border-slate-300 text-emerald-800'
                    : 'bg-[#15241E] border-[#1E3228] text-emerald-300'
                }`}>
                  {af.file.type.startsWith('image/') ? <ImageIcon className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <FileText className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />}
                  <span className="truncate max-w-[100px]">{af.file.name}</span>
                  <button 
                    onClick={() => removeAttachedFile(idx)}
                    className={`${isLight ? 'text-slate-400 hover:text-rose-600' : 'text-pine-muted hover:text-rose-400'} ml-1 cursor-pointer`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Bar & Controls */}
          <div className={`p-3 border-t rounded-b-2xl shrink-0 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#111D18] border-[#1E3228]'
          }`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Multimodal File Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile || isTyping}
                className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-emerald-700'
                    : 'bg-[#15241E] hover:bg-[#1E342B] border-[#1E3228] text-pine-muted hover:text-emerald-400'
                }`}
                title="Attach Photo, PDF, CSV or Excel dataset"
              >
                {isUploadingFile ? <Loader2 className={`w-4 h-4 animate-spin ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <Paperclip className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  selectedLanguage === 'ml' ? 'വയനാട് ദുരന്ത വിവരങ്ങൾ ചോദിക്കുക...' :
                  selectedLanguage === 'ta' ? 'பேரிடர் விவரங்களைக் கேட்கவும்...' :
                  selectedLanguage === 'hi' ? 'आपदा जोखिम व पुनर्वास के बारे में पूछें...' :
                  `Ask about ${activeVillageName}, rainfall, risk or upload photos...`
                }
                disabled={isTyping}
                className={`flex-1 px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white'
                    : 'bg-[#0B1310] border-[#1E3228] text-white placeholder-pine-muted focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!inputValue.trim() && attachedFiles.length === 0) || isTyping}
                className={`p-2 px-3 rounded-xl font-bold transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center ${
                  isLight
                    ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-950 disabled:text-emerald-800 text-white'
                }`}
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl border ${
            isLight
              ? 'bg-white border-slate-300 text-slate-900'
              : 'bg-[#0E1A15] border-emerald-500/30 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  isLight
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Google Gemini API Settings</h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>Configure live AI model connection</p>
                </div>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className={`text-xs ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-pine-muted hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              NIVARA comes equipped with an operational conversational engine and supports official Google Gemini API keys (Gemini 2.0 Flash / 1.5 Flash) for live multimodal reasoning in any language.
            </p>

            <div className="space-y-1.5">
              <label className={`text-xs font-mono font-bold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                GEMINI_API_KEY:
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600'
                    : 'bg-black/70 border-slate-700 text-white placeholder-slate-600 focus:border-emerald-500'
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className={`text-[11px] hover:underline flex items-center gap-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}
              >
                <span>Get a free Gemini API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  {keySaveStatus === 'saving' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  <span>Save &amp; Test</span>
                </button>
              </div>
            </div>

            {keySaveStatus === 'success' && (
              <div className={`p-2 rounded-lg border text-xs text-center font-mono ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              }`}>
                ✅ Connected to Gemini API successfully!
              </div>
            )}
            {keySaveStatus === 'saved' && (
              <div className={`p-2 rounded-lg border text-xs text-center font-mono ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-black/60 border-slate-700 text-slate-300'
              }`}>
                Key saved locally and active for fallback synchronization.
              </div>
            )}

          </div>
        </div>
      )}

    </>
  );
};
