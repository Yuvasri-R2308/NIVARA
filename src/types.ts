export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type UrgencyPhase = 'Immediate' | 'Short-Term' | 'Medium-Term' | 'Monitor';
export type ConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW';

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

export type ActiveView = 
  | 'data-foundation'
  | 'red-zone-map'
  | 'priority-queue'
  | 'hazard-runout'
  | 'candidate-sites'
  | 'carrying-capacity'
  | 'relocation-engine'
  | 'sdma-command'
  | 'early-warning'
  | 'intelligence-layers'
  | 'area-comparison'
  | 'what-if-simulation'
  | 'dataset-explorer'
  | 'methodology-pipeline';
