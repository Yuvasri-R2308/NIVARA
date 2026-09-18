import React, { useEffect, useMemo, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Circle,
  Popup, 
  Polyline, 
  Polygon,
  Marker, 
  useMap,
  useMapEvents,
  ZoomControl 
} from 'react-leaflet';
import L from 'leaflet';
import { Parcel, CandidateSite, RunoutPath, DemSamplePoint } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { DataConfidenceTag } from '../common/DataConfidenceTag';
import { DetailedAnalysisModal } from '../modals/DetailedAnalysisModal';
import { Map3D } from './Map3D';
import { AreaAnalysisPanel3D } from './AreaAnalysisPanel3D';
import { 
  AREA_HAZARD_REGISTRY, 
  SAFE_SITES_REGISTRY, 
  MICRO_CATCHMENTS_DATA, 
  RUNOUT_CORRIDORS_DATA,
  getHazardProfileForLocation,
  AreaHazardProfile
} from '../../data/areaHazardProfiles';
import { 
  detectPeaks, 
  detectLowPoints, 
  TerrainPeak, 
  TerrainLowPoint 
} from '../../services/demService';
import { elevationService } from '../../services/elevationService';
import { 
  Layers, 
  Search, 
  Plus,
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
  FileText,
  MapPin
} from 'lucide-react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

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
  selectedVillage?: string;
  center?: [number, number];
  zoom?: number;
  showRunout?: boolean;
  showSites?: boolean;
  showDemOverlay?: boolean;
  height?: string;
  simulatedMultiplier?: number;
  initialBaseMap?: BaseMapType;
  onOpenDetailedAnalysis?: (item: any) => void;
  transitOrigin?: [number, number];
  transitTarget?: [number, number];
  transitDestinationName?: string;
}

// Tile Layer configurations (100% Free, Open Access, No API Key Required)
const BASE_MAPS = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
    maxNativeZoom: 19
  },
  terrain: {
    name: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 20,
    maxNativeZoom: 14 // Clamped to native zoom 14 so Leaflet oversamples up to 20 without "Map data not yet available"
  },
  dark: {
    name: 'Dark',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Dark Gray Base',
    maxZoom: 20,
    maxNativeZoom: 16
  },
  street: {
    name: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    maxNativeZoom: 19
  }
};

// Stable, smooth Map Viewport Controller preventing shaking and render-loop jitter
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  const lastTargetRef = React.useRef<string>('');

  useEffect(() => {
    const lat = center[0];
    const lng = center[1];
    const targetKey = `${lat.toFixed(5)},${lng.toFixed(5)},${zoom}`;

    if (lastTargetRef.current === targetKey) return;
    lastTargetRef.current = targetKey;

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const latDiff = Math.abs(currentCenter.lat - lat);
    const lngDiff = Math.abs(currentCenter.lng - lng);

    if (latDiff > 0.0005 || lngDiff > 0.0005 || currentZoom !== zoom) {
      map.flyTo([lat, lng], zoom, {
        duration: 0.9,
        easeLinearity: 0.3
      });
    }
  }, [center, zoom, map]);

  return null;
};

// Big Box Ranked Relocation Destination Pin (Only Rank & Name)
const createRankedSiteIcon = (rank: number, siteName: string, capacity: number, ccas: number, isSelected: boolean) => {
  const medalColor = rank === 1 ? '#38bdf8' : rank === 2 ? '#34d399' : rank === 3 ? '#fbbf24' : '#a78bfa';
  const borderGlow = isSelected ? `0 0 24px ${medalColor}` : `0 6px 24px rgba(0,0,0,0.9), 0 0 18px ${medalColor}77`;
  const shortName = siteName.split(' (')[0].split(' - ')[0];

  return L.divIcon({
    className: 'custom-ranked-site-marker',
    html: `
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        transform: translate(-50%, -100%);
        margin-bottom: 8px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(180deg, rgba(8, 24, 18, 0.98) 0%, rgba(5, 15, 11, 0.98) 100%);
        border: 2.5px solid ${medalColor};
        border-radius: 10px;
        padding: 9px 18px;
        box-shadow: ${borderGlow};
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transition: transform 0.16s ease, filter 0.16s ease;
      ">
        <span style="background: ${medalColor}; color: #04100A; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 900; padding: 2px 6px; border-radius: 5px;">
          #${rank}
        </span>
        <span style="
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        ">
          ${shortName}
        </span>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 8px solid ${medalColor};
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Big Box Disaster Epicenter Pin (Only Epicenter Name)
const createRedZoneSourceIcon = () => {
  return L.divIcon({
    className: 'custom-red-zone-marker',
    html: `
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        transform: translate(-50%, -100%);
        margin-bottom: 8px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(180deg, rgba(42, 10, 10, 0.98) 0%, rgba(22, 5, 5, 0.98) 100%);
        border: 2.5px solid #EF4444;
        border-radius: 10px;
        padding: 9px 18px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.9), 0 0 24px rgba(239, 68, 68, 0.8);
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transition: transform 0.16s ease, filter 0.16s ease;
      ">
        <span style="font-size: 18px; line-height: 1;">⚠️</span>
        <span style="
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        ">
          Meppadi Epicenter
        </span>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 8px solid #EF4444;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Big Box Area Location Marker Pin (Only Area Name)
const createTownIcon = (key: string, town?: AreaHazardProfile) => {
  const level = town?.riskLevel || 'LOW';
  const rawName = town?.name ? town.name.split(' (')[0] : key;
  const badgeColor = level === 'HIGH' ? '#EF4444' : level === 'MEDIUM' ? '#F59E0B' : '#10B981';

  return L.divIcon({
    className: 'custom-town-marker',
    html: `
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        transform: translate(-50%, -100%);
        margin-bottom: 8px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(180deg, rgba(14, 26, 20, 0.98) 0%, rgba(7, 15, 11, 0.98) 100%);
        border: 2.5px solid ${badgeColor};
        border-radius: 10px;
        padding: 9px 18px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.9), 0 0 18px ${badgeColor}77;
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transition: transform 0.16s ease, filter 0.16s ease;
      ">
        <span style="width: 11px; height: 11px; border-radius: 50%; background: ${badgeColor}; box-shadow: 0 0 10px ${badgeColor}; flex-shrink: 0;"></span>
        <span style="
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        ">
          ${rawName}
        </span>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 8px solid ${badgeColor};
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Big Box Topographic Peak Pin (Only Peak & Elevation)
const createPeakIcon = (peak: TerrainPeak) => {
  return L.divIcon({
    className: 'custom-dem-peak-marker',
    html: `
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        transform: translate(-50%, -100%);
        margin-bottom: 8px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(180deg, rgba(6, 32, 22, 0.98) 0%, rgba(4, 18, 13, 0.98) 100%);
        border: 2.5px solid #10B981;
        border-radius: 10px;
        padding: 9px 18px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.9), 0 0 18px rgba(16, 185, 129, 0.7);
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transition: transform 0.16s ease, filter 0.16s ease;
      ">
        <span style="color: #34D399; font-size: 18px; font-weight: 900; line-height: 1;">▲</span>
        <span style="
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        ">
          Peak ${peak.elevationM}m
        </span>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 8px solid #10B981;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Big Box Low-Lying Drainage Basin Pin (Only Low & Elevation)
const createLowPointIcon = (low: TerrainLowPoint) => {
  return L.divIcon({
    className: 'custom-dem-low-marker',
    html: `
      <div style="
        position: absolute;
        bottom: 0;
        left: 0;
        transform: translate(-50%, -100%);
        margin-bottom: 8px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(180deg, rgba(6, 26, 42, 0.98) 0%, rgba(4, 15, 25, 0.98) 100%);
        border: 2.5px solid #38BDF8;
        border-radius: 10px;
        padding: 9px 18px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.9), 0 0 18px rgba(56, 189, 248, 0.7);
        cursor: pointer;
        user-select: none;
        white-space: nowrap;
        transition: transform 0.16s ease, filter 0.16s ease;
      ">
        <span style="color: #38BDF8; font-size: 16px; font-weight: 900; line-height: 1;">●</span>
        <span style="
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        ">
          Low ${low.elevationM}m
        </span>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 8px solid #38BDF8;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// Leaflet Map Click Listener to Probe Real DEM Topography & Hazards
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lon: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
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
  selectedVillage,
  center = [11.605, 76.085],
  zoom = 11,
  showRunout = true,
  showSites = true,
  showDemOverlay = false,
  height = '640px',
  simulatedMultiplier = 1.0,
  initialBaseMap = 'satellite',
  onOpenDetailedAnalysis,
  transitOrigin,
  transitTarget,
  transitDestinationName
}) => {
  const [baseMap, setBaseMap] = useState<BaseMapType>(initialBaseMap);
  const [mapMode, setMapMode] = useState<'2D' | '3D'>('2D');
  const [showLegend, setShowLegend] = useState(false);
  const [showHazardHud, setShowHazardHud] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [mapSearch, setMapSearch] = useState('');
  
  // NIVARA 2.0 Layer Toggles
  const [showCatchments, setShowCatchments] = useState<boolean>(true);
  const [showRunoutsLayer, setShowRunoutsLayer] = useState<boolean>(true);
  const [showDownstreamRisk, setShowDownstreamRisk] = useState<boolean>(true);
  
  const cLat = center ? center[0] : 11.554;
  const cLng = center ? center[1] : 76.128;
  const cZoom = zoom || 12;

  // Dedicated map zoom & focus state for one-press zooming
  const [mapFocus, setMapFocus] = useState<{ center: [number, number]; zoom: number }>({
    center: [cLat, cLng],
    zoom: cZoom
  });
  const [searchedEntity, setSearchedEntity] = useState<any | null>(null);

  // Area Intelligence probed on map click or peak/low point selection
  const [inspectedIntel, setInspectedIntel] = useState<any | null>(null);

  // Synchronize DEM Peaks & Low Points for active village
  const currentPeaks = useMemo(() => detectPeaks(selectedVillage || 'ALL'), [selectedVillage]);
  const currentLowPoints = useMemo(() => detectLowPoints(selectedVillage || 'ALL'), [selectedVillage]);

  // Handle map click probe using real DEM service
  const handle2DMapClick = async (lat: number, lon: number) => {
    try {
      const demData = await elevationService.lookupElevation(lat, lon);
      const elev = demData.elevation_m ?? 800;
      const slope = demData.slope_deg ?? 12;
      const slopeClass = demData.slope_class;

      let landslideStatus = 'MODERATE';
      let floodStatus = 'LOW';
      if (slope > 30) landslideStatus = 'HIGH';
      else if (slope < 10) landslideStatus = 'LOW';

      if (elev < 760 && slope < 8) floodStatus = 'HIGH';
      else if (elev < 820 && slope < 15) floodStatus = 'MODERATE';

      setInspectedIntel({
        isAreaIntel: true,
        lat,
        lon,
        locationName: `DEM Coordinate Probe (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`,
        elevation_m: elev,
        slope_deg: slope,
        slope_class: slopeClass,
        floodStatus,
        landslideStatus,
        rainfall_24h: Math.round(186 * simulatedMultiplier),
        extrusionStatus: 'ACTIVE',
        extrusionHeight: Math.round(elev * 0.25),
        primaryHazard: slope > 25 ? 'Landslide Runout' : elev < 760 ? 'Inundation' : 'Topographic Slope'
      });
    } catch (err) {
      console.error('Elevation lookup error:', err);
    }
  };

  // Synchronize ONLY when center coordinates or zoom numbers actually change
  useEffect(() => {
    setMapFocus(prev => {
      if (Math.abs(prev.center[0] - cLat) < 0.0001 && Math.abs(prev.center[1] - cLng) < 0.0001 && prev.zoom === cZoom) {
        return prev;
      }
      return { center: [cLat, cLng], zoom: cZoom };
    });
  }, [cLat, cLng, cZoom]);

  // Interactive full detail modal
  const [detailedModalItem, setDetailedModalItem] = useState<any | null>(null);

  // In one press of + symbol, search and zoom directly to the specified city/area
  const handleZoomToSearchedCity = () => {
    const q = mapSearch.trim().toLowerCase();
    if (!q) return;

    // 1. Check all towns/villages in AREA_HAZARD_REGISTRY (Achooranam, Meppadi, Kottathara, Kuppadithara, Kalpetta, Vythiri, Mananthavady, Sulthan Bathery, Padinharethara, Pozhuthana)
    for (const [key, town] of Object.entries(AREA_HAZARD_REGISTRY)) {
      if (key.toLowerCase().includes(q) || town.name.toLowerCase().includes(q)) {
        setMapFocus({ center: town.coordinates, zoom: 15 });
        setSearchedEntity(town);
        setDetailedModalItem(town);
        return;
      }
    }

    // 2. Check all resettlement zones in SAFE_SITES_REGISTRY
    for (const [key, site] of Object.entries(SAFE_SITES_REGISTRY)) {
      if (key.toLowerCase().includes(q) || site.name.toLowerCase().includes(q) || (site.village && site.village.toLowerCase().includes(q))) {
        const lat = site.coordinates[0];
        const lon = site.coordinates[1];
        setMapFocus({ center: [lat, lon], zoom: 15 });
        setSearchedEntity(site);
        setDetailedModalItem(site);
        return;
      }
    }

    // 3. Check Cadastral Parcels
    const matchedP = parcels.find(p => 
      p.parcel_id.toLowerCase().includes(q) || 
      p.village.toLowerCase().includes(q) || 
      p.survey_no.toLowerCase().includes(q)
    );
    if (matchedP) {
      setMapFocus({ center: [matchedP.latitude, matchedP.longitude], zoom: 16 });
      setSearchedEntity(matchedP);
      if (onSelectParcel) onSelectParcel(matchedP);
      setDetailedModalItem(matchedP);
      return;
    }
  };

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

  // NIVARA 3D TERRAIN MODE
  if (mapMode === '3D') {
    return (
      <Map3D
        parcels={parcels}
        candidateSites={candidateSites}
        runoutPaths={runoutPaths}
        demPoints={demPoints}
        selectedParcel={selectedParcel}
        onSelectParcel={onSelectParcel}
        selectedSite={selectedSite}
        onSelectSite={onSelectSite}
        selectedVillage={selectedVillage}
        center={mapFocus.center}
        zoom={mapFocus.zoom}
        showRunout={showRunoutsLayer}
        showSites={showSites}
        showDemOverlay={showDemOverlay}
        height={height}
        simulatedMultiplier={simulatedMultiplier}
        onOpenDetailedAnalysis={onOpenDetailedAnalysis}
        onToggleMapMode={(m) => setMapMode(m)}
        transitOrigin={transitOrigin}
        transitTarget={transitTarget}
        transitDestinationName={transitDestinationName}
      />
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-pine-border bg-pine-bg shadow-panel group">
      
      {/* 1. TOP IN-MAP CONTROLS BAR */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[1000] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Search with dedicated [+] symbol for one-press zooming */}
        <div className="pointer-events-auto flex items-center bg-[#07110C]/98 backdrop-blur-md rounded-lg border border-emerald-600/80 shadow-2xl overflow-hidden w-full sm:w-80">
          <div className="relative flex-1 flex items-center">
            <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search area (e.g. Achooranam, Meppadi)..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleZoomToSearchedCity();
              }}
              className="w-full bg-transparent pl-8 pr-2 py-1.5 text-xs font-mono text-white placeholder:text-pine-muted/70 focus:outline-none"
            />
            {mapSearch && (
              <button
                onClick={() => {
                  setMapSearch('');
                  setSearchedEntity(null);
                }}
                className="text-pine-muted hover:text-white p-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* One-Press [+] Symbol: Zooms & Specifies the Searched City in the Map */}
          <button
            onClick={handleZoomToSearchedCity}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all border-l border-emerald-500 shadow-md cursor-pointer group"
            title="Press + to zoom to and specify the searched city on the map"
          >
            <Plus className="w-4 h-4 text-white stroke-[3] group-hover:scale-125 transition-transform" />
          </button>
        </div>

        {/* Right: Map Type Switchers & 2D/3D Mode Toggle */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-pine-bg/95 backdrop-blur-md p-1 rounded-lg border border-pine-border shadow-panel">
          
          {/* PRIMARY DUAL-MAP MODE TOGGLE [ 2D GIS ] [ 3D TERRAIN ] */}
          <div className="flex items-center p-0.5 bg-black/40 rounded-lg border border-cyan-500/30">
            <button
              onClick={() => setMapMode('2D')}
              className="px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border border-emerald-400/40"
              title="2D GIS Leaflet Map (Active)"
            >
              <Layers className="w-3 h-3" />
              <span>2D GIS</span>
            </button>
            <button
              onClick={() => setMapMode('3D')}
              className="px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer text-pine-muted hover:text-cyan-300 hover:bg-white/5"
              title="Switch to Interactive 3D WebGL Digital Elevation Model (DEM)"
            >
              <Mountain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-cyan-200">3D TERRAIN</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-pine-border/60 mx-0.5 hidden sm:block" />

          {/* Base Layer Switcher Pills */}
          {(['satellite', 'terrain', 'dark', 'street'] as BaseMapType[]).map((type) => {
            const isActive = baseMap === type;
            return (
              <button
                key={type}
                onClick={() => setBaseMap(type)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono capitalize transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white font-bold shadow-sm'
                    : 'text-pine-muted hover:text-pine-text hover:bg-pine-elevated'
                }`}
              >
                {type}
              </button>
            );
          })}

          {/* NIVARA 2.0 Layer Toggles */}
          <div className="flex items-center gap-1 pl-1 border-l border-pine-border">
            <button
              onClick={() => setShowRunoutsLayer(!showRunoutsLayer)}
              className={`px-2 py-1 rounded text-[10.5px] font-mono transition-all cursor-pointer ${
                showRunoutsLayer ? 'bg-rose-800 text-rose-200 font-bold shadow-sm' : 'text-pine-muted hover:text-white'
              }`}
              title="Toggle Landslide Debris Runout Corridors"
            >
              ⚠️ Runouts
            </button>
          </div>

        </div>

      </div>

      {/* 2. LEAFLET MAP CONTAINER */}
      <MapContainer
        center={mapFocus.center}
        zoom={mapFocus.zoom}
        zoomControl={false}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
        preferCanvas={true}
      >
        <ZoomControl position="bottomright" />
        <MapViewController center={mapFocus.center} zoom={mapFocus.zoom} />
        <MapClickHandler onMapClick={handle2DMapClick} />

        <TileLayer
          key={baseMap}
          attribution={activeTileConfig.attribution}
          url={activeTileConfig.url}
          maxZoom={activeTileConfig.maxZoom}
          maxNativeZoom={activeTileConfig.maxNativeZoom}
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

        {/* Glowing Target Ring around Searched Entity */}
        {searchedEntity && (
          <Circle
            center={searchedEntity.coordinates || [searchedEntity.latitude, searchedEntity.longitude]}
            radius={1200}
            pathOptions={{
              color: '#10B981',
              fillColor: '#10B981',
              fillOpacity: 0.25,
              weight: 3,
              dashArray: '6 6'
            }}
          />
        )}

        {/* 3. ALL TOWNS & CITIES PINS */}
        {Object.entries(AREA_HAZARD_REGISTRY).map(([key, town]) => {
          if (key === 'Wayanad') return null; // Avoid duplicate district marker overlapping Kalpetta
          return (
            <Marker
              key={key}
              position={town.coordinates}
              icon={key === 'Meppadi' ? createRedZoneSourceIcon() : createTownIcon(key, town)}
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
                  <ConfidenceBadge maturity_mode="autonomous" maturity_index={78} />
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
          );
        })}

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
                  <ConfidenceBadge maturity_mode="autonomous" maturity_index={78} />
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

        {/* 6. SCREENED CANDIDATE RELOCATION SITES (Ranked 1, 2, 3, 4, 5) */}
        {showSites && candidateSites.map((site: any, index: number) => {
          const rank = index + 1;
          const siteId = site.site_id || site.siteId || `site-${index}`;
          const isSelected = (selectedSite as any)?.site_id === siteId || (selectedSite as any)?.siteId === siteId;
          const siteProfile = SAFE_SITES_REGISTRY[siteId] || site;

          const lat = site.latitude ?? (Array.isArray(site.coordinates) ? site.coordinates[0] : siteProfile?.coordinates?.[0]);
          const lon = site.longitude ?? (Array.isArray(site.coordinates) ? site.coordinates[1] : siteProfile?.coordinates?.[1]);

          if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
            return null;
          }

          const name = site.name || siteProfile.name || `Safe Zone ${rank}`;
          const capacityPersons = site.capacity_persons ?? site.capacityPersons ?? siteProfile.capacityPersons ?? 1000;
          const ccasScore = site.ccas_score ?? site.ccasScore ?? siteProfile.ccasScore ?? 85;

          return (
            <Marker
              key={siteId}
              position={[lat, lon]}
              icon={createRankedSiteIcon(rank, name, capacityPersons, ccasScore, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectSite) onSelectSite(site);
                  setDetailedModalItem(siteProfile);
                }
              }}
            />
          );
        })}

        {/* 7. ACTIVE TRANSIT CORRIDOR: MEPPADI EPICENTER -> CHOSEN PLACE */}
        {(() => {
          const originCoord: [number, number] = transitOrigin 
            || (selectedParcel ? [selectedParcel.latitude, selectedParcel.longitude] : [11.554, 76.128]); // Meppadi Epicenter

          let targetLat: number | null = null;
          let targetLon: number | null = null;
          let destLabel = transitDestinationName || '';

          if (transitTarget) {
            targetLat = transitTarget[0];
            targetLon = transitTarget[1];
          } else if (selectedSite) {
            const selSite: any = selectedSite;
            targetLat = selSite.latitude ?? (Array.isArray(selSite.coordinates) ? selSite.coordinates[0] : null);
            targetLon = selSite.longitude ?? (Array.isArray(selSite.coordinates) ? selSite.coordinates[1] : null);
            if (!destLabel) destLabel = selSite.name?.split('(')[0]?.trim() || 'Safe Zone';
          } else if (selectedVillage && AREA_HAZARD_REGISTRY[selectedVillage]) {
            targetLat = AREA_HAZARD_REGISTRY[selectedVillage].coordinates[0];
            targetLon = AREA_HAZARD_REGISTRY[selectedVillage].coordinates[1];
            if (!destLabel) destLabel = AREA_HAZARD_REGISTRY[selectedVillage].name;
          }

          if (targetLat === null || targetLon === null) return null;

          // Build transit corridor positions
          const pts: [number, number][] = [originCoord];

          // Intermediate waypoint if village is selected and geographically distinct
          if (selectedVillage && selectedVillage !== 'Meppadi' && selectedVillage !== 'ALL' && AREA_HAZARD_REGISTRY[selectedVillage]) {
            const vCoord = AREA_HAZARD_REGISTRY[selectedVillage].coordinates;
            const distOrigin = Math.hypot(vCoord[0] - originCoord[0], vCoord[1] - originCoord[1]);
            const distTarget = Math.hypot(vCoord[0] - targetLat, vCoord[1] - targetLon);
            if (distOrigin > 0.008 && distTarget > 0.008) {
              pts.push(vCoord);
            }
          }

          pts.push([targetLat, targetLon]);

          const keySuffix = pts.map(p => `${p[0].toFixed(4)}_${p[1].toFixed(4)}`).join('-');

          // Calculate transit distance in km
          const pStart = pts[0];
          const pEnd = pts[pts.length - 1];
          const rad = Math.PI / 180;
          const dLat = (pEnd[0] - pStart[0]) * rad;
          const dLon = (pEnd[1] - pStart[1]) * rad;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(pStart[0] * rad) * Math.cos(pEnd[0] * rad) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const transitDistKm = Math.round(6371 * c * 1.35 * 10) / 10;
          const midLat = (pStart[0] + pEnd[0]) / 2;
          const midLon = (pStart[1] + pEnd[1]) / 2;

          return (
            <React.Fragment key={`transit-corridor-wrapper-${keySuffix}`}>
              {/* 1. Deep Black Backing Shadow Stroke for Razor-Sharp Visibility */}
              <Polyline
                key={`transit-bg-${keySuffix}`}
                positions={pts}
                pathOptions={{
                  color: '#000000',
                  weight: 8,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />

              {/* 2. Deep Cyan Glow Casing */}
              <Polyline
                key={`transit-casing-${keySuffix}`}
                positions={pts}
                pathOptions={{
                  color: '#0284c7',
                  weight: 5,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />

              {/* 3. Bright Cyan Neon Dashed Active Transit Line */}
              <Polyline
                key={`transit-fg-${keySuffix}`}
                positions={pts}
                pathOptions={{
                  color: '#38bdf8',
                  weight: 3.5,
                  dashArray: '8 8',
                  opacity: 1.0,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />

              {/* 4. Midpoint Floating Convoy Route Badge */}
              {transitDistKm > 0.5 && (
                <Marker
                  key={`midpoint-${keySuffix}`}
                  position={[midLat, midLon]}
                  icon={L.divIcon({
                    className: 'transit-corridor-badge',
                    html: `
                      <div style="
                        background: linear-gradient(135deg, rgba(7, 26, 18, 0.98) 0%, rgba(3, 15, 10, 0.98) 100%);
                        border: 1.5px solid #38BDF8;
                        border-radius: 9999px;
                        padding: 3px 10px;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        box-shadow: 0 4px 16px rgba(0,0,0,0.85), 0 0 12px rgba(56, 189, 248, 0.5);
                        transform: translate(-50%, -50%);
                        white-space: nowrap;
                        pointer-events: none;
                      ">
                        <span style="font-size: 11px;">🛣️</span>
                        <span style="
                          font-family: 'Space Grotesk', monospace, sans-serif;
                          font-size: 10px;
                          font-weight: 800;
                          color: #38BDF8;
                          letter-spacing: 0.02em;
                        ">
                          CONVOY TRANSIT &bull; ${transitDistKm} KM
                        </span>
                      </div>
                    `,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                  })}
                />
              )}

              {/* 5. Destination Endpoint Indicator */}
              <Marker
                key={`dest-endpoint-${keySuffix}`}
                position={[targetLat, targetLon]}
                icon={L.divIcon({
                  className: 'transit-destination-endpoint',
                  html: `
                    <div style="
                      position: absolute;
                      bottom: 0;
                      left: 0;
                      transform: translate(-50%, -100%);
                      margin-bottom: 28px;
                      background: linear-gradient(135deg, rgba(6, 78, 59, 0.98) 0%, rgba(2, 44, 34, 0.98) 100%);
                      border: 2px solid #34D399;
                      border-radius: 8px;
                      padding: 4px 10px;
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      box-shadow: 0 6px 20px rgba(0,0,0,0.9), 0 0 16px rgba(52, 211, 153, 0.6);
                      white-space: nowrap;
                      pointer-events: none;
                    ">
                      <span style="color: #34D399; font-size: 13px;">📍</span>
                      <span style="
                        font-family: 'Space Grotesk', sans-serif;
                        font-size: 11px;
                        font-weight: 800;
                        color: #FFFFFF;
                      ">
                        DESTINATION: ${destLabel || 'Safe Zone'}
                      </span>
                      <div style="
                        position: absolute;
                        bottom: -6px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 0;
                        height: 0;
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-top: 6px solid #34D399;
                      "></div>
                    </div>
                  `,
                  iconSize: [0, 0],
                  iconAnchor: [0, 0]
                })}
              />
            </React.Fragment>
          );
        })()}

        {/* 8. TOPOGRAPHIC PEAKS (▲ Peak [elev] m) */}
        {currentPeaks.map((peak) => (
          <Marker
            key={peak.id}
            position={[peak.lat, peak.lng]}
            icon={createPeakIcon(peak)}
            eventHandlers={{
              click: () => setInspectedIntel(peak)
            }}
          />
        ))}

        {/* 9. TOPOGRAPHIC LOW POINTS / DRAINAGE BASINS (● Low Point [elev] m) */}
        {currentLowPoints.map((low) => (
          <Marker
            key={low.id}
            position={[low.lat, low.lng]}
            icon={createLowPointIcon(low)}
            eventHandlers={{
              click: () => setInspectedIntel(low)
            }}
          />
        ))}

      </MapContainer>

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
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60 border border-rose-500 shrink-0" />
                <span>High Hazard Epicenter (Red Zone)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60 border border-amber-500 shrink-0" />
                <span>Warning Buffer Zone (5km)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/60 border border-emerald-500 shrink-0" />
                <span>Safe Resettlement Site (#1–#5)</span>
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

      {/* 6. REAL DEM AREA INTELLIGENCE PANEL (Probed on map click or peak/low point selection) */}
      {inspectedIntel && (
        <div className="absolute top-16 right-4 z-[1000] pointer-events-auto max-w-sm">
          <AreaAnalysisPanel3D
            selectedItem={inspectedIntel}
            onClose={() => setInspectedIntel(null)}
            simulatedMultiplier={simulatedMultiplier}
          />
        </div>
      )}

    </div>
  );
};
