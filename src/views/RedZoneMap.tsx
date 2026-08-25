import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { RiskBadge } from '../components/RiskBadge';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { FactorBreakdown } from '../components/FactorBreakdown';
import { AREA_HAZARD_REGISTRY, getHazardProfileForLocation } from '../data/areaHazardProfiles';
import { 
  Map as MapIcon, 
  Filter, 
  Layers, 
  Info, 
  Mountain, 
  CloudRain, 
  SlidersHorizontal,
  X,
  Compass,
  Building,
  Activity,
  Sparkles,
  Sliders,
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react';

export const RedZoneMap: React.FC = () => {
  const { 
    data, 
    selectedVillage, 
    setSelectedVillage, 
    selectedRiskFilter, 
    setSelectedRiskFilter,
    selectedParcel,
    setSelectedParcel,
    searchQuery,
    setSearchQuery,
    setActiveView
  } = useApp();

  const [activeInspectorVillage, setActiveInspectorVillage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  if (!data) return null;

  // Filter parcels
  const filteredParcels = useMemo(() => {
    return data.parcels.filter((p) => {
      if (selectedVillage !== 'ALL' && p.village !== selectedVillage) return false;
      if (selectedRiskFilter !== 'ALL' && p.risk_level !== selectedRiskFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.parcel_id.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q) ||
          p.survey_no.toLowerCase().includes(q) ||
          p.land_use.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.parcels, selectedVillage, selectedRiskFilter, searchQuery]);

  // Center based on selected village
  const mapCenter = useMemo(() => {
    if (selectedVillage === 'Meppadi') return [11.554, 76.128] as [number, number];
    if (selectedVillage === 'Achooranam') return [11.591, 76.012] as [number, number];
    if (selectedVillage === 'Kottathara') return [11.685, 76.039] as [number, number];
    if (selectedVillage === 'Kuppadithara') return [11.658, 76.009] as [number, number];
    return [11.605, 76.085] as [number, number];
  }, [selectedVillage]);

  const mapZoom = selectedVillage === 'ALL' ? 11 : 13;

  // Inspected village profile
  const inspectedProfile = activeInspectorVillage ? getHazardProfileForLocation(activeInspectorVillage) : null;

  return (
    <div className="relative min-h-[calc(100vh-60px)] bg-[#0B1310] text-pine-text flex flex-col p-3 lg:p-4 font-mono text-xs overflow-hidden">
      
      {/* 1. FLOATING TOP INTERACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#111D18]/95 backdrop-blur-md border border-[#1E3228] px-3 py-2 rounded-xl shadow-panel z-10">
        
        {/* Left: Module Badge & Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase shrink-0">
            02 RISK MAP
          </span>
          <div className="relative flex-1 bg-[#0B1310] border border-[#1E3228] rounded-lg">
            <Search className="w-3.5 h-3.5 text-pine-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search parcel, survey, hamlet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-8 pr-2.5 py-1 text-xs text-white placeholder:text-pine-muted/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Village Switcher + Filter Toggle */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center gap-1 bg-[#0B1310] border border-[#1E3228] px-2 py-1 rounded-lg">
            <span className="text-pine-muted text-[10px]">Village:</span>
            <select
              value={selectedVillage}
              onChange={(e) => {
                setSelectedVillage(e.target.value);
                if (e.target.value !== 'ALL') {
                  setActiveInspectorVillage(e.target.value);
                }
              }}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0B1310]">All 4 Study Villages</option>
              <option value="Meppadi" className="bg-[#0B1310]">Meppadi (Epicenter)</option>
              <option value="Achooranam" className="bg-[#0B1310]">Achooranam</option>
              <option value="Kottathara" className="bg-[#0B1310]">Kottathara</option>
              <option value="Kuppadithara" className="bg-[#0B1310]">Kuppadithara</option>
            </select>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 ${
              showFilters 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' 
                : 'bg-[#0B1310] text-pine-muted border-[#1E3228] hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

        </div>
      </div>

      {/* Expandable Filters Tray (on demand) */}
      {showFilters && (
        <div className="mt-2 p-2.5 bg-[#111D18] border border-[#1E3228] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs z-10 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-pine-muted">Risk Level:</span>
              <select
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
                className="bg-[#0B1310] text-white border border-[#1E3228] rounded px-2 py-0.5"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk Only</option>
                <option value="MEDIUM">Medium Risk Only</option>
                <option value="LOW">Low Risk Only</option>
              </select>
            </div>
          </div>
          <div className="text-[11px] text-pine-muted">
            Displaying <strong className="text-emerald-400">{filteredParcels.length}</strong> cadastral parcels
          </div>
        </div>
      )}

      {/* 2. FULL SCREEN-WIDTH INTERACTIVE MAP VIEWPORT */}
      <div className="relative flex-1 mt-2.5 rounded-xl overflow-hidden border border-[#1E3228] shadow-panel bg-[#0B1310]">
        
        <MapComponent
          parcels={filteredParcels}
          candidateSites={data.candidate_sites}
          runoutPaths={data.runout_paths}
          demPoints={data.dem_sample}
          selectedParcel={selectedParcel}
          onSelectParcel={(p) => {
            setSelectedParcel(p);
            setActiveInspectorVillage(null);
          }}
          center={mapCenter}
          zoom={mapZoom}
          height="calc(100vh - 180px)"
          onOpenDetailedAnalysis={(itm) => {
            if (itm.village) {
              setActiveInspectorVillage(itm.village);
            }
          }}
        />

        {/* 3. CONTEXTUAL DRAWER (When a Village is Selected) */}
        {inspectedProfile && !selectedParcel && (
          <div className="absolute top-3 right-3 bottom-3 z-[1000] w-80 max-w-[calc(100vw-30px)] bg-[#0E1A15]/98 backdrop-blur-md border border-[#1E3228] rounded-xl p-4 shadow-modal flex flex-col justify-between overflow-y-auto pointer-events-auto animate-slideLeft">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E3228] pb-2">
                <span className="text-[10px] uppercase font-bold text-rose-400">
                  {inspectedProfile.category}
                </span>
                <button
                  onClick={() => setActiveInspectorVillage(null)}
                  className="p-1 text-pine-muted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-white uppercase font-serif">
                  {inspectedProfile.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <RiskBadge level={inspectedProfile.riskLevel} score={inspectedProfile.riskScore} size="sm" />
                  <span className="text-[10px] text-pine-muted">Score: {inspectedProfile.riskScore}/100</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-1.5 bg-[#0B1310] p-3 rounded-lg border border-[#1E3228] text-[11px]">
                <div className="flex justify-between">
                  <span className="text-pine-muted">Landslide Susceptibility:</span>
                  <strong className="text-rose-400 font-mono">{inspectedProfile.landslideProb}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-pine-muted">Flood Inundation Risk:</span>
                  <strong className="text-cyan-400 font-mono">{inspectedProfile.floodProb}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-pine-muted">24h Rainfall Recorded:</span>
                  <strong className="text-blue-400 font-mono">{inspectedProfile.rainfall24h} mm</strong>
                </div>
                <div className="flex justify-between border-t border-[#1E3228] pt-1">
                  <span className="text-pine-muted">Affected Population:</span>
                  <strong className="text-white font-mono">{inspectedProfile.exposedPopulation.toLocaleString()} ({inspectedProfile.familiesCount} fam)</strong>
                </div>
              </div>

              <p className="text-[11px] text-pine-muted font-sans leading-relaxed">
                {inspectedProfile.summary}
              </p>
            </div>

            {/* Contextual Action Buttons */}
            <div className="pt-3 border-t border-[#1E3228] space-y-2">
              <button
                onClick={() => {
                  setSelectedVillage(inspectedProfile.name.split(' ')[0]);
                  setActiveView('relocation-engine');
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>FIND SAFE LAND</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedVillage(inspectedProfile.name.split(' ')[0]);
                    setActiveView('sdma-command');
                  }}
                  className="py-1.5 bg-[#15241E] hover:bg-[#1E342B] text-pine-text rounded-lg border border-[#1E3228] text-[10.5px] font-bold text-center"
                >
                  ANALYZE
                </button>
                <button
                  onClick={() => {
                    setSelectedVillage(inspectedProfile.name.split(' ')[0]);
                    setActiveView('what-if-simulation');
                  }}
                  className="py-1.5 bg-[#15241E] hover:bg-[#1E342B] text-pine-text rounded-lg border border-[#1E3228] text-[10.5px] font-bold text-center"
                >
                  SIMULATE
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 4. CONTEXTUAL DRAWER (When an Individual Parcel is Clicked) */}
        {selectedParcel && (
          <div className="absolute top-3 right-3 bottom-3 z-[1000] w-80 max-w-[calc(100vw-30px)] bg-[#0E1A15]/98 backdrop-blur-md border border-[#1E3228] rounded-xl p-4 shadow-modal flex flex-col justify-between overflow-y-auto pointer-events-auto animate-slideLeft">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E3228] pb-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase">
                  PARCEL INTELLIGENCE
                </span>
                <button
                  onClick={() => setSelectedParcel(null)}
                  className="p-1 text-pine-muted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-emerald-300 font-mono">
                    {selectedParcel.parcel_id}
                  </span>
                  <RiskBadge level={selectedParcel.risk_level} score={selectedParcel.risk_score} size="sm" />
                </div>
                <p className="text-[11px] text-pine-muted font-sans mt-0.5">
                  {selectedParcel.village} • Survey {selectedParcel.survey_no}/{selectedParcel.subdivision_no}
                </p>
              </div>

              {/* Physical Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 bg-[#0B1310] p-2.5 rounded-lg border border-[#1E3228] text-[10.5px]">
                <div>
                  <span className="text-pine-muted block">Slope Angle:</span>
                  <strong className="text-amber-400 font-mono">{selectedParcel.slope_deg.toFixed(1)}°</strong>
                </div>
                <div>
                  <span className="text-pine-muted block">Elevation:</span>
                  <strong className="text-white font-mono">{selectedParcel.elevation_m} m</strong>
                </div>
                <div>
                  <span className="text-pine-muted block">24h Rainfall:</span>
                  <strong className="text-cyan-400 font-mono">{selectedParcel.rainfall_24h_mm} mm</strong>
                </div>
                <div>
                  <span className="text-pine-muted block">Landslide Risk:</span>
                  <strong className="text-rose-400 font-mono">{Math.round((selectedParcel.landslide_probability || 0.8) * 100)}%</strong>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="p-2.5 rounded-lg bg-[#15241E] border border-[#1E3228] space-y-1">
                <span className="text-[10px] font-bold text-pine-muted uppercase block">Recommended Action:</span>
                <div className="text-xs font-bold text-emerald-300 font-sans">{selectedParcel.recommended_action}</div>
                <p className="text-[10px] text-pine-muted leading-tight">{selectedParcel.hazard_screening_basis}</p>
              </div>

              {/* Factor Breakdown */}
              <FactorBreakdown
                factors={selectedParcel.factors}
                totalScore={selectedParcel.risk_score}
              />
            </div>

            {/* Relocation Action */}
            <div className="pt-3 border-t border-[#1E3228] space-y-2">
              <button
                onClick={() => {
                  setSelectedVillage(selectedParcel.village);
                  setActiveView('relocation-engine');
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>RELOCATE THIS PARCEL</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
