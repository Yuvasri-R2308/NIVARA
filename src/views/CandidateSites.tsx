import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { StatCard } from '../components/StatCard';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { 
  MapPinCheck, 
  ShieldCheck, 
  Check, 
  X, 
  Layers, 
  Maximize2, 
  ArrowRight,
  Sparkles,
  TreePine,
  Waves,
  Mountain
} from 'lucide-react';

export const CandidateSites: React.FC = () => {
  const { data, selectedSite, setSelectedSite, setActiveView } = useApp();
  const [filterVillage, setFilterVillage] = useState<string>('ALL');

  if (!data) return null;

  const { candidate_sites } = data;
  const filteredSites = candidate_sites.filter(s => filterVillage === 'ALL' || s.village.includes(filterVillage));
  const activeSite = selectedSite || candidate_sites[0];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* View Decision Banner */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              STAGE 08 — CANDIDATE SITES
            </span>
            <span className="text-xs font-mono text-pine-muted">MULTI-TIER EXCLUSION SIEVE</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-pine-text mt-1">
            Screened Candidate Relocation Lands
          </h1>
          <p className="text-xs lg:text-sm text-pine-muted mt-1 max-w-3xl">
            <strong>Decision Changed:</strong> Guarantees that SDMA land acquisition commissioners only allocate safe, stable, non-hazard government reserve lands, eliminating the catastrophic error of resettling survivors in secondary hazard zones.
          </p>
        </div>

        <button
          onClick={() => setActiveView('carrying-capacity')}
          className="px-4 py-2 bg-pine-accent hover:bg-emerald-400 text-pine-bg font-mono font-bold text-xs rounded transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>VIEW CARRYING CAPACITY (CCAS)</span>
        </button>
      </div>

      {/* 4-Step Exclusion Sieve Box */}
      <div className="bg-pine-elevated border border-pine-border rounded-lg p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-pine-border pb-2">
          <span className="text-pine-accent font-bold uppercase tracking-wider">
            Automated 4-Step Spatial Exclusion Screening Criteria:
          </span>
          <DataConfidenceTag confidence="HIGH" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-2.5 rounded bg-pine-bg border border-pine-border flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-pine-text block">1. Red-Zone Exclusion</strong>
              <span className="text-[11px] text-pine-muted font-sans">100% outside HRI &ge; 60 and GSI high-susceptibility zones.</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-pine-bg border border-pine-border flex items-start gap-2">
            <Waves className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-pine-text block">2. Floodplain Buffer</strong>
              <span className="text-[11px] text-pine-muted font-sans">&gt;150m buffer from 100-yr flood & river channel inundation.</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-pine-bg border border-pine-border flex items-start gap-2">
            <Mountain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-pine-text block">3. Slope Threshold</strong>
              <span className="text-[11px] text-pine-muted font-sans">Strictly &le;10° slope angle to prevent shear stress failure.</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-pine-bg border border-pine-border flex items-start gap-2">
            <TreePine className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-pine-text block">4. Ecological Forest Exclusion</strong>
              <span className="text-[11px] text-pine-muted font-sans">Zero encroachment into notified Western Ghats reserve forests.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Sites Map & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Spatial Layout */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-pine-text">
              Approved Resettlement Sites Map
            </h2>
            <span className="text-xs font-mono text-emerald-400">{filteredSites.length} Sites Qualified</span>
          </div>

          <MapComponent
            parcels={data.parcels}
            candidateSites={filteredSites}
            selectedSite={activeSite}
            onSelectSite={(s) => setSelectedSite(s)}
            height="500px"
            showRunout={false}
            showSites={true}
          />
        </div>

        {/* Right 5 Cols: Candidate Sites Cards */}
        <div className="lg:col-span-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-pine-muted uppercase font-bold text-[11px]">Screened Safe Sites Directory:</span>
            <select
              value={filterVillage}
              onChange={(e) => setFilterVillage(e.target.value)}
              className="bg-pine-panel text-pine-text border border-pine-border rounded px-2 py-1 text-xs"
            >
              <option value="ALL">All Destinations</option>
              <option value="Kuppadithara">Kuppadithara</option>
              <option value="Kottathara">Kottathara</option>
              <option value="Achooranam">Achooranam</option>
              <option value="Vythiri">Vythiri Institutional</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredSites.map((s) => {
              const isSelected = activeSite.site_id === s.site_id;
              return (
                <div
                  key={s.site_id}
                  onClick={() => setSelectedSite(s)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-pine-elevated border-pine-accent shadow-panel' 
                      : 'bg-pine-panel border-pine-border hover:border-pine-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-400 text-sm">{s.site_id}</span>
                    <DataConfidenceTag confidence={s.data_confidence} size="sm" />
                  </div>

                  <div className="font-sans font-bold text-pine-text text-sm mb-1">
                    {s.name}
                  </div>

                  <p className="text-[11px] text-pine-muted font-sans line-clamp-2 mb-2.5">
                    {s.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-pine-bg p-2.5 rounded border border-pine-border text-[11px]">
                    <div>CCAS Score: <strong className="text-pine-accent">{s.ccas_score} / 100</strong></div>
                    <div>Safe Area: <strong className="text-white">{s.usable_area_ha} Ha</strong></div>
                    <div>Capacity (Families): <strong className="text-emerald-400">{s.capacity_families}</strong></div>
                    <div>Capacity (Persons): <strong className="text-emerald-400">{s.capacity_persons}</strong></div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-pine-border/40 mt-2 text-[10px]">
                    <span className="text-pine-muted font-sans">Slope: {s.slope_deg}° &bull; All 4 exclusions verified</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSite(s);
                        setActiveView('carrying-capacity');
                      }}
                      className="text-pine-accent hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>Full CCAS Audit &rarr;</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
