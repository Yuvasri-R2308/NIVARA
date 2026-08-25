import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/RiskBadge';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { MapComponent } from '../components/MapComponent';
import { StatCard } from '../components/StatCard';
import { AREA_HAZARD_REGISTRY, getHazardProfileForLocation } from '../data/areaHazardProfiles';
import { 
  ShieldAlert, 
  Search, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  X, 
  Activity, 
  Mountain, 
  Waves, 
  CloudRain, 
  Compass, 
  Users, 
  CheckCircle2, 
  Sliders, 
  Radio, 
  Layers, 
  FileText,
  Building,
  Database,
  ExternalLink
} from 'lucide-react';

export const SDMACommand: React.FC = () => {
  const { 
    data, 
    setActiveView, 
    selectedVillage, 
    setSelectedVillage, 
    setSelectedParcel,
    searchQuery,
    setSearchQuery 
  } = useApp();

  const [isRiskDrawerOpen, setIsRiskDrawerOpen] = useState(false);
  const [activeLayerFilter, setActiveLayerFilter] = useState<'multi-hazard' | 'landslide' | 'flood' | 'rainfall' | 'population'>('multi-hazard');
  const [executionNotice, setExecutionNotice] = useState<string | null>(null);

  if (!data) return null;

  const { candidate_sites, parcels, metrics_summary } = data;

  // Selected village profile (default Meppadi if ALL)
  const currentVillageKey = selectedVillage === 'ALL' ? 'Meppadi' : selectedVillage;
  const currentProfile = getHazardProfileForLocation(currentVillageKey);

  // Filter parcels based on layer filter & search
  const filteredParcels = parcels.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.parcel_id.toLowerCase().includes(q) || 
             p.village.toLowerCase().includes(q) || 
             p.survey_no.toLowerCase().includes(q);
    }
    if (selectedVillage !== 'ALL' && p.village !== selectedVillage) return false;
    if (activeLayerFilter === 'landslide') return (p.landslide_probability || 0) > 0.6;
    if (activeLayerFilter === 'flood') return (p.flood_probability || 0) > 0.5;
    if (activeLayerFilter === 'rainfall') return (p.rainfall_24h_mm || 0) > 150;
    if (activeLayerFilter === 'population') return (p.population_density || 0) > 10;
    return true;
  });

  const handleExecuteDirective = () => {
    setExecutionNotice(`SDMA Emergency Relocation Order Executed: Immediate evacuation authorized for 250 Meppadi families to Safe Zones D & A.`);
    setTimeout(() => setExecutionNotice(null), 6000);
  };

  return (
    <div className="p-3 lg:p-5 space-y-4 max-w-7xl mx-auto font-mono text-xs text-pine-text">
      
      {/* 1. STAGE 11 BANNER — EXACTLY AS REQUESTED */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
              STAGE 11 — SDMA WAR ROOM
            </span>
            <span className="text-[10px] font-mono text-pine-muted uppercase font-bold tracking-wider">
              DECISION CONTEXT
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white mt-1">
            SDMA Executive Command & Incident Relocation Dashboard
          </h1>
          <p className="text-xs text-pine-muted font-sans mt-1 max-w-3xl leading-relaxed">
            <strong>Decision Changed:</strong> Enables the SDMA Incident Commander to immediately authorize emergency evacuation for 250 epicenter families in Meppadi and instantly commit 5 screened candidate resettlement zones with guaranteed carrying capacity.
          </p>
        </div>

        <button
          onClick={handleExecuteDirective}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-all shadow-hero-glow flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>EXECUTE RELOCATION DIRECTIVE</span>
        </button>
      </div>

      {executionNotice && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{executionNotice}</span>
        </div>
      )}

      {/* 2. 4 SIGNATURE TOP KPI CARDS — EXACTLY AS REQUESTED */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: ACTIVE RED ZONES */}
        <div className="bg-[#111D18] border border-rose-900/60 p-3.5 rounded-xl space-y-1.5 shadow-panel">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-rose-400 tracking-wider">
            <span>ACTIVE RED ZONES</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-rose-400">1</span>
            <span className="text-xs text-white">Village (Meppadi)</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#1E3228] text-[10px]">
            <span className="text-pine-muted">250 / 250 Parcels</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
              ● HIGH
            </span>
          </div>
        </div>

        {/* Card 2: IMMEDIATE RELOCATION REQUIRED */}
        <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl space-y-1.5 shadow-panel">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            <span>IMMEDIATE RELOCATION REQUIRED</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-white">250</span>
            <span className="text-xs text-emerald-300">Families (1,000 Persons)</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#1E3228] text-[10px]">
            <span className="text-pine-muted truncate">Mundakkai & Chooralmala</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              ● HIGH
            </span>
          </div>
        </div>

        {/* Card 3: SAFE CANDIDATE CAPACITY */}
        <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl space-y-1.5 shadow-panel">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            <span>SAFE CANDIDATE CAPACITY</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-emerald-400">1720</span>
            <span className="text-xs text-white">Families (6,880 Persons)</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#1E3228] text-[10px]">
            <span className="text-pine-muted truncate">Across 5 Screened Lands</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              ● HIGH
            </span>
          </div>
        </div>

        {/* Card 4: DATA CONFIDENCE STATUS */}
        <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl space-y-1.5 shadow-panel">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-pine-muted tracking-wider">
            <span>DATA CONFIDENCE STATUS</span>
            <Database className="w-4 h-4 text-pine-muted" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-bold text-white">16 / 16</span>
            <span className="text-xs text-pine-muted">Datasets Verified</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#1E3228] text-[10px]">
            <span className="text-pine-muted">100% Ingestion Flow</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              ● HIGH
            </span>
          </div>
        </div>

      </div>

      {/* 3. MULTI-HAZARD SPATIAL SITUATION MAP SECTION */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-3 lg:p-4 space-y-3 shadow-panel">
        
        {/* Map Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1E3228] pb-2.5">
          
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="font-serif font-bold text-sm text-white">
              Multi-Hazard Spatial Situation Map
            </span>
            <span className="text-pine-muted text-[10px] hidden sm:inline">&bull; 4 Study Villages</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Village Selector */}
            <div className="flex items-center gap-1.5 bg-[#0B1310] border border-[#1E3228] px-2 py-1 rounded-lg">
              <span className="text-[10px] text-pine-muted">Location:</span>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0B1310]">All 4 Study Villages</option>
                <option value="Meppadi" className="bg-[#0B1310]">Meppadi (Epicenter)</option>
                <option value="Achooranam" className="bg-[#0B1310]">Achooranam</option>
                <option value="Kottathara" className="bg-[#0B1310]">Kottathara</option>
                <option value="Kuppadithara" className="bg-[#0B1310]">Kuppadithara</option>
              </select>
            </div>

            {/* Quick Search */}
            <div className="relative bg-[#0B1310] border border-[#1E3228] rounded-lg">
              <Search className="w-3 h-3 text-pine-muted absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search parcel / survey..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent pl-6 pr-2 py-1 text-xs text-white placeholder:text-pine-muted/60 focus:outline-none w-36 sm:w-44"
              />
            </div>
          </div>

        </div>

        {/* Map Viewport with Right-Side Situation Overlay */}
        <div className="relative rounded-xl overflow-hidden border border-[#1E3228] bg-[#0B1310]">
          
          <MapComponent
            parcels={filteredParcels}
            candidateSites={candidate_sites}
            runoutPaths={data.runout_paths}
            height="520px"
            onOpenDetailedAnalysis={(itm) => {
              if (itm.village) setSelectedVillage(itm.village);
              setIsRiskDrawerOpen(true);
            }}
          />

          {/* Right-Side Current Situation Floating Glass Panel */}
          <div className="absolute top-3 right-3 z-[1000] w-64 md:w-72 bg-[#0E1A15]/95 backdrop-blur-md border border-[#1E3228] rounded-xl p-3.5 shadow-modal text-xs font-mono space-y-3 pointer-events-auto">
            
            <div className="flex items-center justify-between border-b border-[#1E3228] pb-2">
              <span className="text-[10px] text-pine-muted uppercase font-bold tracking-wider">
                CURRENT SITUATION
              </span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase font-serif">
                  {currentProfile.name.split(' ')[0]}
                </h2>
                <RiskBadge level={currentProfile.riskLevel} score={currentProfile.riskScore} size="sm" />
              </div>
              <p className="text-[10px] text-rose-400 font-bold mt-0.5">
                {currentProfile.category}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="space-y-1.5 bg-[#0B1310]/80 p-2.5 rounded-lg border border-[#1E3228]">
              <div className="flex items-center justify-between">
                <span className="text-pine-muted text-[11px]">Landslide</span>
                <strong className="text-rose-400 font-mono">{currentProfile.landslideProb}%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-pine-muted text-[11px]">Flood</span>
                <strong className="text-cyan-400 font-mono">{currentProfile.floodProb}%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-pine-muted text-[11px]">Rainfall</span>
                <strong className="text-blue-400 font-mono">{Math.round(currentProfile.rainfall24h)} mm</strong>
              </div>
              <div className="flex items-center justify-between border-t border-[#1E3228]/80 pt-1">
                <span className="text-pine-muted text-[11px]">Population</span>
                <strong className="text-amber-300 font-mono">{currentProfile.exposedPopulation.toLocaleString()} affected</strong>
              </div>
            </div>

            {/* Open Drawer Button */}
            <button
              onClick={() => setIsRiskDrawerOpen(true)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>VIEW RISK BREAKDOWN</span>
            </button>

          </div>



        </div>

      </div>

      {/* 4. CONTEXTUAL SLIDE-OVER RISK BREAKDOWN DRAWER */}
      {isRiskDrawerOpen && (
        <div className="fixed inset-0 z-[2000] flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md h-full bg-[#0E1A15] border-l border-[#1E3228] p-5 shadow-2xl flex flex-col justify-between space-y-4 overflow-y-auto animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="space-y-2 border-b border-[#1E3228] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
                    {currentProfile.category}
                  </span>
                  <RiskBadge level={currentProfile.riskLevel} score={currentProfile.riskScore} size="sm" />
                </div>
                <button
                  onClick={() => setIsRiskDrawerOpen(false)}
                  className="p-1 text-pine-muted hover:text-white hover:bg-pine-panel rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-xl font-bold font-serif text-white">
                {currentProfile.name}
              </h2>
              <p className="text-xs text-pine-muted font-sans">
                Comprehensive multi-hazard diagnostic and population vulnerability profile.
              </p>
            </div>

            {/* Drawer Body Details */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              
              {/* Geotechnical Hazard Spectrum */}
              <div className="space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">
                  Hazard Matrix Breakdown:
                </span>
                <div className="grid grid-cols-2 gap-2 bg-[#0B1310] p-3 rounded-lg border border-[#1E3228]">
                  <div>
                    <span className="text-[10px] text-pine-muted block">Landslide Risk:</span>
                    <strong className="text-rose-400 font-mono text-sm">{currentProfile.landslideProb}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-pine-muted block">Flood Inundation:</span>
                    <strong className="text-cyan-400 font-mono text-sm">{currentProfile.floodProb}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-pine-muted block">Slope Steepness:</span>
                    <strong className="text-amber-400 font-mono text-sm">{currentProfile.slopeDeg}°</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-pine-muted block">24h Precipitation:</span>
                    <strong className="text-blue-400 font-mono text-sm">{currentProfile.rainfall24h} mm</strong>
                  </div>
                </div>
              </div>

              {/* Affected Demographics */}
              <div className="space-y-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">
                  Affected Population & Families:
                </span>
                <div className="bg-[#0B1310] p-3 rounded-lg border border-[#1E3228] space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-pine-muted">Exposed in Red-Zone:</span>
                    <strong className="text-white font-mono">{currentProfile.exposedPopulation.toLocaleString()} people</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pine-muted">Displaced Families:</span>
                    <strong className="text-amber-400 font-mono">{currentProfile.familiesCount} families</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pine-muted">Total Census Population:</span>
                    <strong className="text-pine-text font-mono">{currentProfile.censusPopulation.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Dominant Hazard Description */}
              <div className="bg-[#12221B] p-3.5 rounded-lg border border-[#1E3228] space-y-1.5">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">
                  Dominant Hazard Mechanism:
                </span>
                <p className="text-xs text-pine-text font-sans leading-relaxed">
                  {currentProfile.summary}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="bg-emerald-950/30 p-3.5 rounded-lg border border-emerald-800/60 space-y-1.5">
                <span className="text-[10px] text-emerald-300 font-bold uppercase block">
                  Recommended SDMA Action:
                </span>
                <p className="text-xs text-white font-sans font-medium leading-relaxed">
                  {currentProfile.actionRequired}
                </p>
                <div className="text-[11px] text-emerald-400/90 pt-1 border-t border-emerald-900/60 font-mono">
                  Assigned Target: <strong>{currentProfile.assignedSafeSite}</strong>
                </div>
              </div>

            </div>

            {/* Drawer Action Footer */}
            <div className="pt-3 border-t border-[#1E3228] space-y-2">
              <button
                onClick={() => {
                  setSelectedVillage(currentVillageKey);
                  setIsRiskDrawerOpen(false);
                  setActiveView('relocation-engine');
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-hero-glow"
              >
                <Sparkles className="w-4 h-4" />
                <span>RELOCATE THIS VILLAGE NOW</span>
              </button>

              <button
                onClick={() => {
                  setIsRiskDrawerOpen(false);
                  setActiveView('what-if-simulation');
                }}
                className="w-full py-2 bg-[#15241E] hover:bg-[#1E342B] text-pine-muted hover:text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 border border-[#1E3228]"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>RUN WHAT-IF SIMULATION</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
