import React from 'react';
import { Activity, Radio, Cpu, Layers, Sparkles } from 'lucide-react';

interface Map3DHUDProps {
  weatherStatus?: string;
  isLiveWeather?: boolean;
  activeModelName?: string;
  simulatedMultiplier?: number;
  totalParcels?: number;
  highRiskCount?: number;
  onOpenDemoTour?: () => void;
}

export const Map3DHUD: React.FC<Map3DHUDProps> = ({
  weatherStatus = 'LIVE',
  isLiveWeather = true,
  activeModelName = 'XGBoost v3.4 + Bayesian Beta-Logit',
  simulatedMultiplier = 1.0,
  totalParcels = 1000,
  highRiskCount = 424,
  onOpenDemoTour
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#07110C]/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl text-[11px] font-mono text-cyan-100 select-none">
      
      {/* Brand & Mission */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-5 h-5 rounded-md bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_10px_rgba(56,189,248,0.4)]">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold tracking-wider text-white font-sans text-xs flex items-center gap-1.5">
            NIVARA 3D COMMAND
            <span className="px-1.5 py-0.2 text-[9px] bg-cyan-950/90 text-cyan-400 border border-cyan-500/40 rounded font-mono font-bold tracking-normal">
              PROTOTYPE
            </span>
          </span>
          <span className="text-[9px] text-cyan-300/70">Wayanad Disaster Intelligence</span>
        </div>
      </div>

      {/* Telemetry & Systems Indicators */}
      <div className="hidden md:flex items-center gap-3">
        
        {/* System Health */}
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-cyan-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-pine-muted text-[10px]">SYS:</span>
          <span className="text-emerald-300 font-bold text-[10px]">OPERATIONAL</span>
        </div>

        {/* Live Weather */}
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-cyan-500/20">
          <Radio className="w-3 h-3 text-cyan-400" />
          <span className="text-pine-muted text-[10px]">WEATHER:</span>
          <span className="text-cyan-300 font-bold text-[10px]">{weatherStatus}</span>
        </div>

        {/* AI Stack */}
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-cyan-500/20">
          <Cpu className="w-3 h-3 text-violet-400" />
          <span className="text-pine-muted text-[10px]">AI:</span>
          <span className="text-violet-300 font-bold text-[10px]">XGB (94.1%) + BAYES</span>
        </div>

        {/* Red-Zone Load */}
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-lg border border-cyan-500/20">
          <Layers className="w-3 h-3 text-rose-400" />
          <span className="text-pine-muted text-[10px]">PARCELS:</span>
          <span className="text-rose-300 font-bold text-[10px]">
            {Math.round(highRiskCount * (simulatedMultiplier > 1 ? 1 + (simulatedMultiplier - 1) * 0.88 : 1))} / {totalParcels}
          </span>
        </div>

      </div>

      {/* Demo Tour Button */}
      {onOpenDemoTour && (
        <button
          onClick={onOpenDemoTour}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[10px] rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.5)] border border-cyan-300/40 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
          title="Start 10-Step Guided 3D Tour for Hackathon Judges"
        >
          <Sparkles className="w-3 h-3 text-cyan-200 animate-spin" style={{ animationDuration: '4s' }} />
          <span>START 3D DEMO TOUR</span>
        </button>
      )}

    </div>
  );
};
