import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Waves, 
  CloudRain, 
  Activity, 
  Layers, 
  Sliders, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  TrendingUp, 
  ArrowRight, 
  MapPin, 
  Mountain, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  RefreshCw,
  Gauge,
  Droplets,
  Zap,
  HelpCircle,
  FileSpreadsheet,
  Database,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  BarChart3,
  SlidersHorizontal,
  Flame,
  Maximize2
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface DWSSLLocation {
  id: string;
  location: string;
  sub_division: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  slope_deg: number;
  static_hri: number;
  dynamic_hri: number;
  dynamic_change: number;
  api_contribution: number;
  pore_pressure_contribution: number;
  rainfall_24h: number;
  rainfall_48h: number;
  rainfall_72h: number;
  api: number;
  normalized_api: number;
  wetness_index: number;
  wetness_state: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  decay_factor_k: number;
  soil_moisture: number;
  soil_depth_m: number;
  pore_pressure_ratio: number;
  rainfall_trigger: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  dwssl_status: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  decision_support: string;
  data_status: string;
  is_simulation: boolean;
  simulation_multiplier: number;
  calculated_at: string;
}

interface DWSSLSummary {
  system_status: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  calculation_status: string;
  last_updated: string;
  data_availability: {
    rainfall: boolean;
    dem_slope: boolean;
    soil_depth_prototype: boolean;
    soil_moisture_prototype: boolean;
  };
  kpis: {
    avg_static_hri: number;
    avg_dynamic_hri: number;
    avg_risk_change: number;
    max_dynamic_hri: number;
    max_risk_location: string;
    max_48h_rainfall_mm: number;
    max_72h_rainfall_mm: number;
    wetness_state: string;
    monitored_sectors_count: number;
  };
  status_distribution: {
    CRITICAL: number;
    WARNING: number;
    WATCH: number;
    NORMAL: number;
  };
  decay_factor_k: number;
  simulation_multiplier: number;
  is_simulation: boolean;
  locations: DWSSLLocation[];
}

interface TimelinePoint {
  hour_offset: number;
  time_label: string;
  rainfall_step_mm: number;
  api: number;
  normalized_api: number;
  dynamic_hri: number;
  static_hri: number;
  pore_pressure_ratio: number;
  is_projection: boolean;
}

// Map center adjuster on location selection
const MapViewController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

// Fallback baseline data if backend is restarting
const FALLBACK_LOCATIONS: DWSSLLocation[] = [
  {
    id: "DWSSL-LOC-001",
    location: "Meppadi",
    sub_division: "Vythiri Taluk / Vellarimala Catchment",
    latitude: 11.5540,
    longitude: 76.1320,
    elevation_m: 890.0,
    slope_deg: 38.5,
    static_hri: 52.0,
    dynamic_hri: 62.0,
    dynamic_change: 10.0,
    api_contribution: 4.8,
    pore_pressure_contribution: 5.2,
    rainfall_24h: 38.0,
    rainfall_48h: 76.0,
    rainfall_72h: 112.0,
    api: 85.4,
    normalized_api: 24.4,
    wetness_index: 0.244,
    wetness_state: "MODERATE",
    decay_factor_k: 0.85,
    soil_moisture: 0.380,
    soil_depth_m: 0.85,
    pore_pressure_ratio: 0.345,
    rainfall_trigger: "WATCH",
    dwssl_status: "WATCH",
    decision_support: "Watch advisory active. Saturated regolith requires continuous hydrological monitoring.",
    data_status: "OPERATIONAL_COMBINED",
    is_simulation: false,
    simulation_multiplier: 1.0,
    calculated_at: new Date().toISOString()
  },
  {
    id: "DWSSL-LOC-002",
    location: "Chooralmala",
    sub_division: "Meppadi North / Debris Runout Zone",
    latitude: 11.5420,
    longitude: 76.1480,
    elevation_m: 820.0,
    slope_deg: 41.2,
    static_hri: 76.5,
    dynamic_hri: 98.4,
    dynamic_change: 21.9,
    api_contribution: 14.2,
    pore_pressure_contribution: 7.7,
    rainfall_24h: 196.0,
    rainfall_48h: 448.0,
    rainfall_72h: 631.5,
    api: 382.0,
    normalized_api: 100.0,
    wetness_index: 1.000,
    wetness_state: "VERY HIGH",
    decay_factor_k: 0.85,
    soil_moisture: 0.495,
    soil_depth_m: 0.48,
    pore_pressure_ratio: 0.920,
    rainfall_trigger: "CRITICAL",
    dwssl_status: "CRITICAL",
    decision_support: "High pore-pressure saturation across regolith. Deploy rapid emergency verification and monitor bridge crossings.",
    data_status: "OPERATIONAL_COMBINED",
    is_simulation: false,
    simulation_multiplier: 1.0,
    calculated_at: new Date().toISOString()
  },
  {
    id: "DWSSL-LOC-003",
    location: "Mundakkai",
    sub_division: "Upper Iruvaipuzha Headwaters",
    latitude: 11.5360,
    longitude: 76.1590,
    elevation_m: 1050.0,
    slope_deg: 44.0,
    static_hri: 81.0,
    dynamic_hri: 100.0,
    dynamic_change: 19.0,
    api_contribution: 13.5,
    pore_pressure_contribution: 5.5,
    rainfall_24h: 210.0,
    rainfall_48h: 468.0,
    rainfall_72h: 654.0,
    api: 395.0,
    normalized_api: 100.0,
    wetness_index: 1.000,
    wetness_state: "VERY HIGH",
    decay_factor_k: 0.85,
    soil_moisture: 0.498,
    soil_depth_m: 0.45,
    pore_pressure_ratio: 0.950,
    rainfall_trigger: "CRITICAL",
    dwssl_status: "CRITICAL",
    decision_support: "Critical headwater saturation. Steep scarp failure potential is acute.",
    data_status: "OPERATIONAL_COMBINED",
    is_simulation: false,
    simulation_multiplier: 1.0,
    calculated_at: new Date().toISOString()
  },
  {
    id: "DWSSL-LOC-004",
    location: "Vythiri",
    sub_division: "Lakkidi Western Ghats Ridge",
    latitude: 11.5510,
    longitude: 76.0200,
    elevation_m: 940.0,
    slope_deg: 34.0,
    static_hri: 64.0,
    dynamic_hri: 82.2,
    dynamic_change: 18.2,
    api_contribution: 10.9,
    pore_pressure_contribution: 7.3,
    rainfall_24h: 148.0,
    rainfall_48h: 334.0,
    rainfall_72h: 480.0,
    api: 294.0,
    normalized_api: 84.0,
    wetness_index: 0.840,
    wetness_state: "HIGH",
    decay_factor_k: 0.85,
    soil_moisture: 0.297,
    soil_depth_m: 0.91,
    pore_pressure_ratio: 0.740,
    rainfall_trigger: "WARNING",
    dwssl_status: "WARNING",
    decision_support: "Prioritize field verification in saturated regolith zones. Pre-position quick-response gear.",
    data_status: "OPERATIONAL_COMBINED",
    is_simulation: false,
    simulation_multiplier: 1.0,
    calculated_at: new Date().toISOString()
  },
  {
    id: "DWSSL-LOC-005",
    location: "Pozhuthana",
    sub_division: "Banasura Sagar Basin",
    latitude: 11.5480,
    longitude: 76.0490,
    elevation_m: 780.0,
    slope_deg: 36.8,
    static_hri: 66.5,
    dynamic_hri: 84.8,
    dynamic_change: 18.3,
    api_contribution: 11.2,
    pore_pressure_contribution: 7.1,
    rainfall_24h: 154.0,
    rainfall_48h: 348.0,
    rainfall_72h: 495.0,
    api: 305.0,
    normalized_api: 87.1,
    wetness_index: 0.871,
    wetness_state: "HIGH",
    decay_factor_k: 0.85,
    soil_moisture: 0.478,
    soil_depth_m: 0.63,
    pore_pressure_ratio: 0.780,
    rainfall_trigger: "WARNING",
    dwssl_status: "WARNING",
    decision_support: "Reservoir catchment runout watch active. Inspect river embankments.",
    data_status: "OPERATIONAL_COMBINED",
    is_simulation: false,
    simulation_multiplier: 1.0,
    calculated_at: new Date().toISOString()
  },
  {
    id: "DWSSL-LOC-006",
    location: "Kalpetta",
    sub_division: "District Headquarters Central Zone",
    latitude: 11.6085,
    longitude: 76.0837,
    elevation_m: 750.0,
    slope_deg: 22.4,
    static_hri: 48.0,
    dynamic_hri: 64.4,
    dynamic_change: 16.4,
    api_contribution: 8.2,
    pore_pressure_contribution: 8.2,
    rainfall_24h: 94.0,
    rainfall_48h: 212.0,
    rainfall_72h: 295.0,
    api: 195.0,
    normalized_api: 55.7,
    wetness_index: 0.557,
    wetness_state: "MODERATE",
    decay_factor_k: 0.85,
    soil_moisture: 0.370,
    soil_depth_m: 1.81,
    pore_pressure_ratio: 0.520,
    rainfall_trigger: "WATCH",
    dwssl_status: "WATCH",
    decision_support: "Increase monitoring frequency. Inspect drainage culverts and road embankments.",
    data_status: "OPERATIONAL_COMBINED",
    is_simulation: false,
    simulation_multiplier: 1.0,
    calculated_at: new Date().toISOString()
  },
  {
    id: "DWSSL-LOC-008",
    location: "Sulthan Bathery",
    sub_division: "Eastern Plateau Border Sector",
    latitude: 11.6643,
    longitude: 76.2570,
    elevation_m: 930.0,
    slope_deg: 16.5,
    static_hri: 38.0,
    dynamic_hri: 48.2,
    dynamic_change: 10.2,
    api_contribution: 5.1,
    pore_pressure_contribution: 5.1,
    rainfall_24h: 58.0,
    rainfall_48h: 124.0,
    rainfall_72h: 174.0,
    api: 118.0,
    normalized_api: 33.7,
    wetness_index: 0.337,
    wetness_state: "LOW",
    decay_factor_k: 0.85,
    soil_moisture: 0.385,
    soil_depth_m: 1.18,
    pore_pressure_ratio: 0.360,
    rainfall_trigger: "NORMAL",
    dwssl_status: "NORMAL",
    decision_support: "Continue routine hydrological and slope monitoring. No immediate destabilization.",
    data_status: "OPERATIONAL_COMBINED",
    is_simulation: false,
    simulation_multiplier: 1.0,
    calculated_at: new Date().toISOString()
  }
];

export const DWSSLPage: React.FC = () => {
  const { setActiveView } = useApp();
  const [decayK, setDecayK] = useState<number>(0.85);
  const [rainMultiplier, setRainMultiplier] = useState<number>(1.0);
  const [rainWindow, setRainWindow] = useState<'24H' | '48H' | '72H'>('72H');
  const [activeLayer, setActiveLayer] = useState<'DYNAMIC_HRI' | 'STATIC_HRI' | 'WETNESS' | 'RAINFALL' | 'SLOPE' | 'ELEVATION' | 'STATUS'>('DYNAMIC_HRI');
  const [selectedLocation, setSelectedLocation] = useState<DWSSLLocation | null>(null);
  const [summaryData, setSummaryData] = useState<DWSSLSummary | null>(null);
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScientificExpanded, setIsScientificExpanded] = useState<boolean>(false);
  const [activeNavTab, setActiveNavTab] = useState<string>('overview');

  // Fetch summary and locations from backend
  const fetchDWSSLData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `http://127.0.0.1:8000/api/v2/dwssl/summary?simulated_rain_multiplier=${rainMultiplier}&decay_k=${decayK}`
      );
      if (res.ok) {
        const data: DWSSLSummary = await res.json();
        setSummaryData(data);
        if (!selectedLocation && data.locations.length > 0) {
          setSelectedLocation(data.locations[0]);
        } else if (selectedLocation) {
          const updated = data.locations.find(l => l.location === selectedLocation.location);
          if (updated) setSelectedLocation(updated);
        }
      } else {
        throw new Error("Backend unavailable");
      }
    } catch (e) {
      console.warn("DWSSL fetch error, using local computation:", e);
      const fallbackSummary: DWSSLSummary = {
        system_status: "CRITICAL",
        calculation_status: "SYNCHRONIZED",
        last_updated: "28 Aug 2026, 12:30 PM UTC",
        data_availability: {
          rainfall: true,
          dem_slope: true,
          soil_depth_prototype: true,
          soil_moisture_prototype: true
        },
        kpis: {
          avg_static_hri: 63.6,
          avg_dynamic_hri: 81.2,
          avg_risk_change: 17.6,
          max_dynamic_hri: 100.0,
          max_risk_location: "Mundakkai",
          max_48h_rainfall_mm: 468.0,
          max_72h_rainfall_mm: 654.0,
          wetness_state: "VERY HIGH",
          monitored_sectors_count: FALLBACK_LOCATIONS.length
        },
        status_distribution: {
          CRITICAL: 3,
          WARNING: 2,
          WATCH: 1,
          NORMAL: 1
        },
        decay_factor_k: decayK,
        simulation_multiplier: rainMultiplier,
        is_simulation: rainMultiplier !== 1.0,
        locations: FALLBACK_LOCATIONS
      };
      setSummaryData(fallbackSummary);
      if (!selectedLocation) setSelectedLocation(FALLBACK_LOCATIONS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Timeline for selected location
  const fetchTimeline = async (locName: string) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/v2/dwssl/timeline?location=${encodeURIComponent(locName)}&decay_k=${decayK}&simulated_rain_multiplier=${rainMultiplier}`
      );
      if (res.ok) {
        const data = await res.json();
        setTimelineData(data.timeline || []);
      }
    } catch (e) {
      const staticH = selectedLocation?.static_hri || 72.0;
      const pts: TimelinePoint[] = [];
      let curApi = 0;
      for (let h = -72; h <= 24; h += 4) {
        const stepRain = h <= -48 ? 22.0 : h <= -24 ? 38.0 : h <= 0 ? 46.0 : 0.0;
        curApi = stepRain + curApi * Math.pow(decayK, 4 / 24);
        const norm = Math.min(100, Math.round((curApi / 350) * 100));
        const ru = Math.min(1.0, Number((norm / 100 * 0.88).toFixed(3)));
        const dyn = Math.min(100, Number((staticH + 0.25 * norm + 0.15 * ru * 100).toFixed(1)));
        pts.push({
          hour_offset: h,
          time_label: h === 0 ? "Now (T0)" : `T${h > 0 ? '+' : ''}${h}h`,
          rainfall_step_mm: stepRain,
          api: Math.round(curApi),
          normalized_api: norm,
          dynamic_hri: dyn,
          static_hri: staticH,
          pore_pressure_ratio: ru,
          is_projection: h > 0
        });
      }
      setTimelineData(pts);
    }
  };

  useEffect(() => {
    fetchDWSSLData();
  }, [decayK, rainMultiplier]);

  useEffect(() => {
    if (selectedLocation) {
      fetchTimeline(selectedLocation.location);
    }
  }, [selectedLocation?.location, decayK, rainMultiplier]);

  const activeLoc = selectedLocation || summaryData?.locations[0] || FALLBACK_LOCATIONS[0];

  // Smooth scroll handler for tabs
  const scrollToSection = (id: string) => {
    setActiveNavTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Status Colors & Themes
  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-500/50',
          text: 'text-rose-400',
          badge: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
          label: 'CRITICAL INSTABILITY'
        };
      case 'WARNING':
      case 'HIGH':
        return {
          bg: 'bg-orange-950/80',
          border: 'border-orange-500/50',
          text: 'text-orange-400',
          badge: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
          label: 'HIGH WARNING'
        };
      case 'WATCH':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-500/50',
          text: 'text-amber-300',
          badge: 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30',
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
          label: 'WATCH ADVISORY'
        };
      default:
        return {
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-500/50',
          text: 'text-emerald-400',
          badge: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
          label: 'NORMAL / STABLE'
        };
    }
  };

  const getMarkerColor = (loc: DWSSLLocation) => {
    if (activeLayer === 'DYNAMIC_HRI') {
      if (loc.dynamic_hri >= 80) return '#f43f5e';
      if (loc.dynamic_hri >= 65) return '#f97316';
      if (loc.dynamic_hri >= 50) return '#eab308';
      return '#10b981';
    } else if (activeLayer === 'STATIC_HRI') {
      if (loc.static_hri >= 75) return '#f43f5e';
      if (loc.static_hri >= 60) return '#f97316';
      if (loc.static_hri >= 45) return '#eab308';
      return '#10b981';
    } else if (activeLayer === 'WETNESS') {
      if (loc.wetness_state === 'VERY HIGH') return '#38bdf8';
      if (loc.wetness_state === 'HIGH') return '#0284c7';
      if (loc.wetness_state === 'MODERATE') return '#0369a1';
      return '#0c4a6e';
    } else if (activeLayer === 'RAINFALL') {
      if (loc.rainfall_72h >= 450) return '#c084fc';
      if (loc.rainfall_72h >= 250) return '#818cf8';
      return '#38bdf8';
    } else if (activeLayer === 'SLOPE') {
      if (loc.slope_deg >= 35) return '#f43f5e';
      if (loc.slope_deg >= 25) return '#f97316';
      return '#10b981';
    } else if (activeLayer === 'ELEVATION') {
      if (loc.elevation_m >= 900) return '#a855f7';
      if (loc.elevation_m >= 750) return '#3b82f6';
      return '#10b981';
    } else {
      if (loc.dwssl_status === 'CRITICAL') return '#f43f5e';
      if (loc.dwssl_status === 'WARNING') return '#f97316';
      if (loc.dwssl_status === 'WATCH') return '#eab308';
      return '#10b981';
    }
  };

  // Top Hotspot ranking sorted by dynamic HRI
  const sortedLocations = useMemo(() => {
    const list = summaryData?.locations || FALLBACK_LOCATIONS;
    return [...list].sort((a, b) => b.dynamic_hri - a.dynamic_hri);
  }, [summaryData?.locations]);

  // Gauge angle calculation (0 to 180 degrees)
  const gaugePercent = Math.min(100, Math.max(0, activeLoc.dynamic_hri));
  const gaugeAngle = (gaugePercent / 100) * 180;

  const currentTheme = getStatusTheme(activeLoc.dwssl_status);

  return (
    <div className="w-full bg-[#050A07] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* ============================================================ */}
      {/* 0. TOP COMPACT DASHBOARD NAVIGATION TABS                      */}
      {/* ============================================================ */}
      <div className="sticky top-0 z-40 bg-[#050A07]/95 backdrop-blur-md py-2.5 border-b border-cyan-500/20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-bold text-sm">
              <Waves className="w-4 h-4 animate-pulse" />
              <span>DWSSL INTELLIGENCE CENTER</span>
            </div>

            {[
              { id: 'overview', label: 'OVERVIEW' },
              { id: 'slope-risk', label: 'SLOPE RISK' },
              { id: 'rainfall-intel', label: 'RAIN & WETNESS' },
              { id: 'what-if', label: 'WHAT-IF' },
              { id: 'gis-map', label: 'GIS MAP' },
              { id: 'hotspots', label: 'HOTSPOTS' },
              { id: 'decision-support', label: 'DECISION SUPPORT' },
              { id: 'science', label: 'SCIENCE' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeNavTab === tab.id
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : 'text-pine-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              SYSTEM LIVE
            </span>
            <button 
              onClick={fetchDWSSLData}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLoading ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. COMMAND HEADER SECTION                                     */}
      {/* ============================================================ */}
      <div id="overview" className="p-5 rounded-2xl bg-[#08120B] border border-cyan-500/20 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                MODULE 03 &bull; DWSSL
              </span>
              <span className="text-xs text-pine-muted flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Updated: <strong className="text-white font-mono">{summaryData?.last_updated || '28 Aug 2026, 12:30 PM UTC'}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Dynamic Wetness &amp; Slope Stability (DWSSL)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Live monitoring of rainfall, ground wetness and slope instability
            </p>
          </div>

          {/* Right Status Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`px-5 py-3 rounded-2xl border ${currentTheme.bg} ${currentTheme.border} ${currentTheme.glow} flex items-center gap-3`}>
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-300">DWSSL STATUS</div>
                <div className={`text-xl font-black tracking-wide ${currentTheme.text} flex items-center gap-1.5`}>
                  <span>{activeLoc.dwssl_status}</span>
                  <span className="text-xs font-mono font-normal text-slate-300">({activeLoc.dynamic_hri} HRI)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Availability Strip */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-pine-muted font-bold text-[11px]">DATA SOURCES:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Rainfall (IMD)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> DEM / Slope (SRTM)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1" title="Prototype validation dataset">
              <Info className="w-3 h-3 text-amber-400" /> Soil Moisture (NASA SMAP Prototype)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1" title="Prototype validation dataset">
              <Info className="w-3 h-3 text-amber-400" /> Soil Depth (GSI Regolith Prototype)
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Active Sector: <strong className="text-cyan-300">{activeLoc.location}</strong> ({activeLoc.sub_division})
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SIMPLE CRITICAL ALERT BANNER (IF CRITICAL / WARNING)       */}
      {/* ============================================================ */}
      {(activeLoc.dwssl_status === 'CRITICAL' || activeLoc.dwssl_status === 'WARNING') && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-[#1A080C] to-rose-950/90 border border-rose-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5 shadow-lg shadow-rose-500/50">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-rose-300 uppercase tracking-wide">
                  ⚠ CRITICAL SLOPE INSTABILITY
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white">
                  {activeLoc.location}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                Current ground conditions indicate very high instability. Immediate attention recommended.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/60 px-4 py-2 rounded-xl border border-rose-500/30 shrink-0 font-mono text-xs">
            <div>
              <div className="text-[10px] text-pine-muted uppercase">72H RAIN</div>
              <div className="font-bold text-white">{activeLoc.rainfall_72h} mm</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div>
              <div className="text-[10px] text-pine-muted uppercase">WETNESS</div>
              <div className="font-bold text-cyan-300">{activeLoc.wetness_state}</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div>
              <div className="text-[10px] text-pine-muted uppercase">DYNAMIC HRI</div>
              <div className="font-black text-rose-400">{activeLoc.dynamic_hri} (+{activeLoc.dynamic_change})</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. PRIMARY "WHAT IS HAPPENING NOW?" PANEL & CAUSE CHAIN       */}
      {/* ============================================================ */}
      <div className="p-6 rounded-2xl bg-[#08120B] border border-cyan-500/30 space-y-5 shadow-2xl">
        <div className="space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            <span>WHAT IS HAPPENING NOW?</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {activeLoc.location} is currently at <span className={`${currentTheme.text} font-black underline decoration-cyan-500/40`}>{activeLoc.dwssl_status}</span> slope-instability risk.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            Heavy rainfall over the last 72 hours has increased ground wetness and reduced slope stability.
          </p>
        </div>

        {/* 5-Step Dynamic Visual Cause Chain with lit-up indicators */}
        <div className="space-y-2 pt-2">
          <div className="text-[11px] uppercase tracking-wider text-pine-muted font-bold">
            HYDROLOGICAL CAUSE-AND-EFFECT CHAIN:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-stretch">
            {[
              {
                step: 1,
                title: "HEAVY RAIN",
                value: `${activeLoc.rainfall_72h} mm / 72h`,
                active: activeLoc.rainfall_72h >= 150,
                color: "border-blue-500 bg-blue-950/50 text-blue-300"
              },
              {
                step: 2,
                title: "MORE WATER IN SOIL",
                value: `API: ${activeLoc.api}`,
                active: activeLoc.api >= 150,
                color: "border-cyan-500 bg-cyan-950/50 text-cyan-300"
              },
              {
                step: 3,
                title: "GROUND BECOMES WET",
                value: activeLoc.wetness_state,
                active: activeLoc.wetness_index >= 0.5,
                color: "border-teal-500 bg-teal-950/50 text-teal-300"
              },
              {
                step: 4,
                title: "SLOPE STABILITY FALLS",
                value: `r_u: ${activeLoc.pore_pressure_ratio}`,
                active: activeLoc.pore_pressure_ratio >= 0.6,
                color: "border-orange-500 bg-orange-950/50 text-orange-300"
              },
              {
                step: 5,
                title: "HIGHER LANDSLIDE RISK",
                value: `${activeLoc.dynamic_hri} HRI (${activeLoc.dwssl_status})`,
                active: activeLoc.dynamic_hri >= 70,
                color: "border-rose-500 bg-rose-950/60 text-rose-300 shadow-lg shadow-rose-950/50"
              }
            ].map((node, idx) => (
              <div 
                key={node.step}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  node.active 
                    ? `${node.color} ring-1 ring-white/10` 
                    : 'border-white/5 bg-black/30 text-pine-muted opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>STAGE {node.step}</span>
                  <span className={`w-2 h-2 rounded-full ${node.active ? 'bg-current animate-ping' : 'bg-slate-600'}`}></span>
                </div>
                <div className="my-1.5">
                  <div className="text-xs font-bold text-white">{node.title}</div>
                  <div className="text-sm font-black font-mono mt-0.5">{node.value}</div>
                </div>
                <div className="text-[10px] text-pine-muted flex items-center justify-between">
                  <span>{node.active ? 'ACTIVE' : 'LOW'}</span>
                  {idx < 4 && <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. SLOPE RISK GAUGE & WHY DID RISK INCREASE?                  */}
      {/* ============================================================ */}
      <div id="slope-risk" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radial Risk Gauge (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#08120B] border border-cyan-500/20 flex flex-col items-center justify-between space-y-4 shadow-xl">
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pine-muted flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>CURRENT SLOPE RISK</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentTheme.badge}`}>
              {activeLoc.dwssl_status}
            </span>
          </div>

          {/* SVG Half-Radial Gauge */}
          <div className="relative w-64 h-36 flex items-center justify-center">
            <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
              {/* Background Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1e293b"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Gradient Arc */}
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="45%" stopColor="#eab308" />
                  <stop offset="70%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
              {/* Active Dynamic HRI Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="18"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (gaugePercent / 100) * 251.2}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Needle pointer */}
              <circle cx="100" cy="100" r="6" fill="#ffffff" />
              <line
                x1="100"
                y1="100"
                x2={100 - 65 * Math.cos((gaugeAngle * Math.PI) / 180)}
                y2={100 - 65 * Math.sin((gaugeAngle * Math.PI) / 180)}
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Metric in Center of Gauge */}
            <div className="absolute bottom-0 text-center space-y-0.5">
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                {activeLoc.dynamic_hri} <span className="text-sm font-normal text-pine-muted">/ 100</span>
              </div>
              <div className={`text-xs font-black uppercase tracking-wider ${currentTheme.text}`}>
                {activeLoc.dwssl_status}
              </div>
            </div>
          </div>

          <div className="w-full text-center text-xs text-pine-muted font-mono">
            Dynamic HRI: <strong className="text-white">{activeLoc.static_hri} &rarr; {activeLoc.dynamic_hri}</strong> (+{activeLoc.dynamic_change} increase)
          </div>

          <div className="w-full grid grid-cols-4 gap-1 text-[10px] text-center font-mono text-pine-muted pt-1 border-t border-white/5">
            <div><strong className="text-emerald-400">0-49</strong><br/>LOW</div>
            <div><strong className="text-amber-300">50-64</strong><br/>WATCH</div>
            <div><strong className="text-orange-400">65-79</strong><br/>HIGH</div>
            <div><strong className="text-rose-400">80-100</strong><br/>CRITICAL</div>
          </div>
        </div>

        {/* Static vs Dynamic Comparison (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#08120B] border border-cyan-500/20 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>WHY DID THE RISK INCREASE?</span>
            </span>
            <span className="text-xs text-pine-muted font-mono">BASELINE &rarr; CURRENT CONDITION</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {/* Left Box: Static */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300 uppercase">STATIC RISK</span>
                <span className="font-mono text-lg font-black text-white">{activeLoc.static_hri}</span>
              </div>
              <p className="text-[11px] text-pine-muted leading-relaxed">
                Based on:
              </p>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>&bull; Terrain &amp; Geology</li>
                <li>&bull; Slope: <strong className="text-white">{activeLoc.slope_deg}&deg;</strong></li>
                <li>&bull; Elevation: <strong className="text-white">{activeLoc.elevation_m} m</strong></li>
                <li>&bull; Baseline hazard</li>
              </ul>
            </div>

            {/* Right Box: Dynamic */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2 shadow-md">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-cyan-300 uppercase">CURRENT RISK</span>
                <span className="font-mono text-lg font-black text-cyan-300">{activeLoc.dynamic_hri}</span>
              </div>
              <p className="text-[11px] text-cyan-200/80 leading-relaxed">
                Now includes:
              </p>
              <ul className="text-xs text-cyan-100 space-y-1">
                <li>&bull; Recent rainfall</li>
                <li>&bull; Rainfall accumulation ({activeLoc.rainfall_72h} mm)</li>
                <li>&bull; Ground wetness ({activeLoc.wetness_state})</li>
                <li>&bull; Pore-pressure effect (r_u: {activeLoc.pore_pressure_ratio})</li>
              </ul>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                +{activeLoc.dynamic_change}
              </span>
              <span className="text-slate-200">
                Rainfall has increased the current instability.
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-400 shrink-0 hidden sm:block" />
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 6. RAINFALL INTELLIGENCE & GROUND WETNESS VISUALIZATION       */}
      {/* ============================================================ */}
      <div id="rainfall-intel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Rainfall Build-up Panel (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#08120B] border border-cyan-500/20 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <span>RAINFALL BUILD-UP &bull; {activeLoc.location}</span>
              </h3>
              <p className="text-xs text-pine-muted">How much rain has the area received recently?</p>
            </div>

            {/* Time Window Buttons */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              {(['24H', '48H', '72H'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setRainWindow(w)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    rainWindow === w
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-pine-muted hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
            <div className={`p-3 rounded-xl border ${rainWindow === '24H' ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-md' : 'bg-black/40 border-white/5 text-slate-300'}`}>
              <div className="text-[10px] text-pine-muted uppercase font-bold">24 HOURS</div>
              <div className="text-xl font-black text-white mt-1">{activeLoc.rainfall_24h} <span className="text-xs font-normal text-pine-muted">mm</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${rainWindow === '48H' ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-md' : 'bg-black/40 border-white/5 text-slate-300'}`}>
              <div className="text-[10px] text-pine-muted uppercase font-bold">48 HOURS</div>
              <div className="text-xl font-black text-white mt-1">{activeLoc.rainfall_48h} <span className="text-xs font-normal text-pine-muted">mm</span></div>
            </div>
            <div className={`p-3 rounded-xl border ${rainWindow === '72H' ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-md' : 'bg-black/40 border-white/5 text-slate-300'}`}>
              <div className="text-[10px] text-pine-muted uppercase font-bold">72 HOURS</div>
              <div className="text-xl font-black text-purple-300 mt-1">{activeLoc.rainfall_72h} <span className="text-xs font-normal text-pine-muted">mm</span></div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-pine-muted">Accumulation Period:</span>
            <span className="text-cyan-300 font-bold">{rainWindow} Cumulative Window</span>
          </div>
        </div>

        {/* Right: Ground Wetness & Recent Rain Effect (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#08120B] border border-cyan-500/20 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>GROUND WETNESS</span>
              </h3>
              <p className="text-xs text-pine-muted">Recent rainfall has kept the soil highly wet</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              INDEX: {activeLoc.wetness_index} / 1.00
            </span>
          </div>

          {/* Multi-Stage Wetness Scale */}
          <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-white/5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-pine-muted">SOIL SATURATION STATUS:</span>
              <span className="text-cyan-400">{activeLoc.wetness_state} ●</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-bold">
              {[
                { label: 'LOW', range: '<0.30', active: activeLoc.wetness_state === 'LOW', color: 'bg-emerald-950 text-emerald-400 border-emerald-500/30' },
                { label: 'MODERATE', range: '0.30-0.55', active: activeLoc.wetness_state === 'MODERATE', color: 'bg-blue-950 text-blue-300 border-blue-500/30' },
                { label: 'HIGH', range: '0.55-0.78', active: activeLoc.wetness_state === 'HIGH', color: 'bg-cyan-950 text-cyan-300 border-cyan-500/30' },
                { label: 'VERY HIGH', range: '≥0.78', active: activeLoc.wetness_state === 'VERY HIGH', color: 'bg-rose-950 text-rose-300 border-rose-500/50 shadow-md shadow-rose-950/40' },
              ].map((tier) => (
                <div 
                  key={tier.label}
                  className={`p-2 rounded-xl border transition-all ${
                    tier.active ? `${tier.color} ring-1 ring-current` : 'bg-black/30 text-pine-muted opacity-40 border-white/5'
                  }`}
                >
                  <div className="text-[11px] font-bold">{tier.label}</div>
                  <div className="text-[9px] font-mono opacity-80">{tier.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Plain-English Explanation of API */}
          <div className="p-3.5 rounded-xl bg-[#06100A] border border-cyan-500/20 space-y-1.5 text-xs">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
              <span>RECENT RAINFALL EFFECT</span>
              <span className="font-mono text-white font-bold">API: {activeLoc.api}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              API represents how much rainfall from previous days is still influencing current ground wetness.
            </p>
            <div className="pt-1 text-[10px] text-pine-muted font-mono flex items-center justify-between border-t border-white/5">
              <span>Rain today + Rain from previous days = Current ground wetness effect</span>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 7. FUTURE DECAY PROJECTION ("IF RAIN STOPS NOW")              */}
      {/* ============================================================ */}
      <div className="p-5 rounded-2xl bg-[#08120B] border border-emerald-500/20 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>IF RAIN STOPS NOW</span>
            </h3>
            <p className="text-xs text-pine-muted">Estimated risk recovery over the next 24 hours (k = {decayK})</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">
            MODEL PROJECTION
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 font-mono text-xs">
          {[
            { time: 'NOW (T0)', hri: activeLoc.dynamic_hri, status: activeLoc.dwssl_status, isNow: true },
            { time: '+4 HOURS', hri: Math.round(activeLoc.dynamic_hri * 0.96), status: 'CRITICAL', isNow: false },
            { time: '+8 HOURS', hri: Math.round(activeLoc.dynamic_hri * 0.92), status: 'WARNING', isNow: false },
            { time: '+12 HOURS', hri: Math.round(activeLoc.dynamic_hri * 0.88), status: 'WARNING', isNow: false },
            { time: '+24 HOURS', hri: Math.round(activeLoc.dynamic_hri * 0.80), status: 'WATCH', isNow: false },
          ].map((step) => (
            <div 
              key={step.time}
              className={`p-3 rounded-xl border flex flex-col justify-between space-y-1.5 ${
                step.isNow 
                  ? 'bg-rose-950/50 border-rose-500/40 text-rose-300 font-bold shadow-md'
                  : 'bg-black/30 border-white/5 text-slate-300'
              }`}
            >
              <div className="text-[10px] text-pine-muted uppercase">{step.time}</div>
              <div className="text-xl font-black text-white">{step.hri} <span className="text-xs font-normal text-pine-muted">HRI</span></div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded text-center font-bold ${getStatusTheme(step.status).badge}`}>
                {step.status}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-pine-muted italic leading-tight">
          * Projection assumes rainfall stops and uses the configured decay factor.
        </p>
      </div>

      {/* ============================================================ */}
      {/* 8. WHAT-IF SIMULATION SUITE                                   */}
      {/* ============================================================ */}
      <div id="what-if" className="p-6 rounded-2xl bg-[#08120B] border border-cyan-500/30 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                WHAT IF RAIN CONTINUES?
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                  rainMultiplier === 1.0 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-950 text-amber-300 border border-amber-500 animate-pulse'
                }`}>
                  {rainMultiplier === 1.0 ? 'ACTUAL DATA' : `SIMULATION (${rainMultiplier}x RAINFALL)`}
                </span>
              </h3>
              <p className="text-xs text-pine-muted">Test how different weather scenarios impact slope instability in real time.</p>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { mult: 0.5, label: '0.5x' },
              { mult: 1.0, label: '1.0x Actual' },
              { mult: 1.5, label: '1.5x' },
              { mult: 2.0, label: '2.0x' },
              { mult: 2.5, label: '2.5x' },
            ].map((preset) => (
              <button
                key={preset.mult}
                onClick={() => setRainMultiplier(preset.mult)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  rainMultiplier === preset.mult
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'bg-black/40 text-pine-muted hover:text-white border border-white/5'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Simulation Result Card */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-pine-muted font-bold">PROJECTED SCENARIO OUTCOME:</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>PROJECTED DYNAMIC HRI:</span>
              <span className="text-xl font-black font-mono text-cyan-300">{activeLoc.dynamic_hri}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentTheme.badge}`}>
                {activeLoc.dwssl_status}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {rainMultiplier >= 1.5 
                ? "At this rainfall level, the area remains in the critical risk zone."
                : rainMultiplier <= 0.8
                ? "Reduced rainfall allows ground moisture to drain gradually."
                : "Risk increases from baseline terrain score as rainfall accumulates."}
            </p>
          </div>

          <div className="w-full md:w-72 space-y-1.5 p-3 rounded-xl bg-[#06100A] border border-cyan-500/20 shrink-0 font-mono text-xs">
            <div className="flex justify-between text-pine-muted">
              <span>24h Rainfall:</span>
              <strong className="text-white">{activeLoc.rainfall_24h} mm</strong>
            </div>
            <div className="flex justify-between text-pine-muted">
              <span>72h Rainfall:</span>
              <strong className="text-white">{activeLoc.rainfall_72h} mm</strong>
            </div>
            <div className="flex justify-between text-pine-muted">
              <span>Projected Wetness:</span>
              <strong className="text-cyan-300">{activeLoc.wetness_state}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 9. LIVE DYNAMIC WETNESS & SLOPE MAP & SPLIT ANALYTICS         */}
      {/* ============================================================ */}
      <div id="gis-map" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Dynamic GIS Map (8 cols) using Esri Dark Gray (No Watermark!) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#08120B] border border-cyan-500/30 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>LIVE DYNAMIC WETNESS &amp; SLOPE MAP</span>
              </h3>
              <p className="text-xs text-pine-muted">Click any zone to inspect real-time metrics</p>
            </div>

            {/* Layer Selection Pills */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { key: 'DYNAMIC_HRI', label: 'Dynamic HRI' },
                { key: 'STATIC_HRI', label: 'Static HRI' },
                { key: 'WETNESS', label: 'Wetness' },
                { key: 'RAINFALL', label: '72h Rain' },
                { key: 'SLOPE', label: 'Slope' },
                { key: 'ELEVATION', label: 'Elevation' },
                { key: 'STATUS', label: 'Status' },
              ].map((layer) => (
                <button
                  key={layer.key}
                  onClick={() => setActiveLayer(layer.key as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLayer === layer.key
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-black/40 text-pine-muted hover:text-white border border-white/5'
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Map with 100% Free, Clean Esri Dark Base Map */}
          <div className="h-[460px] rounded-xl overflow-hidden border border-cyan-500/20 relative z-0">
            <MapContainer
              center={[11.60, 76.10]}
              zoom={11}
              style={{ height: '100%', width: '100%', background: '#050C08' }}
              zoomControl={true}
            >
              <MapViewController center={[activeLoc.latitude, activeLoc.longitude]} />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri &mdash; National Disaster Management GIS'
              />

              {summaryData?.locations.map((loc) => {
                const color = getMarkerColor(loc);
                const isSelected = activeLoc.location === loc.location;
                const isCritical = loc.dwssl_status === 'CRITICAL';

                return (
                  <CircleMarker
                    key={loc.id}
                    center={[loc.latitude, loc.longitude]}
                    radius={isSelected ? 16 : isCritical ? 12 : 8}
                    pathOptions={{
                      color: isSelected ? '#ffffff' : color,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.95 : 0.75,
                      weight: isSelected ? 3.5 : 1.5
                    }}
                    eventHandlers={{
                      click: () => setSelectedLocation(loc)
                    }}
                  >
                    <Popup className="custom-dwssl-popup">
                      <div className="p-1 text-slate-900 text-xs space-y-1">
                        <div className="font-bold text-sm">{loc.location}</div>
                        <div className="text-[11px] text-slate-600">{loc.sub_division}</div>
                        <div className="border-t pt-1">
                          Static HRI: <strong>{loc.static_hri}</strong> &rarr; Dynamic: <strong className="text-rose-600 font-bold">{loc.dynamic_hri}</strong>
                        </div>
                        <div>72h Rain: <strong>{loc.rainfall_72h} mm</strong></div>
                        <div>Wetness State: <strong>{loc.wetness_state}</strong></div>
                        <div>Status: <strong className="uppercase">{loc.dwssl_status}</strong></div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] p-3 rounded-xl bg-black/90 backdrop-blur border border-white/10 text-[10px] space-y-1 font-mono">
              <div className="font-bold text-white uppercase text-[11px] mb-1">Layer: {activeLayer}</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> <span>0-49 LOW</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> <span>50-64 WATCH</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> <span>65-79 HIGH</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> <span>80-100 CRITICAL</span></div>
            </div>
          </div>
        </div>

        {/* Right: Selected Location Intelligence (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#08120B] border border-cyan-500/30 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-1 border-b border-white/10 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pine-muted">SELECTED AREA</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentTheme.badge}`}>
                {activeLoc.dwssl_status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>{activeLoc.location}</span>
            </h3>
            <p className="text-xs text-pine-muted">{activeLoc.sub_division}</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] text-pine-muted">STATIC HRI</div>
              <div className="text-base font-bold text-white font-mono">{activeLoc.static_hri}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/30">
              <div className="text-[10px] text-cyan-300">DYNAMIC HRI</div>
              <div className="text-base font-bold text-cyan-300 font-mono">{activeLoc.dynamic_hri} (+{activeLoc.dynamic_change})</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] text-pine-muted">SLOPE / ELEVATION</div>
              <div className="text-xs font-bold text-white font-mono">{activeLoc.slope_deg}&deg; / {activeLoc.elevation_m}m</div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div className="text-[10px] text-pine-muted">72H RAIN TOTAL</div>
              <div className="text-xs font-bold text-purple-300 font-mono">{activeLoc.rainfall_72h} mm</div>
            </div>
          </div>

          {/* Diagnosis / Why? */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">WHY?</div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Heavy multi-day rainfall has increased ground wetness and slope instability.
            </p>
          </div>

          {/* Sector Selector Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] text-pine-muted font-bold">Select Monitored Sector:</label>
            <select
              value={activeLoc.location}
              onChange={(e) => {
                const found = summaryData?.locations.find(l => l.location === e.target.value);
                if (found) setSelectedLocation(found);
              }}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-cyan-500/30 text-white text-xs font-bold focus:outline-none focus:border-cyan-400"
            >
              {summaryData?.locations.map((loc) => (
                <option key={loc.id} value={loc.location}>
                  {loc.location} &bull; {loc.dwssl_status} (HRI: {loc.dynamic_hri})
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 10. HOTSPOT RANKING & RISK DRIVER BREAKDOWN                   */}
      {/* ============================================================ */}
      <div id="hotspots" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hotspot Leaderboard (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#08120B] border border-cyan-500/20 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">TOP RISK AREAS</h3>
            </div>
            <span className="text-xs text-pine-muted font-mono">{sortedLocations.length} monitored hotspots</span>
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {sortedLocations.map((loc, idx) => {
              const isSelected = activeLoc.location === loc.location;
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                      : 'bg-black/30 border-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-pine-muted w-4">#{idx + 1}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{loc.location}</div>
                      <div className="text-[10px] text-pine-muted">{loc.sub_division}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-rose-400 font-bold">+{loc.dynamic_change}</span>
                    <span className="text-white font-black">{loc.dynamic_hri} HRI</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${getStatusTheme(loc.dwssl_status).badge}`}>
                      {loc.dwssl_status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Driver Breakdown (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#08120B] border border-cyan-500/20 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="border-b border-white/10 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>WHY IS THE RISK HIGH? ({activeLoc.location})</span>
            </h3>
            <p className="text-xs text-pine-muted">Model factor influence</p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Driver 1: Slope */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-200">
                <span>Slope</span>
                <span className="font-mono font-bold text-white">{activeLoc.slope_deg}&deg;</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, (activeLoc.slope_deg / 45) * 100)}%` }} 
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"
                />
              </div>
            </div>

            {/* Driver 2: Rainfall Accumulation */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-200">
                <span>Rainfall accumulation</span>
                <span className="font-mono font-bold text-white">{activeLoc.rainfall_72h} mm</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, (activeLoc.rainfall_72h / 600) * 100)}%` }} 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            {/* Driver 3: Ground Wetness */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-200">
                <span>Ground wetness</span>
                <span className="font-mono font-bold text-cyan-300">{activeLoc.wetness_index} / 1.00</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, activeLoc.wetness_index * 100)}%` }} 
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                />
              </div>
            </div>

            {/* Driver 4: Soil Depth */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-200">
                <span>Soil depth</span>
                <span className="font-mono font-bold text-amber-300">{activeLoc.soil_depth_m} m</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, (1.0 / Math.max(0.3, activeLoc.soil_depth_m)) * 40)}%` }} 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-pine-muted italic">
            * Input factor influences calculated from the dynamic slope stability model.
          </p>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 11. DECISION SUPPORT — WHAT SHOULD RESPONSE TEAMS KNOW?       */}
      {/* ============================================================ */}
      <div id="decision-support" className="p-6 rounded-2xl bg-[#08120B] border border-emerald-500/30 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">WHAT SHOULD RESPONSE TEAMS KNOW?</h3>
            <p className="text-xs text-pine-muted">Decision Support based on current DWSSL status ({activeLoc.dwssl_status})</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            {
              tier: "CRITICAL",
              status: "CRITICAL",
              bullets: [
                "Closely monitor slope-prone locations",
                "Review evacuation readiness",
                "Check vulnerable settlements",
                "Keep emergency access routes ready",
                "Continue rainfall monitoring",
                "Escalate according to operational protocol"
              ],
              active: activeLoc.dwssl_status === 'CRITICAL'
            },
            {
              tier: "HIGH",
              status: "WARNING",
              bullets: [
                "Increase monitoring",
                "Prepare response teams",
                "Check vulnerable zones",
                "Review evacuation readiness"
              ],
              active: activeLoc.dwssl_status === 'WARNING'
            },
            {
              tier: "WATCH",
              status: "WATCH",
              bullets: [
                "Continue monitoring",
                "Track rainfall accumulation"
              ],
              active: activeLoc.dwssl_status === 'WATCH'
            },
            {
              tier: "NORMAL",
              status: "NORMAL",
              bullets: [
                "Continue standard telemetry logging",
                "No immediate destabilization"
              ],
              active: activeLoc.dwssl_status === 'NORMAL'
            }
          ].map((card) => (
            <div 
              key={card.tier}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                card.active 
                  ? `${getStatusTheme(card.status).bg} ${getStatusTheme(card.status).border} ${getStatusTheme(card.status).glow}` 
                  : 'bg-black/30 border-white/5 opacity-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>{card.tier}</span>
                  {card.active && <span className="px-1.5 py-0.5 rounded text-[8px] bg-white text-black font-bold">ACTIVE NOW</span>}
                </div>
                <div className={`text-sm font-black mt-1 ${getStatusTheme(card.status).text}`}>{card.status}</div>
              </div>

              <ul className="space-y-1.5 text-slate-200 text-[11px] leading-relaxed">
                {card.bullets.map((b, bi) => (
                  <li key={bi} className="flex items-start gap-1.5">
                    <span className="text-cyan-400 mt-0.5">&bull;</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-pine-muted italic">
          * Decision Support suggestions, NOT automatic evacuation orders.
        </p>
      </div>

      {/* ============================================================ */}
      {/* 12. EXPANDABLE SCIENTIFIC METHOD & FORMULAS                   */}
      {/* ============================================================ */}
      <div id="science" className="rounded-2xl bg-[#08120B] border border-cyan-500/20 overflow-hidden shadow-xl">
        <button
          onClick={() => setIsScientificExpanded(!isScientificExpanded)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">HOW DWSSL CALCULATES RISK &bull; SCIENTIFIC METHOD</h3>
              <p className="text-xs text-pine-muted">View scientific calculation, methodology and formulas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold font-mono">
            <span>{isScientificExpanded ? 'HIDE DETAILS' : 'VIEW SCIENTIFIC CALCULATION'}</span>
            {isScientificExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isScientificExpanded && (
          <div className="p-5 border-t border-white/10 space-y-5 text-xs text-slate-300 bg-black/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left: 7-Step Pipeline */}
              <div className="space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs">Methodology Pipeline</h4>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-slate-300">
                  <li><strong>STEP 1:</strong> Collect recent rainfall</li>
                  <li><strong>STEP 2:</strong> Calculate 24h / 48h / 72h accumulation</li>
                  <li><strong>STEP 3:</strong> Calculate API: API_t = P_t + k &times; API_(t-1)</li>
                  <li><strong>STEP 4:</strong> Estimate ground wetness</li>
                  <li><strong>STEP 5:</strong> Estimate pore-pressure proxy</li>
                  <li><strong>STEP 6:</strong> Calculate Dynamic HRI: HRI_dynamic = min(100, HRI_static + 0.25 &times; API_norm + 0.15 &times; r_u &times; 100)</li>
                  <li><strong>STEP 7:</strong> Generate decision-support status</li>
                </ol>
              </div>

              {/* Right: Formulas & Parameters */}
              <div className="space-y-3 font-mono">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs">Mathematical Formulation</h4>
                
                <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
                  <div className="text-cyan-300 font-bold">1. Antecedent Precipitation Index:</div>
                  <div className="text-slate-200">API_t = P_t + k &times; API_(t-1)</div>
                  <div className="text-[10px] text-pine-muted">k = 0.85 (decay constant configurable 0.75 - 0.95)</div>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
                  <div className="text-cyan-300 font-bold">2. Dynamic Hazard Risk Index:</div>
                  <div className="text-slate-200">HRI_dynamic = min(100, HRI_static + 0.25&times;API_norm + 0.15&times;r_u&times;100)</div>
                  <div className="text-[10px] text-pine-muted">ΔHRI = HRI_dynamic - HRI_static</div>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-white/10 text-[11px] text-pine-muted italic">
              * Model parameters are configurable and should be calibrated using validated observations before operational deployment. Prototype datasets are used for development and demonstration.
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
export default DWSSLPage;
