import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Sparkles, 
  Mountain, 
  ShieldAlert, 
  Cpu, 
  Users, 
  CloudRain, 
  Home, 
  Route, 
  Bot, 
  CheckCircle2,
  Compass
} from 'lucide-react';

export interface TourStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  focusTarget: [number, number]; // [lat, lng]
  zoom: number;
  pitch: number;
  bearing: number;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "1. Wayanad Multi-Hazard Regional Overview",
    subtitle: "High-Altitude Western Ghats Topography",
    description: "NIVARA ingests 1,000 cadastral parcels across 4 critical study villages (Meppadi, Achooranam, Kottathara, Kuppadithara) with high-resolution DEM terrain elevation.",
    focusTarget: [11.605, 76.085],
    zoom: 11.8,
    pitch: 48,
    bearing: -15,
    badge: "REGIONAL GIS",
    badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-400",
    icon: <Compass className="w-4 h-4 text-cyan-400" />
  },
  {
    id: 2,
    title: "2. Meppadi Disaster Epicenter",
    subtitle: "Mundakkai & Chooralmala Mountain Scarps",
    description: "Camera zooms into Meppadi's 38.5° steep mountain scarps. Notice how critical red-zone parcels rise 350 meters above the terrain reflecting severe debris flow hazard.",
    focusTarget: [11.554, 76.128],
    zoom: 14.5,
    pitch: 62,
    bearing: -35,
    badge: "CRITICAL RED-ZONE",
    badgeColor: "bg-rose-950 text-rose-300 border-rose-500",
    icon: <Mountain className="w-4 h-4 text-rose-400" />
  },
  {
    id: 3,
    title: "3. Triangulated Risk Modeling (HRI & FoS)",
    subtitle: "Physics-Based Mohr-Coulomb Soil Stability",
    description: "HRI scores are computed across rainfall (35%), slope (30%), soil moisture (20%), and historical recurrence (15%). Mohr-Coulomb Factor of Safety calculates FoS = 0.74 (critical slip deficit).",
    focusTarget: [11.554, 76.128],
    zoom: 15.2,
    pitch: 65,
    bearing: -20,
    badge: "PHYSICS ENGINE",
    badgeColor: "bg-amber-950 text-amber-300 border-amber-500",
    icon: <ShieldAlert className="w-4 h-4 text-amber-400" />
  },
  {
    id: 4,
    title: "4. Machine Learning & Bayesian Inference",
    subtitle: "XGBoost (94.10% CV) + Bayesian Beta-Logit (95% CI)",
    description: "120 gradient-boosted trees predict hazard classification with 94.10% cross-validation accuracy. Bayesian inference updates regional prior to 94% landslide probability (95% CI: 89%–97%).",
    focusTarget: [11.554, 76.128],
    zoom: 14.8,
    pitch: 58,
    bearing: 10,
    badge: "AI INTELLIGENCE",
    badgeColor: "bg-purple-950 text-purple-300 border-purple-400",
    icon: <Cpu className="w-4 h-4 text-purple-400" />
  },
  {
    id: 5,
    title: "5. Demographic Exposure & RPI Priority",
    subtitle: "4,800 Exposed Persons & 250 Vulnerable Families",
    description: "Relocation Priority Index (RPI) weights elderly, children, and kutcha housing structures. 3D population columns immediately show disaster managers where immediate evacuation is needed.",
    focusTarget: [11.554, 76.128],
    zoom: 14.2,
    pitch: 52,
    bearing: -10,
    badge: "DEMOGRAPHICS",
    badgeColor: "bg-violet-950 text-violet-300 border-violet-400",
    icon: <Users className="w-4 h-4 text-violet-400" />
  },
  {
    id: 6,
    title: "6. What-If Rainfall Climate Simulation",
    subtitle: "+50% Precipitation Surge Impact (213 mm/24h)",
    description: "When simulating extreme rainfall surges, soil infiltration exceeds 75%, and high-risk cadastral parcels dynamically surge from 424 to 610 parcels across the district.",
    focusTarget: [11.591, 76.012],
    zoom: 13.5,
    pitch: 55,
    bearing: 25,
    badge: "SIMULATION",
    badgeColor: "bg-blue-950 text-blue-300 border-blue-400",
    icon: <CloudRain className="w-4 h-4 text-blue-400" />
  },
  {
    id: 7,
    title: "7. Safe Resettlement Site Allocation",
    subtitle: "Kalpetta-Vythiri Institutional Reserve (KL-WYD-S01)",
    description: "Camera glides to the top candidate safe site in Kalpetta (Safe Zone D). Situated on a gentle 3.8° plateau, 28m above the 100-year flood line with zero landslide recurrence history.",
    focusTarget: [11.608, 76.082],
    zoom: 14.8,
    pitch: 58,
    bearing: -40,
    badge: "SAFE LANDS",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-400",
    icon: <Home className="w-4 h-4 text-emerald-400" />
  },
  {
    id: 8,
    title: "8. CCAS Carrying Capacity Optimization",
    subtitle: "Sphere Humanitarian Standards Solver (CCAS 93.4/100)",
    description: "Evaluates physical shelter (3.5 m²/p), drinking water (70 L/p/d), toilets (1 per 20p), and health staff (1 per 250p), safely accommodating 2,200 displaced people (550 families).",
    focusTarget: [11.608, 76.082],
    zoom: 15.5,
    pitch: 62,
    bearing: -15,
    badge: "CCAS SOLVER",
    badgeColor: "bg-teal-950 text-teal-300 border-teal-400",
    icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />
  },
  {
    id: 9,
    title: "9. 3D Evacuation Corridors & Logistics",
    subtitle: "14.8 km Protected Highway Route (~28 Min Convoy)",
    description: "Directional animated 3D corridors route emergency convoys along the 4-lane NH-766 highway, bypassing washed-out stream gullies and bridge cuts.",
    focusTarget: [11.580, 76.105],
    zoom: 13.2,
    pitch: 56,
    bearing: 45,
    badge: "LOGISTICS",
    badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-400",
    icon: <Route className="w-4 h-4 text-cyan-400" />
  },
  {
    id: 10,
    title: "10. Multimodal Gemini AI Copilot Command",
    subtitle: "Conversational, Multilingual & Evidence-Grounded AI",
    description: "The AI Copilot synthesizes GIS map data, real-time Open-Meteo weather telemetry, and uploaded photos/PDFs to provide clear disaster decisions in English, Malayalam, Tamil, and Hindi.",
    focusTarget: [11.605, 76.085],
    zoom: 12.2,
    pitch: 50,
    bearing: 0,
    badge: "AI COPILOT",
    badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-400",
    icon: <Bot className="w-4 h-4 text-indigo-400" />
  }
];

interface HackathonDemoTourProps {
  onClose: () => void;
  onFlyToStep: (step: TourStep) => void;
}

export const HackathonDemoTour: React.FC<HackathonDemoTourProps> = ({
  onClose,
  onFlyToStep
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onFlyToStep(TOUR_STEPS[nextIdx]);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onFlyToStep(TOUR_STEPS[prevIdx]);
    }
  };

  const handleJumpTo = (idx: number) => {
    setCurrentStepIndex(idx);
    onFlyToStep(TOUR_STEPS[idx]);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] w-[92vw] max-w-xl bg-[#07110C]/95 backdrop-blur-2xl border-2 border-cyan-400/60 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] text-cyan-100 font-mono select-none animate-fadeIn overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#0C1B14] via-[#091D2C] to-[#0C1B14] border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-xs font-sans tracking-wide">
              HACKATHON 3D DEMO TOUR
            </span>
            <span className="px-2 py-0.2 rounded-full bg-cyan-950 border border-cyan-500/50 text-[10px] text-cyan-300 font-bold">
              Step {currentStep.id} of {TOUR_STEPS.length}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-pine-muted hover:text-white transition-colors cursor-pointer"
          title="Exit Tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        
        {/* Title & Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {currentStep.icon}
            <h4 className="font-bold text-sm text-white font-sans">{currentStep.title}</h4>
          </div>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${currentStep.badgeColor}`}>
            {currentStep.badge}
          </span>
        </div>

        {/* Subtitle */}
        <span className="text-xs text-cyan-300 font-bold block">{currentStep.subtitle}</span>

        {/* Description */}
        <p className="text-[11px] text-gray-300 leading-relaxed font-sans bg-black/30 p-2.5 rounded-xl border border-cyan-500/15">
          {currentStep.description}
        </p>

        {/* Step Indicator Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleJumpTo(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-6 bg-cyan-400 shadow-[0_0_8px_#38BDF8]'
                  : 'w-2 bg-gray-700 hover:bg-gray-500'
              }`}
              title={s.title}
            />
          ))}
        </div>

      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A1611] border-t border-cyan-500/30 text-xs">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
            currentStepIndex === 0
              ? 'opacity-40 cursor-not-allowed border-transparent text-gray-500'
              : 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/80 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>PREVIOUS</span>
        </button>

        <span className="text-[10px] text-pine-muted font-mono">
          Camera Tilt: {currentStep.pitch}° | Heading: {currentStep.bearing}°
        </span>

        {currentStepIndex < TOUR_STEPS.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.5)] border border-cyan-300/40 cursor-pointer"
          >
            <span>NEXT STEP</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(52,211,153,0.5)] border border-emerald-300/40 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>FINISH TOUR</span>
          </button>
        )}
      </div>

    </div>
  );
};
