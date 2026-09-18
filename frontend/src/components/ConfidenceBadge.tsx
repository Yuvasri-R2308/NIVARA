import React from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, Eye } from 'lucide-react';

export interface ConfidenceBadgeProps {
  maturity_mode?: 'shadow' | 'assisted' | 'autonomous' | string;
  maturity_index?: number;
  // Aliases for backward compatibility
  mmi?: number;
  operatingMode?: string;
  confidenceLabel?: string;
  showDetails?: boolean;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  maturity_mode,
  maturity_index,
  mmi,
  operatingMode,
  confidenceLabel,
  showDetails = false,
  className = ''
}) => {
  // Resolve effective maturity index and mode
  const effectiveIndex = maturity_index !== undefined ? maturity_index : (mmi !== undefined ? mmi : 78.0);
  const rawMode = (maturity_mode || operatingMode || (effectiveIndex < 40 ? 'shadow' : effectiveIndex < 75 ? 'assisted' : 'autonomous')).toLowerCase();

  // Color mapping: Red for Shadow/Provisional, Yellow for Assisted, Green for Autonomous
  let badgeBorder = 'border-emerald-500/40';
  let badgeBg = 'bg-emerald-950/60';
  let badgeText = 'text-emerald-300';
  let dotColor = 'bg-emerald-400';
  let displayMode = 'autonomous';
  let icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;

  if (rawMode.includes('shadow') || effectiveIndex < 40) {
    badgeBorder = 'border-rose-500/40';
    badgeBg = 'bg-rose-950/60';
    badgeText = 'text-rose-300';
    dotColor = 'bg-rose-400';
    displayMode = 'shadow/provisional';
    icon = <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
  } else if (rawMode.includes('assist') || effectiveIndex < 75) {
    badgeBorder = 'border-amber-500/40';
    badgeBg = 'bg-amber-950/60';
    badgeText = 'text-amber-300';
    dotColor = 'bg-amber-400';
    displayMode = 'assisted';
    icon = <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
  }

  const effectiveLabel = confidenceLabel || (displayMode.includes('shadow') ? 'LOW' : displayMode === 'assisted' ? 'MODERATE' : 'HIGH');

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] backdrop-blur-md shadow-sm ${badgeBorder} ${badgeBg} ${badgeText} ${className}`}
      title={`Model Maturity Index (MMI): ${effectiveIndex}/100 — Mode: ${displayMode} (${effectiveLabel} Confidence)`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="font-bold tracking-tight">MMI {Math.round(effectiveIndex)}/100</span>
      <span className="text-pine-muted opacity-40">&bull;</span>
      <span className="text-[10px] font-bold uppercase tracking-wider">{displayMode}</span>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse shrink-0`} />
      
      {showDetails && (
        <span className="text-[9.5px] text-pine-muted pl-1 border-l border-white/10">
          {effectiveLabel} CONFIDENCE
        </span>
      )}
    </div>
  );
};

export default ConfidenceBadge;
