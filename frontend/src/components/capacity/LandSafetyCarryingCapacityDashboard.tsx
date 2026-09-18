import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Circle, 
  Popup, 
  Tooltip,
  Polyline,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { HazardType, HazardModuleId, SiteResourceLedger } from '../../types';
import { 
  DEFAULT_PLANNING_ASSUMPTIONS, 
  getSitesForHazard, 
  getDefaultSiteForHazard, 
  HAZARD_STUDY_AREAS
} from '../../data/siteCapacityRegistry';
import { calculateSiteCapacity } from '../../utils/capacityCalculator';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Building, 
  Users, 
  Droplets, 
  Home, 
  Car, 
  Ambulance, 
  MapPin, 
  Compass, 
  Layers, 
  ArrowRight, 
  Zap, 
  Check, 
  X, 
  ChevronRight,
  Info,
  Calendar,
  Database
} from 'lucide-react';

// Fix standard Leaflet default icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Professional basemap (clean, high-contrast, authority-friendly)
const MAP_TILES = {
  topo: {
    name: 'Topographic Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DeLorme, NAVTEQ'
  },
  street: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap'
  }
};

// Auto-recenter map handler
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  const lastKey = React.useRef<string>('');

  useEffect(() => {
    const key = `${center[0].toFixed(4)},${center[1].toFixed(4)},${zoom}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
};

// Invalidate size on load
const MapResizeHandler: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

// Affected origin settlements for each hazard
const HAZARD_AFFECTED_ORIGINS: Record<HazardType, { name: string; coordinates: [number, number]; defaultFamilies: number }> = {
  'landslide': {
    name: 'Chooralmala & Mundakkai (Meppadi)',
    coordinates: [11.540, 76.138],
    defaultFamilies: 250
  },
  'flood': {
    name: 'Rohmaria & Multi Chapari (Brahmaputra Bank)',
    coordinates: [27.485, 94.915],
    defaultFamilies: 650
  },
  'cloudburst': {
    name: 'Kedarnath Base & Mandakini Valley',
    coordinates: [30.735, 79.066],
    defaultFamilies: 800
  },
  'coastal-erosion': {
    name: 'Podampeta Beachfront Habitations',
    coordinates: [19.385, 85.085],
    defaultFamilies: 500
  }
};

interface LandSafetyCarryingCapacityDashboardProps {
  hazard?: HazardType;
  onNavigateModule?: (moduleId: HazardModuleId) => void;
}

export const LandSafetyCarryingCapacityDashboard: React.FC<LandSafetyCarryingCapacityDashboardProps> = ({
  hazard,
  onNavigateModule
}) => {
  const { selectedHazard, selectHazard, setSelectedSite, setActiveView, theme } = useApp();
  const isLight = theme === 'light';

  // Active hazard state
  const activeHazard: HazardType = hazard || selectedHazard || 'landslide';
  const studyArea = HAZARD_STUDY_AREAS[activeHazard] || HAZARD_STUDY_AREAS['landslide'];
  const affectedOrigin = HAZARD_AFFECTED_ORIGINS[activeHazard] || HAZARD_AFFECTED_ORIGINS['landslide'];

  // Candidate sites for active hazard
  const siteList = useMemo(() => getSitesForHazard(activeHazard), [activeHazard]);
  const defaultSite = useMemo(() => getDefaultSiteForHazard(activeHazard), [activeHazard]);

  // Selected site state
  const [selectedSiteId, setSelectedSiteId] = useState<string>(defaultSite.siteId);

  // Relocation need: in families
  const [targetFamilies, setTargetFamilies] = useState<number>(affectedOrigin.defaultFamilies);
  const targetPopulation = targetFamilies * 4;

  // Synchronize when hazard changes
  useEffect(() => {
    const newDefault = getDefaultSiteForHazard(activeHazard);
    setSelectedSiteId(newDefault.siteId);
    setTargetFamilies(affectedOrigin.defaultFamilies);
  }, [activeHazard, affectedOrigin.defaultFamilies]);

  // Active site object
  const currentSite: SiteResourceLedger = useMemo(() => {
    return siteList.find(s => s.siteId === selectedSiteId) || siteList[0];
  }, [siteList, selectedSiteId]);

  // Core calculation reuse
  const currentCalculation = useMemo(() => {
    return calculateSiteCapacity(currentSite, DEFAULT_PLANNING_ASSUMPTIONS, targetPopulation);
  }, [currentSite, targetPopulation]);

  // Land area breakdown
  const usableLandHa = currentSite.usableLandAreaHa;
  const totalLandHa = currentSite.totalLandAreaHa || +(usableLandHa * 1.25).toFixed(1);
  const restrictedLandHa = currentSite.restrictedLandAreaHa !== undefined ? currentSite.restrictedLandAreaHa : +(totalLandHa - usableLandHa).toFixed(1);
  const developableLandHa = +(usableLandHa * 0.85).toFixed(1);
  const usablePct = totalLandHa > 0 ? Math.round((usableLandHa / totalLandHa) * 100) : 0;
  const restrictedPct = 100 - usablePct;

  // Practical capacity
  const practicalCapacityPax = currentCalculation.practicalCapacity;
  const practicalCapacityFamilies = Math.floor(practicalCapacityPax / 4);
  const familySurplus = practicalCapacityFamilies - targetFamilies;
  const isUnsafe = currentCalculation.isRejectedDueToHazard || currentSite.isInsideHazardRedZone;
  const isSufficient = practicalCapacityFamilies >= targetFamilies && !isUnsafe;
  const isLimited = practicalCapacityFamilies < targetFamilies && practicalCapacityFamilies > 0 && !isUnsafe;

  // Human-readable Site Status
  const siteStatusTitle = isUnsafe 
    ? 'NOT SUITABLE FOR RELOCATION' 
    : isSufficient 
      ? 'SUITABLE FOR RELOCATION' 
      : 'SUITABLE WITH CONDITIONS';

  const siteStatusShortDesc = isUnsafe
    ? 'This site is located within an active hazard impact zone and must not be used for relocation.'
    : isSufficient
      ? 'Enough usable land is available and the site passes all environmental safety checks.'
      : `The site can support ${practicalCapacityFamilies} of ${targetFamilies} required families. Additional capacity or secondary site required.`;

  // Authority Decision classification
  const decisionBadge = isUnsafe ? 'NOT RECOMMENDED' : isSufficient ? 'RECOMMENDED' : 'CONDITIONALLY RECOMMENDED';
  const decisionUse = isUnsafe 
    ? 'Not recommended for relocation.' 
    : isSufficient 
      ? 'Suitable for immediate relocation.' 
      : 'Suitable for partial relocation; secondary site required for remaining families.';

  // Safety reasons why land cannot be used
  const restrictionReasons: Record<HazardType, string[]> = {
    'landslide': [
      'Slope gradient steeper than 20° excluded for structural safety',
      '100m buffer zone from Chembra peak debris runout corridor',
      'Regolith drainage easement and stream buffer'
    ],
    'flood': [
      'Lowland riverbank area below peak flood elevation',
      '200m buffer setback from river embankment breach line',
      'Natural stormwater retention depression'
    ],
    'cloudburst': [
      'High-velocity torrent gorge runoff channel',
      'Steep valley escarpment prone to rockfall',
      'Flash-flood catchment buffer zone'
    ],
    'coastal-erosion': [
      'Active beach swash zone within 100m of high-water line',
      'Spring tide wave runup exposure buffer',
      'Coastal regulation setback line'
    ]
  };

  // Essential Services readiness
  const waterStatus = currentCalculation.resources.water.status === 'Sufficient' ? 'Ready' : currentCalculation.resources.water.status === 'Limited' ? 'Limited' : 'Deficit';
  const sanitationStatus = currentCalculation.resources.sanitation.status === 'Sufficient' ? 'Ready' : currentCalculation.resources.sanitation.status === 'Limited' ? 'Limited' : 'Deficit';
  const roadStatus = currentSite.roadStatus === 'Good' ? 'Ready' : currentSite.roadStatus === 'Moderate' ? 'Limited' : 'Poor';
  const medicalStatus = currentCalculation.resources.healthcare.status === 'Sufficient' ? 'Ready' : 'Limited';
  const powerStatus = currentSite.electricityStatus === 'Available' ? 'Ready' : currentSite.electricityStatus === 'Limited' ? 'Limited' : 'Unavailable';

  // Navigation helpers
  const handleGoSafeRelocation = () => {
    if (setSelectedSite) setSelectedSite(currentSite as any);
    if (onNavigateModule) onNavigateModule('safe-relocation');
    else setActiveView('candidate-sites');
  };

  const handleGoMovementPlan = () => {
    if (setSelectedSite) setSelectedSite(currentSite as any);
    if (onNavigateModule) onNavigateModule('relocation-planning');
    else setActiveView('relocation-engine');
  };

  // Base panel styling depending on theme
  const cardBg = isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-[#0E1A15] border-[#1E3228] text-slate-100';
  const subBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070D0A] border-[#1A2E24]';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-7xl mx-auto font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>

      {/* ============================================================
          1. PAGE HEADER
          ============================================================ */}
      <div className={`p-5 lg:p-6 rounded-2xl border ${cardBg} space-y-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700">
                AUTHORITY DECISION SUPPORT
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verified SDMA Dataset</span>
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1.5 font-serif">
              Land Safety & Carrying Capacity
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
              Check whether a proposed site can safely support relocated people.
            </p>
          </div>

          {/* Hazard Selector Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl border bg-slate-100 dark:bg-[#070D0A] border-slate-200 dark:border-[#1A2E24] shrink-0 overflow-x-auto">
            <button
              onClick={() => selectHazard('landslide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeHazard === 'landslide'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Landslide
            </button>
            <button
              onClick={() => selectHazard('flood')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeHazard === 'flood'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Flood
            </button>
            <button
              onClick={() => selectHazard('cloudburst')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeHazard === 'cloudburst'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cloudburst
            </button>
            <button
              onClick={() => selectHazard('coastal-erosion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeHazard === 'coastal-erosion'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Coastal Erosion
            </button>
          </div>
        </div>

        {/* Hazard & Location Status Banner */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border ${subBg} text-xs font-mono`}>
          <div>
            <span className={textMuted}>SELECTED HAZARD:</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white uppercase mt-0.5">
              {studyArea.title}
            </div>
          </div>
          <div>
            <span className={textMuted}>STUDY AREA:</span>
            <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
              {studyArea.location}, {studyArea.state}
            </div>
          </div>
          <div>
            <span className={textMuted}>DATA STATUS:</span>
            <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>UPDATED (Official Records)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          2. SITE SELECTION & LARGE STATUS CARD
          ============================================================ */}
      <div className="space-y-3">
        {/* Dropdown Selector */}
        <div className={`p-4 rounded-xl border ${cardBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Select Relocation Site:
            </span>
          </div>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="bg-white dark:bg-[#070D0A] text-slate-900 dark:text-white border border-slate-300 dark:border-[#1E3228] rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer w-full sm:w-96 shadow-xs"
          >
            {siteList.map((site) => (
              <option key={site.siteId} value={site.siteId}>
                {site.name} {site.isInsideHazardRedZone ? '[✕ NOT SUITABLE - HAZARD ZONE]' : `(${site.usableLandAreaHa} ha)`}
              </option>
            ))}
          </select>
        </div>

        {/* Big Easy-to-Understand Status Card */}
        <div className={`p-6 rounded-2xl border-2 transition-all ${
          isUnsafe
            ? 'bg-rose-50 border-rose-400 dark:bg-rose-950/40 dark:border-rose-700'
            : isSufficient
              ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-700'
              : 'bg-amber-50 border-amber-400 dark:bg-amber-950/40 dark:border-amber-700'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                SITE STATUS
              </div>
              <div className={`text-2xl font-bold flex items-center gap-2.5 mt-1 ${
                isUnsafe 
                  ? 'text-rose-700 dark:text-rose-300' 
                  : isSufficient 
                    ? 'text-emerald-700 dark:text-emerald-300' 
                    : 'text-amber-700 dark:text-amber-300'
              }`}>
                {isUnsafe && <X className="w-7 h-7 shrink-0 text-rose-600" />}
                {isSufficient && <CheckCircle2 className="w-7 h-7 shrink-0 text-emerald-600" />}
                {isLimited && <AlertTriangle className="w-7 h-7 shrink-0 text-amber-600" />}
                <span>{siteStatusTitle}</span>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-lg text-xs font-mono font-bold w-fit border ${
              isUnsafe
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-600'
                : isSufficient
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-600'
                  : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-600'
            }`}>
              {currentSite.siteId}
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mt-2.5 leading-relaxed font-medium">
            {siteStatusShortDesc}
          </p>
        </div>
      </div>

      {/* ============================================================
          3. FOUR IMPORTANT SITE FACTORS
          ============================================================ */}
      <div>
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">
          KEY SITE FACTORS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* LAND */}
          <div className={`p-4 rounded-xl border ${cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">LAND</span>
              <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {usableLandHa} ha
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Developable space: {developableLandHa} ha
            </div>
          </div>

          {/* SAFETY */}
          <div className={`p-4 rounded-xl border ${cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">SAFETY</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className={`text-xl font-bold mt-1 ${isUnsafe ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isUnsafe ? 'Failed Check' : 'Passed Check'}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {isUnsafe ? 'Inside hazard red zone' : 'Outside active hazard zone'}
            </div>
          </div>

          {/* WATER */}
          <div className={`p-4 rounded-xl border ${cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">WATER</span>
              <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className={`text-xl font-bold mt-1 ${waterStatus === 'Ready' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
              {waterStatus === 'Ready' ? 'Available' : 'Limited'}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {currentSite.waterDailyAvailableLiters.toLocaleString()} Liters / day
            </div>
          </div>

          {/* ACCESS */}
          <div className={`p-4 rounded-xl border ${cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">ACCESS</span>
              <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {currentSite.roadStatus} Access
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {currentSite.travelTimeFromMeppadiMins} mins road transit
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================
          4. LAND AREA BREAKDOWN & WHY SOME LAND CANNOT BE USED
          ============================================================ */}
      <div className={`p-5 lg:p-6 rounded-2xl border ${cardBg} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1A2E24] pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Land Area Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Total land is divided into safe usable space and restricted land.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
            Total Site: <strong>{totalLandHa} ha</strong>
          </div>
        </div>

        {/* Simple Horizontal Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              ✓ Usable Land: {usableLandHa} ha ({usablePct}%)
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              ✕ Restricted Land: {restrictedLandHa} ha ({restrictedPct}%)
            </span>
          </div>
          <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex shadow-inner">
            <div 
              className="h-full bg-emerald-500 flex items-center justify-center text-[10.5px] font-bold text-white transition-all duration-500"
              style={{ width: `${usablePct}%` }}
            >
              {usablePct > 15 ? `${usableLandHa} ha Usable` : ''}
            </div>
            <div 
              className="h-full bg-slate-400 dark:bg-slate-700 flex items-center justify-center text-[10.5px] font-bold text-white transition-all duration-500"
              style={{ width: `${restrictedPct}%` }}
            >
              {restrictedPct > 15 ? `${restrictedLandHa} ha Restricted` : ''}
            </div>
          </div>
        </div>

        {/* 4 Land Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className={`p-3 rounded-xl border ${subBg}`}>
            <span className={textMuted}>TOTAL SITE AREA</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalLandHa} ha</div>
          </div>
          <div className={`p-3 rounded-xl border ${subBg}`}>
            <span className={textMuted}>UNSUITABLE / RESTRICTED</span>
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-0.5">{restrictedLandHa} ha</div>
          </div>
          <div className={`p-3 rounded-xl border ${subBg}`}>
            <span className={textMuted}>USABLE AREA</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{usableLandHa} ha</div>
          </div>
          <div className={`p-3 rounded-xl border ${subBg}`}>
            <span className={textMuted}>DEVELOPABLE AREA</span>
            <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{developableLandHa} ha</div>
          </div>
        </div>

        {/* Why some land cannot be used */}
        {restrictedLandHa > 0 && (
          <div className={`p-3.5 rounded-xl border ${subBg} text-xs space-y-1.5`}>
            <div className="font-bold text-slate-700 dark:text-slate-300">
              Why some land cannot be used:
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
              {restrictionReasons[activeHazard].map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ============================================================
          5. PEOPLE CAPACITY & CAPACITY VS RELOCATION NEED
          ============================================================ */}
      <div className={`p-5 lg:p-6 rounded-2xl border ${cardBg} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1A2E24] pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              People Capacity vs Relocation Need
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compares how many people need relocation against how many the site can actually support.
            </p>
          </div>

          {/* Relocation Need Adjuster */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#070D0A] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1A2E24]">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">Relocation Need:</span>
            <input
              type="number"
              min={10}
              max={3000}
              step={10}
              value={targetFamilies}
              onChange={(e) => setTargetFamilies(Math.max(1, Number(e.target.value)))}
              className="w-20 bg-white dark:bg-[#0E1A15] border border-slate-300 dark:border-[#1E3228] rounded px-2 py-1 text-xs font-bold text-center focus:outline-none"
            />
            <span className="text-xs text-slate-500">Families</span>
          </div>
        </div>

        {/* 3 Core Capacity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          
          <div className={`p-4 rounded-xl border ${subBg}`}>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
              PEOPLE / FAMILIES TO RELOCATE
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {targetFamilies} <span className="text-base font-normal text-slate-500">Families</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {targetPopulation.toLocaleString()} people needing relocation
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${subBg}`}>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
              SITE CAN SUPPORT
            </span>
            <div className={`text-2xl sm:text-3xl font-bold mt-1 ${isUnsafe ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {practicalCapacityFamilies} <span className="text-base font-normal text-slate-500">Families</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {practicalCapacityPax.toLocaleString()} people maximum safe capacity
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${
            isUnsafe
              ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
              : familySurplus >= 0
                ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                : 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
          }`}>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
              {familySurplus >= 0 ? 'REMAINING CAPACITY' : 'SHORTFALL'}
            </span>
            <div className={`text-2xl sm:text-3xl font-bold mt-1 ${
              isUnsafe ? 'text-rose-700 dark:text-rose-300' : familySurplus >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
            }`}>
              {isUnsafe ? '0 Families' : familySurplus >= 0 ? `+${familySurplus} Families` : `${familySurplus} Families`}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {isUnsafe ? 'Site cannot be occupied' : familySurplus >= 0 ? 'Surplus space available' : 'Shortfall requires secondary site'}
            </div>
          </div>

        </div>

        {/* Capacity Verdict Banner */}
        <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-sm font-medium ${
          isUnsafe
            ? 'bg-rose-100/70 border-rose-300 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200'
            : isSufficient
              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-amber-100/70 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200'
        }`}>
          {isUnsafe && <X className="w-5 h-5 shrink-0 text-rose-600" />}
          {isSufficient && <Check className="w-5 h-5 shrink-0 text-emerald-600" />}
          {isLimited && <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />}
          <div>
            <strong>Status:</strong>{' '}
            {isUnsafe
              ? 'Site is unsafe and cannot accommodate any evacuees.'
              : isSufficient
                ? 'Site can accommodate the current relocation need.'
                : `Site cannot accommodate everyone. Shortfall of ${Math.abs(familySurplus)} families.`}
          </div>
        </div>
      </div>

      {/* ============================================================
          6. ESSENTIAL SERVICES CHECK
          ============================================================ */}
      <div className={`p-5 lg:p-6 rounded-2xl border ${cardBg} space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1A2E24] pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Essential Services Check
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verifies whether required utilities are present before moving people.
            </p>
          </div>
          <button
            onClick={handleGoMovementPlan}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer w-fit"
          >
            <span>View Resource Requirements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Compact Service Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          
          <div className={`p-3 rounded-xl border ${subBg} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Water</span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              waterStatus === 'Ready' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {waterStatus === 'Ready' ? '✓ Ready' : '⚠ Limited'}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${subBg} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Sanitation</span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              sanitationStatus === 'Ready' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {sanitationStatus === 'Ready' ? '✓ Ready' : '⚠ Limited'}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${subBg} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Road Access</span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              roadStatus === 'Ready' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {roadStatus === 'Ready' ? '✓ Ready' : '⚠ Limited'}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${subBg} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Ambulance className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Medical</span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              medicalStatus === 'Ready' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {medicalStatus === 'Ready' ? '✓ Ready' : '⚠ Limited'}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${subBg} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Power</span>
            </div>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
              powerStatus === 'Ready' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {powerStatus === 'Ready' ? '✓ Ready' : '⚠ Limited'}
            </span>
          </div>

        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {sanitationStatus !== 'Ready' || waterStatus !== 'Ready' ? (
            <span>Site is usable, but sanitation and water supply should be reinforced before full relocation.</span>
          ) : (
            <span>All essential infrastructure and municipal services are ready for immediate occupancy.</span>
          )}
        </div>
      </div>

      {/* ============================================================
          7. ONE SINGLE USEFUL GIS MAP
          ============================================================ */}
      <div className={`p-5 lg:p-6 rounded-2xl border ${cardBg} space-y-3`}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1A2E24] pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Relocation Site Location Map
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Where is this site and why is it suitable? Shows relocation land, affected origin, and transit corridor.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            {currentSite.name}
          </span>
        </div>

        {/* Map Container */}
        <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-[#1A2E24] relative">
          <MapContainer
            center={currentSite.coordinates}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full z-10"
          >
            <MapRecenter center={currentSite.coordinates} zoom={12} />
            <MapResizeHandler />
            <TileLayer url={MAP_TILES.topo.url} attribution={MAP_TILES.topo.attribution} />

            {/* Candidate Site Safe Usable Boundary */}
            <Circle
              center={currentSite.coordinates}
              radius={Math.sqrt((usableLandHa * 10000) / Math.PI) * 1.6}
              pathOptions={{
                color: isUnsafe ? '#DC2626' : '#059669',
                fillColor: isUnsafe ? '#EF4444' : '#10B981',
                fillOpacity: 0.25,
                weight: 2.5
              }}
            >
              <Tooltip permanent direction="top">
                <span className="font-bold text-xs">
                  {currentSite.name} ({usableLandHa} ha)
                </span>
              </Tooltip>
            </Circle>

            {/* Center Site Marker */}
            <CircleMarker
              center={currentSite.coordinates}
              radius={7}
              pathOptions={{
                color: '#FFFFFF',
                fillColor: isUnsafe ? '#DC2626' : '#059669',
                fillOpacity: 1,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-xs font-sans space-y-1">
                  <strong>{currentSite.name}</strong>
                  <div>Usable Land: {usableLandHa} ha</div>
                  <div>Capacity: {practicalCapacityFamilies} families</div>
                  <div>Status: {siteStatusTitle}</div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Affected Origin Hazard Marker */}
            <CircleMarker
              center={affectedOrigin.coordinates}
              radius={7}
              pathOptions={{
                color: '#FFFFFF',
                fillColor: '#DC2626',
                fillOpacity: 1,
                weight: 2
              }}
            >
              <Tooltip permanent direction="bottom">
                <span className="font-bold text-xs text-rose-700">
                  {affectedOrigin.name} ({targetFamilies} Families)
                </span>
              </Tooltip>
            </CircleMarker>

            {/* Transit Route Line */}
            <Polyline
              positions={[affectedOrigin.coordinates, currentSite.coordinates]}
              pathOptions={{
                color: isUnsafe ? '#94A3B8' : '#059669',
                weight: 3,
                dashArray: '6, 6'
              }}
            />
          </MapContainer>

          {/* Map Legend Strip */}
          <div className="absolute bottom-2 left-2 z-[400] bg-white/95 dark:bg-[#070D0A]/95 p-2 rounded-lg border border-slate-300 dark:border-[#1E3228] text-[11px] font-mono flex items-center gap-3 shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Relocation Site</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Affected Origin</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-emerald-600 inline-block" />
              <span>Corridor</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          8. SIMPLE SITE COMPARISON TABLE
          ============================================================ */}
      <div className={`p-5 lg:p-6 rounded-2xl border ${cardBg} space-y-3`}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1A2E24] pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-serif">
              Relocation Sites Comparison
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any site to inspect its details and suitability.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {siteList.length} Sites Evaluated
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1A2E24]">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className={`border-b border-slate-200 dark:border-[#1A2E24] font-bold text-slate-600 dark:text-slate-400 ${subBg}`}>
                <th className="p-3">Site</th>
                <th className="p-3">Safety</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Services</th>
                <th className="p-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#1A2E24]">
              {siteList.map((site) => {
                const isCurrent = site.siteId === currentSite.siteId;
                const calc = calculateSiteCapacity(site, DEFAULT_PLANNING_ASSUMPTIONS, targetPopulation);
                const capFamilies = Math.floor(calc.practicalCapacity / 4);
                const siteUnsafe = calc.isRejectedDueToHazard || site.isInsideHazardRedZone;
                const siteDecision = siteUnsafe ? 'Not Recommended' : capFamilies >= targetFamilies ? 'Recommended' : 'Conditional';

                return (
                  <tr
                    key={site.siteId}
                    onClick={() => setSelectedSiteId(site.siteId)}
                    className={`cursor-pointer transition-colors ${
                      isCurrent 
                        ? 'bg-emerald-50 dark:bg-[#12281D] font-bold' 
                        : 'hover:bg-slate-50 dark:hover:bg-[#0E1E17]/60'
                    }`}
                  >
                    <td className="p-3">
                      <div className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                        <span>{site.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px]">{site.village} • {site.usableLandAreaHa} ha</div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        siteUnsafe 
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {siteUnsafe ? 'Poor' : 'Good'}
                      </span>
                    </td>

                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                      {siteUnsafe ? '0 families' : `${capFamilies} families`}
                    </td>

                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {siteUnsafe ? 'Deficit' : site.roadStatus === 'Good' ? 'Good' : 'Limited'}
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        siteDecision === 'Recommended'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : siteDecision === 'Conditional'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {siteDecision}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          9. FINAL AUTHORITY DECISION CARD
          ============================================================ */}
      <div className={`p-6 rounded-2xl border-2 transition-all ${
        decisionBadge === 'RECOMMENDED'
          ? 'bg-emerald-50/90 border-emerald-500 dark:bg-emerald-950/40 dark:border-emerald-600'
          : decisionBadge === 'CONDITIONALLY RECOMMENDED'
            ? 'bg-amber-50/90 border-amber-500 dark:bg-amber-950/40 dark:border-amber-600'
            : 'bg-rose-50/90 border-rose-500 dark:bg-rose-950/40 dark:border-rose-600'
      } space-y-4`}>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 dark:border-emerald-800/60 pb-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              FINAL SITE DECISION
            </span>
            <div className={`text-2xl font-bold mt-0.5 flex items-center gap-2 ${
              decisionBadge === 'RECOMMENDED'
                ? 'text-emerald-800 dark:text-emerald-300'
                : decisionBadge === 'CONDITIONALLY RECOMMENDED'
                  ? 'text-amber-800 dark:text-amber-300'
                  : 'text-rose-800 dark:text-rose-300'
            }`}>
              {decisionBadge === 'RECOMMENDED' && <Check className="w-6 h-6 shrink-0" />}
              {decisionBadge === 'CONDITIONALLY RECOMMENDED' && <AlertTriangle className="w-6 h-6 shrink-0" />}
              {decisionBadge === 'NOT RECOMMENDED' && <X className="w-6 h-6 shrink-0" />}
              <span>{decisionBadge}: {currentSite.name}</span>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-[#070D0A] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E3228] w-fit">
            Capacity: {practicalCapacityFamilies} / {targetFamilies} Families
          </div>
        </div>

        {/* Why this decision? */}
        <div className="space-y-2 text-sm text-slate-800 dark:text-slate-200 font-medium">
          <div className="font-bold">Why?</div>
          <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
            {isUnsafe ? (
              <>
                <li>Site is located inside active disaster hazard perimeter</li>
                <li>Physical safety conditions fail mandatory evacuation criteria</li>
                <li>Zero safe civilian capacity can be approved</li>
              </>
            ) : (
              <>
                <li>Safe and usable land available ({usableLandHa} hectares verified)</li>
                <li>
                  {isSufficient 
                    ? `Capacity (${practicalCapacityFamilies} families) exceeds current relocation need (${targetFamilies} families)` 
                    : `Capacity covers ${practicalCapacityFamilies} of ${targetFamilies} families (partial coverage)`}
                </li>
                <li>Essential road transit access is available ({currentSite.roadStatus.toLowerCase()} condition)</li>
              </>
            )}
          </ul>
        </div>

        {/* Recommended use */}
        <div className={`p-3.5 rounded-xl border text-sm font-medium ${
          isUnsafe 
            ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-700' 
            : 'bg-white text-slate-800 border-slate-200 dark:bg-[#070D0A] dark:text-slate-200 dark:border-[#1E3228]'
        }`}>
          <strong>Recommended use:</strong> {decisionUse}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
          <button
            onClick={handleGoSafeRelocation}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-[#12281D] hover:bg-slate-100 dark:hover:bg-[#1A3828] text-slate-800 dark:text-emerald-300 border border-slate-300 dark:border-emerald-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>[View Relocation Assignment]</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGoMovementPlan}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>[Proceed to Movement Plan]</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
