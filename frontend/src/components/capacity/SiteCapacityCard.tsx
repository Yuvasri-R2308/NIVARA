import React from 'react';
import { CapacityCalculationResult, SiteResourceLedger } from '../../types';
import { 
  Scale, 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  MapPin
} from 'lucide-react';

interface Props {
  site: SiteResourceLedger;
  calculation: CapacityCalculationResult;
  onOpenScoreBreakdown?: () => void;
  onOpenRelocationDirective?: () => void;
}

export const SiteCapacityCard: React.FC<Props> = ({
  site,
  calculation,
  onOpenScoreBreakdown,
  onOpenRelocationDirective
}) => {
  const isRejected = calculation.isRejectedDueToHazard;
  const isOvercapacity = calculation.capacityStatus === 'OVERCAPACITY DEFICIT';
  const isSafe = calculation.capacityStatus === 'SAFE CAPACITY AVAILABLE';

  return (
    <div className={`p-4 lg:p-5 rounded-2xl border transition-all space-y-4 font-mono text-xs shadow-panel ${
      isRejected
        ? 'bg-rose-950/25 border-rose-800/80 text-rose-200'
        : isOvercapacity
        ? 'bg-amber-950/20 border-amber-800/80 text-amber-100'
        : 'bg-[#111D18] border-[#1E3228] text-pine-text'
    }`}>
      
      {/* 1. Header: Site Name, ID, Category & Suitability Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E3228] pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B1310] text-emerald-400 border border-[#1E3228] font-bold">
              {site.siteId}
            </span>
            <span className="text-[10px] text-pine-muted font-sans font-medium">
              {site.category} • {site.village}
            </span>
          </div>
          <h2 className="text-lg lg:text-xl font-serif font-bold text-white leading-tight">
            {site.name}
          </h2>
        </div>

        {/* Overall Suitability Score Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2.5 bg-[#0B1310] rounded-xl border border-[#1E3228] text-right">
            <div className="flex items-center justify-end gap-1">
              <span className="text-[9.5px] text-pine-muted uppercase block">Suitability Score</span>
              {onOpenScoreBreakdown && (
                <button
                  onClick={onOpenScoreBreakdown}
                  className="text-emerald-400 hover:text-white"
                  title="Why this score? Click for mathematical breakdown"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-baseline justify-end gap-1">
              <span className={`text-2xl font-bold font-mono ${
                isRejected ? 'text-rose-400 line-through' : 'text-emerald-400'
              }`}>
                {calculation.suitabilityScore}
              </span>
              <span className="text-xs text-pine-muted font-mono">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Capacity KPI Row: Practical Capacity vs Displaced Pop vs Utilization */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        {/* Metric 1: Practical Carrying Capacity */}
        <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
          <span className="text-[9.5px] text-pine-muted uppercase block font-bold">
            Practical Capacity:
          </span>
          <div className="flex items-baseline gap-1">
            <strong className={`text-xl font-mono ${isRejected ? 'text-rose-400' : 'text-emerald-400'}`}>
              {calculation.practicalCapacity.toLocaleString()}
            </strong>
            <span className="text-[10px] text-pine-muted">people</span>
          </div>
          <span className="text-[9px] text-pine-muted block">
            Limited by weakest resource
          </span>
        </div>

        {/* Metric 2: Expected Displaced Population */}
        <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
          <span className="text-[9.5px] text-pine-muted uppercase block font-bold">
            Assigned Displaced Load:
          </span>
          <div className="flex items-baseline gap-1">
            <strong className="text-xl font-mono text-white">
              {calculation.targetPopulation.toLocaleString()}
            </strong>
            <span className="text-[10px] text-pine-muted">people</span>
          </div>
          <span className="text-[9px] text-pine-muted block">
            ~{Math.round(calculation.targetPopulation / 4)} vulnerable families
          </span>
        </div>

        {/* Metric 3: Remaining Holding Buffer */}
        <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
          <span className="text-[9.5px] text-pine-muted uppercase block font-bold">
            Remaining Buffer:
          </span>
          <div className="flex items-baseline gap-1">
            <strong className={`text-xl font-mono ${
              calculation.remainingCapacity >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {calculation.remainingCapacity >= 0 ? `+${calculation.remainingCapacity.toLocaleString()}` : calculation.remainingCapacity.toLocaleString()}
            </strong>
            <span className="text-[10px] text-pine-muted">slots</span>
          </div>
          <span className="text-[9px] text-pine-muted block">
            {calculation.remainingCapacity >= 0 ? 'Surplus safe capacity' : 'Exceeds single site limit'}
          </span>
        </div>

        {/* Metric 4: Capacity Utilization Status */}
        <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
          <span className="text-[9.5px] text-pine-muted uppercase block font-bold">
            Site Status:
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-tight ${
              isRejected
                ? 'bg-rose-950 text-rose-300 border-rose-700'
                : isOvercapacity
                ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                : 'bg-emerald-950 text-emerald-300 border-emerald-700'
            }`}>
              {calculation.capacityStatus}
            </span>
          </div>
          <span className="text-[9px] text-pine-muted block">
            Utilization: <strong className="text-white">{calculation.capacityUtilizationPct}%</strong>
          </span>
        </div>

      </div>

      {/* 3. Limiting Resource Bottleneck Diagnostic Alert Box */}
      <div className={`p-3.5 rounded-xl border space-y-1.5 ${
        isRejected
          ? 'bg-rose-950/40 border-rose-700 text-rose-200'
          : 'bg-[#15241E] border-emerald-800/60 text-emerald-100'
      }`}>
        <div className="flex items-center justify-between text-[10.5px]">
          <span className="font-bold flex items-center gap-1.5">
            {isRejected ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span className="uppercase font-mono">
              {isRejected ? 'CRITICAL SAFETY EXCLUSION:' : 'LIMITING RESOURCE BOTTLENECK:'}
            </span>
          </span>
          <span className="font-mono text-[10px] text-pine-muted">
            Bottleneck: <strong className="text-white font-bold">{calculation.limitingResource}</strong>
          </span>
        </div>

        <p className="text-xs font-sans leading-relaxed text-pine-text">
          {calculation.limitingResourceExplanation}
        </p>
      </div>

      {/* 4. Action Directives & Transit Info Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#1E3228]">
        <div className="flex items-center gap-3 text-[11px] text-pine-muted">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{site.distanceFromMeppadiKm} km from epicenter</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>~{site.travelTimeFromMeppadiMins} min convoy transit</span>
          </span>
        </div>

        {onOpenRelocationDirective && !isRejected && (
          <button
            onClick={onOpenRelocationDirective}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-hero-glow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>RECOMMEND & ALLOCATE THIS SITE</span>
          </button>
        )}
      </div>

    </div>
  );
};
