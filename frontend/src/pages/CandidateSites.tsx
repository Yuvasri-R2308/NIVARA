import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/map/MapComponent';
import { StatCard } from '../components/common/StatCard';
import { DataConfidenceTag } from '../components/common/DataConfidenceTag';
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 w-full text-pine-text flex flex-col">
      
      {/* View Decision Banner */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel shrink-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white">
            Safe Relocation Lands
          </h1>
          <p className="text-sm sm:text-base text-pine-muted mt-1 max-w-3xl leading-relaxed">
            Shows government lands that have been checked and confirmed as safe for relocating affected families.
          </p>
        </div>

        <button
          onClick={() => setActiveView('carrying-capacity')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-sm rounded-xl transition-all shadow-hero-glow flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>VIEW CARRYING CAPACITY (CCAS)</span>
        </button>
      </div>

      {/* Sleek Compact 4-Step Exclusion Criteria Strip */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-mono shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs sm:text-sm">
            4-Step Spatial Screening:
          </span>
          <DataConfidenceTag confidence="HIGH" size="sm" />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <span className="flex items-center gap-1.5 text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>1. Red-Zone Excluded (HRI &lt; 60)</span>
          </span>
          <span className="text-pine-border hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <Waves className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>2. Floodplain Buffer (150m)</span>
          </span>
          <span className="text-pine-border hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <Mountain className="w-4 h-4 text-amber-400 shrink-0" />
            <span>3. Slope &le; 10°</span>
          </span>
          <span className="text-pine-border hidden sm:inline">&bull;</span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <TreePine className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>4. Forest (0% Encroach)</span>
          </span>
        </div>
      </div>

      {/* Large Candidate Sites Map & Matching Full-Height Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* Left 8 Cols: Expansive Full-Height Spatial Map */}
        <div className="lg:col-span-8 flex flex-col space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPinCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white">
                Approved Resettlement Sites Map
              </h2>
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-700">
              {filteredSites.length} Sites Qualified
            </span>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden border border-[#1E3228] shadow-panel bg-[#0B1310]">
            <MapComponent
              parcels={data.parcels}
              candidateSites={filteredSites}
              selectedSite={activeSite}
              onSelectSite={(s) => setSelectedSite(s)}
              center={[11.64, 76.06]}
              zoom={12.5}
              height="calc(100vh - 280px)"
              showRunout={false}
              showSites={true}
            />
          </div>
        </div>

        {/* Right 4 Cols: Candidate Sites Cards matching Map Height */}
        <div className="lg:col-span-4 flex flex-col h-[calc(100vh-280px)] min-h-[660px] 2xl:min-h-[800px] bg-[#111D18] border border-[#1E3228] rounded-2xl p-4 shadow-panel">
          
          <div className="flex items-center justify-between border-b border-[#1E3228] pb-3 shrink-0">
            <span className="text-white uppercase font-bold text-xs sm:text-sm font-mono tracking-wide">
              Safe Sites Directory
            </span>
            <select
              value={filterVillage}
              onChange={(e) => setFilterVillage(e.target.value)}
              className="bg-[#0B1310] text-emerald-400 font-mono font-bold border border-[#1E3228] rounded-lg px-2.5 py-1 text-xs sm:text-sm cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Destinations</option>
              <option value="Kuppadithara">Kuppadithara</option>
              <option value="Kottathara">Kottathara</option>
              <option value="Achooranam">Achooranam</option>
              <option value="Vythiri">Vythiri Institutional</option>
            </select>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1 mt-3 font-mono text-xs sm:text-sm">
            {filteredSites.map((s) => {
              const isSelected = activeSite.site_id === s.site_id;
              return (
                <div
                  key={s.site_id}
                  onClick={() => setSelectedSite(s)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#15241E] border-emerald-500 shadow-panel ring-1 ring-emerald-500/50' 
                      : 'bg-[#0B1310] border-[#1E3228] hover:border-emerald-600/50 hover:bg-[#111D18]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-emerald-400 text-sm sm:text-base">{s.site_id}</span>
                    <DataConfidenceTag confidence={s.data_confidence} size="sm" />
                  </div>

                  <div className="font-sans font-bold text-white text-base sm:text-lg mb-1">
                    {s.name}
                  </div>

                  <p className="text-xs text-pine-muted font-sans line-clamp-2 mb-3 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-[#0E1814] p-3 rounded-xl border border-[#1E3228] text-xs">
                    <div>CCAS Score: <strong className="text-emerald-400">{s.ccas_score} / 100</strong></div>
                    <div>Safe Area: <strong className="text-white">{s.usable_area_ha} Ha</strong></div>
                    <div>Capacity (Families): <strong className="text-emerald-400">{s.capacity_families}</strong></div>
                    <div>Capacity (Persons): <strong className="text-emerald-400">{s.capacity_persons}</strong></div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-[#1E3228] mt-2.5 text-xs">
                    <span className="text-pine-muted font-sans">Slope: {s.slope_deg}° &bull; All 4 exclusions verified</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSite(s);
                        setActiveView('carrying-capacity');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-bold cursor-pointer font-mono"
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
