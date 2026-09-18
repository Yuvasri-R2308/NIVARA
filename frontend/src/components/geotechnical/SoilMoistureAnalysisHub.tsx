import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AREA_HAZARD_REGISTRY } from '../../data/areaHazardProfiles';
import { 
  Droplets, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Gauge, 
  Clock, 
  HelpCircle, 
  ArrowRight,
  TrendingDown,
  Sparkles,
  Mountain
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export interface SoilGeotechnicalConfig {
  soilType: 'Lateritic Sandy Clay Loam' | 'Weathered Granitic Saprolite' | 'Valley Alluvial Silt';
  cohesionKPa: number;
  frictionAngleDeg: number;
  unitWeightKNm3: number;
  regolithDepthM: number;
  criticalSaturationPct: number;
}

export const SOIL_TYPE_REGISTRY: Record<string, SoilGeotechnicalConfig> = {
  'Weathered Granitic Saprolite': {
    soilType: 'Weathered Granitic Saprolite',
    cohesionKPa: 6.5,
    frictionAngleDeg: 32.0,
    unitWeightKNm3: 18.5,
    regolithDepthM: 3.5,
    criticalSaturationPct: 78.0
  },
  'Lateritic Sandy Clay Loam': {
    soilType: 'Lateritic Sandy Clay Loam',
    cohesionKPa: 12.0,
    frictionAngleDeg: 28.0,
    unitWeightKNm3: 19.2,
    regolithDepthM: 4.2,
    criticalSaturationPct: 82.0
  },
  'Valley Alluvial Silt': {
    soilType: 'Valley Alluvial Silt',
    cohesionKPa: 4.0,
    frictionAngleDeg: 22.0,
    unitWeightKNm3: 17.8,
    regolithDepthM: 2.8,
    criticalSaturationPct: 70.0
  }
};

interface Props {
  initialVillage?: string;
  onVillageChange?: (village: string) => void;
}

export const SoilMoistureAnalysisHub: React.FC<Props> = ({ 
  initialVillage = 'Meppadi',
  onVillageChange 
}) => {
  const { theme } = useApp();
  const [selectedVillage, setSelectedVillage] = useState<string>(initialVillage);
  const [selectedSoilKey, setSelectedSoilKey] = useState<string>('Weathered Granitic Saprolite');
  const [simulatedPoreSaturation, setSimulatedPoreSaturation] = useState<number>(98.0);
  const [activeDepthTab, setActiveDepthTab] = useState<'all' | '0-1' | '1-3' | '3-10'>('all');

  useEffect(() => {
    if (initialVillage) {
      const match = Object.keys(AREA_HAZARD_REGISTRY).find(k => 
        k.toLowerCase() === initialVillage.toLowerCase() ||
        initialVillage.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(initialVillage.toLowerCase())
      );
      const target = match || initialVillage;
      if (AREA_HAZARD_REGISTRY[target]) {
        setSelectedVillage(target);
        setSimulatedPoreSaturation(AREA_HAZARD_REGISTRY[target].soilMoisture);
      }
    }
  }, [initialVillage]);

  const villageProfile = AREA_HAZARD_REGISTRY[selectedVillage] || AREA_HAZARD_REGISTRY['Meppadi'];
  const soilConfig = SOIL_TYPE_REGISTRY[selectedSoilKey] || SOIL_TYPE_REGISTRY['Weathered Granitic Saprolite'];

  // Geotechnical Mohr-Coulomb Factor of Safety (FoS) calculation
  const geotechnicalMetrics = useMemo(() => {
    const slopeRad = (villageProfile.slopeDeg * Math.PI) / 180;
    const phiRad = (soilConfig.frictionAngleDeg * Math.PI) / 180;
    const z = soilConfig.regolithDepthM;
    const gamma = soilConfig.unitWeightKNm3;
    const c = soilConfig.cohesionKPa;

    // Total normal stress (sigma_n)
    const sigmaN = gamma * z * (Math.cos(slopeRad) ** 2);
    
    // Pore water pressure u (proportional to saturation level)
    // At 100% saturation, u approaches hydrostatic pressure (gamma_w * z * cos^2(slope))
    const gammaW = 9.81; // unit weight of water
    const saturationRatio = simulatedPoreSaturation / 100.0;
    const uPore = saturationRatio > 0.4 
      ? ((saturationRatio - 0.4) / 0.6) * gammaW * z * (Math.cos(slopeRad) ** 2) 
      : 0;

    // Effective stress sigma' = sigma_n - u
    const sigmaPrime = Math.max(0, sigmaN - uPore);

    // Resisting shear strength = c' + sigma' * tan(phi')
    const resistingForce = c + sigmaPrime * Math.tan(phiRad);

    // Driving shear stress = gamma * z * sin(slope) * cos(slope)
    const drivingForce = gamma * z * Math.sin(slopeRad) * Math.cos(slopeRad);

    // Factor of Safety (FoS)
    const rawFoS = drivingForce > 0 ? resistingForce / drivingForce : 2.5;
    const fos = Math.round(rawFoS * 100) / 100;

    // Stability classification
    let status: 'STABLE' | 'MARGINAL' | 'LIQUEFACTION_CRITICAL' = 'STABLE';
    if (fos < 1.0) {
      status = 'LIQUEFACTION_CRITICAL';
    } else if (fos <= 1.25) {
      status = 'MARGINAL';
    }

    // Failure probability estimation (%)
    const failureProb = Math.min(99, Math.max(1, Math.round((1.0 / (1.0 + Math.exp((fos - 1.0) * 8.0))) * 100)));

    // Estimated time to critical failure under continuous precipitation
    let hoursToFailure: string = 'Indefinite (> 72h)';
    if (status === 'LIQUEFACTION_CRITICAL') {
      hoursToFailure = 'IMMINENT (< 1.5h)';
    } else if (status === 'MARGINAL') {
      const hrs = Math.max(2, Math.round((fos - 1.0) * 18));
      hoursToFailure = `~${hrs} hours at current rainfall rate`;
    }

    return {
      sigmaN: Math.round(sigmaN * 10) / 10,
      uPore: Math.round(uPore * 10) / 10,
      sigmaPrime: Math.round(sigmaPrime * 10) / 10,
      resistingForce: Math.round(resistingForce * 10) / 10,
      drivingForce: Math.round(drivingForce * 10) / 10,
      fos,
      status,
      failureProb,
      hoursToFailure
    };
  }, [villageProfile, soilConfig, simulatedPoreSaturation]);

  // Depth-stratified soil saturation distribution
  const depthLayers = [
    {
      depth: '0 – 1 cm (Topsoil)',
      saturation: Math.min(100, Math.round(simulatedPoreSaturation * 0.96)),
      role: 'Surface water collection',
      risk: simulatedPoreSaturation > 80 ? 'Heavy water accumulation' : 'Normal water flow'
    },
    {
      depth: '1 – 3 cm (Root Zone)',
      saturation: Math.min(100, Math.round(simulatedPoreSaturation * 0.98)),
      role: 'Root support and water storage',
      risk: simulatedPoreSaturation > 85 ? 'Root support is weakened' : 'Root support is stable'
    },
    {
      depth: '3 – 10 cm (Rock Interface)',
      saturation: Math.min(100, Math.round(simulatedPoreSaturation * 1.02)),
      role: 'Critical weak soil layer',
      risk: simulatedPoreSaturation > 80 ? 'CRITICAL — SOIL IS FULLY SATURATED' : 'Rock contact is stable'
    }
  ];

  // Simulation Stress Curve Data for Charts
  const simulationChartData = useMemo(() => {
    const points = [];
    for (let sat = 40; sat <= 100; sat += 5) {
      const slopeRad = (villageProfile.slopeDeg * Math.PI) / 180;
      const phiRad = (soilConfig.frictionAngleDeg * Math.PI) / 180;
      const z = soilConfig.regolithDepthM;
      const gamma = soilConfig.unitWeightKNm3;
      const c = soilConfig.cohesionKPa;
      const gammaW = 9.81;

      const sigmaN = gamma * z * (Math.cos(slopeRad) ** 2);
      const satRatio = sat / 100.0;
      const u = satRatio > 0.4 ? ((satRatio - 0.4) / 0.6) * gammaW * z * (Math.cos(slopeRad) ** 2) : 0;
      const sigmaP = Math.max(0, sigmaN - u);
      const resisting = c + sigmaP * Math.tan(phiRad);
      const driving = gamma * z * Math.sin(slopeRad) * Math.cos(slopeRad);
      const calculatedFoS = driving > 0 ? resisting / driving : 2.5;

      points.push({
        saturation: `${sat}%`,
        fos: Math.round(calculatedFoS * 100) / 100,
        porePressure: Math.round(u * 10) / 10,
        safeThreshold: 1.0
      });
    }
    return points;
  }, [villageProfile, soilConfig]);

  const isLight = theme === 'light';

  return (
    <div className={`border rounded-2xl p-4 lg:p-5 space-y-4 font-mono text-xs shadow-sm transition-all ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#111D18] border-[#1E3228] text-pine-text'
    }`}>
      
      {/* 1. SECTION TITLE & STATUS HEADER */}
      <div className={`border-b pb-3 ${isLight ? 'border-slate-200' : 'border-[#1E3228]'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className={`text-xl lg:text-2xl font-serif font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Soil Moisture & Landslide Risk
            </h2>
            <p className={`text-[11px] font-sans ${isLight ? 'text-slate-600' : 'text-pine-muted'}`}>
              Shows how soil moisture can affect slope stability and landslide risk.
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider self-start sm:self-center border ${
            isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
          }`}>
            LANDSLIDE RISK ANALYSIS // ACTIVE
          </span>
        </div>
      </div>

      {/* 2. INTERACTIVE CONTROLS: VILLAGE, SOIL TYPE & SATURATION SLIDER */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1310] border-[#1E3228]'
      }`}>
        
        {/* Village Selection */}
        <div>
          <label className={`text-[10px] block mb-1 uppercase font-bold ${isLight ? 'text-slate-600' : 'text-pine-muted'}`}>
            SELECTED LOCATION:
          </label>
          <select
            value={selectedVillage}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedVillage(v);
              if (onVillageChange) onVillageChange(v);
              const prof = AREA_HAZARD_REGISTRY[v];
              if (prof) setSimulatedPoreSaturation(prof.soilMoisture);
            }}
            className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer ${
              isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-[#12221B] text-white border-[#1E3228]'
            }`}
          >
            {Object.entries(AREA_HAZARD_REGISTRY).map(([key, v]) => (
              <option key={key} value={key} className={isLight ? 'bg-white text-slate-900' : 'bg-[#0E1A15]'}>
                {key} ({v.slopeDeg}° Slope, {v.soilMoisture}% Baseline Saturation)
              </option>
            ))}
          </select>
        </div>

        {/* Soil Geotechnical Type Selection */}
        <div>
          <label className={`text-[10px] block mb-1 uppercase font-bold ${isLight ? 'text-slate-600' : 'text-pine-muted'}`}>
            SOIL TYPE:
          </label>
          <select
            value={selectedSoilKey}
            onChange={(e) => setSelectedSoilKey(e.target.value)}
            className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer ${
              isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-[#12221B] text-white border-[#1E3228]'
            }`}
          >
            {Object.keys(SOIL_TYPE_REGISTRY).map((k) => (
              <option key={k} value={k} className={isLight ? 'bg-white text-slate-900' : 'bg-[#0E1A15]'}>
                {k} (c'={SOIL_TYPE_REGISTRY[k].cohesionKPa} kPa, φ'={SOIL_TYPE_REGISTRY[k].frictionAngleDeg}°)
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Pore Saturation Stress Slider */}
        <div>
          <div className={`flex justify-between text-[10px] mb-1 ${isLight ? 'text-slate-600' : 'text-pine-muted'}`}>
            <span className="uppercase font-bold">SOIL SATURATION:</span>
            <strong className={`font-mono text-xs ${isLight ? 'text-cyan-700 font-bold' : 'text-cyan-400'}`}>{simulatedPoreSaturation}%</strong>
          </div>
          <input
            type="range"
            min={30}
            max={100}
            step={1}
            value={simulatedPoreSaturation}
            onChange={(e) => setSimulatedPoreSaturation(Number(e.target.value))}
            className="w-full accent-cyan-500 h-1.5 rounded cursor-pointer"
          />
          <div className={`flex justify-between text-[8.5px] font-sans pt-0.5 ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>
            <span>30% (Normal Level)</span>
            <span className={isLight ? 'text-amber-700 font-bold' : 'text-amber-400'}>80% (Warning)</span>
            <span className={isLight ? 'text-rose-700 font-bold' : 'text-rose-400'}>100% (Critical)</span>
          </div>
        </div>

      </div>

      {/* 3. 4 KEY GEOTECHNICAL PHYSICS KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Factor of Safety (FoS) */}
        <div className={`p-3 rounded-xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1310] border-[#1E3228]'
        }`}>
          <div className={`flex justify-between items-center text-[10px] uppercase font-bold ${isLight ? 'text-slate-600' : 'text-pine-muted'}`}>
            <span>SLOPE SAFETY</span>
            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${
              geotechnicalMetrics.fos < 1.0 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : geotechnicalMetrics.fos <= 1.25 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {geotechnicalMetrics.fos}
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-pine-muted'} font-sans`}>(Below 1.0 = Unstable)</span>
          </div>
          <span className={`text-[9.5px] font-sans block ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>
            {geotechnicalMetrics.fos < 1.0 ? 'Slope is critically unstable' : 'Slope is currently stable'}
          </span>
        </div>

        {/* Pore Water Pressure (u) */}
        <div className={`p-3 rounded-xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1310] border-[#1E3228]'
        }`}>
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">
            <span>WATER PRESSURE IN SOIL</span>
            <Droplets className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {geotechnicalMetrics.uPore} <span className="text-xs text-slate-500 dark:text-pine-muted font-normal">kPa</span>
            </span>
          </div>
          <span className={`text-[9.5px] font-sans block ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>
            High water pressure can weaken the soil
          </span>
        </div>

        {/* Effective Shear Stress (sigma') */}
        <div className={`p-3 rounded-xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1310] border-[#1E3228]'
        }`}>
          <div className={`flex justify-between items-center text-[10px] uppercase font-bold ${isLight ? 'text-slate-600' : 'text-pine-muted'}`}>
            <span>SOIL STRENGTH</span>
            <Activity className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${
              geotechnicalMetrics.sigmaPrime < 15 ? 'text-rose-600 dark:text-rose-400' : (isLight ? 'text-slate-900' : 'text-white')
            }`}>
              {geotechnicalMetrics.sigmaPrime} <span className="text-xs text-slate-500 dark:text-pine-muted font-normal">kPa</span>
            </span>
          </div>
          <span className={`text-[9.5px] font-sans block ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>
            Remaining strength of the soil
          </span>
        </div>

        {/* Estimated Time to Liquefaction Failure */}
        <div className={`p-3 rounded-xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1310] border-[#1E3228]'
        }`}>
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
            <span>ESTIMATED TIME TO FAILURE</span>
            <Clock className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-base font-bold font-mono ${
              geotechnicalMetrics.status === 'LIQUEFACTION_CRITICAL' ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-amber-600 dark:text-amber-300'
            }`}>
              {geotechnicalMetrics.hoursToFailure}
            </span>
          </div>
          <span className={`text-[9.5px] font-sans block ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>
            Estimated using rainfall and drainage conditions
          </span>
        </div>

      </div>

      {/* 4. DEPTH-STRATIFIED STRATIGRAPHY PROFILE & INTERACTIVE STRESS CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 6 Cols: 3-Tier Soil Horizon Depth Stratigraphy */}
        <div className={`lg:col-span-6 p-4 rounded-xl border space-y-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1310] border-[#1E3228]'
        }`}>
          <div className={`flex items-center justify-between border-b pb-1.5 ${isLight ? 'border-slate-200' : 'border-[#1E3228]'}`}>
            <span className={`font-bold text-xs uppercase flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>SOIL LAYERS — {selectedVillage.toUpperCase()}:</span>
            </span>
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>{soilConfig.regolithDepthM}m Profile</span>
          </div>

          <div className="space-y-2.5">
            {depthLayers.map((layer, index) => {
              const isCritical = layer.saturation > 85;
              return (
                <div key={index} className={`p-2.5 rounded-lg border space-y-1.5 ${
                  isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#12221B] border-[#1E3228]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-[11px] ${isLight ? 'text-slate-900' : 'text-white'}`}>{layer.depth}</span>
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold ${
                      isCritical 
                        ? (isLight ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse')
                        : (isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-950 text-emerald-300 border border-emerald-800')
                    }`}>
                      {layer.saturation}% Saturation
                    </span>
                  </div>

                  <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#0B1310]'}`}>
                    <div 
                      className={`h-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : 'bg-cyan-500'}`}
                      style={{ width: `${layer.saturation}%` }}
                    />
                  </div>

                  <div className={`flex items-center justify-between text-[9.5px] font-sans ${isLight ? 'text-slate-500' : 'text-pine-muted'}`}>
                    <span>{layer.role}</span>
                    <span className={isCritical ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>{layer.risk}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 Cols: FoS vs Pore Water Pressure Curve Chart */}
        <div className={`lg:col-span-6 p-4 rounded-xl border space-y-3 flex flex-col justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1310] border-[#1E3228]'
        }`}>
          <div className={`flex items-center justify-between border-b pb-1.5 ${isLight ? 'border-slate-200' : 'border-[#1E3228]'}`}>
            <span className={`font-bold text-xs uppercase flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              <span>SLOPE SAFETY vs SOIL SATURATION:</span>
            </span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold font-mono">Below 1.0 = Unstable</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={isLight ? '#e2e8f0' : '#1E3228'} strokeDasharray="3 3" />
                <XAxis dataKey="saturation" stroke={isLight ? '#64748b' : '#8FA79B'} tick={{ fontSize: 9, fill: isLight ? '#64748b' : '#8FA79B' }} />
                <YAxis stroke={isLight ? '#64748b' : '#8FA79B'} tick={{ fontSize: 9, fill: isLight ? '#64748b' : '#8FA79B' }} domain={[0, 2.5]} />
                <Tooltip contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#111D18', borderColor: isLight ? '#cbd5e1' : '#1E3228', color: isLight ? '#0f172a' : '#FFFFFF', fontSize: '11px' }} />
                <Line type="monotone" dataKey="fos" stroke="#E8543E" strokeWidth={2.5} dot={false} name="Slope Safety (FoS)" />
                <Line type="monotone" dataKey="safeThreshold" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Safety Limit (1.0)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={`p-2 rounded-lg border text-[10px] font-sans ${
            isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-[#12221B] border-[#1E3228] text-pine-muted'
          }`}>
            <strong>KEY FINDING:</strong> As soil in {selectedVillage} becomes more saturated on this {villageProfile.slopeDeg}° slope, slope stability decreases rapidly once soil moisture crosses <strong>{soilConfig.criticalSaturationPct}%</strong>.
          </div>
        </div>

      </div>

    </div>
  );
};
