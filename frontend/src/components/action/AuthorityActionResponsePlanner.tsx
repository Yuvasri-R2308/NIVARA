import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Circle, 
  Popup, 
  Polyline, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { HazardType, HazardModuleId } from '../../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Building, 
  Users, 
  Droplets, 
  Truck, 
  Ambulance, 
  MapPin, 
  ArrowRight, 
  Zap, 
  Check, 
  X, 
  ChevronRight, 
  Info, 
  Calendar, 
  Database, 
  Radio, 
  PhoneCall, 
  FileText, 
  Clock, 
  Sparkles, 
  Sliders, 
  RotateCcw, 
  Navigation, 
  Layers, 
  HeartPulse, 
  Eye 
} from 'lucide-react';

// Fix Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map recentering helper
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

// Grounded hazard operational context dataset
interface HazardAuthorityContext {
  hazard: HazardType;
  title: string;
  studyArea: string;
  state: string;
  lastUpdated: string;
  dataStatus: 'UPDATED' | 'LIVE' | 'HISTORICAL';
  redZoneName: string;
  redZoneCoords: [number, number];
  safeHavenName: string;
  safeHavenCoords: [number, number];
  safeHavenCapacityFamilies: number;
  totalAffectedFamilies: number;
  priorityFamiliesToMove: number;
  routeTitle: string;
  routeDistanceKm: number;
  routeDurationMins: number;
  routeWaypoints: [number, number][];
  vehiclesRequired: number;
  vehiclesAvailable: number;
  waterSupplyStatus: 'READY' | 'LIMITED';
  roadAccessStatus: 'READY' | 'LIMITED' | 'BLOCKED';
  familyNotificationStatus: 'COMPLETED' | 'PENDING';
  authorityApprovalStatus: 'APPROVED' | 'REQUIRED';
  primaryBlocker: {
    title: string;
    description: string;
    category: 'TRANSPORT' | 'WATER' | 'ROAD' | 'COMMUNICATION';
    targetModule: HazardModuleId;
  };
  responsibleTeams: {
    transport: string;
    field: string;
    controlRoom: string;
    health: string;
  };
  whatChanged: {
    threatLevel: { prev: string; curr: string };
    families: { prev: number; curr: number };
    transport: { prev: number; curr: number };
    road: string;
  };
}

const HAZARD_CONTEXTS: Record<HazardType, HazardAuthorityContext> = {
  'landslide': {
    hazard: 'landslide',
    title: 'LANDSLIDE RESPONSE',
    studyArea: 'Meppadi & Chooralmala, Wayanad, Kerala',
    state: 'Kerala',
    lastUpdated: 'September 15, 2024 • 11:30 IST',
    dataStatus: 'UPDATED',
    redZoneName: 'Chooralmala & Mundakkai Riverbed',
    redZoneCoords: [11.540, 76.138],
    safeHavenName: 'Kalpetta-Vythiri Institutional Reserve',
    safeHavenCoords: [11.602, 76.082],
    safeHavenCapacityFamilies: 550,
    totalAffectedFamilies: 250,
    priorityFamiliesToMove: 78,
    routeTitle: 'Meppadi-Kalpetta NH-766 Evacuation Corridor',
    routeDistanceKm: 42,
    routeDurationMins: 52,
    routeWaypoints: [[11.540, 76.138], [11.565, 76.115], [11.585, 76.095], [11.602, 76.082]],
    vehiclesRequired: 16,
    vehiclesAvailable: 12,
    waterSupplyStatus: 'READY',
    roadAccessStatus: 'READY',
    familyNotificationStatus: 'COMPLETED',
    authorityApprovalStatus: 'APPROVED',
    primaryBlocker: {
      title: 'Transport Fleet Shortfall',
      description: '16 evacuation buses are required for the priority movement plan, but only 12 are staged at Meppadi.',
      category: 'TRANSPORT',
      targetModule: 'relocation-planning'
    },
    responsibleTeams: {
      transport: 'Wayanad District Transport Fleet (KSRTC Depot)',
      field: 'NDRF 04 Bn & Meppadi Emergency Response Cell',
      controlRoom: 'Collectorate Control Room, Kalpetta',
      health: 'District Medical Officer & Vythiri Taluk Hospital'
    },
    whatChanged: {
      threatLevel: { prev: 'HIGH', curr: 'CRITICAL' },
      families: { prev: 65, curr: 78 },
      transport: { prev: 8, curr: 12 },
      road: 'NH-766 Cleared of minor scree; passable for heavy buses'
    }
  },
  'flood': {
    hazard: 'flood',
    title: 'FLOOD RESPONSE',
    studyArea: 'Rohmaria & Brahmaputra Banks, Dibrugarh, Assam',
    state: 'Assam',
    lastUpdated: 'September 15, 2024 • 11:30 IST',
    dataStatus: 'UPDATED',
    redZoneName: 'Rohmaria Multi-Chapari High Scour Zone',
    redZoneCoords: [27.485, 94.915],
    safeHavenName: 'Dibrugarh University Eastern Ridgeline',
    safeHavenCoords: [27.452, 94.898],
    safeHavenCapacityFamilies: 1250,
    totalAffectedFamilies: 650,
    priorityFamiliesToMove: 140,
    routeTitle: 'Rohmaria Embankment Bypass via AT Road',
    routeDistanceKm: 24,
    routeDurationMins: 45,
    routeWaypoints: [[27.485, 94.915], [27.472, 94.908], [27.452, 94.898]],
    vehiclesRequired: 28,
    vehiclesAvailable: 20,
    waterSupplyStatus: 'READY',
    roadAccessStatus: 'READY',
    familyNotificationStatus: 'COMPLETED',
    authorityApprovalStatus: 'APPROVED',
    primaryBlocker: {
      title: 'High-Clearance Transport Shortage',
      description: '28 high-chassis buses/trucks needed for waterlogged bypass; 20 currently staged.',
      category: 'TRANSPORT',
      targetModule: 'relocation-planning'
    },
    responsibleTeams: {
      transport: 'ASTC Dibrugarh Division & Inland Water Transit',
      field: 'SDRF Assam 1st Bn & Revenue Circle Officers',
      controlRoom: 'DDMA Emergency Operations Centre, Dibrugarh',
      health: 'Assam Medical College Hospital Emergency Unit'
    },
    whatChanged: {
      threatLevel: { prev: 'HIGH', curr: 'CRITICAL INUNDATION' },
      families: { prev: 110, curr: 140 },
      transport: { prev: 14, curr: 20 },
      road: 'AT Road Bypass operational; low-lying culverts monitored'
    }
  },
  'cloudburst': {
    hazard: 'cloudburst',
    title: 'CLOUDBURST RESPONSE',
    studyArea: 'Mandakini Valley & Kedarnath Rim, Uttarakhand',
    state: 'Uttarakhand',
    lastUpdated: 'September 15, 2024 • 11:30 IST',
    dataStatus: 'UPDATED',
    redZoneName: 'Mandakini Gorge Flash Runoff Channel',
    redZoneCoords: [30.735, 79.066],
    safeHavenName: 'Guptkashi Ridge Staging Terminal',
    safeHavenCoords: [30.525, 79.078],
    safeHavenCapacityFamilies: 850,
    totalAffectedFamilies: 800,
    priorityFamiliesToMove: 180,
    routeTitle: 'Kedarnath-Guptkashi Hill Highway Corridor',
    routeDistanceKm: 32,
    routeDurationMins: 65,
    routeWaypoints: [[30.735, 79.066], [30.640, 79.072], [30.525, 79.078]],
    vehiclesRequired: 35,
    vehiclesAvailable: 25,
    waterSupplyStatus: 'READY',
    roadAccessStatus: 'LIMITED',
    familyNotificationStatus: 'COMPLETED',
    authorityApprovalStatus: 'APPROVED',
    primaryBlocker: {
      title: 'Mountain Mini-Bus Fleet Deficit',
      description: '35 4x4 mountain vehicles required due to steep hairpin turns; 25 deployed.',
      category: 'TRANSPORT',
      targetModule: 'relocation-planning'
    },
    responsibleTeams: {
      transport: 'GMVN Mountain Transit & Rudraprayag Police Fleet',
      field: 'ITBP Kedarnath Outpost & SDRF Uttarakhand',
      controlRoom: 'District Emergency Operations Center, Rudraprayag',
      health: 'District Hospital Rudraprayag & AIIMS Rishikesh Triage'
    },
    whatChanged: {
      threatLevel: { prev: 'ADVISORY', curr: 'FLASH WARNING' },
      families: { prev: 150, curr: 180 },
      transport: { prev: 18, curr: 25 },
      road: 'Single-lane convoys active due to gorge runoff'
    }
  },
  'coastal-erosion': {
    hazard: 'coastal-erosion',
    title: 'COASTAL EROSION RESPONSE',
    studyArea: 'Brahmapur Coast & Podampeta, Ganjam, Odisha',
    state: 'Odisha',
    lastUpdated: 'September 15, 2024 • 11:30 IST',
    dataStatus: 'UPDATED',
    redZoneName: 'Podampeta Intertidal Beachfront Habitations',
    redZoneCoords: [19.385, 85.085],
    safeHavenName: 'Humma Ridge Resettlement Colony',
    safeHavenCoords: [19.420, 85.120],
    safeHavenCapacityFamilies: 420,
    totalAffectedFamilies: 500,
    priorityFamiliesToMove: 72,
    routeTitle: 'Podampeta-Humma Coastal Link (NH-516)',
    routeDistanceKm: 18,
    routeDurationMins: 25,
    routeWaypoints: [[19.385, 85.085], [19.400, 85.105], [19.420, 85.120]],
    vehiclesRequired: 14,
    vehiclesAvailable: 10,
    waterSupplyStatus: 'READY',
    roadAccessStatus: 'READY',
    familyNotificationStatus: 'COMPLETED',
    authorityApprovalStatus: 'APPROVED',
    primaryBlocker: {
      title: 'Evacuation Bus Shortage',
      description: '14 transport vehicles required for immediate beachfront movement, but only 10 are available.',
      category: 'TRANSPORT',
      targetModule: 'relocation-planning'
    },
    responsibleTeams: {
      transport: 'Ganjam District Transport & OSRTC Berhampur',
      field: 'ODRAF 3rd Bn & Marine Police Station Chhatrapur',
      controlRoom: 'OSDMA District Control Room, Chhatrapur',
      health: 'MKCG Medical College & Hospital, Berhampur'
    },
    whatChanged: {
      threatLevel: { prev: 'MODERATE', curr: 'CRITICAL SURGE' },
      families: { prev: 60, curr: 72 },
      transport: { prev: 6, curr: 10 },
      road: 'NH-516 Coastal link open and dry; high tide warning active'
    }
  }
};

export type ActionStatus = 
  | 'PLANNED'
  | 'APPROVED'
  | 'DISPATCHED'
  | 'IN PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED';

interface AuthorityActionResponsePlannerProps {
  hazardKey?: HazardType;
  theme?: 'dark' | 'light';
  onNavigateModule?: (moduleId: HazardModuleId) => void;
}

export const AuthorityActionResponsePlanner: React.FC<AuthorityActionResponsePlannerProps> = ({
  hazardKey: propHazardKey,
  theme = 'dark',
  onNavigateModule
}) => {
  const { selectedHazard } = useApp();
  const activeHazard: HazardType = propHazardKey || selectedHazard || 'landslide';
  const isLight = theme === 'light';

  // Grounded context for current hazard
  const ctx = useMemo(() => HAZARD_CONTEXTS[activeHazard] || HAZARD_CONTEXTS['landslide'], [activeHazard]);

  // Operational Action Lifecycle State
  const [actionStatus, setActionStatus] = useState<ActionStatus>('PLANNED');
  const [familiesMoved, setFamiliesMoved] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSimulation, setShowSimulation] = useState<boolean>(false);
  const [simExtraVehicles, setSimExtraVehicles] = useState<number>(0);

  // Synchronize when hazard changes
  useEffect(() => {
    setActionStatus('PLANNED');
    setFamiliesMoved(0);
    setShowConfirmModal(false);
    setShowSimulation(false);
    setSimExtraVehicles(0);
  }, [activeHazard]);

  // Effective vehicle count (live vs simulation)
  const effectiveVehicles = showSimulation 
    ? ctx.vehiclesAvailable + simExtraVehicles 
    : ctx.vehiclesAvailable;
  const isTransportSufficient = effectiveVehicles >= ctx.vehiclesRequired;
  const transportShortfall = Math.max(0, ctx.vehiclesRequired - effectiveVehicles);

  // Dynamic Next Best Action calculation
  const nextBestAction = useMemo(() => {
    if (actionStatus === 'VERIFIED') {
      return {
        id: 'DEMOBILIZE',
        title: 'Review Remaining Exposed Population & Demobilize Route',
        reason: `All ${ctx.priorityFamiliesToMove} priority families have safely reached ${ctx.safeHavenName} and verified. Transition to wave-2 shelter management.`,
        impact: 'Secures primary safe haven operations and releases priority transit escorts.',
        readiness: 'READY TO EXECUTE',
        buttonText: 'Close Operational Cycle',
        isTerminal: true
      };
    }
    if (actionStatus === 'COMPLETED') {
      return {
        id: 'VERIFY_ARRIVAL',
        title: 'Confirm Arrival at Safe Destination',
        reason: `Convoys have arrived at ${ctx.safeHavenName}. Field teams must verify headcounts and triage registrations.`,
        impact: 'Verifies 100% of displaced persons are accounted for in the shelter registry.',
        readiness: 'READY TO EXECUTE',
        buttonText: 'Verify & Confirm Arrival',
        isTerminal: false
      };
    }
    if (actionStatus === 'IN PROGRESS') {
      return {
        id: 'TRACK_MOVEMENT',
        title: 'Track Movement & Route Security',
        reason: `Evacuation convoy is currently in transit along ${ctx.routeTitle}. Monitor checkpoints and speed.`,
        impact: `Protects ${familiesMoved} families currently traversing the ${ctx.routeDistanceKm} km corridor.`,
        readiness: 'IN PROGRESS',
        buttonText: 'Update Movement Progress',
        isTerminal: false
      };
    }
    if (actionStatus === 'DISPATCHED') {
      return {
        id: 'BEGIN_TRANSIT',
        title: 'Commence Convoy Departure',
        reason: 'Evacuation orders dispatched to field team. Escort vehicles staged at departure point.',
        impact: `Starts movement of ${ctx.priorityFamiliesToMove} priority families to ${ctx.safeHavenName}.`,
        readiness: 'READY TO EXECUTE',
        buttonText: 'Commence Movement',
        isTerminal: false
      };
    }
    // If planned: check prerequisites
    if (!isTransportSufficient) {
      return {
        id: 'ARRANGE_TRANSPORT',
        title: 'Arrange Additional Transport Vehicles',
        reason: `${ctx.vehiclesRequired} vehicles are required for the priority movement plan, but only ${effectiveVehicles} are available (Shortfall: ${transportShortfall}).`,
        impact: `Enables simultaneous safe movement of all ${ctx.priorityFamiliesToMove} identified priority families.`,
        readiness: 'BLOCKED BY FLEET SHORTFALL',
        buttonText: 'Resolve Fleet Shortage',
        isTerminal: false
      };
    }
    return {
      id: 'START_RELOCATION',
      title: 'Start Priority Relocation Movement',
      reason: `All prerequisites verified: ${ctx.safeHavenName} has available capacity, road access is clear, and ${effectiveVehicles} vehicles are staged.`,
      impact: `Safely evacuates ${ctx.priorityFamiliesToMove} critical families out of the high-risk zone.`,
      readiness: 'READY TO EXECUTE',
      buttonText: 'Take Action (Start Movement)',
      isTerminal: false
    };
  }, [actionStatus, isTransportSufficient, effectiveVehicles, transportShortfall, ctx, familiesMoved]);

  // Overall readiness status
  const overallReadiness = useMemo(() => {
    if (actionStatus === 'COMPLETED' || actionStatus === 'VERIFIED') return 'COMPLETED';
    if (actionStatus === 'IN PROGRESS') return 'IN PROGRESS';
    if (isTransportSufficient && ctx.roadAccessStatus === 'READY') return 'READY TO ACT';
    if (!isTransportSufficient) return 'READY WITH LIMITATION';
    return 'BLOCKED';
  }, [actionStatus, isTransportSufficient, ctx.roadAccessStatus]);

  // Handle action click
  const handlePrimaryActionClick = () => {
    if (nextBestAction.id === 'ARRANGE_TRANSPORT') {
      if (onNavigateModule) {
        onNavigateModule('relocation-planning');
      }
      return;
    }
    if (nextBestAction.id === 'START_RELOCATION') {
      setShowConfirmModal(true);
      return;
    }
    if (nextBestAction.id === 'BEGIN_TRANSIT') {
      setActionStatus('IN PROGRESS');
      setFamiliesMoved(Math.round(ctx.priorityFamiliesToMove * 0.6));
      return;
    }
    if (nextBestAction.id === 'TRACK_MOVEMENT') {
      setFamiliesMoved(ctx.priorityFamiliesToMove);
      setActionStatus('COMPLETED');
      return;
    }
    if (nextBestAction.id === 'VERIFY_ARRIVAL') {
      setActionStatus('VERIFIED');
      return;
    }
    if (nextBestAction.id === 'DEMOBILIZE') {
      alert('Operational cycle successfully closed and archived into the official district ledger.');
      return;
    }
  };

  // Confirm Modal Execution
  const handleConfirmStartMovement = () => {
    setShowConfirmModal(false);
    setActionStatus('DISPATCHED');
    setTimeout(() => {
      setActionStatus('IN PROGRESS');
      setFamiliesMoved(Math.round(ctx.priorityFamiliesToMove * 0.5));
    }, 1200);
  };

  // Dynamic Before vs After Values
  const remainingPriorityFamilies = Math.max(0, ctx.priorityFamiliesToMove - familiesMoved);
  const remainingHavenCapacity = ctx.safeHavenCapacityFamilies - familiesMoved;

  return (
    <div className={`p-4 md:p-8 space-y-8 max-w-7xl mx-auto font-sans transition-colors ${
      isLight ? 'text-slate-900 bg-slate-50/50' : 'text-slate-100 bg-transparent'
    }`}>

      {/* =======================================================================
          SECTION 1: PAGE HEADER & HAZARD CONTEXT
          ======================================================================= */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isLight 
          ? 'bg-white border-slate-200 shadow-sm' 
          : 'bg-gradient-to-r from-[#0C1712] via-[#0A1410] to-[#09120E] border-[#1A2E24]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                MODULE 09 • AUTHORITY COMMAND
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>{ctx.dataStatus}</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-serif tracking-tight text-white">
              AUTHORITY ACTION & RESPONSE PLANNER
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Turn the current situation into clear, coordinated action.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2.5 rounded-xl border text-right ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#070D0A] border-[#1A2E24]'
            }`}>
              <div className="text-[10px] font-mono uppercase text-slate-400">Active Theater</div>
              <div className="text-sm font-bold font-serif text-emerald-400">{ctx.title}</div>
              <div className="text-[11px] text-slate-300">{ctx.studyArea}</div>
            </div>

            <div className={`px-4 py-2.5 rounded-xl border text-right ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#070D0A] border-[#1A2E24]'
            }`}>
              <div className="text-[10px] font-mono uppercase text-slate-400">Last Telemetry Refresh</div>
              <div className="text-xs font-mono font-bold text-slate-200">{ctx.lastUpdated}</div>
              <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Verified Official Data
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          SECTION 2: CURRENT SITUATION PANEL
          ======================================================================= */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold font-serif uppercase tracking-wide text-white">
              CURRENT SITUATION
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-700 animate-pulse">
            HIGH THREAT LEVEL
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070D0A] border-[#1A2E24]'}`}>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Affected Families</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-white mt-1">
              {ctx.totalAffectedFamilies}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Displaced in sector</div>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/30 border-rose-800/60'}`}>
            <div className="text-[10px] font-mono text-rose-400 uppercase font-bold">Priority Movement</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-rose-300 mt-1">
              {remainingPriorityFamilies}
            </div>
            <div className="text-[11px] text-rose-400 mt-0.5">Require immediate transit</div>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070D0A] border-[#1A2E24]'}`}>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Recommended Safe Site</div>
            <div className="text-sm font-bold text-emerald-400 mt-1 truncate" title={ctx.safeHavenName}>
              {ctx.safeHavenName.split(' ')[0]} {ctx.safeHavenName.split(' ')[1] || ''}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Verified Safe Elevation</div>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070D0A] border-[#1A2E24]'}`}>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Available Capacity</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-cyan-400 mt-1">
              {remainingHavenCapacity}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Families supported</div>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070D0A] border-[#1A2E24]'}`}>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Transport Fleet</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-amber-400 mt-1">
              {effectiveVehicles} / {ctx.vehiclesRequired}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isTransportSufficient ? 'Full fleet ready' : `${transportShortfall} vehicles short`}
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070D0A] border-[#1A2E24]'}`}>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Main Constraint</div>
            <div className="text-xs font-bold text-amber-300 mt-1 truncate" title={ctx.primaryBlocker.title}>
              {isTransportSufficient ? 'None • Fleet Ready' : ctx.primaryBlocker.title}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Operational bottleneck</div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          SECTION 3: ⭐ NEXT BEST ACTION (HERO COMPONENT)
          ======================================================================= */}
      <div className={`p-6 md:p-8 rounded-3xl border-2 transition-all relative overflow-hidden shadow-2xl ${
        isLight
          ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-500 shadow-emerald-100'
          : 'bg-gradient-to-br from-[#0F261D] via-[#0C1B15] to-[#08120E] border-emerald-600/80 shadow-emerald-950/40'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500 text-black flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>⭐ NEXT BEST ACTION</span>
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                nextBestAction.readiness === 'READY TO EXECUTE' 
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                  : nextBestAction.readiness === 'IN PROGRESS'
                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700'
                  : 'bg-amber-950/90 text-amber-300 border-amber-700'
              }`}>
                [{nextBestAction.readiness}]
              </span>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                NIVARA RECOMMENDS:
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold font-serif text-white mt-1">
                "{nextBestAction.title}"
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-[#070E0A]/90 border-[#1A2E24]'}`}>
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reason</span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 mt-1.5 leading-relaxed">
                  {nextBestAction.reason}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-[#070E0A]/90 border-[#1A2E24]'}`}>
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Expected Impact</span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 mt-1.5 leading-relaxed">
                  {nextBestAction.impact}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[240px] shrink-0">
            <button
              onClick={handlePrimaryActionClick}
              className={`w-full py-4 px-6 rounded-2xl font-mono text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer ${
                nextBestAction.readiness === 'BLOCKED BY FLEET SHORTFALL'
                  ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-amber-900/40'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-900/40 hover:scale-[1.02]'
              }`}
            >
              <span>{nextBestAction.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSimulation(prev => !prev)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  showSimulation
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-[#070D0A] hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showSimulation ? 'Exit Simulation' : 'What-If Simulation'}</span>
              </button>

              <button
                onClick={() => {
                  if (onNavigateModule) onNavigateModule('alerts-voice');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                    : 'bg-[#070D0A] hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Open Emergency Alerts & Voice Call console"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                <span>Alert</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Movement Progress Bar (when action is in progress or completed) */}
        {(actionStatus === 'IN PROGRESS' || actionStatus === 'COMPLETED' || actionStatus === 'VERIFIED') && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                RELOCATION MOVEMENT IN PROGRESS
              </span>
              <span className="text-cyan-400 font-bold">
                {familiesMoved} / {ctx.priorityFamiliesToMove} families relocated ({remainingPriorityFamilies} remaining)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700 rounded-full"
                style={{ width: `${Math.min(100, Math.round((familiesMoved / ctx.priorityFamiliesToMove) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1">
              <span>Transit Corridor: {ctx.routeTitle}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFamiliesMoved(prev => Math.min(ctx.priorityFamiliesToMove, prev + 10))}
                  disabled={familiesMoved >= ctx.priorityFamiliesToMove}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] cursor-pointer disabled:opacity-40"
                >
                  +10 Families
                </button>
                <button
                  onClick={() => {
                    setFamiliesMoved(ctx.priorityFamiliesToMove);
                    setActionStatus('COMPLETED');
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Sandbox Slider (Controlled What-If) */}
        {showSimulation && (
          <div className="mt-6 p-4 rounded-2xl bg-[#061410] border-2 border-cyan-500/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  SIMULATION — NOT A LIVE ACTION
                </span>
                <span className="text-xs text-slate-300 font-sans">
                  Simulate increasing transport vehicles to resolve movement bottleneck
                </span>
              </div>
              <button 
                onClick={() => setSimExtraVehicles(0)}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-xs font-mono text-slate-300 w-48">
                Add Reserve Buses: <strong className="text-cyan-400">+{simExtraVehicles}</strong> (Total: {effectiveVehicles})
              </span>
              <input 
                type="range" 
                min={0} 
                max={12} 
                value={simExtraVehicles} 
                onChange={(e) => setSimExtraVehicles(Number(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer"
              />
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                isTransportSufficient 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                  : 'bg-amber-950 text-amber-300 border-amber-700'
              }`}>
                {isTransportSufficient ? '✓ Fleet Saturated (100% Ready)' : `Shortfall: ${transportShortfall}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================================
          SECTION 4 & 5: TWO-COLUMN (ACTION READINESS | CRITICAL BLOCKERS)
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN: ACTION READINESS */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold font-serif text-white">
                  ACTION READINESS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Can we perform the recommended action now?
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                overallReadiness === 'READY TO ACT' || overallReadiness === 'COMPLETED'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : overallReadiness === 'IN PROGRESS'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  : 'bg-amber-950 text-amber-300 border-amber-700'
              }`}>
                {overallReadiness === 'READY TO ACT' ? '✓ READY TO ACT' : `⚠ ${overallReadiness}`}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Safe Destination</div>
                    <div className="text-[11px] text-slate-400">{ctx.safeHavenName}</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                  ✓ READY
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Available Capacity</div>
                    <div className="text-[11px] text-slate-400">{remainingHavenCapacity} families capacity remaining</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                  ✓ READY
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Road Access & Transit Corridor</div>
                    <div className="text-[11px] text-slate-400">{ctx.routeTitle}</div>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                  ctx.roadAccessStatus === 'READY'
                    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                    : 'text-amber-400 bg-amber-950/80 border-amber-800'
                }`}>
                  {ctx.roadAccessStatus === 'READY' ? '✓ READY' : '⚠ LIMITED PASS'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Evacuation Transport Fleet</div>
                    <div className="text-[11px] text-slate-400">
                      {effectiveVehicles} of {ctx.vehiclesRequired} vehicles staged
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                  isTransportSufficient
                    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                    : 'text-amber-400 bg-amber-950/80 border-amber-800'
                }`}>
                  {isTransportSufficient ? '✓ READY' : '⚠ LIMITED'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Family Notification</div>
                    <div className="text-[11px] text-slate-400">SMS bulletin & local siren broadcast completed</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                  ✓ READY
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Authority Approval</div>
                    <div className="text-[11px] text-slate-400">District Disaster Authority incident clearance active</div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                  ✓ READY
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070D0A] border border-[#1A2E24] text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-400">Operational Assessment:</strong>{' '}
            {isTransportSufficient 
              ? 'All prerequisites are fully satisfied. The evacuation convoy can be dispatched immediately.'
              : `Transport fleet must be reinforced by ${transportShortfall} buses before moving all priority families simultaneously.`}
          </div>
        </div>

        {/* RIGHT COLUMN: CRITICAL BLOCKERS */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold font-serif text-white">
                  CRITICAL BLOCKERS
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Issues delaying or preventing full operational execution
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                isTransportSufficient
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-rose-950 text-rose-300 border-rose-700'
              }`}>
                {isTransportSufficient ? '0 ACTIVE BLOCKERS' : '1 ACTIVE BLOCKER'}
              </span>
            </div>

            <div className="space-y-4">
              {/* Blocker 1: Transport Shortage */}
              {!isTransportSufficient ? (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/60 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Truck className="w-4 h-4" />
                      <span>{ctx.primaryBlocker.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-mono font-bold bg-amber-900/60 text-amber-300 border border-amber-700">
                      FLEET DEFICIT
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {ctx.primaryBlocker.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#070D0A]/70 rounded-lg border border-[#1A2E24]">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Required</div>
                      <div className="text-sm font-bold font-mono text-white">{ctx.vehiclesRequired} Buses</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Staged</div>
                      <div className="text-sm font-bold font-mono text-cyan-400">{effectiveVehicles} Buses</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Shortfall</div>
                      <div className="text-sm font-bold font-mono text-rose-400">{transportShortfall} Buses</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (onNavigateModule) onNavigateModule('relocation-planning');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Resolve in Movement Planning</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Transport Fleet Fully Saturated</div>
                    <div className="text-[11px] text-slate-300">All {effectiveVehicles} evacuation vehicles are staged and ready for boarding.</div>
                  </div>
                </div>
              )}

              {/* Verified Safe Haven Status */}
              <div className="p-4 rounded-xl bg-[#070D0A] border border-[#1A2E24] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <span>Safe Haven Potable Water & Sanitation Check</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">✓ VERIFIED</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Drinking water supply at {ctx.safeHavenName} exceeds Sphere standards (70 L/person/day). Sanitation units operational.
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      if (onNavigateModule) onNavigateModule('carrying-capacity');
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Land Safety & Capacity</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070D0A] border border-[#1A2E24] flex items-center justify-between text-xs">
            <span className="text-slate-400">Responsible Transport Agency:</span>
            <span className="font-mono font-bold text-slate-200">{ctx.responsibleTeams.transport}</span>
          </div>
        </div>

      </div>

      {/* =======================================================================
          SECTION 6: RESPONSE PROGRESS SEQUENCE
          ======================================================================= */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div>
            <h3 className="text-base font-bold font-serif text-white">
              RESPONSE PROGRESS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live progression of the active operational disaster response cycle
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click any phase to inspect the underlying module
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Risk Identified', icon: ShieldAlert, state: 'DONE', module: 'hazard-analysis' as HazardModuleId },
            { label: 'Priority Identified', icon: Users, state: 'DONE', module: 'priority-evacuation' as HazardModuleId },
            { label: 'Safe Site Confirmed', icon: MapPin, state: 'DONE', module: 'safe-relocation' as HazardModuleId },
            { label: 'Capacity Checked', icon: Building, state: 'DONE', module: 'carrying-capacity' as HazardModuleId },
            { 
              label: 'Transport Staged', 
              icon: Truck, 
              state: isTransportSufficient ? 'DONE' : 'LIMITED', 
              module: 'relocation-planning' as HazardModuleId 
            },
            { label: 'Families Notified', icon: Radio, state: 'DONE', module: 'alerts-voice' as HazardModuleId },
            { 
              label: 'Movement Started', 
              icon: Navigation, 
              state: actionStatus === 'IN PROGRESS' || actionStatus === 'COMPLETED' || actionStatus === 'VERIFIED' ? 'DONE' : 'WAITING', 
              module: 'relocation-planning' as HazardModuleId 
            },
            { 
              label: 'Arrival Confirmed', 
              icon: CheckCircle2, 
              state: actionStatus === 'VERIFIED' ? 'DONE' : 'WAITING', 
              module: 'reports' as HazardModuleId 
            }
          ].map((step, idx) => {
            const Icon = step.icon;
            const isDone = step.state === 'DONE';
            const isLimited = step.state === 'LIMITED';
            return (
              <button
                key={idx}
                onClick={() => {
                  if (onNavigateModule) onNavigateModule(step.module);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.02] ${
                  isDone 
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                    : isLimited
                    ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                    : 'bg-[#070D0A] border-[#1A2E24] text-slate-500 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-[10px] font-mono font-bold opacity-60">0{idx + 1}</span>
                  {isDone ? (
                    <span className="text-xs font-bold text-emerald-400">✓</span>
                  ) : isLimited ? (
                    <span className="text-xs font-bold text-amber-400">⚠</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-600">○</span>
                  )}
                </div>
                <Icon className="w-4 h-4 mb-2" />
                <div className="text-xs font-bold leading-tight truncate w-full" title={step.label}>
                  {step.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =======================================================================
          SECTION 7: ACTION MAP (ONE SINGLE OPERATIONAL MAP)
          ======================================================================= */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>OPERATIONAL ACTION MAP</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Correlating affected origin, priority transit route, and destination safe haven
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/50 px-2.5 py-1 rounded border border-rose-800">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Origin Hazard Zone</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/50 px-2.5 py-1 rounded border border-amber-800">
              <span className="w-4 h-0.5 bg-amber-400" />
              <span>Evacuation Corridor</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Safe Haven</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
          <MapContainer
            center={ctx.redZoneCoords}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <MapRecenter center={ctx.redZoneCoords} zoom={12} />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; DeLorme, NAVTEQ"
            />

            {/* Red Zone Origin */}
            <Circle
              center={ctx.redZoneCoords}
              radius={900}
              pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.25, weight: 2 }}
            />
            <CircleMarker
              center={ctx.redZoneCoords}
              radius={8}
              pathOptions={{ color: '#FFFFFF', fillColor: '#EF4444', fillOpacity: 1, weight: 2 }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <strong className="text-rose-700 block">{ctx.redZoneName}</strong>
                  <div>Affected Families: {ctx.totalAffectedFamilies}</div>
                  <div>Requiring Immediate Movement: <strong>{ctx.priorityFamiliesToMove} families</strong></div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Safe Haven Destination */}
            <Circle
              center={ctx.safeHavenCoords}
              radius={900}
              pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.25, weight: 2 }}
            />
            <CircleMarker
              center={ctx.safeHavenCoords}
              radius={8}
              pathOptions={{ color: '#FFFFFF', fillColor: '#10B981', fillOpacity: 1, weight: 2 }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <strong className="text-emerald-700 block">{ctx.safeHavenName}</strong>
                  <div>Safe Holding Capacity: <strong>{ctx.safeHavenCapacityFamilies} families</strong></div>
                  <div>Potable Water: Verified Ready</div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Route Corridor Polyline */}
            <Polyline
              positions={ctx.routeWaypoints}
              pathOptions={{ color: '#F59E0B', weight: 4, dashArray: '6, 6' }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <strong className="text-amber-600 block">{ctx.routeTitle}</strong>
                  <div>Distance: {ctx.routeDistanceKm} km</div>
                  <div>Transit Time: {ctx.routeDurationMins} minutes</div>
                </div>
              </Popup>
            </Polyline>
          </MapContainer>
        </div>
      </div>

      {/* =======================================================================
          SECTION 8 & 9: CURRENT ACTIONS LIST & RESPONSIBLE TEAMS
          ======================================================================= */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold font-serif text-white">
              CURRENT OPERATIONAL ACTIONS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned tasks, responsible authorities, and real-time execution tracking
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Official SDMA Incident Roster
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="pb-3 font-semibold">Action Title</th>
                <th className="pb-3 font-semibold">Responsible Agency</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Last Update</th>
                <th className="pb-3 font-semibold text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr>
                <td className="py-3.5 pr-3">
                  <div className="font-bold text-white">Relocate Priority Families</div>
                  <div className="text-[11px] text-slate-400">Move {ctx.priorityFamiliesToMove} families via {ctx.routeTitle}</div>
                </td>
                <td className="py-3.5 pr-3 font-mono text-slate-300">
                  {ctx.responsibleTeams.field}
                </td>
                <td className="py-3.5 pr-3">
                  <span className={`px-2.5 py-1 rounded text-[10.5px] font-mono font-bold border ${
                    actionStatus === 'VERIFIED' || actionStatus === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : actionStatus === 'IN PROGRESS'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}>
                    {actionStatus}
                  </span>
                </td>
                <td className="py-3.5 pr-3 font-mono text-slate-400">11:15 AM</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={handlePrimaryActionClick}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer"
                  >
                    Open
                  </button>
                </td>
              </tr>

              <tr>
                <td className="py-3.5 pr-3">
                  <div className="font-bold text-white">Arrange Transport Buses</div>
                  <div className="text-[11px] text-slate-400">Reinforce staged fleet with reserve depot vehicles</div>
                </td>
                <td className="py-3.5 pr-3 font-mono text-slate-300">
                  {ctx.responsibleTeams.transport}
                </td>
                <td className="py-3.5 pr-3">
                  <span className={`px-2.5 py-1 rounded text-[10.5px] font-mono font-bold border ${
                    isTransportSufficient
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}>
                    {isTransportSufficient ? 'COMPLETED' : 'NEEDS ACTION'}
                  </span>
                </td>
                <td className="py-3.5 pr-3 font-mono text-slate-400">11:05 AM</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => {
                      if (onNavigateModule) onNavigateModule('relocation-planning');
                    }}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer"
                  >
                    Manage
                  </button>
                </td>
              </tr>

              <tr>
                <td className="py-3.5 pr-3">
                  <div className="font-bold text-white">Notify Priority Families</div>
                  <div className="text-[11px] text-slate-400">Outbound SMS and emergency village sirens dispatched</div>
                </td>
                <td className="py-3.5 pr-3 font-mono text-slate-300">
                  {ctx.responsibleTeams.controlRoom}
                </td>
                <td className="py-3.5 pr-3">
                  <span className="px-2.5 py-1 rounded text-[10.5px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    COMPLETED
                  </span>
                </td>
                <td className="py-3.5 pr-3 font-mono text-slate-400">10:45 AM</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => {
                      if (onNavigateModule) onNavigateModule('alerts-voice');
                    }}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>

              <tr>
                <td className="py-3.5 pr-3">
                  <div className="font-bold text-white">Stage Medical Triage at Destination</div>
                  <div className="text-[11px] text-slate-400">Doctor team and basic emergency beds prepared at haven</div>
                </td>
                <td className="py-3.5 pr-3 font-mono text-slate-300">
                  {ctx.responsibleTeams.health}
                </td>
                <td className="py-3.5 pr-3">
                  <span className="px-2.5 py-1 rounded text-[10.5px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    COMPLETED
                  </span>
                </td>
                <td className="py-3.5 pr-3 font-mono text-slate-400">10:30 AM</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => {
                      if (onNavigateModule) onNavigateModule('carrying-capacity');
                    }}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* =======================================================================
          SECTION 10: ACTION IMPACT & AUDIT TRAIL
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: ACTION IMPACT (BEFORE VS AFTER) */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold font-serif text-white">
              ACTION IMPACT
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
              {showSimulation ? 'SIMULATION' : 'REAL-TIME INCIDENT IMPACT'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#070D0A] border border-[#1A2E24] space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">BEFORE ACTION</div>
              <div className="text-xs text-slate-300 mt-1">Families in High-Risk Area:</div>
              <div className="text-xl font-bold font-mono text-rose-400">{ctx.priorityFamiliesToMove}</div>
              <div className="text-xs text-slate-300 mt-2">Haven Families Sheltered:</div>
              <div className="text-xl font-bold font-mono text-slate-400">0</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-1">
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">AFTER ACTION</div>
              <div className="text-xs text-slate-300 mt-1">Families Remaining in Danger:</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{remainingPriorityFamilies}</div>
              <div className="text-xs text-slate-300 mt-2">Haven Families Sheltered:</div>
              <div className="text-xl font-bold font-mono text-cyan-400">{familiesMoved}</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#070D0A] p-3 rounded-xl border border-[#1A2E24]">
            <strong className="text-emerald-400">Impact Result:</strong>{' '}
            {familiesMoved > 0 
              ? `Immediate danger to ${familiesMoved} priority families eliminated through safe relocation to ${ctx.safeHavenName}.`
              : 'Immediate relocation requirement remains at full volume until the convoy commences movement.'}
          </p>
        </div>

        {/* RIGHT: WHAT CHANGED SINCE LAST UPDATE */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold font-serif text-white">
              WHAT CHANGED?
            </h3>
            <span className="text-xs font-mono text-slate-400">Since Previous Telemetry Check</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24]">
              <span className="text-xs text-slate-300">Hazard Threat Level</span>
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="text-slate-400">{ctx.whatChanged.threatLevel.prev}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-rose-400">{ctx.whatChanged.threatLevel.curr}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24]">
              <span className="text-xs text-slate-300">Priority Families to Evacuate</span>
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="text-slate-400">{ctx.whatChanged.families.prev}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-rose-400">{ctx.whatChanged.families.curr}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24]">
              <span className="text-xs text-slate-300">Staged Transport Buses</span>
              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="text-slate-400">{ctx.whatChanged.transport.prev}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-emerald-400">{ctx.whatChanged.transport.curr}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24] text-xs text-slate-300">
              <span className="text-slate-400 block text-[10px] font-mono uppercase mb-1">Road Transit Assessment</span>
              {ctx.whatChanged.road}
            </div>
          </div>
        </div>

      </div>

      {/* =======================================================================
          SECTION 11: SITREP & DIRECT OPERATIONAL TRIGGERS
          ======================================================================= */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold font-serif text-white">
              Executive Incident Documentation & Official SITREP
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Record current operational status and action outcomes into the official disaster situation report
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onNavigateModule) onNavigateModule('reports');
              }}
              className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Include in SITREP (Module 10)</span>
            </button>
          </div>
        </div>
      </div>

      {/* =======================================================================
          ACTION CONFIRMATION MODAL (SAFE EXECUTION GATEWAY)
          ======================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
            isLight ? 'bg-white border-slate-300' : 'bg-[#0B1713] border-emerald-600/80 text-white'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-white">CONFIRM OPERATIONAL ACTION</h3>
                  <p className="text-xs text-slate-400">Review parameters before authorizing movement dispatch</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#070D0A] border border-[#1A2E24] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Action:</span>
                  <strong className="text-white">Relocate {ctx.priorityFamiliesToMove} Priority Families</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">From Origin:</span>
                  <span className="text-rose-300 font-mono">{ctx.redZoneName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">To Safe Haven:</span>
                  <span className="text-emerald-300 font-mono">{ctx.safeHavenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Evacuation Route:</span>
                  <span className="text-amber-300 font-mono">{ctx.routeTitle} ({ctx.routeDistanceKm} km)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining Site Capacity:</span>
                  <span className="text-cyan-300 font-mono">{ctx.safeHavenCapacityFamilies - ctx.priorityFamiliesToMove} families</span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-[#070D0A] border border-[#1A2E24] text-[11px] font-mono">
                <div className="text-emerald-400">✓ Destination confirmed safe and verified</div>
                <div className="text-emerald-400">✓ Holding capacity and potable water available</div>
                <div className="text-emerald-400">✓ Transit corridor clear and escort unit notified</div>
                <div className={isTransportSufficient ? 'text-emerald-400' : 'text-amber-400'}>
                  {isTransportSufficient ? '✓ Full vehicle fleet staged' : `⚠ Transport fleet operating with ${effectiveVehicles} staged vehicles`}
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                <strong>Expected Result:</strong> All {ctx.priorityFamiliesToMove} priority families will be safely evacuated out of the active hazard perimeter to the designated safe haven under NDRF/Police escort.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStartMovement}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Start Movement</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
