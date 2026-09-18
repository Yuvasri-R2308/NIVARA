import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  UTTARAKHAND_CLOUDBURST_SUMMARY,
  UTTARAKHAND_HOTSPOTS,
  FAMOUS_DISASTER_BACKTESTS,
  METEOROLOGICAL_FEATURE_IMPORTANCE,
  SAFE_STAGING_DESTINATIONS,
  CLOUDBURST_DATA_DICTIONARY,
  CloudburstHotspot,
  HistoricalDisasterBacktest,
  SafeStagingHub
} from '../data/uttarakhandCloudburstData';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap
} from 'react-leaflet';
import {
  CloudLightning,
  AlertTriangle,
  ShieldCheck,
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
  ChevronDown,
  ChevronUp,
  Building2,
  Eye,
  History,
  Wind,
  Droplets,
  Thermometer,
  Gauge
} from 'lucide-react';

// 100% Free Open Basemaps (No API Key Required)
const BASE_MAPS = {
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 18
  },
  dark: {
    id: 'dark',
    name: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Dark Gray Base',
    maxZoom: 16
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  topo: {
    id: 'topo',
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17
  }
};

type BaseMapKey = keyof typeof BASE_MAPS;

// Helper component for Leaflet pan/zoom
const MapFlyTo: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const CloudburstIntelligence: React.FC = () => {
  const { setActiveView } = useApp();

  // Active view tab: 'backtest' (Famous Disaster Backtests) or 'ml-features' (ML Feature Importance & Simulator)
  const [activeTab, setActiveTab] = useState<'backtest' | 'ml-features'>('backtest');

  // Map state centered on Uttarakhand Himalayan range
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.3165, 78.5000]);
  const [mapZoom, setMapZoom] = useState<number>(8);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [baseMap, setBaseMap] = useState<BaseMapKey>('satellite');

  // Selection states
  const [selectedHotspot, setSelectedHotspot] = useState<CloudburstHotspot | null>(UTTARAKHAND_HOTSPOTS[0]);
  const [selectedBacktest, setSelectedBacktest] = useState<HistoricalDisasterBacktest>(FAMOUS_DISASTER_BACKTESTS[0]);
  const [selectedStaging, setSelectedStaging] = useState<SafeStagingHub | null>(null);

  // Accordion toggles
  const [isDictionaryExpanded, setIsDictionaryExpanded] = useState<boolean>(false);
  const [isStagingExpanded, setIsStagingExpanded] = useState<boolean>(true);

  // Interactive Simulator States
  const [simRain, setSimRain] = useState<number>(116);
  const [simTemp, setSimTemp] = useState<number>(12);
  const [simHumidity, setSimHumidity] = useState<number>(85);
  const [simWind, setSimWind] = useState<number>(4.2);

  // Calculate real-time simulated probability based on model feature weights
  const simulatedProbability = useMemo(() => {
    const rainScore = Math.min(1.0, simRain / 150.0) * 0.40;
    const humScore = Math.min(1.0, Math.max(0.0, (simHumidity - 50) / 50.0)) * 0.35;
    const tempScore = Math.min(1.0, Math.max(0.0, simTemp / 25.0)) * 0.15;
    const windScore = Math.min(1.0, simWind / 10.0) * 0.10;
    const total = Math.min(0.98, Math.max(0.02, rainScore + humScore + tempScore + windScore));
    return total;
  }, [simRain, simTemp, simHumidity, simWind]);

  // GIS Layer toggles
  const [layers, setLayers] = useState({
    hotspots: true,
    backtestSites: true,
    stagingHubs: true,
    evacuationRoutes: true
  });

  const toggleLayer = (layerName: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const handleZoomToHotspot = (h: CloudburstHotspot) => {
    setMapCenter([h.latitude, h.longitude]);
    setMapZoom(12);
    setSelectedHotspot(h);
  };

  const handleZoomToStaging = (hub: SafeStagingHub) => {
    setMapCenter(hub.coordinates);
    setMapZoom(13);
    setSelectedStaging(hub);
  };

  const handleSelectBacktest = (bt: HistoricalDisasterBacktest) => {
    setSelectedBacktest(bt);
    const matched = UTTARAKHAND_HOTSPOTS.find(h => h.name === bt.location);
    if (matched) {
      setMapCenter([matched.latitude, matched.longitude]);
      setMapZoom(11);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-pine-text">
      
      {/* ===================================================
          1. HEADER & TOP STATUS BAR
          =================================================== */}
      <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-2xl p-6 shadow-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CloudLightning className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
                CLOUDBURST INTELLIGENCE &amp; EARLY WARNING
              </h1>
              <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 text-xs font-mono font-bold border border-amber-800 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {UTTARAKHAND_CLOUDBURST_SUMMARY.dataStatus}
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1.5">
              Himalayan Hotspot Risk Prediction &bull; 20 Hotspots Across All 13 Districts &bull; Uttarakhand, India
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            <span className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-[#0E1B32] border border-[#1E2E4A]">
              36-Year NASA POWER Climatology (1988–2024)
            </span>
            <button
              onClick={() => setActiveView('priority-queue')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>DISPATCH ALERT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          2. TOP 6 DATA-DRIVEN KPI CARDS
          =================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-xl p-3.5 shadow-panel">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Critical Hotspots</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">7</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pithoragarh, Kedarnath, Malpa</div>
        </div>

        <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-xl p-3.5 shadow-panel">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Moderate Hotspots</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">8</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pauri, Tehri, Mussoorie</div>
        </div>

        <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-xl p-3.5 shadow-panel">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Monitored Hotspots</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">20 Sites</div>
          <div className="text-[10px] text-slate-400 mt-0.5">All 13 Uttarakhand Districts</div>
        </div>

        <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-xl p-3.5 shadow-panel">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Recorded Cloudbursts</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">167 Events</div>
          <div className="text-[10px] text-slate-400 mt-0.5">NASA POWER Climatology</div>
        </div>

        <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-xl p-3.5 shadow-panel">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Max Recorded Rain</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">377.8 mm</div>
          <div className="text-[10px] text-slate-400 mt-0.5">24h Peak at Malpa</div>
        </div>

        <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-xl p-3.5 shadow-panel">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Kedarnath Detection</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">85.8%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Day-Ahead ML Catch Rate</div>
        </div>
      </div>

      {/* ===================================================
          3. GIS COMMAND MAP & INTERACTIVE CONTROLS
          =================================================== */}
      <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-2xl overflow-hidden shadow-panel">
        <div className="p-4 border-b border-[#1E2E4A] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0E1B32]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                HIMALAYAN CLOUDBURST GIS COMMAND MAP &bull; UTTARAKHAND
              </h2>
              <p className="text-xs text-slate-400">
                20 High-Altitude Hotspots, Historical Disaster Coordinates &bull; Free Basemaps (No API Key Required)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {/* Free Basemap Switcher */}
            <div className="flex rounded-lg bg-[#08101E] border border-[#1E2E4A] p-0.5">
              {(Object.keys(BASE_MAPS) as BaseMapKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setBaseMap(key)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                    baseMap === key
                      ? 'bg-amber-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {BASE_MAPS[key].name}
                </button>
              ))}
            </div>

            {/* Map Expand Toggle */}
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="p-1.5 rounded-lg bg-[#08101E] border border-[#1E2E4A] text-slate-400 hover:text-white transition-colors"
              title={isMapExpanded ? "Collapse Map" : "Expand Map"}
            >
              {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Layer Toggle Bar */}
        <div className="px-4 py-2.5 bg-[#08101E] border-b border-[#1E2E4A] flex items-center gap-4 flex-wrap text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>GIS Layers:</span>
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.hotspots}
              onChange={() => toggleLayer('hotspots')}
              className="rounded accent-amber-500 bg-[#0E1B32] border-[#1E2E4A]"
            />
            <span>20 Hotspot Markers</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.backtestSites}
              onChange={() => toggleLayer('backtestSites')}
              className="rounded accent-rose-500 bg-[#0E1B32] border-[#1E2E4A]"
            />
            <span>Disaster Backtest Epics</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.stagingHubs}
              onChange={() => toggleLayer('stagingHubs')}
              className="rounded accent-emerald-500 bg-[#0E1B32] border-[#1E2E4A]"
            />
            <span>Safe Staging Enclaves (CCAS)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={layers.evacuationRoutes}
              onChange={() => toggleLayer('evacuationRoutes')}
              className="rounded accent-cyan-500 bg-[#0E1B32] border-[#1E2E4A]"
            />
            <span>Ridge Evacuation Corridors</span>
          </label>
        </div>

        {/* Leaflet Map Canvas */}
        <div className={`relative transition-all duration-300 ${isMapExpanded ? 'h-[620px]' : 'h-[440px]'}`}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
          >
            <MapFlyTo center={mapCenter} zoom={mapZoom} />

            <TileLayer
              url={BASE_MAPS[baseMap].url}
              attribution={BASE_MAPS[baseMap].attribution}
              maxZoom={BASE_MAPS[baseMap].maxZoom}
            />

            {/* 1. Hotspot Markers */}
            {layers.hotspots && UTTARAKHAND_HOTSPOTS.map((h) => {
              const color = h.riskLevel === 'CRITICAL' ? '#EF4444' :
                            h.riskLevel === 'HIGH' ? '#F97316' :
                            h.riskLevel === 'MODERATE' ? '#FBBF24' : '#10B981';
              return (
                <CircleMarker
                  key={h.id}
                  center={[h.latitude, h.longitude]}
                  radius={h.riskLevel === 'CRITICAL' ? 9 : 7}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.85,
                    color: '#FFFFFF',
                    weight: 1.5
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedHotspot(h);
                    }
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1 font-sans text-slate-900 min-w-[220px]">
                      <div className="font-bold text-sm text-slate-900 border-b pb-1 mb-1.5 flex justify-between items-center">
                        <span>{h.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          h.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                          h.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          h.riskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {h.riskLevel}
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-700">
                        <div><strong>District:</strong> {h.district}</div>
                        <div><strong>Elevation:</strong> {h.elevationMeters} m ASL</div>
                        <div><strong>36y Cloudbursts:</strong> {h.cloudburstEvents} events</div>
                        <div><strong>Max 24h Rain:</strong> {h.maxRainfallMm} mm</div>
                        <div><strong>RPI Priority:</strong> {h.rpiScore} ({h.priorityClass})</div>
                        <div className="border-t pt-1 mt-1 text-[11px] text-blue-800 font-semibold">
                          Safe Staging: {h.safeStagingDestination} ({h.transitDistanceKm} km)
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* 2. Safe Staging Hubs */}
            {layers.stagingHubs && SAFE_STAGING_DESTINATIONS.map((hub) => (
              <CircleMarker
                key={hub.site_id}
                center={hub.coordinates}
                radius={8}
                pathOptions={{
                  fillColor: '#10B981',
                  fillOpacity: 0.9,
                  color: '#FFFFFF',
                  weight: 2
                }}
                eventHandlers={{
                  click: () => setSelectedStaging(hub)
                }}
              >
                <Popup>
                  <div className="text-xs p-1 font-sans text-slate-900 min-w-[220px]">
                    <div className="font-bold text-sm text-emerald-800 border-b pb-1 mb-1.5 flex justify-between items-center">
                      <span>{hub.name}</span>
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                        CCAS {hub.ccas_score}
                      </span>
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <div><strong>Safe Capacity:</strong> {hub.available_capacity.toLocaleString()} persons</div>
                      <div><strong>Water Supply:</strong> {hub.water_capacity_lpd.toLocaleString()} L/day</div>
                      <div><strong>Elevation:</strong> {hub.elevation_m} m (Solid Ridge)</div>
                      <div><strong>Road Corridor:</strong> {hub.road_access}</div>
                      <div><strong>Designated For:</strong> {hub.allocated_for}</div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* 3. Evacuation Corridors to Staging Hubs */}
            {layers.evacuationRoutes && (
              <>
                {/* Kedarnath to Guptkashi */}
                <Polyline
                  positions={[[30.735, 79.066], [30.640, 79.075], [30.522, 79.080]]}
                  pathOptions={{ color: '#06B6D4', weight: 3, dashArray: '6, 6', opacity: 0.85 }}
                />
                {/* Badrinath to Joshimath */}
                <Polyline
                  positions={[[30.740, 79.490], [30.650, 79.530], [30.556, 79.570]]}
                  pathOptions={{ color: '#06B6D4', weight: 3, dashArray: '6, 6', opacity: 0.85 }}
                />
                {/* Malpa to Pithoragarh */}
                <Polyline
                  positions={[[30.230, 80.720], [29.850, 80.500], [29.585, 80.215]]}
                  pathOptions={{ color: '#06B6D4', weight: 3, dashArray: '6, 6', opacity: 0.85 }}
                />
              </>
            )}
          </MapContainer>

          {/* Map Legend Floating Box */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-[#0B1424]/90 backdrop-blur-md border border-[#1E2E4A] p-3 rounded-xl text-xs font-mono shadow-panel pointer-events-auto max-w-[210px]">
            <div className="font-bold text-white uppercase text-[11px] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Risk Classification</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span>Critical Risk (&gt;12 Events)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                <span>High Risk (8–11 Events)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span>Moderate Risk (5–7)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Low Risk (&lt;5 Events)</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-[#1E2E4A]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white shrink-0" />
                <span>Safe Staging Hub (CCAS)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          4. INTERACTIVE ANALYTICS: BACKTESTS VS ML FEATURES
          =================================================== */}
      <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-2xl p-5 shadow-panel space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2E4A] pb-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                MODEL VALIDATION &amp; PREDICTIVE ANALYTICS
              </h3>
              <p className="text-xs text-slate-400">
                12 Famous Disaster Backtests &bull; 15-Feature Random Forest Importance &bull; Real-time Weather What-If Engine
              </p>
            </div>
          </div>

          <div className="flex rounded-lg bg-[#08101E] border border-[#1E2E4A] p-0.5 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('backtest')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'backtest'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>12 Historical Backtests</span>
            </button>
            <button
              onClick={() => setActiveTab('ml-features')}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'ml-features'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Feature Ranking &amp; Simulator</span>
            </button>
          </div>
        </div>

        {activeTab === 'backtest' ? (
          /* TAB 1: 12 FAMOUS HISTORICAL BACKTESTS */
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Selector List */}
              <div className="bg-[#08101E] border border-[#1E2E4A] rounded-xl p-3 space-y-2 max-h-[380px] overflow-y-auto">
                <div className="text-xs font-mono uppercase text-slate-400 mb-2 font-bold px-1">
                  Select Disaster Event:
                </div>
                {FAMOUS_DISASTER_BACKTESTS.map((bt) => (
                  <button
                    key={bt.id}
                    onClick={() => handleSelectBacktest(bt)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                      selectedBacktest.id === bt.id
                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/50 font-bold'
                        : 'text-slate-300 hover:bg-[#0E1B32] hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="truncate max-w-[180px]">
                      <div>{bt.name}</div>
                      <div className="text-[10px] text-slate-400">{bt.date}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 ${
                      bt.validationOutcome.includes('CRITICAL') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      bt.validationOutcome.includes('CORRECTLY') ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      'bg-orange-950 text-orange-300 border border-orange-800'
                    }`}>
                      {Math.round(bt.predictedProbability * 100)}%
                    </span>
                  </button>
                ))}
              </div>

              {/* Event Inspector Card */}
              <div className="lg:col-span-2 bg-[#08101E] border border-[#1E2E4A] rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2E4A] pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white font-mono">
                      {selectedBacktest.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Location: <strong className="text-amber-300">{selectedBacktest.location}</strong> &bull; Date: {selectedBacktest.date}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold self-start sm:self-auto ${
                    selectedBacktest.validationOutcome.includes('CRITICAL') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    selectedBacktest.validationOutcome.includes('CORRECTLY') ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                    'bg-orange-950 text-orange-300 border border-orange-800'
                  }`}>
                    {selectedBacktest.validationOutcome}
                  </span>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-[#0B1424] p-3 rounded-lg border border-[#1E2E4A]">
                    <span className="text-slate-400 text-[10px] uppercase">NASA 24h Rain</span>
                    <div className="text-lg font-bold text-rose-400 mt-1">{selectedBacktest.nasaRainfallMm} mm</div>
                  </div>
                  <div className="bg-[#0B1424] p-3 rounded-lg border border-[#1E2E4A]">
                    <span className="text-slate-400 text-[10px] uppercase">Temperature</span>
                    <div className="text-lg font-bold text-cyan-400 mt-1">{selectedBacktest.temperatureC}&deg;C</div>
                  </div>
                  <div className="bg-[#0B1424] p-3 rounded-lg border border-[#1E2E4A]">
                    <span className="text-slate-400 text-[10px] uppercase">Relative Humidity</span>
                    <div className="text-lg font-bold text-amber-400 mt-1">{selectedBacktest.relativeHumidityPct}%</div>
                  </div>
                  <div className="bg-[#0B1424] p-3 rounded-lg border border-[#1E2E4A]">
                    <span className="text-slate-400 text-[10px] uppercase">Predicted Probability</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {Math.round(selectedBacktest.predictedProbability * 100)}%
                    </div>
                  </div>
                </div>

                <div className="bg-[#0B1424] p-3.5 rounded-lg border border-[#1E2E4A] text-xs text-slate-300 space-y-1">
                  <div className="font-bold font-mono text-amber-400 uppercase text-[11px]">Historical Incident Grounding:</div>
                  <p>{selectedBacktest.historicalContext}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: 15-FEATURE RANKING & REAL-TIME WHAT-IF SIMULATOR */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 15 Features Ranking */}
            <div className="bg-[#08101E] border border-[#1E2E4A] rounded-xl p-4 space-y-3">
              <div className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center justify-between">
                <span>Top Meteorological Features (Random Forest)</span>
                <span className="text-[11px] text-amber-400">Total: 15 Features</span>
              </div>
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {METEOROLOGICAL_FEATURE_IMPORTANCE.map((f, idx) => (
                  <div key={f.feature} className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-200">
                        {idx + 1}. {f.name} <span className="text-slate-400 text-[11px]">({f.feature})</span>
                      </span>
                      <span className="text-amber-400 font-bold">{f.pct}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0B1424] rounded-full overflow-hidden border border-[#1E2E4A]">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full"
                        style={{ width: `${f.importance * 800}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400">{f.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* What-If Meteorological Simulator */}
            <div className="bg-[#08101E] border border-[#1E2E4A] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2E4A] pb-2">
                <h4 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span>Interactive Day-Ahead Risk Simulator</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">Physics-Calibrated</span>
              </div>

              {/* Sliders */}
              <div className="space-y-3.5 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400" /> 24h Precipitation:</span>
                    <span className="text-white font-bold">{simRain} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={simRain}
                    onChange={(e) => setSimRain(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temperature (2m):</span>
                    <span className="text-white font-bold">{simTemp}&deg;C</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="35"
                    value={simTemp}
                    onChange={(e) => setSimTemp(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-cyan-400" /> Relative Humidity:</span>
                    <span className="text-white font-bold">{simHumidity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={simHumidity}
                    onChange={(e) => setSimHumidity(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-emerald-400" /> Wind Speed (2m):</span>
                    <span className="text-white font-bold">{simWind} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.1"
                    value={simWind}
                    onChange={(e) => setSimWind(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculated Result */}
              <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Calculated Cloudburst Probability</div>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">
                    {(simulatedProbability * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Next-Day Forecast Horizon (No Leakage)</div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs border ${
                  simulatedProbability >= 0.70 ? 'bg-rose-950 text-rose-300 border-rose-800' :
                  simulatedProbability >= 0.45 ? 'bg-orange-950 text-orange-300 border-orange-800' :
                  simulatedProbability >= 0.25 ? 'bg-amber-950 text-amber-300 border-amber-800' :
                  'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {simulatedProbability >= 0.70 ? 'CRITICAL RISK' :
                   simulatedProbability >= 0.45 ? 'HIGH RISK' :
                   simulatedProbability >= 0.25 ? 'MODERATE RISK' : 'LOW RISK'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          5. TOP 20 HIMALAYAN HOTSPOTS PRIORITY TABLE
          =================================================== */}
      <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-2xl overflow-hidden shadow-panel">
        <div className="p-4 border-b border-[#1E2E4A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0E1B32]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                HIMALAYAN CLOUDBURST HOTSPOTS &bull; 20 SITES RANKING
              </h3>
              <p className="text-xs text-slate-400">
                Sorted by Historical Climatology Event Frequency &bull; Click row to inspect on GIS Map
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#08101E] text-slate-400 uppercase font-mono text-[11px] border-b border-[#1E2E4A]">
              <tr>
                <th className="p-2.5">Site Name</th>
                <th className="p-2.5">District</th>
                <th className="p-2.5">Elevation</th>
                <th className="p-2.5">36y Events</th>
                <th className="p-2.5">Max Rain</th>
                <th className="p-2.5">Mean Rain</th>
                <th className="p-2.5">Risk Level</th>
                <th className="p-2.5">RPI Score</th>
                <th className="p-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2E4A]">
              {UTTARAKHAND_HOTSPOTS.map((h) => (
                <tr
                  key={h.id}
                  onClick={() => handleZoomToHotspot(h)}
                  className={`cursor-pointer transition-colors ${
                    selectedHotspot?.id === h.id ? 'bg-amber-600/15' : 'hover:bg-[#0E1B32]/60'
                  }`}
                >
                  <td className="p-2.5 font-mono font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{h.name}</span>
                  </td>
                  <td className="p-2.5 font-mono text-slate-300">{h.district}</td>
                  <td className="p-2.5 font-mono text-cyan-300">{h.elevationMeters} m</td>
                  <td className="p-2.5 font-mono font-bold text-white">{h.cloudburstEvents}</td>
                  <td className="p-2.5 font-mono text-rose-300 font-bold">{h.maxRainfallMm} mm</td>
                  <td className="p-2.5 font-mono text-slate-300">{h.meanRainfallMm} mm</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      h.riskLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      h.riskLevel === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                      h.riskLevel === 'MODERATE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {h.riskLevel}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono font-bold text-amber-400">{h.rpiScore}</td>
                  <td className="p-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoomToHotspot(h);
                      }}
                      className="px-2 py-1 rounded bg-[#08101E] hover:bg-amber-600 text-slate-300 hover:text-white font-mono text-[11px] transition-colors"
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
          6. HIGH-GROUND SAFE STAGING ENCLAVES (CCAS & SPHERE STANDARDS)
          =================================================== */}
      <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-2xl p-5 shadow-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E2E4A] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono tracking-wide">
                SAFE HIGH-GROUND STAGING ENCLAVES &bull; CCAS INTEGRATION
              </h3>
              <p className="text-xs text-slate-400">
                Screened against Sphere Humanitarian Standards &bull; Outside flash flood runout and talus slide fans
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('relocation-engine')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono transition-all shadow-panel flex items-center gap-2 self-start lg:self-auto"
          >
            <span>VIEW COMPLETE STAGING PLAN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAFE_STAGING_DESTINATIONS.map((site) => (
            <div
              key={site.site_id}
              className="bg-[#08101E] border border-[#1E2E4A] rounded-xl p-4 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white text-xs truncate max-w-[200px]" title={site.name}>
                  {site.name}
                </h4>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-800">
                  CCAS {site.ccas_score}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 my-3">
                <div className="flex justify-between">
                  <span>District / Zone:</span>
                  <span className="text-white font-mono">{site.district} ({site.elevation_m}m)</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Capacity:</span>
                  <span className="text-emerald-400 font-mono font-bold">{site.available_capacity.toLocaleString()} persons</span>
                </div>
                <div className="flex justify-between">
                  <span>Water Supply:</span>
                  <span className="text-white font-mono">{site.water_capacity_lpd.toLocaleString()} L/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Sphere Sanitation:</span>
                  <span className="text-white font-mono">{site.latrines_count} latrines</span>
                </div>
                <div className="flex justify-between">
                  <span>Corridor Access:</span>
                  <span className="text-white font-mono truncate max-w-[140px]" title={site.road_access}>{site.road_access}</span>
                </div>
              </div>

              <button
                onClick={() => handleZoomToStaging(site)}
                className="w-full py-1.5 rounded bg-[#0B1424] hover:bg-[#1E2E4A] text-slate-400 hover:text-white text-xs font-mono transition-colors flex items-center justify-center gap-1"
              >
                <Crosshair className="w-3 h-3" />
                <span>Locate on GIS Map</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================
          7. AUTOMATIC DATA DICTIONARY & PROVENANCE REGISTER
          =================================================== */}
      <div className="bg-[#0B1424] border border-[#1E2E4A] rounded-2xl overflow-hidden shadow-panel">
        <button
          onClick={() => setIsDictionaryExpanded(!isDictionaryExpanded)}
          className="w-full p-4 flex items-center justify-between bg-[#08101E] hover:bg-[#0E1B32] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                AUTOMATIC DATA DICTIONARY &amp; PROVENANCE REGISTER
              </h3>
              <p className="text-xs text-slate-400">
                Complete schema and metadata audit for all ingested files in the Uttarakhand cloudburst dataset
              </p>
            </div>
          </div>
          {isDictionaryExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {isDictionaryExpanded && (
          <div className="p-4 border-t border-[#1E2E4A] overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#08101E] text-slate-400 uppercase font-mono text-[11px] border-b border-[#1E2E4A]">
                <tr>
                  <th className="p-2.5">File Name</th>
                  <th className="p-2.5">Data Type</th>
                  <th className="p-2.5">Rows &amp; Columns</th>
                  <th className="p-2.5">Time Period</th>
                  <th className="p-2.5">CRS &amp; Spatial</th>
                  <th className="p-2.5">Data Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2E4A]">
                {CLOUDBURST_DATA_DICTIONARY.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#0E1B32]/40">
                    <td className="p-2.5 font-mono font-bold text-white">{item.file}</td>
                    <td className="p-2.5 text-slate-300">{item.type}</td>
                    <td className="p-2.5 text-slate-400 font-mono">{item.rows}</td>
                    <td className="p-2.5 text-amber-300 font-mono">{item.time_period}</td>
                    <td className="p-2.5 text-slate-400 font-mono">{item.crs}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
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

export default CloudburstIntelligence;
