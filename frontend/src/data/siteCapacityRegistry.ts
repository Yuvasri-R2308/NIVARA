import { SiteResourceLedger, PlanningAssumptions, HazardType } from '../types';
export type { SiteResourceLedger, PlanningAssumptions, HazardType };

export const DEFAULT_PLANNING_ASSUMPTIONS: PlanningAssumptions = {
  peoplePerAmbulance: 500,           // 1 Ambulance per 500 persons (Planning Assumption)
  peoplePerToilet: 20,               // 1 Toilet per 20 persons (Sphere Humanitarian Standards)
  waterLitersPerPersonPerDay: 70,    // 70 Liters/person/day (Camp emergency supply standard)
  shelterSpaceSqmPerPerson: 3.5,     // 3.5 m² per person covered shelter (Sphere Standard)
  peoplePerMedicalStaff: 250,        // 1 Doctor/Nurse per 250 persons (Planning Assumption)
  peoplePerEmergencyVehicle: 300,    // 1 Quick response rescue vehicle per 300 persons
  mealsPerPersonPerDay: 3,           // 3 Meals/day relief ration stock
  
  // Weights (sum = 1.0)
  weightSafety: 0.30,
  weightCapacity: 0.25,
  weightAccessibility: 0.15,
  weightEssentialServices: 0.15,
  weightEmergencyReadiness: 0.15
};

// ============================================================
// 1. LANDSLIDE SITES — MEPPADI, WAYANAD, KERALA
// ============================================================
export const WAYANAD_LANDSLIDE_SITES: Record<string, SiteResourceLedger> = {
  'KL-WYD-S01': {
    siteId: 'KL-WYD-S01',
    name: 'Kalpetta-Vythiri Institutional Reserve (Safe Zone D)',
    village: 'Kalpetta',
    category: 'District Institutional Campus',
    coordinates: [11.602, 76.082],
    elevationMeters: 785,
    hazardType: 'landslide',

    // Land Area Breakdown
    totalLandAreaHa: 15.0,
    usableLandAreaHa: 12.5,
    restrictedLandAreaHa: 2.5,
    usableFloorAreaSqm: 8200,
    shelterAreaSqm: 7700,
    existingOccupancyPersons: 380,
    maxGrossCapacityPersons: 2200,
    shelterType: 'Permanent Multi-Storey Administrative Halls & Covered Auditorium',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 165000,
    waterSourceDescription: 'Municipal 100kL overhead tank + continuous 15,000 LPH pipeline',
    waterStorageCapacityLiters: 220000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 110,
    wasteManagementType: 'Kalpetta Municipal Sewerage Line + 3 Twin Bio-Digesters',
    drainageSystem: 'Concrete storm drainage network with zero pooling history',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 14,
    nursesOnCall: 36,
    emergencyTriageBeds: 60,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Wayanad District General Hospital, Kalpetta',
    nearestHospitalDistanceKm: 3.2,
    nearestPhcName: 'Muttil Primary Health Centre',
    nearestPhcDistanceKm: 1.8,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 5,
    rescueVehiclesStationed: 8,
    fireRescueVehiclesStationed: 3,
    waterTankersStationed: 4,
    reliefSupplyTrucksStationed: 6,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 65000,
    foodWarehouseAreaSqm: 950,
    reliefDeliveryAccess: 'Direct NH-766 4-lane highway with heavy trailer docking',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '33kV Kalpetta Substation feeder line + 150kVA diesel backup generator',
    backupGeneratorCapacityKva: 150,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: '4-Lane National Highway (NH-766) with wide turning aprons',
    independentAccessRoutesCount: 3,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 14.8,
    travelTimeFromMeppadiMins: 28,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 3,
    landslideExposurePct: 2,
    slopeDeg: 3.8,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Slope Gradient',
      factor1Value: '3.8° (Terrace bench)',
      factor1Status: 'Suitable',
      factor2Name: 'Terrain Stability',
      factor2Value: 'Lateritic granitic core',
      factor2Status: 'Suitable',
      factor3Name: '24h Rainfall Resilience',
      factor3Value: '300mm capacity buffer',
      factor3Status: 'Suitable',
      factor4Name: 'Soil Pore Saturation',
      factor4Value: '42% (Normal drainage)',
      factor4Status: 'Suitable',
      factor5Name: 'Debris Scarp Proximity',
      factor5Value: '2.8 km buffer from scarp',
      factor5Status: 'Suitable'
    },

    description: 'Flat institutional hilltop bench outside all GSI landslide corridors with immediate NH-766 national highway access and full municipal utility capacity.'
  },

  'KL-WYD-S02': {
    siteId: 'KL-WYD-S02',
    name: 'Kuppadithara North Plateau (Safe Zone A)',
    village: 'Kuppadithara',
    category: 'Highland Agricultural Plateau',
    coordinates: [11.665, 76.012],
    elevationMeters: 820,
    hazardType: 'landslide',

    // Land Area Breakdown
    totalLandAreaHa: 12.0,
    usableLandAreaHa: 9.8,
    restrictedLandAreaHa: 2.2,
    usableFloorAreaSqm: 6400,
    shelterAreaSqm: 5900,
    existingOccupancyPersons: 320,
    maxGrossCapacityPersons: 1680,
    shelterType: 'Panchayat Community Center + Semi-permanent Prefabricated Shelters',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 125000,
    waterSourceDescription: 'Deep tube borewell yield 12,000 LPH + piped trunk line',
    waterStorageCapacityLiters: 150000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 85,
    wasteManagementType: 'Twin Septic Tank System with Soil Absorption Trench',
    drainageSystem: 'High-gradient natural swale runoff into lower agricultural pond',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 8,
    nursesOnCall: 20,
    emergencyTriageBeds: 35,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Taluk Headquarters Hospital, Vythiri',
    nearestHospitalDistanceKm: 6.5,
    nearestPhcName: 'Kuppadithara Family Health Centre',
    nearestPhcDistanceKm: 0.9,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 4,
    rescueVehiclesStationed: 6,
    fireRescueVehiclesStationed: 2,
    waterTankersStationed: 3,
    reliefSupplyTrucksStationed: 4,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 45000,
    foodWarehouseAreaSqm: 620,
    reliefDeliveryAccess: 'State Highway 54 feeder (two-lane blacktop)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '11kV dedicated rural transformer + 82.5kVA mobile generator',
    backupGeneratorCapacityKva: 82.5,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'State Highway 54 (150m feeder link)',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 18.2,
    travelTimeFromMeppadiMins: 34,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 4,
    landslideExposurePct: 3,
    slopeDeg: 4.6,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Slope Gradient',
      factor1Value: '4.6° (Stable plateau)',
      factor1Status: 'Suitable',
      factor2Name: 'Terrain Stability',
      factor2Value: 'Solid lateritic plateau',
      factor2Status: 'Suitable',
      factor3Name: '24h Rainfall Resilience',
      factor3Value: '280mm drainage threshold',
      factor3Status: 'Suitable',
      factor4Name: 'Soil Pore Saturation',
      factor4Value: '48% (Stable cohesion)',
      factor4Status: 'Suitable',
      factor5Name: 'Debris Scarp Proximity',
      factor5Value: '4.1 km buffer from scarp',
      factor5Status: 'Suitable'
    },

    description: 'Gentle lateritic plateau with municipal piped water trunk line, high soil shear stability, and zero historical flood recurrence.'
  },

  'KL-WYD-S03': {
    siteId: 'KL-WYD-S03',
    name: 'Kottathara Valley South Safe Buffer (Safe Zone B)',
    village: 'Kottathara',
    category: 'Elevated Highland Terrace',
    coordinates: [11.678, 76.042],
    elevationMeters: 792,
    hazardType: 'landslide',

    // Land Area Breakdown
    totalLandAreaHa: 9.5,
    usableLandAreaHa: 7.4,
    restrictedLandAreaHa: 2.1,
    usableFloorAreaSqm: 4900,
    shelterAreaSqm: 4500,
    existingOccupancyPersons: 240,
    maxGrossCapacityPersons: 1280,
    shelterType: 'Agricultural Co-op Training Complex + Sturdy Warehouses',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 92000,
    waterSourceDescription: 'Highland spring catchment + 50kL ground reservoir',
    waterStorageCapacityLiters: 95000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 58,
    wasteManagementType: 'Decentralized Anaerobic Baffled Reactor (ABR)',
    drainageSystem: 'Terraced stormwater bypass channel',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 6,
    nursesOnCall: 14,
    emergencyTriageBeds: 25,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Kainatty Memorial Hospital',
    nearestHospitalDistanceKm: 7.8,
    nearestPhcName: 'Kottathara Community Health Post',
    nearestPhcDistanceKm: 1.4,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 3,
    rescueVehiclesStationed: 4,
    fireRescueVehiclesStationed: 1,
    waterTankersStationed: 2,
    reliefSupplyTrucksStationed: 3,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 35000,
    foodWarehouseAreaSqm: 450,
    reliefDeliveryAccess: 'Panchayat double-lane blacktop road',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '11kV feeder + 62.5kVA emergency generator',
    backupGeneratorCapacityKva: 62.5,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'Elevated bypass road (28m above Kabini floodplain)',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 21.4,
    travelTimeFromMeppadiMins: 38,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 6,
    landslideExposurePct: 5,
    slopeDeg: 5.2,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Slope Gradient',
      factor1Value: '5.2° (Terraced bench)',
      factor1Status: 'Suitable',
      factor2Name: 'Terrain Stability',
      factor2Value: 'Elevated terrace',
      factor2Status: 'Suitable',
      factor3Name: '24h Rainfall Resilience',
      factor3Value: '260mm drainage threshold',
      factor3Status: 'Suitable',
      factor4Name: 'Soil Pore Saturation',
      factor4Value: '52% (Moderate retention)',
      factor4Status: 'Suitable',
      factor5Name: 'Debris Scarp Proximity',
      factor5Value: '6.5 km buffer from scarp',
      factor5Status: 'Suitable'
    },

    description: 'Elevated agricultural terrace set 28m above the 100-year Kabini river flood level, protected by natural bedrock banks.'
  },

  'KL-WYD-S04': {
    siteId: 'KL-WYD-S04',
    name: 'Achoor East Ridgeline Foothill (Safe Zone C)',
    village: 'Achooranam',
    category: 'Foothill Plateau',
    coordinates: [11.598, 76.025],
    elevationMeters: 810,
    hazardType: 'landslide',

    // Land Area Breakdown
    totalLandAreaHa: 8.0,
    usableLandAreaHa: 6.2,
    restrictedLandAreaHa: 1.8,
    usableFloorAreaSqm: 3800,
    shelterAreaSqm: 3500,
    existingOccupancyPersons: 220,
    maxGrossCapacityPersons: 1000,
    shelterType: 'Tea Plantation Administrative Complex & Club Hall',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 74000,
    waterSourceDescription: 'Gravity-fed highland stream reservoir + 40kL tank',
    waterStorageCapacityLiters: 80000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 46,
    wasteManagementType: 'Septic tanks with bio-filtration chambers',
    drainageSystem: 'High-slope stepped stone cascade drains',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 4,
    nursesOnCall: 10,
    emergencyTriageBeds: 18,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Pozhuthana Primary Medical Centre',
    nearestHospitalDistanceKm: 4.8,
    nearestPhcName: 'Achoor Estate Dispensary',
    nearestPhcDistanceKm: 0.6,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 2,
    rescueVehiclesStationed: 3,
    fireRescueVehiclesStationed: 1,
    waterTankersStationed: 2,
    reliefSupplyTrucksStationed: 2,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 25000,
    foodWarehouseAreaSqm: 380,
    reliefDeliveryAccess: 'Estate blacktop arterial road (narrow bridge section)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: 'Local transformer connection + 45kVA generator',
    backupGeneratorCapacityKva: 45,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Moderate',
    accessRoadType: 'Estate double-lane road (requires 200m shoulder widening)',
    independentAccessRoutesCount: 1,
    emergencyVehicleAccessibility: 'Medium',
    distanceFromMeppadiKm: 12.6,
    travelTimeFromMeppadiMins: 24,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 5,
    landslideExposurePct: 7,
    slopeDeg: 6.8,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Slope Gradient',
      factor1Value: '6.8° (Foothill bench)',
      factor1Status: 'Suitable',
      factor2Name: 'Terrain Stability',
      factor2Value: 'Basaltic foundation',
      factor2Status: 'Suitable',
      factor3Name: '24h Rainfall Resilience',
      factor3Value: '250mm drainage threshold',
      factor3Status: 'Suitable',
      factor4Name: 'Soil Pore Saturation',
      factor4Value: '55% (Monitored runoff)',
      factor4Status: 'Suitable',
      factor5Name: 'Debris Scarp Proximity',
      factor5Value: '3.4 km buffer from scarp',
      factor5Status: 'Suitable'
    },

    description: 'Well-drained foothill bench with high basalt soil shear strength; close proximity to Meppadi and Achooranam communities.'
  },

  'KL-WYD-S05': {
    siteId: 'KL-WYD-S05',
    name: 'Padinharethara West Elevation Ridge (Safe Zone E)',
    village: 'Padinharethara',
    category: 'Reservoir Border Ridge',
    coordinates: [11.662, 75.945],
    elevationMeters: 845,
    hazardType: 'landslide',

    // Land Area Breakdown
    totalLandAreaHa: 6.0,
    usableLandAreaHa: 4.5,
    restrictedLandAreaHa: 1.5,
    usableFloorAreaSqm: 2800,
    shelterAreaSqm: 2500,
    existingOccupancyPersons: 140,
    maxGrossCapacityPersons: 720,
    shelterType: 'Forest Eco-Lodge Compound & Community Shelters',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 48000,
    waterSourceDescription: 'Banasura reservoir intake auxiliary line + filter unit',
    waterStorageCapacityLiters: 60000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 34,
    wasteManagementType: 'Sealed eco-toilet clusters with municipal desludging',
    drainageSystem: 'Gravel percolation beds',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 3,
    nursesOnCall: 8,
    emergencyTriageBeds: 12,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Padinharethara Govt Hospital',
    nearestHospitalDistanceKm: 3.5,
    nearestPhcName: 'Banasura Health Centre',
    nearestPhcDistanceKm: 1.1,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 2,
    rescueVehiclesStationed: 2,
    fireRescueVehiclesStationed: 1,
    waterTankersStationed: 1,
    reliefSupplyTrucksStationed: 2,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 18000,
    foodWarehouseAreaSqm: 250,
    reliefDeliveryAccess: 'PWD rural blacktop (8% gradient curves)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Limited',
    powerGridSource: 'Rural single-phase grid line + 30kVA backup generator',
    backupGeneratorCapacityKva: 30,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Moderate',
    accessRoadType: 'Winding asphalt road (restricted for 40-foot articulated trucks)',
    independentAccessRoutesCount: 1,
    emergencyVehicleAccessibility: 'Medium',
    distanceFromMeppadiKm: 26.5,
    travelTimeFromMeppadiMins: 45,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 8,
    landslideExposurePct: 9,
    slopeDeg: 7.9,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Slope Gradient',
      factor1Value: '7.9° (Moderate ridge)',
      factor1Status: 'Caution',
      factor2Name: 'Terrain Stability',
      factor2Value: 'Granitic foundation',
      factor2Status: 'Suitable',
      factor3Name: '24h Rainfall Resilience',
      factor3Value: '220mm drainage threshold',
      factor3Status: 'Suitable',
      factor4Name: 'Soil Pore Saturation',
      factor4Value: '58% (Upper terrace drain)',
      factor4Status: 'Caution',
      factor5Name: 'Debris Scarp Proximity',
      factor5Value: '8.2 km buffer from scarp',
      factor5Status: 'Suitable'
    },

    description: 'High ridge bench bordering Banasura reservoir; solid granitic foundation, but steeper access road and single arterial route.'
  },

  'KL-WYD-REJ01': {
    siteId: 'KL-WYD-REJ01',
    name: 'Chembra Toe Slope Terrace (UNSAFE HAZARD ZONE)',
    village: 'Meppadi',
    category: 'Vulnerable Scarp Foothill',
    coordinates: [11.542, 76.115],
    elevationMeters: 960,
    hazardType: 'landslide',

    // Land Area Breakdown
    totalLandAreaHa: 15.0,
    usableLandAreaHa: 0.0,
    restrictedLandAreaHa: 15.0,
    usableFloorAreaSqm: 9500,
    shelterAreaSqm: 8800,
    existingOccupancyPersons: 0,
    maxGrossCapacityPersons: 2500,
    shelterType: 'Abandoned Estate Clearing',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 180000,
    waterSourceDescription: 'Mountain stream weir',
    waterStorageCapacityLiters: 190000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 120,
    wasteManagementType: 'Pit latrines',
    drainageSystem: 'Unpaved gullies',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 2,
    nursesOnCall: 4,
    emergencyTriageBeds: 10,
    firstAidStationAvailable: false,
    nearestHospitalName: 'Meppadi CHC (Damaged in 2024)',
    nearestHospitalDistanceKm: 5.5,
    nearestPhcName: 'Chooralmala Dispensary (Destroyed)',
    nearestPhcDistanceKm: 1.2,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 1,
    rescueVehiclesStationed: 2,
    fireRescueVehiclesStationed: 0,
    waterTankersStationed: 1,
    reliefSupplyTrucksStationed: 1,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 5000,
    foodWarehouseAreaSqm: 200,
    reliefDeliveryAccess: 'Collapsed bridge culvert',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Unavailable',
    powerGridSource: 'Fallen HT poles',
    backupGeneratorCapacityKva: 0,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Poor',
    accessRoadType: 'Blockaded mud trail',
    independentAccessRoutesCount: 0,
    emergencyVehicleAccessibility: 'Low',
    distanceFromMeppadiKm: 3.2,
    travelTimeFromMeppadiMins: 99,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification — CRITICAL HIGH RISK
    hazardExposureLevel: 'HIGH',
    floodExposurePct: 88,
    landslideExposurePct: 94,
    slopeDeg: 34.5,
    isInsideHazardRedZone: true,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Slope Gradient',
      factor1Value: '34.5° (Severe escarpment)',
      factor1Status: 'Unsuitable',
      factor2Name: 'Terrain Stability',
      factor2Value: 'Active landslide debris cone',
      factor2Status: 'Unsuitable',
      factor3Name: '24h Rainfall Resilience',
      factor3Value: 'Overloaded at 120mm',
      factor3Status: 'Unsuitable',
      factor4Name: 'Soil Pore Saturation',
      factor4Value: '96% (Total liquefaction)',
      factor4Status: 'Unsuitable',
      factor5Name: 'Debris Scarp Proximity',
      factor5Value: '0.1 km (Inside runout zone)',
      factor5Status: 'Unsuitable'
    },

    description: 'High capacity plot located directly within the July 2024 Chembra debris surge runout corridor. STRICTLY PROHIBITED FOR RESETTLEMENT.'
  }
};

// ============================================================
// 2. FLOOD SITES — DIBRUGARH, ASSAM
// ============================================================
export const DIBRUGARH_FLOOD_SITES: Record<string, SiteResourceLedger> = {
  'SAFE-DIB-01': {
    siteId: 'SAFE-DIB-01',
    name: 'Barbaruah Higher Secondary & Sports Campus',
    village: 'Barbaruah',
    category: 'Institutional Educational Complex',
    coordinates: [27.348, 94.825],
    elevationMeters: 108.5,
    hazardType: 'flood',

    // Land Area Breakdown
    totalLandAreaHa: 18.0,
    usableLandAreaHa: 14.2,
    restrictedLandAreaHa: 3.8,
    usableFloorAreaSqm: 14800,
    shelterAreaSqm: 14200,
    existingOccupancyPersons: 450,
    maxGrossCapacityPersons: 3800,
    shelterType: 'Permanent Multi-Storey RCC School & Sports Pavilion',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 285000,
    waterSourceDescription: 'Dedicated 200kL deep aquifer borewell + PHE piped grid',
    waterStorageCapacityLiters: 320000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 190,
    wasteManagementType: 'PHE Twin Septic Chambers with chlorination effluent pit',
    drainageSystem: 'High-capacity concrete bypass canal to Sessa drainage basin',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 8,
    nursesOnCall: 24,
    emergencyTriageBeds: 28,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Assam Medical College Hospital (AMCH), Dibrugarh',
    nearestHospitalDistanceKm: 7.2,
    nearestPhcName: 'Barbaruah Block Primary Health Centre',
    nearestPhcDistanceKm: 1.1,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 6,
    rescueVehiclesStationed: 10,
    fireRescueVehiclesStationed: 3,
    waterTankersStationed: 5,
    reliefSupplyTrucksStationed: 8,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 95000,
    foodWarehouseAreaSqm: 1200,
    reliefDeliveryAccess: 'NH-37 4-Lane Highway with all-weather heavy truck bypass',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '33kV Barbaruah Substation + 200kVA soundproof diesel generator',
    backupGeneratorCapacityKva: 200,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'National Highway NH-37 (Protected High Embankment Corridor)',
    independentAccessRoutesCount: 3,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 8.5,
    travelTimeFromMeppadiMins: 16,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 4,
    landslideExposurePct: 0,
    slopeDeg: 1.2,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Flood Inundation Exposure',
      factor1Value: '4% (High natural levee)',
      factor1Status: 'Suitable',
      factor2Name: 'Flood Depth Assessment',
      factor2Value: '0.0m (Above 100yr flood line)',
      factor2Status: 'Suitable',
      factor3Name: 'River Embankment Distance',
      factor3Value: '4.2 km south of Brahmaputra',
      factor3Status: 'Suitable',
      factor4Name: 'Elevation MSL',
      factor4Value: '108.5m (6.5m above riverbank)',
      factor4Status: 'Suitable',
      factor5Name: 'Drainage & Runoff Capacity',
      factor5Value: 'Engineered stormwater culverts',
      factor5Status: 'Suitable'
    },

    description: 'Elevated institutional terrace 6.5m above peak Brahmaputra high-flood level (HFL); direct NH-37 multi-lane transit corridor.'
  },

  'SAFE-DIB-02': {
    siteId: 'SAFE-DIB-02',
    name: 'Panitola Central Resettlement & Vocational Hub',
    village: 'Panitola',
    category: 'Government College & Vocational Buffer',
    coordinates: [27.512, 95.235],
    elevationMeters: 114.2,
    hazardType: 'flood',

    // Land Area Breakdown
    totalLandAreaHa: 20.0,
    usableLandAreaHa: 15.8,
    restrictedLandAreaHa: 4.2,
    usableFloorAreaSqm: 16500,
    shelterAreaSqm: 15800,
    existingOccupancyPersons: 600,
    maxGrossCapacityPersons: 4200,
    shelterType: 'Industrial Training Institute & High School Campus',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 315000,
    waterSourceDescription: 'Twin 250kL overhead reservoir with continuous filtration',
    waterStorageCapacityLiters: 350000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 210,
    wasteManagementType: 'Centralized Anaerobic Bio-digester System',
    drainageSystem: 'High-gradient paved peripheral open stormwater drains',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 10,
    nursesOnCall: 28,
    emergencyTriageBeds: 32,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Tinsukia Civil Hospital (Inter-District Mutual Aid)',
    nearestHospitalDistanceKm: 8.8,
    nearestPhcName: 'Panitola Primary Health Centre',
    nearestPhcDistanceKm: 0.8,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 7,
    rescueVehiclesStationed: 12,
    fireRescueVehiclesStationed: 4,
    waterTankersStationed: 6,
    reliefSupplyTrucksStationed: 10,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 110000,
    foodWarehouseAreaSqm: 1450,
    reliefDeliveryAccess: 'NH-37 East Spur (wide asphalt carriageway)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: 'Panitola 33/11kV Substation + 250kVA standby gen-set',
    backupGeneratorCapacityKva: 250,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'Chabua-Panitola 4-lane arterial road',
    independentAccessRoutesCount: 3,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 14.2,
    travelTimeFromMeppadiMins: 22,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 3,
    landslideExposurePct: 0,
    slopeDeg: 1.5,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Flood Inundation Exposure',
      factor1Value: '3% (Chabua East ridge)',
      factor1Status: 'Suitable',
      factor2Name: 'Flood Depth Assessment',
      factor2Value: '0.0m (Zero historical breach)',
      factor2Status: 'Suitable',
      factor3Name: 'River Embankment Distance',
      factor3Value: '6.8 km inland buffer',
      factor3Status: 'Suitable',
      factor4Name: 'Elevation MSL',
      factor4Value: '114.2m (12m above floodway)',
      factor4Status: 'Suitable',
      factor5Name: 'Drainage & Runoff Capacity',
      factor5Value: 'Fast percolation alluvial soil',
      factor5Status: 'Suitable'
    },

    description: 'High-elevation eastern ridge campus with substantial industrial-grade floor space, deep aquifer potable water, and zero flood breach history.'
  },

  'SAFE-DIB-03': {
    siteId: 'SAFE-DIB-03',
    name: 'Khowang Elevated Block Development Campus',
    village: 'Khowang',
    category: 'Sub-District HQ Institutional Reserve',
    coordinates: [27.218, 94.912],
    elevationMeters: 109.8,
    hazardType: 'flood',

    // Land Area Breakdown
    totalLandAreaHa: 13.5,
    usableLandAreaHa: 10.5,
    restrictedLandAreaHa: 3.0,
    usableFloorAreaSqm: 11200,
    shelterAreaSqm: 10500,
    existingOccupancyPersons: 320,
    maxGrossCapacityPersons: 2800,
    shelterType: 'Block Administration Campus + Multi-purpose Community Halls',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 210000,
    waterSourceDescription: 'Municipal deep tube well + 150kL ground storage sump',
    waterStorageCapacityLiters: 240000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 140,
    wasteManagementType: 'Concrete Septic Tanks with bio-enzyme digestion',
    drainageSystem: 'Masonry gravity drains to Burhi Dihing tributary buffer',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 6,
    nursesOnCall: 18,
    emergencyTriageBeds: 20,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Moran Tiloi Sub-Divisional Hospital',
    nearestHospitalDistanceKm: 6.5,
    nearestPhcName: 'Khowang Community Health Centre',
    nearestPhcDistanceKm: 0.5,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 4,
    rescueVehiclesStationed: 6,
    fireRescueVehiclesStationed: 2,
    waterTankersStationed: 3,
    reliefSupplyTrucksStationed: 5,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 70000,
    foodWarehouseAreaSqm: 850,
    reliefDeliveryAccess: 'State Highway SH-1 all-weather blacktop',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '33kV Khowang feeder + 125kVA generator',
    backupGeneratorCapacityKva: 125,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'State Highway 1 (Elevated embankment carriageway)',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 18.5,
    travelTimeFromMeppadiMins: 26,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 6,
    landslideExposurePct: 0,
    slopeDeg: 1.1,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Flood Inundation Exposure',
      factor1Value: '6% (Southern upland)',
      factor1Status: 'Suitable',
      factor2Name: 'Flood Depth Assessment',
      factor2Value: '0.0m (Above backwater limit)',
      factor2Status: 'Suitable',
      factor3Name: 'River Embankment Distance',
      factor3Value: '8.4 km from Brahmaputra',
      factor3Status: 'Suitable',
      factor4Name: 'Elevation MSL',
      factor4Value: '109.8m (Safe highland)',
      factor4Status: 'Suitable',
      factor5Name: 'Drainage & Runoff Capacity',
      factor5Value: 'Open masonry channels',
      factor5Status: 'Suitable'
    },

    description: 'Elevated Block Development headquarters situated outside the backwater confluence zone of Burhi Dihing river.'
  },

  'SAFE-DIB-04': {
    siteId: 'SAFE-DIB-04',
    name: 'Dibrugarh University Eastern Ridgeline Reserve',
    village: 'Dibrugarh East',
    category: 'University Campus Highland Terrace',
    coordinates: [27.456, 94.898],
    elevationMeters: 112.4,
    hazardType: 'flood',

    // Land Area Breakdown
    totalLandAreaHa: 25.0,
    usableLandAreaHa: 19.5,
    restrictedLandAreaHa: 5.5,
    usableFloorAreaSqm: 21000,
    shelterAreaSqm: 19500,
    existingOccupancyPersons: 850,
    maxGrossCapacityPersons: 5000,
    shelterType: 'University Hostels, Convocation Auditorium & Gymnasium',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 420000,
    waterSourceDescription: 'Dedicated 500kL overhead water tower + water treatment plant',
    waterStorageCapacityLiters: 550000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 260,
    wasteManagementType: 'University Sewage Treatment Plant (STP) + Bio-Digesters',
    drainageSystem: 'Subsurface storm drain network with continuous pumping fail-safe',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 14,
    nursesOnCall: 38,
    emergencyTriageBeds: 45,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Assam Medical College Hospital (AMCH)',
    nearestHospitalDistanceKm: 3.5,
    nearestPhcName: 'University Health Centre',
    nearestPhcDistanceKm: 0.2,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 9,
    rescueVehiclesStationed: 15,
    fireRescueVehiclesStationed: 5,
    waterTankersStationed: 8,
    reliefSupplyTrucksStationed: 12,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 150000,
    foodWarehouseAreaSqm: 2200,
    reliefDeliveryAccess: 'NH-37 Direct Dual-Carriageway with dedicated freight bay',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '132kV Dibrugarh Grid Substation + dual 350kVA generators',
    backupGeneratorCapacityKva: 350,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: '4-Lane NH-37 (Protected High Bank)',
    independentAccessRoutesCount: 4,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 5.2,
    travelTimeFromMeppadiMins: 12,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 2,
    landslideExposurePct: 0,
    slopeDeg: 1.8,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Flood Inundation Exposure',
      factor1Value: '2% (Highest urban contour)',
      factor1Status: 'Suitable',
      factor2Name: 'Flood Depth Assessment',
      factor2Value: '0.0m (Zero flood inundation)',
      factor2Status: 'Suitable',
      factor3Name: 'River Embankment Distance',
      factor3Value: '5.1 km inland from river',
      factor3Status: 'Suitable',
      factor4Name: 'Elevation MSL',
      factor4Value: '112.4m (10m above HFL)',
      factor4Status: 'Suitable',
      factor5Name: 'Drainage & Runoff Capacity',
      factor5Value: 'Full engineered STP & sump',
      factor5Status: 'Suitable'
    },

    description: 'Premier regional evacuation fortress: largest covered floor capacity in Upper Assam, dual 350kVA power grid, and on-site tertiary health center.'
  },

  'SAFE-DIB-05': {
    siteId: 'SAFE-DIB-05',
    name: 'PHC Namtok & Joypur High Ridge Health Campus',
    village: 'Joypur',
    category: 'Primary Health Center & Foothill Terrace',
    coordinates: [27.1388, 95.3939],
    elevationMeters: 135.0,
    hazardType: 'flood',

    // Land Area Breakdown
    totalLandAreaHa: 15.0,
    usableLandAreaHa: 12.0,
    restrictedLandAreaHa: 3.0,
    usableFloorAreaSqm: 12800,
    shelterAreaSqm: 12000,
    existingOccupancyPersons: 200,
    maxGrossCapacityPersons: 2500,
    shelterType: 'Reinforced Hospital Wards & Community Evacuation Shelters',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 190000,
    waterSourceDescription: 'Highland spring gravity supply + 120kL treated water tank',
    waterStorageCapacityLiters: 200000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 125,
    wasteManagementType: 'Medical Grade Bio-Digesters + Septic Wells',
    drainageSystem: 'High-gradient bedrock runoff channels',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 9,
    nursesOnCall: 26,
    emergencyTriageBeds: 36,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Joypur Model Hospital',
    nearestHospitalDistanceKm: 1.2,
    nearestPhcName: 'Joypur PHC Campus',
    nearestPhcDistanceKm: 0.1,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 5,
    rescueVehiclesStationed: 6,
    fireRescueVehiclesStationed: 2,
    waterTankersStationed: 3,
    reliefSupplyTrucksStationed: 5,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 60000,
    foodWarehouseAreaSqm: 750,
    reliefDeliveryAccess: 'Dilli-Joypur Highway (Wide double-lane blacktop)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: 'Dedicated rural line + 100kVA emergency generator',
    backupGeneratorCapacityKva: 100,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'Elevated Foothill Arterial Road',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 28.0,
    travelTimeFromMeppadiMins: 38,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 1,
    landslideExposurePct: 0,
    slopeDeg: 3.2,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Flood Inundation Exposure',
      factor1Value: '1% (Foothill upland)',
      factor1Status: 'Suitable',
      factor2Name: 'Flood Depth Assessment',
      factor2Value: '0.0m (30m above river plain)',
      factor2Status: 'Suitable',
      factor3Name: 'River Embankment Distance',
      factor3Value: '14.5 km from Brahmaputra',
      factor3Status: 'Suitable',
      factor4Name: 'Elevation MSL',
      factor4Value: '135.0m (Highest elevation site)',
      factor4Status: 'Suitable',
      factor5Name: 'Drainage & Runoff Capacity',
      factor5Value: 'Natural high-relief runoff',
      factor5Status: 'Suitable'
    },

    description: 'High foothill ridge at 135m MSL completely immune to all Brahmaputra floods; primary medical center on-site.'
  },

  'SAFE-DIB-06': {
    siteId: 'SAFE-DIB-06',
    name: 'Tengakhat High Ground Community Relief Complex',
    village: 'Tengakhat',
    category: 'High Ground Panchayat Complex',
    coordinates: [27.382, 95.148],
    elevationMeters: 116.0,
    hazardType: 'flood',

    // Land Area Breakdown
    totalLandAreaHa: 17.0,
    usableLandAreaHa: 13.5,
    restrictedLandAreaHa: 3.5,
    usableFloorAreaSqm: 14000,
    shelterAreaSqm: 13500,
    existingOccupancyPersons: 280,
    maxGrossCapacityPersons: 3200,
    shelterType: 'Tea Estate Community Hall & Sports Center',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 240000,
    waterSourceDescription: 'Borewell pumping scheme + 180kL overhead storage',
    waterStorageCapacityLiters: 220000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 160,
    wasteManagementType: 'Sanitary Septic Tanks with gravel soak pits',
    drainageSystem: 'High-slope stepped stone channels',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 7,
    nursesOnCall: 20,
    emergencyTriageBeds: 24,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Chabua First Referral Unit',
    nearestHospitalDistanceKm: 7.5,
    nearestPhcName: 'Tengakhat Model Hospital',
    nearestPhcDistanceKm: 0.9,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 5,
    rescueVehiclesStationed: 8,
    fireRescueVehiclesStationed: 2,
    waterTankersStationed: 4,
    reliefSupplyTrucksStationed: 6,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 80000,
    foodWarehouseAreaSqm: 980,
    reliefDeliveryAccess: 'Tengakhat-Tipling PWD double-lane road',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '33kV rural line + 150kVA generator',
    backupGeneratorCapacityKva: 150,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'PWD double-lane asphalt',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 16.8,
    travelTimeFromMeppadiMins: 25,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 5,
    landslideExposurePct: 0,
    slopeDeg: 1.4,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Flood Inundation Exposure',
      factor1Value: '5% (Elevated plateau)',
      factor1Status: 'Suitable',
      factor2Name: 'Flood Depth Assessment',
      factor2Value: '0.0m (Protected terrain)',
      factor2Status: 'Suitable',
      factor3Name: 'River Embankment Distance',
      factor3Value: '9.2 km south of main river',
      factor3Status: 'Suitable',
      factor4Name: 'Elevation MSL',
      factor4Value: '116.0m (14m above riverbed)',
      factor4Status: 'Suitable',
      factor5Name: 'Drainage & Runoff Capacity',
      factor5Value: 'Gravel percolation channels',
      factor5Status: 'Suitable'
    },

    description: 'Elevated tea-estate plateau bench with high-capacity warehouse shelters and reliable ground water.'
  },

  'SAFE-DIB-REJ01': {
    siteId: 'SAFE-DIB-REJ01',
    name: 'Brahmaputra Floodplain River Island (UNSAFE HAZARD ZONE)',
    village: 'Rohmaria Char',
    category: 'Active Sandbar & Flood Inundation Flat',
    coordinates: [27.565, 94.945],
    elevationMeters: 99.2,
    hazardType: 'flood',

    // Land Area Breakdown
    totalLandAreaHa: 22.0,
    usableLandAreaHa: 0.0,
    restrictedLandAreaHa: 22.0,
    usableFloorAreaSqm: 12000,
    shelterAreaSqm: 11000,
    existingOccupancyPersons: 0,
    maxGrossCapacityPersons: 3000,
    shelterType: 'Temporary Bamboo & Thatch Shacks',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 50000,
    waterSourceDescription: 'Contaminated shallow tube wells (submerged)',
    waterStorageCapacityLiters: 40000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 20,
    wasteManagementType: 'Open pit latrines (waterlogged)',
    drainageSystem: 'Submerged silt deposits with water stagnation',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 1,
    nursesOnCall: 2,
    emergencyTriageBeds: 4,
    firstAidStationAvailable: false,
    nearestHospitalName: 'Rohmaria Primary Health Subcentre (Flooded)',
    nearestHospitalDistanceKm: 4.8,
    nearestPhcName: 'Submerged Boat Clinic',
    nearestPhcDistanceKm: 2.5,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 0,
    rescueVehiclesStationed: 1,
    fireRescueVehiclesStationed: 0,
    waterTankersStationed: 0,
    reliefSupplyTrucksStationed: 0,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 2000,
    foodWarehouseAreaSqm: 80,
    reliefDeliveryAccess: 'Inaccessible by road; boat transit only (turbulent currents)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Unavailable',
    powerGridSource: 'No grid connection; solar panels submerged',
    backupGeneratorCapacityKva: 0,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Poor',
    accessRoadType: 'Submerged riverbank path (cut off)',
    independentAccessRoutesCount: 0,
    emergencyVehicleAccessibility: 'Low',
    distanceFromMeppadiKm: 19.5,
    travelTimeFromMeppadiMins: 99,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification — CRITICAL HIGH FLOOD RISK
    hazardExposureLevel: 'HIGH',
    floodExposurePct: 88,
    landslideExposurePct: 0,
    slopeDeg: 0.4,
    isInsideHazardRedZone: true,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Flood Inundation Exposure',
      factor1Value: '88% (Submerged island)',
      factor1Status: 'Unsuitable',
      factor2Name: 'Flood Depth Assessment',
      factor2Value: '2.8m Inundation (Active hazard)',
      factor2Status: 'Unsuitable',
      factor3Name: 'River Embankment Distance',
      factor3Value: '0.0 km (Inside active breach)',
      factor3Status: 'Unsuitable',
      factor4Name: 'Elevation MSL',
      factor4Value: '99.2m (4m below high flood level)',
      factor4Status: 'Unsuitable',
      factor5Name: 'Drainage & Runoff Capacity',
      factor5Value: 'Zero drainage; stagnant mud',
      factor5Status: 'Unsuitable'
    },

    description: 'Active riverbank flood channel with 2.8m depth inundation and acute bank erosion. STRICTLY PROHIBITED FOR RESETTLEMENT.'
  }
};

// ============================================================
// 3. CLOUDBURST SITES — KEDARNATH, UTTARAKHAND
// ============================================================
export const UTTARAKHAND_CLOUDBURST_SITES: Record<string, SiteResourceLedger> = {
  'UK-KED-S01': {
    siteId: 'UK-KED-S01',
    name: 'Guptkashi Upper Ridge Staging Enclave',
    village: 'Guptkashi',
    category: 'High-Altitude Staging & Helipad Hub',
    coordinates: [30.522, 79.080],
    elevationMeters: 1319,
    hazardType: 'cloudburst',

    // Land Area Breakdown
    totalLandAreaHa: 20.0,
    usableLandAreaHa: 15.75,
    restrictedLandAreaHa: 4.25,
    usableFloorAreaSqm: 16800,
    shelterAreaSqm: 15750,
    existingOccupancyPersons: 400,
    maxGrossCapacityPersons: 4500,
    shelterType: 'Helipad Stadium, Pilgrim Transit Shelters & Administrative Complexes',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 340000,
    waterSourceDescription: 'Gravity spring pipeline + 280kL insulated highland reservoir',
    waterStorageCapacityLiters: 380000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 225,
    wasteManagementType: 'High-altitude Bio-Digester latrines with solar heating',
    drainageSystem: 'Deep-cut granitic stormwater chutes bypassing residential terraces',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 10,
    nursesOnCall: 30,
    emergencyTriageBeds: 35,
    firstAidStationAvailable: true,
    nearestHospitalName: 'District Hospital Rudraprayag',
    nearestHospitalDistanceKm: 34.0,
    nearestPhcName: 'Guptkashi Community Health Centre',
    nearestPhcDistanceKm: 0.6,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 8,
    rescueVehiclesStationed: 12,
    fireRescueVehiclesStationed: 4,
    waterTankersStationed: 6,
    reliefSupplyTrucksStationed: 10,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 120000,
    foodWarehouseAreaSqm: 1600,
    reliefDeliveryAccess: 'NH-107 Rudraprayag-Gaurikund Highway (Protected Arterial)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '33kV hill grid line + dual 180kVA diesel generators',
    backupGeneratorCapacityKva: 180,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'NH-107 High-Ridge Carriageway (Bedrock Alignment)',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 38.0,
    travelTimeFromMeppadiMins: 45,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 3,
    landslideExposurePct: 4,
    slopeDeg: 8.2,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Extreme Rainfall Exposure',
      factor1Value: '3% (High ridge divide)',
      factor1Status: 'Suitable',
      factor2Name: 'Orographic Gorge Funnel',
      factor2Value: 'Outside narrow gorge funnel',
      factor2Status: 'Suitable',
      factor3Name: 'Slope Steepness',
      factor3Value: '8.2° (Graded bedrock bench)',
      factor3Status: 'Suitable',
      factor4Name: 'Flash Runoff Drainage',
      factor4Value: 'Stepped granitic chutes',
      factor4Status: 'Suitable',
      factor5Name: 'Elevation Buffer',
      factor5Value: '1,319m MSL (500m above river)',
      factor5Status: 'Suitable'
    },

    description: 'Elevated bedrock ridge high above the Mandakini gorge torrent level; certified multi-agency disaster staging hub with helicopter pads.'
  },

  'UK-KED-S02': {
    siteId: 'UK-KED-S02',
    name: 'Joshimath Upper Cantonment Plateau',
    village: 'Joshimath',
    category: 'High Highland Cantonment Bench',
    coordinates: [30.556, 79.570],
    elevationMeters: 1890,
    hazardType: 'cloudburst',

    // Land Area Breakdown
    totalLandAreaHa: 17.0,
    usableLandAreaHa: 13.3,
    restrictedLandAreaHa: 3.7,
    usableFloorAreaSqm: 14500,
    shelterAreaSqm: 13300,
    existingOccupancyPersons: 350,
    maxGrossCapacityPersons: 3800,
    shelterType: 'Military Cantonment Halls & Insulated Emergency Barracks',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 285000,
    waterSourceDescription: 'Dhauliganga piped water scheme + 220kL underground reservoir',
    waterStorageCapacityLiters: 300000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 190,
    wasteManagementType: 'Army Standard Insulated Bio-Digesters',
    drainageSystem: 'Deep geological masonry interceptor drains',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 8,
    nursesOnCall: 24,
    emergencyTriageBeds: 30,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Joshimath Military Hospital & Sub-Divisional Hospital',
    nearestHospitalDistanceKm: 1.5,
    nearestPhcName: 'Joshimath CHC',
    nearestPhcDistanceKm: 0.8,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 6,
    rescueVehiclesStationed: 10,
    fireRescueVehiclesStationed: 3,
    waterTankersStationed: 5,
    reliefSupplyTrucksStationed: 8,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 100000,
    foodWarehouseAreaSqm: 1400,
    reliefDeliveryAccess: 'NH-07 Rishikesh-Badrinath Highway (Solid Bedrock Sector)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '132kV Joshimath grid station + 160kVA generator backup',
    backupGeneratorCapacityKva: 160,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'NH-07 National Highway (Reinforced Retaining Wall Sector)',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 42.0,
    travelTimeFromMeppadiMins: 52,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 4,
    landslideExposurePct: 6,
    slopeDeg: 7.5,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Extreme Rainfall Exposure',
      factor1Value: '4% (High plateau shelf)',
      factor1Status: 'Suitable',
      factor2Name: 'Orographic Gorge Funnel',
      factor2Value: 'Outside Alaknanda gorge',
      factor2Status: 'Suitable',
      factor3Name: 'Slope Steepness',
      factor3Value: '7.5° (Upper military plateau)',
      factor3Status: 'Suitable',
      factor4Name: 'Flash Runoff Drainage',
      factor4Value: 'Masonry interceptor drains',
      factor4Status: 'Suitable',
      factor5Name: 'Elevation Buffer',
      factor5Value: '1,890m MSL (Immune to torrents)',
      factor5Status: 'Suitable'
    },

    description: 'High cantonment terrace with robust military logistics facilities, heavy snow/deluge insulated structures, and direct NH-07 connectivity.'
  },

  'UK-KED-S03': {
    siteId: 'UK-KED-S03',
    name: 'Pithoragarh High-Ridge Vocational Campus',
    village: 'Pithoragarh',
    category: 'Highland Vocational Campus',
    coordinates: [29.585, 80.215],
    elevationMeters: 1636,
    hazardType: 'cloudburst',

    // Land Area Breakdown
    totalLandAreaHa: 18.0,
    usableLandAreaHa: 14.0,
    restrictedLandAreaHa: 4.0,
    usableFloorAreaSqm: 15200,
    shelterAreaSqm: 14000,
    existingOccupancyPersons: 400,
    maxGrossCapacityPersons: 4000,
    shelterType: 'Polytechnic & Degree College Multi-Storey RCC Campus',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 300000,
    waterSourceDescription: 'High mountain spring intake + 250kL RCC reservoir',
    waterStorageCapacityLiters: 320000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 200,
    wasteManagementType: 'Twin Bio-Digesters with subsoil leaching fields',
    drainageSystem: 'Engineered cascade runoff gutters',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 9,
    nursesOnCall: 25,
    emergencyTriageBeds: 32,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Pithoragarh District Base Hospital',
    nearestHospitalDistanceKm: 2.8,
    nearestPhcName: 'Waddah Health Centre',
    nearestPhcDistanceKm: 1.2,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 7,
    rescueVehiclesStationed: 11,
    fireRescueVehiclesStationed: 3,
    waterTankersStationed: 5,
    reliefSupplyTrucksStationed: 9,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 105000,
    foodWarehouseAreaSqm: 1500,
    reliefDeliveryAccess: 'NH-09 Tanakpur-Pithoragarh Highway',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '132kV Substation + 175kVA backup generator',
    backupGeneratorCapacityKva: 175,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'National Highway NH-09 (High-elevation pass)',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 48.0,
    travelTimeFromMeppadiMins: 58,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 2,
    landslideExposurePct: 5,
    slopeDeg: 6.9,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Extreme Rainfall Exposure',
      factor1Value: '2% (Wide valley terrace)',
      factor1Status: 'Suitable',
      factor2Name: 'Orographic Gorge Funnel',
      factor2Value: 'Outside funnel zone',
      factor2Status: 'Suitable',
      factor3Name: 'Slope Steepness',
      factor3Value: '6.9° (Terraced campus)',
      factor3Status: 'Suitable',
      factor4Name: 'Flash Runoff Drainage',
      factor4Value: 'Stepped cascade gutters',
      factor4Status: 'Suitable',
      factor5Name: 'Elevation Buffer',
      factor5Value: '1,636m MSL (High plateau)',
      factor5Status: 'Suitable'
    },

    description: 'Expansive highland campus on gentle lateritic slope, remote from active gorge flood funnels with dedicated airstrip proximity.'
  },

  'UK-KED-S04': {
    siteId: 'UK-KED-S04',
    name: 'Dehradun Valley Elevated Staging Hub',
    village: 'Dehradun',
    category: 'Inter-Agency Emergency Command Complex',
    coordinates: [30.325, 78.040],
    elevationMeters: 680,
    hazardType: 'cloudburst',

    // Land Area Breakdown
    totalLandAreaHa: 28.0,
    usableLandAreaHa: 22.75,
    restrictedLandAreaHa: 5.25,
    usableFloorAreaSqm: 25000,
    shelterAreaSqm: 22750,
    existingOccupancyPersons: 700,
    maxGrossCapacityPersons: 6500,
    shelterType: 'State Disaster Management Complex, Indoor Stadium & Transit Halls',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 500000,
    waterSourceDescription: 'Municipal deep tube well complex + 600kL reservoir',
    waterStorageCapacityLiters: 650000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 325,
    wasteManagementType: 'Municipal Centralized Sewerage Line + STP Plant',
    drainageSystem: 'High-volume underground stormwater storm system',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 16,
    nursesOnCall: 45,
    emergencyTriageBeds: 50,
    firstAidStationAvailable: true,
    nearestHospitalName: 'AIIMS Rishikesh & Doon Medical College Hospital',
    nearestHospitalDistanceKm: 4.5,
    nearestPhcName: 'Rajpur Road Urban Health Centre',
    nearestPhcDistanceKm: 0.8,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 12,
    rescueVehiclesStationed: 18,
    fireRescueVehiclesStationed: 6,
    waterTankersStationed: 10,
    reliefSupplyTrucksStationed: 15,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 180000,
    foodWarehouseAreaSqm: 2600,
    reliefDeliveryAccess: 'NH-307 Expressway & Jolly Grant Airport Air Corridor',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: 'Dual 220kV grid supply + 500kVA automated backup generators',
    backupGeneratorCapacityKva: 500,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: '4-Lane National Highway & Airport Transit Expressway',
    independentAccessRoutesCount: 4,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 55.0,
    travelTimeFromMeppadiMins: 60,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 1,
    landslideExposurePct: 1,
    slopeDeg: 3.5,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Extreme Rainfall Exposure',
      factor1Value: '1% (Wide Doon valley basin)',
      factor1Status: 'Suitable',
      factor2Name: 'Orographic Gorge Funnel',
      factor2Value: 'Completely outside hill gorge',
      factor2Status: 'Suitable',
      factor3Name: 'Slope Steepness',
      factor3Value: '3.5° (Flat valley floor)',
      factor3Status: 'Suitable',
      factor4Name: 'Flash Runoff Drainage',
      factor4Value: 'Full underground municipal storm grid',
      factor4Status: 'Suitable',
      factor5Name: 'Elevation Buffer',
      factor5Value: '680m MSL (Safe from gorge surge)',
      factor5Status: 'Suitable'
    },

    description: 'Premier mega-capacity staging center with air-evacuation connectivity, highest ambulance fleet, and direct link to AIIMS tertiary trauma center.'
  },

  'UK-KED-S05': {
    siteId: 'UK-KED-S05',
    name: 'Pauri Garhwal Central Highland Complex',
    village: 'Pauri',
    category: 'District Administrative Highland Complex',
    coordinates: [30.150, 78.780],
    elevationMeters: 1814,
    hazardType: 'cloudburst',

    // Land Area Breakdown
    totalLandAreaHa: 14.5,
    usableLandAreaHa: 11.2,
    restrictedLandAreaHa: 3.3,
    usableFloorAreaSqm: 12000,
    shelterAreaSqm: 11200,
    existingOccupancyPersons: 300,
    maxGrossCapacityPersons: 3200,
    shelterType: 'District Collectorate Compound & Circuit Hall',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 240000,
    waterSourceDescription: 'High altitude reservoir + pumped spring line',
    waterStorageCapacityLiters: 260000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 160,
    wasteManagementType: 'Biological waste digestion tanks',
    drainageSystem: 'High-gradient perimeter stone channels',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 6,
    nursesOnCall: 18,
    emergencyTriageBeds: 22,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Pauri District Hospital',
    nearestHospitalDistanceKm: 1.8,
    nearestPhcName: 'Pauri Sadar Health Post',
    nearestPhcDistanceKm: 0.5,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 5,
    rescueVehiclesStationed: 7,
    fireRescueVehiclesStationed: 2,
    waterTankersStationed: 4,
    reliefSupplyTrucksStationed: 6,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 75000,
    foodWarehouseAreaSqm: 950,
    reliefDeliveryAccess: 'NH-119 Pauri-Kotdwar Highway',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '33kV hill feeder + 120kVA backup generator',
    backupGeneratorCapacityKva: 120,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'NH-119 Double-Lane Blacktop',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 44.0,
    travelTimeFromMeppadiMins: 55,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 5,
    landslideExposurePct: 7,
    slopeDeg: 8.8,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Extreme Rainfall Exposure',
      factor1Value: '5% (High mountain crest)',
      factor1Status: 'Suitable',
      factor2Name: 'Orographic Gorge Funnel',
      factor2Value: 'Outside gorge bottleneck',
      factor2Status: 'Suitable',
      factor3Name: 'Slope Steepness',
      factor3Value: '8.8° (Crestline terrace)',
      factor3Status: 'Suitable',
      factor4Name: 'Flash Runoff Drainage',
      factor4Value: 'High gradient perimeter channels',
      factor4Status: 'Suitable',
      factor5Name: 'Elevation Buffer',
      factor5Value: '1,814m MSL (Upper divide)',
      factor5Status: 'Suitable'
    },

    description: 'High mountain crest headquarters on granitic massif; solid bedrock foundation with comprehensive district administration logistics.'
  },

  'UK-KED-REJ01': {
    siteId: 'UK-KED-REJ01',
    name: 'Mandakini Gorge Channel Basin (UNSAFE HAZARD ZONE)',
    village: 'Rambara Gorge',
    category: 'Active Glacial Outwash Gorge Channel',
    coordinates: [30.685, 79.065],
    elevationMeters: 2150,
    hazardType: 'cloudburst',

    // Land Area Breakdown
    totalLandAreaHa: 12.0,
    usableLandAreaHa: 0.0,
    restrictedLandAreaHa: 12.0,
    usableFloorAreaSqm: 8000,
    shelterAreaSqm: 7200,
    existingOccupancyPersons: 0,
    maxGrossCapacityPersons: 2000,
    shelterType: 'Temporary Tin Pilgrimage Sheds (Swept in 2013)',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 40000,
    waterSourceDescription: 'Silted torrent runoff (high sediment load)',
    waterStorageCapacityLiters: 30000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 15,
    wasteManagementType: 'Open gorge latrines (unstable)',
    drainageSystem: 'High-velocity debris torrent channel',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 1,
    nursesOnCall: 2,
    emergencyTriageBeds: 2,
    firstAidStationAvailable: false,
    nearestHospitalName: 'Rambara Medical Aid Post (Destroyed)',
    nearestHospitalDistanceKm: 6.0,
    nearestPhcName: 'Mobile Paramedic Tent',
    nearestPhcDistanceKm: 3.2,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 0,
    rescueVehiclesStationed: 0,
    fireRescueVehiclesStationed: 0,
    waterTankersStationed: 0,
    reliefSupplyTrucksStationed: 0,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 3000,
    foodWarehouseAreaSqm: 60,
    reliefDeliveryAccess: 'Foot-trail only; vehicles cannot reach (mule track)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Unavailable',
    powerGridSource: 'No grid lines; poles severed during torrents',
    backupGeneratorCapacityKva: 0,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Poor',
    accessRoadType: 'Precipitous gorge foot-trail (zero motor vehicle access)',
    independentAccessRoutesCount: 0,
    emergencyVehicleAccessibility: 'Low',
    distanceFromMeppadiKm: 14.0,
    travelTimeFromMeppadiMins: 99,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification — CRITICAL HIGH RISK
    hazardExposureLevel: 'HIGH',
    floodExposurePct: 95,
    landslideExposurePct: 98,
    slopeDeg: 36.5,
    isInsideHazardRedZone: true,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Extreme Rainfall Exposure',
      factor1Value: '95% (Extreme cloudburst funnel)',
      factor1Status: 'Unsuitable',
      factor2Name: 'Orographic Gorge Funnel',
      factor2Value: 'Narrow 150m Bottleneck gorge',
      factor2Status: 'Unsuitable',
      factor3Name: 'Slope Steepness',
      factor3Value: '36.5° (Severe gorge walls)',
      factor3Status: 'Unsuitable',
      factor4Name: 'Flash Runoff Drainage',
      factor4Value: 'High-velocity boulder torrent',
      factor4Status: 'Unsuitable',
      factor5Name: 'Elevation Buffer',
      factor5Value: 'Active riverbed wash level',
      factor5Status: 'Unsuitable'
    },

    description: 'Active flash-flood torrent gorge; site of 2013 Rambara obliteration. STRICTLY PROHIBITED FOR ANY HABITATION OR STAGING.'
  }
};

// ============================================================
// 4. COASTAL EROSION SITES — BRAHMAPUR COAST, GANJAM, ODISHA
// ============================================================
export const GANJAM_COASTAL_SITES: Record<string, SiteResourceLedger> = {
  'OD-GNJ-S01': {
    siteId: 'OD-GNJ-S01',
    name: 'Humma Elevated Ridge Resettlement Colony',
    village: 'Humma',
    category: 'Highland Upland Resettlement Colony',
    coordinates: [19.412, 85.045],
    elevationMeters: 28,
    hazardType: 'coastal-erosion',

    // Land Area Breakdown
    totalLandAreaHa: 20.0,
    usableLandAreaHa: 16.0,
    restrictedLandAreaHa: 4.0,
    usableFloorAreaSqm: 15200,
    shelterAreaSqm: 14500,
    existingOccupancyPersons: 820,
    maxGrossCapacityPersons: 3200,
    shelterType: 'Permanent Cyclone Shelter + Concrete Resettlement Quarters',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 160000,
    waterSourceDescription: 'Deep saline-barrier tube well + 180kL overhead tank',
    waterStorageCapacityLiters: 200000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 120,
    wasteManagementType: 'Twin Septic Tank System with Soil Absorption Trenches',
    drainageSystem: 'High-gradient paved storm drainage network',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 6,
    nursesOnCall: 18,
    emergencyTriageBeds: 24,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Chhatrapur Sub-Divisional Hospital',
    nearestHospitalDistanceKm: 6.2,
    nearestPhcName: 'Humma Primary Health Centre',
    nearestPhcDistanceKm: 0.8,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 5,
    rescueVehiclesStationed: 8,
    fireRescueVehiclesStationed: 2,
    waterTankersStationed: 4,
    reliefSupplyTrucksStationed: 6,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 75000,
    foodWarehouseAreaSqm: 1100,
    reliefDeliveryAccess: 'NH-516 Spur Evacuation Corridor (Double-lane blacktop)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '33kV Humma Substation + 125kVA cyclone-resistant generator',
    backupGeneratorCapacityKva: 125,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'National Highway NH-516 Spur (Protected Elevated Causeway)',
    independentAccessRoutesCount: 3,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 7.2,
    travelTimeFromMeppadiMins: 12,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 2,
    landslideExposurePct: 0,
    slopeDeg: 1.8,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Shoreline Erosion Rate',
      factor1Value: '+0.2 m/yr (Accreting / stable)',
      factor1Status: 'Suitable',
      factor2Name: 'Distance to High-Water Line',
      factor2Value: '2.4 km (Safe inland buffer)',
      factor2Status: 'Suitable',
      factor3Name: 'Coastal Elevation MSL',
      factor3Value: '28m (Above 100yr storm surge)',
      factor3Status: 'Suitable',
      factor4Name: 'Storm Surge & Wave Runup',
      factor4Value: '0% (Protected by dune ridge)',
      factor4Status: 'Suitable',
      factor5Name: 'Coastal Land Use Compatibility',
      factor5Value: 'Stable barren upland terrace',
      factor5Status: 'Suitable'
    },

    description: 'Elevated lateritic upland situated 2.4 km inland from the coast; zero shoreline retreat threat with direct NH-516 evacuation highway link.'
  },

  'OD-GNJ-S02': {
    siteId: 'OD-GNJ-S02',
    name: 'Gopalpur Hilltop Educational Campus Buffer',
    village: 'Gopalpur',
    category: 'Coastal Hilltop Institutional Complex',
    coordinates: [19.275, 84.905],
    elevationMeters: 34,
    hazardType: 'coastal-erosion',

    // Land Area Breakdown
    totalLandAreaHa: 16.0,
    usableLandAreaHa: 12.5,
    restrictedLandAreaHa: 3.5,
    usableFloorAreaSqm: 12400,
    shelterAreaSqm: 11800,
    existingOccupancyPersons: 950,
    maxGrossCapacityPersons: 2500,
    shelterType: 'College Multi-Storey RCC Hostels & Auditorium',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 125000,
    waterSourceDescription: 'Municipal piped line + 150kL overhead tank',
    waterStorageCapacityLiters: 180000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 95,
    wasteManagementType: 'Municipal Sewerage Connection + Bio-Digesters',
    drainageSystem: 'Masonry gravity chutes descending toward backwater creek',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 5,
    nursesOnCall: 15,
    emergencyTriageBeds: 18,
    firstAidStationAvailable: true,
    nearestHospitalName: 'City Hospital Berhampur (MKCG Medical College)',
    nearestHospitalDistanceKm: 12.0,
    nearestPhcName: 'Gopalpur Port Health Centre',
    nearestPhcDistanceKm: 1.2,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 4,
    rescueVehiclesStationed: 6,
    fireRescueVehiclesStationed: 2,
    waterTankersStationed: 3,
    reliefSupplyTrucksStationed: 5,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 55000,
    foodWarehouseAreaSqm: 850,
    reliefDeliveryAccess: 'Gopalpur-Brahmapur Marine Highway (4-lane asphalt)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '33kV Port feeder + 100kVA backup generator',
    backupGeneratorCapacityKva: 100,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: 'Gopalpur Marine Highway (Wide 4-Lane Carriageway)',
    independentAccessRoutesCount: 2,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 11.5,
    travelTimeFromMeppadiMins: 16,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 3,
    landslideExposurePct: 0,
    slopeDeg: 2.5,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Shoreline Erosion Rate',
      factor1Value: '+0.1 m/yr (Port groin stable)',
      factor1Status: 'Suitable',
      factor2Name: 'Distance to High-Water Line',
      factor2Value: '1.8 km (High cliff setback)',
      factor2Status: 'Suitable',
      factor3Name: 'Coastal Elevation MSL',
      factor3Value: '34m (Cliff promontory)',
      factor3Status: 'Suitable',
      factor4Name: 'Storm Surge & Wave Runup',
      factor4Value: '0% (34m vertical clearance)',
      factor4Status: 'Suitable',
      factor5Name: 'Coastal Land Use Compatibility',
      factor5Value: 'Institutional campus',
      factor5Status: 'Suitable'
    },

    description: 'Elevated bedrock promontory 34m above sea level; complete immunity from tidal wave runup with immediate access to MKCG Medical College.'
  },

  'OD-GNJ-S03': {
    siteId: 'OD-GNJ-S03',
    name: 'Rangeilunda High Ground Institutional Reserve',
    village: 'Rangeilunda',
    category: 'University & Airport Buffer Upland',
    coordinates: [19.295, 84.885],
    elevationMeters: 42,
    hazardType: 'coastal-erosion',

    // Land Area Breakdown
    totalLandAreaHa: 23.0,
    usableLandAreaHa: 18.0,
    restrictedLandAreaHa: 5.0,
    usableFloorAreaSqm: 18500,
    shelterAreaSqm: 16500,
    existingOccupancyPersons: 1100,
    maxGrossCapacityPersons: 4500,
    shelterType: 'Berhampur University Transit Hostels & Airstrip Hangar',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 190000,
    waterSourceDescription: 'Borewell pump house + 220kL treated municipal water line',
    waterStorageCapacityLiters: 250000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 145,
    wasteManagementType: 'University Sewerage Treatment Network',
    drainageSystem: 'Underground reinforced concrete stormwater pipes',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 8,
    nursesOnCall: 24,
    emergencyTriageBeds: 30,
    firstAidStationAvailable: true,
    nearestHospitalName: 'MKCG Medical College Hospital, Berhampur',
    nearestHospitalDistanceKm: 6.8,
    nearestPhcName: 'Rangeilunda University Dispensary',
    nearestPhcDistanceKm: 0.4,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 6,
    rescueVehiclesStationed: 10,
    fireRescueVehiclesStationed: 3,
    waterTankersStationed: 5,
    reliefSupplyTrucksStationed: 8,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 90000,
    foodWarehouseAreaSqm: 1350,
    reliefDeliveryAccess: 'Rangeilunda Airport Arterial Road (NH-516 link)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: 'Dual 33kV University feeder lines + 200kVA emergency generator',
    backupGeneratorCapacityKva: 200,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: '4-Lane Arterial Road & Rangeilunda Airstrip Access',
    independentAccessRoutesCount: 3,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 15.0,
    travelTimeFromMeppadiMins: 20,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 1,
    landslideExposurePct: 0,
    slopeDeg: 1.2,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Shoreline Erosion Rate',
      factor1Value: '0.0 m/yr (Inland plateau)',
      factor1Status: 'Suitable',
      factor2Name: 'Distance to High-Water Line',
      factor2Value: '4.2 km (Deep inland safety)',
      factor2Status: 'Suitable',
      factor3Name: 'Coastal Elevation MSL',
      factor3Value: '42m (Highest coastal elevation)',
      factor3Status: 'Suitable',
      factor4Name: 'Storm Surge & Wave Runup',
      factor4Value: '0% (Immune to extreme surges)',
      factor4Status: 'Suitable',
      factor5Name: 'Coastal Land Use Compatibility',
      factor5Value: 'Institutional university reserve',
      factor5Status: 'Suitable'
    },

    description: 'Premier coastal evacuation upland at 42m elevation with adjacent Rangeilunda Airstrip for disaster air-drop and helicopter logistics.'
  },

  'OD-GNJ-S04': {
    siteId: 'OD-GNJ-S04',
    name: 'Chhatrapur District Collectorate Safe Upland',
    village: 'Chhatrapur',
    category: 'District Administrative Upland Complex',
    coordinates: [19.355, 84.995],
    elevationMeters: 26,
    hazardType: 'coastal-erosion',

    // Land Area Breakdown
    totalLandAreaHa: 18.0,
    usableLandAreaHa: 14.2,
    restrictedLandAreaHa: 3.8,
    usableFloorAreaSqm: 14200,
    shelterAreaSqm: 13200,
    existingOccupancyPersons: 650,
    maxGrossCapacityPersons: 3500,
    shelterType: 'District Collectorate Auditorium, Indoor Stadium & Town Halls',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 175000,
    waterSourceDescription: 'Chhatrapur Municipal Water Scheme + 200kL overhead tank',
    waterStorageCapacityLiters: 220000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 130,
    wasteManagementType: 'Municipal Sewerage Line + 4 Twin Bio-Digesters',
    drainageSystem: 'Engineered stormwater network draining into inland lake basin',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 7,
    nursesOnCall: 22,
    emergencyTriageBeds: 25,
    firstAidStationAvailable: true,
    nearestHospitalName: 'Chhatrapur Sub-Divisional Hospital (SDH)',
    nearestHospitalDistanceKm: 1.2,
    nearestPhcName: 'Chhatrapur Urban Primary Health Centre',
    nearestPhcDistanceKm: 0.5,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 5,
    rescueVehiclesStationed: 8,
    fireRescueVehiclesStationed: 3,
    waterTankersStationed: 4,
    reliefSupplyTrucksStationed: 7,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 80000,
    foodWarehouseAreaSqm: 1200,
    reliefDeliveryAccess: 'NH-16 6-Lane Golden Quadrilateral Highway',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Available',
    powerGridSource: '33kV District HQ Grid + 150kVA generator backup',
    backupGeneratorCapacityKva: 150,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Good',
    accessRoadType: '6-Lane National Highway (NH-16)',
    independentAccessRoutesCount: 3,
    emergencyVehicleAccessibility: 'High',
    distanceFromMeppadiKm: 9.8,
    travelTimeFromMeppadiMins: 14,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification
    hazardExposureLevel: 'LOW',
    floodExposurePct: 2,
    landslideExposurePct: 0,
    slopeDeg: 1.5,
    isInsideHazardRedZone: false,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Shoreline Erosion Rate',
      factor1Value: '+0.3 m/yr (Accreting)',
      factor1Status: 'Suitable',
      factor2Name: 'Distance to High-Water Line',
      factor2Value: '3.1 km inland buffer',
      factor2Status: 'Suitable',
      factor3Name: 'Coastal Elevation MSL',
      factor3Value: '26m (High coastal bench)',
      factor3Status: 'Suitable',
      factor4Name: 'Storm Surge & Wave Runup',
      factor4Value: '0% (Protected by casuarina belt)',
      factor4Status: 'Suitable',
      factor5Name: 'Coastal Land Use Compatibility',
      factor5Value: 'Administrative district core',
      factor5Status: 'Suitable'
    },

    description: 'District administrative headquarters with direct 6-lane NH-16 highway connectivity, municipal utility redundancy, and zero erosion threat.'
  },

  'OD-GNJ-REJ01': {
    siteId: 'OD-GNJ-REJ01',
    name: 'Podampeta Intertidal Swash Zone (UNSAFE HAZARD ZONE)',
    village: 'Podampeta',
    category: 'Active Coastal Erosion & Inundation Front',
    coordinates: [19.385, 85.085],
    elevationMeters: 2.1,
    hazardType: 'coastal-erosion',

    // Land Area Breakdown
    totalLandAreaHa: 14.0,
    usableLandAreaHa: 0.0,
    restrictedLandAreaHa: 14.0,
    usableFloorAreaSqm: 6000,
    shelterAreaSqm: 5500,
    existingOccupancyPersons: 0,
    maxGrossCapacityPersons: 1500,
    shelterType: 'Eroded Thatched Houses & Compromised Sea-Wall Site',
    spaceProvenance: 'Actual Dataset',

    // Water Supply
    waterDailyAvailableLiters: 15000,
    waterSourceDescription: 'Saline-intruded shallow borewells (Unsafe for consumption)',
    waterStorageCapacityLiters: 20000,
    waterProvenance: 'Actual Dataset',

    // Sanitation
    toiletsAvailable: 8,
    wasteManagementType: 'Tidally flooded pit latrines',
    drainageSystem: 'Submerged beach swash zone',
    sanitationProvenance: 'Actual Dataset',

    // Healthcare & Medical
    medicalDoctorsOnCall: 0,
    nursesOnCall: 1,
    emergencyTriageBeds: 0,
    firstAidStationAvailable: false,
    nearestHospitalName: 'Podampeta Subcentre (Abandoned due to wave scour)',
    nearestHospitalDistanceKm: 3.5,
    nearestPhcName: 'Mobile boat team',
    nearestPhcDistanceKm: 2.0,
    healthcareProvenance: 'Actual Dataset',

    // Emergency Vehicles & Ambulances
    ambulancesStationed: 0,
    rescueVehiclesStationed: 1,
    fireRescueVehiclesStationed: 0,
    waterTankersStationed: 0,
    reliefSupplyTrucksStationed: 0,
    vehiclesProvenance: 'Planning Assumption',

    // Food & Relief Stock
    foodStockMealsAvailable: 1000,
    foodWarehouseAreaSqm: 50,
    reliefDeliveryAccess: 'Beach sand track (submerged during high tide)',
    foodProvenance: 'Planning Assumption',

    // Electricity & Basic Utilities
    electricityStatus: 'Unavailable',
    powerGridSource: 'Fallen coastal poles washed out by 2024 storm surges',
    backupGeneratorCapacityKva: 0,
    utilitiesProvenance: 'Actual Dataset',

    // Road & Accessibility
    roadStatus: 'Poor',
    accessRoadType: 'Severed coastal dirt path (eroded into sea)',
    independentAccessRoutesCount: 0,
    emergencyVehicleAccessibility: 'Low',
    distanceFromMeppadiKm: 5.5,
    travelTimeFromMeppadiMins: 99,
    accessibilityProvenance: 'Actual Dataset',

    // Hazard Safety Verification — CRITICAL HIGH RISK
    hazardExposureLevel: 'HIGH',
    floodExposurePct: 92,
    landslideExposurePct: 0,
    slopeDeg: 0.8,
    isInsideHazardRedZone: true,
    hazardSafetyProvenance: 'Actual Dataset',

    hazardFactors: {
      factor1Name: 'Shoreline Erosion Rate',
      factor1Value: '-3.8 m/yr (Critical DSAS Scour)',
      factor1Status: 'Unsuitable',
      factor2Name: 'Distance to High-Water Line',
      factor2Value: '35m (Inside tidal swash zone)',
      factor2Status: 'Unsuitable',
      factor3Name: 'Coastal Elevation MSL',
      factor3Value: '2.1m (Submerged during spring tide)',
      factor3Status: 'Unsuitable',
      factor4Name: 'Storm Surge & Wave Runup',
      factor4Value: '100% (Direct breaker zone exposure)',
      factor4Status: 'Unsuitable',
      factor5Name: 'Coastal Land Use Compatibility',
      factor5Value: 'Active eroding beach spit',
      factor5Status: 'Unsuitable'
    },

    description: 'Active coastal erosion frontline experiencing -3.8m/yr rapid DSAS shoreline loss. High risk of total submersion. STRICTLY PROHIBITED FOR HABITATION.'
  }
};

// ============================================================
// COMBINED MULTI-HAZARD REGISTRY & HELPER FUNCTIONS
// ============================================================
export const MULTI_HAZARD_SITE_REGISTRY: Record<HazardType, Record<string, SiteResourceLedger>> = {
  'landslide': WAYANAD_LANDSLIDE_SITES,
  'flood': DIBRUGARH_FLOOD_SITES,
  'cloudburst': UTTARAKHAND_CLOUDBURST_SITES,
  'coastal-erosion': GANJAM_COASTAL_SITES
};

// Combined flat registry preserving backward compatibility
export const SITE_RESOURCE_REGISTRY: Record<string, SiteResourceLedger> = {
  ...WAYANAD_LANDSLIDE_SITES,
  ...DIBRUGARH_FLOOD_SITES,
  ...UTTARAKHAND_CLOUDBURST_SITES,
  ...GANJAM_COASTAL_SITES
};

/**
 * Returns all candidate sites for the given hazard
 */
export const getSitesForHazard = (hazard: HazardType): SiteResourceLedger[] => {
  const registry = MULTI_HAZARD_SITE_REGISTRY[hazard] || WAYANAD_LANDSLIDE_SITES;
  return Object.values(registry);
};

/**
 * Returns default primary safe relocation site for the given hazard
 */
export const getDefaultSiteForHazard = (hazard: HazardType): SiteResourceLedger => {
  switch (hazard) {
    case 'flood':
      return DIBRUGARH_FLOOD_SITES['SAFE-DIB-04'] || DIBRUGARH_FLOOD_SITES['SAFE-DIB-01'];
    case 'cloudburst':
      return UTTARAKHAND_CLOUDBURST_SITES['UK-KED-S04'] || UTTARAKHAND_CLOUDBURST_SITES['UK-KED-S01'];
    case 'coastal-erosion':
      return GANJAM_COASTAL_SITES['OD-GNJ-S03'] || GANJAM_COASTAL_SITES['OD-GNJ-S01'];
    case 'landslide':
    default:
      return WAYANAD_LANDSLIDE_SITES['KL-WYD-S01'];
  }
};

/**
 * Metadata for hazard study areas
 */
export const HAZARD_STUDY_AREAS: Record<HazardType, { title: string; location: string; state: string; defaultDisplaced: number }> = {
  'landslide': {
    title: 'Landslide',
    location: 'Meppadi, Wayanad',
    state: 'Kerala',
    defaultDisplaced: 4800
  },
  'flood': {
    title: 'Flood',
    location: 'Dibrugarh',
    state: 'Assam',
    defaultDisplaced: 4200
  },
  'cloudburst': {
    title: 'Cloudburst',
    location: 'Kedarnath Valley, Rudraprayag',
    state: 'Uttarakhand',
    defaultDisplaced: 4500
  },
  'coastal-erosion': {
    title: 'Coastal Erosion',
    location: 'Brahmapur Coast, Ganjam',
    state: 'Odisha',
    defaultDisplaced: 3200
  }
};
