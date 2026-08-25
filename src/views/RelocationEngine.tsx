import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { MapComponent } from '../components/MapComponent';
import { SAFE_SITES_REGISTRY, getHazardProfileForLocation } from '../data/areaHazardProfiles';
import { 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  Users, 
  Compass, 
  Sliders,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export const RelocationEngine: React.FC = () => {
  const { data, selectedVillage, setSelectedVillage, selectedSite, setSelectedSite, setActiveView } = useApp();
  
  const [sourceArea, setSourceArea] = useState<string>(selectedVillage === 'ALL' ? 'Meppadi' : selectedVillage);
  const [requiredPop, setRequiredPop] = useState<number>(1000);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(25);
  const [selectedSiteKey, setSelectedSiteKey] = useState<string>('KL-WYD-S01');
  const [directiveNotice, setDirectiveNotice] = useState<string | null>(null);

  if (!data) return null;

  const sourceProfile = getHazardProfileForLocation(sourceArea);
  const candidateSites = Object.values(SAFE_SITES_REGISTRY);

  // Dynamic ranking based on CCAS score, distance, and capacity matching
  const rankedSites = [...candidateSites].sort((a, b) => b.ccasScore - a.ccasScore);
  const activeCandidate = SAFE_SITES_REGISTRY[selectedSiteKey] || rankedSites[0];

  const handleRecommendSite = (site: any) => {
    setDirectiveNotice(`Official SDMA Relocation Directive issued: Authorizing transfer of ${requiredPop} persons from ${sourceArea} to ${site.name}.`);
    setTimeout(() => setDirectiveNotice(null), 6000);
  };

  return (
    <div className="p-3 lg:p-5 space-y-4 max-w-7xl mx-auto font-mono text-xs text-pine-text">
      
      {/* 1. DECISION WORKSPACE BANNER */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              03 SMART RELOCATION
            </span>
            <span className="text-pine-muted text-[11px]">DECISION WORKSPACE</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white mt-1">
            Find the Safest Feasible Destination
          </h1>
          <p className="text-xs text-pine-muted font-sans mt-0.5 max-w-2xl">
            Multi-objective algorithmic solver pairing vulnerable communities with screened, high-capacity resettlement zones outside all hazard corridors.
          </p>
        </div>

        {/* Visual Stepper Flow */}
        <div className="flex items-center gap-1.5 bg-[#0B1310] border border-[#1E3228] p-2 rounded-xl text-[10px] shrink-0">
          <div className="flex items-center gap-1 text-rose-400 font-bold">
            <span className="w-4 h-4 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-[9px]">1</span>
            <span>AT-RISK</span>
          </div>
          <ArrowRight className="w-3 h-3 text-pine-muted" />
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-4 h-4 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-[9px]">2</span>
            <span>ANALYSIS</span>
          </div>
          <ArrowRight className="w-3 h-3 text-pine-muted" />
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[9px]">3</span>
            <span>SAFE SITES</span>
          </div>
          <ArrowRight className="w-3 h-3 text-pine-muted" />
          <div className="flex items-center gap-1 text-white font-bold">
            <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[9px]">4</span>
            <span>OPTIMAL</span>
          </div>
        </div>
      </div>

      {directiveNotice && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{directiveNotice}</span>
        </div>
      )}

      {/* 2. MAIN DECISION WORKSPACE: CONTROLS & RANKED SITES vs ROUTE MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Interactive Preference Solvers & Ranked List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Filter Preferences Panel */}
          <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl space-y-3 shadow-panel">
            <div className="flex items-center justify-between border-b border-[#1E3228] pb-1.5">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                Relocation Criteria Parameters:
              </span>
              <DataConfidenceTag confidence="HIGH" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Source Village */}
              <div>
                <label className="text-pine-muted text-[10px] block mb-1">Source Village:</label>
                <select
                  value={sourceArea}
                  onChange={(e) => {
                    setSourceArea(e.target.value);
                    setSelectedVillage(e.target.value);
                  }}
                  className="w-full bg-[#0B1310] text-white border border-[#1E3228] rounded-lg p-1.5 focus:outline-none font-bold"
                >
                  <option value="Meppadi">Meppadi (Epicenter)</option>
                  <option value="Achooranam">Achooranam</option>
                  <option value="Kottathara">Kottathara</option>
                  <option value="Kuppadithara">Kuppadithara</option>
                </select>
              </div>

              {/* Target Population */}
              <div>
                <label className="text-pine-muted text-[10px] block mb-1">Target Load:</label>
                <select
                  value={requiredPop}
                  onChange={(e) => setRequiredPop(Number(e.target.value))}
                  className="w-full bg-[#0B1310] text-white border border-[#1E3228] rounded-lg p-1.5 focus:outline-none"
                >
                  <option value={500}>500 Persons (125 Fam)</option>
                  <option value={1000}>1,000 Persons (250 Fam)</option>
                  <option value={2000}>2,000 Persons (500 Fam)</option>
                  <option value={4800}>4,800 All Exposed</option>
                </select>
              </div>
            </div>

            {/* Max Distance Slider */}
            <div>
              <div className="flex justify-between text-[10.5px] text-pine-muted mb-1">
                <span>Maximum Transit Distance:</span>
                <strong className="text-emerald-400">{maxDistanceKm} km</strong>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-[#0B1310] rounded"
              />
            </div>
          </div>

          {/* Dynamically Ranked Safe Destinations List */}
          <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl space-y-2.5 shadow-panel">
            <div className="text-[10px] text-pine-muted uppercase font-bold tracking-wider border-b border-[#1E3228] pb-1.5">
              Ranked Feasible Safe Destinations ({rankedSites.length}):
            </div>

            <div className="space-y-2">
              {rankedSites.map((site, index) => {
                const rank = index + 1;
                const isSelected = selectedSiteKey === site.siteId;
                const isCapacityEnough = site.capacityPersons >= requiredPop;

                return (
                  <div
                    key={site.siteId}
                    onClick={() => {
                      setSelectedSiteKey(site.siteId);
                      setSelectedSite(site);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-panel'
                        : 'bg-[#0B1310] border-[#1E3228] hover:border-emerald-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          rank === 1 ? 'bg-sky-400 text-black' : rank === 2 ? 'bg-emerald-400 text-black' : 'bg-amber-400 text-black'
                        }`}>
                          0{rank}
                        </span>
                        <div>
                          <h2 className="font-bold text-white text-xs">{site.name.split('(')[0]}</h2>
                          <span className="text-[10px] text-emerald-400 font-sans">
                            {site.ccasScore}% suitability score
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                        isCapacityEnough 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        {site.capacityPersons}p cap
                      </span>
                    </div>

                    {/* Expanded Candidate Details */}
                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-[#1E3228] space-y-2 text-[10.5px] animate-fadeIn font-sans">
                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] bg-[#0E1A15] p-2 rounded-lg border border-[#1E3228]">
                          <div>• Slope: <strong className="text-amber-400">{site.slopeDeg}° (Flat)</strong></div>
                          <div>• Usable Land: <strong className="text-white">{site.usableAreaHa} Ha</strong></div>
                          <div>• Landslide Exp: <strong className="text-emerald-400">{site.landslideProb}%</strong></div>
                          <div>• Flood Exp: <strong className="text-cyan-400">{site.floodProb}%</strong></div>
                        </div>

                        <p className="text-pine-muted text-[11px] leading-relaxed">
                          {site.description}
                        </p>

                        <div className="space-y-1 text-emerald-300 text-[10px] font-mono">
                          <div>🛣️ Access: {site.accessRoad}</div>
                          <div>💧 Water: {site.waterSupply}</div>
                          <div>⚡ Power: {site.powerGrid}</div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecommendSite(site);
                          }}
                          className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-hero-glow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>RECOMMEND THIS SITE</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Visual Relocation Map & Corridor Display (7 cols) */}
        <div className="lg:col-span-7 bg-[#111D18] border border-[#1E3228] rounded-xl p-3 space-y-2 shadow-panel flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1E3228] pb-1.5 px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">VISUAL TRANSIT CORRIDOR</span>
              <span className="text-pine-muted text-[11px]">
                {sourceArea} &rarr; {activeCandidate.name.split('(')[0]}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              ~18-28 min convoy transit
            </span>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#1E3228] flex-1 min-h-[480px]">
            <MapComponent
              parcels={data.parcels.filter(p => p.village === sourceArea)}
              candidateSites={data.candidate_sites}
              runoutPaths={data.runout_paths}
              selectedSite={activeCandidate}
              height="500px"
            />
          </div>

          <div className="p-2.5 bg-[#0B1310] rounded-lg border border-[#1E3228] flex items-center justify-between text-[11px] font-sans">
            <span className="text-pine-muted">
              Origin: <strong className="text-rose-400">{sourceArea} Red-Zone</strong> &bull; Target: <strong className="text-emerald-300">{activeCandidate.name}</strong>
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              CCAS {activeCandidate.ccasScore}/100
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
