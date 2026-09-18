import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { DataConfidenceTag } from '../components/common/DataConfidenceTag';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { StatCard } from '../components/common/StatCard';
import { calculateBayesianProbability } from '../services/bayesianRiskService';
import { 
  ListOrdered, 
  Filter, 
  Users, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Sparkles,
  HelpCircle
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

  const activeParcels = useMemo(() => {
    return selectedVillage === 'ALL' ? parcels : parcels.filter(p => p.village === selectedVillage);
  }, [parcels, selectedVillage]);

  const immediateCount = activeParcels.filter(p => p.urgency_phase === 'Immediate').length;
  const shortTermCount = activeParcels.filter(p => p.urgency_phase === 'Short-Term').length;
  const mediumTermCount = activeParcels.filter(p => p.urgency_phase === 'Medium-Term').length;
  const monitorCount = activeParcels.filter(p => p.urgency_phase === 'Monitor').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full text-pine-text">
      
      {/* View Decision Banner */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-pine-text">
            Vulnerable Family Relocation Priority System
          </h1>
          <p className="text-xs lg:text-sm text-pine-muted mt-1 max-w-3xl leading-relaxed">
            The system identifies families at higher risk and gives them priority for relocation, transportation, and financial support.
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

      {/* Phased Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setSelectedPhase(selectedPhase === 'Immediate' ? 'ALL' : 'Immediate')}
          className={`text-left transition-all ${selectedPhase === 'Immediate' ? 'ring-2 ring-risk-high rounded-lg' : ''}`}
        >
          <StatCard
            title="Immediate Phase (0-30d)"
            value={immediateCount}
            unit="Families (1,000+ Persons)"
            variant="danger"
            icon={<ShieldAlert className="w-5 h-5 text-risk-high" />}
          />
        </button>

        <button
          onClick={() => setSelectedPhase(selectedPhase === 'Short-Term' ? 'ALL' : 'Short-Term')}
          className={`text-left transition-all ${selectedPhase === 'Short-Term' ? 'ring-2 ring-amber-400 rounded-lg' : ''}`}
        >
          <StatCard
            title="Short-Term (30-90d)"
            value={shortTermCount}
            unit="Families"
            variant="warning"
            icon={<Clock className="w-5 h-5 text-amber-400" />}
          />
        </button>

        <button
          onClick={() => setSelectedPhase(selectedPhase === 'Medium-Term' ? 'ALL' : 'Medium-Term')}
          className={`text-left transition-all ${selectedPhase === 'Medium-Term' ? 'ring-2 ring-pine-accent rounded-lg' : ''}`}
        >
          <StatCard
            title="Medium-Term (90-180d)"
            value={mediumTermCount}
            unit="Families (Planned)"
            variant="default"
            icon={<TrendingUp className="w-5 h-5 text-pine-accent" />}
          />
        </button>
      </div>

      {/* Priority Queue Table with Bayesian Probability Column */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-pine-border pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-pine-text">
              RPI Ranked Family Relocation Queue ({filteredParcels.length} Families)
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
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className="border-b border-pine-border text-pine-muted text-xs uppercase">
                <th className="pb-3 font-semibold">Rank & ID</th>
                <th className="pb-3 font-semibold">Habitation / Village</th>
                <th className="pb-3 font-semibold">RPI Score</th>
                <th className="pb-3 font-semibold">HRI Hazard</th>
                <th className="pb-3 font-semibold">Bayesian Prob (95% CI)</th>
                <th className="pb-3 font-semibold">Urgency Tier</th>
                <th className="pb-3 font-semibold">Demographics</th>
                <th className="pb-3 font-semibold">Recommended Resettlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pine-border/60">
              {filteredParcels.slice(0, 50).map((p, idx) => {
                const isImmediate = p.urgency_phase === 'Immediate';
                const bayesian = calculateBayesianProbability(p.village, p.rainfall_24h_mm, p.slope_deg);
                return (
                  <tr key={p.parcel_id} className={`hover:bg-pine-elevated/40 transition-colors ${isImmediate ? 'bg-rose-950/15' : ''}`}>
                    <td className="py-3">
                      <span className="text-pine-muted text-xs mr-1.5">#{idx + 1}</span>
                      <strong className="text-pine-accent text-base">{p.parcel_id}</strong>
                    </td>
                    <td className="py-3">
                      <span className="text-pine-text font-bold text-base">{p.village}</span>
                      <span className="text-xs text-pine-muted block font-sans">
                        Survey {p.survey_no}/{p.subdivision_no} &bull; {p.land_use}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-base font-bold ${isImmediate ? 'text-risk-high' : 'text-pine-accent'}`}>
                        {p.rpi_score}
                      </span>
                      <span className="text-xs text-pine-muted"> / 100</span>
                    </td>
                    <td className="py-3">
                      <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                      <ConfidenceBadge maturity_mode="autonomous" maturity_index={78} className="mt-1" />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-base ${bayesian.landslide_probability >= 0.8 ? 'text-rose-400' : bayesian.landslide_probability >= 0.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {Math.round(bayesian.landslide_probability * 100)}%
                        </span>
                        <span className="text-xs text-pine-muted font-sans">
                          ({bayesian.credible_interval_str})
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                        isImmediate 
                          ? 'bg-rose-950 text-rose-300 border-rose-800' 
                          : p.urgency_phase === 'Short-Term'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-pine-elevated text-pine-muted border-pine-border'
                      }`}>
                        {p.urgency_phase}
                      </span>
                    </td>
                    <td className="py-3 text-xs font-sans">
                      <span className="text-pine-text font-semibold text-sm">{p.population_density} / km²</span>
                      <span className="text-xs text-pine-muted block font-mono">Slope: {p.slope_deg.toFixed(1)}°</span>
                    </td>
                    <td className="py-3 text-xs font-sans text-pine-muted leading-relaxed">
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
