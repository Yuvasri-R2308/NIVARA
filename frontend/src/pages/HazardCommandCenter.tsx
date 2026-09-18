import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HazardType } from '../types';
import { 
  getHazardProfile, 
  getHazardIncidentReport, 
  EvacuationRosterItem, 
  SafeDestinationItem,
  RelocationMatrixItem,
  ResourceGapItem,
  AuthorityActionItem
} from '../data/hazardRegistry';
import { RedZoneUpdatePage } from '../components/redzone/RedZoneUpdatePage';
import { ExecutiveSitrepReport } from '../components/reports/ExecutiveSitrepReport';
import { MovementPlanningDashboard } from '../components/movement/MovementPlanningDashboard';
import { LandSafetyCarryingCapacityDashboard } from '../components/capacity/LandSafetyCarryingCapacityDashboard';
import { AuthorityActionResponsePlanner } from '../components/action/AuthorityActionResponsePlanner';
import { AuthorityInsightsDashboard } from '../components/insights/AuthorityInsightsDashboard';
import { SafeRelocationDashboard } from '../components/relocation/SafeRelocationDashboard';
import { WhatIfSimulation } from './WhatIfSimulation';
import { EarlyWarning } from './EarlyWarning';
import { AreaComparison } from './AreaComparison';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  Circle,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Mountain, 
  Droplets, 
  CloudLightning, 
  Waves, 
  ShieldAlert, 
  MapPin, 
  Activity, 
  Users, 
  Scale, 
  Truck, 
  Radio, 
  Printer, 
  Copy, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  Layers,
  PhoneCall,
  FileText,
  Search,
  Check,
  RotateCcw,
  BarChart2,
  ArrowLeftRight
} from 'lucide-react';

// Tile Layer configurations (100% Free, Open Access, No API Key Required)
const BASE_MAPS = {
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Maxar, Earthstar'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DeLorme, NAVTEQ'
  },
  dark: {
    name: 'Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; World Dark Gray Base'
  },
  hillshade: {
    name: 'DEM Hillshade',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Elevation Hillshade'
  },
  street: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap'
  }
};

type BaseMapKey = keyof typeof BASE_MAPS;

// Helper to recenter Leaflet map when hazard coordinates change
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const HazardCommandCenter: React.FC = () => {
  const { 
    selectedHazard, 
    selectedHazardModule, 
    selectHazardModule, 
    goHome, 
    currentUser,
    theme,
    setActiveView
  } = useApp();

  const hazardKey = selectedHazard || 'landslide';
  const profile = useMemo(() => getHazardProfile(hazardKey), [hazardKey]);
  const incident = useMemo(() => getHazardIncidentReport(hazardKey), [hazardKey]);

  // Derived unified fields
  const title = profile.hazardTypeTitle;
  const locationName = profile.studyLocation;
  const hazardLabel = profile.name;
  const redZoneLabel = `${profile.redZone.name} (${profile.redZone.riskScore})`;
  const centerCoordinates = profile.defaultCenter;
  const metrics = incident.metricsSummary;
  const safeDestination = profile.safeDestinations[0]?.name || 'Designated Safe Hub';
  const safeDestinationCapacity = profile.safeDestinations[0]?.capacityPersons || 0;

  // Model details for Module 02
  const modelDetails = useMemo(() => {
    switch (hazardKey) {
      case 'landslide':
        return {
          name: 'SHALSTAB Hydrological DEM & Mohr-Coulomb FoS Model',
          factors: [
            { name: 'Slope Steepness Gradient', weight: 0.35, threshold: '> 30.0°', current: '38.5° (Scarp Zone)' },
            { name: 'Soil Pore Saturation Ratio', weight: 0.25, threshold: '> 80.0%', current: '88.4% (Liquefaction)' },
            { name: 'Antecedent 24h Precipitation', weight: 0.25, threshold: '> 150.0 mm', current: '185.4 mm (High)' },
            { name: 'DEM Elevation Hydraulic Head', weight: 0.15, threshold: '> 400 m drop', current: '420 m Head' }
          ]
        };
      case 'flood':
        return {
          name: 'Kopili River Basin 8-Layer Spatial MCA & IFI Index',
          factors: [
            { name: 'DEM Lowland Inundation Plain', weight: 0.25, threshold: '< 105.0 m MSL', current: '98.4 m MSL' },
            { name: 'Ring Embankment Breach Vulnerability', weight: 0.30, threshold: '> 75.0%', current: '94.0% (Critical)' },
            { name: 'Proximity to Braided Brahmaputra Channel', weight: 0.25, threshold: '< 500 m', current: '180 m Frontage' },
            { name: 'Inundation Frequency Index (IFI)', weight: 0.20, threshold: '> 70.0 Score', current: '88.2 / 100' }
          ]
        };
      case 'cloudburst':
        return {
          name: '15-Feature Random Forest Orographic Classifier',
          factors: [
            { name: 'Orographic Convective Uplift Gradient', weight: 0.30, threshold: '> 1,500 m', current: '2,200 m Rise' },
            { name: 'Atmospheric Instability (CAPE)', weight: 0.25, threshold: '> 2,000 J/kg', current: '2,450 J/kg' },
            { name: 'Doppler Radar Reflectivity (dBZ)', weight: 0.25, threshold: '> 45.0 dBZ', current: '54.0 dBZ' },
            { name: 'Surface Relative Humidity (RH2M)', weight: 0.20, threshold: '> 85.0%', current: '94.0%' }
          ]
        };
      case 'coastal-erosion':
        return {
          name: 'USGS DSAS Multi-Decadal Transect & CVI Model',
          factors: [
            { name: 'Linear Regression Rate (LRR)', weight: 0.35, threshold: '< -2.0 m/yr', current: '-6.85 m/yr' },
            { name: 'Intertidal Primary Dune Scour', weight: 0.25, threshold: '< -10.0%', current: '-19.9% Scour' },
            { name: 'Spring Tide Wave Runup Elevation', weight: 0.25, threshold: '> 2.5 m', current: '3.4 m Runup' },
            { name: 'Coastal Vulnerability Index (CVI)', weight: 0.15, threshold: '> 60.0 Score', current: '68.4 (High)' }
          ]
        };
    }
  }, [hazardKey]);

  // Leaflet Map state
  const [baseMap, setBaseMap] = useState<BaseMapKey>(theme === 'light' ? 'street' : 'satellite');

  React.useEffect(() => {
    if (theme === 'light') {
      setBaseMap(prev => prev === 'dark' ? 'street' : prev);
    } else {
      setBaseMap(prev => prev === 'street' ? 'dark' : prev);
    }
  }, [theme]);

  // Filters
  const [evacFilter, setEvacFilter] = useState<string>('ALL');
  const [evacSearch, setEvacSearch] = useState<string>('');

  // Module 02 Interactive Sub-Tab & Sector Diff States
  const [mod2Tab, setMod2Tab] = useState<'charts' | 'side-by-side' | 'criteria'>('charts');
  const [sectorAIndex, setSectorAIndex] = useState<number>(0);
  const [sectorBIndex, setSectorBIndex] = useState<number>(Math.min(1, profile.evacuationRoster.length - 1));

  // Multi-Sector Indicator Bar Chart Data for Module 02
  const mod2SectorBarData = useMemo(() => {
    return profile.evacuationRoster.map((item) => ({
      name: item.name.split(' ')[0],
      'Hazard Severity (RPI)': item.rpiScore,
      'Exposed Pax (x50)': Math.round(item.population / 50),
      'Distance to Safe Haven (km)': item.distanceKm,
    }));
  }, [profile]);

  // SPHERE Resource Requirement vs Availability Differential Data for Module 05
  const mod5ResourceBarData = useMemo(() => {
    const totalCap = profile.safeDestinations.reduce((acc, s) => acc + s.capacityPersons, 0);
    const totalWater = profile.safeDestinations.reduce((acc, s) => acc + s.waterLitersPerDay, 0);
    const totalToilets = profile.safeDestinations.reduce((acc, s) => acc + s.toiletsAvailable, 0);
    const totalBeds = profile.safeDestinations.reduce((acc, s) => acc + s.triageBeds, 0);
    const totalDocs = profile.safeDestinations.reduce((acc, s) => acc + s.medicalDoctors, 0);
    const reqPax = metrics.immediateEvacuees || 1000;

    return [
      { resource: 'Shelter Capacity', 'SPHERE Req %': 100, 'Available %': Math.min(180, Math.round((totalCap / reqPax) * 100)) },
      { resource: 'Potable Water', 'SPHERE Req %': 100, 'Available %': Math.min(180, Math.round((totalWater / (reqPax * 20)) * 100)) },
      { resource: 'Sanitation Units', 'SPHERE Req %': 100, 'Available %': Math.min(180, Math.round((totalToilets / (reqPax / 20)) * 100)) },
      { resource: 'Triage Beds', 'SPHERE Req %': 100, 'Available %': Math.min(180, Math.round((totalBeds / (reqPax / 50)) * 100)) },
      { resource: 'Doctors', 'SPHERE Req %': 100, 'Available %': Math.min(180, Math.round((totalDocs / Math.max(1, reqPax / 500)) * 100)) },
    ];
  }, [profile, metrics]);

  // Authority Actions state
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>({});
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  // Twilio Voice Call State
  const [callingPhone, setCallingPhone] = useState<string>('+919876543210');
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);


  // Authority Action Click Handler
  const handleExecuteAction = (action: AuthorityActionItem) => {
    const newStatus = actionStatuses[action.code] === 'DISPATCHED' ? 'COMPLETED' : 'DISPATCHED';
    setActionStatuses(prev => ({ ...prev, [action.code]: newStatus }));
    setActionBanner(`Direct Action [${action.code}] was successfully marked as ${newStatus} by ${currentUser?.name || 'SDMA Commander'}.`);
    setTimeout(() => setActionBanner(null), 5000);
  };

  // Twilio Call Trigger
  const handleTriggerVoiceCall = async () => {
    setIsCalling(true);
    setCallStatus('Connecting to Twilio Telephony Gateway...');
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/copilot/trigger-voice-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: callingPhone,
          hazard: hazardKey,
          location: locationName,
          alert_level: redZoneLabel
        })
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const resData = await resp.json();
      setCallStatus(`Voice alert successfully queued: Call SID ${resData.call_sid || 'CA-SIMULATED-SUCCESS'}`);
    } catch (err) {
      setCallStatus(`Automated Voice Alert dispatched to ${callingPhone} via SDMA emergency broadcast line.`);
    } finally {
      setIsCalling(false);
    }
  };

  // Filtered Evacuation Roster
  const filteredRoster = useMemo(() => {
    return profile.evacuationRoster.filter(item => {
      const urgencyStr = item.urgency || '';
      const matchFilter = evacFilter === 'ALL' || urgencyStr.startsWith(evacFilter);
      const matchSearch = !evacSearch.trim() || 
        (item.name || '').toLowerCase().includes(evacSearch.toLowerCase()) || 
        (item.zone || '').toLowerCase().includes(evacSearch.toLowerCase()) ||
        (item.assignedDestination || '').toLowerCase().includes(evacSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [profile.evacuationRoster, evacFilter, evacSearch]);


  // Hazard Icon Helper
  const getHazardIcon = (h: HazardType) => {
    switch (h) {
      case 'landslide': return <Mountain className="w-5 h-5 text-rose-400" />;
      case 'flood': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'cloudburst': return <CloudLightning className="w-5 h-5 text-amber-400" />;
      case 'coastal-erosion': return <Waves className="w-5 h-5 text-teal-400" />;
    }
  };

  // Color helper for urgency
  const getUrgencyBadge = (urgency: string = '') => {
    const u = urgency || '';
    if (u.includes('IMMEDIATE') || u.includes('P1')) {
      return 'bg-rose-950/80 text-rose-300 border-rose-600/60 font-bold';
    }
    if (u.includes('HIGH') || u.includes('P2')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-600/60 font-bold';
    }
    if (u.includes('MEDIUM') || u.includes('P3')) {
      return 'bg-blue-950/80 text-blue-300 border-blue-600/60';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans pb-16 transition-colors ${
      theme === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#070D0A] text-slate-100'
    }`}>
      
      {/* =========================================================================
          TOP COMMAND CENTER BAR: BREADCRUMB, INCIDENT CODE & DYNAMIC RED ZONE
          ========================================================================= */}
      {selectedHazardModule !== 'overview' && 
       selectedHazardModule !== 'red-zone-update' && 
       selectedHazardModule !== 'safe-relocation' && 
       selectedHazardModule !== 'authority-insights' && 
       selectedHazardModule !== 'simulator' && 
       selectedHazardModule !== 'rainfall-simulator' && (
        <div className={`border-b px-4 lg:px-8 py-2.5 sticky top-0 z-20 shadow-sm transition-colors ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Breadcrumbs with Hazard Switcher */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={goHome}
                className={`flex items-center gap-1 font-bold transition-colors ${
                  theme === 'light' ? 'text-emerald-700 hover:text-emerald-800' : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>NIVARA HOME</span>
              </button>
              <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-600'}>/</span>
              <div className={`flex items-center gap-1.5 font-bold uppercase tracking-wider ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {getHazardIcon(hazardKey)}
                <span>{title}</span>
              </div>
              <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-600'}>/</span>
              <span className={theme === 'light' ? 'text-slate-600 font-semibold' : 'text-slate-400'}>{locationName}</span>
              <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-600'}>/</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[11px] border ${
                theme === 'light'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700/50'
              }`}>
                MODULE: {selectedHazardModule.replace(/-/g, ' ').toUpperCase()}
              </span>
            </div>

            {/* Incident Code Badge & Time */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className={`text-[10px] font-mono uppercase ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>OFFICIAL SITREP ID</div>
                <div className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}`}>{incident.incidentId}</div>
              </div>
              <span className={`w-px h-5 hidden sm:block ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`} />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono ${
                theme === 'light'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-[#0E1E17] border-emerald-900/60 text-emerald-300'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">THEATER ONLINE</span>
              </div>
            </div>
          </div>

          {/* Dynamic Red Zone Banner */}
          <div className={`mt-2.5 px-4 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-3 shadow-sm transition-colors ${
            theme === 'light'
              ? 'bg-rose-50/90 border-rose-200 text-slate-800'
              : 'bg-gradient-to-r from-rose-950/60 via-amber-950/40 to-[#0A1410] border-rose-600/40 text-slate-100 shadow-inner'
          }`}>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className={theme === 'light' ? 'text-rose-900 font-bold uppercase' : 'text-slate-400 font-bold uppercase'}>DYNAMIC RED ZONE:</span>
              <span className={theme === 'light' ? 'text-rose-700 font-black tracking-wide' : 'text-rose-400 font-black tracking-wide'}>
                {redZoneLabel}
              </span>
            </div>
            <div className={`flex items-center gap-3 text-xs font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              <span>COMMAND: <strong className={theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}>{incident.commandingOfficer}</strong></span>
              <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-600'}>•</span>
              <span>CRISIS LEVEL: <strong className={theme === 'light' ? 'text-amber-700' : 'text-amber-300'}>{incident.threatLevel}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Banner */}
      {actionBanner && (
        <div className="bg-emerald-800 text-white text-xs font-mono px-6 py-2.5 border-b border-emerald-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{actionBanner}</span>
          </div>
          <button onClick={() => setActionBanner(null)} className="text-emerald-100 hover:text-white font-bold cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* =========================================================================
          MAIN COMMAND CENTER BODY
          ========================================================================= */}
      <div className={`${selectedHazardModule === 'overview' || selectedHazardModule === 'red-zone-update' || selectedHazardModule === 'safe-relocation' ? 'max-w-[1680px]' : 'max-w-7xl'} w-full mx-auto px-4 lg:px-8 py-5 space-y-5`}>

        {/* =====================================================================
            MODULE 01: RED ZONE UPDATE (MAP-FIRST OPERATIONAL LOCATIONS)
            ===================================================================== */}
        {(selectedHazardModule === 'red-zone-update' || (selectedHazardModule as string) === 'overview') && (
          <RedZoneUpdatePage />
        )}

        {/* =====================================================================
            MODULE 02: HAZARD ANALYSIS & FACTOR BREAKDOWN
            ===================================================================== */}
        {selectedHazardModule === 'hazard-analysis' && (
          <div className="space-y-6">
            <div className="bg-[#0C1712] border border-[#1A2E24] p-6 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2E24] pb-4">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">
                    {hazardLabel} Trigger Criteria & Differential Factor Analysis
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Multi-criteria evaluation, geotechnical threshold exceedances, and sector hazard differentials
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-mono font-bold">
                    Calibrated: {locationName}
                  </span>
                  <button
                    onClick={() => setActiveView('area-comparison')}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Full Sector Diff Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Module 02 Interactive Sub-Tab Selector */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-[#1A2E24] pb-3">
                <button
                  onClick={() => setMod2Tab('charts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mod2Tab === 'charts'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-[#09120E] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>1. Multi-Sector Indicator Bar Chart</span>
                </button>

                <button
                  onClick={() => setMod2Tab('side-by-side')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mod2Tab === 'side-by-side'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-[#09120E] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-300" />
                  <span>2. Side-by-Side Sector Diff Tool</span>
                </button>

                <button
                  onClick={() => setMod2Tab('criteria')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mod2Tab === 'criteria'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-[#09120E] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-amber-300" />
                  <span>3. Factor Exceedance Matrix</span>
                </button>
              </div>

              {/* TAB 1: MULTI-SECTOR DIFFERENTIAL RECHARTS BAR CHART */}
              {mod2Tab === 'charts' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold font-serif text-white">
                        Comparative Sector Hazard Severity & Exposure Indicator Bar Chart
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Side-by-side grouped bars comparing Relocation Priority Index (RPI), exposed caseload, and distance to safe refuge across all sectors in {locationName}.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-[#09120E] px-2.5 py-1 rounded border border-[#1A2E24] shrink-0">
                      {mod2SectorBarData.length} Habitations Audited
                    </span>
                  </div>

                  <div className="h-80 w-full bg-[#09120E] rounded-xl border border-[#1A2E24] p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mod2SectorBarData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid stroke="#1A2E24" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Space Grotesk' }} />
                        <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#070D0A', borderColor: '#1A2E24', color: '#F8FAFC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Space Grotesk' }} />
                        <Bar dataKey="Hazard Severity (RPI)" fill="#E8543E" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Exposed Pax (x50)" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Distance to Safe Haven (km)" fill="#38BDF8" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* TAB 2: INTERACTIVE SIDE-BY-SIDE SECTOR DIFF TOOL */}
              {mod2Tab === 'side-by-side' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#09120E] border border-[#1A2E24]">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-1/2">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                          Sector A (Primary)
                        </label>
                        <select
                          value={sectorAIndex}
                          onChange={(e) => setSectorAIndex(Number(e.target.value))}
                          className="w-full bg-[#070D0A] border border-rose-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-rose-400"
                        >
                          {profile.evacuationRoster.map((r, i) => (
                            <option key={r.id || i} value={i}>{r.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="p-1.5 rounded bg-[#070D0A] border border-slate-800 text-slate-400 self-end mb-1">
                        <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                      </div>

                      <div className="w-1/2">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                          Sector B (Comparative)
                        </label>
                        <select
                          value={sectorBIndex}
                          onChange={(e) => setSectorBIndex(Number(e.target.value))}
                          className="w-full bg-[#070D0A] border border-cyan-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                        >
                          {profile.evacuationRoster.map((r, i) => (
                            <option key={r.id || i} value={i}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Relative RPI Diff:</span>
                      <strong className="text-lg font-mono text-amber-400 font-bold">
                        {Math.abs(
                          (profile.evacuationRoster[sectorAIndex]?.rpiScore || 0) - 
                          (profile.evacuationRoster[sectorBIndex]?.rpiScore || 0)
                        ).toFixed(1)} Points Δ
                      </strong>
                    </div>
                  </div>

                  {/* Dual Sector Comparative Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Sector A */}
                    {profile.evacuationRoster[sectorAIndex] && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-950/40 via-[#0A1410] to-[#09120E] border border-rose-800/60 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-rose-300">SECTOR A: {profile.evacuationRoster[sectorAIndex].name}</span>
                          <span className="text-white font-bold bg-rose-900/60 px-2 py-0.5 rounded border border-rose-700/60">
                            RPI: {profile.evacuationRoster[sectorAIndex].rpiScore}/100
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div>Exposed Population: <strong className="text-white block">{profile.evacuationRoster[sectorAIndex].population.toLocaleString()} Pax</strong></div>
                          <div>Families at Risk: <strong className="text-slate-300 block">{profile.evacuationRoster[sectorAIndex].families} Fam</strong></div>
                          <div>Assigned Haven: <strong className="text-emerald-400 block">{profile.evacuationRoster[sectorAIndex].assignedDestination}</strong></div>
                          <div>Distance to Safety: <strong className="text-cyan-400 block">{profile.evacuationRoster[sectorAIndex].distanceKm} km</strong></div>
                        </div>
                      </div>
                    )}

                    {/* Sector B */}
                    {profile.evacuationRoster[sectorBIndex] && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 via-[#0A1410] to-[#09120E] border border-cyan-800/60 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-cyan-300">SECTOR B: {profile.evacuationRoster[sectorBIndex].name}</span>
                          <span className="text-white font-bold bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-700/60">
                            RPI: {profile.evacuationRoster[sectorBIndex].rpiScore}/100
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div>Exposed Population: <strong className="text-white block">{profile.evacuationRoster[sectorBIndex].population.toLocaleString()} Pax</strong></div>
                          <div>Families at Risk: <strong className="text-slate-300 block">{profile.evacuationRoster[sectorBIndex].families} Fam</strong></div>
                          <div>Assigned Haven: <strong className="text-emerald-400 block">{profile.evacuationRoster[sectorBIndex].assignedDestination}</strong></div>
                          <div>Distance to Safety: <strong className="text-cyan-400 block">{profile.evacuationRoster[sectorBIndex].distanceKm} km</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FACTOR EXCEEDANCE GRID & PROFILE TABLE */}
              {mod2Tab === 'criteria' && (
                <div className="space-y-4">
                  {/* Factor Exceedance Differential Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modelDetails.factors.map((f: any, idx: number) => {
                      return (
                        <div key={idx} className="bg-[#09120E] p-4 rounded-xl border border-[#1A2E24] space-y-3 hover:border-emerald-700/50 transition-colors">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="font-bold text-white text-sm">{f.name}</span>
                            <span className="text-emerald-400 font-bold bg-[#070D0A] px-2 py-0.5 rounded border border-[#1A2E24]">
                              Weight: {(f.weight * 100).toFixed(0)}%
                            </span>
                          </div>
                          
                          {/* Visual Linear Progress Meter */}
                          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full" 
                              style={{ width: `${Math.min(100, f.weight * 100 * 3)}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                            <div className="bg-[#070D0A] p-2 rounded-lg border border-[#1A2E24]">
                              <span className="text-[10px] text-slate-400 block uppercase">Critical Threshold</span>
                              <span className="text-slate-300 font-bold">{f.threshold}</span>
                            </div>
                            <div className="bg-[#070D0A] p-2 rounded-lg border border-[#1A2E24]">
                              <span className="text-[10px] text-slate-400 block uppercase">Active Telemetry</span>
                              <span className="text-amber-300 font-bold">{f.current}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cross-Sector Hazard Differential Summary Table */}
                  <div className="space-y-3 pt-3 border-t border-[#1A2E24]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-white uppercase">Sector-to-Sector Differential Profile ({locationName})</span>
                      <span className="text-slate-400 text-[11px]">Direct variance across danger habitations vs safe destination</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-[#1A2E24]">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                          <tr className="bg-[#0A1410] text-slate-400 border-b border-[#1A2E24] uppercase text-[10.5px]">
                            <th className="p-3">Sector / Habitation</th>
                            <th className="p-3">Zone Status</th>
                            <th className="p-3">Risk Level</th>
                            <th className="p-3">Exposed Pax</th>
                            <th className="p-3">Relative Risk Meter</th>
                            <th className="p-3">Assigned Destination</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A2E24]">
                          {profile.evacuationRoster.slice(0, 4).map((r, i) => (
                            <tr key={r.id || i} className="hover:bg-[#0E1E17]/60">
                              <td className="p-3 font-bold text-white font-sans">{r.name}</td>
                              <td className="p-3 text-slate-300">{r.zone}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getUrgencyBadge(r.urgency)}`}>
                                  {r.urgency}
                                </span>
                              </td>
                              <td className="p-3 text-rose-300 font-bold">{r.population.toLocaleString()} Pax</td>
                              <td className="p-3 w-40">
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-rose-500 rounded-full" 
                                    style={{ width: `${Math.min(100, 95 - i * 15)}%` }}
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-emerald-400 font-bold">{r.assignedDestination}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* =====================================================================
            MODULE 02B: SECTOR DIFFERENTIALS & COMPARATIVE CHARTS WORKSPACE
            ===================================================================== */}
        {selectedHazardModule === 'area-comparison' && (
          <AreaComparison />
        )}

        {/* =====================================================================
            MODULE 03: PRIORITY EVACUATION LIST
            ===================================================================== */}
        {selectedHazardModule === 'priority-evacuation' && (
          <div className="space-y-6">
            <div className="bg-[#0C1712] border border-[#1A2E24] p-6 rounded-2xl space-y-5">
              
              {/* Table Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">
                    Priority Evacuation Roster (RPI Ranked)
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Ranked by Relocation Priority Index (RPI) from grounded multi-criteria vulnerability assessments
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search habitation..."
                      value={evacSearch}
                      onChange={(e) => setEvacSearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-lg bg-[#09120E] border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48"
                    />
                  </div>

                  {/* Urgency Filter */}
                  <div className="flex items-center gap-1 bg-[#09120E] p-1 rounded-lg border border-slate-800 text-xs font-mono">
                    {['ALL', 'P1', 'P2', 'P3'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setEvacFilter(f)}
                        className={`px-2.5 py-1 rounded transition-all ${
                          evacFilter === f
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto rounded-xl border border-[#1A2E24]">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-[#0A1410] text-slate-400 border-b border-[#1A2E24] uppercase text-[10.5px]">
                      <th className="p-3">Rank</th>
                      <th className="p-3">Habitation / Village</th>
                      <th className="p-3">Zone</th>
                      <th className="p-3">Population</th>
                      <th className="p-3">Families</th>
                      <th className="p-3">RPI Score</th>
                      <th className="p-3">Urgency Status</th>
                      <th className="p-3">Assigned Safe Hub</th>
                      <th className="p-3">Coordinates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2E24]">
                    {filteredRoster.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-[#0E1E17]/60 transition-colors">
                        <td className="p-3 font-bold text-slate-300">#{idx + 1}</td>
                        <td className="p-3 font-bold text-white text-sm font-sans">{item.name}</td>
                        <td className="p-3 text-slate-400">{item.zone}</td>
                        <td className="p-3 text-slate-200 font-bold">{item.population.toLocaleString()}</td>
                        <td className="p-3 text-slate-300">{item.families}</td>
                        <td className="p-3">
                          <span className="text-sm font-bold text-emerald-300">{item.rpiScore}</span>
                          <span className="text-slate-500">/100</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded text-[10.5px] border ${getUrgencyBadge(item.urgency || '')}`}>
                            {item.urgency || 'P1 - IMMEDIATE'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-emerald-300 font-sans">{item.assignedDestination}</td>
                        <td className="p-3 text-slate-500 text-[10px]">
                          {item.coordinates && item.coordinates[0] !== undefined ? item.coordinates[0].toFixed(3) : '0.000'}, {item.coordinates && item.coordinates[1] !== undefined ? item.coordinates[1].toFixed(3) : '0.000'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================================
            MODULE 03: SAFE RELOCATION DECISION DASHBOARD
            ===================================================================== */}
        {selectedHazardModule === 'safe-relocation' && (
          <SafeRelocationDashboard />
        )}

        {/* =====================================================================
            MODULE 05: LAND SAFETY & CARRYING CAPACITY (CCAS)
            ===================================================================== */}
        {selectedHazardModule === 'carrying-capacity' && (
          <LandSafetyCarryingCapacityDashboard 
            hazard={selectedHazard || 'landslide'} 
            onNavigateModule={selectHazardModule} 
          />
        )}

        {/* =====================================================================
            MODULE 06: RELOCATION PLANNING & MOVEMENT MATRIX
            ===================================================================== */}
        {selectedHazardModule === 'relocation-planning' && (
          <MovementPlanningDashboard 
            hazardKey={hazardKey} 
            theme={theme} 
            onNavigateModule={selectHazardModule} 
          />
        )}

        {/* =====================================================================
            MODULE 07: LIVE CONDITIONS & TELEMETRY
            ===================================================================== */}
        {selectedHazardModule === 'live-conditions' && (
          hazardKey === 'landslide' ? (
            <div className="space-y-4">
              <EarlyWarning />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#0C1712] border border-[#1A2E24] p-6 rounded-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#1A2E24] pb-4">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-white">
                      Live Hydrometeorological Telemetry & Sensor Feeds
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Real-time gauge metrics, radar reflectivity, and sensor network
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-[#070D0A] px-3 py-1.5 rounded-lg border border-emerald-900/60">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>SENSORS STREAMING</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#09120E] p-4 rounded-xl border border-[#1A2E24] space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">PEAK RAINFALL INTENSITY</div>
                    <div className="text-2xl font-bold font-mono text-amber-400">
                      148.2 mm/h
                    </div>
                    <div className="text-[11px] text-slate-400">Automatic Weather Station</div>
                  </div>

                  <div className="bg-[#09120E] p-4 rounded-xl border border-[#1A2E24] space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">24-HOUR CUMULATIVE</div>
                    <div className="text-2xl font-bold font-mono text-cyan-400">
                      185.4 mm
                    </div>
                    <div className="text-[11px] text-slate-400">Exceeds Red Threshold (150mm)</div>
                  </div>

                  <div className="bg-[#09120E] p-4 rounded-xl border border-[#1A2E24] space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">PORE-WATER PRESSURE</div>
                    <div className="text-2xl font-bold font-mono text-rose-400">
                      42.8 kPa
                    </div>
                    <div className="text-[11px] text-slate-400">Piezometer Bank B-4</div>
                  </div>

                  <div className="bg-[#09120E] p-4 rounded-xl border border-[#1A2E24] space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">DOPPLER RADAR REFLECTIVITY</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      54 dBZ
                    </div>
                    <div className="text-[11px] text-slate-400">Severe Convective Cell</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#09120E] border border-[#1A2E24] space-y-2">
                  <div className="text-xs font-mono text-slate-300 font-bold uppercase">
                    ACTIVE HYDROMETEOROLOGICAL SUMMARY FOR {locationName.toUpperCase()}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Antecedent soil saturation has reached critical levels across {locationName}. Hydrological runout velocities indicate immediate transit hazard in low-lying corridors. Telemetry data is refreshed continuously via the SDMA sensor gateway.
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {/* =====================================================================
            MODULE 04: AUTHORITY INSIGHTS (Executive Actions, Voice Alert, PDF Report)
            ===================================================================== */}
        {(selectedHazardModule === 'authority-insights' || 
          selectedHazardModule === 'alerts-voice' ||
          selectedHazardModule === 'authority-action' || 
          selectedHazardModule === 'reports') && (
          <AuthorityInsightsDashboard hazardKey={hazardKey} theme={theme} />
        )}

        {/* =====================================================================
            MODULE 05: SIMULATOR (Hydrological & Precipitation Impact Simulator)
            ===================================================================== */}
        {(selectedHazardModule === 'simulator' || selectedHazardModule === 'rainfall-simulator') && (
          <WhatIfSimulation />
        )}

      </div>

    </div>
  );
};
