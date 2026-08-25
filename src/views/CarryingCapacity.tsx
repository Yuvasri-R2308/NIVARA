import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { 
  Scale, 
  Users, 
  Droplets, 
  Truck, 
  TreePine, 
  Sparkles, 
  Building2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const CarryingCapacity: React.FC = () => {
  const { data, selectedSite, setSelectedSite, setActiveView } = useApp();
  const [activeSiteId, setActiveSiteId] = useState<string>(selectedSite?.site_id || 'RELOC-SITE-04');

  if (!data) return null;

  const { candidate_sites } = data;
  const site = candidate_sites.find(s => s.site_id === activeSiteId) || candidate_sites[0];

  const radarData = [
    { subject: 'Slope Stability', A: site.slope_stability_score, fullMark: 100 },
    { subject: 'Water Supply', A: site.water_availability_score, fullMark: 100 },
    { subject: 'Road Access', A: site.road_access_score, fullMark: 100 },
    { subject: 'Ecological Safety', A: site.ecological_safety_score, fullMark: 100 },
    { subject: 'Social Infra', A: site.social_infra_score, fullMark: 100 },
  ];

  const capacityComparisonData = candidate_sites.map(s => ({
    name: s.name.split(' ')[0],
    Families: s.capacity_families,
    Persons: s.capacity_persons,
    CCAS: s.ccas_score
  }));

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* View Decision Banner */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              STAGE 09 — CARRYING CAPACITY (CCAS)
            </span>
            <span className="text-xs font-mono text-pine-muted">SAFE CAPACITY ASSESSMENT</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-pine-text mt-1">
            Comprehensive Carrying Capacity Assessment (CCAS)
          </h1>
          <p className="text-xs lg:text-sm text-pine-muted mt-1 max-w-3xl">
            <strong>Decision Changed:</strong> Allows SDMA urban planners to impose strict, data-backed population ceilings per candidate parcel, preventing water depletion, slope degradation, and social overcrowding in resettlement colonies.
          </p>
        </div>

        <button
          onClick={() => setActiveView('relocation-engine')}
          className="px-4 py-2 bg-pine-accent hover:bg-emerald-400 text-pine-bg font-mono font-bold text-xs rounded transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>MATCH VULNERABLE HABITATIONS</span>
        </button>
      </div>

      {/* Aggregate KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Candidate Capacity"
          value={data.metrics_summary.total_candidate_capacity_families}
          unit="Families"
          subtext="6,880 Resettlement Slots Safe"
          variant="accent"
          confidence="HIGH"
          icon={<Users className="w-5 h-5 text-pine-accent" />}
        />
        <StatCard
          title="Usable Safe Land"
          value="58.5"
          unit="Hectares"
          subtext="Across 5 Screened Plateaus & Buffers"
          confidence="HIGH"
          icon={<Scale className="w-5 h-5 text-pine-text" />}
        />
        <StatCard
          title="Average CCAS Score"
          value="87.4"
          unit="/ 100"
          subtext="High Infrastructure Suitability Index"
          variant="success"
          confidence="HIGH"
          icon={<ShieldCheck className="w-5 h-5 text-risk-low" />}
        />
        <StatCard
          title="Emergency Demand Coverage"
          value="688%"
          unit="Surplus"
          subtext="1,720 capacity vs 250 Meppadi families"
          variant="success"
          confidence="HIGH"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Main CCAS Dashboard Layout: Selector + Radar + Sub-Factor Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 Cols: Candidate Site Selector */}
        <div className="lg:col-span-4 space-y-3 font-mono text-xs">
          <div className="text-pine-muted uppercase font-bold text-[11px]">Select Candidate Site for CCAS Audit:</div>

          <div className="space-y-2.5">
            {candidate_sites.map((s) => {
              const isSelected = s.site_id === activeSiteId;
              return (
                <div
                  key={s.site_id}
                  onClick={() => {
                    setActiveSiteId(s.site_id);
                    setSelectedSite(s);
                  }}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-pine-elevated border-pine-accent shadow-panel' 
                      : 'bg-pine-panel border-pine-border hover:border-pine-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-400">{s.site_id}</span>
                    <DataConfidenceTag confidence={s.data_confidence} size="sm" showLabel={false} />
                  </div>
                  <div className="font-sans font-bold text-pine-text text-sm mb-1">{s.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-pine-muted border-t border-pine-border/40 pt-1.5 mt-1.5">
                    <span>CCAS: <strong className="text-pine-accent">{s.ccas_score}/100</strong></span>
                    <span>Cap: <strong className="text-white">{s.capacity_families} Fam</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Deep CCAS Suitability Radar & Sub-Factor Scorecard */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Site Detailed Scorecard */}
          <div className="bg-pine-panel border border-pine-border rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-pine-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold text-xs">{site.site_id}</span>
                  <DataConfidenceTag confidence={site.data_confidence} size="sm" />
                </div>
                <h2 className="text-xl font-serif font-bold text-pine-text mt-1">{site.name}</h2>
                <p className="text-xs text-pine-muted font-sans mt-0.5">{site.description}</p>
              </div>

              <div className="bg-pine-elevated p-3 rounded-lg border border-pine-accent/30 text-right shrink-0">
                <span className="text-[10px] font-mono text-pine-muted uppercase block">Composite CCAS Score</span>
                <span className="text-2xl font-bold font-mono text-pine-accent">{site.ccas_score}</span>
                <span className="text-xs font-mono text-pine-muted"> / 100</span>
              </div>
            </div>

            {/* Radar Chart + Capacity Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              
              {/* Suitability Radar */}
              <div className="h-64 bg-pine-bg rounded-lg border border-pine-border p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#25352E" />
                    <PolarAngleAxis dataKey="subject" stroke="#8FA79B" tick={{ fontSize: 10, fill: '#8FA79B', fontFamily: 'Space Grotesk' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#25352E" tick={{ fontSize: 9, fill: '#8FA79B' }} />
                    <Radar name={site.site_id} dataKey="A" stroke="#4ADE9A" fill="#4ADE9A" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Sub-factor Breakdown Numbers */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2 rounded bg-pine-bg border border-pine-border flex items-center justify-between">
                  <span className="text-pine-muted">Slope Stability (Angle: {site.slope_deg}°):</span>
                  <strong className="text-pine-accent">{site.slope_stability_score} / 100 [LIVE]</strong>
                </div>
                <div className="p-2 rounded bg-pine-bg border border-pine-border flex items-center justify-between">
                  <span className="text-pine-muted">Water Availability & Aquifer:</span>
                  <strong className="text-pine-accent">{site.water_availability_score} / 100 [LIVE]</strong>
                </div>
                <div className="p-2 rounded bg-pine-bg border border-pine-border flex items-center justify-between">
                  <span className="text-pine-muted">Road & Transport Access:</span>
                  <strong className="text-pine-accent">{site.road_access_score} / 100 [LIVE]</strong>
                </div>
                <div className="p-2 rounded bg-pine-bg border border-pine-border flex items-center justify-between">
                  <span className="text-pine-muted">Ecological Non-Encroachment:</span>
                  <strong className="text-pine-accent">{site.ecological_safety_score} / 100 [LIVE]</strong>
                </div>
                <div className="p-2 rounded bg-pine-bg border border-pine-border flex items-center justify-between">
                  <span className="text-pine-muted">Social & Healthcare Proximity:</span>
                  <strong className="text-amber-300">{site.social_infra_score} / 100 [MODELED]</strong>
                </div>
              </div>

            </div>

            {/* Carrying Capacity Population Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-pine-elevated p-3 rounded-lg border border-pine-border text-xs font-mono">
              <div>
                <span className="text-pine-muted block">Maximum Safe Families:</span>
                <strong className="text-lg text-emerald-400">{site.capacity_families} Families</strong>
              </div>
              <div>
                <span className="text-pine-muted block">Maximum Safe Population:</span>
                <strong className="text-lg text-emerald-400">{site.capacity_persons} Persons</strong>
              </div>
              <div>
                <span className="text-pine-muted block">Usable Land Envelope:</span>
                <strong className="text-lg text-white">{site.usable_area_ha} Hectares</strong>
              </div>
            </div>

            {/* Data Confidence Explanation */}
            <div className="p-3 bg-pine-bg rounded border border-pine-border text-[11px] font-mono text-pine-muted flex items-start gap-2">
              <span className="text-pine-accent font-bold">&bull; Confidence Rationale:</span>
              <span className="font-sans text-pine-text">{site.confidence_reason}</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
