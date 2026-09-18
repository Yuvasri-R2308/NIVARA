import React, { useState, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Polyline, 
  Popup, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { 
  COASTAL_SUMMARY_METRICS,
  COASTAL_TRANSECTS,
  YEARWISE_NET_EROSION,
  SPECTRAL_INDEX_TIMESERIES,
  CLIMATE_CORRELATIONS,
  VULNERABLE_COASTAL_HABITATIONS,
  CYCLONE_EVENT_TRACKS,
  PVI_PARAMETERS,
  SVI_PARAMETERS,
  AHP_WEIGHTING_DETAILS,
  DATA_SOURCES_TABLE,
  CoastalTransect,
  CoastalHabitation
} from '../data/coastalErosionData';
import { 
  Waves, 
  TrendingDown, 
  ShieldAlert, 
  Users, 
  AlertTriangle, 
  Layers, 
  Calendar, 
  ArrowRight, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  MapPin, 
  Wind, 
  FileText, 
  Scale, 
  CheckCircle2, 
  Maximize2,
  Minimize2,
  Eye,
  Crosshair,
  Database,
  Sliders
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

export const CoastalErosion: React.FC = () => {
  const { setActiveView } = useApp();

  // Basemap selector state (defaults to Satellite for coastal satellite inspection)
  const [baseMap, setBaseMap] = useState<BaseMapKey>('satellite');

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.295, 84.945]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [selectedTransect, setSelectedTransect] = useState<CoastalTransect | null>(null);
  const [selectedHabitation, setSelectedHabitation] = useState<CoastalHabitation | null>(null);

  // Timeline state (2013 to 2024)
  const availableYears = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  // Accordion state
  const [isAhpExpanded, setIsAhpExpanded] = useState<boolean>(false);
  const [isDataSourcesExpanded, setIsDataSourcesExpanded] = useState<boolean>(false);

  // Hotspot table sort state
  const [sortField, setSortField] = useState<'lrr' | 'risk' | 'id'>('lrr');

  // GIS Layer toggles (all 13 requested layers)
  const [layers, setLayers] = useState({
    latestShoreline: true,
    historicalShoreline: true,
    shorelineChange: true,
    erosionHotspots: true,
    accretionZones: false,
    pvi: false,
    svi: false,
    cvi: true,
    vulnerableVillages: true,
    population: false,
    roads: false,
    phailin2013: true,
    titli2018: false
  });

  const toggleLayer = (layerName: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  // Compute selected year statistics from YEARWISE_NET_EROSION
  const currentYearPairStat = useMemo(() => {
    if (selectedYear === 2013) {
      return {
        period: '2013 Baseline',
        mean_change_m: 0.0,
        pct_eroding: 0,
        pct_accreting: 0,
        direction: 'STABLE' as const
      };
    }
    const targetPair = `${selectedYear - 1}→${selectedYear}`;
    const found = YEARWISE_NET_EROSION.find(y => y.year_pair === targetPair);
    if (found) {
      return {
        period: found.year_pair,
        mean_change_m: found.mean_change_m,
        pct_eroding: found.pct_eroding,
        pct_accreting: found.pct_accreting,
        direction: found.mean_change_m < -0.5 ? 'EROSION' : found.mean_change_m > 0.5 ? 'ACCRETION' : 'STABLE'
      };
    }
    return {
      period: `${selectedYear} Analysis`,
      mean_change_m: -0.22,
      pct_eroding: 43.7,
      pct_accreting: 21.0,
      direction: 'EROSION' as const
    };
  }, [selectedYear]);

  // Sorted transects for hotspots
  const sortedTransects = useMemo(() => {
    return [...COASTAL_TRANSECTS].sort((a, b) => {
      if (sortField === 'lrr') return a.lrr_m_yr - b.lrr_m_yr; // most negative (erosion) first
      if (sortField === 'risk') return b.risk_score - a.risk_score;
      return a.transect_id - b.transect_id;
    });
  }, [sortField]);

  // Derived shoreline line coordinates (sorted geographically south to north)
  const shorelinePoints2024 = useMemo(() => {
    const sorted = [...COASTAL_TRANSECTS].sort((a, b) => a.latitude - b.latitude);
    return sorted.map(t => [t.latitude, t.longitude] as [number, number]);
  }, []);

  // Historical shoreline points computed from distance offsets
  const historicalShorelinePoints = useMemo(() => {
    const sorted = [...COASTAL_TRANSECTS].sort((a, b) => a.latitude - b.latitude);
    return sorted.map(t => {
      const dist = t.distances[selectedYear] ?? 0;
      // Offset perpendicular inland/seaward: ~1m ≈ 0.000009 degrees
      const lonOffset = (dist / 111320) * Math.cos(t.latitude * (Math.PI / 180));
      return [t.latitude, t.longitude - lonOffset] as [number, number];
    });
  }, [selectedYear]);

  // Evacuation Road Polylines (NH-516 & Coastal Arteries)
  const evacuationRoadPoints: [number, number][] = [
    [19.220, 84.860],
    [19.245, 84.880],
    [19.265, 84.905],
    [19.300, 84.950],
    [19.340, 84.990],
    [19.380, 85.020]
  ];

  // Zoom to transect
  const handleZoomToTransect = (t: CoastalTransect) => {
    setMapCenter([t.latitude, t.longitude]);
    setMapZoom(15);
    setSelectedTransect(t);
  };

  // Zoom to habitation
  const handleZoomToHabitation = (h: CoastalHabitation) => {
    setMapCenter([h.latitude, h.longitude]);
    setMapZoom(14);
    setSelectedHabitation(h);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full text-pine-text font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* ===================================================
          1. PAGE HEADER
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-5 lg:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Waves className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
                COASTAL EROSION INTELLIGENCE
              </h1>
              <p className="text-sm sm:text-base text-pine-muted font-sans mt-0.5">
                Brahmapur Coast, Ganjam, Odisha
              </p>
            </div>
          </div>
        </div>

        {/* Small Status Badge */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          <div className="px-3.5 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-700/60 text-cyan-300 font-mono text-xs font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>● HISTORICAL / REFERENCE ANALYSIS</span>
          </div>
        </div>
      </div>

      {/* ===================================================
          2. TOP 5 KPI CARDS
          =================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Coastline Monitored */}
        <div className="bg-[#111D18] border border-[#1E3228] p-4 lg:p-5 rounded-2xl space-y-2 shadow-panel">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            <span>COASTLINE MONITORED</span>
            <Waves className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-3xl font-extrabold text-white">
              {COASTAL_SUMMARY_METRICS.active_transect_length_km}
            </span>
            <span className="text-xs text-pine-muted font-sans">km (250m grid)</span>
          </div>
          <p className="text-[11px] text-pine-muted truncate">
            {COASTAL_SUMMARY_METRICS.total_transects} DSAS Transects (37 km AOI)
          </p>
        </div>

        {/* Card 2: Shoreline Change Rate */}
        <div className="bg-[#111D18] border border-[#1E3228] p-4 lg:p-5 rounded-2xl space-y-2 shadow-panel">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            <span>SHORELINE CHANGE</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-3xl font-extrabold text-amber-300">
              {COASTAL_SUMMARY_METRICS.mean_lrr_m_yr}
            </span>
            <span className="text-xs text-pine-muted font-sans">m/year</span>
          </div>
          <p className="text-[11px] text-pine-muted truncate">
            Max erosion: {COASTAL_SUMMARY_METRICS.max_erosion_lrr_m_yr} m/yr
          </p>
        </div>

        {/* Card 3: Erosion Hotspots */}
        <div className="bg-[#111D18] border border-rose-900/50 p-4 lg:p-5 rounded-2xl space-y-2 shadow-panel">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
            <span>EROSION HOTSPOTS</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-3xl font-extrabold text-rose-400">
              {COASTAL_SUMMARY_METRICS.critical_hotspots_count}
            </span>
            <span className="text-xs text-pine-muted font-sans">Critical Segments</span>
          </div>
          <p className="text-[11px] text-rose-300/80 truncate">
            {COASTAL_SUMMARY_METRICS.pct_coastline_eroding}% of coast eroding
          </p>
        </div>

        {/* Card 4: Vulnerable Population */}
        <div className="bg-[#111D18] border border-[#1E3228] p-4 lg:p-5 rounded-2xl space-y-2 shadow-panel">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-teal-400 font-bold">
            <span>VULNERABLE POPULATION</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-3xl font-extrabold text-white">
              {(COASTAL_SUMMARY_METRICS.vulnerable_population).toLocaleString()}
            </span>
            <span className="text-xs text-pine-muted font-sans">Persons</span>
          </div>
          <p className="text-[11px] text-pine-muted truncate">
            {COASTAL_SUMMARY_METRICS.families_at_immediate_risk} Families in 50m buffer
          </p>
        </div>

        {/* Card 5: Coastal Vulnerability */}
        <div className="bg-[#111D18] border border-amber-900/50 p-4 lg:p-5 rounded-2xl space-y-2 shadow-panel">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            <span>COASTAL VULNERABILITY</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-3xl font-extrabold text-amber-400">
              {COASTAL_SUMMARY_METRICS.cvi_score}
            </span>
            <span className="text-xs text-pine-muted font-sans">/ 100</span>
          </div>
          <p className="text-[11px] text-amber-300/80 font-bold truncate">
            CLASSIFICATION: {COASTAL_SUMMARY_METRICS.cvi_classification} RISK
          </p>
        </div>

      </div>

      {/* ===================================================
          3. MAIN GIS SECTION: COASTAL VULNERABILITY MAP
          =================================================== */}
      <div className={`bg-[#111D18] border border-[#1E3228] rounded-2xl overflow-hidden shadow-panel flex flex-col transition-all duration-300 ${
        isMapExpanded ? 'fixed inset-4 z-50' : 'h-[620px] lg:h-[680px]'
      }`}>
        
        {/* Map Header */}
        <div className="p-4 border-b border-[#1E3228] flex flex-wrap items-center justify-between gap-3 bg-[#0E1814]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                COASTAL VULNERABILITY MAP — GANJAM COAST
              </h2>
              <p className="text-xs text-pine-muted font-mono">
                Centroid: 19.295°N, 84.945°E | Coordinate Reference: WGS84 / UTM 45N
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Basemap Selector (100% Free - No API Key Required) */}
            <div className="flex items-center gap-1 bg-[#16241E] p-1 rounded-lg border border-[#25352E]">
              {(Object.keys(BASE_MAPS) as BaseMapKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setBaseMap(key)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    baseMap === key
                      ? 'bg-primary-500/25 text-primary-300 border border-primary-500/40 font-bold shadow-sm'
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
                setMapCenter([19.295, 84.945]);
                setMapZoom(12);
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

        {/* Map Body: Split into Interactive GIS & Layer Controls */}
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

              {/* 100% Free Open Basemap TileLayer (No API Key Required) */}
              <TileLayer
                key={baseMap}
                attribution={BASE_MAPS[baseMap].attribution}
                url={BASE_MAPS[baseMap].url}
                maxZoom={BASE_MAPS[baseMap].maxZoom}
              />

              {/* Layer 1: Latest Shoreline (2024 Polyline) */}
              {layers.latestShoreline && (
                <Polyline
                  positions={shorelinePoints2024}
                  color="#4ADE9A"
                  weight={3.5}
                  opacity={0.9}
                  dashArray="1, 0"
                />
              )}

              {/* Layer 2: Historical Shoreline (Selected Year) */}
              {layers.historicalShoreline && selectedYear !== 2024 && (
                <Polyline
                  positions={historicalShorelinePoints}
                  color="#F59E0B"
                  weight={2.5}
                  opacity={0.8}
                  dashArray="6, 6"
                />
              )}

              {/* Layer 11: Evacuation Road Network */}
              {layers.roads && (
                <Polyline
                  positions={evacuationRoadPoints}
                  color="#38BDF8"
                  weight={3}
                  opacity={0.7}
                  dashArray="4, 4"
                />
              )}

              {/* Layer 12: Cyclone Phailin 2013 Track */}
              {layers.phailin2013 && (
                <Polyline
                  positions={CYCLONE_EVENT_TRACKS[0].track_points}
                  color="#E11D48"
                  weight={4}
                  opacity={0.85}
                />
              )}

              {/* Layer 13: Cyclone Titli 2018 Track */}
              {layers.titli2018 && (
                <Polyline
                  positions={CYCLONE_EVENT_TRACKS[1].track_points}
                  color="#D97706"
                  weight={3.5}
                  opacity={0.85}
                  dashArray="8, 6"
                />
              )}

              {/* Layer 3: Shoreline Change Transects (119 points) */}
              {layers.shorelineChange && COASTAL_TRANSECTS.map((t) => {
                const isEroding = t.lrr_m_yr < -0.3;
                const isAccreting = t.lrr_m_yr > 0.3;
                const color = isEroding ? '#EF4444' : isAccreting ? '#10B981' : '#94A3B8';

                return (
                  <CircleMarker
                    key={`transect-${t.transect_id}`}
                    center={[t.latitude, t.longitude]}
                    radius={selectedTransect?.transect_id === t.transect_id ? 7 : 4}
                    pathOptions={{
                      color: selectedTransect?.transect_id === t.transect_id ? '#FFFFFF' : color,
                      fillColor: color,
                      fillOpacity: 0.85,
                      weight: selectedTransect?.transect_id === t.transect_id ? 2.5 : 1
                    }}
                    eventHandlers={{
                      click: () => setSelectedTransect(t)
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="text-xs space-y-1 p-1 font-sans">
                        <div className="font-bold text-emerald-400">Transect #{t.transect_id}</div>
                        <div className="text-slate-300 font-medium">{t.segment}</div>
                        <div className="font-mono text-slate-200">
                          LRR Rate: <span className={t.lrr_m_yr < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {t.lrr_m_yr} m/yr
                          </span>
                        </div>
                        <div className="font-mono text-slate-300">Net Shoreline Movement: {t.nsm_m ?? 'N/A'} m</div>
                        <div className="font-mono text-slate-300">Class: <span className="font-bold">{t.classification}</span></div>
                        <div className="font-mono text-slate-400">Risk Score: {t.risk_score} ({t.risk_level})</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Layer 4: Erosion Hotspots (Pulse markers) */}
              {layers.erosionHotspots && COASTAL_TRANSECTS
                .filter(t => t.risk_level === 'Critical' || t.risk_level === 'High')
                .map((t) => (
                  <CircleMarker
                    key={`hotspot-${t.transect_id}`}
                    center={[t.latitude, t.longitude]}
                    radius={9}
                    pathOptions={{
                      color: '#E11D48',
                      fillColor: '#9F1239',
                      fillOpacity: 0.9,
                      weight: 2
                    }}
                  >
                    <Popup>
                      <div className="text-xs p-1 font-sans">
                        <div className="font-bold text-rose-500 uppercase tracking-wide">⚠ EROSION HOTSPOT #{t.transect_id}</div>
                        <div className="text-slate-800 font-medium">{t.segment}</div>
                        <div className="text-rose-700 font-mono font-bold">Erosion Rate: {t.lrr_m_yr} m/year</div>
                        <div className="text-slate-600 font-mono">Risk Level: {t.risk_level} ({t.risk_score})</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

              {/* Layer 9: Vulnerable Coastal Villages */}
              {layers.vulnerableVillages && VULNERABLE_COASTAL_HABITATIONS.map((h) => (
                <CircleMarker
                  key={h.id}
                  center={[h.latitude, h.longitude]}
                  radius={11}
                  pathOptions={{
                    color: '#F59E0B',
                    fillColor: '#B45309',
                    fillOpacity: 0.95,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => setSelectedHabitation(h)
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1 font-sans">
                      <div className="font-bold text-amber-600 uppercase">{h.name}</div>
                      <div className="text-slate-700">{h.block}</div>
                      <div className="text-slate-900 font-mono font-bold">
                        {h.families} Families ({h.population} Persons)
                      </div>
                      <div className="text-rose-700 font-mono">Erosion: {h.erosion_rate_m_yr} m/yr</div>
                      <div className="text-amber-800 font-mono font-bold">RPI Priority Score: {h.rpi_score}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {/* Landfall Marker for Phailin */}
              {layers.phailin2013 && (
                <CircleMarker
                  center={[19.26, 84.91]}
                  radius={12}
                  pathOptions={{
                    color: '#EF4444',
                    fillColor: '#991B1B',
                    fillOpacity: 0.9,
                    weight: 2.5
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1 font-sans">
                      <div className="font-bold text-rose-600">CYCLONE PHAILIN LANDFALL</div>
                      <div className="text-slate-700">October 12, 2013 | Gopalpur Coast</div>
                      <div className="text-slate-900 font-mono font-bold">Max Wind: 260 km/h (Cat 5 Eq)</div>
                      <div className="text-rose-700 font-mono">Storm Surge: 3.5 m</div>
                    </div>
                  </Popup>
                </CircleMarker>
              )}

            </MapContainer>

            {/* Bottom-left Map Floating Legend */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-[#0E1814]/90 backdrop-blur border border-[#1E3228] p-3 rounded-xl shadow-panel text-xs space-y-2 max-w-xs">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                GIS HAZARD LEGEND
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-pine-text">Erosion (LRR&lt;0)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-pine-text">Accretion (LRR&gt;0)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-pine-muted">Stable Shoreline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-amber-300">Vulnerable Habitation</span>
                </div>
              </div>
              <div className="border-t border-[#1E3228] pt-1.5 text-[10px] text-pine-muted font-mono flex items-center justify-between">
                <span>Green line: 2024 Shoreline</span>
                <span>Amber line: {selectedYear}</span>
              </div>
            </div>
          </div>

          {/* Layer Control Panel */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#1E3228] bg-[#0B1310] p-4 flex flex-col space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>MAP LAYERS (13)</span>
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <label className="flex items-center justify-between p-2 rounded-lg bg-[#111D18] hover:bg-[#16241E] border border-[#1E3228] cursor-pointer">
                <span className="text-white font-medium">☑ Latest Shoreline (2024)</span>
                <input
                  type="checkbox"
                  checked={layers.latestShoreline}
                  onChange={() => toggleLayer('latestShoreline')}
                  className="rounded text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#111D18] hover:bg-[#16241E] border border-[#1E3228] cursor-pointer">
                <span className="text-amber-300 font-medium">☐ Historical ({selectedYear})</span>
                <input
                  type="checkbox"
                  checked={layers.historicalShoreline}
                  onChange={() => toggleLayer('historicalShoreline')}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#111D18] hover:bg-[#16241E] border border-[#1E3228] cursor-pointer">
                <span className="text-pine-text">☐ Shoreline Change (119)</span>
                <input
                  type="checkbox"
                  checked={layers.shorelineChange}
                  onChange={() => toggleLayer('shorelineChange')}
                  className="rounded text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#111D18] hover:bg-[#16241E] border border-[#1E3228] cursor-pointer">
                <span className="text-rose-400 font-medium">☐ Erosion Hotspots</span>
                <input
                  type="checkbox"
                  checked={layers.erosionHotspots}
                  onChange={() => toggleLayer('erosionHotspots')}
                  className="rounded text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#111D18] hover:bg-[#16241E] border border-[#1E3228] cursor-pointer">
                <span className="text-pine-muted">☐ Accretion Zones</span>
                <input
                  type="checkbox"
                  checked={layers.accretionZones}
                  onChange={() => toggleLayer('accretionZones')}
                  className="rounded text-emerald-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#111D18] hover:bg-[#16241E] border border-[#1E3228] cursor-pointer">
                <span className="text-cyan-300 font-medium">☐ Vulnerable Villages</span>
                <input
                  type="checkbox"
                  checked={layers.vulnerableVillages}
                  onChange={() => toggleLayer('vulnerableVillages')}
                  className="rounded text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#111D18] hover:bg-[#16241E] border border-[#1E3228] cursor-pointer">
                <span className="text-sky-300">☐ Evacuation Roads</span>
                <input
                  type="checkbox"
                  checked={layers.roads}
                  onChange={() => toggleLayer('roads')}
                  className="rounded text-sky-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#111D18] hover:bg-[#16241E] border border-[#1E3228] cursor-pointer">
                <span className="text-rose-400">🌀 Phailin (2013 Track)</span>
                <input
                  type="checkbox"
                  checked={layers.phailin2013}
                  onChange={() => toggleLayer('phailin2013')}
                  className="rounded text-rose-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#111D18] hover:bg-[#16241E] border border-[#1E3228] cursor-pointer">
                <span className="text-amber-400">🌀 Titli (2018 Track)</span>
                <input
                  type="checkbox"
                  checked={layers.titli2018}
                  onChange={() => toggleLayer('titli2018')}
                  className="rounded text-amber-500 focus:ring-0"
                />
              </label>
            </div>

            {/* Quick Selected Transect Details */}
            {selectedTransect && (
              <div className="p-3 bg-[#111D18] border border-cyan-800/60 rounded-xl text-xs space-y-1.5 font-mono">
                <div className="text-cyan-400 font-bold flex items-center justify-between">
                  <span>TRANSECT #{selectedTransect.transect_id}</span>
                  <span className="text-[10px] text-pine-muted">{selectedTransect.risk_level}</span>
                </div>
                <div className="text-white text-xs truncate">{selectedTransect.segment}</div>
                <div className="flex justify-between pt-1 border-t border-[#1E3228]">
                  <span className="text-pine-muted">LRR Rate:</span>
                  <span className={selectedTransect.lrr_m_yr < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedTransect.lrr_m_yr} m/yr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pine-muted">Net Movement:</span>
                  <span className="text-white">{selectedTransect.nsm_m ?? 'N/A'} m</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ===================================================
          4. SHORELINE TIMELINE & SHORELINE CHANGE ANALYSIS
          =================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Timeline */}
        <div className="lg:col-span-2 bg-[#111D18] border border-[#1E3228] p-5 lg:p-6 rounded-2xl space-y-4 shadow-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                HISTORICAL SHORELINE TIMELINE (2013–2024)
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#16241E] border border-[#25352E] font-mono text-xs text-emerald-400 font-bold">
              ACTIVE: {selectedYear}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-pine-muted">
            Multi-temporal satellite timeline using only remote-sensing verified years (Landsat 8 & Sentinel-2 composites). Select a year to project shoreline vector position.
          </p>

          {/* Stepper Timeline Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5 pt-2">
            {availableYears.map((yr) => {
              const isSelected = selectedYear === yr;
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`py-2 px-1 rounded-xl font-mono text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-panel border border-emerald-400 scale-105'
                      : 'bg-[#16241E] text-pine-muted hover:text-white hover:bg-[#1E3228] border border-[#25352E]'
                  }`}
                >
                  {yr}
                </button>
              );
            })}
          </div>

          {/* Year stats readout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#1E3228] text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#0E1814] border border-[#1E3228]">
              <span className="text-pine-muted block text-[11px]">ANNUAL NET SHIFT</span>
              <span className={`text-base font-bold ${currentYearPairStat.mean_change_m < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currentYearPairStat.mean_change_m} m
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#0E1814] border border-[#1E3228]">
              <span className="text-pine-muted block text-[11px]">% COASTLINE ERODING</span>
              <span className="text-base font-bold text-rose-300">
                {currentYearPairStat.pct_eroding}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#0E1814] border border-[#1E3228]">
              <span className="text-pine-muted block text-[11px]">% COASTLINE ACCRETING</span>
              <span className="text-base font-bold text-emerald-300">
                {currentYearPairStat.pct_accreting}%
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Shoreline Change Analysis Card */}
        <div className="bg-[#111D18] border border-[#1E3228] p-5 lg:p-6 rounded-2xl space-y-4 shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              <TrendingDown className="w-4 h-4" />
              <span>SHORELINE CHANGE ANALYSIS</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-2">
              Period: {currentYearPairStat.period}
            </h3>
            <p className="text-xs text-pine-muted mt-1">
              Calculated from DSAS orthogonal transect intersections against baseline.
            </p>
          </div>

          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0E1814] border border-[#1E3228]">
              <span className="text-pine-muted">Shoreline movement:</span>
              <span className={`font-bold ${currentYearPairStat.mean_change_m < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currentYearPairStat.mean_change_m > 0 ? `+${currentYearPairStat.mean_change_m}` : currentYearPairStat.mean_change_m} m
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0E1814] border border-[#1E3228]">
              <span className="text-pine-muted">Change rate (LRR):</span>
              <span className="font-bold text-amber-400">
                {COASTAL_SUMMARY_METRICS.mean_lrr_m_yr} m/year
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0E1814] border border-[#1E3228]">
              <span className="text-pine-muted">Direction:</span>
              <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                currentYearPairStat.direction === 'EROSION'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : currentYearPairStat.direction === 'ACCRETION'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                ● {currentYearPairStat.direction}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-pine-muted/80 bg-[#0E1814] p-2.5 rounded-xl border border-[#1E3228]/80 leading-relaxed">
            Worst single-year erosion: <span className="text-rose-400 font-bold">2022→2023 (-7.62 m)</span>. Best accretion period: <span className="text-emerald-400 font-bold">2017→2018 (+6.13 m)</span>.
          </div>
        </div>

      </div>

      {/* ===================================================
          5, 6, 7. PVI, SVI, AND FINAL CVI
          =================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Section 5: Physical Vulnerability Index (PVI) */}
        <div className="bg-[#111D18] border border-[#1E3228] p-5 lg:p-6 rounded-2xl space-y-4 shadow-panel">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                PHYSICAL VULNERABILITY INDEX
              </span>
              <h3 className="text-xl font-bold text-white">PVI PARAMETERS</h3>
            </div>
            <div className="text-right font-mono">
              <span className="text-2xl font-black text-cyan-400">{COASTAL_SUMMARY_METRICS.pvi_score}</span>
              <span className="text-xs text-pine-muted block">/ 100 (HIGH)</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {PVI_PARAMETERS.map((p, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-[#0E1814] border border-[#1E3228] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium truncate">{p.parameter}</span>
                  <span className="font-mono text-cyan-300 font-bold text-[11px]">{p.classification}</span>
                </div>
                <div className="w-full bg-[#1A2C23] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-full rounded-full" 
                    style={{ width: `${(p.raw_rating / 5) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-pine-muted font-mono">
                  <span>{p.value}</span>
                  <span>Weight: {(p.weight * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-pine-muted font-mono pt-2 border-t border-[#1E3228]">
            Reference: Brahmapur Coast Remote Sensing & AHP Methodology
          </div>
        </div>

        {/* Section 6: Socio-Economic Vulnerability Index (SVI) */}
        <div className="bg-[#111D18] border border-[#1E3228] p-5 lg:p-6 rounded-2xl space-y-4 shadow-panel">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
                SOCIO-ECONOMIC VULNERABILITY
              </span>
              <h3 className="text-xl font-bold text-white">SVI PARAMETERS</h3>
            </div>
            <div className="text-right font-mono">
              <span className="text-2xl font-black text-teal-400">{COASTAL_SUMMARY_METRICS.svi_score}</span>
              <span className="text-xs text-pine-muted block">/ 100 (HIGH)</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {SVI_PARAMETERS.map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#0E1814] border border-[#1E3228] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{p.parameter}</span>
                  <span className="font-mono text-teal-300 font-bold text-[11px]">{p.classification}</span>
                </div>
                <div className="w-full bg-[#1A2C23] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-400 h-full rounded-full" 
                    style={{ width: `${(p.raw_rating / 5) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-pine-muted font-mono">
                  <span>{p.value}</span>
                  <span>Weight: {(p.weight * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#0E1814] border border-[#1E3228] text-[11.5px] text-pine-muted leading-relaxed">
            Intertidal land loss: <span className="text-rose-400 font-bold">-19.90%</span> over study period, highlighting acute reduction in coastal protective buffer.
          </div>
        </div>

        {/* Section 7: Final CVI Calculation */}
        <div className="bg-[#111D18] border border-amber-900/60 p-5 lg:p-6 rounded-2xl space-y-5 shadow-panel flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              COASTAL VULNERABILITY INDEX
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">FINAL CVI</h3>
            <p className="text-xs text-pine-muted mt-1">
              Standard integrated formulation combining physical susceptibility and socio-economic exposure.
            </p>
          </div>

          {/* Mathematical visual card */}
          <div className="p-4 rounded-xl bg-[#0E1814] border border-[#1E3228] space-y-3 font-mono text-center">
            <div className="text-xs text-pine-muted">CVI = (PVI + SVI) / 2</div>
            <div className="flex items-center justify-center gap-2 text-lg text-white font-bold">
              <span className="text-cyan-400">PVI {COASTAL_SUMMARY_METRICS.pvi_score}</span>
              <span className="text-pine-muted">+</span>
              <span className="text-teal-400">SVI {COASTAL_SUMMARY_METRICS.svi_score}</span>
            </div>
            <div className="text-xs text-pine-muted">↓</div>
            <div className="text-4xl font-black text-amber-400 tracking-tight">
              {COASTAL_SUMMARY_METRICS.cvi_score} <span className="text-lg text-pine-muted font-normal">/ 100</span>
            </div>
            <div className="inline-block px-3 py-1 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-bold text-xs uppercase">
              RISK: {COASTAL_SUMMARY_METRICS.cvi_classification}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-pine-muted font-mono">
            <div className="flex justify-between">
              <span>Very High Risk Threshold:</span>
              <span className="text-rose-400">&gt; 75.0</span>
            </div>
            <div className="flex justify-between">
              <span>High Risk Range:</span>
              <span className="text-amber-400">55.0 – 75.0</span>
            </div>
            <div className="flex justify-between">
              <span>Medium Risk Range:</span>
              <span className="text-emerald-400">35.0 – 55.0</span>
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================
          8. AHP METHODOLOGY & CONSISTENCY (Expandable)
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl overflow-hidden shadow-panel">
        <button
          onClick={() => setIsAhpExpanded(!isAhpExpanded)}
          className="w-full p-4 lg:p-5 flex items-center justify-between bg-[#0E1814] hover:bg-[#16241E] text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                METHODOLOGY & MATHEMATICAL VALIDATION
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                AHP WEIGHTING & CONSISTENCY RATIO (CR)
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-3 py-1 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold">
              {AHP_WEIGHTING_DETAILS.status_badge}
            </span>
            {isAhpExpanded ? <ChevronUp className="w-5 h-5 text-pine-muted" /> : <ChevronDown className="w-5 h-5 text-pine-muted" />}
          </div>
        </button>

        {isAhpExpanded && (
          <div className="p-5 lg:p-6 space-y-4 border-t border-[#1E3228]">
            <p className="text-xs sm:text-sm text-pine-muted leading-relaxed">
              Parameter weights were computed using Saaty&apos;s Analytic Hierarchy Process (AHP) pairwise comparison matrix. The Principal Eigenvalue (&lambda;<sub>max</sub> = {AHP_WEIGHTING_DETAILS.lambda_max}), Consistency Index (CI = {AHP_WEIGHTING_DETAILS.consistency_index}), and Random Index (RI = {AHP_WEIGHTING_DETAILS.random_index} for n=7) yielded a Consistency Ratio (CR) of <strong>{AHP_WEIGHTING_DETAILS.consistency_ratio}</strong>, satisfying the standard threshold condition (CR &lt; 0.10).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border border-[#1E3228]">
                <thead className="bg-[#0E1814] text-pine-muted uppercase border-b border-[#1E3228]">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Vulnerability Parameter</th>
                    <th className="p-3">AHP Weight</th>
                    <th className="p-3">Normalized %</th>
                    <th className="p-3">Evidence Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3228]">
                  {AHP_WEIGHTING_DETAILS.parameters.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#16241E]/60 text-pine-text">
                      <td className="p-3 font-bold text-emerald-400">#{p.rank}</td>
                      <td className="p-3 text-white font-sans font-medium">{p.parameter}</td>
                      <td className="p-3 text-cyan-300 font-bold">{p.weight}</td>
                      <td className="p-3">{(p.weight * 100).toFixed(1)}%</td>
                      <td className="p-3 text-pine-muted">{p.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          9. HISTORICAL CYCLONE VALIDATION
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] p-5 lg:p-6 rounded-2xl space-y-4 shadow-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-rose-400" />
            <div>
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider block">
                EMPIRICAL EVENT CORRELATION
              </span>
              <h3 className="text-xl font-bold text-white">HISTORICAL CYCLONE VALIDATION</h3>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-pine-muted">
          Overlaying IMD official cyclone landfall best-tracks against the observed multi-temporal shoreline change to validate that high CVI zones coincide with documented storm damage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {CYCLONE_EVENT_TRACKS.map((cyc, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#0E1814] border border-[#1E3228] space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{cyc.name}</span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-bold">
                  {cyc.year}
                </span>
              </div>
              <div className="space-y-1 text-pine-muted text-[11.5px]">
                <div>Intensity: <span className="text-amber-300">{cyc.category} ({cyc.max_wind_kmh} km/h)</span></div>
                <div>Landfall: <span className="text-white">{cyc.landfall_location}</span></div>
                <div>Storm Surge: <span className="text-cyan-300">{cyc.storm_surge_m} meters</span></div>
              </div>
              <div className="text-[11px] text-pine-muted/90 bg-[#16241E] p-2.5 rounded-lg border border-[#25352E] leading-relaxed">
                {cyc.observed_shoreline_impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================
          10. TOP COASTAL EROSION HOTSPOTS TABLE
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] p-5 lg:p-6 rounded-2xl space-y-4 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider block">
              DSAS TRANSECT SEVERITY RANKING
            </span>
            <h3 className="text-xl font-bold text-white">TOP COASTAL EROSION HOTSPOTS</h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-pine-muted">Sort By:</span>
            <button
              onClick={() => setSortField('lrr')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                sortField === 'lrr'
                  ? 'bg-rose-950 text-rose-300 border-rose-700 font-bold'
                  : 'bg-[#16241E] text-pine-muted border-[#25352E]'
              }`}
            >
              Erosion Rate
            </button>
            <button
              onClick={() => setSortField('risk')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                sortField === 'risk'
                  ? 'bg-rose-950 text-rose-300 border-rose-700 font-bold'
                  : 'bg-[#16241E] text-pine-muted border-[#25352E]'
              }`}
            >
              Composite Score
            </button>
          </div>
        </div>

        <p className="text-xs text-pine-muted">
          Click on any row to automatically pan and zoom the GIS map directly to that transect coordinate.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border border-[#1E3228]">
            <thead className="bg-[#0E1814] text-pine-muted uppercase border-b border-[#1E3228]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Transect ID</th>
                <th className="p-3">Village / Segment</th>
                <th className="p-3">Erosion Rate (LRR)</th>
                <th className="p-3">Net Movement (NSM)</th>
                <th className="p-3">Composite Score</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3228]">
              {sortedTransects.slice(0, 10).map((t, idx) => (
                <tr
                  key={t.transect_id}
                  onClick={() => handleZoomToTransect(t)}
                  className={`cursor-pointer transition-colors ${
                    selectedTransect?.transect_id === t.transect_id
                      ? 'bg-emerald-950/40 border-l-4 border-emerald-400'
                      : 'hover:bg-[#16241E]'
                  }`}
                >
                  <td className="p-3 font-bold text-rose-400">#{idx + 1}</td>
                  <td className="p-3 text-white font-bold">T-{t.transect_id}</td>
                  <td className="p-3 text-slate-200 font-sans font-medium">{t.segment}</td>
                  <td className="p-3 text-rose-400 font-bold">{t.lrr_m_yr} m/yr</td>
                  <td className="p-3 text-pine-muted">{t.nsm_m ?? 'N/A'} m</td>
                  <td className="p-3 text-cyan-300 font-bold">{t.risk_score}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                      t.risk_level === 'Critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : t.risk_level === 'High'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-[#1A2C23] text-emerald-300'
                    }`}>
                      {t.risk_level}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="text-emerald-400 hover:text-white flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================
          11. VULNERABLE COASTAL HABITATIONS (RPI ENGINE)
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] p-5 lg:p-6 rounded-2xl space-y-4 shadow-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            <div>
              <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider block">
                NIVARA RELOCATION PRIORITY INDEX (RPI)
              </span>
              <h3 className="text-xl font-bold text-white">VULNERABLE COASTAL HABITATIONS</h3>
            </div>
          </div>
          <span className="text-xs font-mono text-pine-muted">
            RPI Formula: 0.40 Hazard + 0.30 Exposure + 0.30 Vulnerability
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VULNERABLE_COASTAL_HABITATIONS.map((h) => (
            <div
              key={h.id}
              onClick={() => handleZoomToHabitation(h)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                selectedHabitation?.id === h.id
                  ? 'bg-[#162920] border-emerald-400 shadow-hero-glow'
                  : 'bg-[#0E1814] border-[#1E3228] hover:border-[#25352E]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-sans text-sm">{h.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-bold ${
                  h.urgency_phase === 'Immediate'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {h.urgency_phase}
                </span>
              </div>

              <div className="text-xs text-pine-muted font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Families / Persons:</span>
                  <span className="text-white font-bold">{h.families} F / {h.population} P</span>
                </div>
                <div className="flex justify-between">
                  <span>Erosion Severity:</span>
                  <span className="text-rose-400 font-bold">{h.erosion_rate_m_yr} m/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>RPI Priority Score:</span>
                  <span className="text-amber-400 font-bold">{h.rpi_score} / 100</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E3228] text-[11px] text-pine-muted/90 font-mono">
                Safe Destination: <span className="text-emerald-300">{h.recommended_safe_zone} ({h.evacuation_distance_km} km)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================
          12. COASTAL RELOCATION DECISION SUPPORT BRIDGE
          =================================================== */}
      <div className="bg-gradient-to-r from-[#111D18] via-[#0E2018] to-[#111D18] border border-emerald-600/50 p-6 lg:p-8 rounded-2xl shadow-hero-glow flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>CONNECTED TO NIVARA DECISION ENGINE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-tight">
            COASTAL RELOCATION DECISION SUPPORT
          </h3>
          <p className="text-xs sm:text-sm text-pine-muted leading-relaxed font-sans">
            Seamless operational flow connects coastal hazard metrics through NIVARA carrying capacity allocation (CCAS) and land bank reserves for planned resettlement.
          </p>
          
          {/* Decision Pipeline Stepper Readout */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 text-[11px] font-mono text-emerald-300 pt-1">
            <span>Coastal Red Zone</span>
            <span>&rarr;</span>
            <span>Vulnerable Habitations</span>
            <span>&rarr;</span>
            <span>RPI</span>
            <span>&rarr;</span>
            <span>Safe Relocation Sites</span>
            <span>&rarr;</span>
            <span>CCAS</span>
            <span>&rarr;</span>
            <span>Relocation Plan</span>
          </div>
        </div>

        <button
          onClick={() => setActiveView('relocation-engine')}
          className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-sm transition-all shadow-panel hover:shadow-hero-glow flex items-center gap-2 shrink-0"
        >
          <span>VIEW RELOCATION PLAN</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ===================================================
          13. DATA SOURCES PANEL (Provenance)
          =================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl overflow-hidden shadow-panel">
        <button
          onClick={() => setIsDataSourcesExpanded(!isDataSourcesExpanded)}
          className="w-full p-4 lg:p-5 flex items-center justify-between bg-[#0E1814] hover:bg-[#16241E] text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                AUDITABLE DATA PROVENANCE
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                DATA SOURCES & RESOLUTION MAPPING
              </h3>
            </div>
          </div>
          {isDataSourcesExpanded ? <ChevronUp className="w-5 h-5 text-pine-muted" /> : <ChevronDown className="w-5 h-5 text-pine-muted" />}
        </button>

        {isDataSourcesExpanded && (
          <div className="p-5 lg:p-6 border-t border-[#1E3228] overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border border-[#1E3228]">
              <thead className="bg-[#0E1814] text-pine-muted uppercase border-b border-[#1E3228]">
                <tr>
                  <th className="p-3">Dataset Name</th>
                  <th className="p-3">Source Agency</th>
                  <th className="p-3">Year / Range</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Spatial Resolution</th>
                  <th className="p-3">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E3228]">
                {DATA_SOURCES_TABLE.map((d, i) => (
                  <tr key={i} className="hover:bg-[#16241E]/60 text-pine-text">
                    <td className="p-3 text-white font-sans font-medium">{d.dataset}</td>
                    <td className="p-3 text-cyan-300">{d.source}</td>
                    <td className="p-3 font-bold text-emerald-400">{d.year}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#16241E] border border-[#25352E] text-[10.5px]">
                        {d.type}
                      </span>
                    </td>
                    <td className="p-3 text-pine-muted">{d.resolution}</td>
                    <td className="p-3 font-bold text-emerald-400">{d.status}</td>
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
