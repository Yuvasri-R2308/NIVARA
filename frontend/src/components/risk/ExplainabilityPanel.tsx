import React from 'react';
import { 
  HelpCircle, 
  TrendingUp, 
  CloudRain, 
  Mountain, 
  Waves, 
  History, 
  Users, 
  ShieldAlert,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface ExplainabilityPanelProps {
  locationName: string;
  catchmentId?: string;
  dynamicHri?: number;
  staticHri?: number;
  rainfall24h?: number;
  rainfall48h?: number;
  rainfall72h?: number;
  apiValue?: number;
  slopeDeg?: number;
  elevationM?: number;
  populationExposed?: number;
  hasDownstreamRunout?: boolean;
  mmi?: number;
  operatingMode?: string;
  onClose?: () => void;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  locationName,
  catchmentId = 'MC_MEPPADI_01',
  dynamicHri = 84.5,
  staticHri = 84.5,
  rainfall24h = 284.5,
  rainfall48h = 372.0,
  rainfall72h = 544.0,
  apiValue = 245.0,
  slopeDeg = 38.5,
  elevationM = 1240.0,
  populationExposed = 4800,
  hasDownstreamRunout = true,
  mmi = 78,
  operatingMode = 'AUTONOMOUS',
  onClose
}) => {
  // Determine risk factor weights
  const factors = [
    {
      title: 'Dynamic Hazard Risk Index',
      value: `${dynamicHri} / 100`,
      status: dynamicHri >= 70 ? 'CRITICAL' : dynamicHri >= 45 ? 'HIGH' : 'LOW',
      detail: `Base HRI ${staticHri} adjusted by +${Math.max(0, Math.round((dynamicHri - staticHri) * 10) / 10)} from Antecedent Wetness (API).`,
      icon: <TrendingUp className="w-4 h-4 text-rose-400" />
    },
    {
      title: '48-Hour Precipitation Exceedance',
      value: `${rainfall48h} mm`,
      status: rainfall48h >= 350 ? 'EXTREME' : rainfall48h >= 200 ? 'HEAVY' : 'NORMAL',
      detail: `24h: ${rainfall24h}mm, 48h: ${rainfall48h}mm, 72h: ${rainfall72h}mm cumulative rainfall surpassing saturation threshold.`,
      icon: <CloudRain className="w-4 h-4 text-cyan-400" />
    },
    {
      title: 'Antecedent Precipitation Index (API)',
      value: `${apiValue} mm (k=0.85)`,
      status: apiValue >= 200 ? 'HIGH SATURATION' : 'MODERATE',
      detail: 'Exponential multi-day rainfall memory driving pore pressure saturation and regolith slip deficit.',
      icon: <Waves className="w-4 h-4 text-blue-400" />
    },
    {
      title: 'Topographic Slope Gradient',
      value: `${slopeDeg}° Scarp (${elevationM}m MSL)`,
      status: slopeDeg >= 30 ? 'UNSTABLE' : 'MODERATE',
      detail: 'Steep Western Ghats scarp topography exceeding the 30° regolith Mohr-Coulomb failure angle.',
      icon: <Mountain className="w-4 h-4 text-amber-400" />
    },
    {
      title: 'Downstream Debris Runout Flow',
      value: hasDownstreamRunout ? 'ACTIVE CORRIDOR' : 'NONE DETECTED',
      status: hasDownstreamRunout ? 'CRITICAL RUNOUT' : 'SAFE',
      detail: hasDownstreamRunout 
        ? 'Steep downhill trajectory to valley confluences (48.5 km/h estimated surge velocity, 18-min lead time).'
        : 'Outside identified high-velocity debris trajectories.',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />
    },
    {
      title: 'Demographic Exposure',
      value: `${populationExposed.toLocaleString()} Persons`,
      status: populationExposed >= 2000 ? 'HIGH EXPOSURE' : 'LOW',
      detail: 'Census 2011 population in downstream settlement zones and vulnerable plantation worker quarters.',
      icon: <Users className="w-4 h-4 text-purple-400" />
    }
  ];

  return (
    <div className="bg-[#07110C]/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-4 lg:p-5 font-mono text-xs text-pine-text shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-cyan-500/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              EXPLAINABLE AI RISK DRIVERS
            </span>
            <ConfidenceBadge mmi={mmi} operatingMode={operatingMode} />
          </div>
          <h3 className="text-lg font-serif font-bold text-white mt-0.5">
            Why is {locationName} at Risk?
          </h3>
          <p className="text-[11px] text-pine-muted font-sans mt-0.5">
            Micro-catchment <span className="text-cyan-300 font-mono font-bold">[{catchmentId}]</span> hydrological and terrain feature decomposition.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-black/40 hover:bg-white/10 text-pine-muted hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {factors.map((f, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-[#0B1310] border border-cyan-500/20 space-y-1.5 hover:border-cyan-400/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                {f.icon}
                <span>{f.title}</span>
              </div>
              <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold ${
                f.status.includes('CRITICAL') || f.status.includes('EXTREME') || f.status.includes('UNSTABLE')
                  ? 'bg-rose-950 text-rose-300 border border-rose-600'
                  : f.status.includes('HIGH') || f.status.includes('HEAVY')
                  ? 'bg-amber-950 text-amber-300 border border-amber-600'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
              }`}>
                {f.status}
              </span>
            </div>

            <div className="text-sm font-bold text-white font-mono">
              {f.value}
            </div>

            <p className="text-[11px] text-pine-muted/90 font-sans leading-tight">
              {f.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Decision Summary */}
      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-pine-muted font-sans">
          <strong className="text-white">Decision Support Recommendation:</strong> Multi-factor evidence exceeds triggering thresholds. Evacuation priority queue elevated with immediate notification to TEOC Vythiri and SDMA field teams.
        </div>
      </div>

    </div>
  );
};
