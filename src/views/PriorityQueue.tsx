import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/RiskBadge';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { StatCard } from '../components/StatCard';
import { 
  ListOrdered, 
  Filter, 
  Users, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export const PriorityQueue: React.FC = () => {
  const { data, selectedVillage, setSelectedVillage, setActiveView } = useApp();
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');

  if (!data) return null;

  const { parcels, villages } = data;

  // Filter parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      if (selectedVillage !== 'ALL' && p.village !== selectedVillage) return false;
      if (selectedPhase !== 'ALL' && p.urgency_phase !== selectedPhase) return false;
      return true;
    }).sort((a, b) => b.rpi_score - a.rpi_score);
  }, [parcels, selectedVillage, selectedPhase]);

  const immediateCount = parcels.filter(p => p.urgency_phase === 'Immediate').length;
  const shortTermCount = parcels.filter(p => p.urgency_phase === 'Short-Term').length;
  const mediumTermCount = parcels.filter(p => p.urgency_phase === 'Medium-Term').length;
  const monitorCount = parcels.filter(p => p.urgency_phase === 'Monitor').length;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* View Decision Banner */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
              STAGE 06 — PRIORITY QUEUE
            </span>
            <span className="text-xs font-mono text-pine-muted">AI RELOCATION PRIORITY (RPI)</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-pine-text mt-1">
            Vulnerability & Phased Relocation Priority Queue
          </h1>
          <p className="text-xs lg:text-sm text-pine-muted mt-1 max-w-3xl">
            <strong>Decision Changed:</strong> Allows SDMA evacuation planners to schedule emergency transit fleets and financial rehabilitation aid strictly ordered by empirical vulnerability index (RPI) rather than political pressure.
          </p>
        </div>

        <button
          onClick={() => setActiveView('relocation-engine')}
          className="px-4 py-2 bg-pine-accent hover:bg-emerald-400 text-pine-bg font-mono font-bold text-xs rounded transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>MATCH SITES FOR QUEUE</span>
        </button>
      </div>

      {/* RPI Formula Breakdown Box */}
      <div className="p-3.5 bg-pine-elevated rounded-lg border border-pine-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
        <div className="space-y-1">
          <div className="text-pine-accent font-bold">AI Relocation Priority Index (RPI) Formula:</div>
          <div className="text-emerald-300 text-[11px]">
            {'RPI = 0.45(Hazard Intensity) + 0.25(Population Exposure) + 0.15(Road Isolation) + 0.15(Disaster History)'}
          </div>
        </div>
        <div className="text-[11px] text-pine-muted font-sans shrink-0">
          Prioritizes habitations where severe landslide threat converges with dense demographics and road cutoff risk.
        </div>
      </div>

      {/* Phased Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedPhase(selectedPhase === 'Immediate' ? 'ALL' : 'Immediate')}
          className={`text-left transition-all ${selectedPhase === 'Immediate' ? 'ring-2 ring-risk-high rounded-lg' : ''}`}
        >
          <StatCard
            title="Immediate Phase (0-30d)"
            value={immediateCount}
            unit="Parcels (1,000+ Pop)"
            subtext="Mundakkai Epicenter & Active Runout"
            variant="danger"
            confidence="HIGH"
            icon={<ShieldAlert className="w-5 h-5 text-risk-high" />}
          />
        </button>

        <button
          onClick={() => setSelectedPhase(selectedPhase === 'Short-Term' ? 'ALL' : 'Short-Term')}
          className={`text-left transition-all ${selectedPhase === 'Short-Term' ? 'ring-2 ring-risk-medium rounded-lg' : ''}`}
        >
          <StatCard
            title="Short-Term Phase (30-90d)"
            value={shortTermCount}
            unit="Parcels (Achoor/Kottathara)"
            subtext="Steep Slope Creep & Valley Fringe"
            variant="warning"
            confidence="HIGH"
            icon={<Clock className="w-5 h-5 text-risk-medium" />}
          />
        </button>

        <button
          onClick={() => setSelectedPhase(selectedPhase === 'Medium-Term' ? 'ALL' : 'Medium-Term')}
          className={`text-left transition-all ${selectedPhase === 'Medium-Term' ? 'ring-2 ring-emerald-500 rounded-lg' : ''}`}
        >
          <StatCard
            title="Medium-Term (90-180d)"
            value={mediumTermCount}
            unit="Parcels (Planned)"
            subtext="Secondary Buffer Zone Mitigation"
            variant="default"
            confidence="MEDIUM"
            icon={<TrendingUp className="w-5 h-5 text-pine-accent" />}
          />
        </button>

        <button
          onClick={() => setSelectedPhase(selectedPhase === 'Monitor' ? 'ALL' : 'Monitor')}
          className={`text-left transition-all ${selectedPhase === 'Monitor' ? 'ring-2 ring-emerald-400 rounded-lg' : ''}`}
        >
          <StatCard
            title="Routine Monitor"
            value={monitorCount}
            unit="Safe Baseline"
            subtext="Low Vulnerability Benchmarks"
            variant="success"
            confidence="HIGH"
            icon={<Users className="w-5 h-5 text-risk-low" />}
          />
        </button>
      </div>

      {/* Priority Queue Table */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-pine-border pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-pine-text">
              RPI Ranked Habitation Queue ({filteredParcels.length} Parcels)
            </h2>
            {selectedPhase !== 'ALL' && (
              <span className="text-xs font-mono bg-pine-elevated text-pine-accent px-2 py-0.5 rounded border border-pine-accent/30">
                Phase Filter: {selectedPhase}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-pine-muted">Filter Village:</span>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="bg-pine-elevated text-pine-text border border-pine-border rounded px-2.5 py-1"
            >
              <option value="ALL">All Villages</option>
              {villages.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-pine-border text-pine-muted text-[11px] uppercase">
                <th className="pb-2 font-medium">Rank & ID</th>
                <th className="pb-2 font-medium">Habitation / Village</th>
                <th className="pb-2 font-medium">RPI Score</th>
                <th className="pb-2 font-medium">HRI Hazard</th>
                <th className="pb-2 font-medium">Urgency Tier</th>
                <th className="pb-2 font-medium">Demographics</th>
                <th className="pb-2 font-medium">Recommended Resettlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pine-border/60">
              {filteredParcels.slice(0, 50).map((p, idx) => {
                const isImmediate = p.urgency_phase === 'Immediate';
                return (
                  <tr key={p.parcel_id} className={`hover:bg-pine-elevated/40 transition-colors ${isImmediate ? 'bg-rose-950/15' : ''}`}>
                    <td className="py-2.5">
                      <span className="text-pine-muted text-[10px] mr-1.5">#{idx + 1}</span>
                      <strong className="text-pine-accent">{p.parcel_id}</strong>
                    </td>
                    <td className="py-2.5">
                      <span className="text-pine-text font-bold">{p.village}</span>
                      <span className="text-[10px] text-pine-muted block font-sans">
                        Survey {p.survey_no}/{p.subdivision_no} &bull; {p.land_use}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-sm font-bold ${isImmediate ? 'text-risk-high' : 'text-pine-accent'}`}>
                        {p.rpi_score}
                      </span>
                      <span className="text-[10px] text-pine-muted"> / 100</span>
                    </td>
                    <td className="py-2.5">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isImmediate 
                          ? 'bg-rose-950 text-rose-300 border-rose-800' 
                          : p.urgency_phase === 'Short-Term'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-pine-elevated text-pine-muted border-pine-border'
                      }`}>
                        {p.urgency_phase}
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] font-sans">
                      <span className="text-pine-text font-medium">{p.population_density} / km²</span>
                      <span className="text-[10px] text-pine-muted block font-mono">Slope: {p.slope_deg.toFixed(1)}°</span>
                    </td>
                    <td className="py-2.5 text-[11px] font-sans text-pine-muted">
                      {p.recommended_action}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredParcels.length > 50 && (
          <div className="text-center text-xs font-mono text-pine-muted pt-2">
            Showing top 50 highest priority habitations in queue (out of {filteredParcels.length} matching)
          </div>
        )}
      </div>

    </div>
  );
};
