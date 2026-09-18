import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { DataConfidenceTag } from '../components/common/DataConfidenceTag';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { OverviewAlertSummaryCard } from '../components/alerts/OverviewAlertSummaryCard';
import { ExplainabilityPanel } from '../components/risk/ExplainabilityPanel';
import { MapComponent } from '../components/map/MapComponent';
import { StatCard } from '../components/common/StatCard';
import { AREA_HAZARD_REGISTRY, getHazardProfileForLocation } from '../data/areaHazardProfiles';
import { calculateBayesianProbability } from '../services/bayesianRiskService';
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
  ExternalLink,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const SDMACommand: React.FC = () => {
  const { 
    data, 
    setActiveView, 
    selectedVillage, 
    setSelectedVillage, 
    setSelectedParcel,
    searchQuery,
    setSearchQuery,
    liveWeather 
  } = useApp();

  const [isRiskDrawerOpen, setIsRiskDrawerOpen] = useState(false);
  const [showLocationIntelCard, setShowLocationIntelCard] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeLayerFilter, setActiveLayerFilter] = useState<'multi-hazard' | 'landslide' | 'flood' | 'rainfall' | 'population'>('multi-hazard');
  const [executionNotice, setExecutionNotice] = useState<string | null>(null);

  if (!data) return null;

  const { candidate_sites, parcels, metrics_summary } = data;

  // Dynamically resolve target village profile based on search query or selected village dropdown
  const activeLocationQuery = searchQuery.trim() || (selectedVillage === 'ALL' ? 'Meppadi' : selectedVillage);
  const currentProfile = getHazardProfileForLocation(activeLocationQuery);
  const currentVillageKey = currentProfile.name.split('(')[0].trim();
  const bayesian = calculateBayesianProbability(currentVillageKey, currentProfile.rainfall24h);

  // Filter parcels based on layer filter & search
  const filteredParcels = parcels.filter(p => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.parcel_id.toLowerCase().includes(q) || 
             p.village.toLowerCase().includes(q) || 
             p.survey_no.toLowerCase().includes(q);
    }
    if (selectedVillage !== 'ALL') {
      if (selectedVillage === 'Chooralmala' || selectedVillage === 'Mundakkai' || selectedVillage === 'Chembra') {
        if (p.village !== 'Meppadi') return false;
      } else if (p.village !== selectedVillage) {
        return false;
      }
    }
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full text-pine-text font-sans">
      
      {/* 1. WAR ROOM BANNER */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-5 lg:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
            SDMA Risk Assessment and Safe Relocation Dashboard
          </h1>
          <p className="text-sm sm:text-base text-pine-muted font-sans mt-1.5 max-w-4xl leading-relaxed">
            A decision-support dashboard that helps authorities quickly move families from dangerous areas to safe locations and ensure enough space for everyone.
          </p>
        </div>

      </div>

      {executionNotice && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-300 font-mono text-sm flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{executionNotice}</span>
        </div>
      )}

      {/* 2. 3 SIGNATURE TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Card 1: ACTIVE RED ZONES */}
        <div className="bg-[#111D18] border border-rose-900/60 p-5 lg:p-6 rounded-2xl space-y-3 shadow-panel">
          <div className="flex items-center justify-between text-sm uppercase font-bold text-rose-400 tracking-wider">
            <span>ACTIVE RED ZONES</span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-rose-400">1</span>
            <span className="text-base text-white font-sans font-medium">Village (Meppadi)</span>
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-[#1E3228] text-sm">
            <span className="text-pine-muted">250 / 250 Parcels</span>
            <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-xs">
              ● HIGH
            </span>
          </div>
        </div>

        {/* Card 2: IMMEDIATE RELOCATION REQUIRED (Red / High Urgency) */}
        <div className="bg-[#111D18] border border-rose-900/60 p-5 lg:p-6 rounded-2xl space-y-3 shadow-panel">
          <div className="flex items-center justify-between text-sm uppercase font-bold text-rose-400 tracking-wider">
            <span>IMMEDIATE RELOCATION REQUIRED</span>
            <Users className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">250</span>
            <span className="text-base text-rose-300 font-sans font-medium">Families (1,000 Persons)</span>
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-rose-900/40 text-sm">
            <span className="text-pine-muted truncate font-medium text-rose-300/90">Meppadi</span>
            <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-xs">
              ● HIGH
            </span>
          </div>
        </div>

        {/* Card 3: SAFE CANDIDATE CAPACITY */}
        <div className="bg-[#111D18] border border-[#1E3228] p-5 lg:p-6 rounded-2xl space-y-3 shadow-panel">
          <div className="flex items-center justify-between text-sm uppercase font-bold text-emerald-400 tracking-wider">
            <span>SAFE CANDIDATE CAPACITY</span>
            <Building className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-400">1720</span>
            <span className="text-base text-white font-sans font-medium">Families (6,880 Persons)</span>
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t border-[#1E3228] text-sm">
            <span className="text-pine-muted">Safe Zones D, A, E & F</span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs">
              ● SAFE
            </span>
          </div>
        </div>

      </div>

      {/* 3. MULTI-HAZARD SPATIAL SITUATION MAP SECTION */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-4 lg:p-6 space-y-4 shadow-panel">
        
        {/* Map Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E3228] pb-3.5">
          
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span className="font-serif font-bold text-base sm:text-lg text-white">
              Multi-Hazard Spatial Situation Map
            </span>
            <span className="text-pine-muted text-xs hidden sm:inline">&bull; 4 Study Villages</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Village Selector */}
            <div className="flex items-center gap-2 bg-[#0B1310] border border-[#1E3228] px-3 py-1.5 rounded-xl">
              <span className="text-xs text-pine-muted font-medium">Location:</span>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0B1310]">All Study Villages</option>
                <option value="Meppadi" className="bg-[#0B1310]">Meppadi (Disaster Epicenter)</option>
                <option value="Mundakkai" className="bg-[#0B1310]">Mundakkai (Upper Debris Origin)</option>
                <option value="Chooralmala" className="bg-[#0B1310]">Chooralmala (Bridge Runout Confluence)</option>
                <option value="Chembra" className="bg-[#0B1310]">Chembra Scarp (Headwall Crest)</option>
                <option value="Achooranam" className="bg-[#0B1310]">Achooranam (Tea Estate Ridge)</option>
                <option value="Kottathara" className="bg-[#0B1310]">Kottathara (Kabini Alluvial Basin)</option>
                <option value="Kuppadithara" className="bg-[#0B1310]">Kuppadithara (Safe Flatland Plateau)</option>
                <option value="Kalpetta" className="bg-[#0B1310]">Kalpetta (Plateau Administrative Hub)</option>
                <option value="Vythiri" className="bg-[#0B1310]">Vythiri (Ghat Pass Corridor)</option>
                <option value="Padinharethara" className="bg-[#0B1310]">Padinharethara (Banasura Divide)</option>
                <option value="Wayanad" className="bg-[#0B1310]">Wayanad Regional Context</option>
              </select>
            </div>

            {/* Expand / Maximize Tactical Map Toggle */}
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B1310] hover:bg-[#15241E] border border-[#1E3228] hover:border-emerald-500 text-xs sm:text-sm font-mono font-bold text-emerald-400 transition-all cursor-pointer shadow-sm"
              title={isMapExpanded ? "Restore Normal Dashboard" : "Maximize Tactical Map View"}
            >
              {isMapExpanded ? <Minimize2 className="w-4 h-4 text-rose-400" /> : <Maximize2 className="w-4 h-4 text-emerald-400" />}
              <span>{isMapExpanded ? 'RESTORE DASHBOARD' : 'EXPAND TACTICAL MAP'}</span>
            </button>
          </div>
        </div>

        {/* Map Viewport with Right-Side Situation Overlay */}
        <div className={`relative rounded-2xl overflow-hidden border transition-all ${
          isMapExpanded ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-[#1E3228]'
        } bg-[#0B1310]`}>
          
          <MapComponent
            parcels={filteredParcels}
            candidateSites={candidate_sites}
            runoutPaths={data.runout_paths}
            selectedVillage={selectedVillage}
            center={selectedVillage === 'ALL' ? [11.58, 76.10] : undefined}
            zoom={selectedVillage === 'ALL' ? 12.3 : undefined}
            height={isMapExpanded ? 'calc(100vh - 160px)' : '760px'}
          />

          {/* Situation Intelligence Card */}
          {showLocationIntelCard && (
            <div className="absolute top-12 right-4 w-72 sm:w-84 bg-[#0A1410]/98 border border-[#1E3228] rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3.5 z-[1000] font-sans text-sm">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">
                      Location Intelligence
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                      bayesian.risk === 'VERY HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {bayesian.risk}
                    </span>
                  </div>
                  {/* Exit Cross Mark */}
                  <button
                    onClick={() => setShowLocationIntelCard(false)}
                    className="text-pine-muted hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                    title="Close card"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="font-serif font-bold text-white text-base sm:text-lg mt-1 truncate">
                  {currentProfile.name}
                </h2>
                <p className="text-sm text-rose-400 font-medium mt-0.5">
                  {currentProfile.category}
                </p>
              </div>

              {/* Quick Metrics Grid with HRI and Bayesian Probability */}
              <div className="space-y-2 bg-[#07110C]/90 p-3 rounded-xl border border-[#1E3228] font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-pine-muted">HRI Score:</span>
                  <strong className="text-white font-bold">{currentProfile.riskScore.toFixed(1)} / 100</strong>
                </div>
                <ConfidenceBadge maturity_mode="autonomous" maturity_index={78} className="w-full justify-center" />
                <div className="flex items-center justify-between">
                  <span className="text-pine-muted">Bayesian Prob:</span>
                  <strong className="text-rose-400 font-bold">{Math.round(bayesian.landslide_probability * 100)}%</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-pine-muted">95% Credible Int:</span>
                  <strong className="text-emerald-400">{bayesian.credible_interval_str}</strong>
                </div>
                <div className="flex items-center justify-between border-t border-[#1E3228]/80 pt-1.5">
                  <span className="text-pine-muted">Demographics:</span>
                  <strong className="text-amber-300">{currentProfile.exposedPopulation.toLocaleString()} people</strong>
                </div>
              </div>

              {/* Open Drawer Button */}
              <button
                onClick={() => setIsRiskDrawerOpen(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm font-mono text-sm cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>VIEW RISK BREAKDOWN</span>
              </button>

            </div>
          )}

        </div>

      </div>

      {/* 4. CONTEXTUAL SLIDE-OVER RISK BREAKDOWN DRAWER */}
      {isRiskDrawerOpen && (
        <div className="fixed inset-0 z-[2000] flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md h-full bg-[#0E1A15] border-l border-[#1E3228] p-5 shadow-2xl flex flex-col justify-between space-y-4 overflow-y-auto animate-slideLeft font-mono text-xs">
            
            {/* Drawer Header */}
            <div className="space-y-2 border-b border-[#1E3228] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
                    {currentProfile.category}
                  </span>
                  <RiskBadge level={currentProfile.riskLevel} score={currentProfile.riskScore} size="sm" />
                  <ConfidenceBadge maturity_mode="autonomous" maturity_index={78} />
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
              
              {/* Dual Intelligence Cards: HRI Severity vs Bayesian Likelihood */}
              <div className="grid grid-cols-2 gap-2 bg-[#0B1310] p-3 rounded-lg border border-[#1E3228]">
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-pine-muted block">HRI Score (Severity):</span>
                  <strong className="text-white text-base font-bold">{currentProfile.riskScore.toFixed(2)} / 100</strong>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9.5px] text-pine-muted block">Bayesian Hazard Prob:</span>
                  <strong className="text-rose-400 text-base font-bold">{Math.round(bayesian.landslide_probability * 100)}%</strong>
                  <span className="text-[9px] text-emerald-400 block font-mono">95% CI: {bayesian.credible_interval_str}</span>
                </div>
              </div>

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

              {/* Bayesian Explainability Box */}
              <div className="bg-[#12221B] p-3.5 rounded-lg border border-[#1E3228] space-y-1.5 font-sans">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block font-mono">
                  Why this Bayesian Probability?
                </span>
                <p className="text-xs text-pine-text leading-relaxed">
                  {bayesian.why_this_probability}
                </p>
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

      {/* 4. EMERGENCY ALERT & VOICE RESPONSE SUMMARY */}
      <OverviewAlertSummaryCard />

      {/* 5. DUAL INTELLIGENCE & RESIDENCE CORRIDORS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel A: Priority Evacuation Sectors */}
        <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-5 lg:p-6 space-y-4 shadow-panel">
          <div className="flex items-center justify-between border-b border-[#1E3228] pb-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-rose-400" />
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                Live Evacuation Corridors & Priority Sectors
              </h3>
            </div>
            <button
              onClick={() => setActiveView('priority-queue')}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>VIEW FULL QUEUE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-[#0B1310] border border-rose-900/60 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">P1 CRITICAL</span>
                  <span className="font-bold text-white font-sans text-sm">Mundakkai High-Slope Sector</span>
                </div>
                <p className="text-pine-muted text-[11px] font-sans mt-0.5">140 Families (560 Persons) &bull; Assigned to Site D (Meppadi Valley Buffer)</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-400 font-bold text-xs shrink-0">EVACUATE NOW</span>
            </div>

            <div className="p-3.5 bg-[#0B1310] border border-rose-900/40 rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">P1 CRITICAL</span>
                  <span className="font-bold text-white font-sans text-sm">Chooralmala Stream Bank Sector</span>
                </div>
                <p className="text-pine-muted text-[11px] font-sans mt-0.5">110 Families (440 Persons) &bull; Assigned to Site A (Kalpetta East)</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-400 font-bold text-xs shrink-0">EVACUATE NOW</span>
            </div>

            <div className="p-3.5 bg-[#0B1310] border border-[#1E3228] rounded-xl flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold text-[10px]">P2 WATCH</span>
                  <span className="font-bold text-white font-sans text-sm">Attamala Secondary Ridge</span>
                </div>
                <p className="text-pine-muted text-[11px] font-sans mt-0.5">65 Families (260 Persons) &bull; Pre-allocated to Site E (Vythiri Plateau)</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 font-bold text-xs shrink-0">STANDBY</span>
            </div>
          </div>
        </div>

        {/* Panel B: Safe Candidate Relocation Lands */}
        <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-5 lg:p-6 space-y-4 shadow-panel">
          <div className="flex items-center justify-between border-b border-[#1E3228] pb-3">
            <div className="flex items-center gap-2.5">
              <Building className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                Safe Relocation Lands & Ready Capacity
              </h3>
            </div>
            <button
              onClick={() => setActiveView('candidate-sites')}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>VIEW ALL SITES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-[#0B1310] border border-emerald-900/60 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-sans text-sm">Site A (Kalpetta East)</span>
                <span className="text-emerald-400 font-bold">98.4% SAFE</span>
              </div>
              <p className="text-pine-muted text-[11px] font-sans">Cap: 450 Families (1,800 P)</p>
              <div className="w-full bg-[#17241F] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[24%]" />
              </div>
            </div>

            <div className="p-3 bg-[#0B1310] border border-emerald-900/60 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-sans text-sm">Site D (Meppadi Buffer)</span>
                <span className="text-emerald-400 font-bold">96.8% SAFE</span>
              </div>
              <p className="text-pine-muted text-[11px] font-sans">Cap: 380 Families (1,520 P)</p>
              <div className="w-full bg-[#17241F] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[37%]" />
              </div>
            </div>

            <div className="p-3 bg-[#0B1310] border border-emerald-900/60 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-sans text-sm">Site E (Vythiri Plateau)</span>
                <span className="text-emerald-400 font-bold">99.1% SAFE</span>
              </div>
              <p className="text-pine-muted text-[11px] font-sans">Cap: 520 Families (2,080 P)</p>
              <div className="w-full bg-[#17241F] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[12%]" />
              </div>
            </div>

            <div className="p-3 bg-[#0B1310] border border-emerald-900/60 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-sans text-sm">Site F (Mananthavady)</span>
                <span className="text-emerald-400 font-bold">97.5% SAFE</span>
              </div>
              <p className="text-pine-muted text-[11px] font-sans">Cap: 370 Families (1,480 P)</p>
              <div className="w-full bg-[#17241F] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[0%]" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
