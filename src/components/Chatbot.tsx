import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AREA_HAZARD_REGISTRY, SAFE_SITES_REGISTRY, getHazardProfileForLocation } from '../data/areaHazardProfiles';
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
  Scale
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    view?: string;
    village?: string;
  };
  metrics?: {
    label: string;
    value: string | number;
    color?: string;
  }[];
  routeInfo?: {
    from: string;
    to: string;
    distance: string;
    normalTime: string;
    emergencyTime: string;
    safeRouteName: string;
    hazardToAvoid: string;
    clearanceStatus: 'SAFE' | 'CAUTION' | 'RESTRICTED';
  };
}

export const Chatbot: React.FC = () => {
  const { data, selectedVillage, activeView, setSelectedVillage, setActiveView } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 **Welcome to the NIVARA Disaster Intelligence Assistant.**\n\nI understand your active workspace and live datasets. Ask me:\n• ⚠️ **Why is this area dangerous?** (slope shear, rain saturation)\n• 🛡️ **Find safest land** (carrying capacity, road access, utilities)\n• ⏱️ **Travel times & safest evacuation routes**\n• 🌧️ **What changes at +50% rain simulation?**\n• 📞 **Emergency helplines & Go-Bag protocol**",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metrics: [
        { label: 'Total Displaced Pop', value: '4,800 People', color: '#E8543E' },
        { label: 'Total Safe Capacity', value: '6,880 People', color: '#4ADE9A' }
      ]
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
  }, [messages, isOpen]);

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

  // Context-aware dynamic prompt chips
  const dynamicPrompts = useMemo(() => {
    const villageName = selectedVillage === 'ALL' ? 'Meppadi' : selectedVillage;
    
    if (activeView === 'relocation-engine') {
      return [
        `Find safest relocation site for 500 people`,
        `Why is Kalpetta safe for relocation?`,
        `Travel time from ${villageName} to safe land`,
        `Emergency helpline numbers`
      ];
    }

    if (activeView === 'what-if-simulation') {
      return [
        `What happens at +50% rainfall?`,
        `Which areas flip to critical red-zone?`,
        `Explain soil liquefaction threshold`,
        `Why is ${villageName} high risk?`
      ];
    }

    if (activeView === 'intelligence-layers') {
      return [
        `Explain InSAR ground movement alerts`,
        `Why is river level rising in Kottathara?`,
        `Emergency helpline numbers`,
        `How to get immediate rescue help`
      ];
    }

    // Default Command Center & Risk Map prompts
    return [
      `Why is ${villageName} high risk?`,
      `Find safest land for relocation`,
      `How much population in ${villageName}?`,
      `What changes at +50% rain?`,
      `Emergency helpline numbers`
    ];
  }, [activeView, selectedVillage]);

  // Universal Domain Knowledge & Question Answering Engine
  const generateResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentLoc = selectedVillage === 'ALL' ? 'Meppadi' : selectedVillage;

    // 1. WHAT HAPPENS AT +50% OR SIMULATION INQUIRIES
    if (q.includes('+50%') || q.includes('50% rain') || q.includes('simulation') || q.includes('what happens at') || q.includes('what changes')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `🌧️ **Simulation Impact at +50% Rainfall Surge (213 mm/24h):**\n\n1. **Red-Zone Expansion:** High-risk cadastral parcels surge from **424 parcels → 610 parcels** (+44% increase).\n2. **Vulnerable Population:** Exposed population jumps from **4,800 → 6,120 persons**.\n3. **Soil Saturation:** Infiltration exceeds **75%**, triggering critical pore water liquefaction along tea estate road cuts.\n4. **New Danger Corridors:** Achooranam slope parcels and Vythiri ghat highway slip edges escalate into active high hazard.`,
        timestamp: now,
        actionButton: { label: 'Open What-If Simulator', view: 'what-if-simulation' },
        metrics: [
          { label: 'High Risk Parcels', value: '610 Parcels', color: '#E8543E' },
          { label: 'Exposed Population', value: '6,120 Persons', color: '#FBBF24' }
        ]
      };
    }

    // 2. FIND SAFEST RELOCATION SITE
    if (q.includes('find safe') || q.includes('safest land') || q.includes('safest site') || q.includes('500 people') || q.includes('relocat')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `🛡️ **Top Recommended Safe Resettlement Site:**\n\n🥇 **Kalpetta-Vythiri Institutional Reserve (Safe Zone D)**\n• **Suitability Score:** **93.4 / 100 (CCAS)**\n• **Safe Capacity:** **2,200 Persons (550 Families)** — comfortably holds 500+ people.\n• **Terrain Stability:** Gentle **3.8° flat slope**, 0% landslide recurrence history, and located 28m above the 100-year flood line.\n• **Infrastructure:** Direct connection to 4-lane **NH-766 Highway**, 100kL overhead water tank, and dedicated 33kV substation feeder.\n• **Transit:** 14.8 km from Meppadi (~28 min convoy).`,
        timestamp: now,
        actionButton: { label: 'Open Relocation Decision Engine', view: 'relocation-engine' },
        metrics: [
          { label: 'CCAS Score', value: '93.4 / 100', color: '#4ADE9A' },
          { label: 'Holding Cap', value: '2,200 People', color: '#38BDF8' }
        ]
      };
    }

    // 3. POPULATION INQUIRIES
    if (q.includes('population') || q.includes('how many people') || q.includes('how much population') || q.includes('census') || q.includes('families')) {
      if (q.includes('meppadi')) {
        return {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `👥 **Population in Meppadi (Epicenter):**\n\n• **Total Panchayat Population (Census 2011):** 24,170 people\n• **Exposed High-Risk Population:** **4,800 persons** in the active red zone (Mundakkai & Chooralmala settlements).\n• **Vulnerable Families:** **250 families** living in critical debris flow channels.\n• **Evacuation Urgency:** **Phase 1 (Immediate)** — 100% of surveyed parcels are in the critical danger tier.`,
          timestamp: now,
          actionButton: { label: 'View Meppadi on Danger Map', view: 'red-zone-map', village: 'Meppadi' },
          metrics: [
            { label: 'Red Zone Pop', value: '4,800 People', color: '#E8543E' },
            { label: 'Evacuation Families', value: '250 Families', color: '#FFFFFF' }
          ]
        };
      }

      if (q.includes('achoor') || q.includes('achooranam')) {
        return {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `👥 **Population in Achooranam:**\n\n• **Total Census Population:** 12,450 people\n• **Exposed High-Risk Population:** **1,240 persons** (77 families on steep tea estate slope edges).\n• **Evacuation Urgency:** Phase 2 (Short-Term).`,
          timestamp: now,
          actionButton: { label: 'View Achooranam on Danger Map', view: 'red-zone-map', village: 'Achooranam' }
        };
      }

      if (q.includes('kottathara')) {
        return {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `👥 **Population in Kottathara:**\n\n• **Total Census Population:** 18,920 people\n• **Exposed High-Risk Population:** **890 persons** (69 families along the Kabini river overflow banks).`,
          timestamp: now,
          actionButton: { label: 'View Kottathara on Danger Map', view: 'red-zone-map', village: 'Kottathara' }
        };
      }

      if (q.includes('kuppadithara')) {
        return {
          id: Date.now().toString(),
          sender: 'assistant',
          text: `👥 **Population in Kuppadithara:**\n\n• **Total Census Population:** 14,200 people\n• **Exposed High-Risk Population:** **320 persons** (28 families in minor drainage dips).\n• **Safe Holding Capacity:** Supports **1,680 displaced persons** on its northern plateau!`,
          timestamp: now,
          actionButton: { label: 'View Kuppadithara on Danger Map', view: 'red-zone-map', village: 'Kuppadithara' }
        };
      }

      // General summary of all 4 study villages
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `👥 **Population Summary Across Wayanad Study Areas:**\n\n1. **Meppadi (Epicenter):** 24,170 total | **4,800 high-risk exposed (250 families)**\n2. **Achooranam:** 12,450 total | **1,240 high-risk exposed (77 families)**\n3. **Kottathara:** 18,920 total | **890 high-risk exposed (69 families)**\n4. **Kuppadithara:** 14,200 total | **320 high-risk exposed (28 families)**\n\n**Total Displaced Load Across Red Zones:** **7,250 persons (424 families)**. Our 5 candidate safe lands provide **6,880 persons** holding capacity for Phase 1!`,
        timestamp: now,
        actionButton: { label: 'Open Relocation Matcher', view: 'relocation-engine' }
      };
    }

    // 4. "WHY IS A PLACE SAFE?"
    if (q.includes('why safe') || q.includes('why is') && (q.includes('safe') || q.includes('good') || q.includes('suitable') || q.includes('kalpetta'))) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `🛡️ **Why Kalpetta-Vythiri Reserve (Safe Zone D) is 100% Safe:**\n\n1. **Gentle Terrain:** Slope angle is only **3.8°**, completely flat and far below the 25° landslide threshold.\n2. **Zero Landslide Recurrence:** Located outside all GSI landslide corridors with only **2% hazard probability**.\n3. **Above 100-Year Flood Line:** Sits on an elevated institutional bench 28 meters above seasonal floodwaters (**3% flood risk**).\n4. **Highway Connectivity:** Direct connection to the 4-lane **NH-766 National Highway** (0 meter buffer).\n5. **Utility Infrastructure:** Existing **100kL overhead municipal water tank** and **33kV substation feeder line** on-site.\n6. **Holding Capacity:** 12.5 Hectares usable land supporting **550 families (2,200 people)** without ecological overdraw.`,
        timestamp: now,
        actionButton: { label: 'View Safe Lands in Relocation Workspace', view: 'relocation-engine' },
        metrics: [
          { label: 'CCAS Score', value: '93.4 / 100', color: '#4ADE9A' },
          { label: 'Slope', value: '3.8° (Flat)', color: '#FFFFFF' }
        ]
      };
    }

    // 5. "WHY IS A PLACE DANGEROUS?"
    if (q.includes('why danger') || q.includes('why is') && (q.includes('dangerous') || q.includes('bad') || q.includes('high risk') || q.includes('hazard') || q.includes('meppadi'))) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `⚠️ **Why Meppadi / Chooralmala is Danger Zone (HRI 84.5/100):**\n\n1. **Extreme Slope Gradient (38.5°):** Chembra peak ridge features steep mountain scarps where gravitational shear stress exceeds soil friction.\n2. **Cloudburst Precipitation (284.5 mm / 24h):** Extreme rainfall rapidly infiltrated the thin regolith soil layer.\n3. **Pore Water Liquefaction (98% Saturation):** High underground water pressure turned solid soil into liquid mud slurry.\n4. **Funneled Debris Flow:** The V-shaped Mundakkai stream valley compressed and accelerated the debris surge to **48.5 km/h**, destroying buildings in its path.`,
        timestamp: now,
        actionButton: { label: 'Inspect Danger Map', view: 'red-zone-map' },
        metrics: [
          { label: 'Slope', value: '38.5°', color: '#E8543E' },
          { label: '24h Rain', value: '284.5 mm', color: '#E8543E' },
          { label: 'Flow Speed', value: '48.5 km/h', color: '#FBBF24' }
        ]
      };
    }

    // 6. TRAVEL TIME & ROUTE PLANNING
    if (q.includes('time') || q.includes('how long') || q.includes('how much time') || q.includes('duration') || q.includes('reach') || q.includes('route') || q.includes('evacuat') || q.includes('road')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `⏱️ **Travel Time & Route: Meppadi ➔ Kalpetta-Vythiri Institutional Reserve (Safe Zone D)**\n\n• **Distance:** 14.8 km\n• **Convoy Travel Time:** **~28 minutes**\n• **Emergency Speed:** **~18 minutes**\n• **Safest Recommended Route:** Meppadi Town ➔ Chundale Junction ➔ NH-766 4-Lane Highway to Kalpetta.\n• ⚠️ **CRITICAL WARNING:** Completely avoid the Mundakkai–Chooralmala river bridge (active debris surge path). Use the northern ridge bypass road only!`,
        timestamp: now,
        routeInfo: {
          from: 'Meppadi (Mundakkai/Chooralmala)',
          to: 'Kalpetta-Vythiri Institutional Reserve',
          distance: '14.8 km',
          normalTime: '28 mins',
          emergencyTime: '18 mins',
          safeRouteName: 'Chundale–NH-766 4-Lane Corridor',
          hazardToAvoid: 'Mundakkai stream gully bridge (COLLAPSE RISK)',
          clearanceStatus: 'SAFE'
        },
        actionButton: { label: 'Open Relocation Matcher', view: 'relocation-engine' },
        metrics: [
          { label: 'Total Distance', value: '14.8 km', color: '#FFFFFF' },
          { label: 'Convoy Travel Time', value: '28 Mins', color: '#4ADE9A' }
        ]
      };
    }

    // 7. EMERGENCY HELPLINES & PRE-EVENT SAFETY ANALYSIS
    if (q.includes('help') || q.includes('phone') || q.includes('number') || q.includes('call') || q.includes('contact') || q.includes('ndrf') || q.includes('safety') || q.includes('prevent') || q.includes('before')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `🚨 **DISASTER ASSISTANCE & PRE-EVENT SAFETY GUIDE**\n\n📞 **Official 24x7 Emergency Helplines:**\n• 🚨 **Wayanad District Disaster Control Room:** \`1077\` / \`04936-204151\`\n• 🏛️ **Kerala State Emergency Operations (SEOC):** \`1070\`\n• 🚓 **Police Emergency Assistance:** \`112\` / \`100\`\n• 🚑 **Ambulance & Medical Emergency:** \`108\`\n• 🚒 **Fire & Rescue Services:** \`101\`\n• 🦺 **NDRF Rescue Headquarters:** \`0471-2331639\`\n\n---\n\n🔬 **Pre-Disaster Early Warning Signals:**\n• When 24h rainfall exceeds **150 mm** or soil saturation crosses **80%**, ground liquefaction is imminent.\n• Walk the perimeter: If surface cracks (>5 mm) appear on slope shoulders or walls, evacuate immediately.\n• Sudden muddying of stream water indicates upstream debris damming.\n\n🎒 **72h Go-Bag:** Water, dry rations, LED torch, powerbank, waterproof document pouch with Aadhaar/deeds, and essential medicines.`,
        timestamp: now,
        actionButton: { label: 'Open Live Intelligence Feed', view: 'intelligence-layers' },
        metrics: [
          { label: 'District Helpline', value: '1077 (24x7)', color: '#4ADE9A' },
          { label: 'State SEOC', value: '1070 (Toll Free)', color: '#38BDF8' }
        ]
      };
    }

    // 8. General search for any village / town
    const matchedProfile = getHazardProfileForLocation(query);
    if (matchedProfile) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `**${matchedProfile.name} Disaster Profile:**\n\n• **Risk Score:** ${matchedProfile.riskScore}/100 (${matchedProfile.riskLevel} RISK)\n• **Landslide Probability:** ${matchedProfile.landslideProb}%\n• **Flood Inundation:** ${matchedProfile.floodProb}%\n• **Slope Gradient:** ${matchedProfile.slopeDeg}°\n• **24h Rainfall:** ${matchedProfile.rainfall24h} mm\n• **Exposed Population:** ${matchedProfile.exposedPopulation.toLocaleString()} people\n• **Assigned Safe Destination:** ${matchedProfile.assignedSafeSite}\n\n**Diagnosis:** ${matchedProfile.summary}\n\n**Action Plan:** ${matchedProfile.actionRequired}`,
        timestamp: now,
        actionButton: { label: `View ${matchedProfile.name.split(' ')[0]} on Map`, view: 'red-zone-map', village: matchedProfile.name.split(' ')[0] },
        metrics: [
          { label: 'Landslide', value: `${matchedProfile.landslideProb}%`, color: matchedProfile.landslideProb > 60 ? '#E8543E' : '#4ADE9A' },
          { label: 'Flood', value: `${matchedProfile.floodProb}%`, color: matchedProfile.floodProb > 60 ? '#38BDF8' : '#4ADE9A' },
          { label: 'Slope', value: `${matchedProfile.slopeDeg}°`, color: '#FBBF24' }
        ]
      };
    }

    // Fallback default helpful response
    return {
      id: Date.now().toString(),
      sender: 'assistant',
      text: `I can answer all questions regarding:\n\n1. ⚠️ **Why an area is dangerous** (e.g. Meppadi 38.5° slope, 284mm cloudburst)\n2. 🛡️ **Why a place is safe** (e.g. Kalpetta flat terrain, flood buffers, road access)\n3. ⏱️ **Travel times to safe places** (e.g. 28 min convoy from Meppadi to Kalpetta)\n4. 🌧️ **What changes at +50% rain simulation** (424 → 610 parcels)\n5. 👥 **Population in any village/town** (Meppadi, Achooranam, Kottathara, Kuppadithara)\n6. 📞 **Emergency helplines & Go-Bag checklist**\n\nWhat would you like to know?`,
      timestamp: now,
      actionButton: { label: 'Open Command Center', view: 'sdma-command' }
    };
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: now
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateResponse(userText);
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 400);
  };

  const handlePromptClick = (prompt: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      timestamp: now
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateResponse(prompt);
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 400);
  };

  const handleActionButton = (btn: { label: string; view?: string; village?: string }) => {
    if (btn.village) {
      setSelectedVillage(btn.village);
    }
    if (btn.view) {
      setActiveView(btn.view as any);
    }
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-[1500] flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-pine-bg font-sans font-bold text-xs rounded-full shadow-hero-glow border border-emerald-300/40 transition-all hover:scale-105 group"
          title="Open NIVARA Disaster Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <span className="tracking-wide">Ask Disaster Copilot</span>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className={`fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[2500] bg-[#0E1A15]/98 backdrop-blur-xl border border-[#1E3228] rounded-2xl shadow-2xl flex flex-col font-sans transition-all duration-200 max-h-[calc(100vh-20px)] ${
          isExpanded 
            ? 'w-[96vw] md:w-[720px] h-[min(82vh,calc(100vh-30px))]' 
            : 'w-[94vw] sm:w-[440px] h-[min(520px,calc(100vh-30px))]'
        }`}>
          
          {/* Header */}
          <div className="p-3 border-b border-[#1E3228] flex items-center justify-between bg-[#111D18] rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-sm">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xs sm:text-sm text-white leading-tight flex items-center gap-1.5">
                  <span>Disaster Copilot</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <span className="text-[9.5px] font-mono text-pine-muted hidden sm:block">
                  Context: {activeView.toUpperCase().replace(/-/g, ' ')}
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 text-pine-muted hover:text-white hover:bg-[#15241E] rounded-lg transition-colors"
                title="Reset Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-pine-muted hover:text-white hover:bg-[#15241E] rounded-lg transition-colors hidden sm:block"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-xs font-mono font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-all flex items-center gap-1 shadow-md hover:scale-105 active:scale-95"
                title="Close Copilot (Esc)"
              >
                <X className="w-4 h-4" />
                <span>CLOSE</span>
              </button>
            </div>
          </div>

          {/* Dynamic Quick Prompts Chips */}
          <div className="px-3 py-2 bg-[#0B1310] border-b border-[#1E3228] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
            <span className="text-[10px] text-emerald-400 shrink-0 flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Ask:</span>
            </span>
            {dynamicPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                className="px-2.5 py-1 rounded-full bg-[#15241E] hover:bg-emerald-950 text-pine-text hover:text-emerald-300 border border-[#1E3228] hover:border-emerald-700 whitespace-nowrap transition-all shrink-0 text-[10.5px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[88%] ${
                  msg.sender === 'user' 
                    ? 'bg-emerald-700 text-white rounded-2xl rounded-tr-sm p-3 font-sans' 
                    : 'bg-[#111D18] border border-[#1E3228] rounded-2xl rounded-tl-sm p-3 text-pine-text'
                }`}>
                  
                  <div className="leading-relaxed whitespace-pre-line font-sans text-xs">
                    {msg.text}
                  </div>

                  {/* Turn-by-Turn Route Card if available */}
                  {msg.routeInfo && (
                    <div className="p-2.5 rounded-xl bg-[#0B1310] border border-emerald-500/40 space-y-2 font-mono text-[11px] mt-2">
                      <div className="flex items-center justify-between border-b border-[#1E3228] pb-1.5">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5" />
                          <span>Evacuation Route Blueprint</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9.5px] font-bold">
                          {msg.routeInfo.clearanceStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-pine-muted block">From:</span>
                          <strong className="text-rose-400 truncate block">{msg.routeInfo.from}</strong>
                        </div>
                        <div>
                          <span className="text-pine-muted block">To Safe Site:</span>
                          <strong className="text-emerald-400 truncate block">{msg.routeInfo.to}</strong>
                        </div>
                        <div>
                          <span className="text-pine-muted block">Convoy Time:</span>
                          <strong className="text-white text-xs">{msg.routeInfo.normalTime}</strong>
                        </div>
                        <div>
                          <span className="text-pine-muted block">Distance:</span>
                          <strong className="text-white text-xs">{msg.routeInfo.distance}</strong>
                        </div>
                      </div>

                      <div className="p-1.5 bg-[#12221B] rounded border border-[#1E3228] text-[10px] space-y-0.5">
                        <div className="text-emerald-300">
                          <strong>Clear Route:</strong> {msg.routeInfo.safeRouteName}
                        </div>
                        <div className="text-rose-400">
                          <strong>Hazard Warning:</strong> {msg.routeInfo.hazardToAvoid}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Optional Key Metric Pills */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#1E3228] font-mono text-[10px]">
                      {msg.metrics.map((m, i) => (
                        <div key={i} className="p-1.5 bg-[#0B1310] rounded border border-[#1E3228]">
                          <span className="text-pine-muted block text-[9px] truncate">{m.label}</span>
                          <strong style={{ color: m.color || '#4ADE9A' }} className="text-xs">
                            {m.value}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Optional Action Button */}
                  {msg.actionButton && (
                    <button
                      onClick={() => handleActionButton(msg.actionButton!)}
                      className="w-full py-1.5 px-2.5 bg-[#15241E] hover:bg-emerald-600 hover:text-white text-emerald-400 text-[11px] font-mono font-bold rounded-lg border border-[#1E3228] flex items-center justify-center gap-1.5 transition-all mt-1"
                    >
                      <span>{msg.actionButton.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <span className={`text-[9px] block text-right font-mono ${msg.sender === 'user' ? 'text-emerald-200' : 'text-pine-muted'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#1E3228] flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-pine-muted text-[11px] font-mono">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1 bg-[#111D18] px-3 py-2 rounded-xl border border-[#1E3228]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-200" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-2.5 border-t border-[#1E3228] bg-[#111D18] rounded-b-2xl flex items-center gap-1.5 shrink-0">
            <input
              type="text"
              placeholder="Ask why it's dangerous, safe land, +50% rain..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-[#0B1310] border border-[#1E3228] rounded-xl px-3 py-2 text-xs font-sans text-white placeholder:text-pine-muted/70 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition-all shadow-sm"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2.5 rounded-xl bg-[#15241E] hover:bg-rose-900 text-pine-muted hover:text-rose-200 border border-[#1E3228] transition-colors shadow-sm"
              title="Close Copilot"
            >
              <X className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
