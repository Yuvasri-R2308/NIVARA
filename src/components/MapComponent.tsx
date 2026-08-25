import React, { useEffect, useMemo, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Circle,
  Popup, 
  Polyline, 
  Marker, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { Parcel, CandidateSite, RunoutPath, DemSamplePoint } from '../types';
import { RiskBadge } from './RiskBadge';
import { DataConfidenceTag } from './DataConfidenceTag';
import { DetailedAnalysisModal } from './DetailedAnalysisModal';
import { 
  AREA_HAZARD_REGISTRY, 
  SAFE_SITES_REGISTRY, 
  getHazardProfileForLocation,
  AreaHazardProfile
} from '../data/areaHazardProfiles';
import { 
  Layers, 
  Search, 
  ShieldAlert, 
  Compass, 
  Sparkles,
  Activity,
  Mountain,
  Waves,
  CloudRain,
  Clock,
  ArrowRight,
  X,
  Building2,
  FileText
} from 'lucide-react';

export type BaseMapType = 'satellite' | 'terrain' | 'dark' | 'street';

interface Props {
  parcels?: Parcel[];
  candidateSites?: CandidateSite[];
  runoutPaths?: RunoutPath[];
  demPoints?: DemSamplePoint[];
  selectedParcel?: Parcel | null;
  onSelectParcel?: (p: Parcel) => void;
  selectedSite?: CandidateSite | null;
  onSelectSite?: (s: CandidateSite) => void;
  center?: [number, number];
  zoom?: number;
  showRunout?: boolean;
  showSites?: boolean;
  showDemOverlay?: boolean;
  height?: string;
  simulatedMultiplier?: number;
  initialBaseMap?: BaseMapType;
  onOpenDetailedAnalysis?: (item: any) => void;
}

// Tile Layer configurations
const BASE_MAPS = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Imagery',
    maxZoom: 19
  },
  terrain: {
    name: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Topo',
    maxZoom: 19
  },
  dark: {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
  },
  street: {
    name: 'Street',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    maxZoom: 19
  }
};

// Map controller for fly-to and bounds
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Sleek Compact Ranked Relocation Destination Pin
const createRankedSiteIcon = (rank: number, siteName: string, capacity: number, ccas: number, isSelected: boolean) => {
  const medalColor = rank === 1 ? '#38bdf8' : rank === 2 ? '#34d399' : rank === 3 ? '#fbbf24' : '#a78bfa';
  const borderGlow = isSelected ? `0 0 15px ${medalColor}` : '0 2px 8px rgba(0,0,0,0.7)';
  const shortName = siteName.split(' ')[0];

  return L.divIcon({
    className: 'custom-ranked-site-marker',
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: #111C17;
        border: 1.5px solid ${medalColor};
        border-radius: 12px;
        padding: 2px 6px 2px 3px;
        box-shadow: ${borderGlow};
        cursor: pointer;
        transform: translate(-50%, -50%);
        white-space: nowrap;
        font-family: 'Space Grotesk', sans-serif;
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 700;
      ">
        <span style="
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: ${medalColor};
          color: #0B120F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 9px;
        ">
          ${rank}
        </span>
        <span style="color: #FFFFFF;">${shortName}</span>
        <span style="color: #4ADE9A; font-family: 'IBM Plex Mono', monospace; font-size: 9px;">(${capacity}p)</span>
      </div>
    `,
    iconSize: [85, 20],
    iconAnchor: [42, 10]
  });
};

// Sleek Compact Epicenter Red Zone Pulse Marker Pin
const createRedZoneSourceIcon = () => {
  return L.divIcon({
    className: 'custom-red-zone-marker',
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #1A0E0E;
        border: 1.5px solid #E8543E;
        border-radius: 12px;
        padding: 2px 6px 2px 3px;
        box-shadow: 0 0 16px rgba(232, 84, 62, 0.85);
        cursor: pointer;
        transform: translate(-50%, -50%);
        white-space: nowrap;
        font-family: 'Space Grotesk', sans-serif;
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 800;
      ">
        <span style="
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #E8543E;
          color: #FFFFFF;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
        ">
          !
        </span>
        <span style="color: #FF705A;">Meppadi Epicenter</span>
      </div>
    `,
    iconSize: [115, 20],
    iconAnchor: [57, 10]
  });
};

// Sleek Micro Town Chip Icon
const createTownIcon = (name: string, level: string) => {
  const badgeColor = level === 'HIGH' ? '#E8543E' : level === 'MEDIUM' ? '#E8A63E' : '#3FA37D';
  return L.divIcon({
    className: 'custom-town-marker',
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 3.5px;
        background: rgba(14, 22, 19, 0.92);
        border: 1px solid ${badgeColor};
        border-radius: 10px;
        padding: 1.5px 5.5px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.6);
        cursor: pointer;
        transform: translate(-50%, -50%);
        white-space: nowrap;
        font-family: 'Space Grotesk', sans-serif;
        color: #EAF1EC;
        font-size: 9.5px;
        font-weight: 600;
      ">
        <span style="width: 5.5px; height: 5.5px; border-radius: 50%; background: ${badgeColor};"></span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [65, 18],
    iconAnchor: [32, 9]
  });
};

export const MapComponent: React.FC<Props> = ({
  parcels = [],
  candidateSites = [],
  runoutPaths = [],
  demPoints = [],
  selectedParcel,
  onSelectParcel,
  selectedSite,
  onSelectSite,
  center = [11.605, 76.085],
  zoom = 11,
  showRunout = true,
  showSites = true,
  showDemOverlay = false,
  height = '640px',
  simulatedMultiplier = 1.0,
  initialBaseMap = 'satellite',
  onOpenDetailedAnalysis
}) => {
  const [baseMap, setBaseMap] = useState<BaseMapType>(initialBaseMap);
  const [showLegend, setShowLegend] = useState(false);
  const [showHazardHud, setShowHazardHud] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  
  // Interactive full detail modal
  const [detailedModalItem, setDetailedModalItem] = useState<any | null>(null);

  // Filter parcels for in-map search if query is typed
  const displayedParcels = useMemo(() => {
    if (!mapSearch.trim() && !selectedParcel) return [];
    if (selectedParcel) return [selectedParcel];
    const q = mapSearch.toLowerCase();
    return parcels.filter(p => 
      p.parcel_id.toLowerCase().includes(q) || 
      p.village.toLowerCase().includes(q) ||
      p.survey_no.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [parcels, mapSearch, selectedParcel]);

  // Compute live multi-hazard probabilities for HUD dynamically based on ANY focused area/city
  const hazardProbabilities = useMemo(() => {
    const focusTarget = detailedModalItem?.village || selectedParcel?.village || (mapSearch ? mapSearch : 'Meppadi');
    const profile = getHazardProfileForLocation(focusTarget);

    if (selectedParcel && selectedParcel.slope_deg) {
      return {
        landslide: Math.round((selectedParcel.landslide_probability || 0.835) * 100),
        flood: Math.round((selectedParcel.flood_probability || 0.675) * 100),
        slope: Math.min(100, Math.round((selectedParcel.slope_deg / 45.0) * 100)),
        rainfall: Math.round(Math.min(100, (selectedParcel.rainfall_24h_mm / 280.0) * 100)),
        history: selectedParcel.village === 'Meppadi' ? 95 : 48,
        areaTitle: `${selectedParcel.village} (${selectedParcel.parcel_id})`
      };
    }

    return {
      landslide: profile.landslideProb,
      flood: profile.floodProb,
      slope: Math.round(Math.min(100, (profile.slopeDeg / 40.0) * 100)),
      rainfall: Math.round(Math.min(100, (profile.rainfall24h * simulatedMultiplier / 285.0) * 100)),
      history: profile.historyFreq,
      areaTitle: profile.name
    };
  }, [selectedParcel, detailedModalItem, mapSearch, simulatedMultiplier]);

  const activeTileConfig = BASE_MAPS[baseMap];

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-pine-border bg-pine-bg shadow-panel group">
      
      {/* 1. TOP IN-MAP CONTROLS BAR */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Quick In-Map Search */}
        <div className="pointer-events-auto relative w-full sm:w-64 bg-pine-bg/95 backdrop-blur-md rounded-lg border border-pine-border shadow-panel">
          <Search className="w-3.5 h-3.5 text-pine-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search village, town, site..."
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            className="w-full bg-transparent pl-8 pr-2.5 py-1.5 text-xs font-mono text-pine-text placeholder:text-pine-muted/70 focus:outline-none"
          />
        </div>

        {/* Right: Map Type Switchers + HUD toggle + Emergency Mode */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1 bg-pine-bg/95 backdrop-blur-md p-1 rounded-lg border border-pine-border shadow-panel">
          
          {/* Base Layer Switcher Pills */}
          {(['satellite', 'terrain', 'dark', 'street'] as BaseMapType[]).map((type) => {
            const isActive = baseMap === type;
            return (
              <button
                key={type}
                onClick={() => setBaseMap(type)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono capitalize transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white font-bold shadow-sm'
                    : 'text-pine-muted hover:text-pine-text hover:bg-pine-elevated'
                }`}
              >
                {type}
              </button>
            );
          })}

          <div className="h-3.5 w-px bg-pine-border mx-0.5" />

          {/* Toggle Risk HUD Button */}
          <button
            onClick={() => setShowHazardHud(!showHazardHud)}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition-all flex items-center gap-1 ${
              showHazardHud 
                ? 'bg-pine-elevated text-pine-accent border-pine-accent/50 font-bold' 
                : 'bg-pine-bg text-pine-muted border-pine-border'
            }`}
            title="Toggle Risk Probabilities Panel"
          >
            <Activity className="w-3 h-3 text-pine-accent" />
            <span>Risk Stats</span>
          </button>

          {/* Emergency Mode Highlight Button */}
          <button
            onClick={() => setEmergencyMode(!emergencyMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all border ${
              emergencyMode
                ? 'bg-risk-high text-white border-rose-500 shadow-hero-glow animate-pulse'
                : 'bg-rose-950/70 text-rose-300 border-rose-800 hover:bg-risk-high hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>{emergencyMode ? 'EMERGENCY ACTIVE' : 'EMERGENCY MODE'}</span>
          </button>

        </div>

      </div>

      {/* 2. LEAFLET MAP CONTAINER */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
        preferCanvas={true}
      >
        <MapViewController center={center} zoom={zoom} />

        <TileLayer
          key={baseMap}
          attribution={activeTileConfig.attribution}
          url={activeTileConfig.url}
          maxZoom={activeTileConfig.maxZoom}
        />

        {/* 1. SMOOTH CONCENTRIC CIRCULAR DISASTER ZONES AROUND DISASTER EPICENTER (As in Reference Screenshot) */}
        {/* Outer Buffer Ring (6.0 km) */}
        <Circle
          center={[11.554, 76.128]}
          radius={6000}
          pathOptions={{
            color: '#E8A63E',
            fillColor: '#E8A63E',
            fillOpacity: 0.08,
            weight: 1.2,
            dashArray: 'none'
          }}
          eventHandlers={{
            click: () => {
              setDetailedModalItem(AREA_HAZARD_REGISTRY['Meppadi']);
            }
          }}
        />

        {/* Middle Impact Buffer Ring (3.5 km) */}
        <Circle
          center={[11.554, 76.128]}
          radius={3500}
          pathOptions={{
            color: '#E8A63E',
            fillColor: '#E8A63E',
            fillOpacity: 0.16,
            weight: 1.5,
            dashArray: 'none'
          }}
          eventHandlers={{
            click: () => {
              setDetailedModalItem(AREA_HAZARD_REGISTRY['Meppadi']);
            }
          }}
        />

        {/* Inner High Hazard Core Circle (1.8 km) */}
        <Circle
          center={[11.554, 76.128]}
          radius={1800}
          pathOptions={{
            color: '#E8543E',
            fillColor: '#E8543E',
            fillOpacity: 0.32,
            weight: 2,
            dashArray: 'none'
          }}
          eventHandlers={{
            click: () => {
              setDetailedModalItem(AREA_HAZARD_REGISTRY['Meppadi']);
            }
          }}
        />

        {/* 2. LIGHT CIRCULAR HALOS FOR ALL STUDY VILLAGES & TOWNS */}
        {/* Kalpetta (District HQ & Safe Zone D) */}
        <Circle
          center={[11.608, 76.082]}
          radius={2200}
          pathOptions={{
            color: '#3FA37D',
            fillColor: '#3FA37D',
            fillOpacity: 0.14,
            weight: 1.2
          }}
          eventHandlers={{
            click: () => setDetailedModalItem(AREA_HAZARD_REGISTRY['Kalpetta'])
          }}
        />

        {/* Achooranam (Tea Plantation Slope Zone) */}
        <Circle
          center={[11.591, 76.012]}
          radius={2200}
          pathOptions={{
            color: '#E8A63E',
            fillColor: '#E8A63E',
            fillOpacity: 0.12,
            weight: 1.2
          }}
          eventHandlers={{
            click: () => setDetailedModalItem(AREA_HAZARD_REGISTRY['Achooranam'])
          }}
        />

        {/* Kottathara (River Valley Zone) */}
        <Circle
          center={[11.685, 76.039]}
          radius={2200}
          pathOptions={{
            color: '#E8A63E',
            fillColor: '#E8A63E',
            fillOpacity: 0.12,
            weight: 1.2
          }}
          eventHandlers={{
            click: () => setDetailedModalItem(AREA_HAZARD_REGISTRY['Kottathara'])
          }}
        />

        {/* Kuppadithara (Safe Flatland Plateau) */}
        <Circle
          center={[11.658, 76.009]}
          radius={2000}
          pathOptions={{
            color: '#3FA37D',
            fillColor: '#3FA37D',
            fillOpacity: 0.12,
            weight: 1.2
          }}
          eventHandlers={{
            click: () => setDetailedModalItem(AREA_HAZARD_REGISTRY['Kuppadithara'])
          }}
        />

        {/* Vythiri (Ghat Pass Corridor) */}
        <Circle
          center={[11.551, 76.041]}
          radius={2000}
          pathOptions={{
            color: '#E8A63E',
            fillColor: '#E8A63E',
            fillOpacity: 0.12,
            weight: 1.2
          }}
          eventHandlers={{
            click: () => setDetailedModalItem(AREA_HAZARD_REGISTRY['Vythiri'])
          }}
        />

        {/* Padinharethara (Banasura Reservoir Zone) */}
        <Circle
          center={[11.668, 75.952]}
          radius={2000}
          pathOptions={{
            color: '#E8A63E',
            fillColor: '#E8A63E',
            fillOpacity: 0.12,
            weight: 1.2
          }}
          eventHandlers={{
            click: () => setDetailedModalItem(AREA_HAZARD_REGISTRY['Padinharethara'])
          }}
        />

        {/* Mananthavady (Northern Plains) */}
        <Circle
          center={[11.802, 76.003]}
          radius={2200}
          pathOptions={{
            color: '#3FA37D',
            fillColor: '#3FA37D',
            fillOpacity: 0.12,
            weight: 1.2
          }}
          eventHandlers={{
            click: () => setDetailedModalItem(AREA_HAZARD_REGISTRY['Mananthavady'])
          }}
        />

        {/* Sulthan Bathery (Eastern Plain) */}
        <Circle
          center={[11.662, 76.257]}
          radius={2200}
          pathOptions={{
            color: '#3FA37D',
            fillColor: '#3FA37D',
            fillOpacity: 0.12,
            weight: 1.2
          }}
          eventHandlers={{
            click: () => setDetailedModalItem(AREA_HAZARD_REGISTRY['Sulthan Bathery'])
          }}
        />

        {/* 3. ALL TOWNS & CITIES PINS */}
        {Object.entries(AREA_HAZARD_REGISTRY).map(([key, town]) => (
          <Marker
            key={key}
            position={town.coordinates}
            icon={key === 'Meppadi' ? createRedZoneSourceIcon() : createTownIcon(key, town.riskLevel)}
            eventHandlers={{
              click: () => {
                setDetailedModalItem(town);
              }
            }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 font-mono text-xs max-w-xs">
                <div className="flex items-center justify-between gap-2 border-b border-pine-border pb-1">
                  <strong className="text-white text-sm">{town.name}</strong>
                  <RiskBadge level={town.riskLevel} score={town.riskScore} size="sm" />
                </div>
                <div className="flex items-center justify-between text-[10.5px] bg-pine-bg px-2 py-1 rounded border border-pine-border/60">
                  <span className="text-pine-muted">Census Population:</span>
                  <strong className="text-white font-mono">{town.censusPopulation.toLocaleString()} people</strong>
                </div>
                <div className="grid grid-cols-2 gap-1 bg-pine-bg p-1.5 rounded text-[10px] text-pine-muted">
                  <div>Landslide: <strong className="text-rose-400">{town.landslideProb}%</strong></div>
                  <div>Flood: <strong className="text-cyan-400">{town.floodProb}%</strong></div>
                  <div>Slope: <strong className="text-amber-400">{town.slopeDeg}°</strong></div>
                  <div>Rain: <strong className="text-blue-400">{town.rainfall24h}mm</strong></div>
                </div>
                <button
                  onClick={() => setDetailedModalItem(town)}
                  className="w-full py-1.5 bg-pine-accent text-pine-bg text-[10px] font-bold rounded mt-1 hover:bg-emerald-400 flex items-center justify-center gap-1"
                >
                  <Activity className="w-3 h-3" />
                  <span>VIEW DETAILED ANALYSIS</span>
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 4. SEARCHED / SELECTED PARCEL MARKER ONLY */}
        {displayedParcels.map((p) => {
          const isSelected = selectedParcel?.parcel_id === p.parcel_id;
          const color = p.risk_level === 'HIGH' ? '#E8543E' : p.risk_level === 'MEDIUM' ? '#E8A63E' : '#3FA37D';

          return (
            <CircleMarker
              key={p.parcel_id}
              center={[p.latitude, p.longitude]}
              radius={isSelected ? 8 : 5}
              eventHandlers={{
                click: () => {
                  if (onSelectParcel) onSelectParcel(p);
                  setDetailedModalItem(p);
                }
              }}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.9,
                color: '#FFFFFF',
                weight: 2
              }}
            >
              <Popup>
                <div className="p-1 space-y-1 font-mono text-xs max-w-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-pine-border pb-1">
                    <span className="font-bold text-pine-accent">{p.parcel_id}</span>
                    <RiskBadge level={p.risk_level} score={p.risk_score} size="sm" />
                  </div>
                  <div className="text-[11px] text-pine-text">
                    Village: <strong className="text-white">{p.village}</strong> (Survey {p.survey_no}/{p.subdivision_no})
                  </div>
                  <button
                    onClick={() => setDetailedModalItem(p)}
                    className="w-full text-center py-1.5 bg-pine-accent text-pine-bg text-[10px] font-bold rounded mt-1 hover:bg-emerald-400 flex items-center justify-center gap-1"
                  >
                    <Activity className="w-3 h-3" />
                    <span>VIEW DETAILED ANALYSIS</span>
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 5. DISASTER EPICENTER PIN (Meppadi / Chooralmala) */}
        <Marker
          position={[11.554, 76.128]}
          icon={createRedZoneSourceIcon()}
          eventHandlers={{
            click: () => {
              setDetailedModalItem(AREA_HAZARD_REGISTRY['Meppadi']);
            }
          }}
        />

        {/* 6. SCREENED CANDIDATE RELOCATION SITES (Ranked 1, 2, 3, 4, 5) */}
        {showSites && candidateSites.map((site, index) => {
          const rank = index + 1;
          const isSelected = selectedSite?.site_id === site.site_id;
          const siteProfile = SAFE_SITES_REGISTRY[site.site_id] || site;

          return (
            <Marker
              key={site.site_id}
              position={[site.latitude, site.longitude]}
              icon={createRankedSiteIcon(rank, site.name, site.capacity_persons, site.ccas_score, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectSite) onSelectSite(site);
                  setDetailedModalItem(siteProfile);
                }
              }}
            />
          );
        })}

      </MapContainer>

      {/* 3. ULTRA-COMPACT SLIM RISK PROBABILITIES HUD (Top-Right Micro Card) */}
      {showHazardHud && (
        <div className="absolute top-12 right-2.5 z-[1000] w-56 bg-pine-panel/95 backdrop-blur-md border border-pine-border/90 rounded-xl p-2.5 text-[10px] font-mono shadow-modal space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-pine-border/60 pb-1">
            <div className="flex items-center gap-1.5 text-pine-text font-bold text-[10px]">
              <Activity className="w-3 h-3 text-pine-accent animate-pulse" />
              <span>{hazardProbabilities.areaTitle}</span>
            </div>
            <button
              onClick={() => setShowHazardHud(false)}
              className="text-pine-muted hover:text-pine-text p-0.5"
              title="Close Panel"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[9.5px] text-pine-muted">
                <span>Landslide Risk</span>
                <strong className="text-rose-400">{hazardProbabilities.landslide}%</strong>
              </div>
              <div className="w-full h-1 bg-pine-bg rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hazardProbabilities.landslide}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9.5px] text-pine-muted">
                <span>Flood Risk</span>
                <strong className="text-cyan-400">{hazardProbabilities.flood}%</strong>
              </div>
              <div className="w-full h-1 bg-pine-bg rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${hazardProbabilities.flood}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9.5px] text-pine-muted">
                <span>Slope Steepness</span>
                <strong className="text-amber-400">{hazardProbabilities.slope}%</strong>
              </div>
              <div className="w-full h-1 bg-pine-bg rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${hazardProbabilities.slope}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9.5px] text-pine-muted">
                <span>Rain Level</span>
                <strong className="text-blue-400">{hazardProbabilities.rainfall}%</strong>
              </div>
              <div className="w-full h-1 bg-pine-bg rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${hazardProbabilities.rainfall}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9.5px] text-pine-muted">
                <span>Disaster History</span>
                <strong className="text-emerald-400">{hazardProbabilities.history}%</strong>
              </div>
              <div className="w-full h-1 bg-pine-bg rounded-full overflow-hidden mt-0.5">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${hazardProbabilities.history}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DISCRETE MICRO FLOATING LEGEND (Bottom-Left Pill) */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-auto">
        {!showLegend ? (
          <button
            onClick={() => setShowLegend(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pine-panel/95 backdrop-blur border border-pine-border text-[10px] font-mono text-pine-muted hover:text-pine-text shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-risk-high" />
            <span>Map Legend</span>
          </button>
        ) : (
          <div className="bg-pine-panel/98 backdrop-blur-md border border-pine-border rounded-xl p-2.5 text-[10px] font-mono shadow-modal w-48 space-y-1.5">
            <div className="flex items-center justify-between border-b border-pine-border/60 pb-1">
              <span className="font-bold text-pine-text text-[9px]">Map Legend</span>
              <button onClick={() => setShowLegend(false)} className="text-pine-muted hover:text-pine-text">
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1 text-[9.5px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/60 border border-rose-500 shrink-0" />
                <span>Red Danger Zone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/60 border border-amber-500 shrink-0" />
                <span>Caution Slope Zone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/60 border border-emerald-500 shrink-0" />
                <span>Safe Flatland Zone</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. UNIVERSAL DETAILED MULTI-HAZARD ANALYSIS MODAL */}
      {detailedModalItem && (
        <DetailedAnalysisModal
          item={detailedModalItem}
          onClose={() => setDetailedModalItem(null)}
          onInitiateRelocation={(itm) => {
            if (onOpenDetailedAnalysis) {
              onOpenDetailedAnalysis(itm);
            }
          }}
        />
      )}

    </div>
  );
};
