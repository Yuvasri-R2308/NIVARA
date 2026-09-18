import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Search, Plus, X, Layers, Mountain, Sparkles, Activity, Radio, Cpu } from 'lucide-react';
import { Parcel, CandidateSite, RunoutPath, DemSamplePoint } from '../../types';
import { AREA_HAZARD_REGISTRY, SAFE_SITES_REGISTRY, MICRO_CATCHMENTS_DATA, getHazardProfileForLocation } from '../../data/areaHazardProfiles';
import { Map3DHUD } from './Map3DHUD';
import { Map3DLegend } from './Map3DLegend';
import { Map3DControls, Map3DLayersState, MapBaseStyle } from './Map3DControls';
import { AreaAnalysisPanel3D } from './AreaAnalysisPanel3D';
import { HackathonDemoTour, TourStep } from './HackathonDemoTour';
import { Dem3DBlockCanvas } from './Dem3DBlockCanvas';
import { TerrainAnalysisModal } from './TerrainAnalysisModal';
import { detectPeaks, detectLowPoints } from '../../services/demService';
import { elevationService } from '../../services/elevationService';
import { useApp } from '../../context/AppContext';

interface Map3DProps {
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
  initialBaseStyle?: MapBaseStyle;
  onOpenDetailedAnalysis?: (item: any) => void;
  onToggleMapMode?: (mode: '2D' | '3D') => void;
  transitOrigin?: [number, number];
  transitTarget?: [number, number];
  transitDestinationName?: string;
}

const TILE_SOURCES: Record<MapBaseStyle, { url: string; attribution: string; maxzoom?: number }> = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Imagery',
    maxzoom: 19
  },
  terrain: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Topo Map',
    maxzoom: 14 // Max native zoom for Esri Topo; MapLibre oversamples zoom 15-20 without "Map data not yet available"
  },
  dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Dark Gray Base',
    maxzoom: 16
  },
  street: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxzoom: 19
  }
};

export const Map3D: React.FC<Map3DProps> = ({
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
  zoom = 12,
  showRunout = true,
  showSites = true,
  showDemOverlay = false,
  height = '640px',
  simulatedMultiplier = 1.0,
  initialBaseStyle = 'satellite',
  onOpenDetailedAnalysis,
  onToggleMapMode,
  transitOrigin,
  transitTarget,
  transitDestinationName
}) => {
  const { setActiveView, liveWeather, selectedHazard } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const rainCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStateRef = useRef<{ center: [number, number]; zoom: number; pitch: number; bearing: number }>({
    center: [center ? center[1] : 76.128, center ? center[0] : 11.554],
    zoom: zoom || 12,
    pitch: 55,
    bearing: -15
  });

  // 3D Controls State
  const [view3DMode, setView3DMode] = useState<'dem-block' | 'gis-map'>('dem-block');
  const [isTerrainModalOpen, setIsTerrainModalOpen] = useState<boolean>(false);
  const [baseStyle, setBaseStyle] = useState<MapBaseStyle>(initialBaseStyle);
  const [terrainExaggeration, setTerrainExaggeration] = useState<number>(1.5);
  const [isTilted, setIsTilted] = useState<boolean>(true);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [inspectedEntity, setInspectedEntity] = useState<any | null>(null);
  const [hoveredParcelId, setHoveredParcelId] = useState<string | null>(null);
  const [mapSearch, setMapSearch] = useState<string>('');
  
  const defaultStudyVillage = selectedVillage || (
    selectedHazard === 'flood' ? 'Rohmaria' :
    selectedHazard === 'cloudburst' ? 'Mandakini Gorge' :
    selectedHazard === 'coastal-erosion' ? 'Podampeta' :
    'Meppadi'
  );
  const [currentStudyVillage, setCurrentStudyVillage] = useState<string>(defaultStudyVillage);

  useEffect(() => {
    if (selectedVillage) {
      setCurrentStudyVillage(selectedVillage);
    } else {
      setCurrentStudyVillage(defaultStudyVillage);
    }
  }, [selectedVillage, selectedHazard]);

  const [layers, setLayers] = useState<Map3DLayersState>({
    showExtrusion: true,
    showLandslides: showRunout,
    showFloods: true,
    showPopulation: true,
    showSites: showSites,
    showRoutes: false,
    showWeather: true,
    showCatchments: true
  });

  const handleToggleLayer = (key: keyof Map3DLayersState) => {
    setLayers((prev: Map3DLayersState) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyPreset = (preset: string) => {
    if (preset === 'red-zone') {
      setLayers({
        showExtrusion: true,
        showLandslides: false,
        showFloods: false,
        showPopulation: false,
        showSites: false,
        showRoutes: false,
        showWeather: false,
        showCatchments: false
      });
    } else if (preset === 'runout') {
      setLayers({
        showExtrusion: false,
        showLandslides: true,
        showFloods: true,
        showPopulation: false,
        showSites: false,
        showRoutes: false,
        showWeather: true,
        showCatchments: true
      });
    } else if (preset === 'resettlement') {
      setLayers({
        showExtrusion: false,
        showLandslides: false,
        showFloods: false,
        showPopulation: false,
        showSites: true,
        showRoutes: true,
        showWeather: false,
        showCatchments: false
      });
    } else {
      setLayers({
        showExtrusion: true,
        showLandslides: true,
        showFloods: true,
        showPopulation: true,
        showSites: true,
        showRoutes: true,
        showWeather: true,
        showCatchments: true
      });
    }
  };

  // Convert parcels to distinct, realistic 3D Extrusion polygons with granular risk colors
  const parcelsGeoJson = useMemo(() => {
    const features = parcels.map((p) => {
      let effectiveRiskScore = p.risk_score;
      if (simulatedMultiplier > 1) {
        effectiveRiskScore = Math.min(100, Math.round(p.risk_score * (1 + (simulatedMultiplier - 1) * 0.4)));
      }

      const isSelected = selectedParcel?.parcel_id === p.parcel_id;
      const slope = p.slope_deg || 0;

      // Realistic, grounded 3D height (12m to 48m) so natural mountain slopes, valleys, and roads remain visible
      const baseHeight = 10;
      const heightRange = 34 * Math.min(1.4, Math.max(0.7, terrainExaggeration));
      const extrusionHeight = Math.round(baseHeight + (effectiveRiskScore / 100) * heightRange + (isSelected ? 16 : 0));

      // Continuous Multi-Hazard Risk Color Ramp (scientifically calibrated to hazard severity & slope)
      let color = '#10B981'; // Default: Safe / Resettlement zone (Emerald Green)
      if (effectiveRiskScore >= 90 || slope >= 24) {
        color = '#991B1B'; // Critical Catastrophic Hazard / Scarp Zone (Deep Crimson)
      } else if (effectiveRiskScore >= 82 || slope >= 18) {
        color = '#DC2626'; // Very High Hazard / Active Runout (Vivid Red)
      } else if (effectiveRiskScore >= 74 || slope >= 13) {
        color = '#EA580C'; // High Hazard / Vulnerable Slopes (Orange-Red)
      } else if (effectiveRiskScore >= 64) {
        color = '#F97316'; // High-Moderate Hazard (Vibrant Orange)
      } else if (effectiveRiskScore >= 50) {
        color = '#F59E0B'; // Moderate Hazard (Warm Amber)
      } else if (effectiveRiskScore >= 38) {
        color = '#EAB308'; // Moderate-Low (Caution Yellow)
      } else if (effectiveRiskScore >= 25) {
        color = '#84CC16'; // Low Hazard / Stable Plateau (Lime)
      } else {
        color = '#10B981'; // Safe Zone (Emerald)
      }

      if (isSelected) {
        color = '#00F0FF'; // Highlight clicked parcel with Electric Cyan
      }

      const lat = p.latitude;
      const lng = p.longitude;
      // Precision footprint (0.00032 deg ~ 35m radius) leaves a clean 50m street corridor between parcels
      // preventing them from merging into an opaque solid block
      const dLat = 0.00032;
      const dLng = 0.00032;

      const polygonCoords = [
        [lng - dLng, lat - dLat],
        [lng + dLng, lat - dLat],
        [lng + dLng, lat + dLat],
        [lng - dLng, lat + dLat],
        [lng - dLng, lat - dLat]
      ];

      return {
        type: 'Feature',
        properties: {
          parcel_id: p.parcel_id,
          village: p.village,
          risk_level: p.risk_level,
          risk_score: effectiveRiskScore,
          rpi_score: p.rpi_score || 72,
          slope_deg: p.slope_deg,
          rainfall_24h_mm: p.rainfall_24h_mm * simulatedMultiplier,
          soil_moisture_index: p.soil_moisture_index,
          population_density: p.population_density,
          height: extrusionHeight,
          base_height: 0,
          color: color,
          isSelected
        },
        geometry: {
          type: 'Polygon',
          coordinates: [polygonCoords]
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }, [parcels, simulatedMultiplier, terrainExaggeration, selectedParcel]);

  // Hydrological Micro-Catchments GeoJSON
  const catchmentsGeoJson = useMemo(() => {
    const features = MICRO_CATCHMENTS_DATA.map((c) => {
      const dynamicHri = Math.min(100, Math.round(c.hriScore * (1 + (simulatedMultiplier - 1) * 0.25)));
      let fillColor = '#10B981';
      let strokeColor = '#10B981';
      if (dynamicHri >= 75) {
        fillColor = '#F43F5E';
        strokeColor = '#F43F5E';
      } else if (dynamicHri >= 60) {
        fillColor = '#F59E0B';
        strokeColor = '#F59E0B';
      } else if (dynamicHri >= 40) {
        fillColor = '#06B6D4';
        strokeColor = '#06B6D4';
      }

      const polygonCoords = c.polygon.map(([lat, lng]) => [lng, lat]);

      return {
        type: 'Feature',
        properties: {
          catchment_id: c.catchmentId,
          name: c.name,
          village: c.village,
          area_km2: c.areaKm2,
          mean_elevation_m: c.meanElevationM,
          mean_slope_deg: c.meanSlopeDeg,
          rainfall_24h_mm: Math.round(c.baseRain24h * simulatedMultiplier),
          dynamic_hri: dynamicHri,
          mmi_score: c.mmiScore,
          operating_mode: c.operatingMode,
          color: fillColor,
          strokeColor: strokeColor
        },
        geometry: {
          type: 'Polygon',
          coordinates: [polygonCoords]
        }
      };
    });

    return { type: 'FeatureCollection', features };
  }, [simulatedMultiplier]);

  // Landslide Runout Path GeoJSON
  const runoutGeoJson = useMemo(() => {
    const features = [
      {
        type: 'Feature',
        properties: { name: 'Meppadi-Chooralmala Main Runout' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.135, 11.535],
            [76.130, 11.545],
            [76.128, 11.554],
            [76.115, 11.565]
          ]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Mundakkai Tributary Debris Channel' },
        geometry: {
          type: 'LineString',
          coordinates: [
            [76.142, 11.540],
            [76.132, 11.550],
            [76.128, 11.554]
          ]
        }
      }
    ];
    return { type: 'FeatureCollection', features };
  }, []);

  // Flood lowlands GeoJSON
  const floodGeoJson = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Kottathara Kabini Basin Floodplain' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [76.025, 11.675],
              [76.055, 11.675],
              [76.055, 11.695],
              [76.025, 11.695],
              [76.025, 11.675]
            ]]
          }
        }
      ]
    };
  }, []);

  // Evacuation Corridors GeoJSON
  const evacuationGeoJson = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Meppadi to Kalpetta Safe Highway Corridor (NH-766)' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [76.128, 11.554],
              [76.110, 11.570],
              [76.095, 11.590],
              [76.082, 11.608]
            ]
          }
        },
        {
          type: 'Feature',
          properties: { name: 'Achooranam to Achoor East Safe Route' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [76.012, 11.591],
              [76.025, 11.598],
              [76.035, 11.605]
            ]
          }
        }
      ]
    };
  }, []);

  // Dynamic Transit Corridor GeoJSON Line in 3D (Meppadi -> Chosen Place)
  const transitCorridorGeoJson = useMemo(() => {
    const origin: [number, number] = transitOrigin || [11.554, 76.128]; // Meppadi [lat, lng]
    let targetLat: number | null = null;
    let targetLng: number | null = null;
    if (transitTarget) {
      targetLat = transitTarget[0];
      targetLng = transitTarget[1];
    } else if (selectedSite) {
      const sel: any = selectedSite;
      targetLat = sel.latitude ?? (Array.isArray(sel.coordinates) ? sel.coordinates[0] : null);
      targetLng = sel.longitude ?? (Array.isArray(sel.coordinates) ? sel.coordinates[1] : null);
    } else if (selectedVillage && AREA_HAZARD_REGISTRY[selectedVillage]) {
      targetLat = AREA_HAZARD_REGISTRY[selectedVillage].coordinates[0];
      targetLng = AREA_HAZARD_REGISTRY[selectedVillage].coordinates[1];
    }

    if (targetLat === null || targetLng === null) {
      return { type: 'FeatureCollection', features: [] };
    }

    // MapLibre GeoJSON coordinates are [lng, lat]
    const coords: [number, number][] = [[origin[1], origin[0]]];
    if (selectedVillage && selectedVillage !== 'Meppadi' && selectedVillage !== 'ALL' && AREA_HAZARD_REGISTRY[selectedVillage]) {
      const v = AREA_HAZARD_REGISTRY[selectedVillage].coordinates;
      const dOrigin = Math.hypot(v[0] - origin[0], v[1] - origin[1]);
      const dTarget = Math.hypot(v[0] - targetLat, v[1] - targetLng);
      if (dOrigin > 0.008 && dTarget > 0.008) {
        coords.push([v[1], v[0]]);
      }
    }
    coords.push([targetLng, targetLat]);

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Evacuation Transit Corridor' },
          geometry: {
            type: 'LineString',
            coordinates: coords
          }
        }
      ]
    };
  }, [transitOrigin, transitTarget, selectedSite, selectedVillage]);

  // Search and smooth fly-to handler
  const handleZoomToSearchedCity = useCallback(() => {
    const q = mapSearch.trim().toLowerCase();
    if (!q) return;
    const map = mapInstanceRef.current;

    for (const [key, town] of Object.entries(AREA_HAZARD_REGISTRY)) {
      if (key.toLowerCase().includes(q) || town.name.toLowerCase().includes(q)) {
        setCurrentStudyVillage(key);
        if (map) {
          map.flyTo({ center: [town.coordinates[1], town.coordinates[0]], zoom: 15, pitch: 58, bearing: -15, duration: 1500 });
        }
        setInspectedEntity(town);
        return;
      }
    }

    for (const [key, site] of Object.entries(SAFE_SITES_REGISTRY)) {
      if (key.toLowerCase().includes(q) || site.name.toLowerCase().includes(q) || (site.village && site.village.toLowerCase().includes(q))) {
        const lat = site.coordinates[0];
        const lon = site.coordinates[1];
        if (map) {
          map.flyTo({ center: [lon, lat], zoom: 15, pitch: 58, bearing: -15, duration: 1500 });
        }
        setInspectedEntity(site);
        return;
      }
    }

    const matchedP = parcels.find(p => 
      p.parcel_id.toLowerCase().includes(q) || 
      p.village.toLowerCase().includes(q) || 
      p.survey_no.toLowerCase().includes(q)
    );
    if (matchedP) {
      if (map) {
        map.flyTo({ center: [matchedP.longitude, matchedP.latitude], zoom: 16, pitch: 60, bearing: -20, duration: 1500 });
      }
      if (onSelectParcel) onSelectParcel(matchedP);
      setInspectedEntity(matchedP);
      return;
    }
  }, [mapSearch, parcels, onSelectParcel]);

  // 1. Initialize MapLibre 3D WebGL Map
  useEffect(() => {
    if (view3DMode !== 'gis-map') return;
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      const prevMap = mapInstanceRef.current;
      const c = prevMap.getCenter();
      cameraStateRef.current = {
        center: [c.lng, c.lat],
        zoom: prevMap.getZoom(),
        pitch: prevMap.getPitch(),
        bearing: prevMap.getBearing()
      };
      prevMap.remove();
    }

    const currentTileConfig = TILE_SOURCES[baseStyle] || TILE_SOURCES.satellite;
    const { center: initCenter, zoom: initZoom, pitch: initPitch, bearing: initBearing } = cameraStateRef.current;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'base-raster-tiles': {
            type: 'raster',
            tiles: [currentTileConfig.url],
            tileSize: 256,
            attribution: currentTileConfig.attribution,
            maxzoom: currentTileConfig.maxzoom || 19
          }
        },
        layers: [
          {
            id: 'base-raster-layer',
            type: 'raster',
            source: 'base-raster-tiles',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: initCenter,
      zoom: initZoom,
      pitch: initPitch,
      bearing: initBearing,
      maxPitch: 75
    });

    mapInstanceRef.current = map;

    map.on('load', () => {
      // B. Add Parcels 3D Extrusion Source
      map.addSource('parcels-3d-source', {
        type: 'geojson',
        data: parcelsGeoJson as any
      });

      // C. Add Parcels Fill-Extrusion Layer
      map.addLayer({
        id: 'parcels-3d-extrusion-layer',
        type: 'fill-extrusion',
        source: 'parcels-3d-source',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.82
        }
      });

      // Cadastral property parcel outline lines for crisp individual plot visibility
      map.addLayer({
        id: 'parcels-3d-line-layer',
        type: 'line',
        source: 'parcels-3d-source',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 1.0,
          'line-opacity': 0.35
        }
      });

      // E. Add Flood Lowlands Layer
      map.addSource('flood-3d-source', {
        type: 'geojson',
        data: floodGeoJson as any
      });

      map.addLayer({
        id: 'flood-3d-layer',
        type: 'fill',
        source: 'flood-3d-source',
        paint: {
          'fill-color': '#38BDF8',
          'fill-opacity': 0.25,
          'fill-outline-color': '#0EA5E9'
        }
      });

      // Micro-Catchments
      map.addSource('catchments-3d-source', {
        type: 'geojson',
        data: catchmentsGeoJson as any
      });

      map.addLayer({
        id: 'catchments-3d-fill-layer',
        type: 'fill',
        source: 'catchments-3d-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.22
        }
      });

      map.addLayer({
        id: 'catchments-3d-line-layer',
        type: 'line',
        source: 'catchments-3d-source',
        paint: {
          'line-color': ['get', 'strokeColor'],
          'line-width': 1.5,
          'line-opacity': 0.8
        }
      });

      // Landslide Runout Path Layer
      map.addSource('runout-3d-source', {
        type: 'geojson',
        data: runoutGeoJson as any
      });

      map.addLayer({
        id: 'runout-3d-layer',
        type: 'line',
        source: 'runout-3d-source',
        paint: {
          'line-color': '#F43F5E',
          'line-width': 3.5,
          'line-opacity': 0.85
        }
      });

      // Active Transit Corridor GeoJSON Line in 3D
      map.addSource('transit-corridor-3d-source', {
        type: 'geojson',
        data: transitCorridorGeoJson as any
      });

      map.addLayer({
        id: 'transit-corridor-bg-3d',
        type: 'line',
        source: 'transit-corridor-3d-source',
        paint: {
          'line-color': '#000000',
          'line-width': 7,
          'line-opacity': 0.9
        }
      });

      map.addLayer({
        id: 'transit-corridor-line-3d',
        type: 'line',
        source: 'transit-corridor-3d-source',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 4,
          'line-dasharray': [3, 2],
          'line-opacity': 1.0
        }
      });

      // Immediate resize for responsive 3D WebGL viewport
      map.resize();
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.resize();
        }
      }, 100);

      // Interactive Click & Hover on 3D Parcels
      map.on('click', 'parcels-3d-extrusion-layer', (e: any) => {
        if (!e.features || e.features.length === 0) return;
        const feat = e.features[0];
        const pId = feat.properties?.parcel_id;
        const matched = parcels.find(p => p.parcel_id === pId);
        if (matched) {
          if (onSelectParcel) onSelectParcel(matched);
          setInspectedEntity(matched);
        }
      });

      // Interactive Click on Any Arbitrary Coordinate on 3D Terrain
      map.on('click', async (e: any) => {
        const feats = map.queryRenderedFeatures(e.point, { layers: ['parcels-3d-extrusion-layer'] });
        if (feats && feats.length > 0) return; // Handled by parcel click

        const lat = e.lngLat.lat;
        const lon = e.lngLat.lng;

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

          setInspectedEntity({
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
          console.error('3D terrain probe error:', err);
        }
      });

      map.on('mouseenter', 'parcels-3d-extrusion-layer', (e: any) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features.length > 0) {
          setHoveredParcelId(e.features[0].properties?.parcel_id || null);
        }
      });

      map.on('mouseleave', 'parcels-3d-extrusion-layer', () => {
        map.getCanvas().style.cursor = '';
        setHoveredParcelId(null);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [baseStyle, view3DMode]);

  // 2. Update GeoJSON sources when parcels change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const parcelSource = map.getSource('parcels-3d-source') as maplibregl.GeoJSONSource;
    if (parcelSource) {
      parcelSource.setData(parcelsGeoJson as any);
    }
  }, [parcelsGeoJson]);

  // 3. Update catchments source when multiplier changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const cSource = map.getSource('catchments-3d-source') as maplibregl.GeoJSONSource;
    if (cSource) {
      cSource.setData(catchmentsGeoJson as any);
    }
  }, [catchmentsGeoJson]);

  // 4. Layer Visibility Synchronization
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('parcels-3d-extrusion-layer')) {
      map.setLayoutProperty(
        'parcels-3d-extrusion-layer',
        'visibility',
        layers.showExtrusion ? 'visible' : 'none'
      );
    }
    if (map.getLayer('catchments-3d-fill-layer')) {
      map.setLayoutProperty(
        'catchments-3d-fill-layer',
        'visibility',
        layers.showCatchments !== false ? 'visible' : 'none'
      );
    }
    if (map.getLayer('catchments-3d-line-layer')) {
      map.setLayoutProperty(
        'catchments-3d-line-layer',
        'visibility',
        layers.showCatchments !== false ? 'visible' : 'none'
      );
    }
    if (map.getLayer('runout-3d-layer')) {
      map.setLayoutProperty(
        'runout-3d-layer',
        'visibility',
        layers.showLandslides ? 'visible' : 'none'
      );
    }
    if (map.getLayer('flood-3d-layer')) {
      map.setLayoutProperty(
        'flood-3d-layer',
        'visibility',
        layers.showFloods ? 'visible' : 'none'
      );
    }
  }, [layers, view3DMode]);

  // Update 3D Transit Corridor GeoJSON on active village/destination change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const source: any = map.getSource('transit-corridor-3d-source');
    if (source && source.setData) {
      source.setData(transitCorridorGeoJson);
    }
  }, [transitCorridorGeoJson]);

  // 5. Add 3D HTML Markers for Towns & Candidate Sites
  useEffect(() => {
    if (view3DMode !== 'gis-map') return;
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // A. Towns & Disaster Epicenter Pins (Only Area Name)
    Object.entries(AREA_HAZARD_REGISTRY).forEach(([key, town]) => {
      if (key === 'Wayanad') return; // Skip regional context label to prevent duplicate collision with Kalpetta

      const el = document.createElement('div');
      el.className = 'group relative flex flex-col items-center cursor-pointer';
      
      const isEpicenter = key === 'Meppadi' || key === 'Chooralmala' || key === 'Mundakkai';
      const badgeColor = key === 'Chooralmala' ? '#DC2626' : key === 'Mundakkai' ? '#EF4444' : isEpicenter ? '#F43F5E' : town.riskLevel === 'HIGH' ? '#EA580C' : town.riskLevel === 'MEDIUM' ? '#F59E0B' : '#10B981';
      
      const labelText = key === 'Meppadi' ? 'Meppadi Epicenter' :
                        key === 'Chooralmala' ? 'Chooralmala Bridge' :
                        key === 'Mundakkai' ? 'Mundakkai Scarp' :
                        key === 'Chembra' ? 'Chembra Peak 2100m' :
                        key === 'Kalpetta' ? 'Kalpetta District HQ' :
                        town.name.split(' (')[0];

      el.innerHTML = `
        <div style="
          position: relative;
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
          transition: transform 0.16s ease;
        ">
          <span style="width: 11px; height: 11px; border-radius: 50%; background: ${badgeColor}; box-shadow: 0 0 10px ${badgeColor}; ${isEpicenter ? 'animation: pulse 1s infinite;' : ''}; flex-shrink: 0;"></span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.01em;">
            ${labelText}
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
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setInspectedEntity(town);
        map.flyTo({
          center: [town.coordinates[1], town.coordinates[0]],
          zoom: 14.5,
          pitch: 62,
          bearing: -20,
          duration: 1500
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([town.coordinates[1], town.coordinates[0]])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // B. Prominent DEM Peak Markers (Only Peak & Elevation)
    const detectedPeaks = detectPeaks(currentStudyVillage || 'ALL');
    detectedPeaks.forEach(peak => {
      const el = document.createElement('div');
      el.className = 'group relative flex flex-col items-center cursor-pointer';
      el.innerHTML = `
        <div style="
          position: relative;
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
          transition: transform 0.16s ease;
        ">
          <span style="color: #34D399; font-size: 18px; font-weight: 900; line-height: 1;">▲</span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.01em;">
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
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setInspectedEntity(peak);
        map.flyTo({
          center: [peak.lng, peak.lat],
          zoom: 15,
          pitch: 62,
          bearing: -15,
          duration: 1500
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([peak.lng, peak.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // C. Low-Lying Valley & Water Accumulation Basins (Only Low & Elevation)
    const detectedLows = detectLowPoints(currentStudyVillage || 'ALL');
    detectedLows.forEach(low => {
      const el = document.createElement('div');
      el.className = 'group relative flex flex-col items-center cursor-pointer';
      el.innerHTML = `
        <div style="
          position: relative;
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
          transition: transform 0.16s ease;
        ">
          <span style="color: #38BDF8; font-size: 16px; font-weight: 900; line-height: 1;">●</span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.01em;">
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
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setInspectedEntity(low);
        map.flyTo({
          center: [low.lng, low.lat],
          zoom: 15,
          pitch: 60,
          bearing: -15,
          duration: 1500
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([low.lng, low.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Candidate Sites markers removed per user request for clean terrain view
  }, [candidateSites, layers.showSites, baseStyle, currentStudyVillage, view3DMode]);

  // 6. Camera Controls: Tilt & Reset
  const handleResetCamera = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [76.085, 11.605],
      zoom: 12,
      pitch: 55,
      bearing: -15,
      duration: 1600
    });
    setIsTilted(true);
  }, []);

  const handleTiltCamera = useCallback((pitchVal: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.easeTo({
      pitch: pitchVal,
      duration: 800
    });
    setIsTilted(pitchVal > 20);
  }, []);

  // 7. Tour Step Handler
  const handleFlyToTourStep = useCallback((step: TourStep) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo({
      center: [step.focusTarget[1], step.focusTarget[0]],
      zoom: step.zoom,
      pitch: step.pitch,
      bearing: step.bearing,
      duration: 2200,
      essential: true
    });

    if (step.id === 2 || step.id === 3) {
      setInspectedEntity(AREA_HAZARD_REGISTRY['Meppadi']);
    } else if (step.id === 7 || step.id === 8) {
      setInspectedEntity(SAFE_SITES_REGISTRY['KL-WYD-S01']);
    } else if (step.id === 4) {
      setInspectedEntity(AREA_HAZARD_REGISTRY['Kottathara']);
    } else if (step.id === 5) {
      setInspectedEntity(AREA_HAZARD_REGISTRY['Achooranam']);
    }
  }, []);

  // 8. Atmospheric Rain Overlay Loop
  useEffect(() => {
    if (!layers.showWeather) return;
    const canvas = rainCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const dropCount = Math.round(75 * simulatedMultiplier);
    const drops = Array.from({ length: dropCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 12 + Math.random() * 15,
      speed: 14 + Math.random() * 12,
      opacity: 0.2 + Math.random() * 0.4
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.2;

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;
        d.x -= 1.5;

        if (d.y > height) {
          d.y = -20;
          d.x = Math.random() * width;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [layers.showWeather, simulatedMultiplier]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#07110C] shadow-[0_15px_40px_rgba(0,0,0,0.85)] select-none" style={{ height }}>
      
      {/* 3D VIEWPORT CONTAINER */}
      {view3DMode === 'dem-block' ? (
        <Dem3DBlockCanvas
          selectedVillage={currentStudyVillage}
          onSelectVillage={(v) => setCurrentStudyVillage(v)}
          onOpenAnalysisModal={() => setIsTerrainModalOpen(true)}
          hazardKey={selectedHazard || undefined}
          height="100%"
        />
      ) : (
        <>
          {/* 3D WebGL Canvas Viewport */}
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Atmospheric Rain & Grid Canvas */}
          {layers.showWeather && (
            <canvas
              ref={rainCanvasRef}
              className="absolute inset-0 pointer-events-none z-[5]"
            />
          )}

          {/* Right Floating 3D Controls (Camera, Exaggeration, Layers, Presets) */}
          <div className="absolute top-16 right-3 z-[10] pointer-events-none">
            <div className="pointer-events-auto">
              <Map3DControls
                mapMode="3D"
                onToggleMapMode={(mode: '2D' | '3D') => {
                  if (onToggleMapMode) onToggleMapMode(mode);
                }}
                baseStyle={baseStyle}
                onChangeBaseStyle={(style) => setBaseStyle(style)}
                terrainExaggeration={terrainExaggeration}
                onChangeExaggeration={(v: number) => setTerrainExaggeration(v)}
                layers={layers}
                onToggleLayer={handleToggleLayer}
                onApplyPreset={handleApplyPreset}
                onResetCamera={handleResetCamera}
                onTiltCamera={handleTiltCamera}
                isTilted={isTilted}
              />
            </div>
          </div>

          {/* Left Floating Dynamic Legend */}
          <div className="absolute bottom-4 left-3 z-[10] pointer-events-none hidden sm:block">
            <div className="pointer-events-auto">
              <Map3DLegend
                showExtrusion={layers.showExtrusion}
                showLandslides={layers.showLandslides}
                showFloods={layers.showFloods}
                showPopulation={layers.showPopulation}
                showSites={layers.showSites}
                showRoutes={layers.showRoutes}
                onOpenTerrainAnalysis={() => setIsTerrainModalOpen(true)}
              />
            </div>
          </div>
        </>
      )}

      {/* 1. TOP IN-MAP CONTROLS BAR (Dual-mode navigation & user reference styling) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[10] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Search with dedicated [+] symbol for one-press 3D camera zooming */}
        <div className="pointer-events-auto flex items-center bg-[#07110C]/98 backdrop-blur-md rounded-lg border border-cyan-500/50 shadow-2xl overflow-hidden w-full md:w-72">
          <div className="relative flex-1 flex items-center">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search 3D terrain (e.g. Meppadi, Chooralmala)..."
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
                  setInspectedEntity(null);
                }}
                className="text-pine-muted hover:text-white p-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleZoomToSearchedCity}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all border-l border-cyan-500 shadow-md cursor-pointer group"
            title="Press + to fly 3D camera to the searched location"
          >
            <Plus className="w-4 h-4 text-white stroke-[3] group-hover:scale-125 transition-transform" />
          </button>
        </div>

        {/* Right: Mode Switchers & Actions */}
        <div className="pointer-events-auto flex items-center flex-nowrap gap-1.5 bg-[#07110C]/95 backdrop-blur-md p-1 rounded-lg border border-cyan-500/30 shadow-2xl">
          
          {/* PRIMARY DUAL-MAP MODE TOGGLE [ 2D GIS ] [ 3D TERRAIN ] */}
          <div className="flex items-center p-0.5 bg-black/40 rounded-lg border border-cyan-500/30">
            <button
              onClick={() => onToggleMapMode && onToggleMapMode('2D')}
              className="px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer text-pine-muted hover:text-white hover:bg-white/5"
              title="Switch to 2D GIS Leaflet Map"
            >
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>2D GIS</span>
            </button>
            <button
              onClick={() => onToggleMapMode && onToggleMapMode('3D')}
              className="px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm border border-cyan-400/50"
              title="3D WebGL Digital Elevation Model (Active)"
            >
              <Mountain className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span className="text-white">3D TERRAIN</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-cyan-500/30 mx-0.5 hidden sm:block" />

          {/* 3D SUB-VIEW SELECTOR: [ 🏔️ 3D DEM Block ] [ 🗺️ 3D GIS Map ] */}
          <div className="flex items-center p-0.5 bg-black/50 rounded-lg border border-emerald-500/30">
            <button
              onClick={() => setView3DMode('dem-block')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                view3DMode === 'dem-block'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-pine-muted hover:text-white'
              }`}
              title="3D DEM Elevation Block (Inspired by reference picture)"
            >
              <span>🏔️ DEM Block</span>
            </button>
            <button
              onClick={() => setView3DMode('gis-map')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                view3DMode === 'gis-map'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-pine-muted hover:text-white'
              }`}
              title="MapLibre 3D GIS Layer Map"
            >
              <span>🗺️ GIS 3D</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-cyan-500/30 mx-0.5 hidden sm:block" />

          {/* TERRAIN ANALYSIS MODAL TRIGGER BUTTON */}
          <button
            onClick={() => setIsTerrainModalOpen(true)}
            className="px-2.5 py-1 rounded bg-[#0B1C15] hover:bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            title="Open Detailed Digital Elevation Model (DEM) Analysis"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Terrain Intel</span>
          </button>

          {/* GIS-specific Layer Switchers (Visible when in GIS Map mode) */}
          {view3DMode === 'gis-map' && (
            <>
              <div className="h-4 w-[1px] bg-cyan-500/30 mx-0.5 hidden sm:block" />
              <div className="flex items-center gap-1">
                {(['satellite', 'terrain', 'dark'] as MapBaseStyle[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setBaseStyle(type)}
                    className={`px-2 py-1 rounded text-[10.5px] font-mono capitalize transition-all cursor-pointer ${
                      baseStyle === type
                        ? 'bg-emerald-500 text-white font-bold shadow-sm'
                        : 'text-pine-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </>
          )}

        </div>

      </div>

      {/* Center-Right Floating 3D Area Intelligence Panel (When clicked) */}
      {inspectedEntity && (
        <div className="absolute top-[148px] sm:top-[104px] left-2.5 md:left-auto md:right-3 z-[15] pointer-events-auto">
          <AreaAnalysisPanel3D
            selectedItem={inspectedEntity}
            onClose={() => setInspectedEntity(null)}
            onNavigateView={(view) => setActiveView(view as any)}
            simulatedMultiplier={simulatedMultiplier}
          />
        </div>
      )}

      {/* Hackathon Guided Demo Tour Modal */}
      {isTourActive && (
        <HackathonDemoTour
          onClose={() => setIsTourActive(false)}
          onFlyToStep={handleFlyToTourStep}
        />
      )}

      {/* Comprehensive Terrain Analysis Modal */}
      <TerrainAnalysisModal
        isOpen={isTerrainModalOpen}
        onClose={() => setIsTerrainModalOpen(false)}
        village={currentStudyVillage}
        hazard={selectedHazard || undefined}
      />

    </div>
  );
};
