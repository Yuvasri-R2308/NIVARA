import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Tooltip as LeafletTooltip, 
  Polyline,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  getRiskDotsForHazard, 
  getRainfallTrend, 
  getConditionTrend 
} from '../../data/redZoneRegistry';
import { getHazardProfile } from '../../data/hazardRegistry';
import { HazardType, HazardModuleId, RiskDotLocation } from '../../types';
import { useApp } from '../../context/AppContext';
import { SoilMoistureAnalysisHub } from '../geotechnical/SoilMoistureAnalysisHub';
import { AREA_HAZARD_REGISTRY } from '../../data/areaHazardProfiles';
import { getSitesForHazard, getDefaultSiteForHazard } from '../../data/siteCapacityRegistry';
import { Dem3DBlockCanvas } from '../map/Dem3DBlockCanvas';
import { 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Home, 
  Maximize2, 
  X, 
  ArrowRight, 
  Droplets, 
  CloudRain, 
  Mountain, 
  Compass, 
  Clock, 
  Activity,
  Layers,
  ChevronRight,
  ChevronDown,
  Sliders,
  Check,
  RotateCcw,
  Box,
  Target,
  Plus,
  Minus,
  ShieldCheck,
  Eye,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 100% Free, Public, Reliable Basemaps (Zero API Keys Required)
export const TILE_LAYERS = {
  satellite: {
    id: 'satellite',
    name: 'Satellite Imagery',
    shortName: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Imagery',
    maxZoom: 20,
    maxNativeZoom: 19
  },
  terrain: {
    id: 'terrain',
    name: 'Topographic / Terrain Contours',
    shortName: 'Terrain',
    icon: '⛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Topo Map',
    maxZoom: 20,
    maxNativeZoom: 14
  },
  dark: {
    id: 'dark',
    name: 'Tactical Dark Canvas',
    shortName: 'Dark Canvas',
    icon: '🌑',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Dark Gray Canvas',
    maxZoom: 20,
    maxNativeZoom: 16
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap Standard',
    shortName: 'Streets',
    icon: '🗺️',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 20,
    maxNativeZoom: 19
  },
  hillshade: {
    id: 'hillshade',
    name: 'DEM Elevation Hillshade Relief',
    shortName: 'DEM Relief',
    icon: '🏔️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Elevation Hillshade',
    maxZoom: 20,
    maxNativeZoom: 14
  }
};

export type BaseMapKey = keyof typeof TILE_LAYERS;

// On-Map Direct Leaflet Zoom & Recenter Controls
const MapControls: React.FC<{ defaultCenter: [number, number]; defaultZoom: number; theme?: string }> = ({ defaultCenter, defaultZoom, theme = 'dark' }) => {
  const map = useMap();
  return (
    <div className={`absolute bottom-6 right-4 z-[800] flex flex-col gap-1.5 p-1.5 rounded-xl border shadow-2xl ${
      theme === 'light'
        ? 'bg-white border-slate-300 text-slate-700 shadow-slate-400/60'
        : 'bg-[#0A1610] border-[#1E382B] text-slate-200 shadow-black/80'
    }`}>
      <button
        onClick={() => map.zoomIn()}
        className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold transition-colors cursor-pointer text-base ${
          theme === 'light' ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
        title="Zoom In"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold transition-colors cursor-pointer text-base ${
          theme === 'light' ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
        title="Zoom Out"
      >
        −
      </button>
      <button
        onClick={() => map.setView(defaultCenter, defaultZoom, { animate: true })}
        className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold transition-colors cursor-pointer ${
          theme === 'light' ? 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50' : 'text-emerald-400 hover:text-white hover:bg-white/10'
        }`}
        title="Recenter Map View"
      >
        <Compass className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// Map recentering controller
const MapController: React.FC<{ 
  center: [number, number]; 
  zoom: number; 
  targetDot: RiskDotLocation | null;
}> = ({ center, zoom, targetDot }) => {
  const map = useMap();

  useEffect(() => {
    if (targetDot) {
      map.flyTo([targetDot.lat, targetDot.lng], Math.max(map.getZoom(), 13), {
        animate: true,
        duration: 0.8
      });
    } else {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, targetDot, map]);

  return null;
};

export const RedZoneUpdatePage: React.FC = () => {
  const { selectedHazard, selectHazardModule, theme } = useApp();
  const hazardKey: HazardType = selectedHazard || 'landslide';

  // Grounded Hazard Profile
  const profile = useMemo(() => getHazardProfile(hazardKey), [hazardKey]);

  // All risk dots for active hazard
  const allRiskDots = useMemo(() => getRiskDotsForHazard(hazardKey), [hazardKey]);

  // Filter & Display State
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Moderate' | 'High' | 'Critical'>('All');
  const [selectedDot, setSelectedDot] = useState<RiskDotLocation | null>(null);
  
  // Dual-mode visualization: 2D GIS Risk Map vs 3D DEM Digital Elevation Model
  const [mapMode, setMapMode] = useState<'2d' | '3d-dem'>('2d');
  const [show3dDemModal, setShow3dDemModal] = useState<boolean>(false);
  
  // Multiple Basemaps state (default to satellite for maximum terrain clarity)
  const [baseMapKey, setBaseMapKey] = useState<BaseMapKey>('satellite');
  const [showBasemapMenu, setShowBasemapMenu] = useState<boolean>(false);
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
  const basemapMenuRef = useRef<HTMLDivElement>(null);
  const layersMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (basemapMenuRef.current && !basemapMenuRef.current.contains(e.target as Node)) {
        setShowBasemapMenu(false);
      }
      if (layersMenuRef.current && !layersMenuRef.current.contains(e.target as Node)) {
        setShowLayersMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Feature layers
  const [showSafeSites, setShowSafeSites] = useState<boolean>(true);
  const [showEvacRoutes, setShowEvacRoutes] = useState<boolean>(true);
  const [showHillshadeOverlay, setShowHillshadeOverlay] = useState<boolean>(false);

  // Safe relocation sites for the active hazard
  const safeSites = useMemo(() => getSitesForHazard(hazardKey), [hazardKey]);
  const defaultSafeSite = useMemo(() => getDefaultSiteForHazard(hazardKey), [hazardKey]);

  // Target safe site for selected area / dot
  const targetSafeSite = useMemo(() => {
    if (!selectedDot || safeSites.length === 0) return defaultSafeSite || safeSites[0];
    let closest = safeSites[0];
    let minDist = Infinity;
    for (const s of safeSites) {
      const d = Math.hypot(s.coordinates[0] - selectedDot.lat, s.coordinates[1] - selectedDot.lng);
      if (d < minDist) {
        minDist = d;
        closest = s;
      }
    }
    return closest;
  }, [selectedDot, safeSites, defaultSafeSite]);

  // Evacuation route coordinates from selected dot to nearest safe site
  const routeCoordinates = useMemo<[number, number][] | null>(() => {
    if (!selectedDot || !targetSafeSite) return null;
    const start: [number, number] = [selectedDot.lat, selectedDot.lng];
    const end: [number, number] = targetSafeSite.coordinates;
    const mid: [number, number] = [
      (start[0] + end[0]) / 2 + (start[1] - end[1]) * 0.08,
      (start[1] + end[1]) / 2 + (end[0] - start[0]) * 0.08,
    ];
    return [start, mid, end];
  }, [selectedDot, targetSafeSite]);

  // Default initial area per hazard
  const defaultAreaForHazard = useMemo(() => {
    switch (hazardKey) {
      case 'flood': return 'Maijan Gaon';
      case 'cloudburst': return 'Mandakini Gorge';
      case 'coastal-erosion': return 'Chellanam North Fishery';
      default: return 'Meppadi';
    }
  }, [hazardKey]);

  const [selectedAreaName, setSelectedAreaName] = useState<string>(defaultAreaForHazard);
  const [soilAnalysisMode, setSoilAnalysisMode] = useState<'geotechnical' | 'satellite'>('geotechnical');

  // Reset selected dot & area on hazard change
  useEffect(() => {
    setSelectedDot(null);
    setRiskFilter('All');
    setSelectedAreaName(defaultAreaForHazard);
  }, [hazardKey, defaultAreaForHazard]);

  // Comprehensive list of available areas for the active hazard
  const availableAreas = useMemo(() => {
    if (hazardKey === 'landslide') {
      return Object.entries(AREA_HAZARD_REGISTRY).map(([key, v]) => ({
        key,
        name: v.name.replace(/\(.*?\)/g, '').trim(),
        fullName: v.name,
        rainfall24h: v.rainfall24h,
        slopeDeg: v.slopeDeg,
        soilMoisture: v.soilMoisture,
        riskScore: v.riskScore,
        riskLevel: v.riskLevel === 'HIGH' ? 'Critical' : v.riskLevel === 'MEDIUM' ? 'Moderate' : 'Low',
        coordinates: v.coordinates
      }));
    }
    return allRiskDots.map(d => ({
      key: d.name,
      name: d.name,
      fullName: d.name,
      rainfall24h: d.rainfall24h,
      slopeDeg: d.surfaceSlope,
      soilMoisture: d.soilMoisture || 85,
      riskScore: d.riskScore,
      riskLevel: d.riskLevel,
      coordinates: [d.lat, d.lng] as [number, number]
    }));
  }, [hazardKey, allRiskDots]);

  // Handle selecting an area (from dropdown, quick buttons, or map dot click)
  const handleSelectArea = (areaKeyOrName: string) => {
    const matched = availableAreas.find(a => 
      a.key.toLowerCase() === areaKeyOrName.toLowerCase() ||
      a.name.toLowerCase() === areaKeyOrName.toLowerCase() ||
      areaKeyOrName.toLowerCase().includes(a.key.toLowerCase()) ||
      a.key.toLowerCase().includes(areaKeyOrName.toLowerCase())
    );
    const resolvedKey = matched ? matched.key : areaKeyOrName;
    setSelectedAreaName(resolvedKey);

    // Sync selectedDot on the map so user sees immediate map fly-to and detail drawer
    const matchedDot = allRiskDots.find(d => 
      d.name.toLowerCase().includes(resolvedKey.toLowerCase()) ||
      resolvedKey.toLowerCase().includes(d.name.toLowerCase())
    );
    if (matchedDot) {
      setSelectedDot(matchedDot);
    }
  };

  // Filtered dots
  const filteredDots = useMemo(() => {
    return allRiskDots.filter(dot => {
      if (riskFilter !== 'All' && dot.riskLevel !== riskFilter) {
        return false;
      }
      return true;
    });
  }, [allRiskDots, riskFilter]);

  // Selected area profile
  const currentAreaProfile = useMemo(() => {
    return availableAreas.find(a => 
      a.key.toLowerCase() === selectedAreaName.toLowerCase() ||
      a.name.toLowerCase() === selectedAreaName.toLowerCase()
    ) || availableAreas[0];
  }, [availableAreas, selectedAreaName]);

  // Base rainfall trend series from registry
  const baseRainfallTrend = useMemo(() => getRainfallTrend(hazardKey), [hazardKey]);
  const baseRainfallTotal = useMemo(() => {
    return baseRainfallTrend.reduce((acc, curr) => acc + curr.rainfallMm, 0);
  }, [baseRainfallTrend]);

  // Area-specific scaled rainfall series and status
  const activeRainfallData = useMemo(() => {
    const target24h = currentAreaProfile ? currentAreaProfile.rainfall24h : 284.5;
    const ratio = baseRainfallTotal > 0 ? target24h / baseRainfallTotal : 1;

    const series = baseRainfallTrend.map(item => ({
      time: item.time,
      rainfallMm: Math.round(item.rainfallMm * ratio * 10) / 10
    }));

    let peak = series[0];
    for (const s of series) {
      if (s.rainfallMm > peak.rainfallMm) peak = s;
    }

    let status: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'NORMAL' = 'NORMAL';
    if (target24h >= 250) status = 'CRITICAL';
    else if (target24h >= 150) status = 'HIGH';
    else if (target24h >= 70) status = 'MODERATE';

    return {
      total24h: target24h,
      series,
      peak,
      status
    };
  }, [baseRainfallTrend, baseRainfallTotal, currentAreaProfile]);

  // Lower Condition Trend Series (for satellite / non-landslide view)
  const conditionTrend = useMemo(() => getConditionTrend(hazardKey), [hazardKey]);

  // Map Default Center & Zoom
  const defaultCenter = profile.defaultCenter;
  const defaultZoom = profile.defaultZoom;

  // Color helper according to risk level
  const getDotStyle = (dot: RiskDotLocation, isSelected: boolean) => {
    let fillColor = '#22C55E'; // Low: Green
    let strokeColor = '#16A34A';
    let radius = 9;

    if (dot.riskLevel === 'Critical') {
      fillColor = '#EF4444'; // Red
      strokeColor = '#B91C1C';
      radius = 12;
    } else if (dot.riskLevel === 'High') {
      fillColor = '#F97316'; // Orange
      strokeColor = '#C2410C';
      radius = 10.5;
    } else if (dot.riskLevel === 'Moderate') {
      fillColor = '#EAB308'; // Yellow
      strokeColor = '#A16207';
      radius = 9.5;
    }

    if (isSelected) {
      radius += 4;
    }

    return {
      fillColor,
      strokeColor,
      radius,
      weight: isSelected ? 3.5 : 2,
      opacity: 1,
      fillOpacity: isSelected ? 0.95 : 0.85
    };
  };

  // Format today's operational date
  const lastUpdatedText = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' • 08:30 IST';
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* =========================================================================
          1. PAGE HEADER: Operational Red Zone Header
          ========================================================================= */}
      <div className={`p-4 sm:p-6 rounded-2xl border shadow-sm transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0A1410] border-[#1A2E24]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h1 className={`text-xl sm:text-2xl font-mono font-black tracking-wider uppercase ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                RED ZONE UPDATE
              </h1>
            </div>
            <p className={`text-xs sm:text-sm font-sans ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              Monitor changing risk areas and the people exposed.
            </p>
          </div>

          {/* Dynamic Hazard Context Badges */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0E1E17] border-[#1E362A] text-slate-200'
            }`}>
              <span className="text-rose-500 font-black">●</span>
              <span className={`uppercase text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Hazard:</span>
              <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{profile.name.toUpperCase()}</span>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0E1E17] border-[#1E362A] text-slate-200'
            }`}>
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span className={`uppercase text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Study Area:</span>
              <span className={`font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}`}>{profile.studyLocation}, {profile.state}</span>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0E1E17] border-[#1E362A] text-slate-200'
            }`}>
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              <span className={`uppercase text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Updated:</span>
              <span className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>{lastUpdatedText}</span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. HERO RISK MAP (65-75% of view) — STRICTLY DOTS ONLY (NO PLACE NAMES)
          ========================================================================= */}
      <div className={`relative w-full rounded-2xl overflow-hidden border shadow-xl flex flex-col ${
        theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-[#07110C] border-[#1A2E24]'
      }`} style={{ height: '650px', minHeight: '580px' }}>
        
        {/* =========================================================================
            PERMANENT MAP TOOLBAR: Solid dedicated header bar (100% visible at all zoom levels)
        {/* =========================================================================
            PERMANENT MAP TOOLBAR: Structured 3-Zone Control Bar
            ========================================================================= */}
        <div className={`w-full px-3.5 py-2 border-b flex flex-wrap items-center justify-between gap-2 relative z-[1001] shrink-0 ${
          theme === 'light' ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-xs' : 'bg-[#08140F]/95 backdrop-blur-md border-[#1A2E24]'
        }`}>
          
          {/* Group 1 (Left): View Mode Switcher + Full 3D Modal */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`flex items-center p-1 rounded-xl border shadow-xs ${
              theme === 'light' ? 'bg-slate-100/90 border-slate-200' : 'bg-[#0E1E17] border-[#1E382B]'
            }`}>
              <button
                onClick={() => setMapMode('2d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapMode === '2d'
                    ? theme === 'light'
                      ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 font-extrabold'
                      : 'bg-emerald-500 text-black shadow-md'
                    : theme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-white/50' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>2D RISK MAP</span>
              </button>
              <button
                onClick={() => setMapMode('3d-dem')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mapMode === '3d-dem'
                    ? theme === 'light'
                      ? 'bg-white text-cyan-800 shadow-sm border border-slate-200/80 font-extrabold'
                      : 'bg-cyan-400 text-black shadow-md'
                    : theme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-white/50' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Mountain className="w-3.5 h-3.5 text-cyan-500" />
                <span>3D TERRAIN</span>
              </button>
              <div className={`w-[1px] h-4 mx-0.5 ${theme === 'light' ? 'bg-slate-300' : 'bg-[#1E382B]'}`} />
              <button
                onClick={() => setShow3dDemModal(true)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-cyan-800 hover:bg-cyan-50 hover:text-cyan-950'
                    : 'text-cyan-300 hover:bg-cyan-950/60 hover:text-cyan-100'
                }`}
                title="Open Full-Screen 3D DEM Modal"
              >
                <Box className="w-3.5 h-3.5 text-cyan-600" />
                <span>FULL 3D</span>
              </button>
            </div>

            {/* Group 2 (Center): Risk Severity Filter */}
            {mapMode === '2d' && (
              <div className={`flex items-center gap-1 p-1 rounded-xl border shadow-xs ${
                theme === 'light' ? 'bg-slate-100/90 border-slate-200' : 'bg-[#0E1E17] border-[#1E382B]'
              }`}>
                <span className={`text-[10px] font-mono px-2 font-bold uppercase hidden sm:inline ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Filter:
                </span>
                {(['All', 'Critical', 'High', 'Moderate', 'Low'] as const).map((lvl) => {
                  const count = lvl === 'All' 
                    ? allRiskDots.length 
                    : allRiskDots.filter(d => d.riskLevel === lvl).length;

                  const isSelected = riskFilter === lvl;
                  const colorDot = lvl === 'Critical' ? 'bg-rose-500' :
                                   lvl === 'High' ? 'bg-orange-500' :
                                   lvl === 'Moderate' ? 'bg-amber-400' :
                                   lvl === 'Low' ? 'bg-emerald-400' : 'bg-slate-400';

                  return (
                    <button
                      key={lvl}
                      onClick={() => setRiskFilter(lvl)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? theme === 'light'
                            ? lvl === 'Critical' ? 'bg-rose-50 text-rose-800 border border-rose-300 shadow-xs' :
                              lvl === 'High' ? 'bg-orange-50 text-orange-800 border border-orange-300 shadow-xs' :
                              lvl === 'Moderate' ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs' :
                              lvl === 'Low' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs' :
                              'bg-white text-slate-900 border border-slate-300 shadow-xs'
                            : 'bg-emerald-500 text-black shadow-md'
                          : theme === 'light' 
                            ? 'text-slate-700 hover:text-slate-950 hover:bg-white/60' 
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${colorDot}`} />
                      <span>{lvl}</span>
                      <span className={`text-[10px] ${
                        isSelected 
                          ? theme === 'light' ? 'font-bold' : 'text-black/70' 
                          : theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 3 (Right): Map Overlays & Basemaps */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Unified Map Options Group: Basemap & Layers */}
            {mapMode === '2d' && (
              <div className={`flex items-center p-1 rounded-xl border shadow-xs ${
                theme === 'light' ? 'bg-slate-100/90 border-slate-200' : 'bg-[#0E1E17] border-[#1E382B]'
              }`}>
                {/* Basemap Dropdown Trigger */}
                <div className="relative" ref={basemapMenuRef}>
                  <button
                    onClick={() => {
                      setShowBasemapMenu(!showBasemapMenu);
                      setShowLayersMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      showBasemapMenu
                        ? theme === 'light'
                          ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                          : 'bg-white/15 text-white'
                        : theme === 'light'
                          ? 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                          : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                    title="Change Basemap Style"
                  >
                    <span className="text-sm">{TILE_LAYERS[baseMapKey].icon}</span>
                    <span>{TILE_LAYERS[baseMapKey].shortName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showBasemapMenu ? 'rotate-180 text-emerald-500' : theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </button>

                  {/* Basemap Menu Dropdown */}
                  {showBasemapMenu && (
                    <div 
                      className={`absolute top-full right-0 mt-2.5 w-64 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl p-2 z-[3000] border ${
                        theme === 'light'
                          ? 'bg-white border-2 border-slate-300 text-slate-900 shadow-slate-400/60'
                          : 'bg-[#0A1610] border-2 border-emerald-600/70 text-white shadow-2xl shadow-black'
                      }`}
                      style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#0A1610' }}
                    >
                      <div className={`px-3 py-2 border-b flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider ${
                        theme === 'light' ? 'text-slate-700 border-slate-200 bg-slate-50/80 rounded-t-xl' : 'text-emerald-400 border-[#1E382B] bg-[#0E1E17] rounded-t-xl'
                      }`}>
                        <span>Available Basemaps</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          theme === 'light' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>100% Free</span>
                      </div>
                      <div className="p-1 space-y-1">
                        {(Object.keys(TILE_LAYERS) as BaseMapKey[]).map((key) => {
                          const layer = TILE_LAYERS[key];
                          const isCurrent = baseMapKey === key;
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setBaseMapKey(key);
                                setShowBasemapMenu(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all text-left cursor-pointer border ${
                                isCurrent 
                                  ? theme === 'light'
                                    ? 'bg-emerald-50 text-emerald-950 border-2 border-emerald-400 font-extrabold shadow-sm'
                                    : 'bg-emerald-500/25 text-emerald-200 border-2 border-emerald-400 font-extrabold shadow-md' 
                                  : theme === 'light'
                                    ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-950 border-transparent font-semibold'
                                    : 'text-slate-100 hover:bg-white/10 hover:text-white border-transparent font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-base">{layer.icon}</span>
                                <div>
                                  <div className="font-bold leading-tight">{layer.name}</div>
                                  <div className={`text-[10px] leading-tight mt-0.5 ${
                                    theme === 'light' ? 'text-slate-500 font-medium' : 'text-slate-300'
                                  }`}>
                                    {layer.shortName}
                                  </div>
                                </div>
                              </div>
                              {isCurrent && (
                                <Check className={`w-4 h-4 shrink-0 ${
                                  theme === 'light' ? 'text-emerald-700 font-extrabold' : 'text-emerald-400 font-extrabold'
                                }`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`w-[1px] h-4 mx-0.5 ${theme === 'light' ? 'bg-slate-300' : 'bg-[#1E382B]'}`} />

                {/* Layers Dropdown Trigger */}
                <div className="relative" ref={layersMenuRef}>
                  <button
                    onClick={() => {
                      setShowLayersMenu(!showLayersMenu);
                      setShowBasemapMenu(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      showLayersMenu
                        ? theme === 'light'
                          ? 'bg-white text-cyan-800 shadow-xs border border-slate-200'
                          : 'bg-white/15 text-white'
                        : theme === 'light'
                          ? 'text-slate-700 hover:text-slate-950 hover:bg-white/60'
                          : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                    title="Toggle Map Feature Overlays"
                  >
                    <Layers className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`} />
                    <span>Layers</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showLayersMenu ? 'rotate-180 text-cyan-500' : theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                  </button>

                  {/* Layers Menu Dropdown */}
                  {showLayersMenu && (
                    <div 
                      className={`absolute top-full right-0 mt-2.5 w-64 max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl p-2 z-[3000] border ${
                        theme === 'light'
                          ? 'bg-white border-2 border-slate-300 text-slate-900 shadow-slate-400/60'
                          : 'bg-[#0A1610] border-2 border-emerald-600/70 text-white shadow-2xl shadow-black'
                      }`}
                      style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#0A1610' }}
                    >
                      <div className={`px-3 py-2 border-b flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider ${
                        theme === 'light' ? 'text-slate-700 border-slate-200 bg-slate-50/80 rounded-t-xl' : 'text-cyan-400 border-[#1E382B] bg-[#0E1E17] rounded-t-xl'
                      }`}>
                        <span>Map Overlays</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          theme === 'light' ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}>Toggles</span>
                      </div>
                      
                      <div className="p-1 space-y-1">
                        {/* Safe Sites Toggle */}
                        <label className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
                          showSafeSites
                            ? theme === 'light' 
                              ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-bold shadow-xs' 
                              : 'bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 font-bold shadow-md'
                            : theme === 'light' 
                              ? 'hover:bg-slate-100 text-slate-700 border-slate-200 font-semibold' 
                              : 'hover:bg-white/10 text-slate-200 border-[#1E382B] bg-[#0E1E17] font-semibold'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="font-bold">Safe Relocation Sites</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={showSafeSites}
                            onChange={(e) => setShowSafeSites(e.target.checked)}
                            className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                          />
                        </label>

                        {/* Evacuation Routes Toggle */}
                        <label className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
                          showEvacRoutes
                            ? theme === 'light' 
                              ? 'bg-cyan-50 border-2 border-cyan-400 text-cyan-950 font-bold shadow-xs' 
                              : 'bg-cyan-950/90 border-2 border-cyan-500 text-cyan-200 font-bold shadow-md'
                            : theme === 'light' 
                              ? 'hover:bg-slate-100 text-slate-700 border-slate-200 font-semibold' 
                              : 'hover:bg-white/10 text-slate-200 border-[#1E382B] bg-[#0E1E17] font-semibold'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <Target className="w-4 h-4 text-cyan-500 shrink-0" />
                            <span className="font-bold">Evacuation Routes</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={showEvacRoutes}
                            onChange={(e) => setShowEvacRoutes(e.target.checked)}
                            className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                          />
                        </label>

                        {/* DEM Hillshade Relief Overlay */}
                        <label className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
                          showHillshadeOverlay
                            ? theme === 'light' 
                              ? 'bg-amber-50 border-2 border-amber-400 text-amber-950 font-bold shadow-xs' 
                              : 'bg-amber-950/90 border-2 border-amber-500 text-amber-200 font-bold shadow-md'
                            : theme === 'light' 
                              ? 'hover:bg-slate-100 text-slate-700 border-slate-200 font-semibold' 
                              : 'hover:bg-white/10 text-slate-200 border-[#1E382B] bg-[#0E1E17] font-semibold'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <Mountain className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="font-bold">DEM Relief Overlay</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={showHillshadeOverlay}
                            onChange={(e) => setShowHillshadeOverlay(e.target.checked)}
                            className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* =========================================================================
            MAP CANVAS BODY: 2D GIS Map or 3D DEM Terrain (relative flex-1 w-full h-full min-h-0)
            ========================================================================= */}
        <div className="relative flex-1 w-full h-full min-h-0">
          {mapMode === '2d' ? (
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              minZoom={4}
              maxZoom={19}
              zoomControl={false}
              className="w-full h-full"
              style={{ background: theme === 'light' ? '#E2E8F0' : '#07110C' }}
            >
              {/* Base Map TileLayer */}
              <TileLayer
                key={baseMapKey}
                url={TILE_LAYERS[baseMapKey].url}
                attribution={TILE_LAYERS[baseMapKey].attribution}
                maxZoom={TILE_LAYERS[baseMapKey].maxZoom}
                maxNativeZoom={TILE_LAYERS[baseMapKey].maxNativeZoom}
              />

              {/* Optional Hillshade Relief Overlay */}
              {showHillshadeOverlay && baseMapKey !== 'hillshade' && (
                <TileLayer
                  url={TILE_LAYERS.hillshade.url}
                  attribution={TILE_LAYERS.hillshade.attribution}
                  maxZoom={TILE_LAYERS.hillshade.maxZoom}
                  maxNativeZoom={TILE_LAYERS.hillshade.maxNativeZoom}
                  opacity={0.45}
                />
              )}

              <MapControls defaultCenter={defaultCenter} defaultZoom={defaultZoom} theme={theme} />

              <MapController 
                center={defaultCenter} 
                zoom={defaultZoom} 
                targetDot={selectedDot} 
              />

              {/* Evacuation Route Polyline to Nearest Safe Relocation Site */}
              {showEvacRoutes && routeCoordinates && (
                <Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: '#10B981',
                    weight: 3.5,
                    dashArray: '8, 8',
                    opacity: 0.85
                  }}
                />
              )}

              {/* Safe Relocation Sites Markers */}
              {showSafeSites && safeSites.map((site) => (
                <CircleMarker
                  key={site.siteId}
                  center={site.coordinates}
                  radius={7.5}
                  pathOptions={{
                    fillColor: '#10B981',
                    color: '#FFFFFF',
                    weight: 2,
                    fillOpacity: 0.95
                  }}
                >
                  <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.98} className="custom-safe-site-tooltip">
                    <div className={`font-mono text-xs p-2 rounded-xl border shadow-xl backdrop-blur-md space-y-0.5 ${
                      theme === 'light' ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/60' : 'bg-[#07120D]/95 border-[#1E382B] text-slate-100'
                    }`}>
                      <div className="text-emerald-500 font-bold flex items-center gap-1">
                        <span>🛡️ SAFE RELOCATION SITE</span>
                      </div>
                      <div className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{site.name}</div>
                      <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-300'}`}>
                        Capacity: {site.maxGrossCapacityPersons.toLocaleString()} persons • Elev: {site.elevationMeters}m
                      </div>
                    </div>
                  </LeafletTooltip>
                </CircleMarker>
              ))}

              {/* DOTS ONLY RENDERING — Strictly no permanent place/town names */}
              {filteredDots.map((dot) => {
                const isSelected = selectedDot?.id === dot.id;
                const style = getDotStyle(dot, isSelected);

                return (
                  <CircleMarker
                    key={dot.id}
                    center={[dot.lat, dot.lng]}
                    radius={style.radius}
                    pathOptions={{
                      fillColor: style.fillColor,
                      color: isSelected ? '#FFFFFF' : style.strokeColor,
                      weight: style.weight,
                      opacity: style.opacity,
                      fillOpacity: style.fillOpacity
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedDot(dot);
                        handleSelectArea(dot.name);
                      }
                    }}
                  >
                    {/* Subtle compact tooltip on hover — displays ONLY Risk Level, NO place names! */}
                    <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.98} className="custom-authority-tooltip">
                      <div className={`font-mono text-xs px-2 py-1 rounded-lg border shadow-lg font-bold backdrop-blur-md ${
                        theme === 'light' ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/60' : 'bg-[#07120D]/95 border-[#1E382B]'
                      }`}>
                        <span className={
                          dot.riskLevel === 'Critical' ? 'text-rose-600 font-extrabold' :
                          dot.riskLevel === 'High' ? 'text-orange-600 font-extrabold' :
                          dot.riskLevel === 'Moderate' ? 'text-amber-600 font-extrabold' : 'text-emerald-600 font-extrabold'
                        }>
                          Risk: {dot.riskLevel.toUpperCase()} ({dot.riskScore})
                        </span>
                      </div>
                    </LeafletTooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          ) : (
            <Dem3DBlockCanvas
              height="100%"
              hazardKey={hazardKey}
              selectedVillage={selectedAreaName}
              onSelectVillage={handleSelectArea}
              onOpenAnalysisModal={() => setShow3dDemModal(true)}
            />
          )}

          {/* Bottom Floating Map Legend (Only in 2D Mode) */}
          {mapMode === '2d' && (
            <div className="absolute bottom-3 left-3 z-[800] pointer-events-none">
              <div className={`pointer-events-auto backdrop-blur-md px-3 py-2 rounded-xl border shadow-2xl flex items-center gap-3 sm:gap-4 text-xs font-mono ${
                theme === 'light' ? 'bg-white/95 border-slate-300 text-slate-800' : 'bg-[#07130E]/95 border-[#1A3125] text-slate-200'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] border border-white" />
                  <span className="font-bold">Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                  <span>High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
                  <span>Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span>Low</span>
                </div>
                {showSafeSites && (
                  <div className={`flex items-center gap-1.5 pl-2 border-l ${
                    theme === 'light' ? 'border-slate-300' : 'border-[#1A3125]'
                  }`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-white" />
                    <span className="text-emerald-500 font-bold">Safe Site</span>
                  </div>
                )}
                <span className={`w-px h-3.5 hidden sm:inline ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-700'}`} />
                <span className={`text-[11px] hidden sm:inline ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Click dot to inspect risk & population
                </span>
              </div>
            </div>
          )}

          {/* =====================================================================
              3. SELECTED DOT DETAIL PANEL (Slide-over drawer on right / bottom sheet)
              ===================================================================== */}
          {selectedDot && (
            <div className={`absolute top-3 bottom-3 right-3 z-[850] w-full max-w-sm backdrop-blur-xl border rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 ${
              theme === 'light'
                ? 'bg-white/98 border-slate-200 text-slate-800 shadow-2xl'
                : 'bg-[#08130E]/98 border-rose-500/40 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.95)]'
            }`}>
            
            {/* Panel Header */}
            <div className={`p-4 border-b flex items-start justify-between ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0C1B14] border-[#1A3125]'
            }`}>
              <div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  selectedDot.riskLevel === 'Critical' ? (theme === 'light' ? 'bg-rose-50 text-rose-800 border border-rose-300' : 'bg-rose-950 text-rose-300 border border-rose-700') :
                  selectedDot.riskLevel === 'High' ? (theme === 'light' ? 'bg-orange-50 text-orange-800 border border-orange-300' : 'bg-orange-950 text-orange-300 border border-orange-700') :
                  selectedDot.riskLevel === 'Moderate' ? (theme === 'light' ? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-amber-950 text-amber-300 border border-amber-700') :
                  (theme === 'light' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-emerald-950 text-emerald-300 border border-emerald-700')
                }`}>
                  ● RISK STATUS: {selectedDot.riskLevel.toUpperCase()}
                </span>
                
                <h3 className={`text-base font-bold mt-1.5 font-sans leading-snug ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {selectedDot.name}
                </h3>
                
                <div className={`text-[11px] font-mono mt-0.5 ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  GPS: {selectedDot.lat.toFixed(4)}°N, {selectedDot.lng.toFixed(4)}°E
                </div>

                <button
                  onClick={() => {
                    setMapMode('3d-dem');
                    handleSelectArea(selectedDot.name);
                  }}
                  className={`mt-2 py-1 px-2 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100'
                      : 'bg-cyan-950/90 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900'
                  }`}
                >
                  <Mountain className="w-3.5 h-3.5" />
                  <span>Inspect in 3D DEM Relief</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedDot(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  theme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Body: Horizontal Risk Bar Charts & Population */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 font-sans text-xs">
              
              {/* Horizontal Risk Bars Section — Dynamically Scoped to Active Hazard */}
              <div className={`space-y-3 p-3.5 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050D0A] border-[#162B20]'
              }`}>
                <div className={`text-[11px] font-mono uppercase font-bold tracking-wider flex items-center justify-between ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  <span>Hazard Measurements</span>
                  <span className={`text-[10px] font-semibold ${
                    hazardKey === 'cloudburst' ? (theme === 'light' ? 'text-amber-700' : 'text-amber-400') :
                    hazardKey === 'flood' ? (theme === 'light' ? 'text-blue-700' : 'text-blue-400') :
                    hazardKey === 'coastal-erosion' ? (theme === 'light' ? 'text-teal-700' : 'text-teal-400') :
                    (theme === 'light' ? 'text-rose-700' : 'text-rose-400')
                  }`}>
                    {hazardKey === 'cloudburst' ? 'CLOUDBURST METRICS' :
                     hazardKey === 'flood' ? 'FLOOD METRICS' :
                     hazardKey === 'coastal-erosion' ? 'COASTAL EROSION METRICS' :
                     'LANDSLIDE METRICS'}
                  </span>
                </div>

                {/* 1. CLOUDBURST SPECIFIC METRICS */}
                {hazardKey === 'cloudburst' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>CLOUDBURST RISK</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>{selectedDot.riskScore}</span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedDot.riskScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>FLASH DELUGE & RUNOFF RISK</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-rose-700' : 'text-rose-400'}`}>
                          {selectedDot.floodRisk || Math.min(100, Math.round(selectedDot.riskScore * 0.96))}
                        </span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedDot.floodRisk || Math.min(100, Math.round(selectedDot.riskScore * 0.96))}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>SURFACE SLOPE</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>{selectedDot.surfaceSlope}°</span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (selectedDot.surfaceSlope / 50) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>24-HOUR BURST RAINFALL</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>{selectedDot.rainfall24h} mm</span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (selectedDot.rainfall24h / 350) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 2. FLOOD SPECIFIC METRICS */}
                {hazardKey === 'flood' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>FLOOD INUNDATION RISK</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>
                          {selectedDot.floodRisk || selectedDot.riskScore}
                        </span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedDot.floodRisk || selectedDot.riskScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>EMBANKMENT BREACH RISK</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-rose-700' : 'text-rose-400'}`}>
                          {Math.min(100, Math.round(selectedDot.riskScore * 0.94))}
                        </span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round(selectedDot.riskScore * 0.94))}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>24-HOUR CATCHMENT RAINFALL</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>{selectedDot.rainfall24h} mm</span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (selectedDot.rainfall24h / 250) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>FLOODPLAIN GRADIENT</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>{selectedDot.surfaceSlope}°</span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (selectedDot.surfaceSlope / 15) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 3. COASTAL EROSION SPECIFIC METRICS */}
                {hazardKey === 'coastal-erosion' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>COASTAL EROSION RISK</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-teal-700' : 'text-teal-400'}`}>{selectedDot.riskScore}</span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedDot.riskScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>STORM SURGE & WAVE EXPOSURE</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>
                          {Math.min(100, Math.round(selectedDot.riskScore * 0.92))}
                        </span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round(selectedDot.riskScore * 0.92))}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>COASTAL DUNE / SCARP SLOPE</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>{selectedDot.surfaceSlope}°</span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (selectedDot.surfaceSlope / 20) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>SHORELINE RETREAT RATE</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-rose-700' : 'text-rose-400'}`}>
                          {selectedDot.specificConditions?.find(c => c.label.toLowerCase().includes('erosion'))?.value || '-5.8 m/yr'}
                        </span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: '85%' }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 4. LANDSLIDE SPECIFIC METRICS */}
                {hazardKey === 'landslide' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>LANDSLIDE RISK</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-rose-700' : 'text-rose-400'}`}>
                          {selectedDot.landslideRisk || selectedDot.riskScore}
                        </span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedDot.landslideRisk || selectedDot.riskScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>SOIL MOISTURE SATURATION</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>
                          {selectedDot.soilMoisture || 92}%
                        </span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${selectedDot.soilMoisture || 92}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>SURFACE SLOPE</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>{selectedDot.surfaceSlope}°</span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (selectedDot.surfaceSlope / 50) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>24-HOUR RAINFALL</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>{selectedDot.rainfall24h} mm</span>
                      </div>
                      <div className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-[#11231A]'}`}>
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (selectedDot.rainfall24h / 350) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* People & Area at Risk */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`p-2.5 rounded-xl border text-center ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050D0A] border-[#162B20]'
                }`}>
                  <div className={`text-[10px] font-mono uppercase ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>People At Risk</div>
                  <div className={`text-base font-mono font-bold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {selectedDot.peopleAtRisk.toLocaleString()}
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border text-center ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050D0A] border-[#162B20]'
                }`}>
                  <div className={`text-[10px] font-mono uppercase ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Families</div>
                  <div className={`text-base font-mono font-bold mt-1 ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>
                    {selectedDot.vulnerableFamilies}
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border text-center ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050D0A] border-[#162B20]'
                }`}>
                  <div className={`text-[10px] font-mono uppercase ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Vulnerable Area</div>
                  <div className={`text-base font-mono font-bold mt-1 ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>
                    {selectedDot.vulnerableAreaHa} ha
                  </div>
                </div>
              </div>

              {/* Specific Conditions */}
              {selectedDot.specificConditions && selectedDot.specificConditions.length > 0 && (
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#06140F] border-[#1A3125]'
                }`}>
                  <div className={`text-[10px] font-mono uppercase font-bold ${
                    theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Terrain & Hazard Conditions
                  </div>
                  {selectedDot.specificConditions.map((cond, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono">
                      <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{cond.label}:</span>
                      <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{cond.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Module Navigation Links */}
              <div className="space-y-1.5 pt-1">
                <div className={`text-[10px] font-mono uppercase font-bold ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Direct Authority Directives:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => selectHazardModule('priority-evacuation')}
                    className={`p-2 rounded-lg border text-[10px] font-mono font-bold transition-all text-center cursor-pointer ${
                      theme === 'light'
                        ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                        : 'bg-[#0E1E17] hover:bg-[#152E23] border-rose-500/30 text-rose-300'
                    }`}
                  >
                    VIEW PRIORITY
                  </button>
                  <button
                    onClick={() => selectHazardModule('safe-relocation')}
                    className={`p-2 rounded-lg border text-[10px] font-mono font-bold transition-all text-center cursor-pointer ${
                      theme === 'light'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-[#0E1E17] hover:bg-[#152E23] border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    VIEW SAFE SITE
                  </button>
                  <button
                    onClick={() => selectHazardModule('relocation-planning')}
                    className={`p-2 rounded-lg border text-[10px] font-mono font-bold transition-all text-center cursor-pointer ${
                      theme === 'light'
                        ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                        : 'bg-[#0E1E17] hover:bg-[#152E23] border-amber-500/30 text-amber-300'
                    }`}
                  >
                    VIEW MOVEMENT
                  </button>
                </div>
              </div>

            </div>

            {/* Panel Footer: Data Source Line */}
            <div className={`p-3 border-t flex items-center justify-between text-[10px] font-mono ${
              theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-[#1A3125] bg-[#050D0A] text-slate-400'
            }`}>
              <span className="truncate">Source: {selectedDot.dataSource}</span>
              <span className={`font-bold uppercase ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>{selectedDot.dataStatus}</span>
            </div>

          </div>
        )}

        </div>
      </div>

      {/* =========================================================================
          FULL-SCREEN 3D DEM MODAL
          ========================================================================= */}
      {show3dDemModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className={`relative w-full max-w-6xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
            theme === 'light' ? 'bg-white border-slate-300 shadow-slate-400/40' : 'bg-[#08130E] border-cyan-500/50'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#1A3125] bg-[#0C1E16]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  theme === 'light' ? 'bg-cyan-100 border border-cyan-300 text-cyan-700' : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                }`}>
                  <Mountain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-base sm:text-lg font-mono font-bold uppercase tracking-wider flex items-center gap-2 ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>
                    <span>Digital Elevation Model (DEM) & Topography</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      theme === 'light' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold' : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    }`}>
                      {profile.name.toUpperCase()}
                    </span>
                  </h2>
                  <p className={`text-xs font-sans ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    Interactive 3D elevation surface, slope gradient analysis, peak detection, and runoff flow modeling.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShow3dDemModal(false)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  theme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Close 3D DEM Modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal 3D DEM Body */}
            <div className={`p-3 sm:p-4 flex-1 overflow-auto ${
              theme === 'light' ? 'bg-slate-50' : 'bg-transparent'
            }`}>
              <Dem3DBlockCanvas
                height="560px"
                hazardKey={hazardKey}
                selectedVillage={selectedAreaName}
                onSelectVillage={handleSelectArea}
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. AFTER THE MAP — CURRENT RAINFALL CONDITIONS (OPEN-METEO & AREA SELECTOR)
          ========================================================================= */}
      <div className={`p-5 rounded-2xl border shadow-sm space-y-4 transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0A1410] border-[#1A2E24]'
      }`}>
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4 ${
          theme === 'light' ? 'border-slate-200' : 'border-[#1A2E24]'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-cyan-500" />
              <h2 className={`font-mono text-sm sm:text-base font-bold uppercase tracking-wide ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                CURRENT RAINFALL CONDITIONS
              </h2>
            </div>
            <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Hourly precipitation trend and cumulative intensity observations calibrated by sector.
            </p>
          </div>

          {/* Option Change Area Controls & Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Area Selector Dropdown */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-300 shadow-sm' : 'bg-[#050D0A] border-[#162B20]'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <MapPin className="w-3 h-3 text-cyan-500" />
                <span>Area:</span>
              </span>
              <select
                value={currentAreaProfile?.key || selectedAreaName}
                onChange={(e) => handleSelectArea(e.target.value)}
                className={`border-none rounded text-xs font-mono font-bold focus:outline-none cursor-pointer ${
                  theme === 'light' ? 'bg-transparent text-slate-900' : 'bg-[#0E1E17] text-cyan-300'
                }`}
              >
                {availableAreas.map((area) => (
                  <option key={area.key} value={area.key} className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#0A1410] text-white'}>
                    {area.key} — {area.rainfall24h} mm (Slope: {area.slopeDeg}°)
                  </option>
                ))}
              </select>
            </div>

            {/* 24-Hour Rainfall Badge */}
            <div className={`px-3 py-1.5 rounded-xl border text-right font-mono ${
              theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#050D0A] border-[#162B20]'
            }`}>
              <div className={`text-[10px] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>24h Rainfall</div>
              <div className={`text-base font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>{activeRainfallData.total24h} mm</div>
            </div>

            {/* Peak Hour Intensity */}
            <div className={`px-3 py-1.5 rounded-xl border text-right font-mono hidden sm:block ${
              theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#050D0A] border-[#162B20]'
            }`}>
              <div className={`text-[10px] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Peak Intensity</div>
              <div className={`text-base font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>{activeRainfallData.peak.rainfallMm} mm/h</div>
            </div>

            {/* Rainfall Status Badge */}
            <div className={`px-3 py-1.5 rounded-xl border text-right font-mono ${
              theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#050D0A] border-[#162B20]'
            }`}>
              <div className={`text-[10px] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Status</div>
              <div className={`text-base font-bold ${
                activeRainfallData.status === 'CRITICAL' ? 'text-rose-600 animate-pulse' :
                activeRainfallData.status === 'HIGH' ? (theme === 'light' ? 'text-orange-700' : 'text-orange-400') :
                activeRainfallData.status === 'MODERATE' ? (theme === 'light' ? 'text-amber-700' : 'text-amber-400') : (theme === 'light' ? 'text-emerald-700' : 'text-emerald-400')
              }`}>
                {activeRainfallData.status}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Area Switch Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className={`text-[10px] font-mono uppercase font-bold mr-1 ${
            theme === 'light' ? 'text-slate-500' : 'text-slate-400'
          }`}>Quick Select Area:</span>
          {availableAreas.slice(0, 8).map((area) => {
            const isSelected = (currentAreaProfile?.key === area.key || selectedAreaName === area.key);
            return (
              <button
                key={area.key}
                onClick={() => handleSelectArea(area.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-md scale-105'
                    : theme === 'light'
                      ? 'bg-white text-slate-700 border-slate-300 hover:border-cyan-500 hover:bg-slate-50 shadow-sm'
                      : 'bg-[#07130E] text-slate-300 border-[#1A3125] hover:border-cyan-500/50 hover:text-white'
                }`}
              >
                {area.key} ({area.rainfall24h}mm)
              </button>
            );
          })}
        </div>

        {/* Hourly Rainfall Chart */}
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeRainfallData.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#E2E8F0' : '#1A3125'} vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                fontFamily="monospace"
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={11} 
                tickLine={false} 
                unit=" mm"
                fontFamily="monospace"
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#FFFFFF' : '#07120D', 
                  border: theme === 'light' ? '1px solid #CBD5E1' : '1px solid #06B6D4', 
                  color: theme === 'light' ? '#0F172A' : '#F8FAFC',
                  borderRadius: '8px', 
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="rainfallMm" 
                stroke="#06B6D4" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#rainGradient)" 
                name="Rainfall (mm)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Statement & Data Source */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t text-xs font-mono ${
          theme === 'light' ? 'border-slate-200 text-slate-700' : 'border-[#1A2E24]/60 text-slate-300'
        }`}>
          <div>
            <strong className={theme === 'light' ? 'text-cyan-800' : 'text-cyan-400'}>
              RAINFALL STATUS ({(currentAreaProfile?.key || selectedAreaName).toUpperCase()}):
            </strong>{' '}
            Recorded {activeRainfallData.total24h} mm cumulative 24h precipitation with peak burst of {activeRainfallData.peak.rainfallMm} mm/h at {activeRainfallData.peak.time}.{' '}
            {activeRainfallData.status === 'CRITICAL' && (
              <span className="text-rose-600 font-bold">Severe saturation trigger breached with acute debris flow initiation risk.</span>
            )}
            {activeRainfallData.status === 'HIGH' && (
              <span className={theme === 'light' ? 'text-orange-700 font-bold' : 'text-orange-400 font-bold'}>
                Heavy precipitation continuing to elevate pore water pressures across scarps.
              </span>
            )}
            {activeRainfallData.status === 'MODERATE' && (
              <span className={theme === 'light' ? 'text-amber-700' : 'text-amber-400'}>
                Moderate steady rainfall within standard surface channel drainage bounds.
              </span>
            )}
            {activeRainfallData.status === 'NORMAL' && (
              <span className={theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}>
                Normal light precipitation with low immediate geotechnical consequence.
              </span>
            )}
          </div>
          <div className="text-slate-500 whitespace-nowrap">
            Source: Open-Meteo live feed • Calibrated: {currentAreaProfile?.key || selectedAreaName}
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. HAZARD-SPECIFIC LOWER SECTION: SOIL MOISTURE (GEOTECHNICAL MODEL) / RIVER STAGE / EROSION
          ========================================================================= */}
      {hazardKey === 'landslide' ? (
        <div className="space-y-4">
          {/* Top Option Selector Bar for Soil Moisture Model */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#08130E] border-[#1A3125]'
          }`}>
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-emerald-500" />
              <div>
                <div className={`font-mono text-xs uppercase font-bold ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>Soil Analysis Mode</div>
                <div className={`font-serif font-bold text-sm ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {soilAnalysisMode === 'geotechnical' 
                    ? 'Geotechnical Mohr-Coulomb & FoS Liquefaction Model' 
                    : 'SMAP Satellite Soil Moisture & Antecedent Precipitation Trend'}
                </div>
              </div>
            </div>

            {/* Option Change Mode Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoilAnalysisMode('geotechnical')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  soilAnalysisMode === 'geotechnical'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                    : theme === 'light'
                      ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      : 'bg-[#0E1E17] text-slate-300 border-[#1E3228] hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Geotechnical Model (FoS)</span>
              </button>

              <button
                onClick={() => setSoilAnalysisMode('satellite')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  soilAnalysisMode === 'satellite'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                    : theme === 'light'
                      ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      : 'bg-[#0E1E17] text-slate-300 border-[#1E3228] hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Satellite Telemetry</span>
              </button>
            </div>
          </div>

          {/* Conditional Rendering: Geotechnical Soil Model vs Satellite Trend */}
          {soilAnalysisMode === 'geotechnical' ? (
            <SoilMoistureAnalysisHub 
              initialVillage={currentAreaProfile?.key || selectedAreaName}
              onVillageChange={(v) => handleSelectArea(v)}
            />
          ) : (
            <div className={`p-5 rounded-2xl border shadow-sm space-y-4 transition-colors ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0A1410] border-[#1A2E24]'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                theme === 'light' ? 'border-slate-200' : 'border-[#1A2E24]'
              }`}>
                <div>
                  <h2 className={`font-mono text-sm sm:text-base font-bold uppercase tracking-wide ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>
                    {conditionTrend.title}
                  </h2>
                  <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    NASA SMAP Satellite Surface & Root-Zone Moisture vs GSI Antecedent Rainfall.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
                    theme === 'light'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                  }`}>
                    Target: {currentAreaProfile?.key || selectedAreaName}
                  </span>
                </div>
              </div>

              {/* Dual Series Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border space-y-2 ${
                  theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#050D0A] border-[#162B20]'
                }`}>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className={`font-bold uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>{conditionTrend.seriesA.label}</span>
                    <span className={`font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>{conditionTrend.seriesA.unit}</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={conditionTrend.seriesA.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#E2E8F0' : '#1A3125'} vertical={false} />
                        <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                        <RechartsTooltip contentStyle={{ 
                          backgroundColor: theme === 'light' ? '#FFFFFF' : '#07120D', 
                          border: theme === 'light' ? '1px solid #CBD5E1' : '1px solid #10B981', 
                          color: theme === 'light' ? '#0F172A' : '#F8FAFC',
                          borderRadius: '8px', 
                          fontSize: '11px', 
                          fontFamily: 'monospace',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} />
                        <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name={conditionTrend.seriesA.label} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border space-y-2 ${
                  theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#050D0A] border-[#162B20]'
                }`}>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className={`font-bold uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>{conditionTrend.seriesB.label}</span>
                    <span className={`font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>{conditionTrend.seriesB.unit}</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={conditionTrend.seriesB.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#E2E8F0' : '#1A3125'} vertical={false} />
                        <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                        <RechartsTooltip contentStyle={{ 
                          backgroundColor: theme === 'light' ? '#FFFFFF' : '#07120D', 
                          border: theme === 'light' ? '1px solid #CBD5E1' : '1px solid #F59E0B', 
                          color: theme === 'light' ? '#0F172A' : '#F8FAFC',
                          borderRadius: '8px', 
                          fontSize: '11px', 
                          fontFamily: 'monospace',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} />
                        <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name={conditionTrend.seriesB.label} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Interpretation Takeaway Box */}
              <div className={`p-3 rounded-xl border text-xs font-sans leading-relaxed ${
                theme === 'light'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-[#071610] border-emerald-500/20 text-slate-200'
              }`}>
                <span className={`font-mono font-bold uppercase mr-1 ${
                  theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'
                }`}>Condition Interpretation:</span>
                {conditionTrend.takeawayText}
              </div>

              <div className={`text-right text-[10px] font-mono pt-1 border-t ${
                theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-[#1A2E24]/60 text-slate-500'
              }`}>
                {conditionTrend.sourceText}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Non-Landslide Hazard Condition Section (Flood / Cloudburst / Coastal Erosion) */
        <div className={`p-5 rounded-2xl border shadow-sm space-y-4 transition-colors ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${
            theme === 'light' ? 'border-slate-200' : 'border-[#1A2E24]'
          }`}>
            <div>
              <h2 className={`font-mono text-sm sm:text-base font-bold uppercase tracking-wide ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {conditionTrend.title}
              </h2>
              <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Environmental observation time series and risk relationship interpretation.
              </p>
            </div>

            {/* Option Change Area Selector for Other Hazards */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-300 shadow-sm' : 'bg-[#050D0A] border-[#162B20]'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span>Sector:</span>
              </span>
              <select
                value={currentAreaProfile?.key || selectedAreaName}
                onChange={(e) => handleSelectArea(e.target.value)}
                className={`border-none rounded text-xs font-mono font-bold focus:outline-none cursor-pointer ${
                  theme === 'light' ? 'bg-transparent text-slate-900' : 'bg-[#0E1E17] text-emerald-300'
                }`}
              >
                {availableAreas.map((area) => (
                  <option key={area.key} value={area.key} className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#0A1410] text-white'}>
                    {area.key} (Risk: {area.riskScore})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dual Series Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border space-y-2 ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#050D0A] border-[#162B20]'
            }`}>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className={`font-bold uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>{conditionTrend.seriesA.label}</span>
                <span className={`font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>{conditionTrend.seriesA.unit}</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conditionTrend.seriesA.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#E2E8F0' : '#1A3125'} vertical={false} />
                    <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                    <RechartsTooltip contentStyle={{ 
                      backgroundColor: theme === 'light' ? '#FFFFFF' : '#07120D', 
                      border: theme === 'light' ? '1px solid #CBD5E1' : '1px solid #10B981', 
                      color: theme === 'light' ? '#0F172A' : '#F8FAFC',
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      fontFamily: 'monospace',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name={conditionTrend.seriesA.label} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#050D0A] border-[#162B20]'
            }`}>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className={`font-bold uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>{conditionTrend.seriesB.label}</span>
                <span className={`font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>{conditionTrend.seriesB.unit}</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conditionTrend.seriesB.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#E2E8F0' : '#1A3125'} vertical={false} />
                    <XAxis dataKey="label" stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                    <RechartsTooltip contentStyle={{ 
                      backgroundColor: theme === 'light' ? '#FFFFFF' : '#07120D', 
                      border: theme === 'light' ? '1px solid #CBD5E1' : '1px solid #F59E0B', 
                      color: theme === 'light' ? '#0F172A' : '#F8FAFC',
                      borderRadius: '8px', 
                      fontSize: '11px', 
                      fontFamily: 'monospace',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} />
                    <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name={conditionTrend.seriesB.label} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Interpretation Takeaway Box */}
          <div className={`p-3 rounded-xl border text-xs font-sans leading-relaxed ${
            theme === 'light'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-[#071610] border-emerald-500/20 text-slate-200'
          }`}>
            <span className={`font-mono font-bold uppercase mr-1 ${
              theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'
            }`}>Condition Interpretation:</span>
            {conditionTrend.takeawayText}
          </div>

          <div className={`text-right text-[10px] font-mono pt-1 border-t ${
            theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-[#1A2E24]/60 text-slate-500'
          }`}>
            {conditionTrend.sourceText}
          </div>
        </div>
      )}

    </div>
  );
};
