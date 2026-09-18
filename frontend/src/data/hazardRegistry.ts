import { HazardType } from '../types';
import { AREA_HAZARD_REGISTRY } from './areaHazardProfiles';
import { 
  DIBRUGARH_REVENUE_CIRCLES, 
  DIBRUGARH_VULNERABLE_VILLAGES, 
  DIBRUGARH_SAFE_DESTINATIONS,
  IFI_HISTORICAL_MILESTONES,
  ASSAM_DISASTER_FINANCING_ECOSYSTEM 
} from './assamFloodData';
import { 
  UTTARAKHAND_HOTSPOTS, 
  FAMOUS_DISASTER_BACKTESTS, 
  METEOROLOGICAL_FEATURE_IMPORTANCE, 
  SAFE_STAGING_DESTINATIONS 
} from './uttarakhandCloudburstData';
import { 
  COASTAL_TRANSECTS, 
  VULNERABLE_COASTAL_HABITATIONS, 
  COASTAL_SUMMARY_METRICS 
} from './coastalErosionData';

export interface EvacuationRosterItem {
  id: string;
  name: string;
  zone: string;
  population: number;
  families: number;
  rpiScore: number;
  urgency: 'P1 - IMMEDIATE' | 'P2 - HIGH' | 'P3 - MEDIUM' | 'P4 - MONITOR';
  primaryHazard: string;
  assignedDestination: string;
  distanceKm: number;
  coordinates: [number, number];
}

export interface SafeDestinationItem {
  id: string;
  name: string;
  location: string;
  elevationMeters: number;
  ccasScore: number;
  capacityPersons: number;
  availableCapacity: number;
  waterLitersPerDay: number;
  waterPerPersonDay: number;
  toiletsAvailable: number;
  medicalDoctors: number;
  triageBeds: number;
  transitCorridor: string;
  transitMins: number;
  hazardClearance: 'SAFE' | 'CLEAR' | 'MONITORED';
  coordinates: [number, number];
  rank?: number;
  rankLabel?: string;
  bayesianSafetyProb?: number;
  xgboostStabilityScore?: number;
  slopeDeg?: number;
  distanceKm?: number;
  fastestRouteBadge?: string;
  routeWaypoints?: [number, number][];
}

export interface RelocationMatrixItem {
  origin: string;
  destination: string;
  persons: number;
  families: number;
  priority: string;
  route: string;
  distanceKm: number;
  transitTimeMins: number;
  busesRequired: number;
  ambulancesRequired: number;
  status: 'READY' | 'DISPATCHED' | 'STANDBY';
}

export interface ResourceGapItem {
  resource: string;
  unit: string;
  required: number;
  available: number;
  coveragePct: number;
  deficit: number;
  status: 'SUFFICIENT' | 'DEFICIT' | 'CRITICAL';
}

export interface AuthorityActionItem {
  code: 'EVACUATE' | 'RELOCATE' | 'ALERT' | 'DISPATCH' | 'VERIFY' | 'MONITOR';
  title: string;
  description: string;
  assignedTo: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'ROUTINE';
  status: 'PENDING' | 'DISPATCHED' | 'ACKNOWLEDGED' | 'COMPLETED' | 'READY' | 'EXECUTED' | 'STANDBY';
  actionPrompt: string;
}

export interface DisasterIncidentReport {
  incidentId: string;
  incidentTitle: string;
  hazard: HazardType;
  hazardLabel: string;
  location: string;
  district: string;
  state: string;
  coordinates: [number, number];
  timestamp: string;
  classification: string;
  threatLevel: string;
  leadAgency: string;
  commandingOfficer: string;
  summaryText: string;
  triggers: string[];
  metricsSummary: {
    totalExposedPop: number;
    immediateEvacuees: number;
    familiesAtRisk: number;
    peakSeverityScore: number;
    safeHoldingCapacity: number;
  };
  damageLedger: Array<{ item: string; qty: string; status: string }>;
  topHabitations: Array<{ name: string; pax: number; rpi: number; urgency: string; destination: string }>;
  safeHub: {
    name: string;
    capacity: number;
    ccasScore: number;
    waterLitersPerDay: number;
    route: string;
  };
  resourceGaps: ResourceGapItem[];
  dispatchedActions: Array<{ action: string; target: string; status: string; timestamp: string }>;
  signoff: {
    officerName: string;
    role: string;
    agency: string;
    dispatchStatus: string;
  };
}

export interface HazardOperationalProfile {
  id: HazardType;
  name: string;
  hazardTypeTitle: string;
  studyLocation: string;
  state: string;
  district: string;
  tagline: string;
  description: string;
  statusBadge: string;
  provenance: string;
  themeColor: {
    primary: string;
    border: string;
    bg: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  };
  defaultCenter: [number, number];
  defaultZoom: number;
  kpis: Array<{ label: string; value: string; sub: string; alert?: boolean }>;
  redZone: {
    name: string;
    riskScore: string;
    severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
    affectedPop: string;
    immediateFamilies: string;
    primaryHazard: string;
    actionRequired: string;
    coordinates: [number, number];
    radiusMeters?: number;
  };
  evacuationRoster: EvacuationRosterItem[];
  safeDestinations: SafeDestinationItem[];
  relocationMatrix: RelocationMatrixItem[];
  resourceGaps: ResourceGapItem[];
  authorityActions: AuthorityActionItem[];
  incidentReport: DisasterIncidentReport;
}

// -------------------------------------------------------------
// 1. LANDSLIDE OPERATIONAL PROFILE (MEPPADI, WAYANAD, KERALA)
// -------------------------------------------------------------
const LANDSLIDE_PROFILE: HazardOperationalProfile = {
  id: 'landslide',
  name: 'Landslide',
  hazardTypeTitle: 'LANDSLIDE COMMAND CENTER',
  studyLocation: 'Meppadi, Wayanad',
  state: 'Kerala',
  district: 'Wayanad',
  tagline: 'Debris Flow & Slope Liquefaction Decision System',
  description: 'Grounded in SRTM 30m DEM, Mohr-Coulomb Factor of Safety, and Bayesian updating across 38.5° scarps in Chembra peak watershed.',
  statusBadge: '● DEM & SENSOR CALIBRATED',
  provenance: 'Kerala SDMA / Geological Survey of India / SRTM DEM 31,501 points',
  themeColor: {
    primary: 'emerald',
    border: 'border-emerald-500/40',
    bg: 'bg-[#0B1511]',
    text: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-300'
  },
  defaultCenter: [11.585, 76.085],
  defaultZoom: 11,
  kpis: [
    { label: 'Primary Threat', value: 'Catastrophic Debris Flow', sub: 'Chembra Peak Scarp (38.5°)', alert: true },
    { label: 'Exposed Population', value: '4,800 People', sub: '250 Vulnerable Families', alert: true },
    { label: 'Bayesian Risk Probability', value: '94.0%', sub: '24h Rain: 284.5 mm (FoS 0.82)', alert: true },
    { label: 'Safe Resettlement Cap.', value: '2,200 People', sub: 'Kalpetta-Vythiri Institutional Hub' },
    { label: 'Active Red Zone', value: 'Meppadi / Mundakkai', sub: '100% Critical Liquefaction', alert: true },
    { label: 'Twilio Escalation', value: 'Level 3 Red Alert', sub: 'Automated Voice Tree Ready' }
  ],
  redZone: {
    name: 'MEPPADI / MUNDAKKAI SCARP AXIS',
    riskScore: '84.5 / 100',
    severity: 'CRITICAL',
    affectedPop: '4,800 Persons',
    immediateFamilies: '250 Families',
    primaryHazard: 'Catastrophic Debris Flow & Regolith Liquefaction under 284.5mm Monsoon Deluge',
    actionRequired: 'Mandatory immediate physical evacuation via Chundale-NH-766 highway corridor to Kalpetta-Vythiri Safe Zone.',
    coordinates: [11.540, 76.138],
    radiusMeters: 1700
  },
  evacuationRoster: [
    {
      id: 'WYD-HAB-01',
      name: 'Chooralmala Town & Stream Bank',
      zone: 'Meppadi Sector 1',
      population: 1850,
      families: 95,
      rpiScore: 95.4,
      urgency: 'P1 - IMMEDIATE',
      primaryHazard: 'Bridge collapse & active stream surge',
      assignedDestination: 'Kalpetta-Vythiri Institutional Reserve',
      distanceKm: 14.8,
      coordinates: [11.542, 76.136]
    },
    {
      id: 'WYD-HAB-02',
      name: 'Mundakkai Upper Debris Zone',
      zone: 'Meppadi Sector 2',
      population: 1200,
      families: 65,
      rpiScore: 94.2,
      urgency: 'P1 - IMMEDIATE',
      primaryHazard: 'Upper scarp liquefaction initiation',
      assignedDestination: 'Kalpetta-Vythiri Institutional Reserve',
      distanceKm: 16.2,
      coordinates: [11.535, 76.145]
    },
    {
      id: 'WYD-HAB-03',
      name: 'Attamala Settlement Buffer',
      zone: 'Meppadi Sector 3',
      population: 750,
      families: 40,
      rpiScore: 88.6,
      urgency: 'P1 - IMMEDIATE',
      primaryHazard: 'Isolated ridge road slip',
      assignedDestination: 'Kalpetta-Vythiri Institutional Reserve',
      distanceKm: 18.0,
      coordinates: [11.528, 76.155]
    },
    {
      id: 'WYD-HAB-04',
      name: 'Punchirimattam Scarp Edge',
      zone: 'Meppadi Sector 4',
      population: 600,
      families: 30,
      rpiScore: 84.1,
      urgency: 'P2 - HIGH',
      primaryHazard: 'Regolith saturation & slope tension cracks',
      assignedDestination: 'Meppadi Secondary Safe Ridge',
      distanceKm: 9.5,
      coordinates: [11.551, 76.115]
    },
    {
      id: 'WYD-HAB-05',
      name: 'Vellarmala School Ridge',
      zone: 'Meppadi Sector 5',
      population: 400,
      families: 20,
      rpiScore: 78.4,
      urgency: 'P2 - HIGH',
      primaryHazard: 'Flash mud slurry ingress',
      assignedDestination: 'Meppadi Secondary Safe Ridge',
      distanceKm: 11.2,
      coordinates: [11.560, 76.122]
    }
  ],
  safeDestinations: [
    {
      id: 'KL-WYD-S01',
      name: 'Kalpetta-Vythiri Institutional Reserve',
      location: 'Kalpetta Safe Buffer Zone D',
      elevationMeters: 780,
      ccasScore: 93.4,
      capacityPersons: 2200,
      availableCapacity: 1850,
      waterLitersPerDay: 165000,
      waterPerPersonDay: 75,
      toiletsAvailable: 110,
      medicalDoctors: 14,
      triageBeds: 60,
      transitCorridor: 'Chundale–NH-766 4-Lane Protected Arterial',
      transitMins: 28,
      distanceKm: 14.8,
      hazardClearance: 'SAFE',
      coordinates: [11.602, 76.082],
      rank: 1,
      rankLabel: '★ #1 RECOMMENDED',
      bayesianSafetyProb: 98.0,
      xgboostStabilityScore: 97.4,
      slopeDeg: 3.8,
      fastestRouteBadge: '★ PRIMARY FAST HIGHWAY CORRIDOR (NH-766 4-LANE • 28 MINS)',
      routeWaypoints: [
        [11.540, 76.138],
        [11.558, 76.118],
        [11.578, 76.098],
        [11.592, 76.088],
        [11.602, 76.082]
      ]
    },
    {
      id: 'KL-WYD-S02',
      name: 'Kuppadithara North Plateau',
      location: 'Kuppadithara Safe Zone A',
      elevationMeters: 745,
      ccasScore: 90.2,
      capacityPersons: 1680,
      availableCapacity: 1450,
      waterLitersPerDay: 125000,
      waterPerPersonDay: 74,
      toiletsAvailable: 85,
      medicalDoctors: 8,
      triageBeds: 35,
      transitCorridor: 'State Highway 54 (SH-54) Elevated Highland Spur',
      transitMins: 34,
      distanceKm: 18.2,
      hazardClearance: 'SAFE',
      coordinates: [11.665, 76.012],
      rank: 2,
      rankLabel: '#2 ALTERNATIVE',
      bayesianSafetyProb: 97.0,
      xgboostStabilityScore: 94.8,
      slopeDeg: 4.6,
      fastestRouteBadge: 'HIGHLAND AGRICULTURAL BUFFER (420 FAMILIES)',
      routeWaypoints: [
        [11.540, 76.138],
        [11.585, 76.092],
        [11.625, 76.045],
        [11.665, 76.012]
      ]
    },
    {
      id: 'KL-WYD-S03',
      name: 'Kottathara Valley South Safe Buffer',
      location: 'Kottathara Safe Zone B',
      elevationMeters: 730,
      ccasScore: 87.5,
      capacityPersons: 1280,
      availableCapacity: 1120,
      waterLitersPerDay: 92000,
      waterPerPersonDay: 72,
      toiletsAvailable: 58,
      medicalDoctors: 6,
      triageBeds: 25,
      transitCorridor: 'Panchayat Double-Lane Elevated Bypass (28m above Kabini river)',
      transitMins: 38,
      distanceKm: 21.4,
      hazardClearance: 'CLEAR',
      coordinates: [11.678, 76.042],
      rank: 3,
      rankLabel: '#3 RESERVE',
      bayesianSafetyProb: 95.0,
      xgboostStabilityScore: 91.2,
      slopeDeg: 5.2,
      fastestRouteBadge: 'ELEVATED RIVER TERRACE BUFFER (320 FAMILIES)',
      routeWaypoints: [
        [11.540, 76.138],
        [11.585, 76.092],
        [11.632, 76.068],
        [11.678, 76.042]
      ]
    },
    {
      id: 'KL-WYD-S04',
      name: 'Achoor East Ridgeline Foothill',
      location: 'Achooranam Safe Zone C',
      elevationMeters: 760,
      ccasScore: 83.6,
      capacityPersons: 1000,
      availableCapacity: 850,
      waterLitersPerDay: 74000,
      waterPerPersonDay: 74,
      toiletsAvailable: 46,
      medicalDoctors: 4,
      triageBeds: 18,
      transitCorridor: 'SH-59 / Pozhuthana Arterial Bypass',
      transitMins: 24,
      distanceKm: 12.6,
      hazardClearance: 'CLEAR',
      coordinates: [11.598, 76.025],
      rank: 4,
      rankLabel: '#4 RAPID STAGING',
      bayesianSafetyProb: 93.0,
      xgboostStabilityScore: 88.5,
      slopeDeg: 6.8,
      fastestRouteBadge: '⚡ SHORTEST DISTANCE & FASTEST RAPID ACCESS (12.6 km • 24 mins)',
      routeWaypoints: [
        [11.540, 76.138],
        [11.552, 76.095],
        [11.585, 76.055],
        [11.598, 76.025]
      ]
    }
  ],
  relocationMatrix: [
    {
      origin: 'Chooralmala (Sector 1)',
      destination: 'Kalpetta-Vythiri Institutional Reserve',
      persons: 1850,
      families: 95,
      priority: 'P1 — IMMEDIATE',
      route: 'NH-766 Chundale Convoy Spur (Dual-Lane)',
      distanceKm: 14.8,
      transitTimeMins: 28,
      busesRequired: 37,
      ambulancesRequired: 4,
      status: 'READY'
    },
    {
      origin: 'Mundakkai (Sector 2)',
      destination: 'Kalpetta-Vythiri Institutional Reserve',
      persons: 1200,
      families: 65,
      priority: 'P1 — IMMEDIATE',
      route: 'Meppadi–Vythiri Protected Spine',
      distanceKm: 16.2,
      transitTimeMins: 32,
      busesRequired: 24,
      ambulancesRequired: 3,
      status: 'READY'
    },
    {
      origin: 'Punchirimattam (Sector 4)',
      destination: 'Achoor East Ridgeline Foothill',
      persons: 600,
      families: 30,
      priority: 'P1 — RAPID TRANSIT',
      route: 'SH-59 Pozhuthana Rapid Access Spur',
      distanceKm: 12.6,
      transitTimeMins: 24,
      busesRequired: 12,
      ambulancesRequired: 2,
      status: 'READY'
    },
    {
      origin: 'Attamala & Vellarmala (Sector 3 & 5)',
      destination: 'Kuppadithara North Plateau',
      persons: 1150,
      families: 60,
      priority: 'P2 — HIGH',
      route: 'SH-54 Elevated Highland Corridor',
      distanceKm: 18.2,
      transitTimeMins: 34,
      busesRequired: 23,
      ambulancesRequired: 3,
      status: 'STANDBY'
    }
  ],
  resourceGaps: [
    { resource: 'Drinking Water (Potable)', unit: 'Liters/Day', required: 154000, available: 165000, coveragePct: 107.1, deficit: 0, status: 'SUFFICIENT' },
    { resource: 'Emergency Toilets', unit: 'Units (1 per 20 persons)', required: 110, available: 110, coveragePct: 100.0, deficit: 0, status: 'SUFFICIENT' },
    { resource: 'Medical Doctors / Triage', unit: 'Personnel', required: 16, available: 14, coveragePct: 87.5, deficit: 2, status: 'DEFICIT' },
    { resource: 'Ambulances on Standby', unit: 'Vehicles', required: 8, available: 6, coveragePct: 75.0, deficit: 2, status: 'DEFICIT' },
    { resource: 'Covered Shelter Space', unit: 'sq. meters', required: 7700, available: 8200, coveragePct: 106.5, deficit: 0, status: 'SUFFICIENT' }
  ],
  authorityActions: [
    { code: 'EVACUATE', title: 'Issue Mandatory Evacuation Order', description: 'Immediate evacuation of 250 families from Chooralmala & Mundakkai active scarp.', assignedTo: 'DDMA Wayanad / Kerala Police', urgency: 'IMMEDIATE', status: 'DISPATCHED', actionPrompt: 'Execute Section 30 Disaster Management Act mandatory evacuation.' },
    { code: 'RELOCATE', title: 'Deploy Relocation Convoys', description: '37 KSRTC buses and 4 ambulances to stage at Meppadi junction for Kalpetta transit.', assignedTo: 'District Transport Officer', urgency: 'IMMEDIATE', status: 'READY', actionPrompt: 'Initiate convoy dispatch via NH-766 corridor.' },
    { code: 'ALERT', title: 'Twilio Multi-Channel Voice Escalation', description: 'Deliver automated voice broadcasts in Malayalam & English to village liaison heads.', assignedTo: 'SDMA Control Room', urgency: 'IMMEDIATE', status: 'ACKNOWLEDGED', actionPrompt: 'Trigger pre-recorded Malayalam Red Alert broadcast.' },
    { code: 'DISPATCH', title: 'Position NDRF / Fire & Rescue Units', description: '2 NDRF teams with drone thermal sensors at Chooralmala bridge crossing.', assignedTo: 'NDRF 04 Battalion', urgency: 'HIGH', status: 'DISPATCHED', actionPrompt: 'Station rescue squads outside 38.5° runout path.' },
    { code: 'VERIFY', title: 'Confirm Pore Pressure Gauge Reading', description: 'Inspect automated rain gauge and piezometer readings at Chembra upper scarp.', assignedTo: 'GSI Geotechnical Cell', urgency: 'HIGH', status: 'PENDING', actionPrompt: 'Cross-check sensor telemetry with satellite soil moisture.' },
    { code: 'MONITOR', title: '15-Minute Telemetry Cycle', description: 'Continuously stream rain gauge rates with 200 mm / 24h critical cut-off threshold.', assignedTo: 'State EOC Hydrology Desk', urgency: 'ROUTINE', status: 'PENDING', actionPrompt: 'Activate 15-minute radar telemetry surveillance.' }
  ],
  incidentReport: {
    incidentId: 'INC-2024-WYD-001',
    incidentTitle: 'Meppadi-Wayanad Catastrophic Slope Liquefaction & Debris Surge',
    hazard: 'landslide',
    hazardLabel: 'Landslide',
    location: 'Meppadi / Chooralmala / Mundakkai',
    district: 'Wayanad',
    state: 'Kerala',
    coordinates: [11.554, 76.128],
    timestamp: '2024-07-30T02:15:00Z',
    classification: 'Level 3 Severe Catastrophic Geological Disaster',
    threatLevel: 'RED ALERT (CRITICAL RISK)',
    leadAgency: 'Kerala State Disaster Management Authority (KSDMA)',
    commandingOfficer: 'Dr. K. S. Rajendran, Operations Chief',
    summaryText: 'Catastrophic debris avalanche initiated across 38.5° mountain scarps above Mundakkai following 284.5 mm torrential monsoon precipitation. Hydrostatic saturation caused sudden regolith liquefaction, generating extreme velocity mud slurry down the Iruvanjippuzha drainage basin and destroying arterial bridges.',
    triggers: [
      '284.5 mm antecedent rainfall in 24 hours (Historical 99th percentile)',
      'Slope gradient exceeding critical friction angle (38.5° vs 31° Mohr-Coulomb threshold)',
      'Regolith pore-water saturation reaching 98% (Factor of Safety dropped to 0.82)'
    ],
    metricsSummary: {
      totalExposedPop: 4800,
      immediateEvacuees: 2200,
      familiesAtRisk: 250,
      peakSeverityScore: 84.5,
      safeHoldingCapacity: 2200
    },
    damageLedger: [
      { item: 'Chooralmala Primary Bridge', qty: '1 complete structure', status: 'Severed by debris slurry' },
      { item: 'Residential Habitations', qty: '250 parcels', status: 'Direct mudflow inundation' },
      { item: 'SH-59 Highway Access Cut', qty: '3.2 km stretch', status: 'Blocked by boulder slip' },
      { item: 'Electrical Distribution Line', qty: '11 kV Feeder', status: 'De-energized for public safety' }
    ],
    topHabitations: [
      { name: 'Chooralmala Town', pax: 1850, rpi: 95.4, urgency: 'P1 - IMMEDIATE', destination: 'Kalpetta-Vythiri Institutional Reserve' },
      { name: 'Mundakkai Debris Corridor', pax: 1200, rpi: 94.2, urgency: 'P1 - IMMEDIATE', destination: 'Kalpetta-Vythiri Institutional Reserve' },
      { name: 'Attamala Settlement', pax: 750, rpi: 88.6, urgency: 'P1 - IMMEDIATE', destination: 'Kalpetta-Vythiri Institutional Reserve' }
    ],
    safeHub: {
      name: 'Kalpetta-Vythiri Institutional Reserve (Safe Zone D)',
      capacity: 2200,
      ccasScore: 93.4,
      waterLitersPerDay: 165000,
      route: 'Chundale–NH-766 Protected Highway Corridor (14.8 km, 28 min convoy)'
    },
    resourceGaps: [
      { resource: 'Drinking Water (Potable)', unit: 'Liters/Day', required: 154000, available: 165000, coveragePct: 107.1, deficit: 0, status: 'SUFFICIENT' },
      { resource: 'Emergency Toilets', unit: 'Units (1 per 20 persons)', required: 110, available: 110, coveragePct: 100.0, deficit: 0, status: 'SUFFICIENT' },
      { resource: 'Medical Doctors / Triage', unit: 'Personnel', required: 16, available: 14, coveragePct: 87.5, deficit: 2, status: 'DEFICIT' },
      { resource: 'Ambulances on Standby', unit: 'Vehicles', required: 8, available: 6, coveragePct: 75.0, deficit: 2, status: 'DEFICIT' }
    ],
    dispatchedActions: [
      { action: 'Mandatory Section 30 Evacuation Order', target: 'Chooralmala & Mundakkai', status: 'EXECUTED', timestamp: '03:00 IST' },
      { action: 'KSRTC Evacuation Fleet Dispatch (37 Buses)', target: 'Meppadi Junction', status: 'IN_TRANSIT', timestamp: '03:45 IST' },
      { action: 'Automated Twilio Red Alert Broadcast', target: '18 Local Panchayat Chiefs', status: 'DELIVERED', timestamp: '04:00 IST' }
    ],
    signoff: {
      officerName: 'Dr. K. S. Rajendran',
      role: 'State Operations Chief & Incident Commander',
      agency: 'Kerala State Disaster Management Authority (KSDMA)',
      dispatchStatus: 'ACTIVE STATE DISASTER RESPONSE IN PROGRESS'
    }
  }
};

// -------------------------------------------------------------
// 2. FLOOD OPERATIONAL PROFILE (DIBRUGARH, ASSAM)
// -------------------------------------------------------------
const FLOOD_PROFILE: HazardOperationalProfile = {
  id: 'flood',
  name: 'Flood',
  hazardTypeTitle: 'FLOOD INTELLIGENCE & SMART RELOCATION',
  studyLocation: 'Dibrugarh District',
  state: 'Assam',
  district: 'Dibrugarh',
  tagline: 'Brahmaputra Basin Multi-Criteria Inundation Decision System',
  description: 'Grounded in Kopili River Basin MCA methodology, 53-Year IIT Delhi India Flood Inventory (IFI v3.0), and ASDMA DRIMS/SDRF public financing.',
  statusBadge: '● IIT DELHI IFI & ASDMA GROUNDING',
  provenance: 'IIT Delhi HydroSense Lab / ASDMA DRIMS / ISRO Bhuvan Satellite SAR',
  themeColor: {
    primary: 'blue',
    border: 'border-blue-500/40',
    bg: 'bg-[#0A1322]',
    text: 'text-blue-400',
    badgeBg: 'bg-blue-950/80',
    badgeText: 'text-blue-300'
  },
  defaultCenter: [27.4728, 94.9120],
  defaultZoom: 10,
  kpis: [
    { label: 'Primary Threat', value: 'Brahmaputra Embankment Breach', sub: 'Chabua & Dibrugarh West', alert: true },
    { label: 'Exposed Population', value: '412,571 People', sub: 'Peak 2022 Displacement: 188,381', alert: true },
    { label: 'Historical Registry', value: '155 Recorded Floods', sub: '53 Years (1971–2023 IIT Delhi IFI)' },
    { label: 'Safe Inland Capacity', value: '18,500 People', sub: '6 Vetted Safe Campuses (CCAS 92.4)' },
    { label: 'Public SDRF Financing', value: '₹211.34 Cr Tenders', sub: '₹109.67 Cr Sanctioned' },
    { label: 'Submerged Crop Area', value: '20,246 Hectares', sub: '493,413 Livestock Affected', alert: true }
  ],
  redZone: {
    name: 'CHABUA & DIBRUGARH WEST RIVERINE BELT',
    riskScore: '84.6 / 100',
    severity: 'CRITICAL',
    affectedPop: '357,196 Persons',
    immediateFamilies: '78,400 Households',
    primaryHazard: 'Braided Brahmaputra Channel Bank Cut & Ring Embankment Breaches at Maijan',
    actionRequired: 'Pre-emptive evacuation of river sandbar island settlements (Multi Chapari & Dikom Naharani) to Barbaruah Safe Campus.',
    coordinates: [27.5300, 95.0200],
    radiusMeters: 2800
  },
  evacuationRoster: DIBRUGARH_VULNERABLE_VILLAGES.map((hab: any) => ({
    id: hab.id,
    name: hab.village_name,
    zone: hab.revenue_circle,
    population: hab.population,
    families: hab.households,
    rpiScore: hab.rpi_score,
    urgency: hab.urgency || 'P1 - IMMEDIATE',
    primaryHazard: hab.primary_hazard,
    assignedDestination: hab.assigned_safe_site_id === 'SAFE-DIB-01' ? 'Barbaruah Higher Secondary Campus' : hab.assigned_safe_site_id === 'SAFE-DIB-02' ? 'Panitola Central Hub' : 'Chabua Relocation Ridge',
    distanceKm: hab.distance_km || 5.0,
    coordinates: [hab.lat, hab.lon]
  })),
  safeDestinations: DIBRUGARH_SAFE_DESTINATIONS.map((site: any) => ({
    id: site.site_id,
    name: site.name,
    location: `${site.revenue_circle}, Dibrugarh`,
    elevationMeters: site.elevation_m,
    ccasScore: site.ccas_score,
    capacityPersons: site.total_capacity_persons,
    availableCapacity: site.available_capacity,
    waterLitersPerDay: site.water_capacity_lpd,
    waterPerPersonDay: Math.round(site.water_capacity_lpd / site.total_capacity_persons),
    toiletsAvailable: site.latrines_count,
    medicalDoctors: 6,
    triageBeds: 28,
    transitCorridor: site.road_access,
    transitMins: 20,
    hazardClearance: 'SAFE',
    coordinates: [site.lat, site.lon]
  })),
  relocationMatrix: [
    {
      origin: 'Multi Chapari (River Island)',
      destination: 'Barbaruah Higher Secondary Campus',
      persons: 1850,
      families: 420,
      priority: 'P1 — IMMEDIATE',
      route: 'NH-37 Barbaruah Protected Arterial Corridor',
      distanceKm: 6.8,
      transitTimeMins: 16,
      busesRequired: 38,
      ambulancesRequired: 4,
      status: 'READY'
    },
    {
      origin: 'Dikom Naharani (River Bank)',
      destination: 'Panitola Central Vocational Hub',
      persons: 2340,
      families: 510,
      priority: 'P1 — IMMEDIATE',
      route: 'AT Road Highway Transit Spur',
      distanceKm: 7.4,
      transitTimeMins: 18,
      busesRequired: 47,
      ambulancesRequired: 5,
      status: 'READY'
    }
  ],
  resourceGaps: [
    { resource: 'Potable Drinking Water', unit: 'Liters/Day', required: 28879970, available: 1385000, coveragePct: 4.8, deficit: 27494970, status: 'CRITICAL' },
    { resource: 'Emergency Shelter Space', unit: 'Campuses', required: 42, available: 6, coveragePct: 14.3, deficit: 36, status: 'CRITICAL' },
    { resource: 'SDRF Rescue Inflatable Boats', unit: 'Boats', required: 48, available: 22, coveragePct: 45.8, deficit: 26, status: 'DEFICIT' },
    { resource: 'Mobile Water Purification Units', unit: 'Units', required: 15, available: 8, coveragePct: 53.3, deficit: 7, status: 'DEFICIT' },
    { resource: 'Livestock Fodder Rations', unit: 'Tons/Day', required: 250, available: 180, coveragePct: 72.0, deficit: 70, status: 'DEFICIT' }
  ],
  authorityActions: [
    { code: 'EVACUATE', title: 'Sandbar Island Pre-Emptive Evacuation', description: 'Mobilize river patrol boats to evacuate Multi Chapari before night surge.', assignedTo: 'SDRF Dibrugarh & Inland Waterways', urgency: 'IMMEDIATE', status: 'READY', actionPrompt: 'Execute night boat evacuation for Multi Chapari 1,850 persons.' },
    { code: 'RELOCATE', title: 'Open Barbaruah Safe Campus Relocation Hub', description: 'Activate 3,800 holding capacity at Barbaruah with potable water tanks.', assignedTo: 'District Disaster Management Officer', urgency: 'IMMEDIATE', status: 'DISPATCHED', actionPrompt: 'Designate Barbaruah campus as Level 1 reception center.' },
    { code: 'ALERT', title: 'Broadcast Embankment Breach Advisory', description: 'Automated SMS and loud-hailer alert to Maijan and Rohmoria bank villagers.', assignedTo: 'District Information Officer', urgency: 'IMMEDIATE', status: 'COMPLETED', actionPrompt: 'Send bilingual Assamese/English river swell alert.' },
    { code: 'DISPATCH', title: 'Deploy Water Resource Dept Sandbagging Teams', description: 'Dispatch 50,000 geo-bags to Chabua ring dyke vulnerable cut.', assignedTo: 'Executive Engineer, Water Resources', urgency: 'HIGH', status: 'DISPATCHED', actionPrompt: 'Fortify breach section along Brahmaputra right bank.' },
    { code: 'VERIFY', title: 'Check Central Water Commission (CWC) Gauge', description: 'Verify Dibrugarh gauge relative to Danger Level (105.70m MSL).', assignedTo: 'CWC Hydrological Station', urgency: 'HIGH', status: 'ACKNOWLEDGED', actionPrompt: 'Read hourly gauge telemetry at Dibrugarh ghat.' },
    { code: 'MONITOR', title: 'Track Upstream Arunachal Inflow', description: 'Monitor Pasighat discharge and heavy rainfall across upper Siang catchment.', assignedTo: 'State EOC Assam', urgency: 'ROUTINE', status: 'PENDING', actionPrompt: 'Review 6-hour Doppler rain estimate for upper basin.' }
  ],
  incidentReport: {
    incidentId: 'INC-2024-AS-DIB-002',
    incidentTitle: 'Dibrugarh Brahmaputra Embankment Breach & Active Basin Inundation',
    hazard: 'flood',
    hazardLabel: 'Flood',
    location: 'Chabua & Dibrugarh West Circles',
    district: 'Dibrugarh',
    state: 'Assam',
    coordinates: [27.4728, 94.9120],
    timestamp: '2024-06-18T05:30:00Z',
    classification: 'Level 3 Brahmaputra Basin Hydro-Meteorological Emergency',
    threatLevel: 'CRITICAL INUNDATION STAGE',
    leadAgency: 'Assam State Disaster Management Authority (ASDMA)',
    commandingOfficer: 'District Commissioner & DDMA Chairman',
    summaryText: 'Severe monsoon flood wave from upstream Siang/Dibang confluence breached the Maijan ring embankment, inundating low-lying agricultural plains across Chabua and Dibrugarh West. Over 412,571 persons exposed across 7 circles, with 20,246 hectares of standing crops submerged.',
    triggers: [
      'Brahmaputra river level exceeded Danger Mark (105.70m MSL) by +1.45 meters at Dibrugarh Ghat',
      'Continuous 72-hour precipitation depth of 312 mm across catchment basin',
      'Structural failure and piping along unreinforced sandbag spur at Maijan'
    ],
    metricsSummary: {
      totalExposedPop: 412571,
      immediateEvacuees: 18500,
      familiesAtRisk: 78400,
      peakSeverityScore: 84.6,
      safeHoldingCapacity: 18500
    },
    damageLedger: [
      { item: 'Maijan Ring Embankment', qty: '65-meter breach cut', status: 'Active high-velocity breach' },
      { item: 'Submerged Agricultural Paddy', qty: '20,246.1 hectares', status: '100% crop inundation' },
      { item: 'Livestock Animals Stranded', qty: '493,413 animals', status: 'Requiring highland fodder' },
      { item: 'Severed Road Corridors', qty: '117 arterial cuts', status: 'Impassable by light vehicles' }
    ],
    topHabitations: [
      { name: 'Multi Chapari (Island)', pax: 1850, rpi: 91.2, urgency: 'P1 - IMMEDIATE', destination: 'Barbaruah Higher Secondary Campus' },
      { name: 'Dikom Naharani', pax: 2340, rpi: 89.6, urgency: 'P1 - IMMEDIATE', destination: 'Panitola Central Vocational Hub' },
      { name: 'Matak Kaibartagaon', pax: 1620, rpi: 88.4, urgency: 'P1 - IMMEDIATE', destination: 'Barbaruah Higher Secondary Campus' }
    ],
    safeHub: {
      name: 'Barbaruah Higher Secondary Campus Hub',
      capacity: 3800,
      ccasScore: 92.4,
      waterLitersPerDay: 285000,
      route: 'NH-37 Barbaruah Protected Arterial (6.8 km, 16 mins)'
    },
    resourceGaps: [
      { resource: 'Inflatable Rescue Boats', unit: 'Boats', required: 48, available: 22, coveragePct: 45.8, deficit: 26, status: 'DEFICIT' },
      { resource: 'Water Purification Tablets', unit: 'Boxes', required: 5000, available: 3200, coveragePct: 64.0, deficit: 1800, status: 'DEFICIT' },
      { resource: 'Emergency Shelter Space', unit: 'Campuses', required: 42, available: 6, coveragePct: 14.3, deficit: 36, status: 'CRITICAL' }
    ],
    dispatchedActions: [
      { action: 'SDRF River Evacuation Fleet Mobilization', target: 'Multi Chapari Sandbar', status: 'EXECUTED', timestamp: '06:15 IST' },
      { action: 'Barbaruah Safe Camp Opening', target: 'Level 1 Relief Center', status: 'OPERATIONAL', timestamp: '07:00 IST' },
      { action: 'Emergency Cattle Camp Deployment', target: 'Panitola Highland', status: 'IN_PROGRESS', timestamp: '07:30 IST' }
    ],
    signoff: {
      officerName: 'Chief Executive Officer, ASDMA',
      role: 'State Incident Commander & Relief Commissioner',
      agency: 'Assam State Disaster Management Authority (ASDMA)',
      dispatchStatus: 'DISTRICT EMERGENCY ACTION PLAN ENFORCED'
    }
  }
};

// -------------------------------------------------------------
// 3. CLOUDBURST OPERATIONAL PROFILE (KEDARNATH, UTTARAKHAND)
// -------------------------------------------------------------
const CLOUDBURST_PROFILE: HazardOperationalProfile = {
  id: 'cloudburst',
  name: 'Cloudburst',
  hazardTypeTitle: 'CLOUDBURST INTELLIGENCE & FORECAST',
  studyLocation: 'Kedarnath / Himalayan Belt',
  state: 'Uttarakhand',
  district: 'Rudraprayag',
  tagline: 'NASA POWER Climatology & Random Forest Day-Ahead Predictor',
  description: 'Grounded in 36 years of daily NASA POWER meteorological series (1988–2024), 167 cloudburst events, 15 RF features, and 12 historical disaster backtests.',
  statusBadge: '● 36-YEAR NASA POWER & RF CALIBRATED',
  provenance: 'NASA POWER Daily Climatology / Uttarakhand Disaster Registry (1988–2024)',
  themeColor: {
    primary: 'amber',
    border: 'border-amber-500/40',
    bg: 'bg-[#181206]',
    text: 'text-amber-400',
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-300'
  },
  defaultCenter: [30.7346, 79.0669],
  defaultZoom: 9,
  kpis: [
    { label: 'Primary Threat', value: 'Convective Deluge & Torrent', sub: 'Kedarnath Mandakini Gorge (3,583m)', alert: true },
    { label: 'Historical Record', value: '167 Cloudburst Events', sub: '36-Year NASA Dataset (1988–2024)' },
    { label: 'Day-Ahead ML Model', value: 'ROC-AUC: 0.88', sub: 'Random Forest (15 Features, Thresh 0.50)' },
    { label: 'Kedarnath 2013 Catch', value: '85.8% Prob.', sub: '116.3 mm Day-Ahead Warning', alert: true },
    { label: 'Safe Staging Capacity', value: '35,500 People', sub: '6 Vetted High-Ground Hubs (CCAS 93.2)' },
    { label: 'Peak 24h Rainfall', value: '377.8 mm (Malpa)', sub: 'Historical Extreme Deluge', alert: true }
  ],
  redZone: {
    name: 'KEDARNATH VALLEY & MANDAKINI GORGE',
    riskScore: '94.2 / 100',
    severity: 'CRITICAL',
    affectedPop: '15,000+ Pilgrims & Residents',
    immediateFamilies: '1,200 Valley Families',
    primaryHazard: 'Extreme Orographic Convective Updrafts Triggering Flash Flood & Moraine Lake Breaches',
    actionRequired: 'Initiate immediate phased descent along NH-107 protected ridge alignment to Guptkashi Staging Hub.',
    coordinates: [30.7346, 79.0669],
    radiusMeters: 2200
  },
  evacuationRoster: UTTARAKHAND_HOTSPOTS.map((h) => ({
    id: h.id,
    name: `${h.name} Hotspot`,
    zone: `${h.district} District`,
    population: h.cloudburstEvents * 250 + 500,
    families: Math.round((h.cloudburstEvents * 250 + 500) / 4.5),
    rpiScore: h.rpiScore,
    urgency: h.priorityClass.includes('P1') ? 'P1 - IMMEDIATE' : h.priorityClass.includes('P2') ? 'P2 - HIGH' : 'P3 - MEDIUM',
    primaryHazard: h.primaryTrigger,
    assignedDestination: h.safeStagingDestination,
    distanceKm: h.transitDistanceKm,
    coordinates: [h.latitude, h.longitude]
  })),
  safeDestinations: SAFE_STAGING_DESTINATIONS.map((hub: any) => ({
    id: hub.site_id,
    name: hub.name,
    location: `${hub.district}, Uttarakhand`,
    elevationMeters: hub.elevation_m,
    ccasScore: hub.ccas_score,
    capacityPersons: hub.total_capacity,
    availableCapacity: hub.available_capacity,
    waterLitersPerDay: hub.water_capacity_lpd || 180000,
    waterPerPersonDay: Math.round((hub.water_capacity_lpd || 180000) / hub.total_capacity),
    toiletsAvailable: hub.latrines_count || 120,
    medicalDoctors: 4,
    triageBeds: 24,
    transitCorridor: hub.road_access || 'Guptkashi-Rudraprayag Highway',
    transitMins: 45,
    hazardClearance: 'SAFE',
    coordinates: hub.coordinates || [30.5228, 79.0772]
  })),
  relocationMatrix: [
    {
      origin: 'Kedarnath Base (3,583m)',
      destination: 'Guptkashi Resilient Helipad & Stadium Hub',
      persons: 4500,
      families: 1100,
      priority: 'P1 — IMMEDIATE',
      route: 'NH-107 Protected High Ridge Alignment',
      distanceKm: 38.0,
      transitTimeMins: 45,
      busesRequired: 90,
      ambulancesRequired: 8,
      status: 'READY'
    },
    {
      origin: 'Mandakini Valley Settlements',
      destination: 'Guptkashi Resilient Helipad & Stadium Hub',
      persons: 3200,
      families: 750,
      priority: 'P1 — IMMEDIATE',
      route: 'Kund–Guptkashi Valley Link',
      distanceKm: 18.5,
      transitTimeMins: 25,
      busesRequired: 64,
      ambulancesRequired: 5,
      status: 'READY'
    }
  ],
  resourceGaps: [
    { resource: 'Helicopter Airlift Sorties', unit: 'Sorties/Day', required: 45, available: 12, coveragePct: 26.7, deficit: 33, status: 'CRITICAL' },
    { resource: 'High-Altitude Oxygen Concentrators', unit: 'Units', required: 120, available: 85, coveragePct: 70.8, deficit: 35, status: 'DEFICIT' },
    { resource: 'Thermal Emergency Blankets', unit: 'Pieces', required: 15000, available: 12000, coveragePct: 80.0, deficit: 3000, status: 'DEFICIT' },
    { resource: 'Satellite Phone Transceivers', unit: 'Handsets', required: 20, available: 20, coveragePct: 100.0, deficit: 0, status: 'SUFFICIENT' },
    { resource: 'Highland Staging Water Supply', unit: 'Liters/Day', required: 360000, available: 360000, coveragePct: 100.0, deficit: 0, status: 'SUFFICIENT' }
  ],
  authorityActions: [
    { code: 'EVACUATE', title: 'Halt Yatra Pilgrim Trek & Initiate Descent', description: 'Suspend uphill pilgrim movement from Gaurikund and guide valley descent.', assignedTo: 'Uttarakhand Police & SDRF', urgency: 'IMMEDIATE', status: 'EXECUTED', actionPrompt: 'Close Gaurikund barrier gate and reverse uphill foot-traffic.' },
    { code: 'RELOCATE', title: 'Activate Guptkashi Staging Grounds', description: 'Prepare 4,500-capacity holding hub with medical triage and heated shelters.', assignedTo: 'SDM Rudraprayag', urgency: 'IMMEDIATE', status: 'DISPATCHED', actionPrompt: 'Open Guptkashi stadium and municipal halls.' },
    { code: 'ALERT', title: 'Kedarnath Red Alert Siren & Broadcast', description: 'Trigger temple warning sirens and SMS broadcast to registered yatri SIM cards.', assignedTo: 'State Disaster Operations Centre', urgency: 'IMMEDIATE', status: 'ACKNOWLEDGED', actionPrompt: 'Transmit bilingual warning to 15,000 active devices in valley.' },
    { code: 'DISPATCH', title: 'Stage Indian Air Force & State Helicopters', description: 'Position 4 Mi-17 and 6 light utility helicopters at Dehradun & Gauchar airstrips.', assignedTo: 'Aviation Nodal Officer', urgency: 'HIGH', status: 'STANDBY', actionPrompt: 'Clear airspace for emergency medical evacuation.' },
    { code: 'VERIFY', title: 'Confirm Chorabari Lake Spillway Status', description: 'Inspect drone footage of upper glacial moraine dam behind Kedarnath temple.', assignedTo: 'Wadia Institute Glaciology Team', urgency: 'HIGH', status: 'PENDING', actionPrompt: 'Deploy high-altitude drone to inspect lake volume.' },
    { code: 'MONITOR', title: 'Monitor NASA Relative Humidity & Wind', description: 'Track RH2M > 80% and 3-day rainfall accumulation precursors.', assignedTo: 'IMD Dehradun Meteorological Centre', urgency: 'ROUTINE', status: 'PENDING', actionPrompt: 'Run hourly Doppler radar storm-tracking algorithm.' }
  ],
  incidentReport: {
    incidentId: 'INC-2024-UK-KED-003',
    incidentTitle: 'Kedarnath-Mandakini Orographic Cloudburst & Valley Flash Surge',
    hazard: 'cloudburst',
    hazardLabel: 'Cloudburst',
    location: 'Kedarnath Temple Axis & Mandakini Valley',
    district: 'Rudraprayag',
    state: 'Uttarakhand',
    coordinates: [30.7346, 79.0669],
    timestamp: '2024-06-16T14:30:00Z',
    classification: 'Level 3 Extreme Orographic Cloudburst Emergency',
    threatLevel: 'HIGH CONVECTIVE ALERT (RPI 94.2)',
    leadAgency: 'Uttarakhand State Disaster Management Authority (USDMA)',
    commandingOfficer: 'Executive Director, Disaster Mitigation Centre',
    summaryText: 'Extreme convective column over high Himalayan ridge (3,583m) precipitated 116.3 mm rainfall within a concentrated window under 85% relative humidity. Sudden runoff initiated hyper-concentrated moraine slurry surge along the Mandakini gorge, threatening ~15,000 pilgrims and valley settlements.',
    triggers: [
      'Atmospheric column moisture trigger: Relative Humidity at 2m (RH2M) reached 85%',
      '3-Day antecedent precipitation mean of 78.4 mm pre-saturated orographic catchment',
      'Day-ahead Random Forest model predicted cloudburst probability of 85.8% (Critical Catch)'
    ],
    metricsSummary: {
      totalExposedPop: 15000,
      immediateEvacuees: 4500,
      familiesAtRisk: 1200,
      peakSeverityScore: 94.2,
      safeHoldingCapacity: 35500
    },
    damageLedger: [
      { item: 'Mandakini Riverbank Trek Path', qty: '8.4 km washed out', status: 'Impassable on foot' },
      { item: 'Gaurikund Temporary Bridges', qty: '3 Bailey spans', status: 'Submerged by boulder torrent' },
      { item: 'Pilgrim Rest Shelters', qty: '18 GMVN huts', status: 'Structural scour damage' },
      { item: 'Telecom Repeater Tower', qty: 'Lincheli Spur', status: 'Operating on backup battery' }
    ],
    topHabitations: [
      { name: 'Kedarnath Base (3,583m)', pax: 4500, rpi: 94.2, urgency: 'P1 - IMMEDIATE', destination: 'Guptkashi Resilient Helipad & Stadium Hub' },
      { name: 'Mandakini Valley (1,400m)', pax: 3200, rpi: 91.5, urgency: 'P1 - IMMEDIATE', destination: 'Guptkashi Resilient Helipad & Stadium Hub' },
      { name: 'Dharali Gorge (2,680m)', pax: 1800, rpi: 88.4, urgency: 'P1 - IMMEDIATE', destination: 'Uttarkashi Matli ITBP Safe Terrace' }
    ],
    safeHub: {
      name: 'Guptkashi Resilient Helipad & Stadium Hub',
      capacity: 4500,
      ccasScore: 93.2,
      waterLitersPerDay: 360000,
      route: 'NH-107 Protected High Ridge Corridor (38.0 km, 45 mins convoy)'
    },
    resourceGaps: [
      { resource: 'Heavy-Lift Helicopters', unit: 'Helicopters', required: 8, available: 3, coveragePct: 37.5, deficit: 5, status: 'CRITICAL' },
      { resource: 'High-Altitude Mountain Rescue Kits', unit: 'Kits', required: 40, available: 25, coveragePct: 62.5, deficit: 15, status: 'DEFICIT' },
      { resource: 'Portable Emergency Shelters', unit: 'Units', required: 150, available: 120, coveragePct: 80.0, deficit: 30, status: 'DEFICIT' }
    ],
    dispatchedActions: [
      { action: 'Gaurikund Uphill Trail Closure', target: 'Yatra Checkpost', status: 'EXECUTED', timestamp: '14:45 IST' },
      { action: 'Guptkashi Stadium Reception Activation', target: 'Guptkashi Staging Base', status: 'OPERATIONAL', timestamp: '15:15 IST' },
      { action: 'NDRF High-Altitude Unit Mobilization', target: 'Kedarnath Sanctum', status: 'IN_TRANSIT', timestamp: '15:30 IST' }
    ],
    signoff: {
      officerName: 'Executive Director, USDMA',
      role: 'State Disaster Response Commissioner',
      agency: 'Uttarakhand State Disaster Management Authority (USDMA)',
      dispatchStatus: 'SPECIAL HIGH-ALTITUDE RESCUE PLAN ACTIVE'
    }
  }
};

// -------------------------------------------------------------
// 4. COASTAL EROSION PROFILE (BRAHMAPUR COAST, GANJAM, ODISHA)
// -------------------------------------------------------------
const COASTAL_PROFILE: HazardOperationalProfile = {
  id: 'coastal-erosion',
  name: 'Coastal Erosion',
  hazardTypeTitle: 'COASTAL EROSION INTELLIGENCE',
  studyLocation: 'Brahmapur Coastline, Ganjam',
  state: 'Odisha',
  district: 'Ganjam',
  tagline: '12-Year Remote Sensing & USGS DSAS Shoreline Analysis',
  description: 'Grounded in multi-temporal Landsat 8 & Sentinel-2 composites across 119 DSAS transects (2013–2024), Coastal Vulnerability Index (CVI: 68.4), and Phailin/Titli storm surge histories.',
  statusBadge: '● 12-YEAR DSAS & SATELLITE CALIBRATED',
  provenance: 'USGS Digital Shoreline Analysis System (DSAS) / Landsat 8 / Sentinel-2 / IMD',
  themeColor: {
    primary: 'cyan',
    border: 'border-cyan-500/40',
    bg: 'bg-[#061418]',
    text: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/80',
    badgeText: 'text-cyan-300'
  },
  defaultCenter: [19.2700, 84.8800],
  defaultZoom: 11,
  kpis: [
    { label: 'Monitored Coastline', value: '25.5 km DSAS Stretch', sub: '119 Perpendicular Transects' },
    { label: 'Exposed Population', value: '14,280 Persons', sub: '650 Families in 50m High Scarp Buffer', alert: true },
    { label: 'Mean Erosion Rate (LRR)', value: '-0.222 m / Year', sub: '43.7% of Coastline Eroding', alert: true },
    { label: 'Maximum Local Erosion', value: '-7.867 m / Year', sub: 'Podampeta Estuarine Barrier Spit', alert: true },
    { label: 'Coastal Vuln. Index (CVI)', value: '68.4 / 100', sub: 'PVI 71.4 + SVI 65.4 (AHP CR = 0.042)' },
    { label: 'Safe Relocation Cap.', value: '6,500 People', sub: 'Humma Ridge & Gopalpur Hilltop' }
  ],
  redZone: {
    name: 'PODAMPETA ESTUARINE BARRIER SPIT',
    riskScore: '88.5 / 100',
    severity: 'CRITICAL',
    affectedPop: '820 Persons (180 Families)',
    immediateFamilies: '180 Families',
    primaryHazard: 'Severe Barrier Spit Scour & Rushikulya River Estuary Breaches at -6.85 m/yr',
    actionRequired: 'Mandatory planned relocation of entire 180-family fishing community to Humma Elevated Ridge Colony (4.8 km inland).',
    coordinates: [19.3480, 85.0350],
    radiusMeters: 1800
  },
  evacuationRoster: VULNERABLE_COASTAL_HABITATIONS.map((hab: any) => ({
    id: hab.id,
    name: hab.name,
    zone: `${hab.block}`,
    population: hab.population,
    families: hab.families,
    rpiScore: hab.rpi_score,
    urgency: (hab.urgency_phase || '').includes('Immediate') ? 'P1 - IMMEDIATE' : (hab.urgency_phase || '').includes('Short-Term') ? 'P2 - HIGH' : 'P3 - MEDIUM',
    primaryHazard: `Erosion rate ${hab.erosion_rate_m_yr} m/yr (CVI: ${hab.cvi_score})`,
    assignedDestination: hab.recommended_safe_zone || 'Humma Elevated Ridge Resettlement Colony',
    distanceKm: hab.evacuation_distance_km || 4.8,
    coordinates: [hab.latitude, hab.longitude]
  })),
  safeDestinations: [
    {
      id: 'OD-GNJ-S01',
      name: 'Humma Elevated Ridge Resettlement Colony',
      location: 'Humma, Ganjam',
      elevationMeters: 28,
      ccasScore: 86.4,
      capacityPersons: 3200,
      availableCapacity: 2380,
      waterLitersPerDay: 160000,
      waterPerPersonDay: 50,
      toiletsAvailable: 120,
      medicalDoctors: 4,
      triageBeds: 24,
      transitCorridor: 'NH-516 Spur Evacuation Corridor',
      transitMins: 12,
      hazardClearance: 'SAFE',
      coordinates: [19.4120, 85.0450]
    },
    {
      id: 'OD-GNJ-S02',
      name: 'Gopalpur Hilltop Educational Campus Buffer',
      location: 'Gopalpur Hilltop, Ganjam',
      elevationMeters: 34,
      ccasScore: 84.1,
      capacityPersons: 2500,
      availableCapacity: 1550,
      waterLitersPerDay: 125000,
      waterPerPersonDay: 50,
      toiletsAvailable: 95,
      medicalDoctors: 3,
      triageBeds: 18,
      transitCorridor: 'Gopalpur-Brahmapur Marine Highway',
      transitMins: 10,
      hazardClearance: 'SAFE',
      coordinates: [19.2750, 84.9050]
    },
    {
      id: 'OD-GNJ-S03',
      name: 'Rangeilunda High Ground Institutional Reserve',
      location: 'Rangeilunda, Ganjam',
      elevationMeters: 42,
      ccasScore: 88.0,
      capacityPersons: 2800,
      availableCapacity: 2290,
      waterLitersPerDay: 140000,
      waterPerPersonDay: 50,
      toiletsAvailable: 110,
      medicalDoctors: 4,
      triageBeds: 20,
      transitCorridor: 'SH-32 Rangeilunda Bypass',
      transitMins: 14,
      hazardClearance: 'SAFE',
      coordinates: [19.2880, 84.8720]
    }
  ],
  relocationMatrix: [
    {
      origin: 'Podampeta Barrier Spit',
      destination: 'Humma Elevated Ridge Resettlement Colony',
      persons: 820,
      families: 180,
      priority: 'P1 — IMMEDIATE',
      route: 'NH-516 / Humma Coastal Spur Corridor',
      distanceKm: 4.8,
      transitTimeMins: 12,
      busesRequired: 17,
      ambulancesRequired: 2,
      status: 'READY'
    },
    {
      origin: 'Boxipalli Coastal Hamlet',
      destination: 'Gopalpur Hilltop Campus Buffer',
      persons: 950,
      families: 195,
      priority: 'P1 — IMMEDIATE',
      route: 'Gopalpur–Rangeilunda Paved Highway',
      distanceKm: 3.2,
      transitTimeMins: 8,
      busesRequired: 19,
      ambulancesRequired: 2,
      status: 'READY'
    }
  ],
  resourceGaps: [
    { resource: 'Storm-Surge Safe Housing', unit: 'Housing Units', required: 375, available: 320, coveragePct: 85.3, deficit: 55, status: 'DEFICIT' },
    { resource: 'Potable Drinking Water (Inland)', unit: 'Liters/Day', required: 150000, available: 160000, coveragePct: 106.7, deficit: 0, status: 'SUFFICIENT' },
    { resource: 'Livelihood Fish Landing Centers', unit: 'Wharfs', required: 2, available: 1, coveragePct: 50.0, deficit: 1, status: 'DEFICIT' },
    { resource: 'Mobile Disaster Medical Units', unit: 'Units', required: 4, available: 4, coveragePct: 100.0, deficit: 0, status: 'SUFFICIENT' },
    { resource: 'Sea-Wall Geo-Tube Reinforcements', unit: 'km', required: 6.5, available: 3.2, coveragePct: 49.2, deficit: 3.3, status: 'DEFICIT' }
  ],
  authorityActions: [
    { code: 'EVACUATE', title: 'Issue Barrier Spit Relocation Notice', description: 'Begin planned community transit for Podampeta 180 families to Humma ridge.', assignedTo: 'BDO Ganjam & Coastal Tehsildar', urgency: 'IMMEDIATE', status: 'READY', actionPrompt: 'Initiate formal title transfer and transit to Humma colony.' },
    { code: 'RELOCATE', title: 'Open Gopalpur Hilltop Resettlement Zone', description: 'Allocate 195 housing plots at Gopalpur Hilltop Campus for Boxipalli residents.', assignedTo: 'Ganjam District Collectorate', urgency: 'HIGH', status: 'DISPATCHED', actionPrompt: 'Finalize civic utility connection at Gopalpur campus.' },
    { code: 'ALERT', title: 'Tidal Scour & Surge Warning Broadcast', description: 'Transmit alert to artisanal fishermen regarding unmitigated spit erosion.', assignedTo: 'Assistant Director of Fisheries', urgency: 'HIGH', status: 'COMPLETED', actionPrompt: 'Send SMS advisory to coastal mechanised boat operators.' },
    { code: 'DISPATCH', title: 'Stage Coastal Engineering Shoreline Survey Team', description: 'Inspect transects 15–28 near Rushikulya river mouth post high-tide event.', assignedTo: 'Odisha Coastal Zone Management Authority', urgency: 'HIGH', status: 'DISPATCHED', actionPrompt: 'Survey scarp retreat using RTK-DGPS.' },
    { code: 'VERIFY', title: 'Inspect Gopalpur Port Downdrift Accretion', description: 'Measure sediment accumulation and downdrift starvation along breakwater.', assignedTo: 'Port Geomorphologist', urgency: 'ROUTINE', status: 'ACKNOWLEDGED', actionPrompt: 'Verify beach profile at Transect 68.' },
    { code: 'MONITOR', title: 'Seasonal Sentinel-2 Shoreline Extraction', description: 'Run automated MNDWI/NDVI remote sensing pipeline for quarterly retreat rates.', assignedTo: 'NIVARA Coastal Engine', urgency: 'ROUTINE', status: 'PENDING', actionPrompt: 'Process newest Sentinel-2 satellite pass.' }
  ],
  incidentReport: {
    incidentId: 'INC-2024-OD-BHM-004',
    incidentTitle: 'Podampeta-Brahmapur Barrier Spit Erosion & Estuarine Scour',
    hazard: 'coastal-erosion',
    hazardLabel: 'Coastal Erosion',
    location: 'Podampeta Barrier Spit & Boxipalli',
    district: 'Ganjam',
    state: 'Odisha',
    coordinates: [19.2700, 84.8800],
    timestamp: '2024-08-22T08:00:00Z',
    classification: 'Level 2 Progressive Marine & Estuarine Hazard',
    threatLevel: 'HIGH EROSION THREAT (CVI 68.4)',
    leadAgency: 'Odisha State Disaster Management Authority (OSDMA)',
    commandingOfficer: 'District Collector & District Magistrate, Ganjam',
    summaryText: 'Multi-year Landsat and Sentinel-2 remote sensing analysis across 119 DSAS transects identifies severe unmitigated shoreline retreat reaching -6.85 m/year at Podampeta estuarine spit. Tidal backwater ingress and wave energy convergence threaten 180 fishing households residing within 50 meters of the scarp.',
    triggers: [
      'Linear Regression Rate (LRR) exceeding -6.85 m/year on estuarine barrier spit',
      'Loss of primary intertidal dune buffer (-19.9% vegetative decline since 2019)',
      'Wave energy convergence during Bay of Bengal seasonal spring tides'
    ],
    metricsSummary: {
      totalExposedPop: 14280,
      immediateEvacuees: 1770,
      familiesAtRisk: 650,
      peakSeverityScore: 88.5,
      safeHoldingCapacity: 6500
    },
    damageLedger: [
      { item: 'Podampeta Seaward Front Dune', qty: '42.9 meters total loss', status: 'Completely scoured by waves' },
      { item: 'Artisanal Fishermen Thatched Huts', qty: '48 dwellings', status: 'Direct shoreline undercut' },
      { item: 'Coastal Approach Embankment', qty: '1.2 km spit road', status: 'Tidal overflow damage' },
      { item: 'Community Net Mending Shed', qty: '1 masonry hall', status: 'Undermined foundation' }
    ],
    topHabitations: [
      { name: 'Podampeta Estuarine Spit', pax: 820, rpi: 88.5, urgency: 'P1 - IMMEDIATE', destination: 'Humma Elevated Ridge Colony' },
      { name: 'Boxipalli Coastal Hamlet', pax: 950, rpi: 82.3, urgency: 'P1 - IMMEDIATE', destination: 'Gopalpur Hilltop Campus Buffer' },
      { name: 'Haripur Coastal Village', pax: 580, rpi: 74.6, urgency: 'P2 - HIGH', destination: 'Humma Elevated Ridge Colony' }
    ],
    safeHub: {
      name: 'Humma Elevated Ridge Resettlement Colony',
      capacity: 3200,
      ccasScore: 86.4,
      waterLitersPerDay: 160000,
      route: 'NH-516 / Humma Coastal Evacuation Spur (4.8 km, 12 mins transit)'
    },
    resourceGaps: [
      { resource: 'Permanent Relocation Dwellings', unit: 'Houses', required: 375, available: 320, coveragePct: 85.3, deficit: 55, status: 'DEFICIT' },
      { resource: 'Livelihood Rehabilitation Grant', unit: 'Beneficiaries', required: 375, available: 250, coveragePct: 66.7, deficit: 125, status: 'DEFICIT' },
      { resource: 'Potable Drinking Water (Inland)', unit: 'Liters/Day', required: 150000, available: 160000, coveragePct: 106.7, deficit: 0, status: 'SUFFICIENT' }
    ],
    dispatchedActions: [
      { action: 'Land Allotment Order Issue (Humma Colony)', target: 'Podampeta Families', status: 'EXECUTED', timestamp: '09:00 IST' },
      { action: 'Coastal Transit Bus Fleet Mobilization', target: 'Boxipalli Crossing', status: 'READY', timestamp: '09:30 IST' },
      { action: 'Civil Works Inspection for Humma Water Supply', target: 'Humma Reservoir', status: 'COMPLETED', timestamp: '10:00 IST' }
    ],
    signoff: {
      officerName: 'District Collector, Ganjam',
      role: 'District Disaster Management Authority Chairman',
      agency: 'Odisha State Disaster Management Authority (OSDMA)',
      dispatchStatus: 'PERMANENT RELOCATION SCHEME DISPATCHED'
    }
  }
};

export const HAZARD_PROFILES: Record<HazardType, HazardOperationalProfile> = {
  landslide: LANDSLIDE_PROFILE,
  flood: FLOOD_PROFILE,
  cloudburst: CLOUDBURST_PROFILE,
  'coastal-erosion': COASTAL_PROFILE
};

export const getHazardProfile = (hazard: HazardType): HazardOperationalProfile => {
  return HAZARD_PROFILES[hazard] || HAZARD_PROFILES.landslide;
};

export const getHazardIncidentReport = (hazard: HazardType): DisasterIncidentReport => {
  const profile = getHazardProfile(hazard);
  return profile.incidentReport;
};
