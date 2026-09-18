// ============================================================
// UTTARAKHAND CLOUDBURST INTELLIGENCE & EARLY WARNING DATASET
// Grounded in 36-Year NASA POWER Meteorological Records & Random Forest Model
// Source: NASA POWER Meteorological Records & Survey of India
// ============================================================

export interface CloudburstHotspot {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  cloudburstEvents: number;
  totalSamples: number;
  meanRainfallMm: number;
  maxRainfallMm: number;
  meanTempC: number;
  meanHumidityPct: number;
  meanWindMs: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  rpiScore: number;
  priorityClass: 'P1 — IMMEDIATE' | 'P2 — HIGH' | 'P3 — MEDIUM' | 'P4 — MONITOR';
  primaryTrigger: string;
  safeStagingDestination: string;
  transitDistanceKm: number;
}

export interface HistoricalDisasterBacktest {
  id: string;
  name: string;
  location: string;
  district: string;
  date: string;
  nasaRainfallMm: number;
  temperatureC: number;
  relativeHumidityPct: number;
  windSpeedMs: number;
  predictedProbability: number;
  riskCategory: string;
  validationOutcome: string;
  historicalContext: string;
}

export interface FeatureImportance {
  feature: string;
  name: string;
  importance: number;
  pct: string;
  description: string;
}

export interface SafeStagingHub {
  site_id: string;
  name: string;
  district: string;
  elevation_m: number;
  ccas_score: number;
  total_capacity: number;
  available_capacity: number;
  water_capacity_lpd: number;
  latrines_count: number;
  sphere_shelter_area_m2: number;
  road_access: string;
  allocated_for: string;
  coordinates: [number, number];
}

export const UTTARAKHAND_CLOUDBURST_SUMMARY = {
  totalHotspots: 20,
  totalDistricts: 13,
  monitoredState: 'Uttarakhand, India',
  dataRangeYears: '36 Years (1988–2024)',
  dataSource: 'NASA POWER Daily Agroclimatology & Open-Meteo',
  totalRecordedCloudburstEvents: 167,
  maxRecorded24hRainfallMm: 377.8,
  highestRiskLocation: 'Pithoragarh Town & Malpa (Pithoragarh)',
  kedarnathDisasterCatchRate: '85.8% (Caught Day-Ahead)',
  modelTrainedAlgorithm: 'Random Forest Classifier (15 Meteorological Features)',
  dataStatus: 'HISTORICAL / MODEL ANALYSIS'
};

export const UTTARAKHAND_HOTSPOTS: CloudburstHotspot[] = [
  {
    "id": "cb-site-01",
    "name": "Pithoragarh Town (Pithoragarh)",
    "district": "Pithoragarh",
    "latitude": 29.58,
    "longitude": 80.22,
    "elevationMeters": 1636,
    "cloudburstEvents": 18,
    "totalSamples": 34,
    "meanRainfallMm": 60.5,
    "maxRainfallMm": 344.8,
    "meanTempC": 18.4,
    "meanHumidityPct": 67.4,
    "meanWindMs": 2.4,
    "riskLevel": "CRITICAL",
    "rpiScore": 94.0,
    "priorityClass": "P1 \u2014 IMMEDIATE",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pithoragarh High-Ridge Vocational Campus",
    "transitDistanceKm": 4.2
  },
  {
    "id": "cb-site-02",
    "name": "Champawat (Champawat)",
    "district": "Champawat",
    "latitude": 29.34,
    "longitude": 80.09,
    "elevationMeters": 1610,
    "cloudburstEvents": 15,
    "totalSamples": 33,
    "meanRainfallMm": 62.4,
    "maxRainfallMm": 344.8,
    "meanTempC": 19.0,
    "meanHumidityPct": 68.1,
    "meanWindMs": 2.5,
    "riskLevel": "CRITICAL",
    "rpiScore": 92.5,
    "priorityClass": "P1 \u2014 IMMEDIATE",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pithoragarh High-Ridge Vocational Campus",
    "transitDistanceKm": 28.0
  },
  {
    "id": "cb-site-03",
    "name": "Almora (Almora)",
    "district": "Almora",
    "latitude": 29.6,
    "longitude": 79.66,
    "elevationMeters": 1638,
    "cloudburstEvents": 13,
    "totalSamples": 30,
    "meanRainfallMm": 49.6,
    "maxRainfallMm": 200.5,
    "meanTempC": 19.2,
    "meanHumidityPct": 75.6,
    "meanWindMs": 2.4,
    "riskLevel": "CRITICAL",
    "rpiScore": 91.5,
    "priorityClass": "P1 \u2014 IMMEDIATE",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pithoragarh High-Ridge Vocational Campus",
    "transitDistanceKm": 35.0
  },
  {
    "id": "cb-site-04",
    "name": "Mussoorie (Dehradun)",
    "district": "Dehradun",
    "latitude": 30.45,
    "longitude": 78.07,
    "elevationMeters": 2005,
    "cloudburstEvents": 13,
    "totalSamples": 30,
    "meanRainfallMm": 35.0,
    "maxRainfallMm": 158.4,
    "meanTempC": 20.0,
    "meanHumidityPct": 68.6,
    "meanWindMs": 2.4,
    "riskLevel": "CRITICAL",
    "rpiScore": 91.5,
    "priorityClass": "P1 \u2014 IMMEDIATE",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Dehradun Valley Elevated Staging Hub",
    "transitDistanceKm": 26.0
  },
  {
    "id": "cb-site-05",
    "name": "Tehri (Tehri Garhwal)",
    "district": "Tehri Garhwal",
    "latitude": 30.38,
    "longitude": 78.49,
    "elevationMeters": 1750,
    "cloudburstEvents": 13,
    "totalSamples": 34,
    "meanRainfallMm": 33.2,
    "maxRainfallMm": 159.2,
    "meanTempC": 16.7,
    "meanHumidityPct": 69.0,
    "meanWindMs": 2.2,
    "riskLevel": "CRITICAL",
    "rpiScore": 91.5,
    "priorityClass": "P1 \u2014 IMMEDIATE",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pauri Garhwal Central Highland Complex",
    "transitDistanceKm": 34.0
  },
  {
    "id": "cb-site-06",
    "name": "Munsiyari (Pithoragarh)",
    "district": "Pithoragarh",
    "latitude": 30.07,
    "longitude": 80.24,
    "elevationMeters": 2200,
    "cloudburstEvents": 10,
    "totalSamples": 25,
    "meanRainfallMm": 44.7,
    "maxRainfallMm": 287.5,
    "meanTempC": 15.2,
    "meanHumidityPct": 73.8,
    "meanWindMs": 2.4,
    "riskLevel": "HIGH",
    "rpiScore": 77.0,
    "priorityClass": "P2 \u2014 HIGH",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pithoragarh High-Ridge Vocational Campus",
    "transitDistanceKm": 36.5
  },
  {
    "id": "cb-site-07",
    "name": "Bageshwar (Bageshwar)",
    "district": "Bageshwar",
    "latitude": 29.83,
    "longitude": 79.77,
    "elevationMeters": 1004,
    "cloudburstEvents": 10,
    "totalSamples": 23,
    "meanRainfallMm": 43.4,
    "maxRainfallMm": 287.5,
    "meanTempC": 12.6,
    "meanHumidityPct": 60.3,
    "meanWindMs": 2.2,
    "riskLevel": "HIGH",
    "rpiScore": 77.0,
    "priorityClass": "P2 \u2014 HIGH",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pithoragarh High-Ridge Vocational Campus",
    "transitDistanceKm": 32.0
  },
  {
    "id": "cb-site-08",
    "name": "Pauri (Pauri Garhwal)",
    "district": "Pauri Garhwal",
    "latitude": 30.15,
    "longitude": 78.78,
    "elevationMeters": 1814,
    "cloudburstEvents": 10,
    "totalSamples": 28,
    "meanRainfallMm": 41.7,
    "maxRainfallMm": 175.4,
    "meanTempC": 21.1,
    "meanHumidityPct": 68.3,
    "meanWindMs": 2.6,
    "riskLevel": "HIGH",
    "rpiScore": 77.0,
    "priorityClass": "P2 \u2014 HIGH",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pauri Garhwal Central Highland Complex",
    "transitDistanceKm": 5.0
  },
  {
    "id": "cb-site-09",
    "name": "Nainital (Nainital)",
    "district": "Nainital",
    "latitude": 29.38,
    "longitude": 79.45,
    "elevationMeters": 2084,
    "cloudburstEvents": 10,
    "totalSamples": 33,
    "meanRainfallMm": 41.7,
    "maxRainfallMm": 200.5,
    "meanTempC": 20.3,
    "meanHumidityPct": 69.7,
    "meanWindMs": 2.4,
    "riskLevel": "HIGH",
    "rpiScore": 77.0,
    "priorityClass": "P2 \u2014 HIGH",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Dehradun Valley Elevated Staging Hub",
    "transitDistanceKm": 75.0
  },
  {
    "id": "cb-site-10",
    "name": "Badrinath (Chamoli)",
    "district": "Chamoli",
    "latitude": 30.74,
    "longitude": 79.49,
    "elevationMeters": 3133,
    "cloudburstEvents": 9,
    "totalSamples": 25,
    "meanRainfallMm": 17.3,
    "maxRainfallMm": 116.2,
    "meanTempC": 8.6,
    "meanHumidityPct": 70.8,
    "meanWindMs": 2.3,
    "riskLevel": "HIGH",
    "rpiScore": 76.5,
    "priorityClass": "P2 \u2014 HIGH",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Joshimath Upper Cantonment Plateau",
    "transitDistanceKm": 44.0
  },
  {
    "id": "cb-site-11",
    "name": "Mandakini Valley (Rudraprayag)",
    "district": "Rudraprayag",
    "latitude": 30.45,
    "longitude": 79.2,
    "elevationMeters": 1400,
    "cloudburstEvents": 8,
    "totalSamples": 32,
    "meanRainfallMm": 14.3,
    "maxRainfallMm": 116.2,
    "meanTempC": 7.7,
    "meanHumidityPct": 68.1,
    "meanWindMs": 2.5,
    "riskLevel": "HIGH",
    "rpiScore": 76.0,
    "priorityClass": "P2 \u2014 HIGH",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Guptkashi Upper Ridge Staging Enclave",
    "transitDistanceKm": 12.0
  },
  {
    "id": "cb-site-12",
    "name": "Malpa (Pithoragarh)",
    "district": "Pithoragarh",
    "latitude": 30.23,
    "longitude": 80.72,
    "elevationMeters": 2200,
    "cloudburstEvents": 8,
    "totalSamples": 19,
    "meanRainfallMm": 64.0,
    "maxRainfallMm": 377.8,
    "meanTempC": 7.6,
    "meanHumidityPct": 75.4,
    "meanWindMs": 2.3,
    "riskLevel": "CRITICAL",
    "rpiScore": 89.0,
    "priorityClass": "P1 \u2014 IMMEDIATE",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pithoragarh High-Ridge Vocational Campus",
    "transitDistanceKm": 48.0
  },
  {
    "id": "cb-site-13",
    "name": "Srinagar (Pauri Garhwal)",
    "district": "Pauri Garhwal",
    "latitude": 30.22,
    "longitude": 78.77,
    "elevationMeters": 560,
    "cloudburstEvents": 7,
    "totalSamples": 23,
    "meanRainfallMm": 49.0,
    "maxRainfallMm": 175.4,
    "meanTempC": 19.9,
    "meanHumidityPct": 66.4,
    "meanWindMs": 2.3,
    "riskLevel": "MODERATE",
    "rpiScore": 63.5,
    "priorityClass": "P3 \u2014 MEDIUM",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pauri Garhwal Central Highland Complex",
    "transitDistanceKm": 18.0
  },
  {
    "id": "cb-site-14",
    "name": "Devprayag (Tehri Garhwal)",
    "district": "Tehri Garhwal",
    "latitude": 30.15,
    "longitude": 78.6,
    "elevationMeters": 830,
    "cloudburstEvents": 7,
    "totalSamples": 22,
    "meanRainfallMm": 46.2,
    "maxRainfallMm": 175.4,
    "meanTempC": 20.0,
    "meanHumidityPct": 66.5,
    "meanWindMs": 2.4,
    "riskLevel": "MODERATE",
    "rpiScore": 63.5,
    "priorityClass": "P3 \u2014 MEDIUM",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Pauri Garhwal Central Highland Complex",
    "transitDistanceKm": 29.0
  },
  {
    "id": "cb-site-15",
    "name": "Kedarnath (Rudraprayag)",
    "district": "Rudraprayag",
    "latitude": 30.735,
    "longitude": 79.066,
    "elevationMeters": 3583,
    "cloudburstEvents": 6,
    "totalSamples": 19,
    "meanRainfallMm": 27.3,
    "maxRainfallMm": 116.2,
    "meanTempC": 7.6,
    "meanHumidityPct": 70.4,
    "meanWindMs": 2.3,
    "riskLevel": "MODERATE",
    "rpiScore": 63.0,
    "priorityClass": "P3 \u2014 MEDIUM",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Guptkashi Upper Ridge Staging Enclave",
    "transitDistanceKm": 24.5
  },
  {
    "id": "cb-site-16",
    "name": "Haridwar (Haridwar)",
    "district": "Haridwar",
    "latitude": 29.95,
    "longitude": 78.16,
    "elevationMeters": 314,
    "cloudburstEvents": 5,
    "totalSamples": 16,
    "meanRainfallMm": 43.5,
    "maxRainfallMm": 168.7,
    "meanTempC": 23.0,
    "meanHumidityPct": 65.4,
    "meanWindMs": 2.4,
    "riskLevel": "MODERATE",
    "rpiScore": 62.5,
    "priorityClass": "P3 \u2014 MEDIUM",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Dehradun Valley Elevated Staging Hub",
    "transitDistanceKm": 45.0
  },
  {
    "id": "cb-site-17",
    "name": "Arakot (Uttarkashi)",
    "district": "Uttarkashi",
    "latitude": 30.88,
    "longitude": 78.2,
    "elevationMeters": 1350,
    "cloudburstEvents": 4,
    "totalSamples": 22,
    "meanRainfallMm": 13.0,
    "maxRainfallMm": 121.7,
    "meanTempC": 11.6,
    "meanHumidityPct": 59.1,
    "meanWindMs": 2.4,
    "riskLevel": "LOW",
    "rpiScore": 47.0,
    "priorityClass": "P4 \u2014 MONITOR",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Uttarkashi Hilltop Resettlement Base",
    "transitDistanceKm": 42.0
  },
  {
    "id": "cb-site-18",
    "name": "Dharali (Uttarkashi)",
    "district": "Uttarkashi",
    "latitude": 31.04,
    "longitude": 78.73,
    "elevationMeters": 2680,
    "cloudburstEvents": 4,
    "totalSamples": 27,
    "meanRainfallMm": 10.5,
    "maxRainfallMm": 119.6,
    "meanTempC": 3.8,
    "meanHumidityPct": 73.9,
    "meanWindMs": 2.9,
    "riskLevel": "LOW",
    "rpiScore": 47.0,
    "priorityClass": "P4 \u2014 MONITOR",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Uttarkashi Hilltop Resettlement Base",
    "transitDistanceKm": 38.0
  },
  {
    "id": "cb-site-19",
    "name": "Joshimath (Chamoli)",
    "district": "Chamoli",
    "latitude": 30.55,
    "longitude": 79.57,
    "elevationMeters": 1890,
    "cloudburstEvents": 3,
    "totalSamples": 24,
    "meanRainfallMm": 15.6,
    "maxRainfallMm": 116.2,
    "meanTempC": 4.6,
    "meanHumidityPct": 63.8,
    "meanWindMs": 2.2,
    "riskLevel": "LOW",
    "rpiScore": 46.5,
    "priorityClass": "P4 \u2014 MONITOR",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Joshimath Upper Cantonment Plateau",
    "transitDistanceKm": 3.2
  },
  {
    "id": "cb-site-20",
    "name": "Karnaprayag (Chamoli)",
    "district": "Chamoli",
    "latitude": 30.27,
    "longitude": 79.21,
    "elevationMeters": 1451,
    "cloudburstEvents": 3,
    "totalSamples": 29,
    "meanRainfallMm": 12.5,
    "maxRainfallMm": 116.2,
    "meanTempC": 7.4,
    "meanHumidityPct": 60.7,
    "meanWindMs": 2.3,
    "riskLevel": "LOW",
    "rpiScore": 46.5,
    "priorityClass": "P4 \u2014 MONITOR",
    "primaryTrigger": "High-altitude orographic condensation & extreme cloudburst convergence",
    "safeStagingDestination": "Joshimath Upper Cantonment Plateau",
    "transitDistanceKm": 32.0
  }
];

export const FAMOUS_DISASTER_BACKTESTS: HistoricalDisasterBacktest[] = [
  {
    "id": "bt-01",
    "name": "Kedarnath Disaster (16 Jun 2013)",
    "location": "Kedarnath (Rudraprayag)",
    "district": "Rudraprayag",
    "date": "2013-06-16",
    "nasaRainfallMm": 116.0,
    "temperatureC": 2.2,
    "relativeHumidityPct": 86.0,
    "windSpeedMs": 4.12,
    "predictedProbability": 0.858,
    "riskCategory": "HIGH RISK (85.8%)",
    "validationOutcome": "CRITICAL CATCH",
    "historicalContext": "Catastrophic cloudburst upstream of Chorabari lake triggering massive debris flow down Mandakini river."
  },
  {
    "id": "bt-02",
    "name": "Mandakini Valley Flash Flood (17 Jun 2013)",
    "location": "Mandakini Valley (Rudraprayag)",
    "district": "Rudraprayag",
    "date": "2013-06-17",
    "nasaRainfallMm": 57.1,
    "temperatureC": 10.5,
    "relativeHumidityPct": 84.0,
    "windSpeedMs": 3.85,
    "predictedProbability": 0.714,
    "riskCategory": "HIGH RISK (71.4%)",
    "validationOutcome": "CRITICAL CATCH",
    "historicalContext": "Downstream surge following continuous torrential rain inundating Rambara and Gaurikund settlements."
  },
  {
    "id": "bt-03",
    "name": "Malpa Landslide & Cloudburst (17 Aug 1998)",
    "location": "Malpa (Pithoragarh)",
    "district": "Pithoragarh",
    "date": "1998-08-17",
    "nasaRainfallMm": 377.8,
    "temperatureC": 7.6,
    "relativeHumidityPct": 92.0,
    "windSpeedMs": 4.8,
    "predictedProbability": 0.924,
    "riskCategory": "CRITICAL RISK (92.4%)",
    "validationOutcome": "CRITICAL CATCH",
    "historicalContext": "Catastrophic rockfall and debris avalanche triggered by massive cloudburst along the Kali river gorge."
  },
  {
    "id": "bt-04",
    "name": "Pauri Cloudburst Surge (14 Aug 2012)",
    "location": "Pauri (Pauri Garhwal)",
    "district": "Pauri Garhwal",
    "date": "2012-08-14",
    "nasaRainfallMm": 130.0,
    "temperatureC": 21.1,
    "relativeHumidityPct": 88.0,
    "windSpeedMs": 3.4,
    "predictedProbability": 0.686,
    "riskCategory": "HIGH RISK (68.6%)",
    "validationOutcome": "CAUGHT",
    "historicalContext": "Sudden cloudburst event washing away bridges and roads connecting Pauri and Srinagar."
  },
  {
    "id": "bt-05",
    "name": "Mussoorie Cloudburst (12 Aug 2009)",
    "location": "Mussoorie (Dehradun)",
    "district": "Dehradun",
    "date": "2009-08-12",
    "nasaRainfallMm": 158.4,
    "temperatureC": 20.0,
    "relativeHumidityPct": 85.0,
    "windSpeedMs": 3.9,
    "predictedProbability": 0.676,
    "riskCategory": "HIGH RISK (67.6%)",
    "validationOutcome": "CAUGHT (VIA LAG METRICS)",
    "historicalContext": "Orographic trapping over Mussoorie ridge resulting in intense localized downpour and slope instability."
  },
  {
    "id": "bt-06",
    "name": "Joshimath Glacier Disaster (7 Feb 2021)",
    "location": "Joshimath (Chamoli)",
    "district": "Chamoli",
    "date": "2021-02-07",
    "nasaRainfallMm": 1.9,
    "temperatureC": -2.4,
    "relativeHumidityPct": 42.0,
    "windSpeedMs": 2.1,
    "predictedProbability": 0.151,
    "riskCategory": "LOW RISK (15.1%)",
    "validationOutcome": "CORRECTLY FLAGGED LOW (NON-CLOUDBURST)",
    "historicalContext": "Rock/ice avalanche and glacial outburst flood without meteorological cloudburst pre-conditions; model correctly flags Low."
  },
  {
    "id": "bt-07",
    "name": "Tehri Cloudburst (13 Aug 2003)",
    "location": "Tehri (Tehri Garhwal)",
    "district": "Tehri Garhwal",
    "date": "2003-08-13",
    "nasaRainfallMm": 159.2,
    "temperatureC": 18.5,
    "relativeHumidityPct": 89.0,
    "windSpeedMs": 3.6,
    "predictedProbability": 0.742,
    "riskCategory": "HIGH RISK (74.2%)",
    "validationOutcome": "CAUGHT",
    "historicalContext": "Intense cloudburst inundating Bhagirathi river tributaries and collapsing hillslope roads."
  },
  {
    "id": "bt-08",
    "name": "Pithoragarh Bansbagar (15 Aug 2010)",
    "location": "Pithoragarh Town (Pithoragarh)",
    "district": "Pithoragarh",
    "date": "2010-08-15",
    "nasaRainfallMm": 344.8,
    "temperatureC": 19.2,
    "relativeHumidityPct": 94.0,
    "windSpeedMs": 4.1,
    "predictedProbability": 0.895,
    "riskCategory": "CRITICAL RISK (89.5%)",
    "validationOutcome": "CRITICAL CATCH",
    "historicalContext": "Over 340mm extreme downpour in 24 hours causing severe debris torrents in Pithoragarh valleys."
  },
  {
    "id": "bt-09",
    "name": "Almora Cloudburst (19 Sep 2010)",
    "location": "Almora (Almora)",
    "district": "Almora",
    "date": "2010-09-19",
    "nasaRainfallMm": 200.5,
    "temperatureC": 19.5,
    "relativeHumidityPct": 96.0,
    "windSpeedMs": 4.12,
    "predictedProbability": 0.812,
    "riskCategory": "HIGH RISK (81.2%)",
    "validationOutcome": "CAUGHT",
    "historicalContext": "Late-monsoon cloudburst surge breaching Kosi river sub-catchment banks."
  },
  {
    "id": "bt-10",
    "name": "Badrinath Extreme Pulse (19 Aug 2022)",
    "location": "Badrinath (Chamoli)",
    "district": "Chamoli",
    "date": "2022-08-19",
    "nasaRainfallMm": 116.2,
    "temperatureC": 8.5,
    "relativeHumidityPct": 90.0,
    "windSpeedMs": 3.2,
    "predictedProbability": 0.705,
    "riskCategory": "HIGH RISK (70.5%)",
    "validationOutcome": "CAUGHT",
    "historicalContext": "High-altitude cloudburst pulse over Alaknanda headwaters blocking highway."
  },
  {
    "id": "bt-11",
    "name": "Arakot Cloudburst (18 Aug 2019)",
    "location": "Arakot (Uttarkashi)",
    "district": "Uttarkashi",
    "date": "2019-08-18",
    "nasaRainfallMm": 121.7,
    "temperatureC": 14.8,
    "relativeHumidityPct": 83.0,
    "windSpeedMs": 3.1,
    "predictedProbability": 0.692,
    "riskCategory": "HIGH RISK (69.2%)",
    "validationOutcome": "CAUGHT",
    "historicalContext": "Flash flood and mud torrents devastating Tons river valley settlements."
  },
  {
    "id": "bt-12",
    "name": "Dharali High-Altitude Pulse (05 Aug 2025)",
    "location": "Dharali (Uttarkashi)",
    "district": "Uttarkashi",
    "date": "2025-08-05",
    "nasaRainfallMm": 119.6,
    "temperatureC": 5.7,
    "relativeHumidityPct": 97.0,
    "windSpeedMs": 2.9,
    "predictedProbability": 0.738,
    "riskCategory": "HIGH RISK (73.8%)",
    "validationOutcome": "CAUGHT",
    "historicalContext": "Himalayan Bhagirathi gorge cloudburst trigger causing bridge failure."
  }
];

export const METEOROLOGICAL_FEATURE_IMPORTANCE: FeatureImportance[] = [
  {
    "feature": "RH2M",
    "name": "Relative Humidity (2m)",
    "importance": 0.0887,
    "pct": "8.87%",
    "description": "Atmospheric moisture saturation level; critical for convective cell formation."
  },
  {
    "feature": "PRECTOT_3d_mean",
    "name": "3-Day Antecedent Rainfall",
    "importance": 0.0792,
    "pct": "7.92%",
    "description": "Catchment pre-saturation; lowers soil infiltration and amplifies runoff volume."
  },
  {
    "feature": "WS2M_lag1",
    "name": "Wind Speed (1-Day Lag)",
    "importance": 0.0749,
    "pct": "7.49%",
    "description": "Precursor orographic upslope wind forcing clouds against mountain barrier."
  },
  {
    "feature": "T2M",
    "name": "Air Temperature (2m)",
    "importance": 0.0692,
    "pct": "6.92%",
    "description": "Convective thermal updraft driver lifting saturated air past condensation level."
  },
  {
    "feature": "RH2M_lag1",
    "name": "Relative Humidity (1-Day Lag)",
    "importance": 0.0648,
    "pct": "6.48%",
    "description": "Persistence of high relative humidity across valley basins."
  },
  {
    "feature": "WS2M",
    "name": "Wind Speed (2m)",
    "importance": 0.0628,
    "pct": "6.28%",
    "description": "Wind vector carrying cloud parcel over ridges."
  },
  {
    "feature": "T2M_lag1",
    "name": "Air Temperature (1-Day Lag)",
    "importance": 0.0627,
    "pct": "6.27%",
    "description": "Boundary layer heat buildup prior to storm breakout."
  },
  {
    "feature": "PRECTOT_lag1",
    "name": "1-Day Prior Rainfall",
    "importance": 0.0511,
    "pct": "5.11%",
    "description": "Immediate pre-storm moisture ground saturation."
  },
  {
    "feature": "Heat_Index",
    "name": "Heat Index Combined",
    "importance": 0.0505,
    "pct": "5.05%",
    "description": "Combined thermodynamic instability metric."
  },
  {
    "feature": "Humidity_Change",
    "name": "Rapid Humidity Change Delta",
    "importance": 0.0502,
    "pct": "5.02%",
    "description": "Sudden surge in humidity indicating approaching storm front."
  },
  {
    "feature": "T2M_3d_mean",
    "name": "3-Day Mean Temperature",
    "importance": 0.0498,
    "pct": "4.98%",
    "description": "Multi-day heating establishing localized low pressure trough."
  },
  {
    "feature": "Month_sin",
    "name": "Seasonal Phase (Sin)",
    "importance": 0.0489,
    "pct": "4.89%",
    "description": "Monsoon seasonality peak alignment."
  },
  {
    "feature": "Month_cos",
    "name": "Seasonal Phase (Cos)",
    "importance": 0.0465,
    "pct": "4.65%",
    "description": "Seasonal cycle component."
  },
  {
    "feature": "Temperature_Change",
    "name": "Temperature Delta",
    "importance": 0.0452,
    "pct": "4.52%",
    "description": "Temperature drop during convective storm formation."
  },
  {
    "feature": "RH2M_3d_mean",
    "name": "3-Day Mean Relative Humidity",
    "importance": 0.0441,
    "pct": "4.41%",
    "description": "Prolonged moisture buildup in deep valleys."
  }
];

export const SAFE_STAGING_DESTINATIONS: SafeStagingHub[] = [
  {
    "site_id": "uk-safe-01",
    "name": "Guptkashi Upper Ridge Staging Enclave",
    "district": "Rudraprayag",
    "elevation_m": 1319,
    "ccas_score": 93.5,
    "total_capacity": 4500,
    "available_capacity": 4100,
    "water_capacity_lpd": 340000,
    "latrines_count": 225,
    "sphere_shelter_area_m2": 15750,
    "road_access": "NH-107 Rudraprayag-Gaurikund Highway (Protected Arterial)",
    "allocated_for": "Kedarnath, Rambara, Gaurikund & Mandakini Valley (3,200 pax)",
    "coordinates": [
      30.522,
      79.08
    ]
  },
  {
    "site_id": "uk-safe-02",
    "name": "Joshimath Upper Cantonment Plateau",
    "district": "Chamoli",
    "elevation_m": 1890,
    "ccas_score": 91.2,
    "total_capacity": 3800,
    "available_capacity": 3450,
    "water_capacity_lpd": 285000,
    "latrines_count": 190,
    "sphere_shelter_area_m2": 13300,
    "road_access": "NH-07 Rishikesh-Badrinath Highway (Solid Bedrock Sector)",
    "allocated_for": "Badrinath pilgrims, Karnaprayag & Alaknanda gorge habitations (2,800 pax)",
    "coordinates": [
      30.556,
      79.57
    ]
  },
  {
    "site_id": "uk-safe-03",
    "name": "Pithoragarh High-Ridge Vocational Campus",
    "district": "Pithoragarh",
    "elevation_m": 1636,
    "ccas_score": 92.8,
    "total_capacity": 4000,
    "available_capacity": 3600,
    "water_capacity_lpd": 300000,
    "latrines_count": 200,
    "sphere_shelter_area_m2": 14000,
    "road_access": "NH-09 Tanakpur-Pithoragarh Highway",
    "allocated_for": "Malpa, Munsiyari, Bansbagar & Dharchula habitations (3,100 pax)",
    "coordinates": [
      29.585,
      80.215
    ]
  },
  {
    "site_id": "uk-safe-04",
    "name": "Dehradun Valley Elevated Staging Hub",
    "district": "Dehradun",
    "elevation_m": 680,
    "ccas_score": 95.0,
    "total_capacity": 6500,
    "available_capacity": 5800,
    "water_capacity_lpd": 500000,
    "latrines_count": 325,
    "sphere_shelter_area_m2": 22750,
    "road_access": "NH-307 Dehradun-Mussoorie Highway & Airport corridor",
    "allocated_for": "Mussoorie ridge settlements & Dehradun foothill sectors (4,200 pax)",
    "coordinates": [
      30.325,
      78.04
    ]
  },
  {
    "site_id": "uk-safe-05",
    "name": "Pauri Garhwal Central Highland Complex",
    "district": "Pauri Garhwal",
    "elevation_m": 1814,
    "ccas_score": 90.4,
    "total_capacity": 3200,
    "available_capacity": 2900,
    "water_capacity_lpd": 240000,
    "latrines_count": 160,
    "sphere_shelter_area_m2": 11200,
    "road_access": "NH-534 Kotdwar-Pauri Protected Corridor",
    "allocated_for": "Pauri, Srinagar & Devprayag riverine settlements (2,400 pax)",
    "coordinates": [
      30.155,
      78.785
    ]
  },
  {
    "site_id": "uk-safe-06",
    "name": "Uttarkashi Hilltop Resettlement Base",
    "district": "Uttarkashi",
    "elevation_m": 1158,
    "ccas_score": 89.6,
    "total_capacity": 3000,
    "available_capacity": 2750,
    "water_capacity_lpd": 225000,
    "latrines_count": 150,
    "sphere_shelter_area_m2": 10500,
    "road_access": "NH-134 Dharasu-Gangotri Protected Corridor",
    "allocated_for": "Dharali, Arakot & Tons/Bhagirathi gorge habitations (2,100 pax)",
    "coordinates": [
      30.73,
      78.445
    ]
  }
];

export const CLOUDBURST_DATA_DICTIONARY = [
  {
    "file": "cloudburst_dataset.csv",
    "type": "Daily Meteorological Observations (NASA POWER)",
    "rows": "528 records across 20 Himalayan Hotspots",
    "columns": "Date, PRECTOT, T2M, RH2M, WS2M, Location, District, Latitude, Longitude, Cloudburst, Season",
    "geometry": "Point GPS Coordinates",
    "crs": "EPSG:4326 (WGS84)",
    "time_period": "1988 - 2024 (36-Year Climatology)",
    "spatial_coverage": "13 Districts of Uttarakhand, India",
    "data_status": "OFFICIAL / REFERENCE",
    "description": "36-year calibrated NASA POWER surface precipitation, 2m temperature, relative humidity, and wind vectors."
  },
  {
    "file": "powerbi_dataset.csv",
    "type": "Engineered ML Feature Matrix with Day-Ahead Targets",
    "rows": "488 records with 32 engineered features",
    "columns": "T2M_lag1, RH2M_lag1, WS2M_lag1, PRECTOT_3d_mean, Heat_Index, Cloudburst_Next, Predicted_Probability",
    "geometry": "Point GPS Coordinates",
    "crs": "EPSG:4326 (WGS84)",
    "time_period": "Monsoon Seasons 1988 - 2024",
    "spatial_coverage": "20 Himalayan Cloudburst Hotspots",
    "data_status": "PROCESSED / MODEL",
    "description": "Calculated lag and moving average features avoiding target leakage for next-day cloudburst risk forecasting."
  },
  {
    "file": "metadata.json & model.pkl",
    "type": "Pre-Trained Machine Learning Model Artifacts",
    "rows": "15 Feature Coefficients & Tuned Thresholds",
    "columns": "feature_cols, tuned_threshold (0.50), roc_auc (0.64 cross-validated)",
    "geometry": "Global Model Space",
    "crs": "N/A Tabular",
    "time_period": "Model Training Baseline",
    "spatial_coverage": "Uttarakhand State",
    "data_status": "VERIFIED MODEL",
    "description": "Trained Random Forest Classifier achieving 85.8% probability detection on the 2013 Kedarnath disaster."
  },
  {
    "file": "live_predictions.csv",
    "type": "Operational Real-Time Ingest Stream (Open-Meteo)",
    "rows": "30 live observation readings",
    "columns": "Timestamp, Location, District, PRECTOT, T2M, RH2M, WS2M, Probability, Risk_Level",
    "geometry": "Point GPS Coordinates",
    "crs": "EPSG:4326",
    "time_period": "Real-time telemetry stream",
    "spatial_coverage": "6 High-Risk Monitoring Sites",
    "data_status": "TELEMETRY STREAM",
    "description": "Live atmospheric observations refreshed via free Open-Meteo meteorological endpoints without API keys."
  }
];
