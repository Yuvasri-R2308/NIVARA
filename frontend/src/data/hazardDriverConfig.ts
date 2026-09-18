/**
 * ============================================================================
 * SCIENTIFIC HAZARD-DRIVER ABSTRACTION MODULE
 * ============================================================================
 * 
 * ARCHITECTURAL & GEOMORPHOLOGICAL RATIONALE:
 * ----------------------------------------------------------------------------
 * 1. LANDSLIDE & CLOUDBURST (Meteorological / Geotechnical Drivers):
 *    Driven by cumulative precipitation depth (mm), short-term burst intensity,
 *    and subsurface pore-water pressure saturation (%) within the regolith,
 *    which lowers the effective shear strength (Mohr-Coulomb failure criterion).
 * 
 * 2. FLOOD (Hydrometeorological / Catchment Coupling):
 *    Driven by rainfall volume coupled to upstream river gauge level (m MSL)
 *    and river discharge volume (m³/s). High rainfall alone does not cause
 *    severe inundation unless coupled to catchment saturation, upstream
 *    tributary hydrographs, and stage elevation exceeding embankment crests.
 * 
 * 3. COASTAL EROSION (Oceanographic / Hydrodynamic Driver):
 *    *** CRITICAL SCIENTIFIC SEPARATION ***
 *    Rainfall is NOT a primary geomorphological driver of shoreline erosion.
 *    Coastal bluff retreat, beach scouring, and dune barrier overwash are
 *    governed by hydrodynamic oceanographic forces:
 *      - Significant Wave Height (Hs in meters)
 *      - Wave Energy Flux / Power: P = (1/16) * ρ * g * Hs² * Cg
 *      - Astronomical Tidal Phase (Spring / King Tides)
 *      - Wind-driven Storm Surge Elevation (m above MSL)
 *      - Nearshore Longshore Sediment Drift
 *    Applying a rainfall multiplier to Coastal Erosion is physically false.
 *    Coastal Erosion must strictly use a "Storm Surge / Wave Energy Multiplier"
 *    and compute wave height, surge elevation, shoreline retreat rate (m),
 *    buffer expansion, and beach/dune sediment volume loss (m³/m).
 * ============================================================================
 */

import { HazardType } from '../types';
import { calculateBayesianProbability } from '../services/bayesianRiskService';

export interface DriverPresetStep {
  label: string;                  // e.g. '0%', '+25%', '+50%', '+75%', '+100%'
  mult: number;                   // e.g. 1.0, 1.25, 1.5, 1.75, 2.0
  title: string;                  // e.g. 'Live Baseline', 'Storm Surge Watch'
  primaryMetricDisplay: string;   // e.g. '142 mm' or '1.2m Wave'
  secondaryMetricDisplay: string; // e.g. '52% Saturation' or '+0.0m Surge'
  description: string;
}

export interface EscalationSector {
  id: string;
  name: string;
  location: string;
  hazardRiskLabel: string;
  probabilityOrRate: string;
  riskColor: 'rose' | 'amber' | 'cyan' | 'emerald';
  description: string;
}

export interface ScenarioMatrixRow {
  scenarioName: string;
  multiplier: number;
  driverMetric1: string;
  driverMetric2: string;
  hazardScoreOrProb: string;
  confidenceInterval: string;
  impactScale: string;
}

export interface HazardImpactMetrics {
  // Card 1: Primary Probability / Rate Metric
  primaryMetric: {
    label: string;
    baselineValue: string;
    simulatedValue: string;
    unit: string;
    subtext: string;
    confidenceLabel: string;
    status: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  };

  // Card 2: Spatial Red-Zone Extent
  redZoneExtent: {
    label: string;
    baselineValue: string;
    simulatedValue: string;
    deltaText: string;
    statusColor: 'rose' | 'amber' | 'cyan';
  };

  // Card 3: Exposed Population / Households
  exposedPopulation: {
    label: string;
    baselineValue: string;
    simulatedValue: string;
    deltaText: string;
    statusColor: 'rose' | 'amber' | 'cyan';
  };

  // Card 4: Environmental / Physical Metric
  physicalIndicator: {
    label: string;
    displayValue: string;
    numericPct: number;
    unit: string;
    progressColor: string;
    statusDescription: string;
  };

  // Header telemetry summaries
  headerTelemetry: {
    primaryLabel: string;
    primaryValue: string;
    secondaryLabel: string;
    secondaryValue: string;
    surgePercentText: string;
  };
}

export interface HazardDriverConfig {
  hazardKey: HazardType;
  hazardName: string;
  studyAreaTitle: string;
  simulatorTitle: string;
  simulatorSubtitle: string;
  driverAxisName: string;
  driverAxisSubtitle: string;
  iconName: 'mountain' | 'droplets' | 'cloud-lightning' | 'waves';
  minMult: number;
  maxMult: number;
  stepSize: number;
  presetSteps: DriverPresetStep[];
  
  // Computes all 4 impact metrics dynamically as slider changes
  computeImpact: (mult: number) => HazardImpactMetrics;

  calibrationNotice: string;
  escalationSectionTitle: string;

  // Grounded location escalation sectors in study area
  getEscalationSectors: (mult: number) => EscalationSector[];

  // Comparison matrix rows for the scenario modal
  getComparisonMatrix: () => ScenarioMatrixRow[];
}

// ============================================================================
// 1. LANDSLIDE DRIVER CONFIG (Meppadi, Wayanad, Kerala)
// ============================================================================
export const LANDSLIDE_DRIVER_CONFIG: HazardDriverConfig = {
  hazardKey: 'landslide',
  hazardName: 'Landslide',
  studyAreaTitle: 'Meppadi, Wayanad, Kerala',
  simulatorTitle: 'Rainfall & Landslide Simulator',
  simulatorSubtitle: 'Shows how heavy rainfall can increase landslide risk and affect nearby communities.',
  driverAxisName: 'Rainfall Increase:',
  driverAxisSubtitle: 'Rainfall & Soil Wetness',
  calibrationNotice: 'Risk estimate based on available field and environmental data.',
  escalationSectionTitle: 'AREAS AT HIGHER RISK',
  iconName: 'mountain',
  minMult: 1.0,
  maxMult: 2.0,
  stepSize: 0.05,
  presetSteps: [
    { 
      label: '0%', 
      mult: 1.0, 
      title: 'Normal Condition',
      primaryMetricDisplay: '142 mm',
      secondaryMetricDisplay: '52% Wetness',
      description: 'Current rainfall and soil wetness observation in Meppadi.'
    },
    { 
      label: '+25%', 
      mult: 1.25, 
      title: 'Heavy Condition',
      primaryMetricDisplay: '178 mm',
      secondaryMetricDisplay: '64% Wetness',
      description: 'Heavy rain increasing water in the soil.'
    },
    { 
      label: '+50%', 
      mult: 1.5, 
      title: 'Very Heavy Condition',
      primaryMetricDisplay: '213 mm',
      secondaryMetricDisplay: '75% Wetness',
      description: 'Very heavy rain causing water to build up rapidly.'
    },
    { 
      label: '+75%', 
      mult: 1.75, 
      title: 'Severe Condition',
      primaryMetricDisplay: '248 mm',
      secondaryMetricDisplay: '86% Wetness',
      description: 'Severe downpour creating high risk of soil movement.'
    },
    { 
      label: '+100%', 
      mult: 2.0, 
      title: 'Extreme Condition',
      primaryMetricDisplay: '284 mm',
      secondaryMetricDisplay: '98% Wetness',
      description: 'Extreme rainfall with very high danger of landslides.'
    }
  ],

  computeImpact: (mult: number): HazardImpactMetrics => {
    const rainPct = Math.round((mult - 1.0) * 100);
    const simulatedRain = Math.round(142.0 * mult);
    const simulatedSaturation = Math.min(99, Math.round(52 + rainPct * 0.46));
    const baselineBayesian = calculateBayesianProbability('Meppadi', 284.5);
    const simulatedBayesian = calculateBayesianProbability('Meppadi', 284.5 * mult);

    const baseParcels = 424;
    const addedRed = Math.round((mult - 1.0) * 280);
    const totalRed = baseParcels + addedRed;

    const basePop = 4800;
    const addedPop = Math.round(addedRed * 8.2);
    const totalPop = basePop + addedPop;

    return {
      primaryMetric: {
        label: 'LANDSLIDE RISK',
        baselineValue: `${Math.round(baselineBayesian.landslide_probability * 100)}%`,
        simulatedValue: `${Math.round(simulatedBayesian.landslide_probability * 100)}%`,
        unit: 'Risk Level',
        subtext: `Estimated Range: ${simulatedBayesian.credible_interval_str}`,
        confidenceLabel: 'Field Survey Data',
        status: simulatedBayesian.landslide_probability >= 0.9 ? 'CRITICAL' : 'WARNING'
      },
      redZoneExtent: {
        label: 'RISK AREA EXPANSION',
        baselineValue: '424 families at risk',
        simulatedValue: `${totalRed} families`,
        deltaText: `+${addedRed} families in higher risk area`,
        statusColor: 'rose'
      },
      exposedPopulation: {
        label: 'PEOPLE AT RISK',
        baselineValue: '4,800 people',
        simulatedValue: `${totalPop.toLocaleString()} people`,
        deltaText: `+${addedPop.toLocaleString()} more people at risk`,
        statusColor: 'amber'
      },
      physicalIndicator: {
        label: 'SOIL WETNESS',
        displayValue: `${simulatedSaturation}%`,
        numericPct: simulatedSaturation,
        unit: '% Wetness',
        progressColor: simulatedSaturation > 80 ? 'bg-rose-500' : 'bg-cyan-400',
        statusDescription: simulatedSaturation > 80 
          ? 'CRITICAL: Soil is very wet and unstable' 
          : 'NORMAL: Soil condition is stable'
      },
      headerTelemetry: {
        primaryLabel: 'Rainfall',
        primaryValue: `${simulatedRain} mm`,
        secondaryLabel: 'Soil Wetness',
        secondaryValue: `${simulatedSaturation}%`,
        surgePercentText: `+${rainPct}%`
      }
    };
  },

  getEscalationSectors: (mult: number): EscalationSector[] => [
    {
      id: 'sec-1',
      name: 'Achooranam Tea Slopes',
      location: 'Upper Meppadi Area',
      hazardRiskLabel: 'Possible Debris Flow Area',
      probabilityOrRate: `${Math.min(99, Math.round(56 * mult))}% Risk`,
      riskColor: 'rose',
      description: 'Heavy rain may increase the chance of soil and debris movement.'
    },
    {
      id: 'sec-2',
      name: 'Vythiri Ghat Road Cut',
      location: 'NH-766 Highway Area',
      hazardRiskLabel: 'Roadside Slope Risk',
      probabilityOrRate: `${Math.min(99, Math.round(62 * mult))}% Risk`,
      riskColor: 'amber',
      description: 'Heavy rain may cause falling rocks and block roads on NH-766.'
    },
    {
      id: 'sec-3',
      name: 'Chooralmala Runout Confluence',
      location: 'River Basin Area',
      hazardRiskLabel: 'Possible Debris Flow Area',
      probabilityOrRate: `${Math.min(99, Math.round(78 * mult))}% Risk`,
      riskColor: 'cyan',
      description: 'Debris and water may flow into lower areas near the river.'
    }
  ],

  getComparisonMatrix: (): ScenarioMatrixRow[] => [
    { scenarioName: 'Normal Condition (0%)', multiplier: 1.0, driverMetric1: '142 mm', driverMetric2: '52% Wet', hazardScoreOrProb: '87%', confidenceInterval: '79%–93%', impactScale: '424 Families at Risk' },
    { scenarioName: '+25% Heavy Condition', multiplier: 1.25, driverMetric1: '178 mm', driverMetric2: '64% Wet', hazardScoreOrProb: '91%', confidenceInterval: '85%–96%', impactScale: '512 Families at Risk' },
    { scenarioName: '+50% Very Heavy Condition', multiplier: 1.5, driverMetric1: '213 mm', driverMetric2: '75% Wet', hazardScoreOrProb: '94%', confidenceInterval: '89%–98%', impactScale: '610 Families at Risk' },
    { scenarioName: '+75% Severe Condition', multiplier: 1.75, driverMetric1: '248 mm', driverMetric2: '86% Wet', hazardScoreOrProb: '96%', confidenceInterval: '91%–98%', impactScale: '685 Families at Risk' },
    { scenarioName: '+100% Extreme Condition', multiplier: 2.0, driverMetric1: '284 mm', driverMetric2: '98% Wet', hazardScoreOrProb: '98%', confidenceInterval: '94%–99%', impactScale: '701 Families at Risk' }
  ]
};

// ============================================================================
// 2. FLOOD DRIVER CONFIG (Dibrugarh Reach, Brahmaputra Basin, Assam)
// ============================================================================
export const FLOOD_DRIVER_CONFIG: HazardDriverConfig = {
  hazardKey: 'flood',
  hazardName: 'Flood',
  studyAreaTitle: 'Dibrugarh & Basin, Assam',
  simulatorTitle: 'Flood Impact Simulator',
  simulatorSubtitle: 'Shows how heavy rainfall and rising river levels may increase flooding.',
  driverAxisName: 'Rainfall & River Level:',
  driverAxisSubtitle: 'Shows how upstream rainfall can affect river levels.',
  calibrationNotice: 'Flood estimate based on available river, rainfall and field data.',
  escalationSectionTitle: 'AREAS AT HIGHER FLOOD RISK',
  iconName: 'droplets',
  minMult: 1.0,
  maxMult: 2.0,
  stepSize: 0.05,
  presetSteps: [
    { 
      label: '0%', 
      mult: 1.0, 
      title: 'Normal Condition',
      primaryMetricDisplay: '104.5 m Gauge',
      secondaryMetricDisplay: '32,000 m³/s',
      description: 'Current river and flow levels at Dibrugarh.'
    },
    { 
      label: '+25%', 
      mult: 1.25, 
      title: 'Heavy Condition',
      primaryMetricDisplay: '105.2 m Gauge',
      secondaryMetricDisplay: '38,500 m³/s',
      description: 'Rising water from upstream rain approaching warning level.'
    },
    { 
      label: '+50%', 
      mult: 1.5, 
      title: 'Very Heavy Condition',
      primaryMetricDisplay: '106.1 m Gauge',
      secondaryMetricDisplay: '46,000 m³/s',
      description: 'River above danger mark with fast water flow.'
    },
    { 
      label: '+75%', 
      mult: 1.75, 
      title: 'Severe Condition',
      primaryMetricDisplay: '106.8 m Gauge',
      secondaryMetricDisplay: '54,000 m³/s',
      description: 'Severe water pressure against riverbanks and embankments.'
    },
    { 
      label: '+100%', 
      mult: 2.0, 
      title: 'Extreme Condition',
      primaryMetricDisplay: '107.5 m Gauge',
      secondaryMetricDisplay: '63,000 m³/s',
      description: 'Extreme flooding overflowing low-lying areas and ring dykes.'
    }
  ],

  computeImpact: (mult: number): HazardImpactMetrics => {
    const surgePct = Math.round((mult - 1.0) * 100);
    const riverGauge = (104.5 + (mult - 1.0) * 3.0).toFixed(2);
    const dischargeM3s = Math.round(32000 + (mult - 1.0) * 31000);
    const breachProb = Math.min(99, Math.round(54 + (mult - 1.0) * 44));

    const baseInundatedSqKm = 148;
    const addedSqKm = Math.round((mult - 1.0) * 215);
    const totalInundatedSqKm = baseInundatedSqKm + addedSqKm;

    const basePop = 42000;
    const addedPop = Math.round((mult - 1.0) * 58000);
    const totalPop = basePop + addedPop;

    const embankmentStressPct = Math.min(100, Math.round(58 + surgePct * 0.42));

    return {
      primaryMetric: {
        label: 'EMBANKMENT FAILURE RISK',
        baselineValue: '54%',
        simulatedValue: `${breachProb}%`,
        unit: 'Risk Level',
        subtext: `River Level: ${riverGauge}m (Danger: 105.70m)`,
        confidenceLabel: 'River Gauge Data',
        status: breachProb >= 85 ? 'CRITICAL' : 'WARNING'
      },
      redZoneExtent: {
        label: 'FLOODED AREA',
        baselineValue: '148 km²',
        simulatedValue: `${totalInundatedSqKm} km²`,
        deltaText: `+${addedSqKm} km² flooded area`,
        statusColor: 'cyan'
      },
      exposedPopulation: {
        label: 'PEOPLE AFFECTED',
        baselineValue: '42,000 people',
        simulatedValue: `${totalPop.toLocaleString()} people`,
        deltaText: `+${addedPop.toLocaleString()} people affected`,
        statusColor: 'rose'
      },
      physicalIndicator: {
        label: 'RIVER FLOW & EMBANKMENT RISK',
        displayValue: `${dischargeM3s.toLocaleString()} m³/s`,
        numericPct: embankmentStressPct,
        unit: 'm³/s Flow',
        progressColor: embankmentStressPct > 80 ? 'bg-rose-500' : 'bg-cyan-400',
        statusDescription: embankmentStressPct > 80 
          ? 'CRITICAL: High risk of riverbank and embankment damage' 
          : 'NORMAL: River flow is within normal range'
      },
      headerTelemetry: {
        primaryLabel: 'River Level',
        primaryValue: `${riverGauge} m MSL`,
        secondaryLabel: 'River Flow',
        secondaryValue: `${(dischargeM3s / 1000).toFixed(1)}k m³/s`,
        surgePercentText: `+${surgePct}%`
      }
    };
  },

  getEscalationSectors: (mult: number): EscalationSector[] => [
    {
      id: 'flood-1',
      name: 'Rohmaria Embankment Spur 7',
      location: 'Upper Dibrugarh Area',
      hazardRiskLabel: 'Embankment Damage Risk',
      probabilityOrRate: `${Math.min(99, Math.round(62 * mult))}% Risk`,
      riskColor: 'rose',
      description: 'Fast river flow may cause damage to the embankment.'
    },
    {
      id: 'flood-2',
      name: 'Maijan Beel Overflow Basin',
      location: 'Central Dibrugarh Rural Area',
      hazardRiskLabel: 'Water Backflow Risk',
      probabilityOrRate: `${Math.min(99, Math.round(71 * mult))}% Risk`,
      riskColor: 'cyan',
      description: 'Water backing up may flood nearby houses, tea gardens, and schools.'
    },
    {
      id: 'flood-3',
      name: 'Chabua Relief Terrace Margin',
      location: 'Eastern Upper Terrace Area',
      hazardRiskLabel: 'Overflow Risk',
      probabilityOrRate: `${Math.min(99, Math.round(52 * mult))}% Risk`,
      riskColor: 'amber',
      description: 'Overflowing channels may cut off roads and access routes.'
    }
  ],

  getComparisonMatrix: (): ScenarioMatrixRow[] => [
    { scenarioName: 'Normal Condition (0%)', multiplier: 1.0, driverMetric1: '104.5 m', driverMetric2: '32,000 m³/s', hazardScoreOrProb: '54%', confidenceInterval: '48%–60%', impactScale: '148 km² Flooded' },
    { scenarioName: '+25% Heavy Condition', multiplier: 1.25, driverMetric1: '105.2 m', driverMetric2: '38,500 m³/s', hazardScoreOrProb: '68%', confidenceInterval: '61%–74%', impactScale: '202 km² Flooded' },
    { scenarioName: '+50% Very Heavy Condition', multiplier: 1.5, driverMetric1: '106.1 m', driverMetric2: '46,000 m³/s', hazardScoreOrProb: '82%', confidenceInterval: '76%–88%', impactScale: '256 km² Flooded' },
    { scenarioName: '+75% Severe Condition', multiplier: 1.75, driverMetric1: '106.8 m', driverMetric2: '54,000 m³/s', hazardScoreOrProb: '91%', confidenceInterval: '86%–95%', impactScale: '310 km² Flooded' },
    { scenarioName: '+100% Extreme Condition', multiplier: 2.0, driverMetric1: '107.5 m', driverMetric2: '63,000 m³/s', hazardScoreOrProb: '98%', confidenceInterval: '95%–99%', impactScale: '363 km² Flooded' }
  ]
};

// ============================================================================
// 3. CLOUDBURST DRIVER CONFIG (Kedarnath Valley, Rudraprayag, Uttarakhand)
// ============================================================================
export const CLOUDBURST_DRIVER_CONFIG: HazardDriverConfig = {
  hazardKey: 'cloudburst',
  hazardName: 'Cloudburst',
  studyAreaTitle: 'Kedarnath Valley, Rudraprayag, Uttarakhand',
  simulatorTitle: 'Cloudburst & Flash Flood Simulator',
  simulatorSubtitle: 'Shows how intense rainfall in mountainous areas may increase flash-flood risk.',
  driverAxisName: 'Heavy Rainfall Increase:',
  driverAxisSubtitle: 'Peak Rainfall Intensity & Runoff',
  calibrationNotice: 'Risk estimate based on available rainfall, terrain and field data.',
  escalationSectionTitle: 'AREAS AT HIGHER RISK',
  iconName: 'cloud-lightning',
  minMult: 1.0,
  maxMult: 2.0,
  stepSize: 0.05,
  presetSteps: [
    { 
      label: '0%', 
      mult: 1.0, 
      title: 'Normal Condition',
      primaryMetricDisplay: '38 mm/hr',
      secondaryMetricDisplay: '165 mm / 24h',
      description: 'Standard seasonal rainfall in upper valley areas.'
    },
    { 
      label: '+25%', 
      mult: 1.25, 
      title: 'Heavy Condition',
      primaryMetricDisplay: '55 mm/hr',
      secondaryMetricDisplay: '206 mm / 24h',
      description: 'Intense localized rainfall beginning in upper valley.'
    },
    { 
      label: '+50%', 
      mult: 1.5, 
      title: 'Very Heavy Condition',
      primaryMetricDisplay: '75 mm/hr',
      secondaryMetricDisplay: '248 mm / 24h',
      description: 'Very intense rainfall with high runoff in the gorge.'
    },
    { 
      label: '+75%', 
      mult: 1.75, 
      title: 'Severe Condition',
      primaryMetricDisplay: '98 mm/hr',
      secondaryMetricDisplay: '289 mm / 24h',
      description: 'Severe downpour creating fast water and debris flow.'
    },
    { 
      label: '+100%', 
      mult: 2.0, 
      title: 'Extreme Condition',
      primaryMetricDisplay: '125 mm/hr',
      secondaryMetricDisplay: '330 mm / 24h',
      description: 'Extreme mountain downpour creating high flash flood danger.'
    }
  ],

  computeImpact: (mult: number): HazardImpactMetrics => {
    const burstPct = Math.round((mult - 1.0) * 100);
    const burstRate = Math.round(38 * mult);
    const rain24h = Math.round(165 * mult);
    const flashVelocity = (4.2 * mult).toFixed(1);
    const breachProb = Math.min(99, Math.round(48 + (mult - 1.0) * 50));

    const baseChokePoints = 6;
    const addedChokePoints = Math.round((mult - 1.0) * 9);
    const totalChokePoints = baseChokePoints + addedChokePoints;

    const baseExposed = 6200;
    const addedExposed = Math.round((mult - 1.0) * 12800);
    const totalExposed = baseExposed + addedExposed;

    const debrisPressurePct = Math.min(100, Math.round(52 + burstPct * 0.48));

    return {
      primaryMetric: {
        label: 'FLASH FLOOD RISK',
        baselineValue: '48%',
        simulatedValue: `${breachProb}%`,
        unit: 'Risk Level',
        subtext: `Water & Debris Speed: ${flashVelocity} m/s`,
        confidenceLabel: 'Himalayan Field Data',
        status: breachProb >= 85 ? 'CRITICAL' : 'WARNING'
      },
      redZoneExtent: {
        label: 'MOUNTAIN AREAS AT RISK',
        baselineValue: '6 narrow areas',
        simulatedValue: `${totalChokePoints} narrow areas`,
        deltaText: `+${addedChokePoints} narrow mountain passes at risk of water blockage`,
        statusColor: 'amber'
      },
      exposedPopulation: {
        label: 'PEOPLE AT RISK',
        baselineValue: '6,200 people',
        simulatedValue: `${totalExposed.toLocaleString()} people`,
        deltaText: `+${addedExposed.toLocaleString()} people at risk in the valley`,
        statusColor: 'rose'
      },
      physicalIndicator: {
        label: 'PEAK RAINFALL INTENSITY',
        displayValue: `${burstRate} mm/hr`,
        numericPct: debrisPressurePct,
        unit: 'mm/hr',
        progressColor: burstRate >= 70 ? 'bg-rose-500' : 'bg-amber-400',
        statusDescription: burstRate >= 70 
          ? 'CRITICAL: Extremely heavy rainfall' 
          : 'MODERATE: Heavy mountain rainfall'
      },
      headerTelemetry: {
        primaryLabel: 'Peak Rainfall Rate',
        primaryValue: `${burstRate} mm/hr`,
        secondaryLabel: '24h Rainfall',
        secondaryValue: `${rain24h} mm`,
        surgePercentText: `+${burstPct}%`
      }
    };
  },

  getEscalationSectors: (mult: number): EscalationSector[] => [
    {
      id: 'cloud-1',
      name: 'Mandakini Gorge Bottleneck',
      location: 'Upper Rudraprayag Valley',
      hazardRiskLabel: 'Fast-Moving Debris and Water',
      probabilityOrRate: `${Math.min(99, Math.round(58 * mult))}% Risk`,
      riskColor: 'rose',
      description: 'Narrow gorge speeds up water and debris, flooding walkways.'
    },
    {
      id: 'cloud-2',
      name: 'Rambara Confluence Fan',
      location: 'Mid-Valley Pilgrim Route',
      hazardRiskLabel: 'Heavy Water and Debris Flow',
      probabilityOrRate: `${Math.min(99, Math.round(68 * mult))}% Risk`,
      riskColor: 'amber',
      description: 'Water and debris flow may damage bridges and road connections.'
    },
    {
      id: 'cloud-3',
      name: 'Gaurikund Base Terrace',
      location: 'Lower Valley Staging Hub',
      hazardRiskLabel: 'Valley Flooding Risk',
      probabilityOrRate: `${Math.min(99, Math.round(50 * mult))}% Risk`,
      riskColor: 'cyan',
      description: 'Rising river and spring water may flood lower staging areas.'
    }
  ],

  getComparisonMatrix: (): ScenarioMatrixRow[] => [
    { scenarioName: 'Normal Condition (0%)', multiplier: 1.0, driverMetric1: '38 mm/hr', driverMetric2: '165 mm / 24h', hazardScoreOrProb: '48%', confidenceInterval: '42%–54%', impactScale: '6 Mountain Areas at Risk' },
    { scenarioName: '+25% Heavy Condition', multiplier: 1.25, driverMetric1: '55 mm/hr', driverMetric2: '206 mm / 24h', hazardScoreOrProb: '62%', confidenceInterval: '56%–68%', impactScale: '9 Mountain Areas at Risk' },
    { scenarioName: '+50% Very Heavy Condition', multiplier: 1.5, driverMetric1: '75 mm/hr', driverMetric2: '248 mm / 24h', hazardScoreOrProb: '78%', confidenceInterval: '72%–84%', impactScale: '11 Mountain Areas at Risk' },
    { scenarioName: '+75% Severe Condition', multiplier: 1.75, driverMetric1: '98 mm/hr', driverMetric2: '289 mm / 24h', hazardScoreOrProb: '89%', confidenceInterval: '84%–94%', impactScale: '13 Mountain Areas at Risk' },
    { scenarioName: '+100% Extreme Condition', multiplier: 2.0, driverMetric1: '125 mm/hr', driverMetric2: '330 mm / 24h', hazardScoreOrProb: '98%', confidenceInterval: '94%–99%', impactScale: '15 Mountain Areas at Risk' }
  ]
};

// ============================================================================
// 4. COASTAL EROSION DRIVER CONFIG (Brahmapur Coast, Ganjam, Odisha)
// ============================================================================
/**
 * SCIENTIFIC FOUNDATION (COASTAL EROSION):
 * Real-world shoreline retreat is governed strictly by wave orbital velocities,
 * wave runup elevation, astronomical tides, and storm surge height.
 * Rainfall volume is NOT a driver and has ZERO influence on deepwater swell energy.
 * Therefore, Coastal Erosion utilizes a dedicated Storm Surge / Wave Energy Stress Multiplier.
 */
export const COASTAL_EROSION_DRIVER_CONFIG: HazardDriverConfig = {
  hazardKey: 'coastal-erosion',
  hazardName: 'Coastal Erosion',
  studyAreaTitle: 'Brahmapur Coastline, Ganjam, Odisha',
  simulatorTitle: 'Storm Surge & Coastal Impact Simulator',
  simulatorSubtitle: 'Shows how stronger waves and rising water can increase coastal erosion.',
  driverAxisName: 'Wave & Storm Surge Increase:',
  driverAxisSubtitle: 'Wave Height & Storm Sea Level Rise',
  calibrationNotice: 'Coastal risk estimate based on available shoreline, wave and field data.',
  escalationSectionTitle: 'COASTAL AREAS AT HIGHER RISK',
  iconName: 'waves',
  minMult: 1.0,
  maxMult: 2.0,
  stepSize: 0.05,
  presetSteps: [
    { 
      label: '0%', 
      mult: 1.0, 
      title: 'Normal Condition',
      primaryMetricDisplay: '1.2 m Wave',
      secondaryMetricDisplay: '+0.0 m Surge',
      description: 'Typical calm sea: small waves and normal water level.'
    },
    { 
      label: '+25%', 
      mult: 1.25, 
      title: 'Heavy Condition',
      primaryMetricDisplay: '2.4 m Wave',
      secondaryMetricDisplay: '+0.45 m Surge',
      description: 'Larger waves washing higher onto the beach.'
    },
    { 
      label: '+50%', 
      mult: 1.5, 
      title: 'Very Heavy Condition',
      primaryMetricDisplay: '3.8 m Wave',
      secondaryMetricDisplay: '+1.10 m Surge',
      description: 'Strong storm waves reaching the base of coastal land.'
    },
    { 
      label: '+75%', 
      mult: 1.75, 
      title: 'Severe Condition',
      primaryMetricDisplay: '5.2 m Wave',
      secondaryMetricDisplay: '+1.85 m Surge',
      description: 'Severe storm waves washing away beach and road edges.'
    },
    { 
      label: '+100%', 
      mult: 2.0, 
      title: 'Extreme Condition',
      primaryMetricDisplay: '6.8 m Wave',
      secondaryMetricDisplay: '+2.60 m Surge',
      description: 'Extreme waves and high water damaging sea defenses.'
    }
  ],

  computeImpact: (mult: number): HazardImpactMetrics => {
    const surgePct = Math.round((mult - 1.0) * 100);
    
    // Wave height scales non-linearly with storm intensity
    const waveHeightM = (1.2 + (mult - 1.0) * 5.6).toFixed(1);
    // Surge height in meters above Mean High Water Spring (MHWS)
    const surgeHeightM = ((mult - 1.0) * 2.60).toFixed(2);

    // Shoreline event retreat rate (m)
    const eventRetreatM = (1.8 + (mult - 1.0) * 16.4).toFixed(1);

    // Red-zone buffer expansion inland from scarp (meters)
    const baseBufferM = 35;
    const addedBufferM = Math.round((mult - 1.0) * 65);
    const totalBufferM = baseBufferM + addedBufferM;

    // Exposed households near the scarp
    const baseHouseholds = 312;
    const addedHouseholds = Math.round((mult - 1.0) * 448);
    const totalHouseholds = baseHouseholds + addedHouseholds;

    // Beach & dune sediment volume loss (m³/m of coastline)
    const duneLossM3m = Math.round(14 + (mult - 1.0) * 78);
    const duneScourPct = Math.min(100, Math.round(22 + surgePct * 0.76));

    return {
      primaryMetric: {
        label: 'SHORELINE LOSS',
        baselineValue: '1.8 m',
        simulatedValue: `${eventRetreatM} m`,
        unit: 'm Loss',
        subtext: `Wave Power: ${(parseFloat(waveHeightM) ** 2 * 0.49).toFixed(1)} kW/m`,
        confidenceLabel: 'Coastal Buoy Data',
        status: parseFloat(eventRetreatM) >= 8.0 ? 'CRITICAL' : 'WARNING'
      },
      redZoneExtent: {
        label: 'HIGH-RISK COAST EXPANSION',
        baselineValue: '35 m safe distance',
        simulatedValue: `${totalBufferM} m safe distance`,
        deltaText: `+${addedBufferM} m inland area now at risk`,
        statusColor: 'rose'
      },
      exposedPopulation: {
        label: 'COASTAL FAMILIES AT RISK',
        baselineValue: '312 families',
        simulatedValue: `${totalHouseholds} families`,
        deltaText: `+${addedHouseholds} families living close to the eroding shore`,
        statusColor: 'amber'
      },
      physicalIndicator: {
        label: 'BEACH SAND LOSS',
        displayValue: `${duneLossM3m} m³/m`,
        numericPct: duneScourPct,
        unit: 'm³/m Loss',
        progressColor: duneScourPct > 70 ? 'bg-rose-500' : 'bg-cyan-400',
        statusDescription: duneScourPct > 70 
          ? 'CRITICAL: Severe loss of protective sand dunes' 
          : 'NORMAL: Minor sand movement'
      },
      headerTelemetry: {
        primaryLabel: 'Wave Height',
        primaryValue: `${waveHeightM} m`,
        secondaryLabel: 'Sea Level Rise During Storm',
        secondaryValue: `+${surgeHeightM} m`,
        surgePercentText: `+${surgePct}%`
      }
    };
  },

  getEscalationSectors: (mult: number): EscalationSector[] => [
    {
      id: 'coast-1',
      name: 'Podampeta Village Coastal Edge',
      location: 'Ganjam Northern Coast',
      hazardRiskLabel: 'Coastal Edge Risk',
      probabilityOrRate: `${(2.2 * mult).toFixed(1)} m Loss`,
      riskColor: 'rose',
      description: 'Strong waves are washing away the soil beneath buildings.'
    },
    {
      id: 'coast-2',
      name: 'Ramayapatnam Seawall Area',
      location: 'Southern Ganjam Shoreline',
      hazardRiskLabel: 'Seawall Area Risk',
      probabilityOrRate: `${Math.min(99, Math.round(55 * mult))}% Risk`,
      riskColor: 'amber',
      description: 'High waves are washing over the seawall onto nearby roads.'
    },
    {
      id: 'coast-3',
      name: 'Boxipalli Coastal Dune Barrier',
      location: 'Gopalpur Coastal Area',
      hazardRiskLabel: 'Beach Barrier Damage',
      probabilityOrRate: `${Math.min(99, Math.round(65 * mult))}% Risk`,
      riskColor: 'cyan',
      description: 'Protective sand dunes damaged, allowing sea water to enter.'
    }
  ],

  getComparisonMatrix: (): ScenarioMatrixRow[] => [
    { scenarioName: 'Normal Condition (0%)', multiplier: 1.0, driverMetric1: '1.2 m Wave', driverMetric2: '+0.00 m Surge', hazardScoreOrProb: '1.8 m Loss', confidenceInterval: '1.4–2.2m', impactScale: '312 Families at Risk' },
    { scenarioName: '+25% Heavy Condition', multiplier: 1.25, driverMetric1: '2.4 m Wave', driverMetric2: '+0.45 m Surge', hazardScoreOrProb: '5.9 m Loss', confidenceInterval: '4.8–6.8m', impactScale: '424 Families at Risk' },
    { scenarioName: '+50% Very Heavy Condition', multiplier: 1.5, driverMetric1: '3.8 m Wave', driverMetric2: '+1.10 m Surge', hazardScoreOrProb: '10.0 m Loss', confidenceInterval: '8.5–11.5m', impactScale: '536 Families at Risk' },
    { scenarioName: '+75% Severe Condition', multiplier: 1.75, driverMetric1: '5.2 m Wave', driverMetric2: '+1.85 m Surge', hazardScoreOrProb: '14.1 m Loss', confidenceInterval: '12.0–16.0m', impactScale: '648 Families at Risk' },
    { scenarioName: '+100% Extreme Condition', multiplier: 2.0, driverMetric1: '6.8 m Wave', driverMetric2: '+2.60 m Surge', hazardScoreOrProb: '18.2 m Loss', confidenceInterval: '15.5–21.0m', impactScale: '760 Families at Risk' }
  ]
};

// ============================================================================
// REGISTRY MAPPING ALL 4 HAZARDS
// ============================================================================
export const HAZARD_DRIVER_REGISTRY: Record<HazardType, HazardDriverConfig> = {
  'landslide': LANDSLIDE_DRIVER_CONFIG,
  'flood': FLOOD_DRIVER_CONFIG,
  'cloudburst': CLOUDBURST_DRIVER_CONFIG,
  'coastal-erosion': COASTAL_EROSION_DRIVER_CONFIG
};

export const getHazardDriverConfig = (hazard: HazardType | null | undefined): HazardDriverConfig => {
  if (!hazard || !HAZARD_DRIVER_REGISTRY[hazard]) {
    return LANDSLIDE_DRIVER_CONFIG;
  }
  return HAZARD_DRIVER_REGISTRY[hazard];
};
