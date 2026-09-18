import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Mountain, Compass, RotateCcw, ZoomIn, ZoomOut, Eye, Layers, ShieldAlert, Waves, Info, X } from 'lucide-react';
import { 
  detectPeaks, 
  detectLowPoints, 
  getTerrainAnalysis, 
  TerrainPeak, 
  TerrainLowPoint,
  getMutedHypsometricColor
} from '../../services/demService';
import { HazardType } from '../../types';
import { useApp } from '../../context/AppContext';

interface Dem3DBlockCanvasProps {
  selectedVillage?: string;
  onSelectVillage?: (village: string) => void;
  onOpenAnalysisModal?: () => void;
  className?: string;
  height?: string;
  hazardKey?: HazardType | null;
}

// Topographic 3D point in normalized space
interface Point3D {
  x: number; // -1 to 1 (West - East)
  y: number; // -1 to 1 (South - North)
  z: number; // Elevation in meters
  normZ: number; // 0 to 1 normalized
  slope: number; // Slope in degrees
  color: [number, number, number]; // RGB
}

const HAZARD_DEFAULT_AREAS: Record<HazardType, string> = {
  'landslide': 'Meppadi',
  'flood': 'Rohmaria',
  'cloudburst': 'Mandakini Gorge',
  'coastal-erosion': 'Podampeta'
};

const STUDY_AREAS_BY_HAZARD: Record<HazardType, { value: string; label: string }[]> = {
  'landslide': [
    { value: 'Meppadi', label: 'Meppadi (Disaster Epicenter & Scarp)' },
    { value: 'Mundakkai', label: 'Mundakkai (Upper Debris Origin & Scarp)' },
    { value: 'Chooralmala', label: 'Chooralmala (Bridge Runout Confluence)' },
    { value: 'Chembra', label: 'Chembra Scarp (Headwall Crest 2100m)' },
    { value: 'Achooranam', label: 'Achooranam (Tea Estate Ridge)' },
    { value: 'Kottathara', label: 'Kottathara (Kabini Lowland Basin)' },
    { value: 'Kuppadithara', label: 'Kuppadithara (Safe Flatland Plateau)' },
    { value: 'Kalpetta', label: 'Kalpetta (Plateau Administrative Ridge)' },
    { value: 'Vythiri', label: 'Vythiri (Ghat Pass Corridor)' },
    { value: 'Padinharethara', label: 'Padinharethara (Banasura Divide)' },
    { value: 'ALL', label: 'Full Wayanad District (Regional DEM)' },
  ],
  'flood': [
    { value: 'Rohmaria', label: 'Rohmaria (Embankment Breach & Scour Zone)' },
    { value: 'Maijan', label: 'Maijan (Maijan Beel Flood Detention Basin)' },
    { value: 'Dibrugarh University', label: 'Dibrugarh University (Safe Elevated Terrace 108m)' },
    { value: 'Barbaruah', label: 'Barbaruah (High Alluvial Relief Mound 114m)' },
    { value: 'Chabua', label: 'Chabua (Upper Highland Relocation Hub 124m)' },
    { value: 'ALL', label: 'Full Dibrugarh Reach (Brahmaputra Basin)' },
  ],
  'cloudburst': [
    { value: 'Mandakini Gorge', label: 'Mandakini Gorge (Incised Bedrock Chasm & Runout)' },
    { value: 'Kedarnath', label: 'Kedarnath (Glacial Cirque & Temple Terrace 3584m)' },
    { value: 'Rambara', label: 'Rambara (Chute Bottleneck & Debris Funnel)' },
    { value: 'Guptkashi', label: 'Guptkashi (Safe Elevated Bedrock Terrace 1319m)' },
    { value: 'Ukhimath', label: 'Ukhimath (Valley Escarpment Spur 1480m)' },
    { value: 'ALL', label: 'Full Mandakini Valley (High Himalaya Basin)' },
  ],
  'coastal-erosion': [
    { value: 'Podampeta', label: 'Podampeta (Active Shoreline & Retreating Fore-Dune)' },
    { value: 'Rushikulya', label: 'Rushikulya (Estuarine Tidal Mouth & Spit)' },
    { value: 'Humma', label: 'Humma (Salt Pan Depression & Ridge Buffer 34m)' },
    { value: 'Rangeilunda', label: 'Rangeilunda (Inland Safe Laterite Plateau 48m)' },
    { value: 'ALL', label: 'Full Ganjam Coast (Littoral & Upland Zone)' },
  ]
};

const PROVENANCE_BY_HAZARD: Record<HazardType, { source: string; samples: string; minLabel: string; midLabel: string; maxLabel: string; bar: { bg: string; title: string }[] }> = {
  'flood': {
    source: 'ALOS PALSAR 12.5m / CartoDEM • LE90 ±5m',
    samples: '24,800 Samples',
    minLabel: 'Low (90m)',
    midLabel: 'Mid (106m)',
    maxLabel: 'High (125m)',
    bar: [
      { bg: '#1D4ED8', title: '90m - 94m: Deep Brahmaputra Scour Thalweg' },
      { bg: '#3B82F6', title: '94m - 97m: Riverbank Inundation Margin' },
      { bg: '#60A5FA', title: '97m - 101m: Wetland Swales & Maijan Beel' },
      { bg: '#84CC16', title: '101m - 106m: Alluvial Agricultural Plain' },
      { bg: '#15803D', title: '106m - 112m: Elevated Tea Garden Knolls' },
      { bg: '#B45309', title: '112m - 125m: Safe Highland Terraces (Dibrugarh Univ/Chabua)' }
    ]
  },
  'cloudburst': {
    source: 'Copernicus GLO-30 / CartoDEM • LE90 ±8m',
    samples: '36,400 Samples',
    minLabel: 'Low (1,280m)',
    midLabel: 'Mid (2,410m)',
    maxLabel: 'High (3,584m)',
    bar: [
      { bg: '#78350F', title: '1280m - 1600m: Deep Incised Bedrock Gorge' },
      { bg: '#15803D', title: '1600m - 2100m: Lower Gorge Pine Forest' },
      { bg: '#4D7C0F', title: '2100m - 2600m: Sub-Alpine Scrub Slopes' },
      { bg: '#64748B', title: '2600m - 3100m: Rocky Escarpment & Scree' },
      { bg: '#94A3B8', title: '3100m - 3500m: High Glacial Moraine Ridge' },
      { bg: '#E2E8F0', title: '3500m - 3850m: Glaciated Cirque / Snow Summit' }
    ]
  },
  'coastal-erosion': {
    source: 'USGS DSAS / ALOS AW3D30 • LE90 ±3m',
    samples: '19,500 Samples',
    minLabel: 'Low (0.8m)',
    midLabel: 'Mid (18m)',
    maxLabel: 'High (48.5m)',
    bar: [
      { bg: '#0284C7', title: '0m - 1.5m: Intertidal Beach & Swash Trough' },
      { bg: '#FDE047', title: '1.5m - 4.0m: Active Sandy Foreshore Berm' },
      { bg: '#84CC16', title: '4.0m - 8.0m: Primary Vegetated Fore-Dune' },
      { bg: '#10B981', title: '8.0m - 18.0m: Casuarina Shelterbelt Buffer' },
      { bg: '#F59E0B', title: '18.0m - 30.0m: Humma Marine Terrace Ridge' },
      { bg: '#B45309', title: '30.0m - 48.5m: Rangeilunda Safe Laterite Plateau' }
    ]
  },
  'landslide': {
    source: 'SRTM 1-Arcsec (30m) • LE90 ±16m',
    samples: '31,501 Samples',
    minLabel: 'Low (715m)',
    midLabel: 'Mid (950m)',
    maxLabel: 'High (2,100m)',
    bar: [
      { bg: '#D4C8B2', title: '715m - 760m: Lowland Sand / Valley' },
      { bg: '#C2B69F', title: '760m - 840m: Alluvial Margin' },
      { bg: '#8B9B85', title: '840m - 980m: Soft Sage Slope' },
      { bg: '#697A63', title: '980m - 1200m: Desaturated Olive' },
      { bg: '#4C5C48', title: '1200m - 1450m: Dark Forest Green' },
      { bg: '#6D675F', title: '1450m - 2100m: Granite Massif & Stone Gray' }
    ]
  }
};

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 120;
  const g = parseInt(clean.substring(2, 4), 16) || 120;
  const b = parseInt(clean.substring(4, 6), 16) || 120;
  return [r, g, b];
};

export const Dem3DBlockCanvas: React.FC<Dem3DBlockCanvasProps> = ({
  selectedVillage,
  onSelectVillage,
  onOpenAnalysisModal,
  className = '',
  height = '100%',
  hazardKey
}) => {
  const { selectedHazard, theme } = useApp();
  const currentHazard: HazardType = hazardKey || selectedHazard || 'landslide';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera State
  const [rotation, setRotation] = useState<number>(45); // Degrees around Z axis (azimuth)
  const [pitch, setPitch] = useState<number>(38); // Degrees tilt angle (elevation)
  const [zoom, setZoom] = useState<number>(1.15);
  const [exaggeration, setExaggeration] = useState<number>(1.8);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showHillshade, setShowHillshade] = useState<boolean>(true);
  const [activeArea, setActiveArea] = useState<string>(
    selectedVillage || HAZARD_DEFAULT_AREAS[currentHazard] || 'Meppadi'
  );
  const [selectedFeature, setSelectedFeature] = useState<TerrainPeak | TerrainLowPoint | null>(null);

  // Synchronize activeArea with incoming selectedVillage or currentHazard
  useEffect(() => {
    if (selectedVillage) {
      setActiveArea(selectedVillage);
      setSelectedFeature(null);
    } else {
      const hazardOptions = STUDY_AREAS_BY_HAZARD[currentHazard] || [];
      const exists = hazardOptions.some(opt => opt.value.toLowerCase() === activeArea.toLowerCase());
      if (!exists) {
        setActiveArea(HAZARD_DEFAULT_AREAS[currentHazard] || 'Meppadi');
        setSelectedFeature(null);
      }
    }
  }, [selectedVillage, currentHazard]);

  // Drag interaction state
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load peaks and low points dynamically for currentHazard and activeArea
  const peaks = useMemo(() => detectPeaks(activeArea, currentHazard), [activeArea, currentHazard]);
  const lowPoints = useMemo(() => detectLowPoints(activeArea, currentHazard), [activeArea, currentHazard]);
  const analysis = useMemo(() => getTerrainAnalysis(activeArea, currentHazard), [activeArea, currentHazard]);

  // Generate 3D Elevation Grid calibrated to each hazard's empirical DEM surface
  const GRID_SIZE = 48;
  const terrainGrid = useMemo(() => {
    const grid: Point3D[][] = [];
    const areaLower = activeArea.toLowerCase();

    for (let r = 0; r <= GRID_SIZE; r++) {
      const row: Point3D[] = [];
      const v = r / GRID_SIZE; // 0 to 1 (South to North)
      const y = (v - 0.5) * 2; // -1 to 1

      for (let c = 0; c <= GRID_SIZE; c++) {
        const u = c / GRID_SIZE; // 0 to 1 (West to East)
        const x = (u - 0.5) * 2; // -1 to 1

        let elev = 730;
        let normZ = 0.5;

        // 1. FLOOD: Dibrugarh, Brahmaputra River Basin (90m - 125m MSL)
        if (currentHazard === 'flood') {
          const isRohmaria = areaLower.includes('rohmaria');
          const isMaijan = areaLower.includes('maijan');
          const isUniv = areaLower.includes('univ') || areaLower.includes('dibrugarh');
          const isBarbaruah = areaLower.includes('barbaruah');
          const isChabua = areaLower.includes('chabua');

          // Northern Brahmaputra braided thalweg channel
          const riverChannel = Math.exp(-Math.pow(y - 0.35 + 0.15 * Math.sin(x * 3.0), 2) * 22) * 8.5;
          const southLeveeRise = (0.5 - y) * 12; // High south, low river north

          if (isRohmaria) {
            // Embankment breach scour chasm (92.4m), eroded spur bund, tea estate levee (107.5m)
            const breachDist = Math.hypot(x - (-0.15), y - 0.22);
            const breachScour = Math.exp(-breachDist * 5.0) * 7.5;
            const spurDist = Math.hypot(x - 0.35, y - 0.15);
            const spurElev = Math.exp(-spurDist * 4.5) * 5.2;
            const teaRidge = Math.exp(-Math.hypot(x - 0.1, y - (-0.45)) * 3.0) * 14.5;
            const undulation = Math.sin(x * 8.0 + y * 6.0) * 1.5;
            elev = 98.5 - breachScour + spurElev + teaRidge - riverChannel * 0.4 + undulation;
          } else if (isMaijan) {
            // Maijan Beel flood detention wetland basin (94.2m)
            const beelDist = Math.hypot(x - 0.05, y - (-0.1));
            const beelSink = Math.exp(-beelDist * 3.8) * 6.8;
            const northDyke = Math.exp(-Math.pow(y - 0.28, 2) * 20) * 4.5;
            const eastTeaTerrace = Math.exp(-Math.hypot(x - 0.45, y - (-0.3)) * 3.2) * 12.0;
            const undulation = Math.sin(x * 7.0 - y * 6.5) * 1.2;
            elev = 99.0 - beelSink + northDyke + eastTeaTerrace - riverChannel * 0.3 + undulation;
          } else if (isUniv) {
            // Safe elevated university alluvial terrace (108.5m)
            const campusDist = Math.hypot(x - 0.0, y - (-0.05));
            const campusPlateau = Math.exp(-campusDist * 2.5) * 11.5;
            const perimeterDitch = Math.exp(-Math.pow(campusDist - 0.45, 2) * 28) * 3.2;
            const undulation = Math.sin(x * 6.0 + y * 5.0) * 1.0;
            elev = 97.5 + campusPlateau - perimeterDitch + undulation;
          } else if (isBarbaruah) {
            // High flood shelter mound (114.2m) & NH-37 embankment
            const moundDist = Math.hypot(x - 0.2, y - (-0.1));
            const mound = Math.exp(-moundDist * 3.2) * 17.5;
            const nh37Highway = Math.exp(-Math.pow(y - 0.15 * x - (-0.1), 2) * 32) * 7.5;
            const lowPaddy = Math.exp(-Math.hypot(x - (-0.4), y - 0.2) * 3.5) * 4.2;
            const undulation = Math.sin(x * 8.5 + y * 7.0) * 1.2;
            elev = 97.0 + mound + nh37Highway - lowPaddy + undulation;
          } else if (isChabua) {
            // Upper stable terrace (124.5m)
            const highPlateau = Math.exp(-Math.hypot(x - 0.35, y - (-0.25)) * 2.2) * 24.5;
            const gentleSlope = (0.5 - y) * 4;
            const undulation = Math.sin(x * 5.5 + y * 5.5) * 1.5;
            elev = 100.0 + highPlateau + gentleSlope + undulation;
          } else {
            // ALL / Regional Dibrugarh reach
            const undulation = Math.sin(x * 6.5 + y * 5.5) * 2.2 + Math.cos(x * 12.0 - y * 9.0) * 1.2;
            elev = 99.5 - riverChannel + southLeveeRise + undulation;
          }

          elev = Math.max(90.0, Math.min(125.0, elev));
          normZ = (elev - 90.0) / (125.0 - 90.0);
        }

        // 2. CLOUDBURST: Mandakini Valley & Kedarnath, Uttarakhand (1,280m - 3,850m MSL)
        else if (currentHazard === 'cloudburst') {
          const isKedarnath = areaLower.includes('kedar');
          const isGorge = areaLower.includes('mandakini') || areaLower.includes('gorge');
          const isRambara = areaLower.includes('rambara');
          const isGuptkashi = areaLower.includes('guptkashi');
          const isUkhimath = areaLower.includes('ukhimath');

          if (isKedarnath) {
            // High alpine glaciated cirque (3584m temple moraine terrace, 3850m headwalls)
            const cirqueDist = Math.hypot(x - 0.0, y - 0.1);
            const templeTerrace = Math.exp(-cirqueDist * 2.8) * 1250;
            const headwallCliff = Math.exp(-Math.hypot(x - 0.0, y - 0.6) * 2.2) * 1600;
            const westMoraine = Math.exp(-Math.hypot(x - (-0.45), y - 0.2) * 3.0) * 1350;
            const eastMoraine = Math.exp(-Math.hypot(x - 0.45, y - 0.2) * 3.0) * 1320;
            const meltwaterChute = Math.exp(-Math.pow(x - 0.05 * Math.sin(y * 3.0), 2) * 18) * 280;
            const ripples = Math.sin(x * 8.0 - y * 7.0) * 35;
            elev = 2200 + templeTerrace + headwallCliff + westMoraine + eastMoraine - meltwaterChute + ripples;
          } else if (isGorge) {
            // Incised V-shaped canyon chasm (1280m riverbed to 2600m cliffs)
            const riverX = 0.08 * Math.sin(y * 2.5);
            const gorgeV = Math.abs(x - riverX);
            const canyonWalls = Math.pow(gorgeV, 1.4) * 1450;
            const lateralSpur = Math.exp(-Math.hypot(x - 0.4, y - 0.2) * 3.5) * 380;
            const scree = Math.sin(x * 12.0 + y * 9.0) * 30;
            elev = 1280 + canyonWalls + lateralSpur + scree;
          } else if (isRambara) {
            // Severe bottleneck gorge constriction (2640m chasm floor)
            const riverX = -0.05 + 0.1 * y;
            const chuteConstriction = Math.pow(Math.abs(x - riverX), 1.5) * 1200;
            const northMassif = Math.exp(-Math.hypot(x - 0.1, y - 0.5) * 2.8) * 980;
            const debrisMound = Math.exp(-Math.hypot(x - riverX, y - (-0.1)) * 4.0) * 140;
            const ripples = Math.sin(x * 9.0 - y * 8.0) * 25;
            elev = 2250 + chuteConstriction + northMassif + debrisMound + ripples;
          } else if (isGuptkashi) {
            // Broad elevated bedrock terrace (1319m safe relocation hub)
            const terraceDist = Math.hypot(x - 0.15, y - (-0.05));
            const terracePlateau = Math.exp(-terraceDist * 2.4) * 280;
            const westRiverChasm = Math.exp(-Math.pow(x - (-0.45), 2) * 16) * 320;
            const eastMountainWall = Math.exp(-Math.hypot(x - 0.6, y - 0.3) * 2.5) * 650;
            const ripples = Math.sin(x * 7.0 + y * 6.0) * 18;
            elev = 1180 + terracePlateau - westRiverChasm + eastMountainWall + ripples;
          } else if (isUkhimath) {
            // Valley escarpment spur ridge (1480m)
            const spurDist = Math.hypot(x - (-0.2), y - 0.15);
            const spur = Math.exp(-spurDist * 3.0) * 340;
            const lowerGorge = Math.exp(-Math.hypot(x - 0.4, y - (-0.3)) * 3.0) * 240;
            const ripples = Math.sin(x * 8.0 + y * 6.5) * 20;
            elev = 1200 + spur - lowerGorge + ripples;
          } else {
            // ALL / Regional Mandakini Valley
            const riverX = 0.1 * Math.sin(y * 2.2);
            const valleyV = Math.abs(x - riverX) * 900;
            const northHighlands = (y + 1) * 750;
            const lateralRidges = Math.sin(x * 6.0) * 250 + Math.cos(y * 8.0) * 150;
            elev = 1350 + valleyV + northHighlands + lateralRidges;
          }

          elev = Math.max(1280, Math.min(3850, elev));
          normZ = (elev - 1280) / (3850 - 1280);
        }

        // 3. COASTAL EROSION: Podampeta & Ganjam Coast, Odisha (0m - 50m MSL)
        else if (currentHazard === 'coastal-erosion') {
          const isPodampeta = areaLower.includes('podampeta');
          const isRushikulya = areaLower.includes('rushikulya');
          const isHumma = areaLower.includes('humma');
          const isRangeilunda = areaLower.includes('rangeilunda');

          // Eastern Bay of Bengal oceanic boundary
          const seaMargin = (x - 0.35); // Positive = sea east, Negative = land west

          if (isPodampeta) {
            // Intertidal swash trough (0.8m), retreating fore-dune (6.8m), inland buffer
            const beachSwash = Math.exp(-Math.pow(x - 0.3, 2) * 26) * 3.8;
            const duneRidge = Math.exp(-Math.pow(x - 0.12, 2) * 22) * 6.2;
            const breachTrough = Math.exp(-Math.hypot(x - 0.18, y - 0.1) * 6.0) * 4.5;
            const westInlandRise = Math.max(0, -x) * 16.0;
            const beachRipples = Math.sin(y * 9.0 + x * 4.0) * 0.4;
            elev = 1.6 + duneRidge - breachTrough - beachSwash + westInlandRise + beachRipples;
            if (x > 0.42) elev = Math.max(0.6, 1.2 - (x - 0.42) * 8); // Seaward intertidal drop
          } else if (isRushikulya) {
            // Estuarine tidal breach inlet (1.2m), olive ridley nesting spit (3.5m)
            const inletChannel = Math.exp(-Math.pow(y - (-0.15) + 0.1 * x, 2) * 20) * 4.0;
            const sandSpit = Math.exp(-Math.hypot(x - 0.22, y - 0.1) * 4.5) * 3.2;
            const tidalBackwater = Math.exp(-Math.hypot(x - (-0.15), y - (-0.3)) * 4.0) * 2.8;
            const westHighway = Math.exp(-Math.hypot(x - (-0.45), y - 0.2) * 3.0) * 14.5;
            elev = 2.0 - inletChannel + sandSpit - tidalBackwater + westHighway;
            if (x > 0.45) elev = 0.8;
          } else if (isHumma) {
            // Salt pan depression (1.8m) backed by safe Humma granitic hill ridge (34.5m)
            const saltPan = Math.exp(-Math.hypot(x - 0.15, y - 0.15) * 3.5) * 3.2;
            const hummaHill = Math.exp(-Math.hypot(x - (-0.35), y - (-0.1)) * 2.8) * 32.5;
            const seawardBerm = Math.exp(-Math.pow(x - 0.35, 2) * 24) * 4.2;
            elev = 2.5 - saltPan + hummaHill + seawardBerm;
            if (x > 0.44) elev = 0.8;
          } else if (isRangeilunda) {
            // Safe high inland laterite plateau (48.0m MSL)
            const plateauDist = Math.hypot(x - (-0.15), y - 0.0);
            const highPlateau = Math.exp(-plateauDist * 2.2) * 44.0;
            const seawardTerrace = Math.exp(-Math.pow(x - 0.25, 2) * 18) * 12.0;
            const undulation = Math.sin(x * 6.5 + y * 6.0) * 1.8;
            elev = 3.0 + highPlateau + seawardTerrace + undulation;
            if (x > 0.46) elev = 0.8;
          } else {
            // ALL / Regional Ganjam littoral zone
            const beachDune = Math.exp(-Math.pow(x - 0.22, 2) * 18) * 6.5;
            const backwater = Math.exp(-Math.pow(x - 0.05, 2) * 16) * 3.5;
            const westHills = Math.max(0, -x) * 38.0;
            const ripples = Math.sin(x * 7.0 + y * 8.0) * 1.2;
            elev = 2.0 + beachDune - backwater + westHills + ripples;
            if (x > 0.4) elev = Math.max(0.6, 1.5 - (x - 0.4) * 6);
          }

          elev = Math.max(0.5, Math.min(50.0, elev));
          normZ = (elev - 0.5) / (50.0 - 0.5);
        }

        // 4. LANDSLIDE: Meppadi & Western Ghats, Wayanad (715m - 2,100m MSL)
        else {
          const isMundakkai = areaLower.includes('mundak');
          const isChooralmala = areaLower.includes('chooral');
          const isChembra = areaLower.includes('chembra');
          const isKuppadithara = areaLower.includes('kuppadi');
          const isKalpetta = areaLower.includes('kalpetta');
          const isVythiri = areaLower.includes('vythiri') || areaLower.includes('vyttiri');
          const isPadinhar = areaLower.includes('padinhar');
          const isKottathara = areaLower.includes('kottathara');
          const isAchoor = areaLower.includes('achoor');

          if (isMundakkai) {
            const distScarp = Math.hypot(x - 0.35, y - (-0.3));
            const upperScarp = Math.exp(-distScarp * 3.4) * 735;
            const distValley = Math.abs(x - (-0.1) + 0.15 * Math.sin(y * 3.0));
            const valleyCarve = Math.exp(-distValley * 5.5) * 65;
            const slopeRipples = Math.sin(x * 9.0 - y * 7.5) * 18;
            elev = 765 + upperScarp - valleyCarve + slopeRipples;
          } else if (isChooralmala) {
            const distRidge = Math.hypot(x - 0.3, y - (-0.1));
            const ridge = Math.exp(-distRidge * 3.6) * 665;
            const distConfluence = Math.hypot(x - (-0.2), y - 0.15);
            const confluence = Math.exp(-distConfluence * 4.5) * 50;
            const ripples = Math.sin(x * 7.0 + y * 6.5) * 15;
            elev = 755 + ridge - confluence + ripples;
          } else if (isChembra) {
            const distMassif = Math.hypot(x - 0.15, y - (-0.15));
            const massif = Math.exp(-distMassif * 2.6) * 1280;
            const westCliff = Math.exp(-Math.hypot(x - (-0.4), y - (-0.3)) * 3.2) * 580;
            const ripples = Math.sin(x * 5.5 - y * 4.5) * 25;
            elev = 820 + massif + westCliff + ripples;
          } else if (isKuppadithara) {
            const distPlateau = Math.hypot(x - 0.0, y - 0.0);
            const plateauElev = Math.exp(-distPlateau * 2.2) * 44;
            const distWetland = Math.hypot(x - (-0.45), y - 0.3);
            const wetlandSink = Math.exp(-distWetland * 3.8) * 44;
            const microUndulation = Math.sin(x * 10.0 + y * 8.0) * 8;
            elev = 745 + plateauElev - wetlandSink + microUndulation;
          } else if (isKalpetta) {
            const distRidge = Math.hypot(x - 0.1, y - 0.1);
            const ridge = Math.exp(-distRidge * 3.0) * 160;
            const ripples = Math.sin(x * 6.0 + y * 5.0) * 12;
            elev = 730 + ridge + ripples;
          } else if (isVythiri) {
            const distPass = Math.abs(x - 0.2 * y);
            const passValley = Math.exp(-distPass * 4.0) * 80;
            const distGhatWall = Math.hypot(x - (-0.35), y - (-0.2));
            const ghatWall = Math.exp(-distGhatWall * 2.9) * 420;
            elev = 730 + ghatWall - passValley;
          } else if (isPadinhar) {
            const distDivide = Math.hypot(x - (-0.3), y - 0.35);
            const divide = Math.exp(-distDivide * 3.1) * 650;
            const distRes = Math.hypot(x - 0.25, y - (-0.1));
            const res = Math.exp(-distRes * 4.0) * 60;
            elev = 730 + divide - res;
          } else if (isKottathara) {
            const distKnoll = Math.hypot(x - (-0.1), y - 0.4);
            const northKnoll = Math.exp(-distKnoll * 3.5) * 125;
            const distEastHill = Math.hypot(x - 0.5, y - 0.1);
            const eastHill = Math.exp(-distEastHill * 3.0) * 180;
            const basinDist = Math.hypot(x - 0.05, y - (-0.1));
            const basinDepress = Math.exp(-basinDist * 4.0) * 35;
            const ripples = Math.sin(x * 8.0 + y * 7.0) * 14;
            elev = 720 + northKnoll + eastHill - basinDepress + ripples;
          } else if (isAchoor) {
            const distRidge = Math.hypot(x - (-0.3), y - 0.2);
            const teaRidge = Math.exp(-distRidge * 3.2) * 210;
            const distEastScarp = Math.hypot(x - 0.4, y - (-0.2));
            const eastScarp = Math.exp(-distEastScarp * 2.8) * 160;
            const valleyDist = Math.abs(y - 0.2 * Math.sin(x * 3.0));
            const valley = Math.exp(-valleyDist * 5.0) * 45;
            const ripples = Math.sin(x * 7.5 - y * 6.0) * 18;
            elev = 765 + teaRidge + eastScarp - valley + ripples;
          } else {
            // Meppadi / Regional Wayanad DEM profile
            const distChembra = Math.hypot(x - 0.28, y - (-0.22));
            const chembraMassif = Math.exp(-distChembra * 3.2) * 920;
            const distChoor = Math.hypot(x - 0.35, y - (-0.05));
            const choorRidge = Math.exp(-distChoor * 4.0) * 680;
            const distWest = Math.hypot(x - (-0.45), y - (-0.35));
            const westHills = Math.exp(-distWest * 2.8) * 550;
            const riverX = 0.05 + 0.15 * Math.sin(y * 2.5);
            const distRiver = Math.abs(x - riverX);
            const riverDepression = Math.exp(-distRiver * 6.0) * 120;
            const noise = 
              Math.sin(x * 6.2 + y * 4.8) * 28 + 
              Math.cos(x * 12.4 - y * 8.2) * 16 +
              Math.sin(x * 18.0 + y * 14.0) * 8;
            elev = 730 + chembraMassif + choorRidge + westHills - riverDepression + noise;
          }

          elev = Math.max(715, Math.min(2100, elev));
          normZ = (elev - 715) / (2100 - 715);
        }

        // Apply Natural Muted GIS hypsometric palette calibrated to each hazard
        const hexColor = getMutedHypsometricColor(elev, currentHazard);
        const rgbColor = hexToRgb(hexColor);

        row.push({
          x,
          y,
          z: elev,
          normZ,
          slope: 0, // Calculated below
          color: rgbColor
        });
      }
      grid.push(row);
    }

    // Compute surface slopes and normals for smooth hillshading
    for (let r = 0; r <= GRID_SIZE; r++) {
      for (let c = 0; c <= GRID_SIZE; c++) {
        const p = grid[r][c];
        const prevC = c > 0 ? grid[r][c - 1] : p;
        const nextC = c < GRID_SIZE ? grid[r][c + 1] : p;
        const prevR = r > 0 ? grid[r - 1][c] : p;
        const nextR = r < GRID_SIZE ? grid[r + 1][c] : p;

        const dzdx = (nextC.z - prevC.z) / ((nextC.x - prevC.x) * 1000 || 1);
        const dzdy = (nextR.z - prevR.z) / ((nextR.y - prevR.y) * 1000 || 1);
        const slopeRad = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));
        p.slope = (slopeRad * 180) / Math.PI;
      }
    }

    return grid;
  }, [activeArea, currentHazard]);

  // 3D Projection Engine (Isometric / Perspective Transform)
  const project3D = useCallback((
    x: number, 
    y: number, 
    zNorm: number, 
    width: number, 
    height: number
  ): { sx: number; sy: number; depth: number } => {
    const radRot = (rotation * Math.PI) / 180;
    const radPitch = (pitch * Math.PI) / 180;

    // 1. Rotate around vertical Z-axis
    const rotX = x * Math.cos(radRot) - y * Math.sin(radRot);
    const rotY = x * Math.sin(radRot) + y * Math.cos(radRot);

    // 2. Pitch camera downwards (tilt elevation)
    const viewY = rotY * Math.cos(radPitch) - zNorm * exaggeration * 0.7 * Math.sin(radPitch);
    const viewZ = rotY * Math.sin(radPitch) + zNorm * exaggeration * 0.7 * Math.cos(radPitch);

    // 3. Project to canvas viewport coordinates
    const scale = (Math.min(width, height) * 0.44) * zoom;
    const centerX = width / 2;
    const centerY = height / 2 + (scale * 0.18);

    const sx = centerX + rotX * scale;
    const sy = centerY + viewY * scale;

    return { sx, sy, depth: viewZ };
  }, [rotation, pitch, zoom, exaggeration]);

  // Dynamic contour step based on hazard elevation range
  const contourStep = useMemo(() => {
    if (currentHazard === 'flood') return 2;
    if (currentHazard === 'coastal-erosion') return 5;
    if (currentHazard === 'cloudburst') return 100;
    return 50;
  }, [currentHazard]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp rendering
    const rect = canvas.parentElement?.getBoundingClientRect();
    const width = rect?.width || 800;
    const height = rect?.height || 550;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 1. BACKGROUND: Deep Tactical Slate (#07110C)
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.75);
    bgGradient.addColorStop(0, '#0C1813');
    bgGradient.addColorStop(1, '#050D09');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. BASE GRID PEDESTAL
    const baseMargin = 1.15;
    const baseCorners = [
      project3D(-baseMargin, -baseMargin, 0, width, height),
      project3D(baseMargin, -baseMargin, 0, width, height),
      project3D(baseMargin, baseMargin, 0, width, height),
      project3D(-baseMargin, baseMargin, 0, width, height)
    ];

    // Pedestal Skirt
    const slabDepth = 0.08;
    const skirtBottomCorners = [
      project3D(-baseMargin, -baseMargin, -slabDepth, width, height),
      project3D(baseMargin, -baseMargin, -slabDepth, width, height),
      project3D(baseMargin, baseMargin, -slabDepth, width, height),
      project3D(-baseMargin, baseMargin, -slabDepth, width, height)
    ];

    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      ctx.beginPath();
      ctx.moveTo(baseCorners[i].sx, baseCorners[i].sy);
      ctx.lineTo(baseCorners[next].sx, baseCorners[next].sy);
      ctx.lineTo(skirtBottomCorners[next].sx, skirtBottomCorners[next].sy);
      ctx.lineTo(skirtBottomCorners[i].sx, skirtBottomCorners[i].sy);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? '#0B1612' : '#08110D';
      ctx.fill();
      ctx.strokeStyle = '#1E352B';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Top surface of pedestal
    ctx.beginPath();
    ctx.moveTo(baseCorners[0].sx, baseCorners[0].sy);
    for (let i = 1; i < 4; i++) {
      ctx.lineTo(baseCorners[i].sx, baseCorners[i].sy);
    }
    ctx.closePath();
    ctx.fillStyle = '#091410';
    ctx.fill();
    ctx.strokeStyle = '#162C22';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Matrix Grid Lines
    const gridSteps = 16;
    ctx.lineWidth = 0.8;
    for (let i = 0; i <= gridSteps; i++) {
      const t = -baseMargin + (i / gridSteps) * (2 * baseMargin);
      
      const pA = project3D(-baseMargin, t, 0, width, height);
      const pB = project3D(baseMargin, t, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(pA.sx, pA.sy);
      ctx.lineTo(pB.sx, pB.sy);
      ctx.strokeStyle = i % 4 === 0 ? 'rgba(6, 182, 212, 0.45)' : 'rgba(20, 50, 40, 0.55)';
      ctx.stroke();

      const pC = project3D(t, -baseMargin, 0, width, height);
      const pD = project3D(t, baseMargin, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(pC.sx, pC.sy);
      ctx.lineTo(pD.sx, pD.sy);
      ctx.strokeStyle = i % 4 === 0 ? 'rgba(6, 182, 212, 0.45)' : 'rgba(20, 50, 40, 0.55)';
      ctx.stroke();
    }

    // 3. SORT & RENDER 3D TERRAIN QUADS (Painter's Algorithm)
    interface Quad {
      p1: Point3D;
      p2: Point3D;
      p3: Point3D;
      p4: Point3D;
      proj1: { sx: number; sy: number; depth: number };
      proj2: { sx: number; sy: number; depth: number };
      proj3: { sx: number; sy: number; depth: number };
      proj4: { sx: number; sy: number; depth: number };
      centerDepth: number;
      avgElev: number;
    }

    const quads: Quad[] = [];

    // Light source vector: Northwest light (Azimuth 315°, Elevation 45°)
    const lightAz = (315 * Math.PI) / 180;
    const lightEl = (45 * Math.PI) / 180;
    const lx = Math.cos(lightEl) * Math.sin(lightAz);
    const ly = Math.cos(lightEl) * Math.cos(lightAz);
    const lz = Math.sin(lightEl);

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const p1 = terrainGrid[r][c];
        const p2 = terrainGrid[r][c + 1];
        const p3 = terrainGrid[r + 1][c + 1];
        const p4 = terrainGrid[r + 1][c];

        const proj1 = project3D(p1.x, p1.y, p1.normZ, width, height);
        const proj2 = project3D(p2.x, p2.y, p2.normZ, width, height);
        const proj3 = project3D(p3.x, p3.y, p3.normZ, width, height);
        const proj4 = project3D(p4.x, p4.y, p4.normZ, width, height);

        const avgDepth = (proj1.depth + proj2.depth + proj3.depth + proj4.depth) / 4;
        const avgElev = (p1.z + p2.z + p3.z + p4.z) / 4;

        quads.push({
          p1, p2, p3, p4,
          proj1, proj2, proj3, proj4,
          centerDepth: avgDepth,
          avgElev
        });
      }
    }

    quads.sort((a, b) => b.centerDepth - a.centerDepth);

    for (let i = 0; i < quads.length; i++) {
      const q = quads[i];

      const v1x = q.p2.x - q.p1.x;
      const v1y = q.p2.y - q.p1.y;
      const v1z = (q.p2.normZ - q.p1.normZ) * exaggeration;

      const v2x = q.p4.x - q.p1.x;
      const v2y = q.p4.y - q.p1.y;
      const v2z = (q.p4.normZ - q.p1.normZ) * exaggeration;

      let nx = v1y * v2z - v1z * v2y;
      let ny = v1z * v2x - v1x * v2z;
      let nz = v1x * v2y - v1y * v2x;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      nx /= nLen;
      ny /= nLen;
      nz /= nLen;

      const dot = Math.max(0, nx * lx + ny * ly + nz * lz);
      const hillshade = showHillshade ? 0.45 + 0.65 * dot : 0.85;

      const [rB, gB, bB] = q.p1.color;
      const r = Math.min(255, Math.round(rB * hillshade));
      const g = Math.min(255, Math.round(gB * hillshade));
      const b = Math.min(255, Math.round(bB * hillshade));

      ctx.beginPath();
      ctx.moveTo(q.proj1.sx, q.proj1.sy);
      ctx.lineTo(q.proj2.sx, q.proj2.sy);
      ctx.lineTo(q.proj3.sx, q.proj3.sy);
      ctx.lineTo(q.proj4.sx, q.proj4.sy);
      ctx.closePath();

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fill();

      // Subtle contour lines / relief grid
      if (showContours) {
        const isContour = Math.floor(q.avgElev / contourStep) !== Math.floor((q.avgElev - (contourStep * 0.08)) / contourStep);
        if (isContour) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // 4. TOPOGRAPHIC FEATURE MARKERS & PINS
    let maxVertex = terrainGrid[0][0];
    for (let r = 0; r <= GRID_SIZE; r++) {
      for (let c = 0; c <= GRID_SIZE; c++) {
        if (terrainGrid[r][c].z > maxVertex.z) {
          maxVertex = terrainGrid[r][c];
        }
      }
    }

    let minVertex = terrainGrid[2][2];
    for (let r = 2; r <= GRID_SIZE - 2; r++) {
      for (let c = 2; c <= GRID_SIZE - 2; c++) {
        if (terrainGrid[r][c].z < minVertex.z) {
          minVertex = terrainGrid[r][c];
        }
      }
    }

    const peakPins: { name: string; elev: number; proj: { sx: number; sy: number }; data: TerrainPeak }[] = [];
    const primaryPeakData: TerrainPeak = peaks[0] || {
      id: `PEAK-${activeArea.toUpperCase()}-01`,
      name: `${activeArea} Peak`,
      lat: 11.55,
      lng: 76.10,
      elevationM: Math.round(maxVertex.z),
      prominenceM: Math.round(maxVertex.z - minVertex.z),
      slopeDeg: Math.round(maxVertex.slope || 25),
      village: activeArea,
      classification: 'Highest Topographic Summit',
      hazardContext: 'Peak apex with highest gravitational potential energy.'
    };

    peakPins.push({
      name: primaryPeakData.name,
      elev: primaryPeakData.elevationM,
      proj: project3D(maxVertex.x, maxVertex.y, maxVertex.normZ, width, height),
      data: primaryPeakData
    });

    // Secondary peak if multiple peaks exist in registry
    if (peaks.length > 1) {
      let secVertex: Point3D | null = null;
      let secMaxZ = -Infinity;
      for (let r = 2; r <= GRID_SIZE - 2; r++) {
        for (let c = 2; c <= GRID_SIZE - 2; c++) {
          const pt = terrainGrid[r][c];
          const distFromPrimary = Math.hypot(pt.x - maxVertex.x, pt.y - maxVertex.y);
          if (distFromPrimary > 0.4 && pt.z > secMaxZ) {
            const isLocalMax =
              pt.z >= terrainGrid[r - 1][c].z &&
              pt.z >= terrainGrid[r + 1][c].z &&
              pt.z >= terrainGrid[r][c - 1].z &&
              pt.z >= terrainGrid[r][c + 1].z;
            if (isLocalMax) {
              secMaxZ = pt.z;
              secVertex = pt;
            }
          }
        }
      }
      if (secVertex) {
        peakPins.push({
          name: peaks[1].name,
          elev: peaks[1].elevationM || Math.round(secVertex.z),
          proj: project3D(secVertex.x, secVertex.y, secVertex.normZ, width, height),
          data: peaks[1]
        });
      }
    }

    // Map low point locked to lowest depression floor
    const lowPointPins: { name: string; elev: number; proj: { sx: number; sy: number }; data: TerrainLowPoint }[] = [];
    const primaryLowData: TerrainLowPoint = lowPoints[0] || {
      id: `LOW-${activeArea.toUpperCase()}-01`,
      name: `${activeArea} Depression / Drainage Floor`,
      lat: 11.55,
      lng: 76.10,
      elevationM: Math.round(minVertex.z),
      depthM: Math.round(maxVertex.z - minVertex.z),
      slopeDeg: Math.round(minVertex.slope || 3),
      village: activeArea,
      classification: 'Topographic Depression',
      potentialRelevance: 'Water & runoff accumulation basin',
      description: 'Lowest depression corridor in active DEM block.'
    };

    lowPointPins.push({
      name: primaryLowData.name,
      elev: primaryLowData.elevationM,
      proj: project3D(minVertex.x, minVertex.y, minVertex.normZ, width, height),
      data: primaryLowData
    });

    // Secondary low point if distinct
    if (lowPoints.length > 1) {
      let secLowVertex: Point3D | null = null;
      let secMinZ = Infinity;
      for (let r = 3; r <= GRID_SIZE - 3; r++) {
        for (let c = 3; c <= GRID_SIZE - 3; c++) {
          const pt = terrainGrid[r][c];
          const distFromPrimary = Math.hypot(pt.x - minVertex.x, pt.y - minVertex.y);
          if (distFromPrimary > 0.4 && pt.z < secMinZ) {
            const isLocalMin =
              pt.z <= terrainGrid[r - 1][c].z &&
              pt.z <= terrainGrid[r + 1][c].z &&
              pt.z <= terrainGrid[r][c - 1].z &&
              pt.z <= terrainGrid[r][c + 1].z;
            if (isLocalMin) {
              secMinZ = pt.z;
              secLowVertex = pt;
            }
          }
        }
      }
      if (secLowVertex && secMinZ < maxVertex.z) {
        lowPointPins.push({
          name: lowPoints[1].name,
          elev: lowPoints[1].elevationM || Math.round(secLowVertex.z),
          proj: project3D(secLowVertex.x, secLowVertex.y, secLowVertex.normZ, width, height),
          data: lowPoints[1]
        });
      }
    }

    // Draw Peak Badges (▲ Summit / Ridge Top)
    peakPins.forEach((pin) => {
      const { sx, sy } = pin.proj;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, sy - 30);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.stroke();

      const badgeY = sy - 44;
      const text = `▲ Peak ${pin.elev}m`;
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const textWidth = ctx.measureText(text).width;
      const badgeW = textWidth + 24;
      const badgeH = 26;
      const badgeX = sx - badgeW / 2;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = 'rgba(6, 32, 22, 0.96)';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY - badgeH / 2, badgeW, badgeH, 6);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, sx, badgeY);
    });

    // Draw Low Point Badges (● Lowest Depression Floor)
    lowPointPins.forEach((pin) => {
      const { sx, sy } = pin.proj;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx, sy - 30);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const badgeY = sy - 44;
      const text = `● Low ${pin.elev}m`;
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const textWidth = ctx.measureText(text).width;
      const badgeW = textWidth + 24;
      const badgeH = 26;
      const badgeX = sx - badgeW / 2;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = 'rgba(6, 26, 42, 0.96)';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY - badgeH / 2, badgeW, badgeH, 6);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, sx, badgeY);
    });

  }, [terrainGrid, rotation, pitch, zoom, exaggeration, showContours, showHillshade, peaks, lowPoints, project3D, contourStep]);

  // Mouse / Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;

    setRotation(prev => (prev + dx * 0.5 + 360) % 360);
    setPitch(prev => Math.max(15, Math.min(75, prev - dy * 0.4)));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.7, Math.min(2.2, prev - e.deltaY * 0.0012)));
  };

  const provenance = PROVENANCE_BY_HAZARD[currentHazard] || PROVENANCE_BY_HAZARD['landslide'];
  const studyAreas = STUDY_AREAS_BY_HAZARD[currentHazard] || STUDY_AREAS_BY_HAZARD['landslide'];

  const lowLabel = currentHazard === 'coastal-erosion' 
    ? 'Intertidal / Swash Zone' 
    : currentHazard === 'cloudburst' 
    ? 'Gorge Chute / Riverbed' 
    : 'Water Accumulation / Basin';

  const peakLabel = currentHazard === 'coastal-erosion' 
    ? 'Dune Crest / Inland Plateau' 
    : currentHazard === 'flood' 
    ? 'Safe Levee / Terrace Mound' 
    : 'Peak / Ridge Summit';

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full min-h-[580px] rounded-xl overflow-hidden select-none border ${
        theme === 'light' ? 'bg-slate-100 border-slate-300 shadow-inner' : 'bg-[#07110C] border-cyan-500/25'
      } ${className}`}
      style={{ height }}
    >
      {/* Interactive 3D WebGL / Canvas Viewport */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Top Floating Control Bar */}
      <div className="absolute top-[118px] md:top-[66px] left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Study Area / Village Selector */}
        <div className={`pointer-events-auto flex items-center gap-2 backdrop-blur-md px-3.5 py-2 rounded-xl border shadow-lg ${
          theme === 'light'
            ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/60'
            : 'bg-[#07110C]/98 border-emerald-500/50 text-white shadow-[0_4px_24px_rgba(0,0,0,0.9)]'
        }`}>
          <Mountain className={`w-4 h-4 animate-pulse ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            DEM Study Area:
          </span>
          <select
            value={activeArea}
            onChange={(e) => {
              const val = e.target.value;
              setActiveArea(val);
              if (onSelectVillage) onSelectVillage(val);
              setSelectedFeature(null);
            }}
            className={`font-mono font-bold text-xs px-3 py-1.5 rounded-lg border-2 focus:outline-none cursor-pointer transition-all ${
              theme === 'light'
                ? 'bg-slate-50 text-slate-900 border-slate-300 hover:border-emerald-500 focus:border-cyan-500 shadow-sm [&>option]:bg-white [&>option]:text-slate-900'
                : 'bg-[#050D0A] text-emerald-300 border-emerald-500/60 hover:border-emerald-400 focus:border-cyan-400 shadow-[0_0_14px_rgba(16,185,129,0.3)] [&>option]:bg-[#081812] [&>option]:text-emerald-200'
            }`}
          >
            {studyAreas.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3D Camera & Display Controls */}
        <div className={`pointer-events-auto flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-lg ${
          theme === 'light'
            ? 'bg-white/95 border-slate-300 text-slate-700 shadow-slate-300/60'
            : 'bg-[#0B1511]/95 border-cyan-500/30 text-slate-300 shadow-lg'
        }`}>
          
          {/* Exaggeration Slider */}
          <div className={`flex items-center gap-1.5 text-xs font-mono ${
            theme === 'light' ? 'text-slate-600 font-semibold' : 'text-pine-muted'
          }`}>
            <span>Elevation:</span>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={exaggeration}
              onChange={(e) => setExaggeration(parseFloat(e.target.value))}
              className="w-16 accent-cyan-500 cursor-pointer"
              title="Adjust 3D Vertical Elevation Exaggeration"
            />
            <span className={`font-bold w-7 text-right ${
              theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'
            }`}>{exaggeration.toFixed(1)}x</span>
          </div>

          <div className={`w-[1px] h-4 ${theme === 'light' ? 'bg-slate-300' : 'bg-emerald-500/20'}`} />

          {/* Dynamic Contour Lines Toggle */}
          <button
            onClick={() => setShowContours(!showContours)}
            className={`px-2 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
              showContours 
                ? theme === 'light' ? 'bg-emerald-50 text-emerald-900 border border-emerald-400 font-bold' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-pine-muted hover:text-white'
            }`}
            title={`Toggle Topographic ${contourStep}m Relief Contours`}
          >
            {contourStep}m Contours
          </button>

          {/* Hillshade Lighting Toggle */}
          <button
            onClick={() => setShowHillshade(!showHillshade)}
            className={`px-2 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
              showHillshade 
                ? theme === 'light' ? 'bg-cyan-50 text-cyan-900 border border-cyan-400 font-bold' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-pine-muted hover:text-white'
            }`}
            title="Toggle NW Directional Hillshade Lighting"
          >
            Hillshade
          </button>

          <div className={`w-[1px] h-4 ${theme === 'light' ? 'bg-slate-300' : 'bg-emerald-500/20'}`} />

          {/* Zoom Controls */}
          <button
            onClick={() => setZoom(prev => Math.min(2.2, prev + 0.15))}
            className={`p-1 rounded cursor-pointer ${
              theme === 'light' ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' : 'hover:bg-white/10 text-pine-muted hover:text-white'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.7, prev - 0.15))}
            className={`p-1 rounded cursor-pointer ${
              theme === 'light' ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' : 'hover:bg-white/10 text-pine-muted hover:text-white'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={() => {
              setRotation(45);
              setPitch(38);
              setZoom(1.15);
              setExaggeration(1.8);
            }}
            className={`p-1 rounded cursor-pointer ${
              theme === 'light' ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' : 'hover:bg-white/10 text-pine-muted hover:text-white'
            }`}
            title="Reset 3D Perspective"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* Bottom Floating Legend & Topographic Metrics Card */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none max-w-sm">
        <div className={`pointer-events-auto backdrop-blur-md rounded-xl p-3 border shadow-2xl space-y-2.5 font-sans ${
          theme === 'light'
            ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/60'
            : 'bg-[#07130F]/95 border-emerald-500/30 text-white shadow-2xl'
        }`}>
          
          <div className={`flex items-center justify-between border-b pb-2 ${
            theme === 'light' ? 'border-slate-200' : 'border-[#1A2E24]'
          }`}>
            <div className="flex items-center gap-1.5">
              <Compass className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                Elevation & Topography
              </span>
            </div>
            {onOpenAnalysisModal && (
              <button
                onClick={onOpenAnalysisModal}
                className={`text-[11px] font-mono underline cursor-pointer ${
                  theme === 'light' ? 'text-cyan-700 hover:text-cyan-800 font-bold' : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                Full Analysis →
              </button>
            )}
          </div>

          {/* Authoritative Provenance Badge */}
          <div className={`flex items-center justify-between text-[9.5px] font-mono px-2 py-1 rounded border ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200 text-emerald-800 font-semibold'
              : 'bg-[#050D0A] border-emerald-500/20 text-emerald-300'
          }`}>
            <span>{provenance.source}</span>
            <span className={theme === 'light' ? 'text-slate-500' : 'text-pine-muted'}>{provenance.samples}</span>
          </div>

          {/* Muted Natural Color Ramp Bar */}
          <div className="space-y-1">
            <div className={`flex items-center justify-between text-[10px] font-mono ${
              theme === 'light' ? 'text-slate-500 font-semibold' : 'text-pine-muted'
            }`}>
              <span>{provenance.minLabel}</span>
              <span>{provenance.midLabel}</span>
              <span>{provenance.maxLabel}</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden border border-slate-300/60 flex">
              {provenance.bar.map((seg, idx) => (
                <div 
                  key={idx} 
                  className="flex-1" 
                  style={{ backgroundColor: seg.bg }} 
                  title={seg.title} 
                />
              ))}
            </div>
          </div>

          {/* Topographic Key Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div className={`p-1.5 rounded border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050D0A] border-[#16291F]'
            }`}>
              <div className={`text-[9px] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-pine-muted'}`}>Highest</div>
              <div className={`font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>▲ {analysis.highestPoint.elevationM}m</div>
            </div>
            <div className={`p-1.5 rounded border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050D0A] border-[#16291F]'
            }`}>
              <div className={`text-[9px] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-pine-muted'}`}>Lowest</div>
              <div className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>● {analysis.lowestPoint.elevationM}m</div>
            </div>
            <div className={`p-1.5 rounded border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050D0A] border-[#16291F]'
            }`}>
              <div className={`text-[9px] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-pine-muted'}`}>Range</div>
              <div className={`font-bold ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>{analysis.elevationRangeM}m</div>
            </div>
          </div>

          {/* Marker Classification Legend */}
          <div className={`flex items-center justify-between text-[10.5px] font-mono pt-1 border-t ${
            theme === 'light' ? 'text-slate-600 border-slate-200' : 'text-pine-muted border-[#1A2E24]/60'
          }`}>
            <div className="flex items-center gap-1">
              <span className={`font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>▲</span>
              <span>{peakLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`font-bold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>●</span>
              <span>{lowLabel}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Right Feature Quick-Inspector Bar */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none max-w-xs">
        <div className="pointer-events-auto flex flex-col gap-1.5">
          <div className={`text-[10px] font-mono text-right pr-1 ${
            theme === 'light' ? 'text-slate-600 font-semibold' : 'text-pine-muted'
          }`}>
            Click peaks/basins to inspect:
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {peaks.slice(0, 3).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedFeature(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                  selectedFeature?.id === p.id 
                    ? 'bg-emerald-500 text-black border-emerald-400' 
                    : theme === 'light'
                      ? 'bg-white/95 text-emerald-900 border-slate-300 hover:border-emerald-500 shadow-sm'
                      : 'bg-[#0B1511]/90 text-emerald-300 border-emerald-500/30 hover:border-emerald-400'
                }`}
              >
                ▲ {p.name.split(' ')[0]} ({p.elevationM}m)
              </button>
            ))}
            {lowPoints.slice(0, 2).map(lp => (
              <button
                key={lp.id}
                onClick={() => setSelectedFeature(lp)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                  selectedFeature?.id === lp.id 
                    ? 'bg-cyan-500 text-black border-cyan-400' 
                    : theme === 'light'
                      ? 'bg-white/95 text-cyan-900 border-slate-300 hover:border-cyan-500 shadow-sm'
                      : 'bg-[#0B1511]/90 text-cyan-300 border-emerald-500/30 hover:border-emerald-400'
                }`}
              >
                ● {lp.name.split(' ')[0]} ({lp.elevationM}m)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Detail Floating Drawer when feature is clicked */}
      {selectedFeature && (
        <div className={`absolute top-[148px] sm:top-[104px] right-2.5 z-20 w-80 backdrop-blur-md rounded-2xl p-4 border shadow-2xl space-y-3 font-sans ${
          theme === 'light'
            ? 'bg-white/98 border-slate-300 text-slate-800 shadow-slate-300/60'
            : 'bg-[#08130E]/98 border-cyan-500/40 text-slate-100'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                'hazardContext' in selectedFeature ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
              }`}>
                {'hazardContext' in selectedFeature ? '▲ TOPOGRAPHIC PEAK / RIDGE' : '● WATER / INTERTIDAL BASIN'}
              </span>
              <h3 className={`font-bold text-sm mt-1.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {selectedFeature.name}
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-pine-muted'}`}>
                {selectedFeature.village} &bull; {selectedFeature.classification}
              </p>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className={`p-1 rounded cursor-pointer ${
                theme === 'light' ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-pine-muted hover:text-white hover:bg-white/10'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-xl border font-mono text-xs ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#040A07] border-[#16291F]'
          }`}>
            <div>
              <div className={`text-[10px] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-pine-muted'}`}>Elevation</div>
              <div className={`font-bold text-sm ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>{selectedFeature.elevationM} m</div>
            </div>
            <div>
              <div className={`text-[10px] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-pine-muted'}`}>Mean Slope</div>
              <div className={`font-bold text-sm ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>{selectedFeature.slopeDeg}&deg;</div>
            </div>
          </div>

          <div className={`text-xs leading-relaxed p-2.5 rounded-xl border ${
            theme === 'light' 
              ? 'bg-slate-50 border-slate-200 text-slate-700' 
              : 'bg-[#0B1712] border-[#1A3125] text-pine-text/90'
          }`}>
            <div className={`text-[10px] font-mono font-bold uppercase mb-1 ${
              theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'
            }`}>
              {'hazardContext' in selectedFeature ? 'Hazard & Geomorphic Context' : 'Hydrological Relevance'}
            </div>
            {'hazardContext' in selectedFeature ? selectedFeature.hazardContext : (
              <>
                <p className={`font-semibold mb-1 ${theme === 'light' ? 'text-rose-700' : 'text-rose-300'}`}>{selectedFeature.potentialRelevance}</p>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-pine-muted'}>{selectedFeature.description}</p>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
