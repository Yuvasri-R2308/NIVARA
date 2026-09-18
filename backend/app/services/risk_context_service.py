import json
import math
from pathlib import Path
from typing import Dict, Any, List, Optional
from ..config.settings import settings

# Grounded Area Hazard Registry (Identical to verified frontend ground-truth)
AREA_HAZARD_REGISTRY: Dict[str, Dict[str, Any]] = {
    'Meppadi': {
        'name': 'Meppadi (Mundakkai / Chooralmala)',
        'village_id': 'MEP',
        'category': 'Disaster Epicenter',
        'risk_score': 84.5,
        'risk_level': 'CRITICAL',
        'landslide_prob': 94,
        'flood_prob': 86,
        'slope_deg': 38.5,
        'rainfall_24h': 284.5,
        'soil_moisture': 98,
        'history_freq': 95,
        'census_population': 24170,
        'exposed_population': 4800,
        'families_count': 250,
        'high_risk_parcels': 250,
        'total_parcels': 250,
        'primary_hazard': 'Catastrophic Debris Flow & Slope Liquefaction',
        'summary': 'Extreme convergence of 38.5° mountain scarps, 284.5mm cloudburst precipitation, and regolith liquefaction along Chembra peak drainage.',
        'action_required': 'Mandatory immediate physical evacuation of 250 families to Kalpetta-Vythiri Institutional Reserve.',
        'assigned_safe_site': 'Kalpetta-Vythiri Institutional Reserve (CCAS 93.4)',
        'assigned_safe_site_id': 'KL-WYD-S01',
        'travel_time_convoy_mins': 28,
        'travel_distance_km': 14.8,
        'coordinates': [11.554, 76.128]
    },
    'Achooranam': {
        'name': 'Achooranam (Plantation Foothills)',
        'village_id': 'ACH',
        'category': 'Slope Hazard Zone',
        'risk_score': 44.3,
        'risk_level': 'HIGH',
        'landslide_prob': 56,
        'flood_prob': 34,
        'slope_deg': 18.2,
        'rainfall_24h': 178.0,
        'soil_moisture': 71,
        'history_freq': 48,
        'census_population': 12450,
        'exposed_population': 1240,
        'families_count': 77,
        'high_risk_parcels': 77,
        'total_parcels': 250,
        'primary_hazard': 'Steep Tea Estate Slope Creep & Gully Erosion',
        'summary': 'Moderate landslide susceptibility due to terrace cutting and 18.2° slope gradient; well-drained but requires drainage fortification.',
        'action_required': 'Phased relocation of 77 high-risk slope edge homes; construct retaining bench walls along estate roads.',
        'assigned_safe_site': 'Achoor East Ridgeline Foothill (CCAS 83.6)',
        'assigned_safe_site_id': 'KL-WYD-S04',
        'travel_time_convoy_mins': 16,
        'travel_distance_km': 6.2,
        'coordinates': [11.591, 76.012]
    },
    'Kottathara': {
        'name': 'Kottathara (Kabini River Basin)',
        'village_id': 'KOT',
        'category': 'River Valley Zone',
        'risk_score': 44.1,
        'risk_level': 'HIGH',
        'landslide_prob': 22,
        'flood_prob': 78,
        'slope_deg': 6.5,
        'rainfall_24h': 154.0,
        'soil_moisture': 82,
        'history_freq': 68,
        'census_population': 18920,
        'exposed_population': 890,
        'families_count': 69,
        'high_risk_parcels': 69,
        'total_parcels': 250,
        'primary_hazard': 'Seasonal River Inundation & Silt Deposition',
        'summary': 'High flood hazard across low-lying riverbank parcels with waterlogging during peak monsoon discharges; minimal landslide risk on gentle 6.5° plains.',
        'action_required': 'Relocate 69 flood-plain homes to elevated southern terrace buffer; install automated river level telemetry.',
        'assigned_safe_site': 'Kottathara Valley South Safe Buffer (CCAS 87.5)',
        'assigned_safe_site_id': 'KL-WYD-S03',
        'travel_time_convoy_mins': 14,
        'travel_distance_km': 5.8,
        'coordinates': [11.685, 76.039]
    },
    'Kuppadithara': {
        'name': 'Kuppadithara (Stable Agricultural Plateau)',
        'village_id': 'KUP',
        'category': 'Flatland Buffer',
        'risk_score': 40.7,
        'risk_level': 'MODERATE',
        'landslide_prob': 18,
        'flood_prob': 38,
        'slope_deg': 5.8,
        'rainfall_24h': 138.4,
        'soil_moisture': 54,
        'history_freq': 25,
        'census_population': 14200,
        'exposed_population': 320,
        'families_count': 28,
        'high_risk_parcels': 28,
        'total_parcels': 250,
        'primary_hazard': 'Local Drainage Bottlenecks (Low Regional Hazard)',
        'summary': 'Predominantly stable lateritic plateau with low overall hazard index (40.7/100); 28 isolated stream boundary parcels require minor setback buffers.',
        'action_required': 'Designated as primary safe receiving destination for Meppadi & Achooranam displaced families.',
        'assigned_safe_site': 'Kuppadithara North Plateau (CCAS 90.2)',
        'assigned_safe_site_id': 'KL-WYD-S02',
        'travel_time_convoy_mins': 12,
        'travel_distance_km': 4.5,
        'coordinates': [11.658, 76.009]
    },
    'Kalpetta': {
        'name': 'Kalpetta (District HQ Ridge)',
        'village_id': 'KAL',
        'category': 'Urban Centre',
        'risk_score': 18.5,
        'risk_level': 'LOW',
        'landslide_prob': 12,
        'flood_prob': 14,
        'slope_deg': 7.2,
        'rainfall_24h': 128.0,
        'soil_moisture': 42,
        'history_freq': 15,
        'census_population': 31525,
        'exposed_population': 180,
        'families_count': 12,
        'high_risk_parcels': 8,
        'total_parcels': 180,
        'primary_hazard': 'Urban Stormwater Overflow',
        'summary': 'High-elevation administrative ridge with solid bedrock foundations, four-lane highway connectivity, and full municipal utility capacity.',
        'action_required': 'Host the primary SDMA central emergency operations and institutional transit shelters.',
        'assigned_safe_site': 'Kalpetta-Vythiri Institutional Reserve (CCAS 93.4)',
        'assigned_safe_site_id': 'KL-WYD-S01',
        'travel_time_convoy_mins': 0,
        'travel_distance_km': 0,
        'coordinates': [11.608, 76.082]
    },
    'Vythiri': {
        'name': 'Vythiri (Ghat Pass Corridor)',
        'village_id': 'VYT',
        'category': 'Slope Hazard Zone',
        'risk_score': 58.2,
        'risk_level': 'HIGH',
        'landslide_prob': 62,
        'flood_prob': 26,
        'slope_deg': 22.4,
        'rainfall_24h': 220.0,
        'soil_moisture': 79,
        'history_freq': 58,
        'census_population': 16840,
        'exposed_population': 1450,
        'families_count': 92,
        'high_risk_parcels': 84,
        'total_parcels': 200,
        'primary_hazard': 'Ghat Highway Slope Slip & Water Infiltration',
        'summary': 'Extremely high precipitation zone (220mm/24h) along the Thamarassery ghat ridge; vulnerable to road-cutting soil slips.',
        'action_required': 'Active road sensors and early traffic diversion during monsoon red alert days.',
        'assigned_safe_site': 'Kalpetta-Vythiri Institutional Reserve (CCAS 93.4)',
        'assigned_safe_site_id': 'KL-WYD-S01',
        'travel_time_convoy_mins': 22,
        'travel_distance_km': 11.4,
        'coordinates': [11.551, 76.041]
    },
    'Padinharethara': {
        'name': 'Padinharethara (Banasura Reservoir Zone)',
        'village_id': 'PAD',
        'category': 'River Valley Zone',
        'risk_score': 38.6,
        'risk_level': 'MODERATE',
        'landslide_prob': 28,
        'flood_prob': 52,
        'slope_deg': 9.4,
        'rainfall_24h': 165.0,
        'soil_moisture': 64,
        'history_freq': 38,
        'census_population': 15680,
        'exposed_population': 640,
        'families_count': 45,
        'high_risk_parcels': 36,
        'total_parcels': 190,
        'primary_hazard': 'Reservoir Backwater & Dam Spill Surge',
        'summary': 'Adjacent to Banasura Sagar dam; low landslide risk on northern slopes, but lakeside habitations require flood safety margins.',
        'action_required': 'Maintain 50m buffer from reservoir high-flood level; designate western ridge as secondary safe transit zone.',
        'assigned_safe_site': 'Padinharethara West Elevation Ridge (CCAS 79.8)',
        'assigned_safe_site_id': 'KL-WYD-S05',
        'travel_time_convoy_mins': 10,
        'travel_distance_km': 4.2,
        'coordinates': [11.668, 75.952]
    },
    'Mananthavady': {
        'name': 'Mananthavady (Northern Plains)',
        'village_id': 'MAN',
        'category': 'River Valley Zone',
        'risk_score': 32.4,
        'risk_level': 'MODERATE',
        'landslide_prob': 14,
        'flood_prob': 64,
        'slope_deg': 4.8,
        'rainfall_24h': 142.0,
        'soil_moisture': 66,
        'history_freq': 42,
        'census_population': 45080,
        'exposed_population': 760,
        'families_count': 52,
        'high_risk_parcels': 40,
        'total_parcels': 240,
        'primary_hazard': 'Mananthavady River Lowland Flash Flooding',
        'summary': 'Gentle agricultural basin with 4.8° slope; low landslide vulnerability but susceptible to riverbank overflows during continuous rainfall.',
        'action_required': 'River dredging, embankment reinforcement, and community flood alert sirens.',
        'assigned_safe_site': 'Kuppadithara North Plateau (CCAS 90.2)',
        'assigned_safe_site_id': 'KL-WYD-S02',
        'travel_time_convoy_mins': 32,
        'travel_distance_km': 19.5,
        'coordinates': [11.802, 76.003]
    },
    'Sulthan Bathery': {
        'name': 'Sulthan Bathery (Eastern High Plain)',
        'village_id': 'SLT',
        'category': 'Flatland Buffer',
        'risk_score': 14.8,
        'risk_level': 'LOW',
        'landslide_prob': 6,
        'flood_prob': 16,
        'slope_deg': 3.2,
        'rainfall_24h': 96.0,
        'soil_moisture': 32,
        'history_freq': 8,
        'census_population': 45417,
        'exposed_population': 95,
        'families_count': 6,
        'high_risk_parcels': 4,
        'total_parcels': 210,
        'primary_hazard': 'Minor Urban Stormwater Runoff (Safest District Region)',
        'summary': 'Located on the rain-shadow eastern plateau with only 96mm rainfall; lowest multi-hazard risk index in Wayanad district (14.8/100).',
        'action_required': 'Long-term regional resettlement reserve and logistics supply base.',
        'assigned_safe_site': 'Kalpetta-Vythiri Institutional Reserve (CCAS 93.4)',
        'assigned_safe_site_id': 'KL-WYD-S01',
        'travel_time_convoy_mins': 40,
        'travel_distance_km': 25.0,
        'coordinates': [11.662, 76.257]
    }
}

SAFE_SITES_REGISTRY: Dict[str, Dict[str, Any]] = {
    'KL-WYD-S01': {
        'site_id': 'KL-WYD-S01',
        'name': 'Kalpetta-Vythiri Institutional Reserve (Safe Zone D)',
        'village': 'Kalpetta',
        'ccas_score': 93.4,
        'usable_area_ha': 12.5,
        'capacity_families': 550,
        'capacity_persons': 2200,
        'slope_deg': 3.8,
        'rainfall_24h': 128.0,
        'landslide_prob': 2,
        'flood_prob': 3,
        'soil_moisture': 34,
        'access_road': 'Direct NH766 4-lane connection (0m buffer)',
        'water_supply': 'Existing municipal 100kL overhead tank',
        'power_grid': '33kV substation feeder line on site',
        'description': 'Flat institutional hilltop bench outside all GSI landslide corridors with immediate NH-766 highway access.',
        'coordinates': [11.602, 76.082]
    },
    'KL-WYD-S02': {
        'site_id': 'KL-WYD-S02',
        'name': 'Kuppadithara North Plateau (Safe Zone A)',
        'village': 'Kuppadithara',
        'ccas_score': 90.2,
        'usable_area_ha': 9.8,
        'capacity_families': 420,
        'capacity_persons': 1680,
        'slope_deg': 4.6,
        'rainfall_24h': 134.0,
        'landslide_prob': 3,
        'flood_prob': 4,
        'soil_moisture': 38,
        'access_road': 'State Highway 54 (150m feeder)',
        'water_supply': 'Borewell yield 12,000 LPH + piped supply',
        'power_grid': '11kV dedicated transformer grid',
        'description': 'Gentle lateritic plateau with municipal piped water trunk line and 0% historical flood recurrence.',
        'coordinates': [11.665, 76.012]
    },
    'KL-WYD-S03': {
        'site_id': 'KL-WYD-S03',
        'name': 'Kottathara Valley South Safe Buffer (Safe Zone B)',
        'village': 'Kottathara',
        'ccas_score': 87.5,
        'usable_area_ha': 7.4,
        'capacity_families': 320,
        'capacity_persons': 1280,
        'slope_deg': 5.2,
        'rainfall_24h': 146.0,
        'landslide_prob': 5,
        'flood_prob': 6,
        'soil_moisture': 44,
        'access_road': 'Panchayat double-lane blacktop road',
        'water_supply': 'Local spring source + filter plant',
        'power_grid': '11kV rural feeder network',
        'description': 'Elevated agricultural terrace set 28m above the 100-year Kabini flood level with power grid.',
        'coordinates': [11.678, 76.042]
    },
    'KL-WYD-S04': {
        'site_id': 'KL-WYD-S04',
        'name': 'Achoor East Ridgeline Foothill (Safe Zone C)',
        'village': 'Achooranam',
        'ccas_score': 83.6,
        'usable_area_ha': 6.2,
        'capacity_families': 250,
        'capacity_persons': 1000,
        'slope_deg': 6.8,
        'rainfall_24h': 162.0,
        'landslide_prob': 7,
        'flood_prob': 5,
        'soil_moisture': 49,
        'access_road': 'Estate main road (requires 300m widening)',
        'water_supply': 'Gravity-fed highland reservoir',
        'power_grid': 'Local estate transformer tie-in',
        'description': 'Well-drained foothill bench with high basalt soil shear strength; requires 400m feeder link.',
        'coordinates': [11.598, 76.025]
    },
    'KL-WYD-S05': {
        'site_id': 'KL-WYD-S05',
        'name': 'Padinharethara West Elevation Ridge (Safe Zone E)',
        'village': 'Padinharethara',
        'ccas_score': 79.8,
        'usable_area_ha': 4.5,
        'capacity_families': 180,
        'capacity_persons': 720,
        'slope_deg': 7.9,
        'rainfall_24h': 168.0,
        'landslide_prob': 9,
        'flood_prob': 8,
        'soil_moisture': 52,
        'access_road': 'PWD rural blacktop (steeper 8% gradient)',
        'water_supply': 'Banasura reservoir auxiliary line',
        'power_grid': 'Single phase grid (upgrade needed)',
        'description': 'High ridge bench bordering Banasura reservoir; stable bedrock but steeper access gradient.',
        'coordinates': [11.662, 75.945]
    }
}

class RiskContextService:
    _instance = None

    def __init__(self):
        self.data: Dict[str, Any] = {}
        self.bayesian_risk: Dict[str, Any] = {}
        self.xgboost_hazard: Dict[str, Any] = {}
        self._load_datasets()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RiskContextService()
        return cls._instance

    def _load_datasets(self):
        # Attempt to load data.json from processed or public
        for path in [settings.PROCESSED_DATA_PATH, settings.PUBLIC_DATA_PATH]:
            if path.exists():
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        self.data = json.load(f)
                    break
                except Exception as e:
                    print(f"Warning: could not read {path}: {e}")

        # Load Bayesian risk dataset
        if settings.BAYESIAN_DATA_PATH.exists():
            try:
                with open(settings.BAYESIAN_DATA_PATH, 'r', encoding='utf-8') as f:
                    self.bayesian_risk = json.load(f)
            except Exception as e:
                print(f"Warning: could not read {settings.BAYESIAN_DATA_PATH}: {e}")

        # Load XGBoost results
        if settings.XGBOOST_DATA_PATH.exists():
            try:
                with open(settings.XGBOOST_DATA_PATH, 'r', encoding='utf-8') as f:
                    self.xgboost_hazard = json.load(f)
            except Exception as e:
                print(f"Warning: could not read {settings.XGBOOST_DATA_PATH}: {e}")

    def resolve_location(self, query: str) -> Dict[str, Any]:
        """Match location query against known Area Hazard Profiles."""
        q = (query or "").lower().strip()
        
        # Check direct area name match
        for key, profile in AREA_HAZARD_REGISTRY.items():
            if key.lower() in q or profile['name'].lower() in q or profile['village_id'].lower() == q:
                return profile

        # Check safe sites
        for site_id, site in SAFE_SITES_REGISTRY.items():
            if site_id.lower() in q or site['name'].lower() in q or site['village'].lower() in q:
                # Convert safe site to area profile format
                return {
                    'name': site['name'],
                    'village_id': site['village'][:3].upper(),
                    'category': 'Safe Resettlement Site',
                    'risk_score': round(100 - site['ccas_score'], 1),
                    'risk_level': 'LOW',
                    'landslide_prob': site['landslide_prob'],
                    'flood_prob': site['flood_prob'],
                    'slope_deg': site['slope_deg'],
                    'rainfall_24h': site['rainfall_24h'],
                    'soil_moisture': site['soil_moisture'],
                    'history_freq': 5,
                    'census_population': site['capacity_persons'],
                    'exposed_population': site['capacity_persons'],
                    'families_count': site['capacity_families'],
                    'high_risk_parcels': 0,
                    'total_parcels': 0,
                    'primary_hazard': 'Safe Carrying Capacity Receptor Zone',
                    'summary': site['description'],
                    'action_required': f"Approved for immediate relocation of {site['capacity_families']} families ({site['capacity_persons']} people).",
                    'assigned_safe_site': site['name'],
                    'assigned_safe_site_id': site_id,
                    'travel_time_convoy_mins': 0,
                    'travel_distance_km': 0,
                    'coordinates': site['coordinates']
                }

        # Check landmarks / special keywords
        if 'mundakkai' in q or 'chooralmala' in q or 'chembra' in q:
            return AREA_HAZARD_REGISTRY['Meppadi']
        if 'banasura' in q:
            return AREA_HAZARD_REGISTRY['Padinharethara']
        if 'kabini' in q:
            return AREA_HAZARD_REGISTRY['Kottathara']

        # Default to Meppadi (Epicenter)
        return AREA_HAZARD_REGISTRY['Meppadi']

    def calculate_bayesian_probability(
        self,
        location_name: str,
        rainfall_override: Optional[float] = None,
        slope_override: Optional[float] = None,
        soil_override: Optional[float] = None
    ) -> Dict[str, Any]:
        """Compute Beta-Logit Bayesian posterior probability with 95% Credible Interval."""
        profile = self.resolve_location(location_name)
        rain = rainfall_override if rainfall_override is not None else profile['rainfall_24h']
        slope = slope_override if slope_override is not None else profile['slope_deg']
        soil = soil_override if soil_override is not None else profile['soil_moisture']
        hist = profile['history_freq']

        # Beta(1.5, 8.5) regional prior mean = 0.15
        prior_mean = 0.15
        weight_rain = 0.35
        weight_slope = 0.30
        weight_soil = 0.20
        weight_hist = 0.15

        rain_norm = min(1.0, max(0.0, rain / 285.0))
        slope_norm = min(1.0, max(0.0, slope / 40.0))
        soil_norm = min(1.0, max(0.0, soil / 100.0))
        hist_norm = min(1.0, max(0.0, hist / 100.0))

        composite_evidence = (
            (rain_norm * weight_rain) +
            (slope_norm * weight_slope) +
            (soil_norm * weight_soil) +
            (hist_norm * weight_hist)
        )

        prior_log_odds = math.log(prior_mean / (1.0 - prior_mean))
        evidence_shift = (composite_evidence - 0.25) * 5.25
        posterior_log_odds = prior_log_odds + evidence_shift
        raw_prob = 1.0 / (1.0 + math.exp(-posterior_log_odds))
        posterior_prob = max(0.02, min(0.98, raw_prob))

        # 95% Credible Interval (Concentration kappa = 72.0)
        kappa = 72.0
        post_alpha = posterior_prob * kappa
        post_beta = (1.0 - posterior_prob) * kappa
        variance = (post_alpha * post_beta) / ((post_alpha + post_beta) ** 2 * (post_alpha + post_beta + 1))
        std_dev = math.sqrt(variance)

        lower_bound = max(0.01, round(posterior_prob - 1.96 * std_dev, 2))
        upper_bound = min(0.99, round(posterior_prob + 1.96 * std_dev, 2))
        mean_prob = round(posterior_prob, 2)

        return {
            'mean_probability': mean_prob,
            'lower_bound': lower_bound,
            'upper_bound': upper_bound,
            'credible_interval_str': f"{int(lower_bound * 100)}%–{int(upper_bound * 100)}%",
            'weights': {
                'rainfall_contrib_pct': round(rain_norm * weight_rain * 100, 1),
                'slope_contrib_pct': round(slope_norm * weight_slope * 100, 1),
                'soil_contrib_pct': round(soil_norm * weight_soil * 100, 1),
                'history_contrib_pct': round(hist_norm * weight_hist * 100, 1)
            }
        }

    def calculate_factor_of_safety(
        self,
        slope_deg: float,
        soil_saturation_pct: float,
        pore_pressure_kpa: Optional[float] = None
    ) -> Dict[str, Any]:
        """Compute Mohr-Coulomb Factor of Safety (FoS)."""
        c_prime = 12.5       # Effective cohesion (kPa)
        phi_prime = math.radians(28.0) # Friction angle (28°)
        gamma_sat = 19.2     # Saturated unit weight (kN/m³)
        z = 2.8              # Failure depth (m)
        theta = math.radians(max(1.0, slope_deg))

        # Compute pore water pressure u from soil moisture if not provided
        if pore_pressure_kpa is None:
            # Hydrostatic pressure scaled by saturation exceedance
            pore_pressure_kpa = max(0.0, (soil_saturation_pct / 100.0) * 9.81 * z * 0.85)

        normal_stress = gamma_sat * z * (math.cos(theta) ** 2)
        effective_normal_stress = max(0.1, normal_stress - pore_pressure_kpa)
        shear_strength = c_prime + (effective_normal_stress * math.tan(phi_prime))
        shear_stress = gamma_sat * z * math.sin(theta) * math.cos(theta)

        fos = round(shear_strength / max(0.01, shear_stress), 2)
        status = "STABLE" if fos >= 1.5 else "CRITICAL SLIP DEFICIT" if fos < 1.0 else "MARGINAL"

        return {
            'factor_of_safety': fos,
            'status': status,
            'effective_cohesion_kpa': c_prime,
            'friction_angle_deg': 28.0,
            'pore_water_pressure_kpa': round(pore_pressure_kpa, 2),
            'effective_normal_stress_kpa': round(effective_normal_stress, 2),
            'shear_strength_kpa': round(shear_strength, 2),
            'shear_stress_kpa': round(shear_stress, 2)
        }

    def get_all_summary(self) -> Dict[str, Any]:
        metrics = self.data.get('metrics_summary', {
            'total_parcels': 1000,
            'total_villages': 4,
            'total_high_risk_parcels': 424,
            'total_medium_risk_parcels': 562,
            'total_low_risk_parcels': 14,
            'total_candidate_sites': 5,
            'total_candidate_capacity_families': 1720,
            'total_candidate_capacity_persons': 6880,
            'immediate_relocation_needed_families': 250,
            'immediate_relocation_needed_persons': 1000,
            'active_hazard_red_zones': 1
        })
        return metrics

risk_context_service = RiskContextService.get_instance()
