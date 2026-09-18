import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  DIBRUGARH_FLOOD_SUMMARY,
  DIBRUGARH_REVENUE_CIRCLES,
  DIBRUGARH_VULNERABLE_VILLAGES,
  DIBRUGARH_SAFE_DESTINATIONS,
  ASSAM_AHP_WEIGHTS,
  ASSAM_AHP_METRICS,
  ASSAM_ROC_POINTS,
  ASSAM_ACCURACY_METRICS,
  DIBRUGARH_DATA_DICTIONARY,
  BRAHMAPUTRA_RIVER_COORDINATES,
  IFI_DISTRICT_PROFILE,
  IFI_DECADAL_TRENDS,
  IFI_HISTORICAL_MILESTONES,
  ASSAM_DISASTER_FINANCING_ECOSYSTEM,
  FloodRevenueCircle,
  VulnerableVillage,
  SafeRelocationHub
} from '../data/assamFloodData';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  CircleMarker,
  Popup,
  useMap
} from 'react-leaflet';
import {
  Droplets,
  AlertTriangle,
  ShieldCheck,
  Users,
  Compass,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  Crosshair,
  FileSpreadsheet,
  CheckCircle2,
  Activity,
  BarChart3,
  TrendingUp,
  Sliders,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Home,
  Info,
  Building2,
  Eye,
  Radio,
  History,
  Landmark,
  Calendar,
  DollarSign
} from 'lucide-react';

// 100% Free Open Basemaps (No API Key Required)
const BASE_MAPS = {
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19
  },
  dark: {
    id: 'dark',
    name: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Dark Gray Base',
    maxZoom: 19
  },
  street: {
    id: 'street',
    name: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  terrain: {
    id: 'terrain',
    name: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 19
  }
};

type BaseMapKey = keyof typeof BASE_MAPS;

// Fly-to controller for Leaflet map
const MapFocusController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const FloodIntelligence: React.FC = () => {
  const { setActiveView } = useApp();

  // Active view tab: 'poster' (Scientific Workflow Poster) or 'command' (Interactive GIS Command View)
  const [activeTab, setActiveTab] = useState<'poster' | 'command'>('poster');

  // Map state (Centered on Dibrugarh District, Assam)
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.360, 95.080]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [baseMap, setBaseMap] = useState<BaseMapKey>('satellite');

  // Selection states
  const [selectedCircle, setSelectedCircle] = useState<FloodRevenueCircle | null>(DIBRUGARH_REVENUE_CIRCLES[0]);
  const [selectedVillage, setSelectedVillage] = useState<VulnerableVillage | null>(null);
  const [selectedSite, setSelectedSite] = useState<SafeRelocationHub | null>(null);

  // Accordion toggles
  const [isAhpExpanded, setIsAhpExpanded] = useState<boolean>(true);
  const [isDictionaryExpanded, setIsDictionaryExpanded] = useState<boolean>(false);
  const [isRelocationExpanded, setIsRelocationExpanded] = useState<boolean>(true);
  const [isIfiExpanded, setIsIfiExpanded] = useState<boolean>(true);
  const [isEcosystemExpanded, setIsEcosystemExpanded] = useState<boolean>(true);
  const [selectedFinCircle, setSelectedFinCircle] = useState<string>('Chabua');

  // GIS Layer toggles
  const [layers, setLayers] = useState({
    circles: true,
    river: true,
    redZones: true,
    habitations: true,
    safeSites: true,
    evacuationRoutes: true
  });

  const toggleLayer = (layerName: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  // Zoom to circle
  const handleZoomToCircle = (c: FloodRevenueCircle) => {
    setMapCenter([c.lat, c.lon]);
    setMapZoom(12);
    setSelectedCircle(c);
  };

  // Zoom to village
  const handleZoomToVillage = (v: VulnerableVillage) => {
    setMapCenter([v.lat, v.lon]);
    setMapZoom(14);
    setSelectedVillage(v);
  };

  // Zoom to safe site
  const handleZoomToSite = (s: SafeRelocationHub) => {
    setMapCenter([s.lat, s.lon]);
    setMapZoom(14);
    setSelectedSite(s);
  };

  // Color helper for risk classes
  const getRiskColor = (riskClass: string) => {
    switch (riskClass) {
      case 'CRITICAL': return '#E8543E';
      case 'HIGH': return '#E8A63E';
      case 'MODERATE': return '#F59E0B';
      default: return '#4ADE9A';
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 font-sans">
      
      {/* ===================================================
          1. PAGE HEADER & STATUS BADGE
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-5 shadow-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl">🌊</span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-mono">
                FLOOD INTELLIGENCE &amp; SMART RELOCATION
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                ● HISTORICAL / REFERENCE ANALYSIS
              </span>
            </div>
            
            <p className="text-sm text-pine-muted mt-1 font-sans">
              <span className="text-emerald-400 font-semibold">Dibrugarh District — Assam, India</span>
              <span className="mx-2 text-[#25352E]">|</span>
              <span>GIS-RS Multi-Criteria Decision Analysis (MCDA) &amp; Carrying Capacity Solver (CCAS)</span>
            </p>
            <p className="text-xs text-pine-muted/80 mt-1 italic">
              Scientific Reference: Kopili River Basin Assam Flood MCA Methodology (Flood Risk = Flood Hazard &times; Total Vulnerability)
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 self-start lg:self-auto bg-[#0E1814] p-1.5 rounded-xl border border-[#1E3228]">
            <button
              onClick={() => setActiveTab('poster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'poster'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-pine-muted hover:text-white hover:bg-[#16241E]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>8-Step Scientific Poster</span>
            </button>
            <button
              onClick={() => setActiveTab('command')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'command'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-pine-muted hover:text-white hover:bg-[#16241E]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>GIS Command Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          2. TOP 6 KPI CARDS (Real Grounded Statistics)
          =================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Card 1: High-Risk Habitations */}
        <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl hover:border-emerald-700/50 transition-colors shadow-sm">
          <p className="text-[11px] font-mono text-pine-muted uppercase tracking-wider">High-Risk Habitations</p>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {DIBRUGARH_FLOOD_SUMMARY.high_risk_habitations_count}
            </span>
            <span className="text-xs text-pine-muted">Villages</span>
          </div>
          <p className="text-[11px] text-rose-400/80 font-bold truncate">Brahmaputra Frontage</p>
        </div>

        {/* Card 2: Moderate-Risk Habitations */}
        <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl hover:border-emerald-700/50 transition-colors shadow-sm">
          <p className="text-[11px] font-mono text-pine-muted uppercase tracking-wider">Moderate-Risk Habitations</p>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {DIBRUGARH_FLOOD_SUMMARY.moderate_risk_habitations_count}
            </span>
            <span className="text-xs text-pine-muted">Villages</span>
          </div>
          <p className="text-[11px] text-amber-400/80 font-bold truncate">Tributary Runoff Plains</p>
        </div>

        {/* Card 3: Exposed Population */}
        <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl hover:border-emerald-700/50 transition-colors shadow-sm">
          <p className="text-[11px] font-mono text-pine-muted uppercase tracking-wider">Exposed Population</p>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-white">
              {DIBRUGARH_FLOOD_SUMMARY.total_population_affected.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400/80 font-bold truncate">Across 7 Circles (2022)</p>
        </div>

        {/* Card 4: Immediate Priority (P1) */}
        <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl hover:border-emerald-700/50 transition-colors shadow-sm">
          <p className="text-[11px] font-mono text-pine-muted uppercase tracking-wider">Immediate Priority (P1)</p>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-rose-400">
              {DIBRUGARH_FLOOD_SUMMARY.immediate_priority_families.toLocaleString()}
            </span>
            <span className="text-xs text-pine-muted">Families</span>
          </div>
          <p className="text-[11px] text-rose-300 font-bold truncate">Multi Chapari &amp; Dikom</p>
        </div>

        {/* Card 5: Safe Available Capacity */}
        <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl hover:border-emerald-700/50 transition-colors shadow-sm">
          <p className="text-[11px] font-mono text-pine-muted uppercase tracking-wider">Safe Available Capacity</p>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {DIBRUGARH_FLOOD_SUMMARY.safe_available_capacity.toLocaleString()}
            </span>
            <span className="text-xs text-pine-muted">Persons</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 font-bold truncate">6 Vetted Inland Hubs</p>
        </div>

        {/* Card 6: Locations Requiring Action */}
        <div className="bg-[#111D18] border border-[#1E3228] p-3.5 rounded-xl hover:border-emerald-700/50 transition-colors shadow-sm">
          <p className="text-[11px] font-mono text-pine-muted uppercase tracking-wider">Locations Requiring Action</p>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-bold font-mono text-amber-300">
              7
            </span>
            <span className="text-xs text-pine-muted">Circles</span>
          </div>
          <p className="text-[11px] text-amber-300 font-bold truncate">3 Critical Red Zones</p>
        </div>

      </div>

      {/* ===================================================
          3. MAIN INTERACTIVE GIS FLOOD COMMAND MAP
          =================================================== */}
      <div className={`bg-[#111D18] border border-[#1E3228] rounded-2xl overflow-hidden shadow-panel flex flex-col transition-all duration-300 ${
        isMapExpanded ? 'fixed inset-4 z-50' : 'h-[620px] lg:h-[680px]'
      }`}>
        
        {/* Map Header */}
        <div className="p-4 border-b border-[#1E3228] flex flex-wrap items-center justify-between gap-3 bg-[#0E1814]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                FLOOD HAZARD &amp; SMART RELOCATION MAP — DIBRUGARH
              </h2>
              <p className="text-xs text-pine-muted font-mono">
                Brahmaputra Valley | EPSG:4326 WGS84 | 7 Revenue Circles &amp; 169 Healthcare Buffers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Basemap Switcher (100% Free, NO API Key) */}
            <div className="flex items-center gap-1 bg-[#16241E] p-1 rounded-lg border border-[#25352E]">
              {(Object.keys(BASE_MAPS) as BaseMapKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setBaseMap(key)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    baseMap === key
                      ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                      : 'text-pine-muted hover:text-white hover:bg-[#1E3228]'
                  }`}
                  title={`Switch to ${BASE_MAPS[key].name} basemap`}
                >
                  {BASE_MAPS[key].name}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setMapCenter([27.360, 95.080]);
                setMapZoom(11);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#16241E] hover:bg-[#1E3228] border border-[#25352E] text-xs font-mono text-pine-muted hover:text-white transition-colors flex items-center gap-1.5"
              title="Reset View"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Reset Extent</span>
            </button>
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="p-1.5 rounded-lg bg-[#16241E] hover:bg-[#1E3228] border border-[#25352E] text-pine-muted hover:text-white transition-colors"
              title={isMapExpanded ? 'Minimize Map' : 'Expand Fullscreen'}
            >
              {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Map Body */}
        <div className="flex-1 flex flex-col lg:flex-row relative">
          
          {/* GIS Canvas */}
          <div className="flex-1 h-full min-h-[360px] relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="w-full h-full"
              style={{ background: '#0B120F' }}
            >
              <MapFocusController center={mapCenter} zoom={mapZoom} />

              {/* 100% Free Open Basemap */}
              <TileLayer
                key={baseMap}
                attribution={BASE_MAPS[baseMap].attribution}
                url={BASE_MAPS[baseMap].url}
                maxZoom={BASE_MAPS[baseMap].maxZoom}
              />

              {/* Brahmaputra River Polyline */}
              {layers.river && (
                <Polyline
                  positions={BRAHMAPUTRA_RIVER_COORDINATES}
                  color="#38BDF8"
                  weight={6}
                  opacity={0.85}
                  dashArray="none"
                />
              )}

              {/* Revenue Circle Polygons */}
              {layers.circles && DIBRUGARH_REVENUE_CIRCLES.map((circle) => {
                const isSelected = selectedCircle?.object_id === circle.object_id;
                const riskColor = getRiskColor(circle.risk_class);

                return (
                  <React.Fragment key={`circle-${circle.object_id}`}>
                    {circle.polygon.map((poly, pIdx) => (
                      <Polygon
                        key={`poly-${circle.object_id}-${pIdx}`}
                        positions={poly}
                        pathOptions={{
                          color: isSelected ? '#FFFFFF' : riskColor,
                          weight: isSelected ? 3 : 1.8,
                          fillColor: riskColor,
                          fillOpacity: isSelected ? 0.45 : 0.22
                        }}
                        eventHandlers={{
                          click: () => {
                            setSelectedCircle(circle);
                          }
                        }}
                      >
                        <Popup>
                          <div className="p-1 min-w-[200px] text-xs font-sans">
                            <h4 className="font-bold text-slate-900 text-sm border-b pb-1 mb-1">
                              {circle.revenue_circle} Circle
                            </h4>
                            <p className="text-slate-600"><strong>Risk Class:</strong> <span style={{ color: riskColor }}>{circle.risk_class}</span></p>
                            <p className="text-slate-600"><strong>Flood Hazard:</strong> {circle.flood_hazard_score} / 100</p>
                            <p className="text-slate-600"><strong>Total Vulnerability:</strong> {circle.total_vulnerability_score} / 100</p>
                            <p className="text-slate-600"><strong>Population Affected:</strong> {circle.population_affected.toLocaleString()}</p>
                            <p className="text-slate-600"><strong>Crop Loss:</strong> {circle.crop_area_hectares.toLocaleString()} ha</p>
                            <p className="text-slate-600"><strong>RPI Priority:</strong> {circle.rpi_priority}</p>
                          </div>
                        </Popup>
                      </Polygon>
                    ))}
                  </React.Fragment>
                );
              })}

              {/* Vulnerable Habitations */}
              {layers.habitations && DIBRUGARH_VULNERABLE_VILLAGES.map((v) => {
                const isSelected = selectedVillage?.id === v.id;
                return (
                  <CircleMarker
                    key={v.id}
                    center={[v.lat, v.lon]}
                    radius={isSelected ? 9 : 6}
                    pathOptions={{
                      color: '#FFFFFF',
                      weight: 2,
                      fillColor: v.urgency === 'P1 - IMMEDIATE' ? '#E8543E' : '#E8A63E',
                      fillOpacity: 0.9
                    }}
                    eventHandlers={{
                      click: () => setSelectedVillage(v)
                    }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[220px] text-xs font-sans">
                        <div className="flex items-center justify-between border-b pb-1 mb-1">
                          <h4 className="font-bold text-slate-900">{v.village_name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                            {v.urgency}
                          </span>
                        </div>
                        <p className="text-slate-600"><strong>Revenue Circle:</strong> {v.revenue_circle}</p>
                        <p className="text-slate-600"><strong>Exposed Pop:</strong> {v.population.toLocaleString()} ({v.households} households)</p>
                        <p className="text-slate-600"><strong>Primary Threat:</strong> {v.primary_hazard}</p>
                        <p className="text-slate-600"><strong>RPI Score:</strong> {v.rpi_score} / 100</p>
                        <p className="text-emerald-700 font-bold mt-1">
                          Assigned Safe Site: {v.assigned_safe_site_id} ({v.distance_km} km)
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Safe Relocation Destination Hubs */}
              {layers.safeSites && DIBRUGARH_SAFE_DESTINATIONS.map((site) => {
                const isSelected = selectedSite?.site_id === site.site_id;
                return (
                  <CircleMarker
                    key={site.site_id}
                    center={[site.lat, site.lon]}
                    radius={isSelected ? 10 : 7}
                    pathOptions={{
                      color: '#FFFFFF',
                      weight: 2,
                      fillColor: '#10B981',
                      fillOpacity: 0.95
                    }}
                    eventHandlers={{
                      click: () => setSelectedSite(site)
                    }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[240px] text-xs font-sans">
                        <div className="flex items-center justify-between border-b pb-1 mb-1">
                          <h4 className="font-bold text-emerald-900">{site.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            CCAS {site.ccas_score}
                          </span>
                        </div>
                        <p className="text-slate-600"><strong>Zone:</strong> {site.revenue_circle} (Elev: {site.elevation_m}m MSL)</p>
                        <p className="text-slate-600"><strong>Available Capacity:</strong> {site.available_capacity.toLocaleString()} persons</p>
                        <p className="text-slate-600"><strong>Water Supply:</strong> {site.water_capacity_lpd.toLocaleString()} L/day</p>
                        <p className="text-slate-600"><strong>Sanitation:</strong> {site.latrines_count} latrines (Sphere compliant)</p>
                        <p className="text-slate-600"><strong>Road Access:</strong> {site.road_access}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-[400] bg-[#111D18]/90 backdrop-blur-md p-3 rounded-xl border border-[#1E3228] text-xs font-sans shadow-lg max-w-[280px]">
              <p className="font-bold text-white mb-2 text-[11px] uppercase tracking-wider font-mono">
                FLOOD HAZARD LEGEND
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#E8543E] border border-white/20" />
                  <span className="text-pine-muted text-[11px]">Critical Risk (Chabua, Dibrugarh West)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#E8A63E] border border-white/20" />
                  <span className="text-pine-muted text-[11px]">High Risk (Moran, Dibrugarh East)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#F59E0B] border border-white/20" />
                  <span className="text-pine-muted text-[11px]">Moderate Risk (Tingkhong, Tengakhat)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 border border-white" />
                  <span className="text-pine-muted text-[11px]">Vulnerable Habitation (P1 Immediate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                  <span className="text-pine-muted text-[11px]">Vetted Safe Destination (CCAS Vetted)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-[#38BDF8]" />
                  <span className="text-pine-muted text-[11px]">Brahmaputra Mainstem Channel</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right GIS Sidebar: Layer Switcher & Inspector */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[#1E3228] bg-[#0E1814] flex flex-col h-auto lg:h-full overflow-y-auto">
            
            {/* Layer Controls */}
            <div className="p-3.5 border-b border-[#1E3228]">
              <div className="flex items-center gap-2 mb-2.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                  GIS Layer Toggles
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-pine-muted hover:text-white">
                  <input
                    type="checkbox"
                    checked={layers.circles}
                    onChange={() => toggleLayer('circles')}
                    className="rounded border-[#25352E] bg-[#16241E] text-emerald-500 focus:ring-0"
                  />
                  <span>Revenue Circles</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-pine-muted hover:text-white">
                  <input
                    type="checkbox"
                    checked={layers.river}
                    onChange={() => toggleLayer('river')}
                    className="rounded border-[#25352E] bg-[#16241E] text-emerald-500 focus:ring-0"
                  />
                  <span>Brahmaputra River</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-pine-muted hover:text-white">
                  <input
                    type="checkbox"
                    checked={layers.habitations}
                    onChange={() => toggleLayer('habitations')}
                    className="rounded border-[#25352E] bg-[#16241E] text-emerald-500 focus:ring-0"
                  />
                  <span>Habitations</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-pine-muted hover:text-white">
                  <input
                    type="checkbox"
                    checked={layers.safeSites}
                    onChange={() => toggleLayer('safeSites')}
                    className="rounded border-[#25352E] bg-[#16241E] text-emerald-500 focus:ring-0"
                  />
                  <span>Safe Hubs</span>
                </label>
              </div>
            </div>

            {/* Inspector Details */}
            <div className="p-4 flex-1 space-y-4">
              {selectedCircle ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1E3228] pb-2">
                    <h4 className="font-bold text-white text-sm">
                      {selectedCircle.revenue_circle}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold" style={{
                      backgroundColor: `${getRiskColor(selectedCircle.risk_class)}20`,
                      color: getRiskColor(selectedCircle.risk_class),
                      border: `1px solid ${getRiskColor(selectedCircle.risk_class)}50`
                    }}>
                      {selectedCircle.risk_class}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#16241E]">
                      <span className="text-pine-muted">Flood Hazard Score:</span>
                      <span className="font-mono text-white font-bold">{selectedCircle.flood_hazard_score} / 100</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#16241E]">
                      <span className="text-pine-muted">Social Vulnerability:</span>
                      <span className="font-mono text-white font-bold">{selectedCircle.social_vulnerability_score} / 100</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#16241E]">
                      <span className="text-pine-muted">Infrastructure Vuln:</span>
                      <span className="font-mono text-white font-bold">{selectedCircle.infra_vulnerability_score} / 100</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#16241E]">
                      <span className="text-pine-muted">Land-Use Vulnerability:</span>
                      <span className="font-mono text-white font-bold">{selectedCircle.landuse_vulnerability_score} / 100</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#16241E]">
                      <span className="text-pine-muted">Total Vulnerability:</span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedCircle.total_vulnerability_score} / 100</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#16241E]">
                      <span className="text-pine-muted">Exposed Population:</span>
                      <span className="font-mono text-rose-400 font-bold">{selectedCircle.population_affected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#16241E]">
                      <span className="text-pine-muted">Submerged Crop Area:</span>
                      <span className="font-mono text-amber-300 font-bold">{selectedCircle.crop_area_hectares.toLocaleString()} ha</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#16241E]">
                      <span className="text-pine-muted">Road Damage Incidents:</span>
                      <span className="font-mono text-white font-bold">{selectedCircle.roads_damaged_count}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-pine-muted">Relocation Urgency:</span>
                      <span className="font-mono text-rose-300 font-bold">{selectedCircle.rpi_priority}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleZoomToCircle(selectedCircle)}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Zoom to {selectedCircle.revenue_circle}</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-pine-muted text-xs">
                  Click any revenue circle or habitation on the map to inspect risk details.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ===================================================
          4. 8-STEP SCIENTIFIC POSTER WORKFLOW (Matching Infographic)
          =================================================== */}
      <div className="space-y-6">
        
        <div className="flex items-center gap-2 border-b border-[#1E3228] pb-3">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white tracking-wide uppercase font-mono">
            GIS–RS MULTI-CRITERIA DECISION ANALYSIS (MCDA) SCIENTIFIC WORKFLOW
          </h2>
        </div>

        {/* Poster Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* STEP 1: DATA COLLECTION */}
          <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 shadow-sm hover:border-emerald-600/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  STEP 1
                </span>
                <span className="text-xs text-pine-muted font-mono">DATA INGESTION</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase">DATA COLLECTION</h3>
              <ul className="space-y-1.5 text-xs text-pine-muted">
                <li>• <strong>DEM:</strong> SRTM / ASTER (30m Elevation &amp; Slope)</li>
                <li>• <strong>Rainfall:</strong> IMD &amp; GPM / CHIRPS Precipitation</li>
                <li>• <strong>Satellite:</strong> Sentinel-1 SAR &amp; Sentinel-2 MSI</li>
                <li>• <strong>Soil:</strong> NBSS&amp;LUP Soil Texture &amp; Infiltration</li>
                <li>• <strong>Drainage:</strong> HydroSHEDS &amp; Brahmaputra Tributaries</li>
                <li>• <strong>Census &amp; Cadastre:</strong> 2020 Mission Antyodaya</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E3228] text-[11px] text-emerald-400 font-mono">
              ✓ Multi-Sensor Data Grounded
            </div>
          </div>

          {/* STEP 2: GIS PRE-PROCESSING & DERIVED LAYERS */}
          <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 shadow-sm hover:border-emerald-600/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  STEP 2
                </span>
                <span className="text-xs text-pine-muted font-mono">HYDRO-PROCESSING</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase">DERIVED THEMATIC LAYERS</h3>
              <div className="bg-[#0E1814] p-2 rounded border border-[#1E3228] text-[11px] font-mono text-emerald-300 mb-2">
                DEM &rarr; Fill Sinks &rarr; Flow Dir &rarr; Accum &rarr; Streams &rarr; Density
              </div>
              <ul className="space-y-1 text-xs text-pine-muted">
                <li>• Elevation (102.5m mean alluvial plain)</li>
                <li>• Slope (1.2° flat basin retention)</li>
                <li>• Distance to River (Proximity buffer)</li>
                <li>• Topographic Wetness Index (TWI)</li>
                <li>• Land Use / Cropland Extent</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E3228] text-[11px] text-emerald-400 font-mono">
              ✓ 8 Hydrological Parameters
            </div>
          </div>

          {/* STEP 3: RECLASSIFICATION */}
          <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 shadow-sm hover:border-emerald-600/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  STEP 3
                </span>
                <span className="text-xs text-pine-muted font-mono">STANDARDIZATION</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase">RECLASSIFICATION (1–5)</h3>
              <div className="space-y-1 text-xs mb-2">
                <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-[#16241E]">
                  <span className="text-emerald-400 font-bold">Class 1 (Very Low):</span>
                  <span className="text-pine-muted">&gt; 130m / Slope &gt; 5°</span>
                </div>
                <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-[#16241E]">
                  <span className="text-emerald-300 font-bold">Class 2 (Low):</span>
                  <span className="text-pine-muted">115–130m / Slope 3–5°</span>
                </div>
                <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-[#16241E]">
                  <span className="text-amber-400 font-bold">Class 3 (Moderate):</span>
                  <span className="text-pine-muted">105–115m / Slope 1.5–3°</span>
                </div>
                <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-[#16241E]">
                  <span className="text-amber-500 font-bold">Class 4 (High):</span>
                  <span className="text-pine-muted">98–105m / River &lt; 1km</span>
                </div>
                <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-[#16241E]">
                  <span className="text-rose-400 font-bold">Class 5 (Very High):</span>
                  <span className="text-rose-300">&lt; 98m Active Sandbars</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E3228] text-[11px] text-emerald-400 font-mono">
              ✓ Uniform Common Scale
            </div>
          </div>

          {/* STEP 4: AHP WEIGHT ASSIGNMENT */}
          <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 shadow-sm hover:border-emerald-600/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  STEP 4
                </span>
                <span className="text-xs text-pine-muted font-mono">MCDA WEIGHTS</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1 uppercase">AHP WEIGHT ASSIGNMENT</h3>
              <div className="bg-[#0E1814] p-2 rounded border border-[#1E3228] space-y-1 text-[11px] font-mono mb-2">
                <div className="flex justify-between text-white">
                  <span>Rainfall Depth:</span>
                  <span className="text-emerald-400 font-bold">0.20 (20%)</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Distance to River:</span>
                  <span className="text-emerald-400 font-bold">0.15 (15%)</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Elevation (DEM):</span>
                  <span className="text-emerald-400 font-bold">0.15 (15%)</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Slope Gradient:</span>
                  <span className="text-emerald-400 font-bold">0.15 (15%)</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Drainage / TWI / LULC:</span>
                  <span className="text-emerald-400 font-bold">0.30 (30%)</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Soil Infiltration:</span>
                  <span className="text-emerald-400 font-bold">0.05 (5%)</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E3228] flex justify-between text-[11px] font-mono text-emerald-400">
              <span>CR = {ASSAM_AHP_METRICS.cr} &lt; 0.10</span>
              <span className="font-bold">Consistent ✅</span>
            </div>
          </div>

          {/* STEP 5: WEIGHTED OVERLAY (GIS) */}
          <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 shadow-sm hover:border-emerald-600/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  STEP 5
                </span>
                <span className="text-xs text-pine-muted font-mono">SPATIAL SYNTHESIS</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase">WEIGHTED OVERLAY (GIS)</h3>
              <div className="bg-[#0E1814] p-2.5 rounded border border-[#1E3228] text-center font-mono text-xs text-emerald-300 mb-2">
                FSI = &sum; (W<sub>i</sub> &times; R<sub>i</sub>)
              </div>
              <p className="text-xs text-pine-muted leading-relaxed">
                Aggregating the 8 reclassified raster layers with normalized eigenvector weights into the Flood Susceptibility Index.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E3228] text-[11px] text-emerald-400 font-mono">
              FSI Range: 0–100 (Mean: 68.4)
            </div>
          </div>

          {/* STEP 6: FINAL SUSCEPTIBILITY MAP */}
          <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 shadow-sm hover:border-emerald-600/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  STEP 6
                </span>
                <span className="text-xs text-pine-muted font-mono">ZONATION</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase">FINAL FLOOD MAP</h3>
              <ul className="space-y-1.5 text-xs text-pine-muted">
                <li>• <strong>Critical Red Zone:</strong> Chabua, Dibrugarh West</li>
                <li>• <strong>High Hazard Zone:</strong> Moran Lowlands</li>
                <li>• <strong>Moderate Zone:</strong> Tingkhong &amp; Tengakhat</li>
                <li>• <strong>Low Hazard Zone:</strong> Naharkatiya Foothills</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E3228] text-[11px] text-rose-400 font-mono">
              3 Red Zones Active
            </div>
          </div>

          {/* STEP 7: VALIDATION & ROC-AUC */}
          <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 shadow-sm hover:border-emerald-600/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  STEP 7
                </span>
                <span className="text-xs text-pine-muted font-mono">ACCURACY CHECK</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase">VALIDATION &amp; ACCURACY</h3>
              <div className="space-y-1 text-xs text-pine-muted">
                <div className="flex justify-between">
                  <span>ROC-AUC Score:</span>
                  <span className="font-mono text-emerald-400 font-bold">{ASSAM_ACCURACY_METRICS.roc_auc}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precision:</span>
                  <span className="font-mono text-white">{ASSAM_ACCURACY_METRICS.precision}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recall:</span>
                  <span className="font-mono text-white">{ASSAM_ACCURACY_METRICS.recall}</span>
                </div>
                <div className="flex justify-between">
                  <span>F1-Score:</span>
                  <span className="font-mono text-white">{ASSAM_ACCURACY_METRICS.f1_score}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E3228] text-[11px] text-emerald-400 font-mono">
              Validated against Sentinel-1 SAR
            </div>
          </div>

          {/* STEP 8: SMART RELOCATION APPLICATIONS */}
          <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 shadow-sm hover:border-emerald-600/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  STEP 8
                </span>
                <span className="text-xs text-pine-muted font-mono">DECISION SUPPORT</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase">OUTPUT &amp; RELOCATION</h3>
              <ul className="space-y-1 text-xs text-pine-muted">
                <li>• Flood Risk Zonation Plan</li>
                <li>• Habitation RPI Prioritization</li>
                <li>• CCAS Carrying Capacity Matching</li>
                <li>• 6 Safe Inland Hubs Screened</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1E3228]">
              <button
                onClick={() => setActiveView('relocation-engine')}
                className="w-full py-1 px-2 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-[11px] font-mono transition-colors flex items-center justify-center gap-1"
              >
                <span>OPEN RELOCATION ENGINE</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ===================================================
          5. VULNERABLE HABITATIONS PRIORITY TABLE
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl overflow-hidden shadow-panel">
        <div className="p-4 border-b border-[#1E3228] flex flex-wrap items-center justify-between gap-2 bg-[#0E1814]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
              TOP VULNERABLE HABITATIONS (DIBRUGARH BRAHMAPUTRA BASIN)
            </h3>
          </div>
          <span className="text-xs font-mono text-pine-muted">
            Sorted by Relocation Priority Index (RPI)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#16241E] text-pine-muted uppercase font-mono text-[11px] border-b border-[#1E3228]">
              <tr>
                <th className="p-3">Village / Habitation</th>
                <th className="p-3">Revenue Circle</th>
                <th className="p-3">Exposed Pop</th>
                <th className="p-3">Primary Threat</th>
                <th className="p-3">Flood Frequency</th>
                <th className="p-3">RPI Score</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Assigned Safe Site</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3228]">
              {DIBRUGARH_VULNERABLE_VILLAGES.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-[#16241E]/60 transition-colors cursor-pointer"
                  onClick={() => handleZoomToVillage(v)}
                >
                  <td className="p-3 font-semibold text-white">
                    {v.village_name}
                  </td>
                  <td className="p-3 text-pine-muted font-mono">{v.revenue_circle}</td>
                  <td className="p-3 font-mono font-bold text-rose-400">
                    {v.population.toLocaleString()} ({v.households} hhd)
                  </td>
                  <td className="p-3 text-pine-muted max-w-[200px] truncate">{v.primary_hazard}</td>
                  <td className="p-3 text-amber-300 font-mono">{v.flood_frequency}</td>
                  <td className="p-3 font-mono font-bold text-white">{v.rpi_score} / 100</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      v.urgency === 'P1 - IMMEDIATE'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {v.urgency}
                    </span>
                  </td>
                  <td className="p-3 text-emerald-400 font-mono">
                    {v.assigned_safe_site_id} ({v.distance_km} km)
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoomToVillage(v);
                      }}
                      className="px-2 py-1 rounded bg-[#16241E] hover:bg-emerald-600 text-pine-muted hover:text-white font-mono text-[11px] transition-colors"
                    >
                      Inspect Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================
          6. SMART RELOCATION & CCAS DECISION SUPPORT BRIDGE
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-5 shadow-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E3228] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono tracking-wide">
                COGNITIVE RELOCATION DECISION ENGINE &amp; CCAS INTEGRATION
              </h3>
              <p className="text-xs text-pine-muted">
                Candidate destinations screened against Sphere Humanitarian Standards (3.5 m&sup2;/person, 70L water/person/day, 1:20 sanitation)
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('relocation-engine')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono transition-all shadow-panel flex items-center gap-2 self-start lg:self-auto"
          >
            <span>VIEW COMPLETE RELOCATION PLAN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIBRUGARH_SAFE_DESTINATIONS.map((site) => (
            <div
              key={site.site_id}
              className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-4 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white text-xs truncate max-w-[200px]" title={site.name}>
                  {site.name}
                </h4>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  CCAS {site.ccas_score}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-pine-muted my-3">
                <div className="flex justify-between">
                  <span>Location / Zone:</span>
                  <span className="text-white font-mono">{site.revenue_circle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Safe Holding Capacity:</span>
                  <span className="text-emerald-400 font-mono font-bold">{site.available_capacity.toLocaleString()} persons</span>
                </div>
                <div className="flex justify-between">
                  <span>Water Supply Capacity:</span>
                  <span className="text-white font-mono">{site.water_capacity_lpd.toLocaleString()} L/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Sphere Sanitation:</span>
                  <span className="text-white font-mono">{site.latrines_count} latrines</span>
                </div>
                <div className="flex justify-between">
                  <span>Road Connectivity:</span>
                  <span className="text-white font-mono">{site.road_access}</span>
                </div>
              </div>

              <button
                onClick={() => handleZoomToSite(site)}
                className="w-full py-1.5 rounded bg-[#16241E] hover:bg-[#1E3228] text-pine-muted hover:text-white text-xs font-mono transition-colors flex items-center justify-center gap-1"
              >
                <Crosshair className="w-3 h-3" />
                <span>Locate on GIS Map</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================
          6B. IIT DELHI INDIA FLOOD INVENTORY (IFI v3.0) — 53-YEAR HISTORICAL DATABASE
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl overflow-hidden shadow-panel">
        <button
          onClick={() => setIsIfiExpanded(!isIfiExpanded)}
          className="w-full p-4 flex items-center justify-between bg-[#0E1814] hover:bg-[#16241E] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                  IIT DELHI INDIA FLOOD INVENTORY (IFI v3.0) — 53-YEAR HISTORICAL DATABASE (1971–2023)
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] font-bold border border-amber-800">
                  155 EVENTS IN DIBRUGARH
                </span>
              </div>
              <p className="text-xs text-pine-muted">
                HydroSense Lab, IIT Delhi &amp; IMD | Peer-reviewed in Springer Nature (Saharia et al., 2021) | Zenodo: 10.5281/zenodo.4742142
              </p>
            </div>
          </div>
          {isIfiExpanded ? <ChevronUp className="w-4 h-4 text-pine-muted" /> : <ChevronDown className="w-4 h-4 text-pine-muted" />}
        </button>

        {isIfiExpanded && (
          <div className="p-5 border-t border-[#1E3228] space-y-6">
            {/* Top Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-3">
                <div className="text-[11px] font-mono text-pine-muted uppercase">District Historical Events</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">155</div>
                <div className="text-[10px] text-pine-muted">Out of 916 events in Assam (6,876 nationwide)</div>
              </div>
              <div className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-3">
                <div className="text-[11px] font-mono text-pine-muted uppercase">Percent Flooded Area</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">11.91%</div>
                <div className="text-[10px] text-pine-muted">Permanent water: 4.81% of district area</div>
              </div>
              <div className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-3">
                <div className="text-[11px] font-mono text-pine-muted uppercase">Mean Inundation Duration</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">10.0 Days</div>
                <div className="text-[10px] text-pine-muted">Continuous waterlogging per event</div>
              </div>
              <div className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-3">
                <div className="text-[11px] font-mono text-pine-muted uppercase">Cumulative Human Impact</div>
                <div className="text-xl font-bold font-mono text-rose-400 mt-1">147 Fatalities</div>
                <div className="text-[10px] text-pine-muted">47 injured across official historical registry</div>
              </div>
            </div>

            {/* Decadal Trend Progression */}
            <div>
              <h4 className="text-xs font-bold font-mono uppercase text-pine-muted mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>5-Decade Inundation Frequency &amp; Duration Shift (1970s – 2020s)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {IFI_DECADAL_TRENDS.map((dec) => (
                  <div key={dec.decade} className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-3 text-center">
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/50">
                      {dec.decade}
                    </span>
                    <div className="text-lg font-bold font-mono text-white mt-2">{dec.events} Events</div>
                    <div className="text-[11px] text-pine-muted mt-1">
                      Avg: <span className="text-emerald-400 font-mono font-bold">{dec.meanDurationDays}d</span>
                    </div>
                    <div className="text-[10px] text-pine-muted">
                      Max: <span className="text-rose-400 font-mono">{dec.maxDurationDays}d</span>
                    </div>
                    <div className="text-[10px] text-pine-muted">
                      Lives: <span className="text-white font-mono">{dec.fatalities}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historic Milestone Floods Table */}
            <div>
              <h4 className="text-xs font-bold font-mono uppercase text-pine-muted mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Historic Severe Flood Milestones in Dibrugarh</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#16241E] text-pine-muted uppercase font-mono text-[11px] border-b border-[#1E3228]">
                    <tr>
                      <th className="p-2.5">Year</th>
                      <th className="p-2.5">Inundation Dates</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Fatalities</th>
                      <th className="p-2.5">Severity</th>
                      <th className="p-2.5">Causal Trigger &amp; Impact Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E3228]">
                    {IFI_HISTORICAL_MILESTONES.map((ev, i) => (
                      <tr key={i} className="hover:bg-[#16241E]/40">
                        <td className="p-2.5 font-mono font-bold text-amber-400">{ev.year}</td>
                        <td className="p-2.5 font-mono text-white">{ev.dates}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-400">{ev.durationDays} Days</td>
                        <td className="p-2.5 font-mono text-rose-300">{ev.fatalities}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            ev.severity.includes('CATASTROPHIC') || ev.severity.includes('EXTREME')
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {ev.severity}
                          </span>
                        </td>
                        <td className="p-2.5 text-pine-muted max-w-xs">{ev.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          6C. ASSAM FLOOD DATA ECOSYSTEM — DRIMS & DISASTER FINANCING (SDRF)
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl overflow-hidden shadow-panel">
        <button
          onClick={() => setIsEcosystemExpanded(!isEcosystemExpanded)}
          className="w-full p-4 flex items-center justify-between bg-[#0E1814] hover:bg-[#16241E] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                  ASSAM FLOOD DATA ECOSYSTEM — DRIMS LOSS &amp; DAMAGE &amp; PUBLIC PROCUREMENT (SDRF)
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-800">
                  ₹211.34 CR TENDERS | ₹109.67 CR SDRF
                </span>
              </div>
              <p className="text-xs text-pine-muted">
                CivicDataLab &amp; ASDMA DRIMS Repository | 448 monthly records across 7 revenue circles in Dibrugarh
              </p>
            </div>
          </div>
          {isEcosystemExpanded ? <ChevronUp className="w-4 h-4 text-pine-muted" /> : <ChevronDown className="w-4 h-4 text-pine-muted" />}
        </button>

        {isEcosystemExpanded && (
          <div className="p-5 border-t border-[#1E3228] space-y-6">
            {/* Top Financial & Damage Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-3">
                <div className="text-[11px] font-mono text-pine-muted uppercase">Total Public Procurement</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">₹{ASSAM_DISASTER_FINANCING_ECOSYSTEM.totals.totalTendersCr} Cr</div>
                <div className="text-[10px] text-pine-muted">Awarded flood mitigation contracts</div>
              </div>
              <div className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-3">
                <div className="text-[11px] font-mono text-pine-muted uppercase">SDRF Sanctions Total</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">₹{ASSAM_DISASTER_FINANCING_ECOSYSTEM.totals.sdrfSanctionsCr} Cr</div>
                <div className="text-[10px] text-pine-muted">State Disaster Response Fund allocation</div>
              </div>
              <div className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-3">
                <div className="text-[11px] font-mono text-pine-muted uppercase">Livestock Affected</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">{ASSAM_DISASTER_FINANCING_ECOSYSTEM.totals.totalAnimalsAffected.toLocaleString()}</div>
                <div className="text-[10px] text-pine-muted">Big cattle, small animals &amp; poultry</div>
              </div>
              <div className="bg-[#0E1814] border border-[#1E3228] rounded-xl p-3">
                <div className="text-[11px] font-mono text-pine-muted uppercase">Submerged Crop Area</div>
                <div className="text-xl font-bold font-mono text-rose-400 mt-1">{ASSAM_DISASTER_FINANCING_ECOSYSTEM.totals.totalCropAreaHa.toLocaleString()} ha</div>
                <div className="text-[10px] text-pine-muted">Paddy fields &amp; agricultural land loss</div>
              </div>
            </div>

            {/* Circle-wise Disaster Financing & Loss Table */}
            <div>
              <h4 className="text-xs font-bold font-mono uppercase text-pine-muted mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Circle-Level Procurement &amp; Damage Breakdown</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#16241E] text-pine-muted uppercase font-mono text-[11px] border-b border-[#1E3228]">
                    <tr>
                      <th className="p-2.5">Circle Name</th>
                      <th className="p-2.5">Object ID</th>
                      <th className="p-2.5">Total Tenders</th>
                      <th className="p-2.5">SDRF Sanction</th>
                      <th className="p-2.5">Immediate Measures</th>
                      <th className="p-2.5">Repair &amp; Restoration</th>
                      <th className="p-2.5">Preparedness</th>
                      <th className="p-2.5">Livestock Affected</th>
                      <th className="p-2.5">Crop Loss (ha)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E3228]">
                    {ASSAM_DISASTER_FINANCING_ECOSYSTEM.circles.map((c) => (
                      <tr key={c.objectId} className="hover:bg-[#16241E]/40">
                        <td className="p-2.5 font-mono font-bold text-white">{c.circleName}</td>
                        <td className="p-2.5 font-mono text-pine-muted text-[11px]">{c.objectId}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-400">₹{c.totalTendersCr} Cr</td>
                        <td className="p-2.5 font-mono text-cyan-300">₹{c.sdrfSanctionsCr} Cr</td>
                        <td className="p-2.5 font-mono text-white">₹{c.immediateMeasuresCr} Cr</td>
                        <td className="p-2.5 font-mono text-white">₹{c.repairRestorationCr} Cr</td>
                        <td className="p-2.5 font-mono text-white">₹{c.preparednessCr} Cr</td>
                        <td className="p-2.5 font-mono text-amber-300">{c.animalsAffected.toLocaleString()}</td>
                        <td className="p-2.5 font-mono text-rose-300">{c.cropAreaHa.toLocaleString()} ha</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          7. AUTOMATIC DATA DICTIONARY & PROVENANCE REGISTER
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl overflow-hidden shadow-panel">
        <button
          onClick={() => setIsDictionaryExpanded(!isDictionaryExpanded)}
          className="w-full p-4 flex items-center justify-between bg-[#0E1814] hover:bg-[#16241E] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                AUTOMATIC DATA DICTIONARY &amp; PROVENANCE REGISTER
              </h3>
              <p className="text-xs text-pine-muted">
                Complete schema and metadata audit for all ingested files in the Dibrugarh flood dataset
              </p>
            </div>
          </div>
          {isDictionaryExpanded ? <ChevronUp className="w-4 h-4 text-pine-muted" /> : <ChevronDown className="w-4 h-4 text-pine-muted" />}
        </button>

        {isDictionaryExpanded && (
          <div className="p-4 border-t border-[#1E3228] overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#16241E] text-pine-muted uppercase font-mono text-[11px] border-b border-[#1E3228]">
                <tr>
                  <th className="p-2.5">File Name</th>
                  <th className="p-2.5">Data Type</th>
                  <th className="p-2.5">Rows &amp; Columns</th>
                  <th className="p-2.5">Time Period</th>
                  <th className="p-2.5">CRS &amp; Spatial</th>
                  <th className="p-2.5">Data Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E3228]">
                {DIBRUGARH_DATA_DICTIONARY.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#16241E]/40">
                    <td className="p-2.5 font-mono font-bold text-white">{item.file}</td>
                    <td className="p-2.5 text-pine-muted">{item.type}</td>
                    <td className="p-2.5 text-pine-muted font-mono">{item.rows}</td>
                    <td className="p-2.5 text-amber-300 font-mono">{item.time_period}</td>
                    <td className="p-2.5 text-pine-muted font-mono">{item.crs}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        item.data_status === 'OFFICIAL / REFERENCE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {item.data_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
export default FloodIntelligence;
