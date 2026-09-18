export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type UrgencyPhase = 'Immediate' | 'Short-Term' | 'Medium-Term' | 'Monitor';
export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW';

export type DataProvenanceSource = 
  | 'Actual Dataset' 
  | 'API Telemetry' 
  | 'User Input' 
  | 'Planning Assumption';

export type ResourceStatusEnum = 
  | 'Sufficient' 
  | 'Limited' 
  | 'Shortage' 
  | 'Critical' 
  | 'Unavailable';

export interface FactorBreakdown {
  slope_contribution: number;
  rain_contribution: number;
  landslide_contribution: number;
  flood_contribution: number;
  soil_contribution: number;
}

export interface Parcel {
  parcel_id: string;
  village: string;
  district: string;
  taluk: string;
  digital_block_no: string;
  survey_no: string;
  subdivision_no: string;
  area_sq_m: number;
  area_ha: number;
  land_use: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  slope_deg: number;
  rainfall_24h_mm: number;
  rainfall_7day_mm: number;
  flood_depth_m: number;
  flood_probability: number;
  landslide_probability: number;
  distance_to_river_m: number;
  distance_to_road_m: number;
  population_density: number;
  building_density: number;
  soil_moisture_index: number;
  risk_score: number;
  risk_level: RiskLevel;
  risk_rank: number;
  relocation_screening: string;
  recommended_action: string;
  hazard_screening_basis: string;
  rpi_score: number;
  urgency_phase: UrgencyPhase;
  factors: FactorBreakdown;
}

export interface VillageStat {
  name: string;
  taluk: string;
  district: string;
  parcels_count: number;
  avg_risk_score: number;
  avg_flood_probability: number;
  avg_landslide_probability: number;
  high_risk_count: number;
  med_risk_count: number;
  low_risk_count: number;
  population_2011: number;
  male_population: number;
  female_population: number;
  population_note: string;
  center_latitude: number;
  center_longitude: number;
  event_24h_rainfall_mm: number;
  rainfall_departure_pct: number;
  gsi_status: string;
  priority_tier: string;
  avg_rpi_score: number;
  justification: string;
}

export interface ExclusionChecks {
  red_zone_excluded: boolean;
  floodplain_excluded: boolean;
  steep_slope_excluded: boolean;
  ecologically_sensitive_excluded: boolean;
}

export interface CandidateSite {
  site_id: string;
  name: string;
  village: string;
  taluk: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  usable_area_ha: number;
  usable_area_sqm: number;
  slope_deg: number;
  slope_stability_score: number;
  water_availability_score: number;
  road_access_score: number;
  ecological_safety_score: number;
  social_infra_score: number;
  ccas_score: number;
  capacity_families: number;
  capacity_persons: number;
  data_confidence: ConfidenceTier;
  confidence_reason: string;
  exclusion_checks: ExclusionChecks;
  description: string;
}

// ----------------------------------------------------
// SAFE-SITE CARRYING CAPACITY & RESOURCE LEDGER TYPES
// ----------------------------------------------------

export interface SiteResourceLedger {
  siteId: string;
  name: string;
  village: string;
  category: string;
  coordinates: [number, number];

  // A. Physical Space
  usableLandAreaHa: number;
  usableFloorAreaSqm: number;
  shelterAreaSqm: number;
  existingOccupancyPersons: number;
  maxGrossCapacityPersons: number;
  shelterType: string;
  spaceProvenance: DataProvenanceSource;

  // B. Water Supply
  waterDailyAvailableLiters: number;
  waterSourceDescription: string;
  waterStorageCapacityLiters: number;
  waterProvenance: DataProvenanceSource;

  // C. Sanitation
  toiletsAvailable: number;
  wasteManagementType: string;
  drainageSystem: string;
  sanitationProvenance: DataProvenanceSource;

  // D. Healthcare & Medical
  medicalDoctorsOnCall: number;
  nursesOnCall: number;
  emergencyTriageBeds: number;
  firstAidStationAvailable: boolean;
  nearestHospitalName: string;
  nearestHospitalDistanceKm: number;
  nearestPhcName: string;
  nearestPhcDistanceKm: number;
  healthcareProvenance: DataProvenanceSource;

  // E. Emergency Vehicles & Ambulances
  ambulancesStationed: number;
  rescueVehiclesStationed: number;
  fireRescueVehiclesStationed: number;
  waterTankersStationed: number;
  reliefSupplyTrucksStationed: number;
  vehiclesProvenance: DataProvenanceSource;

  // F. Food & Relief Stock
  foodStockMealsAvailable: number;
  foodWarehouseAreaSqm: number;
  reliefDeliveryAccess: string;
  foodProvenance: DataProvenanceSource;

  // G. Electricity & Basic Utilities
  electricityStatus: 'Available' | 'Limited' | 'Unavailable';
  powerGridSource: string;
  backupGeneratorCapacityKva: number;
  utilitiesProvenance: DataProvenanceSource;

  // H. Road & Accessibility
  roadStatus: 'Good' | 'Moderate' | 'Poor';
  accessRoadType: string;
  independentAccessRoutesCount: number;
  emergencyVehicleAccessibility: 'High' | 'Medium' | 'Low';
  distanceFromMeppadiKm: number;
  travelTimeFromMeppadiMins: number;
  accessibilityProvenance: DataProvenanceSource;

  // I. Hazard Safety Verification
  hazardExposureLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  floodExposurePct: number;
  landslideExposurePct: number;
  slopeDeg: number;
  isInsideHazardRedZone: boolean;
  hazardSafetyProvenance: DataProvenanceSource;

  // J. Land Area Breakdown & Elevation
  totalLandAreaHa?: number;
  restrictedLandAreaHa?: number;
  elevationMeters?: number;
  hazardType?: HazardType;
  hazardFactors?: {
    factor1Name: string;
    factor1Value: string;
    factor1Status: 'Suitable' | 'Caution' | 'Unsuitable' | 'Unavailable';
    factor2Name: string;
    factor2Value: string;
    factor2Status: 'Suitable' | 'Caution' | 'Unsuitable' | 'Unavailable';
    factor3Name: string;
    factor3Value: string;
    factor3Status: 'Suitable' | 'Caution' | 'Unsuitable' | 'Unavailable';
    factor4Name: string;
    factor4Value: string;
    factor4Status: 'Suitable' | 'Caution' | 'Unsuitable' | 'Unavailable';
    factor5Name: string;
    factor5Value: string;
    factor5Status: 'Suitable' | 'Caution' | 'Unsuitable' | 'Unavailable';
  };

  description: string;
}

export interface PlanningAssumptions {
  peoplePerAmbulance: number;            // e.g. 500
  peoplePerToilet: number;               // e.g. 20 (Sphere standard)
  waterLitersPerPersonPerDay: number;    // e.g. 70 L
  shelterSpaceSqmPerPerson: number;      // e.g. 3.5 m²
  peoplePerMedicalStaff: number;         // e.g. 250
  peoplePerEmergencyVehicle: number;     // e.g. 300
  mealsPerPersonPerDay: number;          // e.g. 3
  
  // Scoring Weights (Sum to 1.0)
  weightSafety: number;                  // 0.30
  weightCapacity: number;                // 0.25
  weightAccessibility: number;           // 0.15
  weightEssentialServices: number;       // 0.15
  weightEmergencyReadiness: number;      // 0.15
}

export interface ResourceRequirementItem {
  resourceName: string;
  requiredValue: number;
  availableValue: number;
  unit: string;
  gap: number;                  // available - required (positive = surplus, negative = deficit)
  coveragePct: number;          // (available / required) * 100
  status: ResourceStatusEnum;
  provenance: DataProvenanceSource;
  notes?: string;
}

export interface CapacityCalculationResult {
  siteId: string;
  siteName: string;
  targetPopulation: number;
  
  // Limiting resource calculations
  physicalSpaceCapacity: number;
  waterSupportedPopulation: number;
  sanitationSupportedPopulation: number;
  healthcareSupportedPopulation: number;
  foodSupportedPopulation: number;
  emergencyVehiclesSupportedPopulation: number;
  
  // Final Limiting Carrying Capacity
  practicalCapacity: number;
  limitingResource: string;
  limitingResourceExplanation: string;
  
  // Utilization
  capacityUtilizationPct: number;
  remainingCapacity: number;
  capacityStatus: 'SAFE CAPACITY AVAILABLE' | 'AT MAXIMUM CAPACITY' | 'OVERCAPACITY DEFICIT' | 'REJECTED — HAZARD';
  
  // Detailed Resource Ledgers
  resources: {
    water: ResourceRequirementItem;
    sanitation: ResourceRequirementItem;
    ambulances: ResourceRequirementItem;
    emergencyVehicles: ResourceRequirementItem;
    healthcare: ResourceRequirementItem;
    shelterSpace: ResourceRequirementItem;
    foodStock: ResourceRequirementItem;
    electricity: { status: 'Available' | 'Limited' | 'Unavailable'; details: string; provenance: DataProvenanceSource };
    roadAccess: { status: 'Good' | 'Moderate' | 'Poor'; details: string; provenance: DataProvenanceSource };
    hazardExposure: { status: 'Low' | 'Medium' | 'High'; details: string; isSafe: boolean; provenance: DataProvenanceSource };
  };
  
  // Overall Suitability Score (0-100)
  suitabilityScore: number;
  scoreBreakdown: {
    safetyScore: { points: number; max: number; weight: number; contribution: number };
    capacityScore: { points: number; max: number; weight: number; contribution: number };
    accessibilityScore: { points: number; max: number; weight: number; contribution: number };
    essentialServicesScore: { points: number; max: number; weight: number; contribution: number };
    emergencyReadinessScore: { points: number; max: number; weight: number; contribution: number };
  };

  // Hazard Filter Exclusion Check
  isRejectedDueToHazard: boolean;
  rejectionReason?: string;
}

export interface SingleSiteAllocation {
  siteId: string;
  siteName: string;
  allocatedPopulation: number;
  allocatedFamilies: number;
  practicalCapacity: number;
  utilizationPct: number;
  limitingResource: string;
  distanceKm: number;
  travelTimeMins: number;
  suitabilityScore: number;
  ambulancesRequired: number;
  waterRequiredLitersDay: number;
  toiletsRequired: number;
  rescueVehiclesRequired: number;
  medicalStaffRequired: number;
}

export interface DistributedRelocationPlan {
  sourceVillage: string;
  totalDisplacedPopulation: number;
  totalDisplacedFamilies: number;
  allocations: SingleSiteAllocation[];
  totalAccommodatedPopulation: number;
  unmetPopulation: number;
  isFullyAccommodated: boolean;
  
  // Combined Resource Logistics Requirements
  totalAmbulancesRequired: number;
  totalWaterRequiredLitersDay: number;
  totalToiletsRequired: number;
  totalRescueVehiclesRequired: number;
  totalMedicalStaffRequired: number;
  totalMealsPerDayRequired: number;
}

// ----------------------------------------------------
// GENERAL SYSTEM TYPES
// ----------------------------------------------------

export interface RelocationMatch {
  match_id: string;
  source_village: string;
  source_hamlet: string;
  source_risk_score: number;
  priority_phase: string;
  displaced_families: number;
  displaced_persons: number;
  target_site_id: string;
  target_site_name: string;
  distance_km: number;
  travel_time_mins: number;
  safety_gain_score: string;
  ccas_score: number;
  allocated_capacity_used_pct: number;
  justification: string;
}

export interface RunoutPath {
  id: string;
  source_name: string;
  destination_name: string;
  village: string;
  risk_rating: string;
  estimated_velocity_kmh: number;
  length_km: number;
  affected_parcels_count: number;
  exposed_population: number;
  flow_coordinates: [number, number][];
  hazard_description: string;
  early_warning_lead_time_min: number;
}

export interface IntelligenceAlert {
  id: string;
  type: 'GROUND_DISTURBANCE' | 'ILLEGAL_CONSTRUCTION' | 'SOIL_SATURATION_EXCEEDANCE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  village: string;
  location: string;
  detection_source: string;
  timestamp: string;
  movement_rate_mm_day?: number;
  cumulative_displacement_cm?: number;
  structure_type?: string;
  saturation_pct?: number;
  status: string;
  action_required: string;
  confidence: ConfidenceTier;
}

export interface FloodScenario {
  scenario: string;
  return_period_years: number;
  area_affected_sq_km: number;
  hospitals_exposed: number;
  schools_exposed: number;
  source: string;
  source_type: string;
}

export interface WeatherDataPoint {
  time: string;
  rain_mm: number;
  showers_mm: number;
  snowfall_cm: number;
  soil_moisture_0_1cm: number;
  soil_moisture_1_3cm: number;
}

export interface SourceRegister {
  dataset: string;
  source_name: string;
  url: string;
  authority_type: string;
  notes: string;
}

export interface RoadmapItem {
  id: number;
  dataset: string;
  what_to_collect: string;
  purpose: string;
  preferred_source: string;
  status: string;
}

export interface DemSamplePoint {
  lat: number;
  lon: number;
  elev: number;
  slope: number;
  slope_class: string;
}

export interface NivaraData {
  system_info: {
    name: string;
    sanskrit_meaning: string;
    platform_title: string;
    project_reference: string;
    version: string;
    build_date: string;
    target_authority: string;
    study_area: string;
    official_disclaimer: string;
  };
  metrics_summary: {
    total_parcels: number;
    total_villages: number;
    total_high_risk_parcels: number;
    total_medium_risk_parcels: number;
    total_low_risk_parcels: number;
    total_candidate_sites: number;
    total_candidate_capacity_families: number;
    total_candidate_capacity_persons: number;
    immediate_relocation_needed_families: number;
    immediate_relocation_needed_persons: number;
    active_hazard_red_zones: number;
    sensors_online: number;
    weather_datapoints: number;
    data_readiness_pct: number;
    loaded_datasets_count: number;
    total_required_datasets: number;
  };
  villages: VillageStat[];
  parcels: Parcel[];
  candidate_sites: CandidateSite[];
  relocation_matches: RelocationMatch[];
  runout_paths: RunoutPath[];
  intelligence_alerts: IntelligenceAlert[];
  flood_scenarios: FloodScenario[];
  weather_series: WeatherDataPoint[];
  source_registers: SourceRegister[];
  roadmap_items: RoadmapItem[];
  dem_sample?: DemSamplePoint[];
}

export type HazardType = 'landslide' | 'flood' | 'cloudburst' | 'coastal-erosion';

export type HazardModuleId = 
  | 'red-zone-update'
  | 'overview'
  | 'hazard-analysis'
  | 'area-comparison'
  | 'priority-evacuation'
  | 'safe-relocation'
  | 'authority-insights'
  | 'simulator'
  | 'rainfall-simulator'
  | 'carrying-capacity'
  | 'relocation-planning'
  | 'live-conditions'
  | 'alerts-voice'
  | 'authority-action'
  | 'reports';

export interface RiskDotLocation {
  id: string;
  name: string; // Only displayed inside the detail panel, never on the map canvas!
  lat: number;
  lng: number;
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  landslideRisk?: number;
  floodRisk?: number;
  surfaceSlope: number; // in degrees
  rainfall24h: number; // in mm
  soilMoisture?: number; // % or m3/m3
  peopleAtRisk: number;
  vulnerableFamilies: number;
  vulnerableAreaHa: number;
  specificConditions?: {
    label: string;
    value: string;
  }[];
  dataStatus: 'UPDATED' | 'HISTORICAL' | 'LIVE';
  dataSource: string;
}

export type ActiveView = 
  | 'home'
  | 'data-foundation'
  | 'red-zone-map'
  | 'priority-queue'
  | 'hazard-runout'
  | 'candidate-sites'
  | 'carrying-capacity'
  | 'relocation-engine'
  | 'sdma-command'
  | 'early-warning'
  | 'alerts'
  | 'dwssl'
  | 'intelligence-layers'
  | 'area-comparison'
  | 'what-if-simulation'
  | 'dataset-explorer'
  | 'methodology-pipeline'
  | 'project-report'
  | 'dashboard'
  | 'overview'
  | 'priority-evacuation'
  | 'safe-relocation'
  | 'land-capacity'
  | 'relocation-matrix'
  | 'live-weather'
  | 'hazard-analysis'
  | 'rainfall-simulator'
  | 'coastal-erosion'
  | 'flood-intelligence'
  | 'cloudburst-intelligence'
  | 'authority-action'
  | 'login';

// ----------------------------------------------------
// BAYESIAN RISK & REAL-TIME WEATHER INTELLIGENCE TYPES
// ----------------------------------------------------

export interface BayesianEvidenceBreakdown {
  rainfall_evidence: {
    metric: string;
    contribution_pct: number;
    description: string;
  };
  slope_evidence: {
    metric: string;
    contribution_pct: number;
    description: string;
  };
  soil_moisture_evidence: {
    metric: string;
    contribution_pct: number;
    description: string;
  };
  historical_evidence: {
    metric: string;
    contribution_pct: number;
    description: string;
  };
}

export interface BayesianRiskEstimate {
  area: string;
  category: string;
  landslide_probability: number;      // e.g. 0.87 (87%)
  lower_bound: number;                // e.g. 0.79 (79%)
  upper_bound: number;                // e.g. 0.93 (93%)
  credible_interval_str: string;      // "79%–93%"
  risk: 'VERY HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  hri_score: number;                  // e.g. 84.46
  model_status: string;
  evidence_breakdown: BayesianEvidenceBreakdown;
  why_this_probability: string;
}

export type WeatherConnectionStatus = 'LIVE' | 'OFFLINE' | 'FALLBACK';

export interface LiveWeatherFeed {
  currentPrecipitationMmHr: number;
  temperatureC: number;
  relativeHumidityPct: number;
  weatherCode: number;
  latitude: number;
  longitude: number;
  elevationM: number;
  lastUpdatedIso: string;
  lastUpdatedDisplay: string;
  connectionStatus: WeatherConnectionStatus;
  dataSource: string;
  isFallback: boolean;
  hourlyPrecipitation: { time: string; precipitation: number }[];
  hourlySoilMoisture0_1cm: number[];
  hourlySoilMoisture1_3cm: number[];
  alertLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  isThresholdExceeded: boolean;
}

