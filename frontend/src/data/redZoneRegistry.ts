import { HazardType, RiskDotLocation } from '../types';

/**
 * RED ZONE UPDATE — MULTI-HAZARD RISK DOT LOCATIONS REGISTRY
 * Sourced directly from official ground truth datasets:
 * - Kerala SDMA / GSI / SRTM 30m DEM (Wayanad)
 * - ASDMA / CWC / ISRO Bhuvan (Dibrugarh, Assam)
 * - Uttarakhand SDMA / NASA POWER (Kedarnath / Mandakini Valley)
 * - Odisha SDMA / USGS DSAS / ALOS AW3D30 (Ganjam Coast)
 *
 * NOTE: Location names are NEVER rendered on the map itself.
 * They are only revealed in the detail panel upon selecting a dot.
 */
export const RED_ZONE_LOCATIONS_BY_HAZARD: Record<HazardType, RiskDotLocation[]> = {
  // -------------------------------------------------------------
  // 1. LANDSLIDE (MEPPADI, WAYANAD, KERALA)
  // -------------------------------------------------------------
  'landslide': [
    {
      id: 'WYD-DOT-01',
      name: 'Mundakkai Upper Scarp & Detachment Headwall',
      lat: 11.535,
      lng: 76.145,
      riskScore: 96,
      riskLevel: 'Critical',
      landslideRisk: 96,
      floodRisk: 72,
      surfaceSlope: 42.4,
      rainfall24h: 312,
      soilMoisture: 99,
      peopleAtRisk: 1200,
      vulnerableFamilies: 65,
      vulnerableAreaHa: 11.0,
      specificConditions: [
        { label: 'Colluvium Depth', value: '4.8 m' },
        { label: 'Liquefaction Index', value: 'Critical (FoS 0.68)' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Geological Survey of India & SRTM 30m DEM'
    },
    {
      id: 'WYD-DOT-02',
      name: 'Chooralmala Bridge & River Confluence',
      lat: 11.542,
      lng: 76.136,
      riskScore: 91,
      riskLevel: 'Critical',
      landslideRisk: 91,
      floodRisk: 88,
      surfaceSlope: 28.6,
      rainfall24h: 295,
      soilMoisture: 96,
      peopleAtRisk: 1850,
      vulnerableFamilies: 95,
      vulnerableAreaHa: 14.2,
      specificConditions: [
        { label: 'Confluence Velocity', value: '14.2 m/s' },
        { label: 'Bridge Bottleneck', value: 'Debris Choke Zone' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Kerala SDMA / GSI'
    },
    {
      id: 'WYD-DOT-03',
      name: 'Punchirimattom Scarp Apex',
      lat: 11.530,
      lng: 76.150,
      riskScore: 98,
      riskLevel: 'Critical',
      landslideRisk: 98,
      floodRisk: 65,
      surfaceSlope: 44.5,
      rainfall24h: 320,
      soilMoisture: 98,
      peopleAtRisk: 820,
      vulnerableFamilies: 45,
      vulnerableAreaHa: 8.5,
      specificConditions: [
        { label: 'Headwall Crest', value: '1,465 m MSL' },
        { label: 'Detachment Chute', value: 'Active Scarp' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'GSI 2024 Post-Disaster Assessment'
    },
    {
      id: 'WYD-DOT-04',
      name: 'Meppadi Town & Western Drainage Axis',
      lat: 11.554,
      lng: 76.128,
      riskScore: 85,
      riskLevel: 'Critical',
      landslideRisk: 94,
      floodRisk: 86,
      surfaceSlope: 38.5,
      rainfall24h: 284,
      soilMoisture: 98,
      peopleAtRisk: 4800,
      vulnerableFamilies: 250,
      vulnerableAreaHa: 18.6,
      specificConditions: [
        { label: 'Trigger Rainfall', value: '284.5 mm / 24h' },
        { label: 'Debris Flow Path', value: 'Direct Inundation' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Kerala SDMA & IMD 2024'
    },
    {
      id: 'WYD-DOT-05',
      name: 'Attamala Hillside Tea Plantation Line',
      lat: 11.548,
      lng: 76.128,
      riskScore: 78,
      riskLevel: 'High',
      landslideRisk: 82,
      floodRisk: 45,
      surfaceSlope: 32.0,
      rainfall24h: 245,
      soilMoisture: 88,
      peopleAtRisk: 640,
      vulnerableFamilies: 32,
      vulnerableAreaHa: 5.8,
      specificConditions: [
        { label: 'Slope Slip Risk', value: 'High' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'GSI Field Reconnaissance'
    },
    {
      id: 'WYD-DOT-06',
      name: 'Vellarmala Lower Residential Strip',
      lat: 11.555,
      lng: 76.120,
      riskScore: 74,
      riskLevel: 'High',
      landslideRisk: 76,
      floodRisk: 52,
      surfaceSlope: 29.5,
      rainfall24h: 235,
      soilMoisture: 85,
      peopleAtRisk: 950,
      vulnerableFamilies: 50,
      vulnerableAreaHa: 7.2,
      specificConditions: [
        { label: 'Terrace Saturation', value: 'High' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Kerala SDMA'
    },
    {
      id: 'WYD-DOT-07',
      name: 'Achooranam Valley Sector',
      lat: 11.585,
      lng: 76.015,
      riskScore: 58,
      riskLevel: 'Moderate',
      landslideRisk: 58,
      floodRisk: 34,
      surfaceSlope: 26.5,
      rainfall24h: 178,
      soilMoisture: 72,
      peopleAtRisk: 1420,
      vulnerableFamilies: 75,
      vulnerableAreaHa: 12.4,
      specificConditions: [
        { label: 'Drainage State', value: 'Moderate Overland Flow' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Kerala SDMA'
    },
    {
      id: 'WYD-DOT-08',
      name: 'Kalpetta Southern Ridge Buffer',
      lat: 11.608,
      lng: 76.083,
      riskScore: 42,
      riskLevel: 'Moderate',
      landslideRisk: 38,
      floodRisk: 25,
      surfaceSlope: 12.8,
      rainfall24h: 145,
      soilMoisture: 64,
      peopleAtRisk: 2100,
      vulnerableFamilies: 110,
      vulnerableAreaHa: 16.0,
      specificConditions: [
        { label: 'Foundation', value: 'Granitic Shield Knoll' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Census 2011 & GSI'
    },
    {
      id: 'WYD-DOT-09',
      name: 'Kottathara Kabini Basin Plain',
      lat: 11.685,
      lng: 76.035,
      riskScore: 28,
      riskLevel: 'Low',
      landslideRisk: 15,
      floodRisk: 48,
      surfaceSlope: 6.8,
      rainfall24h: 142,
      soilMoisture: 55,
      peopleAtRisk: 850,
      vulnerableFamilies: 45,
      vulnerableAreaHa: 9.5,
      specificConditions: [
        { label: 'Stability', value: 'Safe Low-Slope Plain' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Kerala SDMA'
    },
    {
      id: 'WYD-DOT-10',
      name: 'Kuppadithara Agricultural Plateau',
      lat: 11.655,
      lng: 76.015,
      riskScore: 22,
      riskLevel: 'Low',
      landslideRisk: 12,
      floodRisk: 35,
      surfaceSlope: 7.4,
      rainfall24h: 128,
      soilMoisture: 50,
      peopleAtRisk: 680,
      vulnerableFamilies: 38,
      vulnerableAreaHa: 14.8,
      specificConditions: [
        { label: 'Stability', value: 'Zero Runout Risk' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Kerala SDMA'
    }
  ],

  // -------------------------------------------------------------
  // 2. FLOOD (DIBRUGARH, ASSAM)
  // -------------------------------------------------------------
  'flood': [
    {
      id: 'AS-DOT-01',
      name: 'Rohmaria Embankment Breach Sector',
      lat: 27.562,
      lng: 95.068,
      riskScore: 92,
      riskLevel: 'Critical',
      landslideRisk: 12,
      floodRisk: 94,
      surfaceSlope: 2.1,
      rainfall24h: 168,
      peopleAtRisk: 4200,
      vulnerableFamilies: 210,
      vulnerableAreaHa: 28.5,
      specificConditions: [
        { label: 'Bank Erosion Rate', value: '18.5 m/yr' },
        { label: 'Breach Status', value: 'Active Overtopping' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'ASDMA & Water Resources Dept Assam'
    },
    {
      id: 'AS-DOT-02',
      name: 'Maijan Beel Flood Detention Basin',
      lat: 27.502,
      lng: 94.954,
      riskScore: 88,
      riskLevel: 'Critical',
      landslideRisk: 8,
      floodRisk: 89,
      surfaceSlope: 1.4,
      rainfall24h: 155,
      peopleAtRisk: 2800,
      vulnerableFamilies: 145,
      vulnerableAreaHa: 22.0,
      specificConditions: [
        { label: 'Inundation Depth', value: '2.4 m' },
        { label: 'Waterlogging Duration', value: '> 14 Days' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'ASDMA & ISRO Bhuvan Satellite Imagery'
    },
    {
      id: 'AS-DOT-03',
      name: 'Bogibeel South Embankment',
      lat: 27.425,
      lng: 94.845,
      riskScore: 76,
      riskLevel: 'High',
      landslideRisk: 5,
      floodRisk: 78,
      surfaceSlope: 1.8,
      rainfall24h: 142,
      peopleAtRisk: 1950,
      vulnerableFamilies: 98,
      vulnerableAreaHa: 18.2,
      specificConditions: [
        { label: 'Spur Scour', value: 'Moderate Undercurrent' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Central Water Commission (CWC)'
    },
    {
      id: 'AS-DOT-04',
      name: 'Mothadang Riparian Reach',
      lat: 27.515,
      lng: 95.012,
      riskScore: 65,
      riskLevel: 'High',
      landslideRisk: 6,
      floodRisk: 68,
      surfaceSlope: 2.0,
      rainfall24h: 138,
      peopleAtRisk: 1420,
      vulnerableFamilies: 72,
      vulnerableAreaHa: 14.5,
      specificConditions: [
        { label: 'Inundation Depth', value: '1.2 m' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'ASDMA Flood Reporting System'
    },
    {
      id: 'AS-DOT-05',
      name: 'Chabua Low-Lying Agrarian Sector',
      lat: 27.481,
      lng: 95.172,
      riskScore: 48,
      riskLevel: 'Moderate',
      landslideRisk: 4,
      floodRisk: 52,
      surfaceSlope: 3.2,
      rainfall24h: 124,
      peopleAtRisk: 1100,
      vulnerableFamilies: 58,
      vulnerableAreaHa: 12.0,
      specificConditions: [
        { label: 'Paddy Submergence', value: 'Seasonal Waterlogging' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Dibrugarh District Revenue Authority'
    },
    {
      id: 'AS-DOT-06',
      name: 'Mohanbari Intermediate Terrace',
      lat: 27.488,
      lng: 95.021,
      riskScore: 38,
      riskLevel: 'Moderate',
      landslideRisk: 2,
      floodRisk: 40,
      surfaceSlope: 2.8,
      rainfall24h: 118,
      peopleAtRisk: 850,
      vulnerableFamilies: 44,
      vulnerableAreaHa: 9.8,
      specificConditions: [
        { label: 'Drainage Channel', value: 'Functional Outfall' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'ASDMA'
    },
    {
      id: 'AS-DOT-07',
      name: 'Barbaruah High Alluvial Mound',
      lat: 27.395,
      lng: 94.882,
      riskScore: 25,
      riskLevel: 'Low',
      landslideRisk: 2,
      floodRisk: 24,
      surfaceSlope: 4.5,
      rainfall24h: 105,
      peopleAtRisk: 520,
      vulnerableFamilies: 28,
      vulnerableAreaHa: 16.5,
      specificConditions: [
        { label: 'Elevation Margin', value: '+8.5 m above HFL' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'CartoDEM & ASDMA Safe Relocation Sites'
    },
    {
      id: 'AS-DOT-08',
      name: 'Dibrugarh University Safe Terrace',
      lat: 27.452,
      lng: 94.898,
      riskScore: 18,
      riskLevel: 'Low',
      landslideRisk: 1,
      floodRisk: 18,
      surfaceSlope: 3.8,
      rainfall24h: 98,
      peopleAtRisk: 410,
      vulnerableFamilies: 22,
      vulnerableAreaHa: 24.0,
      specificConditions: [
        { label: 'Elevation Margin', value: '+12.0 m above HFL' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'CartoDEM & ASDMA'
    }
  ],

  // -------------------------------------------------------------
  // 3. CLOUDBURST (KEDARNATH, RUDRAPRAYAG, UTTARAKHAND)
  // -------------------------------------------------------------
  'cloudburst': [
    {
      id: 'UK-DOT-01',
      name: 'Kedarnath Cirque & Moraine Terrace',
      lat: 30.734,
      lng: 79.066,
      riskScore: 94,
      riskLevel: 'Critical',
      landslideRisk: 88,
      floodRisk: 92,
      surfaceSlope: 48.0,
      rainfall24h: 245,
      peopleAtRisk: 1650,
      vulnerableFamilies: 80,
      vulnerableAreaHa: 15.2,
      specificConditions: [
        { label: 'Cirque Amphitheater', value: '3,584 m MSL' },
        { label: 'Flash Hazard', value: 'Sudden High-Volume Deluge' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'NASA POWER & Uttarakhand SDMA'
    },
    {
      id: 'UK-DOT-02',
      name: 'Rambara Gorge Bottleneck Chute',
      lat: 30.685,
      lng: 79.069,
      riskScore: 92,
      riskLevel: 'Critical',
      landslideRisk: 85,
      floodRisk: 90,
      surfaceSlope: 42.5,
      rainfall24h: 232,
      peopleAtRisk: 980,
      vulnerableFamilies: 48,
      vulnerableAreaHa: 9.4,
      specificConditions: [
        { label: 'Choke Width', value: 'Severe Gorge Pinning' },
        { label: 'Boulder Entrainment', value: 'High' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Uttarakhand SDMA & GSI'
    },
    {
      id: 'UK-DOT-03',
      name: 'Gaurikund Riverbed Embankment',
      lat: 30.652,
      lng: 79.072,
      riskScore: 78,
      riskLevel: 'High',
      landslideRisk: 74,
      floodRisk: 78,
      surfaceSlope: 34.0,
      rainfall24h: 210,
      peopleAtRisk: 1420,
      vulnerableFamilies: 72,
      vulnerableAreaHa: 11.6,
      specificConditions: [
        { label: 'Bank Scour', value: 'High Torrent Shear' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Uttarakhand SDMA'
    },
    {
      id: 'UK-DOT-04',
      name: 'Sonprayag Confluence Junction',
      lat: 30.628,
      lng: 78.995,
      riskScore: 72,
      riskLevel: 'High',
      landslideRisk: 68,
      floodRisk: 70,
      surfaceSlope: 28.5,
      rainfall24h: 195,
      peopleAtRisk: 1250,
      vulnerableFamilies: 64,
      vulnerableAreaHa: 8.8,
      specificConditions: [
        { label: 'River Confluence', value: 'Mandakini-Vasuki' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Uttarakhand SDMA'
    },
    {
      id: 'UK-DOT-05',
      name: 'Phata Valley Intermediate Spur',
      lat: 30.582,
      lng: 79.042,
      riskScore: 55,
      riskLevel: 'Moderate',
      landslideRisk: 52,
      floodRisk: 45,
      surfaceSlope: 22.0,
      rainfall24h: 165,
      peopleAtRisk: 840,
      vulnerableFamilies: 42,
      vulnerableAreaHa: 7.5,
      specificConditions: [
        { label: 'Helipad Terrace', value: 'Stable Structural Bed' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Uttarakhand SDMA'
    },
    {
      id: 'UK-DOT-06',
      name: 'Guptkashi Elevated Bedrock Terrace',
      lat: 30.522,
      lng: 79.078,
      riskScore: 26,
      riskLevel: 'Low',
      landslideRisk: 22,
      floodRisk: 15,
      surfaceSlope: 14.5,
      rainfall24h: 128,
      peopleAtRisk: 520,
      vulnerableFamilies: 26,
      vulnerableAreaHa: 18.0,
      specificConditions: [
        { label: 'Clearance', value: '+260 m above river gorge' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Copernicus GLO-30 & Uttarakhand SDMA'
    },
    {
      id: 'UK-DOT-07',
      name: 'Ukhimath Granite Ridge Crest',
      lat: 30.518,
      lng: 79.098,
      riskScore: 22,
      riskLevel: 'Low',
      landslideRisk: 18,
      floodRisk: 12,
      surfaceSlope: 16.2,
      rainfall24h: 120,
      peopleAtRisk: 460,
      vulnerableFamilies: 24,
      vulnerableAreaHa: 14.2,
      specificConditions: [
        { label: 'Clearance', value: '+320 m above river gorge' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'Copernicus GLO-30 & Uttarakhand SDMA'
    }
  ],

  // -------------------------------------------------------------
  // 4. COASTAL EROSION (GANJAM COAST, ODISHA)
  // -------------------------------------------------------------
  'coastal-erosion': [
    {
      id: 'OD-DOT-01',
      name: 'Podampeta Beachfront & Active Fore-Dune',
      lat: 19.385,
      lng: 85.085,
      riskScore: 93,
      riskLevel: 'Critical',
      landslideRisk: 0,
      floodRisk: 75,
      surfaceSlope: 4.5,
      rainfall24h: 82,
      peopleAtRisk: 1450,
      vulnerableFamilies: 74,
      vulnerableAreaHa: 12.8,
      specificConditions: [
        { label: 'Erosion Rate', value: '-6.85 m/yr' },
        { label: 'Wave Runup Scour', value: 'Direct Intertidal Breach' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'USGS DSAS & Odisha SDMA'
    },
    {
      id: 'OD-DOT-02',
      name: 'Gokharkuda Estuarine Inlet Spit',
      lat: 19.362,
      lng: 85.062,
      riskScore: 88,
      riskLevel: 'Critical',
      landslideRisk: 0,
      floodRisk: 70,
      surfaceSlope: 3.2,
      rainfall24h: 80,
      peopleAtRisk: 1120,
      vulnerableFamilies: 58,
      vulnerableAreaHa: 10.5,
      specificConditions: [
        { label: 'Erosion Rate', value: '-5.40 m/yr' },
        { label: 'Tidal Inlet Migration', value: 'High Breach Risk' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'USGS DSAS & Odisha SDMA'
    },
    {
      id: 'OD-DOT-03',
      name: 'Purunabandha Estuary Margin',
      lat: 19.352,
      lng: 85.045,
      riskScore: 75,
      riskLevel: 'High',
      landslideRisk: 0,
      floodRisk: 64,
      surfaceSlope: 2.8,
      rainfall24h: 75,
      peopleAtRisk: 980,
      vulnerableFamilies: 52,
      vulnerableAreaHa: 8.4,
      specificConditions: [
        { label: 'Erosion Rate', value: '-3.80 m/yr' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'USGS DSAS'
    },
    {
      id: 'OD-DOT-04',
      name: 'Boxipalli Coastal Reach',
      lat: 19.288,
      lng: 84.895,
      riskScore: 54,
      riskLevel: 'Moderate',
      landslideRisk: 0,
      floodRisk: 42,
      surfaceSlope: 3.5,
      rainfall24h: 72,
      peopleAtRisk: 750,
      vulnerableFamilies: 38,
      vulnerableAreaHa: 6.2,
      specificConditions: [
        { label: 'Erosion Rate', value: '-2.10 m/yr' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'USGS DSAS'
    },
    {
      id: 'OD-DOT-05',
      name: 'Aryapalli Coastal Buffer',
      lat: 19.312,
      lng: 84.945,
      riskScore: 46,
      riskLevel: 'Moderate',
      landslideRisk: 0,
      floodRisk: 35,
      surfaceSlope: 4.0,
      rainfall24h: 68,
      peopleAtRisk: 620,
      vulnerableFamilies: 32,
      vulnerableAreaHa: 7.8,
      specificConditions: [
        { label: 'Erosion Rate', value: '-1.60 m/yr' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'USGS DSAS'
    },
    {
      id: 'OD-DOT-06',
      name: 'Humma Salt Pan & Coastal Ridge',
      lat: 19.412,
      lng: 85.105,
      riskScore: 28,
      riskLevel: 'Low',
      landslideRisk: 0,
      floodRisk: 20,
      surfaceSlope: 2.0,
      rainfall24h: 65,
      peopleAtRisk: 380,
      vulnerableFamilies: 20,
      vulnerableAreaHa: 14.0,
      specificConditions: [
        { label: 'Erosion Rate', value: '-0.40 m/yr' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'USGS DSAS & ALOS AW3D30'
    },
    {
      id: 'OD-DOT-07',
      name: 'Rangeilunda Laterite High Plateau',
      lat: 19.312,
      lng: 84.882,
      riskScore: 14,
      riskLevel: 'Low',
      landslideRisk: 0,
      floodRisk: 8,
      surfaceSlope: 8.2,
      rainfall24h: 62,
      peopleAtRisk: 240,
      vulnerableFamilies: 14,
      vulnerableAreaHa: 26.5,
      specificConditions: [
        { label: 'Erosion Rate', value: '0.0 m/yr (Inland Plateau)' }
      ],
      dataStatus: 'HISTORICAL',
      dataSource: 'USGS DSAS & ALOS AW3D30'
    }
  ]
};

/**
 * OPEN-METEO HOURLY RAINFALL TRENDS (8 observation intervals)
 */
export const RAINFALL_TREND_BY_HAZARD: Record<HazardType, {
  time: string;
  rainfallMm: number;
}[]> = {
  'landslide': [
    { time: '12 AM', rainfallMm: 8.4 },
    { time: '03 AM', rainfallMm: 14.2 },
    { time: '06 AM', rainfallMm: 22.8 },
    { time: '09 AM', rainfallMm: 34.5 },
    { time: '12 PM', rainfallMm: 28.0 },
    { time: '03 PM', rainfallMm: 19.4 },
    { time: '06 PM', rainfallMm: 12.6 },
    { time: '09 PM', rainfallMm: 6.1 }
  ],
  'flood': [
    { time: '12 AM', rainfallMm: 5.2 },
    { time: '03 AM', rainfallMm: 9.8 },
    { time: '06 AM', rainfallMm: 16.5 },
    { time: '09 AM', rainfallMm: 24.2 },
    { time: '12 PM', rainfallMm: 31.0 },
    { time: '03 PM', rainfallMm: 26.4 },
    { time: '06 PM', rainfallMm: 18.0 },
    { time: '09 PM', rainfallMm: 11.2 }
  ],
  'cloudburst': [
    { time: '12 AM', rainfallMm: 2.1 },
    { time: '03 AM', rainfallMm: 4.5 },
    { time: '06 AM', rainfallMm: 8.2 },
    { time: '09 AM', rainfallMm: 28.4 },
    { time: '12 PM', rainfallMm: 74.5 },
    { time: '03 PM', rainfallMm: 52.0 },
    { time: '06 PM', rainfallMm: 24.6 },
    { time: '09 PM', rainfallMm: 8.2 }
  ],
  'coastal-erosion': [
    { time: '12 AM', rainfallMm: 2.0 },
    { time: '03 AM', rainfallMm: 3.5 },
    { time: '06 AM', rainfallMm: 6.2 },
    { time: '09 AM', rainfallMm: 9.0 },
    { time: '12 PM', rainfallMm: 14.4 },
    { time: '03 PM', rainfallMm: 12.0 },
    { time: '06 PM', rainfallMm: 8.5 },
    { time: '09 PM', rainfallMm: 4.2 }
  ]
};

/**
 * HAZARD-SPECIFIC LOWER CONDITION TREND DATA
 */
export const HAZARD_CONDITION_TREND_BY_HAZARD: Record<HazardType, {
  title: string;
  sourceText: string;
  takeawayText: string;
  seriesA: { label: string; unit: string; data: { label: string; value: number }[] };
  seriesB: { label: string; unit: string; data: { label: string; value: number }[] };
}> = {
  'landslide': {
    title: 'SOIL MOISTURE & LANDSLIDE RISK',
    sourceText: 'Source: NASA SMAP (9km) / Geological Survey of India • HISTORICAL',
    takeawayText: 'Higher soil moisture is associated with increased landslide risk in the available observations.',
    seriesA: {
      label: 'Soil Moisture',
      unit: 'm³/m³',
      data: [
        { label: 'Obs 1 (Kuppadithara)', value: 0.229 },
        { label: 'Obs 2 (Kottathara)', value: 0.219 },
        { label: 'Obs 3 (Panamaram)', value: 0.297 },
        { label: 'Obs 4 (Kalpetta)', value: 0.370 },
        { label: 'Obs 5 (Padinjarathara)', value: 0.397 },
        { label: 'Obs 6 (Meppadi)', value: 0.472 },
        { label: 'Obs 7 (Pozhuthana)', value: 0.478 }
      ]
    },
    seriesB: {
      label: 'Landslide Risk',
      unit: 'Score',
      data: [
        { label: 'Obs 1 (Kuppadithara)', value: 22 },
        { label: 'Obs 2 (Kottathara)', value: 28 },
        { label: 'Obs 3 (Panamaram)', value: 45 },
        { label: 'Obs 4 (Kalpetta)', value: 42 },
        { label: 'Obs 5 (Padinjarathara)', value: 68 },
        { label: 'Obs 6 (Meppadi)', value: 85 },
        { label: 'Obs 7 (Pozhuthana)', value: 92 }
      ]
    }
  },

  'flood': {
    title: 'RIVER STAGE & FLOOD CONDITIONS',
    sourceText: 'Source: Central Water Commission (CWC) & ASDMA • HISTORICAL',
    takeawayText: 'Brahmaputra river stage has remained elevated near the danger level (105.7m), maintaining continuous hydraulic pressure against the Rohmaria embankment.',
    seriesA: {
      label: 'River Water Level',
      unit: 'm MSL',
      data: [
        { label: 'Day -6', value: 104.2 },
        { label: 'Day -5', value: 104.6 },
        { label: 'Day -4', value: 105.1 },
        { label: 'Day -3', value: 105.5 },
        { label: 'Day -2', value: 105.9 },
        { label: 'Day -1', value: 106.2 },
        { label: 'Current', value: 105.8 }
      ]
    },
    seriesB: {
      label: 'Submerged Area',
      unit: 'Hectares',
      data: [
        { label: 'Day -6', value: 420 },
        { label: 'Day -5', value: 680 },
        { label: 'Day -4', value: 1150 },
        { label: 'Day -3', value: 1840 },
        { label: 'Day -2', value: 2420 },
        { label: 'Day -1', value: 2650 },
        { label: 'Current', value: 2380 }
      ]
    }
  },

  'cloudburst': {
    title: 'RAINFALL INTENSITY & TORRENT DYNAMICS',
    sourceText: 'Source: NASA POWER Daily Agroclimatology & IMD Station • HISTORICAL',
    takeawayText: 'Intense short-duration rainfall on steep alpine headwalls accelerates debris and flash torrent velocities downstream through the Mandakini gorge.',
    seriesA: {
      label: 'Rainfall Intensity',
      unit: 'mm/hr',
      data: [
        { label: '06:00', value: 4.2 },
        { label: '08:00', value: 12.5 },
        { label: '10:00', value: 28.0 },
        { label: '12:00', value: 74.5 },
        { label: '14:00', value: 58.2 },
        { label: '16:00', value: 32.0 },
        { label: '18:00', value: 14.5 }
      ]
    },
    seriesB: {
      label: 'Kinetic Risk Index',
      unit: 'Score',
      data: [
        { label: '06:00', value: 18 },
        { label: '08:00', value: 34 },
        { label: '10:00', value: 62 },
        { label: '12:00', value: 95 },
        { label: '14:00', value: 88 },
        { label: '16:00', value: 72 },
        { label: '18:00', value: 45 }
      ]
    }
  },

  'coastal-erosion': {
    title: 'SHORELINE MOVEMENT & EROSION METRICS',
    sourceText: 'Source: USGS DSAS / Landsat-8 & Sentinel-2 Multi-Temporal Observations • HISTORICAL',
    takeawayText: 'Active fore-dune retreat continues along unprotected beachfront sectors under sustained monsoon wave energy.',
    seriesA: {
      label: 'Net Shoreline Movement',
      unit: 'Meters',
      data: [
        { label: '2013', value: -0.5 },
        { label: '2015', value: -11.2 },
        { label: '2017', value: -22.4 },
        { label: '2019', value: -34.8 },
        { label: '2021', value: -46.5 },
        { label: '2023', value: -56.0 },
        { label: '2024', value: -62.4 }
      ]
    },
    seriesB: {
      label: 'Annual Erosion Rate',
      unit: 'm/year',
      data: [
        { label: '2013', value: -1.2 },
        { label: '2015', value: -5.4 },
        { label: '2017', value: -5.6 },
        { label: '2019', value: -6.2 },
        { label: '2021', value: -5.8 },
        { label: '2023', value: -4.8 },
        { label: '2024', value: -6.8 }
      ]
    }
  }
};

export const getRiskDotsForHazard = (hazard: HazardType): RiskDotLocation[] => {
  return RED_ZONE_LOCATIONS_BY_HAZARD[hazard] || RED_ZONE_LOCATIONS_BY_HAZARD['landslide'];
};

export const getRainfallTrend = (hazard: HazardType) => {
  return RAINFALL_TREND_BY_HAZARD[hazard] || RAINFALL_TREND_BY_HAZARD['landslide'];
};

export const getConditionTrend = (hazard: HazardType) => {
  return HAZARD_CONDITION_TREND_BY_HAZARD[hazard] || HAZARD_CONDITION_TREND_BY_HAZARD['landslide'];
};
