import React, { useState, useMemo } from 'react';
import { RiskBadge } from '../common/RiskBadge';
import { DataConfidenceTag } from '../common/DataConfidenceTag';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { getHazardProfileForLocation, AREA_HAZARD_REGISTRY } from '../../data/areaHazardProfiles';
import { SITE_RESOURCE_REGISTRY, DEFAULT_PLANNING_ASSUMPTIONS } from '../../data/siteCapacityRegistry';
import { calculateSiteCapacity } from '../../utils/capacityCalculator';
import { calculateBayesianProbability } from '../../services/bayesianRiskService';
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
  Radio,
  Droplets,
  Ambulance,
  Car,
  HelpCircle
} from 'lucide-react';
interface Props {
  item: any | null;
  onClose: () => void;
  onInitiateRelocation?: (item: any) => void;
}

export const DetailedAnalysisModal: React.FC<Props> = ({ item, onClose, onInitiateRelocation }) => {

  if (!item) return null;

  // Retrieve exact distinct profile for this location/city/parcel
  const locationQuery = item.village || item.name || item.title || item.parcel_id || 'Meppadi';
  const profile = getHazardProfileForLocation(locationQuery);

  const isEpicenter = profile.category === 'Disaster Epicenter' || item.village === 'Meppadi' || item.isEpicenter;
  const isSite = profile.category === 'Safe Resettlement Site' || item.isSite || !!item.site_id || !!item.siteId;

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

  // Bayesian risk calculation
  const bayesian = calculateBayesianProbability(locationQuery, rainfall24h, slopeAngle, soilMoisture, historyFreq, riskScore);

  // Site resource capacity calculations if inspecting a safe site
  const siteKey = item.siteId || item.site_id || 'KL-WYD-S01';
  const siteLedger = SITE_RESOURCE_REGISTRY[siteKey] || SITE_RESOURCE_REGISTRY['KL-WYD-S01'];
  const siteCapacityCalc = useMemo(() => {
    return isSite ? calculateSiteCapacity(siteLedger, DEFAULT_PLANNING_ASSUMPTIONS, 1500) : null;
  }, [isSite, siteLedger]);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#0E1A15] border border-[#1E3228] rounded-2xl max-w-3xl w-full p-5 space-y-4 shadow-modal font-mono text-xs max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1E3228] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                isEpicenter 
                  ? 'bg-rose-950 text-rose-300 border-rose-800' 
                  : isSite 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                  : 'bg-[#15241E] text-emerald-400 border-[#1E3228]'
              }`}>
                {profile.category.toUpperCase()}
              </span>
              <RiskBadge level={riskLevel} score={riskScore} size="sm" />
              <ConfidenceBadge maturity_mode="autonomous" maturity_index={78} />
              <DataConfidenceTag confidence={isSite ? 'HIGH' : isEpicenter ? 'HIGH' : 'LOW'} size="sm" />
            </div>

            <h2 className="text-xl lg:text-2xl font-serif font-bold text-white">
              {title}
            </h2>
            <p className="text-xs text-pine-muted font-sans mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Location: <strong className="text-white">{villageName}</strong> • District: Wayanad, Kerala</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#0B1310] hover:bg-[#1E3228] text-pine-muted hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Probabilistic & Severity Diagnostic Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#0B1310] p-3 rounded-xl border border-[#1E3228]">
          <div>
            <span className="text-[10px] text-pine-muted block uppercase">HRI Severity Score:</span>
            <strong className="text-white font-mono text-base font-bold">{riskScore.toFixed(2)} / 100</strong>
            <span className="text-[9.5px] text-pine-muted block font-sans">Combined risk severity</span>
          </div>

          <div>
            <span className="text-[10px] text-emerald-400 block uppercase font-bold">Bayesian Hazard Probability:</span>
            <strong className="text-rose-400 font-mono text-base font-bold">{Math.round(bayesian.landslide_probability * 100)}%</strong>
            <span className="text-[9.5px] text-emerald-400 block font-mono">95% CI: {bayesian.credible_interval_str}</span>
          </div>

          <div>
            <span className="text-[10px] text-pine-muted block uppercase">Bayesian Risk Tier:</span>
            <strong className="text-amber-300 font-mono text-base font-bold">{bayesian.risk}</strong>
            <span className="text-[9.5px] text-pine-muted block font-sans">Modelled prototype inference</span>
          </div>
        </div>

        {/* Safe Site Carrying Capacity Resource Ledger (If site is clicked) */}
        {isSite && siteCapacityCalc && (
          <div className="p-3.5 bg-[#0B1310] rounded-xl border border-emerald-800/60 space-y-2.5">
            <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-[#1E3228] pb-1.5">
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>ON-SITE CARRYING CAPACITY & BOTTLENECK ANALYSIS:</span>
              </span>
              <span className="text-[10px] text-white">Practical Limit: <strong className="text-emerald-400">{siteCapacityCalc.practicalCapacity} People</strong></span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
              <div className="p-2 bg-[#12221B] rounded border border-[#1E3228]">
                <span className="text-pine-muted block text-[9.5px]">Potable Water Supply:</span>
                <strong className="text-cyan-400 font-mono">{siteLedger.waterDailyAvailableLiters.toLocaleString()} L/day</strong>
              </div>
              <div className="p-2 bg-[#12221B] rounded border border-[#1E3228]">
                <span className="text-pine-muted block text-[9.5px]">Sanitation Units:</span>
                <strong className="text-purple-300 font-mono">{siteLedger.toiletsAvailable} Toilets</strong>
              </div>
              <div className="p-2 bg-[#12221B] rounded border border-[#1E3228]">
                <span className="text-pine-muted block text-[9.5px]">Emergency Ambulances:</span>
                <strong className="text-white font-mono">{siteLedger.ambulancesStationed} Units Stationed</strong>
              </div>
              <div className="p-2 bg-[#12221B] rounded border border-[#1E3228]">
                <span className="text-pine-muted block text-[9.5px]">Medical Triage Staff:</span>
                <strong className="text-rose-300 font-mono">{siteLedger.medicalDoctorsOnCall + siteLedger.nursesOnCall} Doctors/Nurses</strong>
              </div>
            </div>

            <div className="p-2 bg-[#15241E] rounded text-[10.5px] text-pine-text flex items-center justify-between">
              <span>Limiting Resource: <strong className="text-amber-300">{siteCapacityCalc.limitingResource}</strong></span>
              <span className="text-pine-muted text-[10px]">{siteCapacityCalc.limitingResourceExplanation}</span>
            </div>
          </div>
        )}

        {/* Multi-Hazard Assessment Section Header */}
        <div className="flex items-center justify-between bg-[#0B1310] px-3 py-2 rounded-lg border border-[#1E3228]">
          <span className="text-[11px] text-emerald-400 uppercase font-bold flex items-center gap-1.5 font-mono">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Multi-Hazard Assessment & Demographics ({villageName})</span>
          </span>
          <span className="text-[10px] text-pine-muted font-mono">
            6 Diagnostic Geotechnical Indicators
          </span>
        </div>

        {/* 1. Distinct Multi-Hazard Geotechnical Spectrum Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          
          {/* Landslide */}
          <div className="p-3 bg-[#0B1310] rounded-xl border border-rose-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Mountain className="w-3.5 h-3.5" />
                <span>Landslide Probability</span>
              </span>
              <strong className="text-sm font-mono">{landslideProb}%</strong>
            </div>
            <div className="w-full h-2 bg-[#15241E] rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${landslideProb}%` }} />
            </div>
            <span className="text-[10px] text-pine-muted font-sans block">
              {landslideProb > 60 ? 'Active debris flow runout zone' : 'Stable terrain foundation'}
            </span>
          </div>

          {/* Flood Inundation */}
          <div className="p-3 bg-[#0B1310] rounded-xl border border-cyan-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Waves className="w-3.5 h-3.5" />
                <span>Flood Inundation Risk</span>
              </span>
              <strong className="text-sm font-mono">{floodProb}%</strong>
            </div>
            <div className="w-full h-2 bg-[#15241E] rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${floodProb}%` }} />
            </div>
            <span className="text-[10px] text-pine-muted font-sans block">
              {floodProb > 50 ? 'Submerged in 100-year river surge' : 'Elevated above flood basin'}
            </span>
          </div>

          {/* Slope Steepness */}
          <div className="p-3 bg-[#0B1310] rounded-xl border border-amber-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Compass className="w-3.5 h-3.5" />
                <span>Slope Steepness</span>
              </span>
              <strong className="text-sm font-mono">{slopeAngle.toFixed(1)}°</strong>
            </div>
            <div className="w-full h-2 bg-[#15241E] rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (slopeAngle / 45) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-pine-muted font-sans block">
              {slopeAngle > 30 ? 'Steep mountain scarp (>30°)' : 'Gentle plateau terrain'}
            </span>
          </div>

          {/* 24h Rainfall */}
          <div className="p-3 bg-[#0B1310] rounded-xl border border-blue-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-blue-400">
              <span className="flex items-center gap-1 text-[11px]">
                <CloudRain className="w-3.5 h-3.5" />
                <span>24h Rainfall Total</span>
              </span>
              <strong className="text-sm font-mono">{rainfall24h.toFixed(1)} mm</strong>
            </div>
            <div className="w-full h-2 bg-[#15241E] rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (rainfall24h / 300) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-pine-muted font-sans block">
              {rainfall24h > 200 ? 'Extreme cloudburst event' : 'Moderate monsoon rainfall'}
            </span>
          </div>

          {/* Soil Moisture */}
          <div className="p-3 bg-[#0B1310] rounded-xl border border-teal-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-teal-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Droplets className="w-3.5 h-3.5" />
                <span>Soil Moisture Saturation</span>
              </span>
              <strong className="text-sm font-mono">{soilMoisture}%</strong>
            </div>
            <div className="w-full h-2 bg-[#15241E] rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${soilMoisture}%` }} />
            </div>
            <span className="text-[10px] text-pine-muted font-sans block">
              {soilMoisture > 80 ? 'Pore pressure exceeds shear resistance' : 'Well-drained soil matrix'}
            </span>
          </div>

          {/* Affected Population */}
          <div className="p-3 bg-[#0B1310] rounded-xl border border-emerald-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Users className="w-3.5 h-3.5" />
                <span>{isSite ? 'Usable Capacity' : 'Exposed Population'}</span>
              </span>
              <strong className="text-sm font-mono">{exposedPop.toLocaleString()}</strong>
            </div>
            <div className="w-full h-2 bg-[#15241E] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, (exposedPop / 4800) * 100))}%` }} />
            </div>
            <span className="text-[10px] text-pine-muted font-sans block">
              {isSite ? `Supports ${familiesCount} families comfortably` : `${familiesCount} families in danger zone`}
            </span>
          </div>

        </div>

        {/* Bayesian Explainability Box */}
        <div className="bg-[#12221B] p-3.5 rounded-xl border border-[#1E3228] space-y-1.5 font-sans">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why this Bayesian Probability?</span>
          </div>
          <p className="text-xs text-pine-text leading-relaxed">
            {bayesian.why_this_probability}
          </p>
        </div>

        {/* 2. Geotechnical Diagnostic Description */}
        <div className="bg-[#15241E] p-4 rounded-xl border border-[#1E3228] space-y-2 font-sans">
          <span className="font-mono text-xs font-bold text-emerald-400 block uppercase">
            Geotechnical Diagnostic Summary:
          </span>
          <p className="text-xs text-pine-text leading-relaxed">
            {profile.summary}
          </p>
        </div>

        {/* 3. Recommended Action Banner */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0B1310] p-4 rounded-xl border border-[#1E3228]">
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
            className="shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-hero-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSite ? 'AUDIT CARRYING CAPACITY' : 'OPEN RELOCATION MATCHER'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
