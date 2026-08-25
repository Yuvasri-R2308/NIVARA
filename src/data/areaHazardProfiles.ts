export interface AreaHazardProfile {
  name: string;
  category: 'Disaster Epicenter' | 'Slope Hazard Zone' | 'River Valley Zone' | 'Flatland Buffer' | 'Urban Centre' | 'Safe Resettlement Site';
  riskScore: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  landslideProb: number;     // % (0-100)
  floodProb: number;         // % (0-100)
  slopeDeg: number;          // Degrees
  rainfall24h: number;       // mm
  soilMoisture: number;      // % (0-100)
  historyFreq: number;       // % (0-100)
  censusPopulation: number;  // Total Official Census 2011 Population
  exposedPopulation: number; // Persons exposed in danger zones or capacity
  familiesCount: number;
  highRiskParcels: number;
  totalParcels: number;
  primaryHazard: string;
  summary: string;
  actionRequired: string;
  assignedSafeSite: string;
  coordinates: [number, number];
  polygonBounds?: [number, number][];
}

export const AREA_HAZARD_REGISTRY: Record<string, AreaHazardProfile> = {
  // 1. MEPPADI (Epicenter of 2024 Landslide)
  'Meppadi': {
    name: 'Meppadi (Mundakkai / Chooralmala)',
    category: 'Disaster Epicenter',
    riskScore: 84.5,
    riskLevel: 'HIGH',
    landslideProb: 94,
    floodProb: 86,
    slopeDeg: 38.5,
    rainfall24h: 284.5,
    soilMoisture: 98,
    historyFreq: 95,
    censusPopulation: 24170,
    exposedPopulation: 4800,
    familiesCount: 250,
    highRiskParcels: 250,
    totalParcels: 250,
    primaryHazard: 'Catastrophic Debris Flow & Slope Liquefaction',
    summary: 'Extreme convergence of 38.5° mountain scarps, 284.5mm cloudburst precipitation, and regolith liquefaction along Chembra peak drainage.',
    actionRequired: 'Mandatory immediate physical evacuation of 250 families to Kalpetta-Vythiri Institutional Reserve.',
    assignedSafeSite: 'Kalpetta-Vythiri Institutional Reserve (CCAS 93.4)',
    coordinates: [11.554, 76.128],
    polygonBounds: [
      [11.535, 76.105],
      [11.568, 76.105],
      [11.568, 76.145],
      [11.535, 76.145]
    ]
  },

  // 2. ACHOORANAM (Tea Plantation Hillsides)
  'Achooranam': {
    name: 'Achooranam (Plantation Foothills)',
    category: 'Slope Hazard Zone',
    riskScore: 44.3,
    riskLevel: 'MEDIUM',
    landslideProb: 56,
    floodProb: 34,
    slopeDeg: 18.2,
    rainfall24h: 178.0,
    soilMoisture: 71,
    historyFreq: 48,
    censusPopulation: 12450,
    exposedPopulation: 1240,
    familiesCount: 77,
    highRiskParcels: 77,
    totalParcels: 250,
    primaryHazard: 'Steep Tea Estate Slope Creep & Gully Erosion',
    summary: 'Moderate landslide susceptibility due to terrace cutting and 18.2° slope gradient; well-drained but requires drainage fortification.',
    actionRequired: 'Phased relocation of 77 high-risk slope edge homes; construct retaining bench walls along estate roads.',
    assignedSafeSite: 'Achoor East Ridgeline Foothill (CCAS 83.6)',
    coordinates: [11.591, 76.012],
    polygonBounds: [
      [11.575, 75.995],
      [11.605, 75.995],
      [11.605, 76.035],
      [11.575, 76.035]
    ]
  },

  // 3. KOTTATHARA (River Basin & Lowland)
  'Kottathara': {
    name: 'Kottathara (Kabini River Basin)',
    category: 'River Valley Zone',
    riskScore: 44.1,
    riskLevel: 'MEDIUM',
    landslideProb: 22,
    floodProb: 78,
    slopeDeg: 6.5,
    rainfall24h: 154.0,
    soilMoisture: 82,
    historyFreq: 68,
    censusPopulation: 18920,
    exposedPopulation: 890,
    familiesCount: 69,
    highRiskParcels: 69,
    totalParcels: 250,
    primaryHazard: 'Seasonal River Inundation & Silt Deposition',
    summary: 'High flood hazard across low-lying riverbank parcels with waterlogging during peak monsoon discharges; minimal landslide risk on gentle 6.5° plains.',
    actionRequired: 'Relocate 69 flood-plain homes to elevated southern terrace buffer; install automated river level telemetry.',
    assignedSafeSite: 'Kottathara Valley South Safe Buffer (CCAS 87.5)',
    coordinates: [11.685, 76.039],
    polygonBounds: [
      [11.670, 76.020],
      [11.700, 76.020],
      [11.700, 76.060],
      [11.670, 76.060]
    ]
  },

  // 4. KUPPADITHARA (Agricultural Plateau)
  'Kuppadithara': {
    name: 'Kuppadithara (Stable Agricultural Plateau)',
    category: 'Flatland Buffer',
    riskScore: 40.7,
    riskLevel: 'LOW',
    landslideProb: 18,
    floodProb: 38,
    slopeDeg: 5.8,
    rainfall24h: 138.4,
    soilMoisture: 54,
    historyFreq: 25,
    censusPopulation: 14200,
    exposedPopulation: 320,
    familiesCount: 28,
    highRiskParcels: 28,
    totalParcels: 250,
    primaryHazard: 'Local Drainage Bottlenecks (Low Regional Hazard)',
    summary: 'Predominantly stable lateritic plateau with low overall hazard index (40.7/100); 28 isolated stream boundary parcels require minor setback buffers.',
    actionRequired: 'Designated as primary safe receiving destination for Meppadi & Achooranam displaced families.',
    assignedSafeSite: 'Kuppadithara North Plateau (CCAS 90.2)',
    coordinates: [11.658, 76.009],
    polygonBounds: [
      [11.645, 75.990],
      [11.675, 75.990],
      [11.675, 76.030],
      [11.645, 76.030]
    ]
  },

  // 5. KALPETTA (District Capital / Urban Ridge)
  'Kalpetta': {
    name: 'Kalpetta (District HQ Ridge)',
    category: 'Urban Centre',
    riskScore: 18.5,
    riskLevel: 'LOW',
    landslideProb: 12,
    floodProb: 14,
    slopeDeg: 7.2,
    rainfall24h: 128.0,
    soilMoisture: 42,
    historyFreq: 15,
    censusPopulation: 31525,
    exposedPopulation: 180,
    familiesCount: 12,
    highRiskParcels: 8,
    totalParcels: 180,
    primaryHazard: 'Urban Stormwater Overflow',
    summary: 'High-elevation administrative ridge with solid bedrock foundations, four-lane highway connectivity, and full municipal utility capacity.',
    actionRequired: 'Host the primary SDMA central emergency operations and institutional transit shelters.',
    assignedSafeSite: 'Kalpetta-Vythiri Institutional Reserve (CCAS 93.4)',
    coordinates: [11.608, 76.082]
  },

  // 6. VYTHIRI (Western Ghats High Rain Corridor)
  'Vythiri': {
    name: 'Vythiri (Ghat Pass Corridor)',
    category: 'Slope Hazard Zone',
    riskScore: 58.2,
    riskLevel: 'MEDIUM',
    landslideProb: 62,
    floodProb: 26,
    slopeDeg: 22.4,
    rainfall24h: 220.0,
    soilMoisture: 79,
    historyFreq: 58,
    censusPopulation: 16840,
    exposedPopulation: 1450,
    familiesCount: 92,
    highRiskParcels: 84,
    totalParcels: 200,
    primaryHazard: 'Ghat Highway Slope Slip & Water Infiltration',
    summary: 'Extremely high precipitation zone (220mm/24h) along the Thamarassery ghat ridge; vulnerable to road-cutting soil slips.',
    actionRequired: 'Active road sensors and early traffic diversion during monsoon red alert days.',
    assignedSafeSite: 'Kalpetta-Vythiri Institutional Reserve (CCAS 93.4)',
    coordinates: [11.551, 76.041]
  },

  // 7. PADINHARETHARA (Banasura Sagar Lake Buffer)
  'Padinharethara': {
    name: 'Padinharethara (Banasura Reservoir Zone)',
    category: 'River Valley Zone',
    riskScore: 38.6,
    riskLevel: 'MEDIUM',
    landslideProb: 28,
    floodProb: 52,
    slopeDeg: 9.4,
    rainfall24h: 165.0,
    soilMoisture: 64,
    historyFreq: 38,
    censusPopulation: 15680,
    exposedPopulation: 640,
    familiesCount: 45,
    highRiskParcels: 36,
    totalParcels: 190,
    primaryHazard: 'Reservoir Backwater & Dam Spill Surge',
    summary: 'Adjacent to Banasura Sagar dam; low landslide risk on northern slopes, but lakeside habitations require flood safety margins.',
    actionRequired: 'Maintain 50m buffer from reservoir high-flood level; designate western ridge as secondary safe transit zone.',
    assignedSafeSite: 'Padinharethara West Elevation Ridge (CCAS 79.8)',
    coordinates: [11.668, 75.952]
  },

  // 8. MANANTHAVADY (Northern Valley / Agricultural Town)
  'Mananthavady': {
    name: 'Mananthavady (Northern Plains)',
    category: 'River Valley Zone',
    riskScore: 32.4,
    riskLevel: 'LOW',
    landslideProb: 14,
    floodProb: 64,
    slopeDeg: 4.8,
    rainfall24h: 142.0,
    soilMoisture: 66,
    historyFreq: 42,
    censusPopulation: 45080,
    exposedPopulation: 760,
    familiesCount: 52,
    highRiskParcels: 40,
    totalParcels: 240,
    primaryHazard: 'Mananthavady River Lowland Flash Flooding',
    summary: 'Gentle agricultural basin with 4.8° slope; low landslide vulnerability but susceptible to riverbank overflows during continuous rainfall.',
    actionRequired: 'River dredging, embankment reinforcement, and community flood alert sirens.',
    assignedSafeSite: 'Kuppadithara North Plateau (CCAS 90.2)',
    coordinates: [11.802, 76.003]
  },

  // 9. SULTHAN BATHERY (Eastern Plateau / Low Rain Zone)
  'Sulthan Bathery': {
    name: 'Sulthan Bathery (Eastern High Plain)',
    category: 'Flatland Buffer',
    riskScore: 14.8,
    riskLevel: 'LOW',
    landslideProb: 6,
    floodProb: 16,
    slopeDeg: 3.2,
    rainfall24h: 96.0,
    soilMoisture: 32,
    historyFreq: 8,
    censusPopulation: 45417,
    exposedPopulation: 95,
    familiesCount: 6,
    highRiskParcels: 4,
    totalParcels: 210,
    primaryHazard: 'Minor Urban Stormwater Runoff (Safest District Region)',
    summary: 'Located on the rain-shadow eastern plateau with only 96mm rainfall; lowest multi-hazard risk index in Wayanad district (14.8/100).',
    actionRequired: 'Long-term regional resettlement reserve and logistics supply base.',
    assignedSafeSite: 'Kalpetta-Vythiri Institutional Reserve (CCAS 93.4)',
    coordinates: [11.662, 76.257]
  }
};

// Candidate Relocation Site Hazard & Suitability Registry
export const SAFE_SITES_REGISTRY: Record<string, any> = {
  'KL-WYD-S01': {
    siteId: 'KL-WYD-S01',
    name: 'Kalpetta-Vythiri Institutional Reserve (Safe Zone D)',
    village: 'Kalpetta',
    ccasScore: 93.4,
    usableAreaHa: 12.5,
    capacityFamilies: 550,
    capacityPersons: 2200,
    slopeDeg: 3.8,
    rainfall24h: 128.0,
    landslideProb: 2,
    floodProb: 3,
    soilMoisture: 34,
    historyFreq: 5,
    accessRoad: 'Direct NH766 4-lane connection (0m buffer)',
    waterSupply: 'Existing municipal 100kL overhead tank',
    powerGrid: '33kV substation feeder line on site',
    description: 'Flat institutional hilltop bench outside all GSI landslide corridors with immediate NH-766 highway access.',
    coordinates: [11.602, 76.082]
  },
  'KL-WYD-S02': {
    siteId: 'KL-WYD-S02',
    name: 'Kuppadithara North Plateau (Safe Zone A)',
    village: 'Kuppadithara',
    ccasScore: 90.2,
    usableAreaHa: 9.8,
    capacityFamilies: 420,
    capacityPersons: 1680,
    slopeDeg: 4.6,
    rainfall24h: 134.0,
    landslideProb: 3,
    floodProb: 4,
    soilMoisture: 38,
    historyFreq: 8,
    accessRoad: 'State Highway 54 (150m feeder)',
    waterSupply: 'Borewell yield 12,000 LPH + piped supply',
    powerGrid: '11kV dedicated transformer grid',
    description: 'Gentle lateritic plateau with municipal piped water trunk line and 0% historical flood recurrence.',
    coordinates: [11.665, 76.012]
  },
  'KL-WYD-S03': {
    siteId: 'KL-WYD-S03',
    name: 'Kottathara Valley South Safe Buffer (Safe Zone B)',
    village: 'Kottathara',
    ccasScore: 87.5,
    usableAreaHa: 7.4,
    capacityFamilies: 320,
    capacityPersons: 1280,
    slopeDeg: 5.2,
    rainfall24h: 146.0,
    landslideProb: 5,
    floodProb: 6,
    soilMoisture: 44,
    historyFreq: 12,
    accessRoad: 'Panchayat double-lane blacktop road',
    waterSupply: 'Local spring source + filter plant',
    powerGrid: '11kV rural feeder network',
    description: 'Elevated agricultural terrace set 28m above the 100-year Kabini flood level with power grid.',
    coordinates: [11.678, 76.042]
  },
  'KL-WYD-S04': {
    siteId: 'KL-WYD-S04',
    name: 'Achoor East Ridgeline Foothill (Safe Zone C)',
    village: 'Achooranam',
    ccasScore: 83.6,
    usableAreaHa: 6.2,
    capacityFamilies: 250,
    capacityPersons: 1000,
    slopeDeg: 6.8,
    rainfall24h: 162.0,
    landslideProb: 7,
    floodProb: 5,
    soilMoisture: 49,
    historyFreq: 15,
    accessRoad: 'Estate main road (requires 300m widening)',
    waterSupply: 'Gravity-fed highland reservoir',
    powerGrid: 'Local estate transformer tie-in',
    description: 'Well-drained foothill bench with high basalt soil shear strength; requires 400m feeder link.',
    coordinates: [11.598, 76.025]
  },
  'KL-WYD-S05': {
    siteId: 'KL-WYD-S05',
    name: 'Padinharethara West Elevation Ridge (Safe Zone E)',
    village: 'Padinharethara',
    ccasScore: 79.8,
    usableAreaHa: 4.5,
    capacityFamilies: 180,
    capacityPersons: 720,
    slopeDeg: 7.9,
    rainfall24h: 168.0,
    landslideProb: 9,
    floodProb: 8,
    soilMoisture: 52,
    historyFreq: 18,
    accessRoad: 'PWD rural blacktop (steeper 8% gradient)',
    waterSupply: 'Banasura reservoir auxiliary line',
    powerGrid: 'Single phase grid (upgrade needed)',
    description: 'High ridge bench bordering Banasura reservoir; stable bedrock but steeper access gradient.',
    coordinates: [11.662, 75.945]
  }
};

export const getHazardProfileForLocation = (query: string): AreaHazardProfile => {
  if (!query) return AREA_HAZARD_REGISTRY['Meppadi'];

  // Check direct key
  for (const [key, profile] of Object.entries(AREA_HAZARD_REGISTRY)) {
    if (query.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(query.toLowerCase())) {
      return profile;
    }
  }

  // Check candidate sites
  for (const [siteKey, site] of Object.entries(SAFE_SITES_REGISTRY)) {
    if (query.toLowerCase().includes(siteKey.toLowerCase()) || query.toLowerCase().includes(site.name.toLowerCase())) {
      return {
        name: site.name,
        category: 'Safe Resettlement Site',
        riskScore: Math.round((100 - site.ccasScore) * 10) / 10,
        riskLevel: 'LOW',
        landslideProb: site.landslideProb,
        floodProb: site.floodProb,
        slopeDeg: site.slopeDeg,
        rainfall24h: site.rainfall24h,
        soilMoisture: site.soilMoisture,
        historyFreq: site.historyFreq,
        censusPopulation: site.capacityPersons,
        exposedPopulation: site.capacityPersons,
        familiesCount: site.capacityFamilies,
        highRiskParcels: 0,
        totalParcels: 0,
        primaryHazard: 'Safe Carrying Capacity Receptor Zone',
        summary: site.description,
        actionRequired: `Approved for immediate relocation of ${site.capacityFamilies} families (${site.capacityPersons} people).`,
        assignedSafeSite: site.name,
        coordinates: site.coordinates
      };
    }
  }

  // Fallback to general Wayanad baseline
  return AREA_HAZARD_REGISTRY['Achooranam'];
};
