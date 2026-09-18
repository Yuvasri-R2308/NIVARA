import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { HazardType, SiteResourceLedger } from '../../types';
import { 
  getSitesForHazard, 
  DEFAULT_PLANNING_ASSUMPTIONS 
} from '../../data/siteCapacityRegistry';
import { getHazardProfile } from '../../data/hazardRegistry';
import { calculateSiteCapacity } from '../../utils/capacityCalculator';
import { 
  AlertTriangle
} from 'lucide-react';

// ============================================================================
// DATA TYPES & INTERFACES
// ============================================================================
export interface NormalizedSafeSite {
  rank: number;
  siteId: string;
  name: string;
  village: string;
  category: string;
  coordinates: [number, number] | null;
  holdingCapacity: number | null;
  availableCapacity: number | null;
  occupiedCapacity: number | null;
  ccasScore: number | null;

  // 5 Essential Facilities: Actual Values, Units, and Percentages
  waterDailyLiters: number | null;
  waterUnit: string;
  waterPct: number | null;
  waterSourceDesc: string;

  toiletsCount: number | null;
  sanitationUnit: string;
  sanitationPct: number | null;
  wasteTypeDesc: string;

  roadStatus: string | null;
  vehicleAccessibility: string | null;
  roadAccessText: string;
  roadAccessUnit: string;
  roadAccessPct: number | null;
  roadTypeDesc: string;

  medicalStaffCount: number | null;
  medicalDoctors: number | null;
  medicalNurses: number | null;
  triageBeds: number | null;
  medicalText: string;
  medicalUnit: string;
  medicalPct: number | null;
  hospitalDesc: string;

  electricityStatus: string | null;
  generatorKva: number | null;
  powerText: string;
  powerUnit: string;
  powerPct: number | null;
  powerSourceDesc: string;

  // Land Breakdown (Hectares)
  usableLandAreaHa: number | null;
  restrictedLandAreaHa: number | null;
  totalLandAreaHa: number | null;

  // 5 Operational Resilience Pillars (0-100%)
  safetyScore: number;
  capacityScore: number;
  transitScore: number;
  utilityScore: number;
  emergencyScore: number;
  safetyDesc: string;
  capacityDesc: string;
  transitDesc: string;
  utilityDesc: string;
  emergencyDesc: string;

  distanceKm: number | null;
  transitMins: number | null;
  presetWaypoints?: [number, number][];
}

interface DangerLocationInfo {
  name: string;
  coordinates: [number, number] | null;
}

// Map Controller for smooth flyTo
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  selectedCoords: [number, number] | null;
}> = ({ center, zoom, selectedCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedCoords) {
      map.flyTo(selectedCoords, Math.max(map.getZoom(), 12), { animate: true, duration: 0.8 });
    } else {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, selectedCoords, map]);

  return null;
};

// Create SVG Numbered Map Marker Icons (1, 2, 3, 4)
const createNumberedIcon = (numberStr: string, isSelected: boolean) => {
  const bg = isSelected ? '#10B981' : '#0F291E';
  const border = isSelected ? '#FFFFFF' : '#10B981';
  const text = isSelected ? '#000000' : '#FFFFFF';
  const size = isSelected ? 40 : 32;

  const svgHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${bg};
      border: ${isSelected ? '3px' : '2px'} solid ${border};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${text};
      font-family: monospace;
      font-weight: 900;
      font-size: ${isSelected ? '16px' : '13px'};
      box-shadow: ${isSelected ? '0 0 20px rgba(16, 185, 129, 0.8), 0 4px 14px rgba(0,0,0,0.9)' : '0 4px 10px rgba(0,0,0,0.8)'};
      cursor: pointer;
      transition: all 0.25s ease;
    ">
      ${numberStr}
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-numbered-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Danger Origin Marker Icon
const createDangerIcon = () => {
  const svgHtml = `
    <div style="
      width: 36px;
      height: 36px;
      background: #E11D48;
      border: 2.5px solid #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      box-shadow: 0 0 18px #E11D48, 0 4px 12px rgba(0,0,0,0.8);
      cursor: pointer;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-danger-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

// ============================================================================
// COMPONENT: CCAS GAUGE CHART (SEMI-CIRCLE ARC)
// ============================================================================
const CcasGauge: React.FC<{ score: number | null; theme?: 'light' | 'dark' }> = ({ score, theme = 'dark' }) => {
  if (score === null || score === undefined) {
    return (
      <div className={`h-64 flex items-center justify-center font-mono text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
        No data
      </div>
    );
  }

  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 92;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength * (1 - clampedScore / 100);

  const getRating = (val: number) => {
    if (val >= 80) return { 
      label: 'SAFE', 
      color: theme === 'light' ? '#047857' : '#10B981', 
      bg: theme === 'light' ? 'bg-emerald-50' : 'bg-emerald-950/80', 
      border: theme === 'light' ? 'border-emerald-300' : 'border-emerald-600/50' 
    };
    if (val >= 60) return { 
      label: 'LIMITED', 
      color: theme === 'light' ? '#B45309' : '#F59E0B', 
      bg: theme === 'light' ? 'bg-amber-50' : 'bg-amber-950/60', 
      border: theme === 'light' ? 'border-amber-300' : 'border-amber-700/50' 
    };
    return { 
      label: 'NOT SUITABLE', 
      color: theme === 'light' ? '#BE123C' : '#F43F5E', 
      bg: theme === 'light' ? 'bg-rose-50' : 'bg-rose-950/60', 
      border: theme === 'light' ? 'border-rose-300' : 'border-rose-700/50' 
    };
  };

  const rating = getRating(clampedScore);

  return (
    <div className="flex flex-col items-center justify-center h-64 select-none">
      <svg width="250" height="150" viewBox="0 0 250 150" className="overflow-visible">
        <defs>
          <linearGradient id="ccasGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
        {/* Background Arc */}
        <path
          d="M 33 115 A 92 92 0 0 1 217 115"
          fill="none"
          stroke={theme === 'light' ? '#E2E8F0' : '#14281E'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <path
          d="M 33 115 A 92 92 0 0 1 217 115"
          fill="none"
          stroke="url(#ccasGaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {/* Score Display in Center */}
        <text x="125" y="94" textAnchor="middle" className={`font-mono font-black ${theme === 'light' ? 'fill-slate-900' : 'fill-white'}`} style={{ fontSize: '40px' }}>
          {clampedScore.toFixed(1)}
        </text>
        <text x="125" y="114" textAnchor="middle" className={`font-mono text-[10.5px] uppercase tracking-wider font-bold ${theme === 'light' ? 'fill-slate-500' : 'fill-slate-400'}`}>
          SCORE / 100
        </text>
        {/* Ticks */}
        <text x="32" y="136" textAnchor="middle" className={`font-mono text-[10px] ${theme === 'light' ? 'fill-slate-400' : 'fill-slate-500'}`}>0</text>
        <text x="125" y="18" textAnchor="middle" className={`font-mono text-[10px] ${theme === 'light' ? 'fill-slate-400' : 'fill-slate-500'}`}>50</text>
        <text x="218" y="136" textAnchor="middle" className={`font-mono text-[10px] ${theme === 'light' ? 'fill-slate-400' : 'fill-slate-500'}`}>100</text>
      </svg>

      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${rating.bg} ${rating.border}`} style={{ color: rating.color }}>
        {rating.label}
      </div>
      <p className={`text-[11px] font-sans mt-1.5 text-center ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
        CCAS: Safe-site capacity assessment
      </p>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: SAFE RELOCATION DECISION DASHBOARD
// ============================================================================
export const SafeRelocationDashboard: React.FC = () => {
  const { selectedHazard, theme } = useApp();
  const hazardKey: HazardType = selectedHazard || 'landslide';

  // Active Hazard Profile
  const profile = useMemo(() => getHazardProfile(hazardKey), [hazardKey]);

  // Selected site index (0 = Site 1, 1 = Site 2, 2 = Site 3, 3 = Site 4)
  const [selectedSiteIndex, setSelectedSiteIndex] = useState<number>(0);

  // Reset selected site to 0 when switching hazard
  useEffect(() => {
    setSelectedSiteIndex(0);
  }, [hazardKey]);

  // Route state
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [routeDurationMins, setRouteDurationMins] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Basemap switcher ('canvas' adapts to light/dark, 'satellite', 'topo')
  const [basemap, setBasemap] = useState<'canvas' | 'satellite' | 'topo'>('canvas');

  // Disaster Subtitle for the 4 modules
  const disasterSubtitle = useMemo(() => {
    switch (hazardKey) {
      case 'flood':
        return 'Flood — Dibrugarh, Assam';
      case 'cloudburst':
        return 'Cloudburst — Kedarnath, Uttarakhand';
      case 'coastal-erosion':
        return 'Coastal Erosion — Brahmapur Coast, Ganjam, Odisha';
      case 'landslide':
      default:
        return 'Landslide — Meppadi, Wayanad, Kerala';
    }
  }, [hazardKey]);

  // Selected Site Identity Subtitle
  const selectedSiteSubtitle = useMemo(() => {
    switch (hazardKey) {
      case 'flood':
        return 'Recommended place outside the flood-affected area.';
      case 'cloudburst':
        return 'Recommended safer place away from areas at risk from extreme rainfall and flash flooding.';
      case 'coastal-erosion':
        return 'Recommended safer place away from the erosion-prone coast.';
      case 'landslide':
      default:
        return 'Recommended place away from landslide danger.';
    }
  }, [hazardKey]);

  // Panel 4 Site Capacity Subtitle
  const siteCapacitySubtitle = useMemo(() => {
    switch (hazardKey) {
      case 'flood':
        return 'Ability of the site to safely support people during relocation.';
      case 'cloudburst':
        return 'Ability of the site to safely support relocated people.';
      case 'coastal-erosion':
        return 'Ability of the site to safely support relocated people.';
      case 'landslide':
      default:
        return 'Ability of the site to safely support relocated families.';
    }
  }, [hazardKey]);

  // Map Route Corridor Header Label
  const routeCorridorLabel = useMemo(() => {
    switch (hazardKey) {
      case 'flood':
        return 'From flood-affected area → Safe relocation site';
      case 'coastal-erosion':
        return 'From coastal risk area → Safe relocation site';
      case 'cloudburst':
      case 'landslide':
      default:
        return 'From affected area → Safe relocation site';
    }
  }, [hazardKey]);

  // Danger Location from Real Project Dataset
  const dangerLocation = useMemo<DangerLocationInfo>(() => {
    if (profile.redZone && Array.isArray(profile.redZone.coordinates) && profile.redZone.coordinates.length === 2) {
      return {
        name: profile.redZone.name || `${profile.studyLocation} Danger Zone`,
        coordinates: profile.redZone.coordinates
      };
    }
    switch (hazardKey) {
      case 'flood':
        return { name: 'Rohmaria Multi-Chapari High Scour Zone, Dibrugarh', coordinates: [27.485, 94.915] };
      case 'cloudburst':
        return { name: 'Mandakini Gorge Flash Runoff Channel, Kedarnath', coordinates: [30.735, 79.066] };
      case 'coastal-erosion':
        return { name: 'Podampeta Intertidal Beachfront, Ganjam Coast', coordinates: [19.385, 85.085] };
      case 'landslide':
      default:
        return { name: 'Chooralmala & Mundakkai Riverbed, Meppadi', coordinates: [11.540, 76.138] };
    }
  }, [hazardKey, profile]);

  // Candidate sites from active hazard registry
  const candidateSites = useMemo<SiteResourceLedger[]>(() => {
    return getSitesForHazard(hazardKey);
  }, [hazardKey]);

  // Exactly four highest-ranked valid sites (excluding rejected hazard red-zone sites)
  const rankedSites = useMemo<NormalizedSafeSite[]>(() => {
    if (!candidateSites || candidateSites.length === 0) return [];

    const validRawSites = candidateSites.filter(s => !s.isInsideHazardRedZone);

    const scoredList = validRawSites.map((site) => {
      const calc = calculateSiteCapacity(site, DEFAULT_PLANNING_ASSUMPTIONS, 2000);

      const matchingDest = profile.safeDestinations?.find(
        d => d.id === site.siteId || d.name.toLowerCase().includes(site.village.toLowerCase())
      );

      // 1. Water Standard % (Benchmark: 80 L/person/day for full emergency camp autonomy)
      let waterPct: number | null = null;
      if (typeof site.waterDailyAvailableLiters === 'number' && typeof site.maxGrossCapacityPersons === 'number' && site.maxGrossCapacityPersons > 0) {
        const waterPerCapita = site.waterDailyAvailableLiters / site.maxGrossCapacityPersons;
        waterPct = Math.min(100, Math.max(25, Math.round((waterPerCapita / 80) * 100)));
      }

      // 2. Sanitation Standard % (Benchmark: Sphere 1 toilet per 20 persons)
      let sanitationPct: number | null = null;
      if (typeof site.toiletsAvailable === 'number' && typeof site.maxGrossCapacityPersons === 'number' && site.maxGrossCapacityPersons > 0) {
        const requiredToilets = Math.ceil(site.maxGrossCapacityPersons / DEFAULT_PLANNING_ASSUMPTIONS.peoplePerToilet);
        sanitationPct = Math.min(100, Math.max(20, Math.round((site.toiletsAvailable / requiredToilets) * 100)));
      }

      // 3. Road Access % (Accounts for road surface, vehicle grade & corridor distance)
      let roadAccessPct: number | null = null;
      if (site.roadStatus) {
        const roadScore = site.roadStatus === 'Good' ? 95 : site.roadStatus === 'Moderate' ? 70 : 40;
        const vehicleScore = site.emergencyVehicleAccessibility === 'High' ? 95 : site.emergencyVehicleAccessibility === 'Medium' ? 70 : 40;
        const distDistort = Math.max(0, Math.min(12, Math.round(((site.distanceFromMeppadiKm || 15) - 10) * 0.9)));
        roadAccessPct = Math.min(100, Math.max(25, Math.round((roadScore * 0.5 + vehicleScore * 0.5) - distDistort)));
      }

      // 4. Medical Support % (Benchmark: 2.4 medical staff & 2.8 triage beds per 100 persons)
      let medicalPct: number | null = null;
      const totalStaff = (typeof site.medicalDoctorsOnCall === 'number' ? site.medicalDoctorsOnCall : 0) + 
                         (typeof site.nursesOnCall === 'number' ? site.nursesOnCall : 0);
      if (typeof site.maxGrossCapacityPersons === 'number' && site.maxGrossCapacityPersons > 0 && totalStaff > 0) {
        const staffRate = (totalStaff / site.maxGrossCapacityPersons) * 100;
        const bedsRate = ((site.emergencyTriageBeds || 0) / site.maxGrossCapacityPersons) * 100;
        const staffScore = Math.min(100, Math.round((staffRate / 2.4) * 100));
        const bedsScore = Math.min(100, Math.round((bedsRate / 2.8) * 100));
        medicalPct = Math.min(98, Math.max(30, Math.round(staffScore * 0.6 + bedsScore * 0.4)));
      }

      // 5. Power Availability % (Benchmark: 70 Watts backup generator per person for cold chain & living)
      let powerPct: number | null = null;
      if (site.electricityStatus) {
        if (site.electricityStatus === 'Available') {
          const genKva = typeof site.backupGeneratorCapacityKva === 'number' ? site.backupGeneratorCapacityKva : 50;
          const wattsPerPerson = (genKva * 1000) / (site.maxGrossCapacityPersons || 1000);
          powerPct = Math.min(98, Math.max(40, Math.round((wattsPerPerson / 70) * 100)));
        } else if (site.electricityStatus === 'Limited') {
          powerPct = 50;
        } else {
          powerPct = 20;
        }
      }

      // Operational Resilience Pillars (0-100% via multi-criteria engine)
      const safetyScore = calc.scoreBreakdown?.safetyScore?.points ?? 88;
      const capacityScore = calc.scoreBreakdown?.capacityScore?.points ?? 80;
      const transitScore = calc.scoreBreakdown?.accessibilityScore?.points ?? 82;
      const utilityScore = Math.round((waterPct ?? 80) * 0.4 + (sanitationPct ?? 80) * 0.35 + (powerPct ?? 70) * 0.25);
      const emergencyScore = calc.scoreBreakdown?.emergencyReadinessScore?.points ?? 85;

      const safetyDesc = `Slope ${site.slopeDeg}°, 0% Red Zone, ${site.hazardExposureLevel || 'Low'} exposure`;
      const capacityDesc = `${site.maxGrossCapacityPersons?.toLocaleString() || 'N/A'} People intake capacity`;
      const transitDesc = `${site.travelTimeFromMeppadiMins ? `${site.travelTimeFromMeppadiMins}m travel time` : 'Direct corridor'}, ${site.distanceFromMeppadiKm ? `${site.distanceFromMeppadiKm}km` : 'Safe corridor'}`;
      const utilityDesc = `${site.waterDailyAvailableLiters ? `${(site.waterDailyAvailableLiters / 1000).toFixed(0)}kL/day water` : 'Piped water'} + ${site.backupGeneratorCapacityKva || 0} kVA generator`;
      const emergencyDesc = `${site.ambulancesStationed || 0} Ambulances, ${(site.rescueVehiclesStationed || 0) + (site.fireRescueVehiclesStationed || 0)} Rescue 4x4s, ${totalStaff} Med Staff`;

      // Holding & Available Capacity
      const holdingCapacity = typeof site.maxGrossCapacityPersons === 'number' ? site.maxGrossCapacityPersons : null;
      const occupied = typeof site.existingOccupancyPersons === 'number' ? site.existingOccupancyPersons : 0;
      const availableCapacity = holdingCapacity !== null ? Math.max(0, holdingCapacity - occupied) : null;

      // CCAS / Capacity Score
      const ccasScore = typeof matchingDest?.ccasScore === 'number' 
        ? matchingDest.ccasScore 
        : typeof calc.suitabilityScore === 'number' 
          ? calc.suitabilityScore 
          : null;

      // Coordinates
      const coordinates: [number, number] | null = Array.isArray(site.coordinates) && site.coordinates.length === 2
        ? [site.coordinates[0], site.coordinates[1]]
        : null;

      return {
        rank: 0,
        siteId: site.siteId,
        name: site.name,
        village: site.village,
        category: site.category,
        coordinates,
        holdingCapacity,
        availableCapacity,
        occupiedCapacity: occupied,
        ccasScore,

        // Water
        waterDailyLiters: typeof site.waterDailyAvailableLiters === 'number' ? site.waterDailyAvailableLiters : null,
        waterUnit: 'L/day',
        waterPct,
        waterSourceDesc: site.waterSourceDescription || 'Piped municipal & storage grid',

        // Sanitation
        toiletsCount: typeof site.toiletsAvailable === 'number' ? site.toiletsAvailable : null,
        sanitationUnit: 'Toilets',
        sanitationPct,
        wasteTypeDesc: site.wasteManagementType || 'Twin septic & bio-digester network',

        // Road Access
        roadStatus: site.roadStatus || null,
        vehicleAccessibility: site.emergencyVehicleAccessibility || null,
        roadAccessText: site.roadStatus ? `${site.roadStatus} (${site.emergencyVehicleAccessibility || 'Standard'} Access)` : 'No data',
        roadAccessUnit: 'Corridor Status',
        roadAccessPct,
        roadTypeDesc: site.accessRoadType || 'All-weather arterial highway',

        // Medical
        medicalStaffCount: totalStaff > 0 ? totalStaff : null,
        medicalDoctors: typeof site.medicalDoctorsOnCall === 'number' ? site.medicalDoctorsOnCall : null,
        medicalNurses: typeof site.nursesOnCall === 'number' ? site.nursesOnCall : null,
        triageBeds: typeof site.emergencyTriageBeds === 'number' ? site.emergencyTriageBeds : null,
        medicalText: totalStaff > 0 
          ? `${totalStaff} Staff (${site.medicalDoctorsOnCall || 0} MDs, ${site.emergencyTriageBeds || 0} Beds)` 
          : 'No data',
        medicalUnit: 'Staff & Triage Beds',
        medicalPct,
        hospitalDesc: site.nearestHospitalName || 'District health center network',

        // Power
        electricityStatus: site.electricityStatus || null,
        generatorKva: typeof site.backupGeneratorCapacityKva === 'number' ? site.backupGeneratorCapacityKva : null,
        powerText: site.electricityStatus 
          ? `${site.electricityStatus} (${site.backupGeneratorCapacityKva || 0} kVA Generator)` 
          : 'No data',
        powerUnit: 'Grid & Backup kVA',
        powerPct,
        powerSourceDesc: site.powerGridSource || 'Substation feeder line + backup generator',

        // Land Breakdown
        usableLandAreaHa: typeof site.usableLandAreaHa === 'number' ? site.usableLandAreaHa : null,
        restrictedLandAreaHa: typeof site.restrictedLandAreaHa === 'number' ? site.restrictedLandAreaHa : null,
        totalLandAreaHa: typeof site.totalLandAreaHa === 'number' ? site.totalLandAreaHa : null,

        // 5 Operational Resilience Pillars
        safetyScore,
        capacityScore,
        transitScore,
        utilityScore,
        emergencyScore,
        safetyDesc,
        capacityDesc,
        transitDesc,
        utilityDesc,
        emergencyDesc,

        distanceKm: typeof site.distanceFromMeppadiKm === 'number' ? site.distanceFromMeppadiKm : (matchingDest?.distanceKm ?? null),
        transitMins: typeof site.travelTimeFromMeppadiMins === 'number' ? site.travelTimeFromMeppadiMins : (matchingDest?.transitMins ?? null),
        presetWaypoints: matchingDest?.routeWaypoints
      };
    });

    // Sort descending by suitability / CCAS score
    scoredList.sort((a, b) => (b.ccasScore ?? 0) - (a.ccasScore ?? 0));

    // Exactly top 4
    return scoredList.slice(0, 4).map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [candidateSites, profile]);

  // Selected site object (SINGLE SOURCE OF TRUTH)
  const activeSelectedSite = rankedSites[selectedSiteIndex] || rankedSites[0];

  // Site Selector Handler
  const handleSelectSite = (index: number) => {
    setSelectedSiteIndex(index);
  };

  // Map Default Center
  const mapDefaultCenter = useMemo<[number, number]>(() => {
    if (activeSelectedSite?.coordinates) return activeSelectedSite.coordinates;
    if (dangerLocation?.coordinates) return dangerLocation.coordinates;
    return profile.defaultCenter || [11.540, 76.138];
  }, [activeSelectedSite, dangerLocation, profile]);

  // ==========================================================================
  // REAL ROAD ROUTING LOGIC (OSRM WITH DATASET WAYPOINTS FALLBACK)
  // ==========================================================================
  useEffect(() => {
    if (!dangerLocation.coordinates) {
      setRouteCoordinates(null);
      setRouteDistanceKm(null);
      setRouteDurationMins(null);
      setRouteError('Route unavailable');
      return;
    }

    if (!activeSelectedSite || !activeSelectedSite.coordinates) {
      setRouteCoordinates(null);
      setRouteDistanceKm(null);
      setRouteDurationMins(null);
      setRouteError('Route unavailable');
      return;
    }

    const [dangerLat, dangerLng] = dangerLocation.coordinates;
    const [destLat, destLng] = activeSelectedSite.coordinates;

    let isMounted = true;
    setRouteLoading(true);
    setRouteError(null);

    const fallbackToPreset = () => {
      const fallbackDist = activeSelectedSite.distanceKm ?? null;
      const fallbackTime = activeSelectedSite.transitMins ?? null;
      setRouteDistanceKm(fallbackDist);
      setRouteDurationMins(fallbackTime);

      if (activeSelectedSite.presetWaypoints && activeSelectedSite.presetWaypoints.length >= 2) {
        const pts: [number, number][] = [...activeSelectedSite.presetWaypoints];
        pts[0] = [dangerLat, dangerLng];
        pts[pts.length - 1] = [destLat, destLng];
        setRouteCoordinates(pts);
        setRouteError(null);
      } else {
        setRouteCoordinates([[dangerLat, dangerLng], [destLat, destLng]]);
        setRouteError(null);
      }
    };

    // Prioritize turn-by-turn road geometry via OSRM
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${dangerLng},${dangerLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.routes && data.routes.length > 0 && data.routes[0].geometry && data.routes[0].geometry.coordinates) {
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );
          setRouteCoordinates(coords);
          const distKm = parseFloat((data.routes[0].distance / 1000).toFixed(1));
          const durMins = Math.round(data.routes[0].duration / 60);
          setRouteDistanceKm(distKm);
          setRouteDurationMins(durMins);
          setRouteError(null);
        } else {
          fallbackToPreset();
        }
      })
      .catch(() => {
        if (!isMounted) return;
        fallbackToPreset();
      })
      .finally(() => {
        if (isMounted) setRouteLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dangerLocation, activeSelectedSite]);

  // ==========================================================================
  // CHART DATASETS (FOR CURRENTLY SELECTED SITE ONLY)
  // ==========================================================================

  // Chart 1: Horizontal Bar Chart Data (Actual Values & Units)
  const horizontalBarData = useMemo(() => {
    if (!activeSelectedSite) return [];

    return [
      {
        factor: 'Water',
        pct: activeSelectedSite.waterPct ?? 0,
        actualText: activeSelectedSite.waterDailyLiters !== null 
          ? `${activeSelectedSite.waterDailyLiters.toLocaleString()} L/day` 
          : 'No data',
        unit: 'Liters / Day',
        desc: 'Water available at the site',
        color: '#06B6D4'
      },
      {
        factor: 'Sanitation',
        pct: activeSelectedSite.sanitationPct ?? 0,
        actualText: activeSelectedSite.toiletsCount !== null 
          ? `${activeSelectedSite.toiletsCount} Toilets` 
          : 'No data',
        unit: 'Toilets',
        desc: 'Toilets and sanitation facilities',
        color: '#10B981'
      },
      {
        factor: 'Road Access',
        pct: activeSelectedSite.roadAccessPct ?? 0,
        actualText: activeSelectedSite.roadAccessText,
        unit: 'Corridor Quality',
        desc: 'Road connection to the site',
        color: '#F59E0B'
      },
      {
        factor: 'Medical Support',
        pct: activeSelectedSite.medicalPct ?? 0,
        actualText: activeSelectedSite.medicalText,
        unit: 'Doctors & Triage Beds',
        desc: 'Nearby medical facilities',
        color: '#EC4899'
      },
      {
        factor: 'Electricity',
        pct: activeSelectedSite.powerPct ?? 0,
        actualText: activeSelectedSite.powerText,
        unit: 'Grid & Backup Generator',
        desc: 'Power availability',
        color: '#A855F7'
      }
    ];
  }, [activeSelectedSite]);

  // Chart 2: Pie Chart Data (Usable Land vs Restricted / Buffer Land)
  const pieChartData = useMemo(() => {
    if (!activeSelectedSite) return [];

    const usable = activeSelectedSite.usableLandAreaHa;
    const restricted = activeSelectedSite.restrictedLandAreaHa;

    if (usable === null && restricted === null) return [];
    const usableVal = usable ?? 0;
    const restrictedVal = restricted ?? 0;

    if (usableVal <= 0 && restrictedVal <= 0) return [];

    const slices: Array<{ name: string; value: number; color: string }> = [];

    if (usableVal > 0) {
      slices.push({
        name: 'Usable Land',
        value: usableVal,
        color: '#10B981' // Green/Teal
      });
    }

    if (restrictedVal > 0) {
      slices.push({
        name: 'Restricted / Buffer Land',
        value: restrictedVal,
        color: '#F59E0B' // Amber/Orange
      });
    }

    return slices;
  }, [activeSelectedSite]);

  const hasLandData = pieChartData.length > 0;

  // Custom Land Pie Chart Label Renderer: unclipped & high-contrast
  const renderLandPieLabel = useCallback((props: any) => {
    const { cx, cy, midAngle, outerRadius } = props;
    const name = props.name || props.payload?.name || '';
    const percent = props.percent !== undefined ? props.percent : (props.payload?.percent ?? 0);
    const rawColor = props.payload?.color || props.fill || '#10B981';

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 16;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const isRight = x > cx;
    const textAnchor = isRight ? 'start' : 'end';

    let labelColor = rawColor;
    if (theme === 'light') {
      if (rawColor === '#F59E0B' || rawColor === '#EAB308') {
        labelColor = '#B45309';
      } else if (rawColor === '#10B981') {
        labelColor = '#047857';
      }
    }

    return (
      <text
        x={x}
        y={y}
        fill={labelColor}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="select-none font-mono text-[11px] font-bold tracking-tight"
        style={{
          filter: theme === 'light' ? 'drop-shadow(0 1px 1px rgba(255,255,255,0.9))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))'
        }}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  }, [theme]);

  // Chart 3: Column Bar Chart Data (Site Readiness: Water, Sanitation, Road Access, Medical, Power)
  const siteReadinessData = useMemo(() => {
    if (!activeSelectedSite) return [];

    return [
      { 
        factor: 'Water', 
        score: activeSelectedSite.waterPct ?? 0, 
        detail: activeSelectedSite.waterDailyLiters !== null 
          ? `${activeSelectedSite.waterDailyLiters.toLocaleString()} L/day available` 
          : 'Water available at the site',
        color: '#06B6D4' 
      },
      { 
        factor: 'Sanitation', 
        score: activeSelectedSite.sanitationPct ?? 0, 
        detail: activeSelectedSite.toiletsCount !== null 
          ? `${activeSelectedSite.toiletsCount} toilets available` 
          : 'Toilets and sanitation facilities',
        color: '#10B981' 
      },
      { 
        factor: 'Road Access', 
        score: activeSelectedSite.roadAccessPct ?? 0, 
        detail: activeSelectedSite.roadAccessText !== 'No data' 
          ? activeSelectedSite.roadAccessText 
          : 'Road connection to the site',
        color: '#F59E0B' 
      },
      { 
        factor: 'Medical', 
        score: activeSelectedSite.medicalPct ?? 0, 
        detail: activeSelectedSite.medicalText !== 'No data' 
          ? activeSelectedSite.medicalText 
          : 'Nearby medical facilities',
        color: '#EC4899' 
      },
      { 
        factor: 'Power', 
        score: activeSelectedSite.powerPct ?? 0, 
        detail: activeSelectedSite.powerText !== 'No data' 
          ? activeSelectedSite.powerText 
          : 'Power availability',
        color: '#A855F7' 
      }
    ];
  }, [activeSelectedSite]);

  return (
    <div className={`w-full space-y-8 font-sans transition-colors duration-200 ${
      theme === 'light' ? 'text-slate-900' : 'text-slate-100'
    }`}>

      {/* =====================================================================
          SECTION 1: SAFE RELOCATION SITES
          ===================================================================== */}
      <section className="space-y-4">
        
        {/* Module Header with Active Disaster Module Lockup */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
          theme === 'light' ? 'border-slate-200' : 'border-[#1A2E24]'
        }`}>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-mono font-black tracking-wider uppercase flex items-center gap-3 ${
              theme === 'light' ? 'text-slate-950' : 'text-white'
            }`}>
              <span>SAFE RELOCATION SITES</span>
            </h1>
            <p className={`text-xs font-sans mt-1 ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Select a safe destination to inspect complete carrying capacity, facility readiness, and evacuation routing.
            </p>
          </div>

          <div className={`flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-xl border self-start sm:self-auto ${
            theme === 'light'
              ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
              : 'text-emerald-400 bg-[#07130E] border-[#1A2E24]'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase font-bold tracking-wide">{disasterSubtitle}</span>
          </div>
        </div>

        {/* Clean Location Selector: [ 1 ] [ 2 ] [ 3 ] [ 4 ] */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
          <span className={`text-xs font-mono uppercase font-bold tracking-wider shrink-0 mr-1 ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>
            RECOMMENDED SITES:
          </span>
          {rankedSites.map((site, index) => {
            const isSelected = selectedSiteIndex === index;

            return (
              <button
                key={site.siteId}
                type="button"
                onClick={() => handleSelectSite(index)}
                className={`flex items-center justify-center min-w-[48px] h-[40px] px-3.5 rounded-xl font-mono font-black text-base transition-all cursor-pointer select-none border ${
                  isSelected
                    ? (theme === 'light' 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-105' 
                        : 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.35)] scale-105')
                    : (theme === 'light'
                        ? 'bg-white text-slate-800 border-slate-300 hover:border-emerald-600 hover:text-emerald-700 hover:bg-slate-50 shadow-2xs'
                        : 'bg-[#0A1812] text-slate-300 border-[#1E382B] hover:border-emerald-600 hover:text-white hover:bg-[#0D221A]')
                }`}
                title={`Select Safe Site ${site.rank}: ${site.name}`}
              >
                <span>{site.rank}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Location Identity Card */}
        {activeSelectedSite && (
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-md space-y-3 ${
            theme === 'light'
              ? 'bg-white border-emerald-300 text-slate-900 shadow-sm'
              : 'bg-gradient-to-r from-[#0C1E16] via-[#091711] to-[#07110C] border-emerald-500/40 shadow-xl text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className={`text-xs font-mono uppercase font-black tracking-widest flex items-center gap-2 ${
                  theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${theme === 'light' ? 'bg-emerald-600' : 'bg-emerald-400 animate-pulse'}`} />
                  <span>SAFE RELOCATION SITE</span>
                  <span className={theme === 'light' ? 'text-slate-400' : 'text-slate-500'}>•</span>
                  <span className="font-bold">SITE {activeSelectedSite.rank}</span>
                  <span className={theme === 'light' ? 'text-slate-400' : 'text-slate-500'}>•</span>
                  <span className={theme === 'light' ? 'text-slate-600 font-semibold' : 'text-slate-400'}>{activeSelectedSite.category}</span>
                </div>
                <p className={`text-xs font-sans mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  {selectedSiteSubtitle}
                </p>
              </div>
            </div>

            {/* Location, Holding Capacity, Available Capacity */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t ${
              theme === 'light' ? 'border-slate-200' : 'border-[#162A20]'
            }`}>
              <div>
                <div className={`text-[10px] font-mono uppercase font-bold ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  LOCATION
                </div>
                <div className={`font-bold font-sans text-sm sm:text-base leading-snug mt-0.5 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {activeSelectedSite.name}{activeSelectedSite.village ? `, ${activeSelectedSite.village}` : ''}
                </div>
                {activeSelectedSite.coordinates && (
                  <div className={`text-[10.5px] font-mono mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    GPS: {activeSelectedSite.coordinates[0].toFixed(4)}°N, {activeSelectedSite.coordinates[1].toFixed(4)}°E
                  </div>
                )}
              </div>

              <div>
                <div className={`text-[10px] font-mono uppercase font-bold ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  HOLDING CAPACITY
                </div>
                <div className={`font-mono font-bold text-sm sm:text-base mt-0.5 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {activeSelectedSite.holdingCapacity !== null ? `${activeSelectedSite.holdingCapacity.toLocaleString()} People` : 'No data'}
                </div>
                <div className={`text-[10.5px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Total maximum capacity
                </div>
              </div>

              <div>
                <div className={`text-[10px] font-mono uppercase font-bold ${
                  theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>
                  AVAILABLE CAPACITY
                </div>
                <div className={`font-mono font-bold text-sm sm:text-base mt-0.5 ${
                  theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>
                  {activeSelectedSite.availableCapacity !== null ? `${activeSelectedSite.availableCapacity.toLocaleString()} People` : 'No data'}
                </div>
                <div className={`text-[10.5px] font-mono ${
                  typeof activeSelectedSite.occupiedCapacity === 'number' && activeSelectedSite.occupiedCapacity > 0
                    ? (theme === 'light' ? 'text-amber-700 font-semibold' : 'text-amber-400 font-semibold')
                    : (theme === 'light' ? 'text-slate-500' : 'text-slate-400')
                }`}>
                  {typeof activeSelectedSite.occupiedCapacity === 'number' && activeSelectedSite.occupiedCapacity > 0
                    ? `${activeSelectedSite.occupiedCapacity.toLocaleString()} currently occupied`
                    : 'Ready for intake'}
                </div>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* =====================================================================
          SECTION 2: SUITABLE RELOCATION ANALYSIS (4 CHARTS: 2x2 GRID)
          ===================================================================== */}
      <section className="space-y-4">
        
        <div className={`border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
          theme === 'light' ? 'border-slate-200' : 'border-[#1A2E24]'
        }`}>
          <div>
            <h2 className={`text-xl sm:text-2xl font-mono font-black tracking-wider uppercase ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              SUITABLE RELOCATION ANALYSIS
            </h2>
            <p className={`text-xs font-sans mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Checks whether the selected site has the facilities needed for relocation.
            </p>
          </div>
          <div className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Site 0{activeSelectedSite?.rank} Analysis
          </div>
        </div>

        {/* 2x2 Grid for Desktop, Stacked for Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* -----------------------------------------------------------------
              CHART 1: HORIZONTAL BAR CHART (Facilities Available)
              ----------------------------------------------------------------- */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#07130E] border-[#1A2E24]'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  1. Facilities Available
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  theme === 'light' ? 'text-cyan-800 bg-cyan-50 border-cyan-200 font-semibold' : 'text-cyan-400 bg-cyan-950/70 border-cyan-800/60'
                }`}>
                  Horizontal Bar
                </span>
              </div>
              <p className={`text-[11px] font-sans mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Real source values for essential facilities at the selected site.
              </p>
            </div>

            {/* Custom High-Clarity Horizontal Bars */}
            <div className="space-y-3 pt-1">
              {horizontalBarData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                      {item.factor}
                    </span>
                    <span className="font-bold" style={{ color: item.color }}>
                      {item.actualText}
                    </span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className={`w-full h-3 rounded-full overflow-hidden border ${
                    theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-[#0D2017] border-[#183426]'
                  }`}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(4, Math.min(100, item.pct))}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[10.5px] font-mono">
                    <span className={`leading-tight ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                      {item.desc}
                    </span>
                    <span className={`font-bold shrink-0 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                      {item.pct > 0 ? `${item.pct}% Standard` : 'No data'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* -----------------------------------------------------------------
              CHART 2: PIE CHART (Land Available: Usable vs Restricted Land)
              ----------------------------------------------------------------- */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#07130E] border-[#1A2E24]'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  2. Land Available
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  theme === 'light' ? 'text-emerald-800 bg-emerald-50 border-emerald-200 font-semibold' : 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60'
                }`}>
                  Pie Chart
                </span>
              </div>
              <p className={`text-[11px] font-sans mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Shows how much land can be used safely for relocation.
              </p>
            </div>

            {!hasLandData ? (
              <div className={`h-64 flex flex-col items-center justify-center font-mono text-xs text-center p-4 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <div className="font-bold">Land availability data unavailable</div>
                <p className="text-[11px] mt-1 text-slate-500">No land allocation records logged for this safe site.</p>
              </div>
            ) : (
              <div className="h-68 w-full min-h-[260px] overflow-visible">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 22, right: 30, bottom: 12, left: 30 }} style={{ overflow: 'visible' }}>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      outerRadius={68}
                      innerRadius={0}
                      label={renderLandPieLabel}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke={theme === 'light' ? '#FFFFFF' : '#050D0A'} 
                          strokeWidth={2} 
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={theme === 'light' 
                        ? { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', color: '#0F172A', fontSize: '11px', fontFamily: 'monospace', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } 
                        : { backgroundColor: '#050D0A', borderColor: '#1E382B', fontSize: '11px', fontFamily: 'monospace' }}
                      formatter={(val: any, name: any) => [
                        `${Number(val).toFixed(1)} Ha`,
                        name
                      ]}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '10.5px', fontFamily: 'monospace', paddingTop: '10px', color: theme === 'light' ? '#334155' : '#94A3B8' }} 
                      formatter={(value) => (
                        <span className={`text-[10.5px] font-mono font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Below the chart summary metrics: TOTAL LAND, USABLE LAND, HOLDING CAPACITY, SPACE AVAILABLE */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t ${
              theme === 'light' ? 'border-slate-200' : 'border-[#162A20]'
            }`}>
              {/* TOTAL LAND */}
              <div className={`p-2 rounded-lg border text-center ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050D0A] border-[#162A20]'
              }`}>
                <div className={`text-[9px] font-mono uppercase font-bold ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>TOTAL LAND</div>
                <div className={`text-xs sm:text-sm font-mono font-black mt-0.5 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {activeSelectedSite?.totalLandAreaHa !== null && activeSelectedSite?.totalLandAreaHa !== undefined
                    ? `${activeSelectedSite.totalLandAreaHa.toFixed(1)} Ha`
                    : 'No data'}
                </div>
              </div>

              {/* USABLE LAND */}
              <div className={`p-2 rounded-lg border text-center ${
                theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-[#050D0A] border-emerald-900/40'
              }`}>
                <div className={`text-[9px] font-mono uppercase font-bold ${
                  theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>USABLE LAND</div>
                <div className={`text-xs sm:text-sm font-mono font-black mt-0.5 ${
                  theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>
                  {activeSelectedSite?.usableLandAreaHa !== null && activeSelectedSite?.usableLandAreaHa !== undefined
                    ? `${activeSelectedSite.usableLandAreaHa.toFixed(1)} Ha`
                    : 'No data'}
                </div>
              </div>

              {/* HOLDING CAPACITY */}
              <div className={`p-2 rounded-lg border text-center ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050D0A] border-[#162A20]'
              }`}>
                <div className={`text-[9px] font-mono uppercase font-bold ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>HOLDING CAPACITY</div>
                <div className={`text-xs sm:text-sm font-mono font-black mt-0.5 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {activeSelectedSite?.holdingCapacity !== null && activeSelectedSite?.holdingCapacity !== undefined
                    ? `${activeSelectedSite.holdingCapacity.toLocaleString()} People`
                    : 'No data'}
                </div>
                <div className={`text-[9px] font-mono ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-500'
                }`}>
                  Total capacity
                </div>
              </div>

              {/* SPACE AVAILABLE */}
              <div className={`p-2 rounded-lg border text-center ${
                theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-[#050D0A] border-emerald-900/40'
              }`}>
                <div className={`text-[9px] font-mono uppercase font-bold ${
                  theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>SPACE AVAILABLE</div>
                <div className={`text-xs sm:text-sm font-mono font-black mt-0.5 ${
                  theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                }`}>
                  {activeSelectedSite?.availableCapacity !== null && activeSelectedSite?.availableCapacity !== undefined
                    ? `${activeSelectedSite.availableCapacity.toLocaleString()} People`
                    : 'No data'}
                </div>
                <div className={`text-[9px] font-mono font-semibold ${
                  theme === 'light' ? 'text-amber-700' : 'text-amber-400'
                }`}>
                  {typeof activeSelectedSite?.occupiedCapacity === 'number' && activeSelectedSite.occupiedCapacity > 0
                    ? `${activeSelectedSite.occupiedCapacity.toLocaleString()} Occupied`
                    : 'Ready for intake'}
                </div>
              </div>
            </div>

          </div>

          {/* -----------------------------------------------------------------
              CHART 3: COLUMN BAR CHART (Site Readiness: Water, Sanitation, Road, Med, Power)
              ----------------------------------------------------------------- */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#07130E] border-[#1A2E24]'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  3. Site Readiness
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  theme === 'light' ? 'text-emerald-800 bg-emerald-50 border-emerald-200 font-semibold' : 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60'
                }`}>
                  Column Chart
                </span>
              </div>
              <p className={`text-[11px] font-sans mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Shows whether the site has the basic facilities needed to support relocated people.
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteReadinessData} margin={{ top: 24, right: 15, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#F1F5F9' : '#14281E'} vertical={false} />
                  <XAxis 
                    dataKey="factor" 
                    stroke={theme === 'light' ? '#475569' : '#64748B'} 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 25, 50, 75, 100]}
                    unit="%" 
                    stroke={theme === 'light' ? '#475569' : '#64748B'} 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={theme === 'light' 
                      ? { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: '11px', fontFamily: 'monospace' } 
                      : { backgroundColor: '#050D0A', borderColor: '#1E382B', fontSize: '11px', fontFamily: 'monospace' }}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const item = payload[0].payload;
                      return (
                        <div className={`p-2.5 rounded-xl border text-xs font-mono shadow-xl space-y-1 ${
                          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#050D0A] border-[#162A20] text-white'
                        }`}>
                          <div className="font-bold" style={{ color: item.color }}>{item.factor}</div>
                          <div>Readiness: <strong className={theme === 'light' ? 'text-slate-900' : 'text-white'}>{item.score !== null ? `${item.score}%` : 'No data'}</strong></div>
                          <div className={`text-[10.5px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Status: {item.detail}</div>
                        </div>
                      );
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    maxBarSize={48} 
                    radius={[6, 6, 0, 0]}
                    label={{ 
                      position: 'top', 
                      fill: theme === 'light' ? '#0F172A' : '#94A3B8', 
                      fontSize: 11, 
                      fontWeight: 700, 
                      fontFamily: 'monospace',
                      formatter: (val: any) => (val !== null && val !== undefined ? `${val}%` : '') 
                    }}
                  >
                    {siteReadinessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* -----------------------------------------------------------------
              CHART 4: GAUGE CHART (Site Capacity / CCAS Score)
              ----------------------------------------------------------------- */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#07130E] border-[#1A2E24]'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  4. Site Capacity
                </h3>
                <p className={`text-[11px] font-sans mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  {siteCapacitySubtitle}
                </p>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                theme === 'light' ? 'text-amber-800 bg-amber-50 border-amber-200 font-semibold' : 'text-amber-400 bg-amber-950/70 border-amber-800/60'
              }`}>
                Gauge Chart
              </span>
            </div>

            {/* Large Semi-Circle Gauge */}
            <CcasGauge score={activeSelectedSite?.ccasScore ?? null} theme={theme} />
          </div>

        </div>
      </section>

      {/* =====================================================================
          SECTION 3: SAFE RELOCATION MAP &
          SECTION 4: DANGER LOCATION -> SELECTED SAFE SITE ROUTE
          ===================================================================== */}
      <section className="space-y-4">
        
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 ${
          theme === 'light' ? 'border-slate-200' : 'border-[#1A2E24]'
        }`}>
          <div>
            <h2 className={`text-xl sm:text-2xl font-mono font-black tracking-wider uppercase ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              SAFE RELOCATION MAP
            </h2>
            <p className={`text-xs font-sans mt-0.5 ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Shows the affected area, recommended safe sites and the route between them.
            </p>
          </div>

          {/* Basemap Switcher */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#07130E] border-[#1A2E24]'
          }`}>
            <button
              type="button"
              onClick={() => setBasemap('canvas')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                basemap === 'canvas' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {theme === 'light' ? 'Light Canvas' : 'Dark Canvas'}
            </button>
            <button
              type="button"
              onClick={() => setBasemap('satellite')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                basemap === 'satellite' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setBasemap('topo')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                basemap === 'topo' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Terrain Topo
            </button>
          </div>
        </div>

        {/* Route Details Bar */}
        <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
          theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0A1812] border-[#1E382B] text-slate-200'
        }`}>
          {/* Corridor label */}
          <div className="w-full pb-1 border-b border-inherit/40 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            ROUTE TO SAFE SITE: {routeCorridorLabel}
          </div>

          {/* Origin */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>AFFECTED AREA:</span>
            <span className={`font-bold ${theme === 'light' ? 'text-slate-950' : 'text-white'}`}>
              {dangerLocation.name}
            </span>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>SAFE SITE:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Site {activeSelectedSite?.rank}: {activeSelectedSite?.name || 'Safe Site'}
            </span>
          </div>

          {/* Route Distance & Travel Time or Error */}
          <div className="flex items-center gap-3">
            {routeError ? (
              <span className={`px-2.5 py-1 rounded border font-bold ${
                theme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950/80 border-rose-800 text-rose-300'
              }`}>
                {routeError}
              </span>
            ) : routeLoading ? (
              <span className={`px-2.5 py-1 rounded border animate-pulse font-bold ${
                theme === 'light'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-emerald-600/40 bg-emerald-950/40 text-emerald-400'
              }`}>
                Calculating road route...
              </span>
            ) : (
              <>
                {routeDistanceKm !== null && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#050D0A] border-[#162A20]'
                  }`}>
                    <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>TRAVEL DISTANCE:</span>
                    <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {routeDistanceKm} km
                    </span>
                  </div>
                )}
                {routeDurationMins !== null && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#050D0A] border-[#162A20]'
                  }`}>
                    <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>TRAVEL TIME:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {routeDurationMins} mins
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Map Canvas */}
        <div className={`relative w-full rounded-2xl overflow-hidden border shadow-xl ${
          theme === 'light' ? 'border-slate-200 bg-slate-100 shadow-slate-200/50' : 'border-[#1A2E24] shadow-2xl bg-[#07110C]'
        }`} style={{ height: '580px' }}>
          
          <MapContainer
            center={mapDefaultCenter}
            zoom={11}
            minZoom={4}
            maxZoom={19}
            zoomControl={false}
            className="w-full h-full"
            style={{ background: theme === 'light' ? '#F1F5F9' : '#07110C' }}
          >
            {/* Basemap Tile Layer */}
            {basemap === 'satellite' ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; World Imagery"
                maxZoom={19}
              />
            ) : basemap === 'topo' ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; World Topo Map"
                maxZoom={19}
              />
            ) : theme === 'light' ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Light Gray Canvas"
                maxZoom={16}
              />
            ) : (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Dark Gray Canvas"
                maxZoom={16}
              />
            )}

            {/* Recenter / FlyTo Controller */}
            <MapController
              center={mapDefaultCenter}
              zoom={11}
              selectedCoords={activeSelectedSite?.coordinates || null}
            />

            {/* Current Danger Location Marker */}
            {dangerLocation.coordinates && (
              <Marker
                position={dangerLocation.coordinates}
                icon={createDangerIcon()}
              >
                <Popup className="custom-leaflet-popup">
                  <div className={`font-mono text-xs p-1 space-y-1 ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                    <div className="text-rose-600 font-bold flex items-center gap-1 uppercase text-[10px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>AFFECTED AREA</span>
                    </div>
                    <div className={`font-bold font-sans text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {dangerLocation.name}
                    </div>
                    <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      GPS: {dangerLocation.coordinates[0].toFixed(4)}°N, {dangerLocation.coordinates[1].toFixed(4)}°E
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Real Road Route Polyline from Danger Location to Selected Site */}
            {routeCoordinates && routeCoordinates.length > 0 && (
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: '#10B981',
                  weight: 4.5,
                  opacity: 0.95,
                  dashArray: '10, 8'
                }}
              />
            )}

            {/* 4 Numbered Relocation Site Markers: 1, 2, 3, 4 */}
            {rankedSites.map((site, index) => {
              if (!site.coordinates) return null;
              const isSelected = selectedSiteIndex === index;
              const numStr = `${site.rank}`;

              return (
                <Marker
                  key={site.siteId}
                  position={site.coordinates}
                  icon={createNumberedIcon(numStr, isSelected)}
                  eventHandlers={{
                    click: () => {
                      handleSelectSite(index);
                    }
                  }}
                >
                  {/* Popup: Shows Location, Holding Capacity, Available Capacity only */}
                  <Popup className="custom-leaflet-popup">
                    <div className={`font-mono text-xs p-1.5 space-y-2 min-w-[210px] ${
                      theme === 'light' ? 'text-slate-800' : 'text-slate-100'
                    }`}>
                      <div className={`font-bold uppercase text-[10px] tracking-wider ${
                        theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        SAFE RELOCATION SITE {site.rank}
                      </div>
                      
                      {/* Location */}
                      <div>
                        <div className={`text-[9px] uppercase font-bold ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          LOCATION
                        </div>
                        <div className={`font-bold font-sans text-sm leading-snug ${
                          theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}>
                          {site.name}{site.village ? `, ${site.village}` : ''}
                        </div>
                      </div>

                      {/* Holding Capacity */}
                      <div>
                        <div className={`text-[9px] uppercase font-bold ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          HOLDING CAPACITY
                        </div>
                        <div className={`text-xs font-bold ${
                          theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}>
                          {site.holdingCapacity !== null ? `${site.holdingCapacity.toLocaleString()} People` : 'No data'}
                        </div>
                      </div>

                      {/* Available Capacity */}
                      <div>
                        <div className={`text-[9px] uppercase font-bold ${
                          theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                        }`}>
                          AVAILABLE CAPACITY
                        </div>
                        <div className={`text-xs font-bold ${
                          theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                        }`}>
                          {site.availableCapacity !== null ? `${site.availableCapacity.toLocaleString()} People` : 'No data'}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute top-3 right-3 z-[800] pointer-events-none">
            <div className={`pointer-events-auto backdrop-blur-md px-3.5 py-2.5 rounded-xl border text-[11px] font-mono space-y-1.5 shadow-xl ${
              theme === 'light'
                ? 'bg-white/95 border-slate-200 text-slate-700 shadow-slate-200/60'
                : 'bg-[#07130E]/95 border-[#1A2E24] text-slate-300 shadow-2xl'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shrink-0" />
                <span>Affected Area</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981] border border-white shrink-0" />
                <span>Selected Safe Site ({activeSelectedSite?.rank})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-0.5 inline-block shrink-0 ${theme === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
                <span>Evacuation Route</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SafeRelocationDashboard;
