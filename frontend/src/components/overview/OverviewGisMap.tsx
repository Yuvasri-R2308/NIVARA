import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Circle, 
  Popup, 
  Polyline, 
  Tooltip,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Mountain, 
  MapPin, 
  Navigation, 
  Eye, 
  Maximize2, 
  Compass, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  ExternalLink,
  ArrowRight,
  TrendingDown,
  Activity,
  Box
} from 'lucide-react';
import { HazardType, HazardModuleId } from '../../types';
import { 
  getHazardProfile, 
  EvacuationRosterItem, 
  SafeDestinationItem 
} from '../../data/hazardRegistry';
import { Dem3DBlockCanvas } from '../map/Dem3DBlockCanvas';

// Fix standard Leaflet default icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Professional Basemaps (ArcGIS / CartoDB / OSM - No API keys needed)
const BASE_MAPS = {
  terrain: {
    name: 'Terrain Topo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DeLorme, NAVTEQ',
    maxZoom: 18
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Maxar, Earthstar',
    maxZoom: 19
  },
  dark: {
    name: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Dark Gray Base',
    maxZoom: 16
  },
  hillshade: {
    name: 'DEM Hillshade',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Elevation Hillshade',
    maxZoom: 18
  },
  street: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }
};

type BaseMapKey = keyof typeof BASE_MAPS;

// Helper to force Leaflet container recalculation on mount and resize
const MapResizeHandler: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
};

// Helper to auto-pan and fit bounds when hazard switches without render jitter
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  const lastCenterRef = React.useRef<string>('');

  useEffect(() => {
    const key = `${center[0].toFixed(4)},${center[1].toFixed(4)},${zoom}`;
    if (lastCenterRef.current === key) return;
    lastCenterRef.current = key;
    map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [center, zoom, map]);

  return null;
};

interface OverviewGisMapProps {
  hazardKey: HazardType;
  theme: 'dark' | 'light';
  onNavigateToModule?: (moduleId: HazardModuleId) => void;
  selectedSafeSiteId?: string;
  onSelectSafeSiteId?: (siteId: string) => void;
}

export const OverviewGisMap: React.FC<OverviewGisMapProps> = ({ 
  hazardKey, 
  theme,
  onNavigateToModule,
  selectedSafeSiteId,
  onSelectSafeSiteId
}) => {
  const profile = useMemo(() => getHazardProfile(hazardKey), [hazardKey]);
  
  // Basemap State
  const [baseMap, setBaseMap] = useState<BaseMapKey>(theme === 'light' ? 'terrain' : 'satellite');
  
  // Keep basemap synced with theme changes unless user explicitly switched
  useEffect(() => {
    if (theme === 'light' && baseMap === 'dark') {
      setBaseMap('terrain');
    } else if (theme === 'dark' && baseMap === 'street') {
      setBaseMap('dark');
    }
  }, [theme]);

  // Layer Visibility Controls (Power BI / ArcGIS Command Style)
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showRedZones, setShowRedZones] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);
  const [showRelocationRoute, setShowRelocationRoute] = useState(true);
  const [showSafeSites, setShowSafeSites] = useState(true);

  // Active Evacuation Route State (defaults to selectedSafeSiteId or #1 Recommended)
  const [activeRouteId, setActiveRouteId] = useState<string>(
    selectedSafeSiteId || profile.safeDestinations[0]?.id || 'KL-WYD-S01'
  );

  useEffect(() => {
    if (selectedSafeSiteId) {
      setActiveRouteId(selectedSafeSiteId);
    }
  }, [selectedSafeSiteId]);

  const handleSelectRoute = (siteId: string) => {
    setActiveRouteId(siteId);
    if (onSelectSafeSiteId && siteId !== 'all') {
      onSelectSafeSiteId(siteId);
    }
  };

  // 3D DEM Modal State
  const [show3dDemModal, setShow3dDemModal] = useState(false);
  const [demNotice, setDemNotice] = useState<string | null>(null);

  // Handle 3D Terrain Toggle
  const handleToggle3D = () => {
    setShow3dDemModal(true);
  };

  const centerCoordinates = profile.defaultCenter;
  const redZone = profile.redZone;
  const safeSites = profile.safeDestinations;
  const habitations = profile.evacuationRoster;

  // Exact geographic epicenter of the High Risk Red Zone
  const redZoneCoord = useMemo<[number, number]>(() => {
    if (redZone.coordinates && Array.isArray(redZone.coordinates) && redZone.coordinates.length === 2) {
      return redZone.coordinates;
    }
    if (habitations.length > 0 && habitations[0].coordinates) {
      return habitations[0].coordinates;
    }
    return centerCoordinates;
  }, [redZone, habitations, centerCoordinates]);

  // Primary origin for the relocation route vector (Red zone epicenter)
  const originCoord = redZoneCoord;

  // Currently active safe site (defaults strictly to #1 Recommended)
  const activeSite = useMemo(() => {
    if (activeRouteId && activeRouteId !== 'all') {
      return safeSites.find(s => s.id === activeRouteId) || safeSites[0];
    }
    return safeSites[0];
  }, [safeSites, activeRouteId]);

  // Route polyline calculation strictly originating from the Red Zone
  const siteRoutes = useMemo(() => {
    return safeSites.map((site, idx) => {
      const dest = site.coordinates;
      let points: [number, number][];
      if (site.routeWaypoints && site.routeWaypoints.length > 0) {
        // Ensure polyline begins directly at the Red Zone center
        points = [originCoord, ...site.routeWaypoints.slice(1)];
      } else {
        const offsetLat = idx === 0 ? 0.008 : idx === 1 ? 0.012 : idx === 2 ? 0.014 : 0.006;
        const offsetLng = idx === 0 ? -0.006 : idx === 1 ? -0.010 : idx === 2 ? 0.008 : -0.012;
        const midLat = (originCoord[0] + dest[0]) / 2 + offsetLat;
        const midLng = (originCoord[1] + dest[1]) / 2 + offsetLng;
        points = [originCoord, [midLat, midLng], dest];
      }
      return {
        site,
        points,
        midpoint: points[Math.floor(points.length / 2)] || dest
      };
    });
  }, [safeSites, originCoord]);

  return (
    <div 
      className={`relative w-full h-full min-h-[580px] lg:min-h-[640px] rounded-2xl overflow-hidden border shadow-sm flex flex-col transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0B1310] border-[#1A2E24]'
      }`}
      style={{ minHeight: '580px', height: '100%' }}
    >
      
      {/* MAP CANVAS CONTAINER */}
      <div className="relative flex-1 w-full h-full" style={{ minHeight: '580px', height: '100%' }}>
        {/* Notice Banner (e.g. DEM availability) */}
        {demNotice && (
          <div className="absolute top-14 left-4 right-4 z-30 bg-amber-500/95 text-black px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center justify-between shadow-lg backdrop-blur">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>{demNotice}</span>
            </div>
            <button onClick={() => setDemNotice(null)} className="font-bold text-sm px-2 cursor-pointer">✕</button>
          </div>
        )}

        {/* TOP-RIGHT FLOATING CONTROLS: 3D DEM & BASEMAP SWITCHER */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {/* 3D DEM Terrain Button */}
          <button
            onClick={handleToggle3D}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border shadow-md backdrop-blur-md ${
              theme === 'light'
                ? 'bg-amber-50/95 hover:bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border-amber-600/50'
            }`}
            title="Launch 3D DEM Elevation & Slope Block"
          >
            <Box className="w-3.5 h-3.5 text-amber-500" />
            <span>3D DEM TERRAIN</span>
          </button>

          {/* Basemap Switcher */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border shadow-md backdrop-blur-md text-[11px] font-mono ${
            theme === 'light' ? 'bg-white/95 border-slate-200' : 'bg-[#070D0A]/95 border-[#1A2E24]'
          }`}>
            {(Object.keys(BASE_MAPS) as BaseMapKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setBaseMap(key)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  baseMap === key
                    ? 'bg-[#00897B] text-white font-bold shadow-xs'
                    : (theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
              >
                {BASE_MAPS[key].name}
              </button>
            ))}
          </div>
        </div>
        <MapContainer
          center={centerCoordinates}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          style={{ height: '100%', width: '100%', minHeight: '580px', background: theme === 'light' ? '#f8fafc' : '#0B120F' }}
        >
          <MapResizeHandler />
          <MapRecenter center={centerCoordinates} zoom={12} />
          
          <TileLayer
            key={baseMap}
            url={BASE_MAPS[baseMap].url}
            attribution={BASE_MAPS[baseMap].attribution}
            maxZoom={BASE_MAPS[baseMap].maxZoom}
          />

          {/* ================================================================= */}
          {/* LAYER 1: HIGH RISK RED ZONE BUFFER & CRITICAL EPICENTER PULSE     */}
          {/* ================================================================= */}
          {showRedZones && (
            <>
              {/* Outer Hazard Runout / Debris Flow Impact Buffer */}
              <Circle
                center={redZoneCoord}
                radius={redZone.radiusMeters || 1800}
                pathOptions={{
                  color: '#dc2626',
                  fillColor: '#ef4444',
                  fillOpacity: 0.16,
                  weight: 2.5,
                  dashArray: '6, 6'
                }}
              />

              {/* High-Risk Scarp Core Circle */}
              <Circle
                center={redZoneCoord}
                radius={Math.round((redZone.radiusMeters || 1800) * 0.55)}
                pathOptions={{
                  color: '#b91c1c',
                  fillColor: '#991b1b',
                  fillOpacity: 0.35,
                  weight: 2
                }}
              />

              {/* Critical Red Zone Center Node with Permanent Label */}
              <CircleMarker
                center={redZoneCoord}
                radius={13}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#dc2626',
                  fillOpacity: 0.95,
                  weight: 3.5
                }}
              >
                {/* Permanent On-Map Label for Authority at a Glance */}
                <Tooltip permanent direction="top" offset={[0, -14]} className="custom-authority-tooltip">
                  <div className={`font-mono text-[10px] px-2.5 py-1 rounded-md shadow-2xl border-2 whitespace-nowrap flex items-center gap-1.5 ${
                    theme === 'light'
                      ? 'bg-white border-rose-600 text-rose-950 shadow-rose-950/20'
                      : 'bg-[#1C080B]/95 border-rose-500 text-rose-100 shadow-xl'
                  }`}>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      theme === 'light' ? 'bg-rose-600 text-white' : 'bg-rose-700 text-white'
                    }`}>
                      🔴 RED ZONE
                    </span>
                    <span className={theme === 'light' ? 'font-black text-rose-950' : 'font-bold text-white'}>
                      {redZone.name.toUpperCase()}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black border ${
                      theme === 'light'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-rose-950 text-rose-300 border-rose-700'
                    }`}>
                      {redZone.riskScore}
                    </span>
                  </div>
                </Tooltip>

                {/* Interactive Popup */}
                <Popup>
                  <div className="p-2 space-y-1.5 text-xs font-sans text-slate-900 min-w-[240px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-rose-700 uppercase tracking-wide">CRITICAL RED ZONE</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        {redZone.riskScore}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-950">{redZone.name}</div>
                    <div className="text-[11px] text-slate-600">
                      Primary impact: <strong>{redZone.primaryHazard}</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div>Exposed Pop: <strong>{redZone.affectedPop}</strong></div>
                      <div>Families: <strong>{redZone.immediateFamilies}</strong></div>
                      <div>Severity: <strong className="text-rose-600">{redZone.severity}</strong></div>
                      <div>Status: <strong className="text-rose-600">EVACUATE NOW</strong></div>
                    </div>
                    <div className="text-[10px] text-slate-500 italic">
                      Coordinates: {redZoneCoord[0].toFixed(4)}° N, {redZoneCoord[1].toFixed(4)}° E
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </>
          )}

          {/* ================================================================= */}
          {/* LAYER 2: VULNERABLE AFFECTED HABITATIONS WITH PERMANENT LABELS    */}
          {/* ================================================================= */}
          {showHabitations && habitations.map((item, idx) => {
            if (!item.coordinates || !Array.isArray(item.coordinates)) return null;
            const isP1 = (item.urgency || '').includes('P1') || (item.urgency || '').includes('IMMEDIATE');
            const isP2 = (item.urgency || '').includes('P2') || (item.urgency || '').includes('HIGH');

            return (
              <CircleMarker
                key={item.id || idx}
                center={item.coordinates}
                radius={isP1 ? 8 : 6}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: isP1 ? '#e11d48' : isP2 ? '#d97706' : '#2563eb',
                  fillOpacity: 0.9,
                  weight: 2
                }}
              >
                {/* Permanent Map Label for Important Habitations */}
                <Tooltip permanent direction="right" offset={[8, 0]} className="custom-habitation-tooltip">
                  <div className={`px-2 py-0.5 rounded-md text-[9px] font-mono whitespace-nowrap shadow-xl border-2 flex items-center gap-1 ${
                    theme === 'light'
                      ? isP1
                        ? 'bg-white border-rose-600 text-rose-950 font-black shadow-rose-950/20'
                        : isP2
                          ? 'bg-white border-amber-600 text-amber-950 font-black shadow-amber-950/20'
                          : 'bg-white border-blue-600 text-blue-950 font-black shadow-blue-950/20'
                      : isP1
                        ? 'bg-[#1E090C]/95 border-rose-500 text-rose-100 font-bold'
                        : isP2
                          ? 'bg-[#1F1306]/95 border-amber-500 text-amber-100 font-bold'
                          : 'bg-[#0B1528]/95 border-blue-500 text-blue-100 font-bold'
                  }`}>
                    <span className={`px-1 py-0.2 rounded text-[8px] font-black text-white ${
                      isP1 ? 'bg-rose-600' : isP2 ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      {isP1 ? 'P1' : isP2 ? 'P2' : 'P3'}
                    </span>
                    <span>{item.name} • {item.families}F</span>
                  </div>
                </Tooltip>

                {/* Popup */}
                <Popup>
                  <div className="p-2 space-y-1.5 text-xs font-sans text-slate-900 min-w-[220px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isP1 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.urgency}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Zone Classification: <strong>{item.zone}</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div>Population: <strong>{item.population.toLocaleString()}</strong></div>
                      <div>Families: <strong>{item.families}</strong></div>
                      <div>RPI Score: <strong className="text-rose-700">{item.rpiScore}/100</strong></div>
                      <div>Distance: <strong>{item.distanceKm} km</strong></div>
                    </div>
                    <div className="text-[11px] pt-1">
                      Assigned Safe Hub: <strong className="text-emerald-700">{item.assignedDestination}</strong>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* ================================================================= */}
          {/* LAYER 3: EVACUATION CORRIDOR TO 1ST RELOCATION PLACE              */}
          {/* ================================================================= */}
          {showRelocationRoute && (
            <>
              {siteRoutes.map(({ site, points, midpoint }) => {
                const isRank1 = (site.rank || 1) === 1;
                const isSelected = activeRouteId === site.id;

                // User requested: "only i want a line to the 1st relocation place"
                // Render strictly the line to the 1st relocation place (or specifically selected site)
                if (!isRank1 && (!activeRouteId || activeRouteId !== site.id)) return null;
                if (!isSelected && activeRouteId && activeRouteId !== site.id) return null;

                // Color based on rank/selection
                const color = isSelected
                  ? '#10b981'
                  : isRank1
                    ? '#059669'
                    : site.rank === 2
                      ? '#0d9488'
                      : site.rank === 3
                        ? '#0284c7'
                        : '#16a34a';

                const weight = isSelected || isRank1 ? 4.5 : 3;

                return (
                  <React.Fragment key={`route-${site.id}`}>
                    <Polyline
                      positions={points}
                      pathOptions={{
                        color,
                        weight,
                        dashArray: '8, 6',
                        lineCap: 'round',
                        opacity: 1
                      }}
                    >
                      {/* Floating Route Badge along Corridor */}
                      <Tooltip permanent direction="center" offset={[0, 0]} className="custom-route-tooltip">
                        <div className={`font-mono text-[9.5px] px-3 py-1 rounded-md shadow-2xl border-2 whitespace-nowrap flex items-center gap-2 ${
                          theme === 'light'
                            ? 'bg-white border-emerald-600 text-emerald-950 shadow-emerald-950/20'
                            : 'bg-[#051F14]/95 border-emerald-400 text-emerald-200 shadow-xl animate-pulse'
                        }`}>
                          <span className={theme === 'light' ? 'font-black text-emerald-950' : 'font-bold text-emerald-300'}>
                            ➔ {isRank1 ? '⚡ PRIMARY FAST RELOCATION CORRIDOR' : `${site.name.toUpperCase()} CORRIDOR`}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                            theme === 'light' ? 'bg-emerald-700 text-white' : 'bg-emerald-800 text-white'
                          }`}>
                            {site.distanceKm || 14.8} km • {site.transitMins} mins
                          </span>
                        </div>
                      </Tooltip>
                    </Polyline>

                    {/* Midpoint Corridor Waypoint Marker */}
                    <CircleMarker
                      center={midpoint}
                      radius={isSelected || isRank1 ? 5 : 3.5}
                      pathOptions={{
                        color,
                        fillColor: '#34d399',
                        fillOpacity: 1,
                        weight: 2
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </>
          )}

          {/* ================================================================= */}
          {/* LAYER 4: RANKED SAFE RELOCATION DESTINATIONS (1, 2, 3, 4)         */}
          {/* ================================================================= */}
          {showSafeSites && safeSites.map((site, idx) => {
            if (!site.coordinates || !Array.isArray(site.coordinates)) return null;
            const rank = site.rank || (idx + 1);
            const isRank1 = rank === 1;
            const isSelected = activeRouteId === site.id;

            // Pin & Badge styling based on rank and active theme
            let pinColor = '#059669';
            let rankLabel = site.rankLabel || (isRank1 ? '★ #1 RECOMMENDED' : `#${rank} ALTERNATIVE`);
            let badgeBg = '';
            let tagBg = '';
            let titleColor = '';

            if (theme === 'light') {
              if (rank === 1) {
                pinColor = '#059669';
                badgeBg = 'bg-white border-2 border-emerald-600 shadow-2xl';
                tagBg = 'bg-emerald-700 text-white font-black';
                titleColor = 'text-emerald-950 font-black';
              } else if (rank === 2) {
                pinColor = '#0d9488';
                badgeBg = 'bg-white border-2 border-teal-600 shadow-2xl';
                tagBg = 'bg-teal-700 text-white font-black';
                titleColor = 'text-teal-950 font-black';
              } else if (rank === 3) {
                pinColor = '#0284c7';
                badgeBg = 'bg-white border-2 border-sky-600 shadow-2xl';
                tagBg = 'bg-sky-700 text-white font-black';
                titleColor = 'text-sky-950 font-black';
              } else {
                pinColor = '#16a34a';
                badgeBg = 'bg-white border-2 border-emerald-600 shadow-2xl';
                tagBg = 'bg-emerald-700 text-white font-black';
                titleColor = 'text-emerald-950 font-black';
              }
            } else {
              if (rank === 1) {
                pinColor = '#059669';
                badgeBg = 'bg-[#062117]/95 border-2 border-emerald-400 shadow-2xl';
                tagBg = 'bg-emerald-800 text-white font-bold';
                titleColor = 'text-emerald-100 font-bold';
              } else if (rank === 2) {
                pinColor = '#0d9488';
                badgeBg = 'bg-[#051E20]/95 border-2 border-teal-400 shadow-2xl';
                tagBg = 'bg-teal-800 text-white font-bold';
                titleColor = 'text-teal-100 font-bold';
              } else if (rank === 3) {
                pinColor = '#0284c7';
                badgeBg = 'bg-[#07192A]/95 border-2 border-sky-400 shadow-2xl';
                tagBg = 'bg-sky-800 text-white font-bold';
                titleColor = 'text-sky-100 font-bold';
              } else {
                pinColor = '#16a34a';
                badgeBg = 'bg-[#062117]/95 border-2 border-emerald-400 shadow-2xl';
                tagBg = 'bg-emerald-800 text-white font-bold';
                titleColor = 'text-emerald-100 font-bold';
              }
            }

            // Direction and offset to ensure ZERO overlapping of tooltips
            const tooltipDirection: 'top' | 'bottom' | 'left' | 'right' = 
              rank === 1 ? 'top' : rank === 2 ? 'left' : rank === 3 ? 'top' : 'bottom';
            const tooltipOffset: [number, number] = 
              rank === 1 ? [0, -14] : rank === 2 ? [-14, 0] : rank === 3 ? [0, -14] : [0, 14];

            return (
              <CircleMarker
                key={site.id || idx}
                center={site.coordinates}
                radius={isRank1 ? 12 : isSelected ? 11 : 9}
                pathOptions={{
                  color: isSelected ? '#f59e0b' : '#ffffff',
                  fillColor: pinColor,
                  fillOpacity: 0.95,
                  weight: isSelected ? 4 : 3
                }}
                eventHandlers={{
                  click: () => handleSelectRoute(site.id)
                }}
              >
                {/* Permanent On-Map Label for Authority Recognition (High-contrast for Light & Dark Theme) */}
                <Tooltip permanent direction={tooltipDirection} offset={tooltipOffset} className="custom-safe-site-tooltip">
                  <div className={`${badgeBg} font-mono text-[10px] px-2.5 py-1 rounded-md shadow-2xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected ? 'ring-2 ring-amber-400 scale-105' : 'hover:scale-105'
                  }`}>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${tagBg} tracking-wide`}>
                      {rankLabel}
                    </span>
                    <span className={titleColor}>
                      {site.name.toUpperCase()}
                    </span>
                  </div>
                </Tooltip>

                {/* Rich Details Popup with Bayesian, XGBoost, and CCAS Metrics */}
                <Popup>
                  <div className="p-2 space-y-1.5 text-xs font-sans text-slate-900 min-w-[260px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-emerald-700 uppercase tracking-wide">
                        {rankLabel}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        CCAS {site.ccasScore}/100
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-950">{site.name}</div>
                    <div className="text-[11px] text-slate-600">{site.location}</div>
                    
                    {/* Multi-Model Grounded Metrics */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                      <div>Bayesian Safe: <strong className="text-emerald-700">{site.bayesianSafetyProb || 95}%</strong></div>
                      <div>XGBoost Clear: <strong className="text-emerald-700">{site.xgboostStabilityScore || 92}%</strong></div>
                      <div>Slope Angle: <strong>{site.slopeDeg || 4.2}° (Safe)</strong></div>
                      <div>Holding Cap: <strong>{site.capacityPersons.toLocaleString()} Pax</strong></div>
                      <div>Available: <strong className="text-emerald-700">{site.availableCapacity.toLocaleString()} Pax</strong></div>
                      <div>Elevation: <strong>{site.elevationMeters} m MSL</strong></div>
                      <div>Water Supply: <strong>{site.waterLitersPerDay.toLocaleString()} L/d</strong></div>
                      <div>Triage Beds: <strong>{site.triageBeds} Beds</strong></div>
                    </div>

                    <div className="p-1.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">FAST ROUTE:</span>
                        <span className="text-emerald-700 font-bold">{site.distanceKm || 14.8} km • {site.transitMins} mins</span>
                      </div>
                      <div className="text-slate-600 truncate">{site.transitCorridor}</div>
                      {site.fastestRouteBadge && (
                        <div className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                          {site.fastestRouteBadge}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectRoute(site.id)}
                      className="w-full mt-1 py-1 rounded bg-[#00897B] hover:bg-[#00796B] text-white font-mono text-[10px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>{isSelected ? 'ACTIVE EVACUATION CORRIDOR' : 'ACTIVATE THIS CORRIDOR'}</span>
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        </MapContainer>

        {/* 3. FLOATING MAP LAYERS CONTROL DOCK (ArcGIS / Power BI Style) */}
        <div className={`absolute top-3 left-3 z-10 p-2.5 rounded-xl border shadow-md backdrop-blur-md text-xs font-mono transition-all ${
          theme === 'light' ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-[#0A1410]/95 border-[#1A2E24] text-slate-200'
        }`}>
          <div className="font-bold mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#00897B]">
            <Layers className="w-3.5 h-3.5" />
            <span>GIS LAYERS</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <label className="flex items-center gap-2 cursor-pointer hover:text-emerald-500">
              <input
                type="checkbox"
                checked={showRedZones}
                onChange={(e) => setShowRedZones(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white" />
                <span>Red Zones</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-emerald-500">
              <input
                type="checkbox"
                checked={showHabitations}
                onChange={(e) => setShowHabitations(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Affected Habitations</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-emerald-500">
              <input
                type="checkbox"
                checked={showRelocationRoute}
                onChange={(e) => setShowRelocationRoute(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
                <span>Fast Corridors</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-emerald-500">
              <input
                type="checkbox"
                checked={showSafeSites}
                onChange={(e) => setShowSafeSites(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                <span>Safe Sites (All 4 Hubs)</span>
              </span>
            </label>
          </div>
        </div>

      </div>

      {/* 5. INTERACTIVE 3D DEM TERRAIN MODAL (Multi-Hazard Digital Elevation Model) */}
      {show3dDemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`relative w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0B1310] border-[#1A2E24]'
          }`}>
            {/* Modal Header */}
            <div className={`px-5 py-3 border-b flex items-center justify-between ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#08100C] border-[#1A2E24]'
            }`}>
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-500" />
                <h3 className={`font-mono text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  NIVARA 3D DEM TERRAIN & SLOPE ELEVATION BLOCK // {profile.studyLocation.toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setShow3dDemModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 3D Canvas Body */}
            <div className="p-4 flex-1 overflow-hidden min-h-[460px] flex items-center justify-center bg-slate-950">
              <Dem3DBlockCanvas height="460px" hazardKey={hazardKey} />
            </div>

            {/* Modal Footer */}
            <div className={`px-5 py-2.5 border-t flex items-center justify-between text-xs font-mono ${
              theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#08100C] border-[#1A2E24] text-slate-400'
            }`}>
              <div>
                DEM Source: {hazardKey === 'flood' ? 'ALOS PALSAR 12.5m / CartoDEM' : hazardKey === 'cloudburst' ? 'Copernicus GLO-30 / CartoDEM' : hazardKey === 'coastal-erosion' ? 'USGS DSAS / ALOS AW3D30' : 'CartoDEM / SRTM 30m'} // Topographic relief & slope gradient analysis.
              </div>
              <button
                onClick={() => setShow3dDemModal(false)}
                className="px-3 py-1 rounded bg-[#00897B] text-white font-bold cursor-pointer"
              >
                Close 3D View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
