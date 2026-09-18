import json
from typing import Dict, Any, List, Optional
from ..schemas.copilot_schemas import ChatRequest, MetricPill, RouteBlueprint, ActionButton, FileEvidenceItem
from .risk_context_service import risk_context_service, AREA_HAZARD_REGISTRY, SAFE_SITES_REGISTRY
from ..utils.prompt_templates import MASTER_SYSTEM_PROMPT, build_multilingual_instruction

class ContextBuilder:
    """Orchestrates NIVARA risk data, GIS location anchors, and multimodal file evidence into structured AI context."""

    def build_copilot_context(self, request: ChatRequest) -> Dict[str, Any]:
        user_query = request.message.lower().strip()
        
        # 1. Determine target spatial location anchor dynamically from current query or history
        target_loc_name = None

        # A. Check current query for explicit location mention
        for key in AREA_HAZARD_REGISTRY.keys():
            if key.lower() in user_query:
                target_loc_name = key
                break
        
        # B. Check special landmarks in query
        if not target_loc_name:
            if any(w in user_query for w in ['mundakkai', 'chooralmala', 'chembra']):
                target_loc_name = 'Meppadi'
            elif 'banasura' in user_query:
                target_loc_name = 'Padinharethara'
            elif 'kabini' in user_query:
                target_loc_name = 'Kottathara'
            elif 'thamarassery' in user_query:
                target_loc_name = 'Vythiri'

        # C. If not in current query, inspect recent history for conversational continuity
        if not target_loc_name and request.history:
            for msg in reversed(request.history[-4:]):
                hist_text = msg.content.lower()
                for key in AREA_HAZARD_REGISTRY.keys():
                    if key.lower() in hist_text:
                        target_loc_name = key
                        break
                if target_loc_name:
                    break

        # D. Fallback to UI selected village or default
        if not target_loc_name:
            if request.selected_village and request.selected_village != "ALL":
                target_loc_name = request.selected_village
            else:
                target_loc_name = "Meppadi"

        profile = risk_context_service.resolve_location(target_loc_name)
        village_key = profile.get('name', 'Meppadi').split(' ')[0]

        # 2. Adjust for simulated rainfall multiplier if active
        multiplier = request.rainfall_multiplier or 1.0
        effective_rain = profile['rainfall_24h'] * multiplier
        effective_soil = min(100.0, profile['soil_moisture'] * (1.0 + (multiplier - 1.0) * 0.35))
        
        # 3. Compute dynamic Bayesian Probability & Mohr-Coulomb FoS for this specific location
        bayes_res = risk_context_service.calculate_bayesian_probability(
            location_name=village_key,
            rainfall_override=effective_rain,
            slope_override=profile['slope_deg'],
            soil_override=effective_soil
        )

        fos_res = risk_context_service.calculate_factor_of_safety(
            slope_deg=profile['slope_deg'],
            soil_saturation_pct=effective_soil
        )

        # 4. Resolve safe resettlement site for this specific location
        safe_site_id = profile.get('assigned_safe_site_id', 'KL-WYD-S01')
        safe_site = SAFE_SITES_REGISTRY.get(safe_site_id, SAFE_SITES_REGISTRY['KL-WYD-S01'])

        # 5. Extract weather telemetry
        weather_info = f"Current 24h precipitation: {effective_rain:.1f} mm."
        if request.live_weather:
            precip = request.live_weather.get('currentPrecipitationMmHr', 0.0)
            temp = request.live_weather.get('temperatureC', 21.5)
            humidity = request.live_weather.get('relativeHumidityPct', 88)
            status = request.live_weather.get('connectionStatus', 'LIVE')
            weather_info = f"Real-time Telemetry ({status}): Current Rain {precip} mm/h | Temp {temp}°C | Humidity {humidity}%."

        # Explicitly lock context if selected_hazard is provided
        selected_h = (request.selected_hazard or "").lower()

        # Detect if query or active view relates to Dibrugarh / Assam Flood Intelligence
        is_flood = (
            selected_h == 'flood' or
            request.active_view == 'flood-intelligence' or
            (selected_h == "" and any(w in user_query for w in [
                'dibrugarh', 'assam', 'brahmaputra', 'chabua', 'moran', 'naharkatia',
                'tengakhat', 'tingkhong', 'multi chapari', 'kopili', 'fsi', 'flood hazard',
                'inundation', 'asdma', 'antyodaya', 'ifi', 'inventory', 'saharia', 
                'hydrosense', 'sdrf', 'procurement', 'tender', 'drims', 'livestock'
            ]))
        )

        # Detect if query or active view relates to Coastal Erosion
        is_coastal = (
            selected_h == 'coastal-erosion' or
            request.active_view == 'coastal-erosion' or
            (selected_h == "" and any(w in user_query for w in [
                'coast', 'coastal', 'erosion', 'shoreline', 'brahmapur', 'ganjam', 
                'gopalpur', 'podampeta', 'boxipalli', 'arjipalli', 'aryapalli', 
                'phailin', 'titli', 'cvi', 'pvi', 'svi', 'dsas', 'mndwi', 'bsi'
            ]))
        )

        # Detect if query or active view relates to Uttarakhand Cloudburst Intelligence
        is_cloudburst = (
            selected_h == 'cloudburst' or
            request.active_view == 'cloudburst-intelligence' or
            (selected_h == "" and any(w in user_query for w in [
                'cloudburst', 'uttarakhand', 'kedarnath', 'badrinath', 'mandakini',
                'malpa', 'joshimath', 'mussoorie', 'chamoli', 'rudraprayag',
                'pithoragarh', 'uttarkashi', 'tehri', 'dehradun', 'nainital',
                'dharali', 'ghansali', 'powerbi', 'nasa power', 'day-ahead',
                'rh2m', 'prectot', 'staging hub', 'guptkashi'
            ]))
        )

        # If explicitly landslide, ensure others are false
        if selected_h == 'landslide':
            is_flood = False
            is_coastal = False
            is_cloudburst = False

        if is_flood:
            context_lines = [
                "=== ACTIVE LOCATION CONTEXT: DIBRUGARH DISTRICT (ASSAM, INDIA) ===",
                "• Study Area: Dibrugarh District, Assam, India (Brahmaputra Valley Flood Basin)",
                "• Population: 1,510,242 (Census 2011) | Area: ~3,381 sq. km | 7 Revenue Circles",
                "• Datasets Integrated:",
                "  1. IIT Delhi India Flood Inventory (IFI v3.0, HydroSense Lab & IMD, Saharia et al., 2021, Zenodo: 10.5281/zenodo.4742142)",
                "  2. Assam Flood Data Ecosystem & DRIMS (CivicDataLab & ASDMA, 448 monthly records across 7 circles)",
                "  3. ASDMA 2022 Disaster Records, ISRO Bhuvan Inundation, BharatMaps Infrastructure, Antyodaya 2020.",
                "• IIT Delhi IFI Historical Grounding (1971–2023 / 53 Years):",
                "  - Total Historical Flood Events: 155 in Dibrugarh (out of 916 statewide and 6,876 national)",
                "  - Percent Flooded Area: 11.91% of district area (Permanent water: 4.81%)",
                "  - Mean Flood Duration: 10.0 continuous days per event",
                "  - Cumulative Fatalities: 147 lives lost (47 injured) across historical registry",
                "  - Historic Milestones: 1974 (93 continuous days inundation), 1990 (54 days, 118 deaths), 2004 (48 days, 248 deaths)",
                "• Assam Flood Ecosystem & Public Financing Grounding (DRIMS / SDRF):",
                "  - Total Public Procurement Tenders: ₹211.34 Crore (₹2.11 Billion across 7 circles)",
                "  - SDRF Sanctions Awarded: ₹109.67 Crore (State Disaster Response Fund)",
                "  - Livestock Affected: 493,413 animals (big cattle, small animals, poultry)",
                "  - Submerged Crop Area: 19,204.5 hectares of fertile agricultural land",
                "• Scientific Reference: Kopili River Basin MCA Methodology (Flood Risk = Flood Hazard × Total Vulnerability).",
                "• Total Vulnerability Model: 0.40 × Social Vulnerability + 0.30 × Infrastructure Vulnerability + 0.30 × Land-Use Vulnerability.",
                "• Key Flood Hazard & Impact Metrics:",
                "  - Total Population Affected: 412,571 persons (Peak 2022 displacement: 188,381 persons)",
                "  - Submerged Crop Area: 20,246.11 hectares",
                "  - Damaged Road Corridors: 117 cuts (24 damaged bridges, 7 affected embankments)",
                "  - Mean Flood Susceptibility Index (FSI): 68.4 / 100 across the district",
                "• Revenue Circle Risk & Financing Hierarchy:",
                "  1. Chabua Circle: 320,132 pop affected, ₹66.28 Cr tenders, ₹15.67 Cr SDRF, 260,841 livestock affected, Risk CRITICAL (84.6/100, RPI P1)",
                "  2. Dibrugarh West Circle: 37,064 pop affected, 7,763 ha crop loss, 76,872 livestock, ₹16.65 Cr tenders, Risk CRITICAL (81.3/100, RPI P1)",
                "  3. Dibrugarh East Circle: ₹51.29 Cr tenders, 6,510 livestock, Risk HIGH (68.7/100, RPI P2)",
                "  4. Tingkhong Circle: ₹51.64 Cr tenders, ₹72.03 Cr repair works, Risk MODERATE (52.4/100, RPI P3)",
                "  5. Tengakhat Circle: ₹19.21 Cr tenders, 35,077 pop affected, Risk MODERATE (45.2/100, RPI P3)",
                "  6. Moran Circle: ₹3.68 Cr tenders, 117,067 livestock affected, Risk HIGH (72.1/100, RPI P2)",
                "  7. Naharkatiya Circle: ₹2.58 Cr tenders, 28,615 livestock, Risk LOW (39.8/100, RPI P4)",
                "• Vulnerable Habitations:",
                "  - Multi Chapari: River sandbar island, 420 hhd, 1,850 pax, RPI 91.2 (P1 IMMEDIATE, Dest: Barbaruah Campus, 6.8 km)",
                "  - Dikom Naharani: Brahmaputra bank, 510 hhd, 2,340 pax, RPI 89.6 (P1 IMMEDIATE, Dest: Panitola Hub, 7.4 km)",
                "  - Matak Kaibartagaon: Fishery community, 380 hhd, 1,620 pax, RPI 88.4 (P1 IMMEDIATE, Dest: Barbaruah Campus, 5.2 km)",
                "• Vetted Safe Relocation Destinations (CCAS Screened against Sphere Standards):",
                "  1. Barbaruah Higher Secondary Campus: Capacity 3,800 persons (3,350 available), CCAS 92.4/100, Water 285,000 L/d",
                "  2. Panitola Central Vocational Hub: Capacity 4,200 persons (3,600 available), CCAS 89.8/100, Water 315,000 L/d",
                "  3. Dibrugarh University Eastern Terrace: Capacity 5,000 persons (4,150 available), CCAS 94.6/100, Water 420,000 L/d",
                "  4. PHC Namtok Joypur High Ridge: Capacity 2,500 persons (2,300 available), CCAS 91.5/100, Water 190,000 L/d",
                "  Total Safe Available Capacity: 18,500 persons across 6 vetted inland hubs.",
                "• AHP Consistency: λ_max = 8.32, CI = 0.046, RI = 1.41, CR = 0.033 < 0.10 (Mathematically Validated ✅)",
                "• Validation Accuracy: ROC-AUC = 0.87, Precision 84.6%, Recall 88.2% validated against Sentinel-1 SAR observations.",
                f"• Active Dashboard View: {request.active_view}"
            ]
        elif is_coastal:
            context_lines = [
                "=== ACTIVE LOCATION CONTEXT: BRAHMAPUR COASTLINE (GANJAM DISTRICT, ODISHA) ===",
                "• Study Area: Brahmapur Coastline, Ganjam District, Odisha, India (Bay of Bengal)",
                "• Geographic Bounding Box: [84.68°E, 19.05°N] to [84.92°E, 19.42°N] | Coastline Monitored: ~37.0 km (25.5 km active DSAS stretch)",
                "• Dataset: 12-Year Multi-Temporal Remote Sensing Study (2013–2024) using Landsat 8 & Sentinel-2 composites and USGS DSAS 119 transects.",
                "• Key Shoreline Change Metrics:",
                "  - Mean Linear Regression Rate (LRR): -0.222 m/year (43.7% of coast under net erosion)",
                "  - Mean End Point Rate (EPR): -0.082 m/year",
                "  - Maximum Localized Erosion: -7.867 m/year (with extreme retreats up to -42.91 m/yr in unmitigated sectors)",
                "  - Maximum Accretion: +7.832 m/year (near Gopalpur port breakwater downdrift)",
                "  - Net Shoreline Movement (NSM): -0.90 m average shift",
                "  - Worst Erosion Year: 2022→2023 with -7.624 m mean shoreline retreat",
                "  - Best Accretion Year: 2017→2018 with +6.126 m mean shoreline expansion",
                "• Vulnerability Indices & AHP Validation:",
                "  - Physical Vulnerability Index (PVI): 71.4 / 100 (HIGH RISK) across 7 parameters: Shoreline change (-0.22 to -7.87 m/yr, wt 0.28), Slope (1.8°, wt 0.19), Geomorphology (Sandy beach/spits, wt 0.16), Wave height (1.76m mean, wt 0.14), Elevation (0-8m, wt 0.11), Sea-level rise (3.1 mm/yr, wt 0.07), Tidal range (1.85m, wt 0.05).",
                "  - Socio-Economic Vulnerability Index (SVI): 65.4 / 100 (HIGH RISK) across Population density (480 p/km²), Intertidal land loss (-19.9%), Evacuation roads, and Critical infrastructure (Gopalpur Port, lighthouses).",
                "  - Final Coastal Vulnerability Index (CVI): (PVI + SVI) / 2 = (71.4 + 65.4) / 2 = 68.4 / 100 (HIGH RISK).",
                "  - AHP Consistency: Principal Eigenvalue λ_max = 7.33, CI = 0.055, RI = 1.32, Consistency Ratio (CR) = 0.042 < 0.10 (Mathematically Consistent ✅).",
                "• Vulnerable Coastal Habitations & RPI Ranking:",
                "  1. Podampeta Estuarine Spit (Ganjam Block): 180 families (820 persons), erosion rate -6.85 m/yr, CVI 82.4, RPI Priority 88.5/100 (CRITICAL, IMMEDIATE RELOCATION). Assigned Safe Site: Humma Elevated Ridge Colony (4.8 km).",
                "  2. Boxipalli Coastal Hamlet (Rangeilunda Block): 195 families (950 persons), erosion rate -6.02 m/yr, CVI 78.6, RPI Priority 82.3/100 (CRITICAL, IMMEDIATE RELOCATION). Assigned Safe Site: Gopalpur Hilltop Campus Buffer (3.2 km).",
                "  3. Haripur Coastal Village: 120 families (580 persons), erosion rate -4.31 m/yr, RPI 74.6/100 (HIGH, SHORT-TERM).",
                "  4. Gopalpur Beachfront: 110 families (510 persons), erosion rate -2.85 m/yr, RPI 68.2/100 (HIGH, SHORT-TERM).",
                "  5. Arjipalli (Aryapalli) Coast: 45 families (210 persons), erosion rate -1.24 m/yr, RPI 61.0/100 (MODERATE).",
                "  Total Exposed Population: 14,280 persons (~650 families in critical 50m erosion buffer).",
                "• Historical Cyclone Validation:",
                "  - Cyclone Phailin (October 12, 2013): Category 5 equivalent (260 km/h) made landfall directly at Gopalpur Coast with 3.5m storm surge. Caused immediate -6.36 m shoreline retreat in 2013–2014.",
                "  - Cyclone Titli (October 11, 2018): Severe Cyclonic Storm (150 km/h) made landfall southwest of Gopalpur, triggering intense riverine backwater surge and barrier spit scouring.",
                "• Guidelines: Answer grounded in the actual dataset. Never invent fake values; if a metric is unavailable, state 'Data unavailable'. Connect to NIVARA RPI and CCAS.",
                f"• Active Dashboard View: {request.active_view}"
            ]
        elif is_cloudburst:
            context_lines = [
                "=== ACTIVE LOCATION CONTEXT: UTTARAKHAND HIMALAYAN CLOUDBURST INTELLIGENCE ===",
                "• Study Area: Uttarakhand Himalayan Belt, India (13 Districts, 20 Critical Hotspots)",
                "• Geographic Range: 77.5°E to 81.0°E, 28.5°N to 31.5°N | Elevations: 640m to 3,583m",
                "• Dataset Grounding: 36 Years of NASA POWER Meteorological Daily Time Series (1988–2024)",
                "• Historical Cloudburst Records: 167 verified cloudburst disaster events in official repository",
                "• Machine Learning Architecture: Day-Ahead Cloudburst Classifier (Random Forest, 15 Engineered Features)",
                "• Tuned Decision Threshold: 0.50 | Model ROC-AUC: 0.88 | Accuracy: 84.2% | Recall: 86.5%",
                "• Top Predictive Feature Importance Rankings:",
                "  1. RH2M (Relative Humidity at 2m): 8.87% - Atmospheric saturation trigger",
                "  2. PRECTOT_3d_mean (3-Day Antecedent Rainfall): 7.92% - Orogenic catchment pre-saturation",
                "  3. WS2M_lag1 (Lagged Wind Speed at 2m): 7.49% - Convective shear & moisture advection",
                "  4. T2M (Mean 2m Temperature): 6.92% - Thermal buoyancy for cloudburst updrafts",
                "  5. T2M_RANGE (Diurnal Temperature Range): 6.87% - Cloud deck & solar insolation indicator",
                "  6. PRECTOT_lag1 (Day-1 Antecedent Precipitation): 6.81% - Direct convective precursor",
                "  7. PRECTOT_7d_sum (7-Day Cumulative Moisture): 6.77% - Deep valley saturation index",
                "• 12 Famous Historical Disaster Backtests (Ground-Truth Validated):",
                "  1. Kedarnath Disaster (16 Jun 2013): 85.8% Cloudburst Probability (CRITICAL ALERT - Successful Day-Ahead Catch, 116.3 mm rain)",
                "  2. Malpa Rockfall & Cloudburst (18 Aug 1998): 87.2% Cloudburst Probability (377.8 mm rain, highest 24h recorded in dataset)",
                "  3. Mandakini Valley Floods (17 Jun 2013): 88.6% Cloudburst Probability (176.4 mm rain)",
                "  4. Mussoorie Cloudburst (10 Sep 2009): 84.1% Cloudburst Probability (173.0 mm rain)",
                "  5. Dharali Valley Flash Flood (16 Jul 2007): 82.7% Cloudburst Probability (142.1 mm rain)",
                "  6. Joshimath Glacier Calving (7 Feb 2021): 15.1% Low Probability (Correctly rejected non-cloudburst periglacial rock-ice failure - Zero False Alarm ✅)",
                "• Critical High-Risk Hotspots & RPI Priority:",
                "  - Kedarnath (Rudraprayag, 3,583m): 18 events, Max rain 144.2mm, RPI 94.2 (CRITICAL P1)",
                "  - Malpa (Pithoragarh, 2,200m): 14 events, Max rain 377.8mm, RPI 93.8 (CRITICAL P1)",
                "  - Mandakini Valley (Rudraprayag, 1,400m): 16 events, Max rain 176.4mm, RPI 91.5 (CRITICAL P1)",
                "  - Dharali (Uttarkashi, 2,680m): 12 events, Max rain 168.2mm, RPI 88.4 (CRITICAL P1)",
                "  - Badrinath (Chamoli, 3,133m): 11 events, Max rain 135.6mm, RPI 85.6 (CRITICAL P1)",
                "• Vetted High-Ground Safe Staging Hubs (Sphere Humanitarian Standard Compliant):",
                "  1. Guptkashi Resilient Helipad & Stadium Hub: 4,500 capacity, CCAS 93.2/100, 360,000 L/d water",
                "  2. Joshimath Safe Cantonment Plateau: 5,200 capacity, CCAS 91.8/100, 420,000 L/d water",
                "  3. Pithoragarh Naini-Saini Logistics Hub: 6,000 capacity, CCAS 94.5/100, 480,000 L/d water",
                "  4. Dehradun Maharana Pratap Sports Complex: 12,000 capacity, CCAS 96.8/100, 960,000 L/d water",
                "  5. Pauri Circuit Ridge Staging Grounds: 3,800 capacity, CCAS 89.4/100, 300,000 L/d water",
                "  6. Uttarkashi Matli ITBP Safe Terrace: 4,000 capacity, CCAS 92.1/100, 320,000 L/d water",
                "  Total Safe Evacuation Capacity: 35,500 persons across 6 vetted non-inundation ridges.",
                "• Operational Status: HISTORICAL / MODEL ANALYSIS (Zero fabricated data).",
                f"• Active Dashboard View: {request.active_view}"
            ]
        else:
            # Standard Wayanad / Kerala Location Context
            context_lines = [
                f"=== ACTIVE LOCATION CONTEXT: {profile['name']} ===",
                f"• Location Name: {profile['name']} ({profile['category']})",
                f"• Coordinates: {profile['coordinates']}",
                f"• Risk Level: {profile['risk_level']} (HRI Score: {profile['risk_score']} / 100)",
                f"• Primary Disaster Hazard: {profile['primary_hazard']}",
                f"• Hazard Summary: {profile['summary']}",
                f"• Terrain Slope: {profile['slope_deg']}° | 24h Rainfall: {effective_rain:.1f} mm | Soil Moisture: {effective_soil:.1f}%",
                f"• Bayesian Landslide Probability: {int(bayes_res['mean_probability'] * 100)}% (95% Credible Interval: {bayes_res['credible_interval_str']})",
                f"• Factor of Safety (FoS): {fos_res['factor_of_safety']} ({fos_res['status']})",
                f"• Exposed Population at Risk: {profile['exposed_population']:,} people ({profile['families_count']} vulnerable families)",
                f"• Total Census Population: {profile['census_population']:,} people",
                f"• Recommended Safe Relocation Site: {safe_site['name']} (CCAS Score: {safe_site['ccas_score']} / 100)",
                f"  - Safe Holding Capacity: {safe_site['capacity_persons']:,} people ({safe_site['capacity_families']} families)",
                f"  - Distance & Transit: {profile.get('travel_distance_km', 14.8)} km (~{profile.get('travel_time_convoy_mins', 28)} min convoy)",
                f"• Weather Status: {weather_info}",
                f"• Active Dashboard View: {request.active_view}"
            ]

        # 7. Add Uploaded File Evidence Summaries
        if request.files_evidence:
            context_lines.append("\n=== UPLOADED USER EVIDENCE (MULTIMODAL ATTACHMENTS) ===")
            for idx, file_item in enumerate(request.files_evidence):
                context_lines.append(f"\n[Attachment {idx+1}: {file_item.file_name} ({file_item.file_type})]")
                context_lines.append(f"• Summary: {file_item.extracted_summary}")
                if file_item.data_preview:
                    context_lines.append(f"• Content Preview:\n{file_item.data_preview}")

        context_text = "\n".join(context_lines)

        # 8. Build System Prompt with Multilingual Directives
        lang_instruction = build_multilingual_instruction(request.language)
        system_instruction = f"{MASTER_SYSTEM_PROMPT}\n\n### ACTIVE LANGUAGE INSTRUCTION:\n{lang_instruction}"

        # 9. Format UI Metric Pills (Only attach when answering risk, population, or relocation queries)
        is_casual = any(user_query == kw or user_query.startswith(kw + " ") for kw in [
            "hi", "hello", "hey", "good morning", "good evening", "how are you", "thank you", "thanks", "okay", "ok", "who are you"
        ])

        metric_pills: List[MetricPill] = []
        if not is_casual:
            if is_flood:
                metric_pills = [
                    MetricPill(label="Risk Level", value="CRITICAL", color="#E8543E"),
                    MetricPill(label="Exposed Pop", value="412,571", color="#E8543E"),
                    MetricPill(label="Mean FSI", value="68.4 / 100", color="#E8A63E"),
                    MetricPill(label="Safe Capacity", value="18,500", color="#4ADE9A")
                ]
            elif is_coastal:
                metric_pills = [
                    MetricPill(label="Risk Level", value="HIGH RISK", color="#E8543E"),
                    MetricPill(label="CVI Score", value="68.4 / 100", color="#E8A63E"),
                    MetricPill(label="Erosion Rate", value="-0.22 m/yr", color="#E8A63E"),
                    MetricPill(label="Top Hotspot", value="Podampeta", color="#E8543E")
                ]
            elif is_cloudburst:
                metric_pills = [
                    MetricPill(label="Risk Level", value="HIGH ALERT", color="#E8543E"),
                    MetricPill(label="Model ROC-AUC", value="0.88", color="#4ADE9A"),
                    MetricPill(label="Kedarnath Catch", value="85.8% Prob", color="#E8543E"),
                    MetricPill(label="Staging Capacity", value="35,500 Pax", color="#38BDF8")
                ]
            else:
                metric_pills = [
                    MetricPill(
                        label="Risk Level",
                        value=f"{profile['risk_level']}",
                        color="#E8543E" if profile['risk_level'] in ['CRITICAL', 'HIGH'] else "#FBBF24" if profile['risk_level'] == 'MODERATE' else "#4ADE9A"
                    ),
                    MetricPill(
                        label="HRI Score",
                        value=f"{profile['risk_score']}/100",
                        color="#E8543E" if profile['risk_score'] >= 60 else "#FBBF24" if profile['risk_score'] >= 35 else "#4ADE9A"
                    ),
                    MetricPill(
                        label="Exposed Pop",
                        value=f"{profile['exposed_population']:,} Pax",
                        color="#FBBF24" if profile['exposed_population'] > 1000 else "#38BDF8"
                    ),
                    MetricPill(
                        label="Safe Site",
                        value=f"{safe_site['village']}",
                        color="#38BDF8"
                    )
                ]

        # 10. Format Evacuation Blueprint if relevant
        route_blueprint: Optional[RouteBlueprint] = None
        if any(w in user_query for w in ["evacuat", "route", "travel", "time", "reach", "transit", "relocat", "where to go", "where can", "staging"]):
            if is_cloudburst:
                route_blueprint = RouteBlueprint(
                    from_loc="Kedarnath Valley Gorge (Mandakini Axis)",
                    to_loc="Guptkashi Resilient Helipad & Stadium Hub",
                    distance="38.0 km",
                    normal_time="1 hr 15 mins",
                    emergency_time="45 mins",
                    safe_route_name="NH-107 Protected Ridge Alignment",
                    hazard_to_avoid="Active riverbed torrent & moraine debris surge corridor",
                    clearance_status="SAFE"
                )
            elif is_flood:
                route_blueprint = RouteBlueprint(
                    from_loc="Multi Chapari (Dibrugarh West)",
                    to_loc="Barbaruah Higher Secondary Campus",
                    distance="6.8 km",
                    normal_time="16 mins",
                    emergency_time="10 mins",
                    safe_route_name="NH-37 Barbaruah Protected Arterial",
                    hazard_to_avoid="Brahmaputra bank breach cut at Maijan",
                    clearance_status="SAFE"
                )
            elif is_coastal:
                route_blueprint = RouteBlueprint(
                    from_loc="Podampeta Estuarine Spit",
                    to_loc="Humma Elevated Ridge Resettlement Colony",
                    distance="4.8 km",
                    normal_time="12 mins",
                    emergency_time="8 mins",
                    safe_route_name="NH-516 / Humma Coastal Evacuation Spur",
                    hazard_to_avoid="Rushikulya tidal breach corridor",
                    clearance_status="SAFE"
                )
            else:
                route_blueprint = RouteBlueprint(
                    from_loc=f"{profile['name']}",
                    to_loc=f"{safe_site['name']}",
                    distance=f"{profile.get('travel_distance_km', 14.8)} km",
                    normal_time=f"{profile.get('travel_time_convoy_mins', 28)} mins",
                    emergency_time=f"{max(10, profile.get('travel_time_convoy_mins', 28) - 10)} mins",
                    safe_route_name="Chundale–NH-766 Protected Highway Corridor",
                    hazard_to_avoid="Active stream gully & bridge slip cuts",
                    clearance_status="SAFE"
                )

        # 11. Format Action Button
        action_btn: Optional[ActionButton] = None
        if is_cloudburst:
            action_btn = ActionButton(label="Open Uttarakhand Cloudburst Intelligence", view="cloudburst-intelligence", village="Kedarnath")
        elif is_flood:
            action_btn = ActionButton(label="View Dibrugarh Relocation Plan", view="relocation-engine", village="Chabua")
        elif is_coastal:
            action_btn = ActionButton(label="View Coastal Relocation Plan", view="relocation-engine", village="Podampeta")
        elif any(w in user_query for w in ["relocat", "capacity", "safe land", "where can they go"]):
            action_btn = ActionButton(label="Open Relocation Decision Engine", view="relocation-engine", village=village_key)
        elif any(w in user_query for w in ["map", "danger", "risk", "safe", "kottathara", "meppadi", "achooranam", "kuppadithara"]):
            action_btn = ActionButton(label=f"Inspect {village_key} on Map", view="red-zone-map", village=village_key)
        elif any(w in user_query for w in ["simulation", "+50%", "rain"]):
            action_btn = ActionButton(label="Open What-If Simulator", view="what-if-simulation", village=village_key)

        return {
            'system_instruction': system_instruction,
            'context_text': context_text,
            'metric_pills': metric_pills,
            'route_blueprint': route_blueprint,
            'action_button': action_btn,
            'safety_status': 'HIGH ALERT' if is_cloudburst else 'CRITICAL' if is_flood else 'HIGH RISK' if is_coastal else profile['risk_level'],
            'location_name': 'Uttarakhand Himalayan Belt' if is_cloudburst else 'Dibrugarh District, Assam' if is_flood else 'Brahmapur Coast, Ganjam' if is_coastal else profile['name'],
            'citations': (
                [
                    "NASA POWER Meteorological Time Series (1988-2024)",
                    "Uttarakhand Cloudburst Inventory & Random Forest Classifier",
                    "Sphere Humanitarian Standards & CCAS"
                ] if is_cloudburst else [
                    "ASDMA Disaster Loss & Damage Records (2022)",
                    "ISRO Bhuvan Multi-Temporal Flood Inundation",
                    "Assam Kopili Basin Multi-Criteria Analysis (MCA)"
                ] if is_flood else [
                    "USGS DSAS Remote Sensing 2013-2024",
                    "Odisha Coastal Zone Management Study",
                    "NIVARA Coastal Decision Engine"
                ] if is_coastal else [
                    "NIVARA Decision Support Engine",
                    "Open-Meteo Weather Telemetry"
                ]
            ) + ([f"Attached File: {f.file_name}" for f in request.files_evidence] if request.files_evidence else [])
        }

context_builder = ContextBuilder()
