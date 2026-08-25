import React, { useState } from 'react';
import { RiskBadge } from './RiskBadge';
import { DataConfidenceTag } from './DataConfidenceTag';
import { getHazardProfileForLocation, AREA_HAZARD_REGISTRY } from '../data/areaHazardProfiles';
import { 
  X, 
  Mountain, 
  Waves, 
  CloudRain, 
  Compass, 
  Clock, 
  ShieldAlert, 
  Users, 
  MapPin, 
  Sparkles,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Building,
  ArrowRight,
  UserCheck,
  BarChart2,
  Radio
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface Props {
  item: any | null;
  onClose: () => void;
  onInitiateRelocation?: (item: any) => void;
}

export const DetailedAnalysisModal: React.FC<Props> = ({ item, onClose, onInitiateRelocation }) => {
  const [showRadar, setShowRadar] = useState(false);

  if (!item) return null;

  // Retrieve exact distinct profile for this location/city/parcel
  const locationQuery = item.village || item.name || item.title || item.parcel_id || 'Meppadi';
  const profile = getHazardProfileForLocation(locationQuery);

  const isEpicenter = profile.category === 'Disaster Epicenter' || item.village === 'Meppadi' || item.isEpicenter;
  const isSite = profile.category === 'Safe Resettlement Site' || item.isSite || !!item.site_id;

  // Exact distinct values from item or matching area profile
  const landslideProb = item.landslide_probability !== undefined 
    ? Math.round(item.landslide_probability * 100) 
    : profile.landslideProb;

  const floodProb = item.flood_probability !== undefined 
    ? Math.round(item.flood_probability * 100) 
    : profile.floodProb;

  const slopeAngle = item.slope_deg !== undefined 
    ? Number(item.slope_deg) 
    : profile.slopeDeg;

  const rainfall24h = item.rainfall_24h_mm !== undefined 
    ? Number(item.rainfall_24h_mm) 
    : profile.rainfall24h;

  const soilMoisture = item.soil_moisture_index !== undefined 
    ? Math.round(item.soil_moisture_index * 100) 
    : profile.soilMoisture;

  const historyFreq = profile.historyFreq;

  const riskScore = item.risk_score !== undefined 
    ? Number(item.risk_score) 
    : profile.riskScore;

  const riskLevel = item.risk_level || profile.riskLevel;

  const censusPop = profile.censusPopulation || 24170;
  const exposedPop = item.exposedPopulation || profile.exposedPopulation;
  const familiesCount = item.capacity_families || profile.familiesCount;

  const villageName = profile.name;
  const title = item.title || item.name || profile.name;

  // Radar diagnostic data comparing this area against Wayanad safe threshold
  const radarData = [
    { subject: 'Landslide', current: landslideProb, threshold: 30, fullMark: 100 },
    { subject: 'Flood', current: floodProb, threshold: 35, fullMark: 100 },
    { subject: 'Slope Angle', current: Math.min(100, Math.round((slopeAngle / 40) * 100)), threshold: 25, fullMark: 100 },
    { subject: '24h Rain', current: Math.min(100, Math.round((rainfall24h / 285) * 100)), threshold: 45, fullMark: 100 },
    { subject: 'Soil Moisture', current: soilMoisture, threshold: 60, fullMark: 100 },
    { subject: 'Event History', current: historyFreq, threshold: 20, fullMark: 100 }
  ];

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-pine-panel border border-pine-border rounded-2xl p-6 shadow-modal text-xs font-mono space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-pine-border pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                isEpicenter 
                  ? 'bg-rose-950 text-rose-300 border-rose-800' 
                  : isSite 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                  : 'bg-pine-elevated text-pine-accent border-pine-border'
              }`}>
                {profile.category.toUpperCase()}
              </span>
              <RiskBadge level={riskLevel} score={riskScore} size="sm" />
              <DataConfidenceTag confidence={isSite ? 'HIGH' : isEpicenter ? 'HIGH' : 'LOW'} size="sm" />
            </div>

            <h2 className="text-xl lg:text-2xl font-serif font-bold text-pine-text">
              {title}
            </h2>
            <p className="text-xs text-pine-muted font-sans mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-pine-accent shrink-0" />
              <span>Location: <strong className="text-white">{villageName}</strong> • District: Wayanad, Kerala</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-pine-elevated hover:bg-pine-border text-pine-muted hover:text-pine-text transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Toggle (Cards vs Radar Spider Chart) */}
        <div className="flex items-center justify-between bg-pine-bg p-1.5 rounded-lg border border-pine-border">
          <span className="text-[11px] text-pine-accent uppercase font-bold flex items-center gap-1.5 px-2">
            <Activity className="w-4 h-4 text-pine-accent" />
            <span>Multi-Hazard Assessment & Demographics ({villageName}):</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowRadar(false)}
              className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-all ${
                !showRadar ? 'bg-pine-accent text-pine-bg shadow-sm' : 'text-pine-muted hover:text-white'
              }`}
            >
              Metrics Grid
            </button>
            <button
              onClick={() => setShowRadar(true)}
              className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-all flex items-center gap-1 ${
                showRadar ? 'bg-pine-accent text-pine-bg shadow-sm' : 'text-pine-muted hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Radar Fingerprint</span>
            </button>
          </div>
        </div>

        {/* 1. Distinct Multi-Hazard Geotechnical Spectrum OR Radar Chart */}
        {!showRadar ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            
            {/* Landslide */}
            <div className="p-3 bg-pine-bg rounded-xl border border-rose-900/50 space-y-1.5">
              <div className="flex items-center justify-between text-rose-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>Landslide Probability</span>
                </span>
                <strong className="text-sm font-mono">{landslideProb}%</strong>
              </div>
              <div className="w-full h-2 bg-pine-panel rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(4, landslideProb)}%` }} />
              </div>
              <span className="text-[10px] text-pine-muted font-sans block">
                {landslideProb > 70 ? 'Extreme GSI steep slope hazard' : landslideProb > 30 ? 'Moderate slope creep zone' : 'Low / Stable bedrock plateau'}
              </span>
            </div>

            {/* Flood */}
            <div className="p-3 bg-pine-bg rounded-xl border border-cyan-900/50 space-y-1.5">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Waves className="w-3.5 h-3.5" />
                  <span>Flood Inundation</span>
                </span>
                <strong className="text-sm font-mono">{floodProb}%</strong>
              </div>
              <div className="w-full h-2 bg-pine-panel rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${Math.max(4, floodProb)}%` }} />
              </div>
              <span className="text-[10px] text-pine-muted font-sans block">
                {floodProb > 60 ? 'KSDMA 10/25-yr return floodplain' : floodProb > 30 ? 'Seasonal drainage overflow' : 'Outside 100-yr flood buffer'}
              </span>
            </div>

            {/* Slope */}
            <div className="p-3 bg-pine-bg rounded-xl border border-amber-900/50 space-y-1.5">
              <div className="flex items-center justify-between text-amber-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Slope Gradient</span>
                </span>
                <strong className="text-sm font-mono">{slopeAngle.toFixed(1)}°</strong>
              </div>
              <div className="w-full h-2 bg-pine-panel rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(4, (slopeAngle / 40) * 100))}%` }} />
              </div>
              <span className="text-[10px] text-pine-muted font-sans block">
                {slopeAngle > 25 ? 'Over-steep scarp failure threshold' : slopeAngle > 10 ? 'Moderate hillside grade' : 'Gentle / Stable flatland'}
              </span>
            </div>

            {/* 24h Rainfall */}
            <div className="p-3 bg-pine-bg rounded-xl border border-blue-900/50 space-y-1.5">
              <div className="flex items-center justify-between text-blue-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>24h Precipitation</span>
                </span>
                <strong className="text-sm font-mono">{rainfall24h.toFixed(1)} mm</strong>
              </div>
              <div className="w-full h-2 bg-pine-panel rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(4, (rainfall24h / 285) * 100))}%` }} />
              </div>
              <span className="text-[10px] text-pine-muted font-sans block">
                {rainfall24h > 200 ? 'Extreme cloudburst exceedance' : rainfall24h > 150 ? 'Heavy monsoon intensity' : 'Moderate rainfall baseline'}
              </span>
            </div>

            {/* Total Census Population (For ALL Cities!) */}
            <div className="p-3 bg-pine-bg rounded-xl border border-indigo-900/50 space-y-1.5">
              <div className="flex items-center justify-between text-indigo-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Users className="w-3.5 h-3.5" />
                  <span>Total Census Population</span>
                </span>
                <strong className="text-sm font-mono text-white">{censusPop.toLocaleString()}</strong>
              </div>
              <div className="w-full h-2 bg-pine-panel rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (censusPop / 45500) * 100)}%` }} />
              </div>
              <span className="text-[10px] text-pine-muted font-sans block">
                Official 2011 Census Register
              </span>
            </div>

            {/* Exposed Population / Safe Holding Capacity */}
            <div className="p-3 bg-pine-bg rounded-xl border border-pine-border space-y-1.5">
              <div className="flex items-center justify-between text-pine-text">
                <span className="flex items-center gap-1 text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-pine-accent" />
                  <span>{isSite ? 'Safe Capacity' : 'Exposed In Red-Zone'}</span>
                </span>
                <strong className="text-sm font-mono text-white">
                  {exposedPop.toLocaleString()} {isSite ? 'people' : 'persons'}
                </strong>
              </div>
              <div className="w-full h-2 bg-pine-panel rounded-full overflow-hidden">
                <div className="h-full bg-pine-accent rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, (exposedPop / 4800) * 100))}%` }} />
              </div>
              <span className="text-[10px] text-pine-muted font-sans block">
                {isSite ? `Supports ${familiesCount} families comfortably` : `${familiesCount} families in danger zone`}
              </span>
            </div>

          </div>
        ) : (
          <div className="h-64 bg-pine-bg rounded-xl border border-pine-border p-3 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-3/5 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#25352E" />
                  <PolarAngleAxis dataKey="subject" stroke="#8FA79B" tick={{ fill: '#8FA79B', fontSize: 10, fontFamily: 'Space Grotesk' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#25352E" tick={{ fill: '#8FA79B', fontSize: 9 }} />
                  <Radar name={villageName} dataKey="current" stroke={isEpicenter ? '#E8543E' : '#38BDF8'} fill={isEpicenter ? '#E8543E' : '#38BDF8'} fillOpacity={0.45} />
                  <Radar name="Safe Base" dataKey="threshold" stroke="#34D399" fill="#34D399" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ backgroundColor: '#17241F', borderColor: '#25352E', color: '#EAF1EC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-2/5 space-y-2 text-[10.5px] font-mono">
              <div className="text-pine-accent font-bold">Geotechnical Fingerprint:</div>
              <p className="text-pine-muted font-sans">
                {isEpicenter 
                  ? 'Extreme expansion across landslide (94%), rainfall (100%), and soil saturation (98%) axes.'
                  : isSite 
                  ? 'Contained securely within the green safe threshold envelope with minimal hazard exposure.'
                  : 'Moderate hazard profile with localized vulnerability vectors.'}
              </p>
            </div>
          </div>
        )}

        {/* 2. Geotechnical Diagnostic Description */}
        <div className="bg-pine-elevated p-4 rounded-xl border border-pine-border space-y-2 font-sans">
          <span className="font-mono text-xs font-bold text-pine-accent block uppercase">
            Geotechnical Diagnostic Summary:
          </span>
          <p className="text-xs text-pine-text leading-relaxed">
            {profile.summary}
          </p>
        </div>

        {/* 3. Recommended Action Banner */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-pine-bg p-4 rounded-xl border border-pine-accent/30">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-pine-muted">
              {isSite ? 'Approved Resettlement Status' : 'Recommended Action'}
            </span>
            <div className="text-sm font-bold text-emerald-400 font-sans">
              {profile.actionRequired}
            </div>
            <p className="text-[11px] text-pine-muted font-sans">
              Assigned Destination: <strong className="text-white">{profile.assignedSafeSite}</strong>
            </p>
          </div>

          <button
            onClick={() => {
              if (onInitiateRelocation) {
                onInitiateRelocation(item);
              }
              onClose();
            }}
            className="shrink-0 px-4 py-2.5 bg-pine-accent hover:bg-emerald-400 text-pine-bg font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-hero-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSite ? 'VIEW ALLOCATED FAMILIES' : 'OPEN RELOCATION MATCHER'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
