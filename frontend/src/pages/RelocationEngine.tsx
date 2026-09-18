import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DataConfidenceTag } from '../components/common/DataConfidenceTag';
import { MapComponent } from '../components/map/MapComponent';
import { SAFE_SITES_REGISTRY, AREA_HAZARD_REGISTRY, getHazardProfileForLocation } from '../data/areaHazardProfiles';
import { SITE_RESOURCE_REGISTRY, DEFAULT_PLANNING_ASSUMPTIONS } from '../data/siteCapacityRegistry';
import { calculateSiteCapacity } from '../utils/capacityCalculator';
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
  FileCheck,
  Droplets,
  Ambulance,
  Car,
  Navigation,
  X
} from 'lucide-react';

/**
 * Calculates road winding transit distance (km) between two coordinates in Wayanad hills
 */
const calculateTransitDistanceKm = (coord1: [number, number], coord2: [number, number]): number => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadWindingFactor = 1.35; // Hill terrain detour factor
  return Math.round(R * c * roadWindingFactor * 10) / 10;
};

const VILLAGE_TO_SITE_MAP: Record<string, string> = {
  'Meppadi': 'KL-WYD-S01',
  'Chooralmala': 'KL-WYD-S01',
  'Mundakkai': 'KL-WYD-S01',
  'Achooranam': 'KL-WYD-S04',
  'Kottathara': 'KL-WYD-S03',
  'Kuppadithara': 'KL-WYD-S02',
  'Kalpetta': 'KL-WYD-S01',
  'Vythiri': 'KL-WYD-S01',
  'Padinharethara': 'KL-WYD-S05',
  'Mananthavady': 'KL-WYD-S02',
  'Sulthan Bathery': 'KL-WYD-S01'
};

export const RelocationEngine: React.FC = () => {
  const { data, selectedVillage, setSelectedVillage, selectedSite, setSelectedSite, setActiveView } = useApp();
  
  const [sourceArea, setSourceArea] = useState<string>(selectedVillage === 'ALL' ? 'Meppadi' : selectedVillage);
  
  // Default target load dynamically based on selected village's actual exposed population
  const initialProfile = getHazardProfileForLocation(sourceArea);
  const [requiredPop, setRequiredPop] = useState<number>(initialProfile.exposedPopulation || 4800);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(30);
  const [selectedSiteKey, setSelectedSiteKey] = useState<string>(VILLAGE_TO_SITE_MAP[sourceArea] || 'KL-WYD-S01');
  const [directiveNotice, setDirectiveNotice] = useState<string | null>(null);
  const [recommendedModalSite, setRecommendedModalSite] = useState<any | null>(null);

  // Sync village change with its realistic exposed displaced population
  useEffect(() => {
    const prof = getHazardProfileForLocation(sourceArea);
    if (prof && prof.exposedPopulation) {
      setRequiredPop(prof.exposedPopulation);
    }
  }, [sourceArea]);

  if (!data) return null;

  const sourceProfile = getHazardProfileForLocation(sourceArea);
  const candidateSites = Object.values(SAFE_SITES_REGISTRY);

  // Calculate distance from source village to every candidate site
  const sitesWithDistance = useMemo(() => {
    return candidateSites.map((site) => {
      const distance = calculateTransitDistanceKm(sourceProfile.coordinates, site.coordinates);
      const travelMins = Math.round(distance * 1.8); // 33 km/h average convoy speed on mountain roads
      const isReachable = distance <= maxDistanceKm;
      return {
        ...site,
        site_id: site.siteId,
        latitude: site.coordinates[0],
        longitude: site.coordinates[1],
        ccas_score: site.ccasScore,
        capacity_persons: site.capacityPersons,
        distanceFromOriginKm: distance,
        travelMins,
        isReachable
      };
    });
  }, [candidateSites, sourceProfile, maxDistanceKm]);

  // Dynamic filtering & ranking based on distance slider and suitability score
  const rankedSites = useMemo(() => {
    return sitesWithDistance
      .filter((s) => s.isReachable)
      .sort((a, b) => {
        // Multi-objective sorting: 60% suitability, 40% distance proximity
        const scoreA = a.ccasScore - (a.distanceFromOriginKm / maxDistanceKm) * 15;
        const scoreB = b.ccasScore - (b.distanceFromOriginKm / maxDistanceKm) * 15;
        return scoreB - scoreA;
      });
  }, [sitesWithDistance, maxDistanceKm]);

  const nearestSite = useMemo(() => {
    return [...sitesWithDistance].sort((a, b) => a.distanceFromOriginKm - b.distanceFromOriginKm)[0];
  }, [sitesWithDistance]);

  const activeCandidate = rankedSites.find(s => s.siteId === selectedSiteKey) || rankedSites[0] || sitesWithDistance[0];

  // Disaster epicenter coordinates (Meppadi Ground Zero)
  const originEpicenterCoord: [number, number] = [11.554, 76.128]; // Meppadi

  // Chosen destination coordinates (selected affected area or active candidate site)
  const chosenDestinationCoord: [number, number] = useMemo(() => {
    if (sourceArea !== 'Meppadi' && AREA_HAZARD_REGISTRY[sourceArea]?.coordinates) {
      return AREA_HAZARD_REGISTRY[sourceArea].coordinates;
    }
    return [activeCandidate.latitude, activeCandidate.longitude];
  }, [sourceArea, activeCandidate]);

  // Convoy road transit distance from Meppadi to the chosen place
  const transitDistanceKm = useMemo(() => {
    return calculateTransitDistanceKm(originEpicenterCoord, chosenDestinationCoord);
  }, [chosenDestinationCoord]);

  const transitTravelMins = Math.round(transitDistanceKm * 1.8);

  // Dynamic viewport centering between Meppadi and the chosen place
  const mapCenter: [number, number] = useMemo(() => {
    return [
      (originEpicenterCoord[0] + chosenDestinationCoord[0]) / 2,
      (originEpicenterCoord[1] + chosenDestinationCoord[1]) / 2
    ];
  }, [chosenDestinationCoord]);

  const mapZoom = useMemo(() => {
    const dLat = Math.abs(originEpicenterCoord[0] - chosenDestinationCoord[0]);
    const dLon = Math.abs(originEpicenterCoord[1] - chosenDestinationCoord[1]);
    const maxSpan = Math.max(dLat, dLon);
    if (maxSpan > 0.18) return 10.5;
    if (maxSpan > 0.08) return 11.5;
    return 12.2;
  }, [chosenDestinationCoord]);

  const handleRecommendSite = (site: any) => {
    setSelectedSiteKey(site.siteId);
    if (setSelectedSite) {
      setSelectedSite(site);
    }
    setRecommendedModalSite(site);
    setDirectiveNotice(`Official SDMA Relocation Directive issued: Authorizing transfer of ${requiredPop.toLocaleString()} persons from ${sourceArea} to ${site.name} (${site.distanceFromOriginKm} km transit).`);
    setTimeout(() => setDirectiveNotice(null), 6000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full text-pine-text font-sans">
      
      {/* 1. HEADER BANNER */}
      <div className="bg-[#111D18] border border-[#1E3228] p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white">
            Find the Safest Feasible Destination
          </h1>
          <p className="text-sm sm:text-base text-pine-muted font-sans mt-1 max-w-2xl leading-relaxed">
            Multi-objective algorithmic solver pairing vulnerable communities with screened, high-capacity resettlement zones outside all hazard corridors.
          </p>
        </div>

        {/* Visual Stepper Flow + Quick Capacity Jump */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('carrying-capacity')}
            className="px-4 py-2.5 bg-[#15241E] hover:bg-[#1E342B] text-emerald-400 font-bold rounded-xl border border-[#1E3228] flex items-center gap-2 transition-all text-sm shadow-sm cursor-pointer"
          >
            <Building className="w-4 h-4" />
            <span>OPEN CARRYING CAPACITY ENGINE</span>
          </button>
        </div>
      </div>

      {directiveNotice && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-300 font-mono text-sm flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{directiveNotice}</span>
        </div>
      )}

      {/* 2. MAIN DECISION WORKSPACE: CONTROLS & RANKED SITES vs ROUTE MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Interactive Preference Solvers & Ranked List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Filter Preferences Panel */}
          <div className="bg-[#111D18] border border-[#1E3228] p-4 rounded-xl space-y-3.5 shadow-panel">
            <div className="flex items-center justify-between border-b border-[#1E3228] pb-2">
              <span className="text-xs text-emerald-400 font-bold uppercase">
                Relocation Origin & Population Demand:
              </span>
              <DataConfidenceTag confidence="HIGH" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Source Village */}
              <div>
                <label className="text-pine-muted text-xs font-semibold block mb-1">Affected Area:</label>
                <select
                  value={sourceArea}
                  onChange={(e) => {
                    const chosenVillage = e.target.value;
                    setSourceArea(chosenVillage);
                    setSelectedVillage(chosenVillage);
                    const prof = getHazardProfileForLocation(chosenVillage);
                    if (prof && prof.exposedPopulation) {
                      setRequiredPop(prof.exposedPopulation);
                    }
                    const targetSiteId = VILLAGE_TO_SITE_MAP[chosenVillage] || 'KL-WYD-S01';
                    setSelectedSiteKey(targetSiteId);
                    const matchedSite = candidateSites.find(s => s.siteId === targetSiteId);
                    if (matchedSite && setSelectedSite) {
                      setSelectedSite(matchedSite);
                    }
                  }}
                  className="w-full bg-[#0B1310] text-white border border-[#1E3228] rounded-lg p-1.5 focus:outline-none font-bold cursor-pointer"
                >
                  {Object.entries(AREA_HAZARD_REGISTRY).map(([key, v]) => (
                    <option key={key} value={key} className="bg-[#0E1A15]">
                      {key} ({v.exposedPopulation.toLocaleString()} exposed)
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Population Slider / Input */}
              <div>
                <div className="flex justify-between text-[10px] text-pine-muted mb-1">
                  <span>Displaced Load:</span>
                  <strong className="text-emerald-400 font-mono">{requiredPop.toLocaleString()}p</strong>
                </div>
                <input
                  type="range"
                  min={100}
                  max={6000}
                  step={50}
                  value={requiredPop}
                  onChange={(e) => setRequiredPop(Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-[#0B1310] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Active Maximum Transit Distance Slider */}
            <div className="space-y-1 pt-1 border-t border-[#1E3228]/80">
              <div className="flex justify-between text-[10.5px] text-pine-muted">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span>Maximum Transit Distance:</span>
                </span>
                <strong className="text-emerald-400 font-mono">{maxDistanceKm} km</strong>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-[#0B1310] rounded"
              />
              <div className="flex justify-between text-[9px] text-pine-muted font-sans">
                <span>5 km (Immediate buffer)</span>
                <span>Active: {rankedSites.length} of {candidateSites.length} sites reachable</span>
                <span>40 km (District wide)</span>
              </div>
            </div>
          </div>

          {/* If No Sites Reachable Alert Banner */}
          {rankedSites.length === 0 && (
            <div className="p-3 bg-amber-950/80 border border-amber-500 rounded-xl text-amber-300 font-sans text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-mono font-bold text-[11px] text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>NO SAFE SITES WITHIN {maxDistanceKm} KM OF {sourceArea.toUpperCase()}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The nearest screened safe site is <strong>{nearestSite.name.split('(')[0]}</strong> at <strong>{nearestSite.distanceFromOriginKm} km</strong> (~{nearestSite.travelMins} mins convoy transit).
              </p>
              <button
                onClick={() => setMaxDistanceKm(Math.ceil(nearestSite.distanceFromOriginKm + 2))}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-[10px] rounded-lg transition-all"
              >
                Expand Radius to {Math.ceil(nearestSite.distanceFromOriginKm + 2)} km &rarr;
              </button>
            </div>
          )}

          {/* Dynamically Ranked Safe Destinations List */}
          <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl space-y-2.5 shadow-panel">
            <div className="text-[10px] text-pine-muted uppercase font-bold tracking-wider border-b border-[#1E3228] pb-1.5 flex items-center justify-between">
              <span>Feasible Destinations for {sourceArea} ({rankedSites.length} Sites):</span>
              <span className="text-emerald-400 font-normal">Within {maxDistanceKm} km Radius</span>
            </div>

            <div className="space-y-2.5">
              {rankedSites.map((site, index) => {
                const rank = index + 1;
                const isSelected = selectedSiteKey === site.siteId;
                
                // Calculate site-specific capacity & resource constraints for this exact destination
                const siteLedger = SITE_RESOURCE_REGISTRY[site.siteId] || SITE_RESOURCE_REGISTRY['KL-WYD-S01'];
                const siteCalc = calculateSiteCapacity(siteLedger, DEFAULT_PLANNING_ASSUMPTIONS, requiredPop);
                const isCapacityEnough = siteCalc.practicalCapacity >= requiredPop;

                return (
                  <div
                    key={site.siteId}
                    onClick={() => {
                      setSelectedSiteKey(site.siteId);
                      setSelectedSite(site);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/35 border-emerald-500 shadow-panel'
                        : 'bg-[#0B1310] border-[#1E3228] hover:border-emerald-800'
                    }`}
                  >
                    {/* Header: Site Name, Rank, Transit Distance, and Practical Capacity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          rank === 1 ? 'bg-sky-400 text-black' : rank === 2 ? 'bg-emerald-400 text-black' : 'bg-amber-400 text-black'
                        }`}>
                          0{rank}
                        </span>
                        <div>
                          <h2 className="font-bold text-white text-xs">{site.name.split('(')[0]}</h2>
                          <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-sans">
                            <span>{siteCalc.suitabilityScore}% suitability</span>
                            <span>&bull;</span>
                            <span className="text-cyan-300 font-mono font-bold">🛣️ {site.distanceFromOriginKm} km (~{site.travelMins} min)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                          isCapacityEnough 
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {siteCalc.practicalCapacity.toLocaleString()}p safe cap
                        </span>
                      </div>
                    </div>

                    {/* Site Available Resources Summary Chip */}
                    <div className="mt-2 pt-1.5 border-t border-[#1E3228]/80 grid grid-cols-3 gap-1 text-[9.5px] text-pine-muted font-mono bg-[#0E1A15] p-1.5 rounded-lg border border-[#1E3228]/60">
                      <div>🚑 <strong className="text-white">{siteLedger.ambulancesStationed} Amb</strong></div>
                      <div>💧 <strong className="text-cyan-400">{(siteLedger.waterDailyAvailableLiters/1000).toFixed(0)}k L/d</strong></div>
                      <div>🚽 <strong className="text-purple-300">{siteLedger.toiletsAvailable} Toilets</strong></div>
                    </div>

                    {/* Expanded Candidate Details with Live Demand & On-Site Availability */}
                    {isSelected && (
                      <div className="mt-2.5 pt-2 border-t border-[#1E3228] space-y-2 text-[10.5px] animate-fadeIn font-sans">
                        
                        {/* Transit Corridor & Terrain Details */}
                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] bg-[#0E1A15] p-2 rounded-lg border border-[#1E3228]">
                          <div>• Distance: <strong className="text-cyan-400">{site.distanceFromOriginKm} km from {sourceArea}</strong></div>
                          <div>• Convoy Time: <strong className="text-white">{site.travelMins} minutes</strong></div>
                          <div>• Slope: <strong className="text-amber-400">{site.slopeDeg}° (Flat)</strong></div>
                          <div>• Usable Land: <strong className="text-white">{site.usableAreaHa} Ha</strong></div>
                        </div>

                        {/* Resource Logistics Demand for Selected Origin City */}
                        <div className="bg-[#0B1310] p-2.5 rounded-lg border border-[#1E3228] space-y-1.5 font-mono text-[10px]">
                          <div className="text-emerald-400 font-bold uppercase text-[9.5px] flex items-center justify-between">
                            <span>Demand for {sourceArea} ({requiredPop.toLocaleString()} People):</span>
                            <span className="text-amber-300 font-bold">Bottleneck: {siteCalc.limitingResource}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1.5 text-pine-text pt-0.5">
                            <div className="p-1 bg-[#12221B] rounded border border-[#1E3228]">
                              <span className="text-pine-muted block text-[9px]">Ambulances:</span>
                              <strong className="text-white">{siteCalc.resources.ambulances.requiredValue} req</strong>
                              <span className={`block text-[8.5px] font-bold ${siteCalc.resources.ambulances.status === 'Sufficient' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                ({siteCalc.resources.ambulances.coveragePct}% cov)
                              </span>
                            </div>

                            <div className="p-1 bg-[#12221B] rounded border border-[#1E3228]">
                              <span className="text-pine-muted block text-[9px]">Daily Water:</span>
                              <strong className="text-cyan-400">{(siteCalc.resources.water.requiredValue / 1000).toFixed(0)}k L/d</strong>
                              <span className={`block text-[8.5px] font-bold ${siteCalc.resources.water.status === 'Sufficient' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                ({siteCalc.resources.water.coveragePct}% cov)
                              </span>
                            </div>

                            <div className="p-1 bg-[#12221B] rounded border border-[#1E3228]">
                              <span className="text-pine-muted block text-[9px]">Sanitation:</span>
                              <strong className="text-purple-300">{siteCalc.resources.sanitation.requiredValue} toilets</strong>
                              <span className={`block text-[8.5px] font-bold ${siteCalc.resources.sanitation.status === 'Sufficient' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                ({siteCalc.resources.sanitation.coveragePct}% cov)
                              </span>
                            </div>
                          </div>

                          <div className="text-[9.5px] text-pine-muted font-sans pt-1">
                            {siteCalc.limitingResourceExplanation}
                          </div>
                        </div>

                        <p className="text-pine-muted text-[11px] leading-relaxed">
                          {site.description}
                        </p>

                        <div className="space-y-1 text-emerald-300 text-[10px] font-mono">
                          <div>🛣️ Access: {site.accessRoad}</div>
                          <div>💧 Water: {site.waterSupply}</div>
                          <div>⚡ Power: {site.powerGrid}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecommendSite(site);
                            }}
                            className={`py-2 text-white font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-hero-glow ${
                              selectedSiteKey === site.siteId ? 'bg-emerald-500 ring-2 ring-emerald-300' : 'bg-emerald-600 hover:bg-emerald-500'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{selectedSiteKey === site.siteId ? '✓ RECOMMENDED' : 'RECOMMEND SITE'}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveView('carrying-capacity');
                            }}
                            className="py-2 bg-[#15241E] hover:bg-[#1E342B] text-emerald-400 font-mono font-bold text-xs rounded-lg border border-[#1E3228] transition-all flex items-center justify-center gap-1.5"
                          >
                            <Building className="w-3.5 h-3.5" />
                            <span>AUDIT CAPACITY</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Visual Relocation Map & Corridor Display (7 cols) */}
        <div className="lg:col-span-7 lg:sticky lg:top-4 self-start bg-[#111D18] border border-[#1E3228] rounded-xl p-3.5 space-y-3 shadow-panel">
          <div className="flex items-center justify-between border-b border-[#1E3228] pb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">VISUAL TRANSIT CORRIDOR</span>
              <span className="text-pine-muted text-[11px]">
                {sourceArea === 'Meppadi' ? (
                  <>Meppadi &rarr; {activeCandidate.name.split('(')[0]}</>
                ) : (
                  <>Meppadi &rarr; <span className="text-emerald-400 font-bold">{sourceArea}</span> &rarr; {activeCandidate.name.split('(')[0]}</>
                )}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              🛣️ {transitDistanceKm} km (~{transitTravelMins} min convoy)
            </span>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#1E3228]">
            <MapComponent
              parcels={data.parcels.filter(p => p.village === sourceArea)}
              candidateSites={rankedSites}
              runoutPaths={data.runout_paths}
              selectedSite={activeCandidate}
              selectedVillage={sourceArea}
              transitOrigin={originEpicenterCoord}
              transitTarget={chosenDestinationCoord}
              transitDestinationName={
                sourceArea !== 'Meppadi'
                  ? `${sourceArea} (${activeCandidate.name.split('(')[0].trim()})`
                  : activeCandidate.name.split('(')[0].trim()
              }
              center={mapCenter}
              zoom={mapZoom}
              height="680px"
            />
          </div>

          <div className="p-3 bg-[#0B1310] rounded-xl border border-[#1E3228] flex items-center justify-between text-[11px] font-sans">
            <span className="text-pine-muted">
              Origin: <strong className="text-rose-400">Meppadi Epicenter</strong> &bull; Chosen Area: <strong className="text-emerald-300">{sourceArea} ({requiredPop.toLocaleString()} People)</strong> &bull; Destination: <strong className="text-sky-300">{activeCandidate.name.split('(')[0]}</strong>
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              CCAS {activeCandidate.ccasScore}/100 &bull; {transitDistanceKm} km Transit
            </span>
          </div>
        </div>

      </div>

      {/* SDMA RELOCATION DIRECTIVE EXECUTION MODAL */}
      {recommendedModalSite && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111D18] border border-emerald-500/80 rounded-2xl max-w-xl w-full p-5 shadow-modal space-y-4 font-mono animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E3228] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">SDMA RELOCATION DIRECTIVE ISSUED</span>
              </div>
              <button 
                onClick={() => setRecommendedModalSite(null)}
                className="text-pine-muted hover:text-white p-1 rounded-lg hover:bg-[#15241E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1 text-xs">
              <div className="text-emerald-300 font-bold">
                ✓ Relocation Allocation Confirmed for {recommendedModalSite.name}
              </div>
              <div className="text-pine-muted text-[11px]">
                Directing transfer of <strong>{requiredPop.toLocaleString()} displaced persons</strong> (~{Math.round(requiredPop / 4)} families) from <strong>{sourceArea}</strong>.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-[#0B1310] border border-[#1E3228] rounded-xl space-y-1">
                <span className="text-[10px] text-pine-muted uppercase">Corridor Distance & Transit:</span>
                <div className="text-white font-bold text-sm">
                  {recommendedModalSite.distanceFromOriginKm} km
                </div>
                <div className="text-emerald-400 text-[11px]">
                  ~{recommendedModalSite.travelMins} min mountain convoy
                </div>
              </div>

              <div className="p-2.5 bg-[#0B1310] border border-[#1E3228] rounded-xl space-y-1">
                <span className="text-[10px] text-pine-muted uppercase">Safe Land Capacity:</span>
                <div className="text-white font-bold text-sm">
                  {recommendedModalSite.capacityPersons.toLocaleString()} Persons
                </div>
                <div className="text-emerald-400 text-[11px]">
                  CCAS Score: {recommendedModalSite.ccasScore}/100
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#0B1310] border border-[#1E3228] rounded-xl space-y-1.5 text-xs">
              <div className="text-[10px] text-pine-muted uppercase font-bold">Mobilization Fleet Requirements:</div>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-1.5 bg-[#15241E] rounded-lg border border-[#1E3228]">
                  <div className="text-white font-bold">{Math.ceil(requiredPop / 35)}</div>
                  <div className="text-pine-muted text-[9.5px]">KSRTC Buses</div>
                </div>
                <div className="p-1.5 bg-[#15241E] rounded-lg border border-[#1E3228]">
                  <div className="text-white font-bold">{Math.ceil(requiredPop / 500)}</div>
                  <div className="text-pine-muted text-[9.5px]">Ambulances</div>
                </div>
                <div className="p-1.5 bg-[#15241E] rounded-lg border border-[#1E3228]">
                  <div className="text-white font-bold">{(requiredPop * 70 / 1000).toFixed(0)}k L/d</div>
                  <div className="text-pine-muted text-[9.5px]">Potable Water</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E3228]">
              <button
                onClick={() => {
                  setRecommendedModalSite(null);
                  setActiveView('carrying-capacity');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-hero-glow flex items-center gap-1.5"
              >
                <Building className="w-3.5 h-3.5" />
                <span>AUDIT ON-SITE CAPACITY & RESOURCES</span>
              </button>
              <button
                onClick={() => setRecommendedModalSite(null)}
                className="px-4 py-2 bg-[#15241E] hover:bg-[#1E342B] text-pine-text font-bold text-xs rounded-xl border border-[#1E3228] transition-all"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
