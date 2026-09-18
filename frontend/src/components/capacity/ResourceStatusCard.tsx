import React from 'react';
import { ResourceRequirementItem } from '../../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info,
  Droplets,
  Users,
  Ambulance,
  Car,
  Home,
  Utensils,
  ShieldCheck,
  Zap,
  Navigation
} from 'lucide-react';

interface Props {
  item: ResourceRequirementItem;
  icon?: React.ReactNode;
}

export const ResourceStatusCard: React.FC<Props> = ({ item, icon }) => {
  const isSufficient = item.status === 'Sufficient';
  const isLimited = item.status === 'Limited';
  const isShortage = item.status === 'Shortage' || item.status === 'Critical';

  const statusBg = isSufficient 
    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
    : isLimited 
    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
    : 'bg-rose-950/40 border-rose-500/40 text-rose-300';

  const statusPill = isSufficient
    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
    : isLimited
    ? 'bg-amber-950 text-amber-300 border-amber-600'
    : 'bg-rose-950 text-rose-300 border-rose-600';

  const statusIcon = isSufficient
    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    : isLimited
    ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
    : <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;

  const provenanceBadge = item.provenance === 'Actual Dataset'
    ? 'bg-sky-950 text-sky-300 border-sky-800'
    : item.provenance === 'API Telemetry'
    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
    : item.provenance === 'User Input'
    ? 'bg-purple-950 text-purple-300 border-purple-800'
    : 'bg-amber-950/80 text-amber-400 border-amber-800/80';

  return (
    <div className={`p-3.5 rounded-xl border transition-all ${statusBg} flex flex-col justify-between font-mono text-xs shadow-panel`}>
      <div className="space-y-2">
        
        {/* Header: Resource Name + Status Badge */}
        <div className="flex items-start justify-between gap-2 border-b border-[#1E3228]/80 pb-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-emerald-400 shrink-0">{icon}</span>}
            <span className="font-bold text-white text-xs">{item.resourceName}</span>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border flex items-center gap-1 ${statusPill}`}>
              {statusIcon}
              <span>{isSufficient ? '✓ Sufficient' : isLimited ? '⚠ Limited' : '✕ Shortage'}</span>
            </span>
          </div>
        </div>

        {/* Core Metric Comparison: Required vs Available */}
        <div className="grid grid-cols-2 gap-2 bg-[#0B1310]/80 p-2.5 rounded-lg border border-[#1E3228]">
          <div>
            <span className="text-[10px] text-pine-muted block">Required Load:</span>
            <strong className="text-white font-mono text-xs">
              {item.requiredValue.toLocaleString()} {item.unit}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-pine-muted block">Available Site Supply:</span>
            <strong className="text-emerald-400 font-mono text-xs">
              {item.availableValue.toLocaleString()} {item.unit}
            </strong>
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-pine-muted">
              Supply Coverage: <strong className={isSufficient ? 'text-emerald-400' : isLimited ? 'text-amber-400' : 'text-rose-400'}>{item.coveragePct}%</strong>
            </span>
            <span className="font-bold">
              {item.gap >= 0 ? (
                <span className="text-emerald-400">+{item.gap.toLocaleString()} {item.unit} surplus</span>
              ) : (
                <span className="text-rose-400">{item.gap.toLocaleString()} {item.unit} deficit</span>
              )}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#0B1310] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isSufficient ? 'bg-emerald-400' : isLimited ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, item.coveragePct)}%` }}
            />
          </div>
        </div>

        {/* Optional Notes */}
        {item.notes && (
          <p className="text-[10px] text-pine-muted font-sans leading-tight pt-1 truncate" title={item.notes}>
            {item.notes}
          </p>
        )}

      </div>

      {/* Footer: Data Provenance Badge */}
      <div className="pt-2 mt-2 border-t border-[#1E3228]/80 flex items-center justify-between text-[9px]">
        <span className="text-pine-muted">Data Source:</span>
        <span className={`px-1.5 py-0.2 rounded border font-bold ${provenanceBadge}`} title="Audit trail & verification basis">
          {item.provenance}
        </span>
      </div>
    </div>
  );
};
