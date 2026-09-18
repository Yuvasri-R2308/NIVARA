import { 
  SiteResourceLedger, 
  PlanningAssumptions, 
  CapacityCalculationResult, 
  ResourceRequirementItem, 
  DistributedRelocationPlan, 
  SingleSiteAllocation,
  ResourceStatusEnum
} from '../types';

/**
 * Determine resource status (Sufficient, Limited, Shortage, Critical) based on coverage percentage
 */
const getResourceStatus = (coveragePct: number): ResourceStatusEnum => {
  if (coveragePct >= 100) return 'Sufficient';
  if (coveragePct >= 75) return 'Limited';
  if (coveragePct >= 40) return 'Shortage';
  return 'Critical';
};

/**
 * Core Carrying Capacity & Resource Calculator
 * Evaluates physical, water, sanitation, healthcare, vehicular and logistics constraints.
 */
export const calculateSiteCapacity = (
  site: SiteResourceLedger,
  assumptions: PlanningAssumptions,
  targetPopulation: number
): CapacityCalculationResult => {
  // 1. Hazard Exclusion Sieve Check
  const isHighSlope = site.slopeDeg >= 20.0;
  const isHighLandslide = site.landslideExposurePct >= 40.0;
  const isHighFlood = site.floodExposurePct >= 50.0;
  const isRejectedDueToHazard = site.isInsideHazardRedZone || isHighSlope || isHighLandslide || isHighFlood;

  let rejectionReason: string | undefined;
  if (isRejectedDueToHazard) {
    if (site.isInsideHazardRedZone) {
      rejectionReason = 'REJECTED — Located directly inside active disaster hazard red-zone.';
    } else if (isHighSlope) {
      rejectionReason = `REJECTED — Slope gradient (${site.slopeDeg}°) exceeds safe resettlement ceiling of 20°.`;
    } else if (isHighLandslide) {
      rejectionReason = `REJECTED — Landslide susceptibility (${site.landslideExposurePct}%) exceeds safe limit.`;
    } else {
      rejectionReason = `REJECTED — Flood inundation exposure (${site.floodExposurePct}%) exceeds safe margin.`;
    }
  }

  // 2. Resource-Supported Population Limits
  const netShelterArea = Math.max(0, site.shelterAreaSqm - (site.existingOccupancyPersons * assumptions.shelterSpaceSqmPerPerson));
  const physicalSpaceCapacity = isRejectedDueToHazard 
    ? 0 
    : Math.min(site.maxGrossCapacityPersons, Math.floor(netShelterArea / assumptions.shelterSpaceSqmPerPerson));

  const waterSupportedPopulation = isRejectedDueToHazard 
    ? 0 
    : Math.floor(site.waterDailyAvailableLiters / assumptions.waterLitersPerPersonPerDay);

  const sanitationSupportedPopulation = isRejectedDueToHazard 
    ? 0 
    : Math.floor(site.toiletsAvailable * assumptions.peoplePerToilet);

  const totalMedicalStaff = site.medicalDoctorsOnCall + site.nursesOnCall;
  const healthcareSupportedPopulation = isRejectedDueToHazard 
    ? 0 
    : Math.floor(totalMedicalStaff * assumptions.peoplePerMedicalStaff);

  const foodSupportedPopulation = isRejectedDueToHazard 
    ? 0 
    : Math.floor(site.foodStockMealsAvailable / (assumptions.mealsPerPersonPerDay * 7)); // 7-day reserve

  const emergencyVehiclesSupportedPopulation = isRejectedDueToHazard 
    ? 0 
    : Math.floor(site.ambulancesStationed * assumptions.peoplePerAmbulance);

  // 3. Limiting Resource Practical Capacity: minimum of all critical pillars
  const candidateLimits = [
    { name: 'Physical Shelter Space', cap: physicalSpaceCapacity },
    { name: 'Water Supply', cap: waterSupportedPopulation },
    { name: 'Sanitation (Toilets)', cap: sanitationSupportedPopulation },
    { name: 'Healthcare & Medical Staff', cap: healthcareSupportedPopulation },
    { name: 'Food & Relief Stock', cap: foodSupportedPopulation },
    { name: 'Ambulance Evacuation Fleet', cap: emergencyVehiclesSupportedPopulation }
  ];

  let practicalCapacity = 0;
  let limitingResource = 'None';
  let limitingResourceExplanation = 'Site is fully capable of meeting population requirements.';

  if (isRejectedDueToHazard) {
    practicalCapacity = 0;
    limitingResource = 'Hazard Exposure (UNSAFE)';
    limitingResourceExplanation = rejectionReason || 'Site is inside active hazard zone.';
  } else {
    // Sort ascending to find minimum constraint
    candidateLimits.sort((a, b) => a.cap - b.cap);
    const bottleneck = candidateLimits[0];
    practicalCapacity = bottleneck.cap;
    limitingResource = bottleneck.name;

    if (bottleneck.name === 'Sanitation (Toilets)') {
      limitingResourceExplanation = `Sanitation is currently the limiting resource (${bottleneck.cap.toLocaleString()} people max vs ${physicalSpaceCapacity.toLocaleString()} shelter capacity). Adding ${Math.ceil((physicalSpaceCapacity - bottleneck.cap) / assumptions.peoplePerToilet)} mobile bio-toilets will unlock remaining space.`;
    } else if (bottleneck.name === 'Water Supply') {
      limitingResourceExplanation = `Water supply is currently the limiting resource (${bottleneck.cap.toLocaleString()} people max at ${assumptions.waterLitersPerPersonPerDay} L/person/day). Stationing mobile water tankers can expand coverage.`;
    } else if (bottleneck.name === 'Physical Shelter Space') {
      limitingResourceExplanation = `Physical covered shelter space (${netShelterArea.toLocaleString()} m²) limits capacity to ${physicalSpaceCapacity.toLocaleString()} persons at ${assumptions.shelterSpaceSqmPerPerson} m²/person.`;
    } else if (bottleneck.name === 'Healthcare & Medical Staff') {
      limitingResourceExplanation = `Medical staff on-call (${totalMedicalStaff} personnel) limits safe triage oversight to ${bottleneck.cap.toLocaleString()} persons.`;
    } else if (bottleneck.name === 'Ambulance Evacuation Fleet') {
      limitingResourceExplanation = `Stationed ambulances (${site.ambulancesStationed} units) limit rapid medical transit capacity to ${bottleneck.cap.toLocaleString()} persons.`;
    } else {
      limitingResourceExplanation = `Food ration warehouse stock limits initial 7-day surge holding to ${bottleneck.cap.toLocaleString()} persons.`;
    }
  }

  // 4. Capacity Utilization & Status for Target Displaced Population
  const effectivePop = Math.max(1, targetPopulation);
  const capacityUtilizationPct = practicalCapacity > 0 ? Math.round((effectivePop / practicalCapacity) * 100) : 0;
  const remainingCapacity = practicalCapacity - effectivePop;

  let capacityStatus: CapacityCalculationResult['capacityStatus'] = 'SAFE CAPACITY AVAILABLE';
  if (isRejectedDueToHazard) {
    capacityStatus = 'REJECTED — HAZARD';
  } else if (effectivePop > practicalCapacity) {
    capacityStatus = 'OVERCAPACITY DEFICIT';
  } else if (capacityUtilizationPct >= 95) {
    capacityStatus = 'AT MAXIMUM CAPACITY';
  }

  // 5. Individual Resource Requirement vs Availability Ledgers
  const safeTarget = effectivePop;

  // Water
  const waterReq = safeTarget * assumptions.waterLitersPerPersonPerDay;
  const waterGap = site.waterDailyAvailableLiters - waterReq;
  const waterCov = waterReq > 0 ? Math.round((site.waterDailyAvailableLiters / waterReq) * 100) : 100;
  const waterResource: ResourceRequirementItem = {
    resourceName: 'Potable Water Supply',
    requiredValue: waterReq,
    availableValue: site.waterDailyAvailableLiters,
    unit: 'Liters/day',
    gap: waterGap,
    coveragePct: waterCov,
    status: getResourceStatus(waterCov),
    provenance: site.waterProvenance,
    notes: site.waterSourceDescription
  };

  // Sanitation
  const toiletsReq = Math.ceil(safeTarget / assumptions.peoplePerToilet);
  const toiletsGap = site.toiletsAvailable - toiletsReq;
  const toiletsCov = toiletsReq > 0 ? Math.round((site.toiletsAvailable / toiletsReq) * 100) : 100;
  const sanitationResource: ResourceRequirementItem = {
    resourceName: 'Sanitation & Bio-Toilets',
    requiredValue: toiletsReq,
    availableValue: site.toiletsAvailable,
    unit: 'Toilets',
    gap: toiletsGap,
    coveragePct: toiletsCov,
    status: getResourceStatus(toiletsCov),
    provenance: site.sanitationProvenance,
    notes: `${site.wasteManagementType} • ${site.drainageSystem}`
  };

  // Ambulances
  const ambReq = Math.ceil(safeTarget / assumptions.peoplePerAmbulance);
  const ambGap = site.ambulancesStationed - ambReq;
  const ambCov = ambReq > 0 ? Math.round((site.ambulancesStationed / ambReq) * 100) : 100;
  const ambulancesResource: ResourceRequirementItem = {
    resourceName: 'Dedicated Ambulances (ALS/BLS)',
    requiredValue: ambReq,
    availableValue: site.ambulancesStationed,
    unit: 'Ambulances',
    gap: ambGap,
    coveragePct: ambCov,
    status: getResourceStatus(ambCov),
    provenance: site.vehiclesProvenance,
    notes: `${site.nearestHospitalName} (${site.nearestHospitalDistanceKm} km away)`
  };

  // Emergency Disaster Vehicles
  const totalVehicles = site.rescueVehiclesStationed + site.fireRescueVehiclesStationed + site.waterTankersStationed;
  const vehReq = Math.ceil(safeTarget / assumptions.peoplePerEmergencyVehicle);
  const vehGap = totalVehicles - vehReq;
  const vehCov = vehReq > 0 ? Math.round((totalVehicles / vehReq) * 100) : 100;
  const emergencyVehiclesResource: ResourceRequirementItem = {
    resourceName: 'Rescue & Utility Vehicles',
    requiredValue: vehReq,
    availableValue: totalVehicles,
    unit: 'Vehicles',
    gap: vehGap,
    coveragePct: vehCov,
    status: getResourceStatus(vehCov),
    provenance: site.vehiclesProvenance,
    notes: `${site.rescueVehiclesStationed} Rescue 4x4s, ${site.fireRescueVehiclesStationed} Fire/Tender, ${site.waterTankersStationed} Water Tankers`
  };

  // Healthcare
  const medStaffReq = Math.ceil(safeTarget / assumptions.peoplePerMedicalStaff);
  const medStaffGap = totalMedicalStaff - medStaffReq;
  const medStaffCov = medStaffReq > 0 ? Math.round((totalMedicalStaff / medStaffReq) * 100) : 100;
  const healthcareResource: ResourceRequirementItem = {
    resourceName: 'Medical Doctors & Nurses',
    requiredValue: medStaffReq,
    availableValue: totalMedicalStaff,
    unit: 'Staff on-call',
    gap: medStaffGap,
    coveragePct: medStaffCov,
    status: getResourceStatus(medStaffCov),
    provenance: site.healthcareProvenance,
    notes: `${site.medicalDoctorsOnCall} Doctors, ${site.nursesOnCall} Nurses, ${site.emergencyTriageBeds} Triage Beds`
  };

  // Shelter Floor Space
  const shelterReq = safeTarget * assumptions.shelterSpaceSqmPerPerson;
  const shelterGap = netShelterArea - shelterReq;
  const shelterCov = shelterReq > 0 ? Math.round((netShelterArea / shelterReq) * 100) : 100;
  const shelterSpaceResource: ResourceRequirementItem = {
    resourceName: 'Covered Shelter Living Area',
    requiredValue: shelterReq,
    availableValue: netShelterArea,
    unit: 'm²',
    gap: shelterGap,
    coveragePct: shelterCov,
    status: getResourceStatus(shelterCov),
    provenance: site.spaceProvenance,
    notes: `${site.shelterType} (${site.usableLandAreaHa} Ha total land)`
  };

  // Food Stock
  const foodReq = safeTarget * assumptions.mealsPerPersonPerDay * 7;
  const foodGap = site.foodStockMealsAvailable - foodReq;
  const foodCov = foodReq > 0 ? Math.round((site.foodStockMealsAvailable / foodReq) * 100) : 100;
  const foodStockResource: ResourceRequirementItem = {
    resourceName: '7-Day Relief Meal Rations',
    requiredValue: foodReq,
    availableValue: site.foodStockMealsAvailable,
    unit: 'Meals',
    gap: foodGap,
    coveragePct: foodCov,
    status: getResourceStatus(foodCov),
    provenance: site.foodProvenance,
    notes: `${site.foodWarehouseAreaSqm} m² dry warehouse storage`
  };

  // 6. Multi-Factor Weighted Safe-Site Suitability Scoring (0-100)
  // A. Safety (Slope < 10°, Landslide < 10%, Flood < 10%)
  const slopeSafetyPoints = Math.max(0, 100 - (site.slopeDeg * 5));
  const landslideSafetyPoints = Math.max(0, 100 - (site.landslideExposurePct * 2));
  const floodSafetyPoints = Math.max(0, 100 - (site.floodExposurePct * 2));
  const rawSafety = isRejectedDueToHazard ? 0 : Math.round((slopeSafetyPoints * 0.4) + (landslideSafetyPoints * 0.3) + (floodSafetyPoints * 0.3));

  // B. Capacity (Practical vs Target)
  const rawCapacity = isRejectedDueToHazard ? 0 : Math.min(100, Math.round((practicalCapacity / Math.max(1, safeTarget)) * 85) + 15);

  // C. Accessibility (Road status, routes, distance)
  const roadPoints = site.roadStatus === 'Good' ? 100 : site.roadStatus === 'Moderate' ? 70 : 30;
  const accessPoints = site.emergencyVehicleAccessibility === 'High' ? 100 : site.emergencyVehicleAccessibility === 'Medium' ? 70 : 35;
  const distancePoints = Math.max(20, 100 - (site.distanceFromMeppadiKm * 2.5));
  const rawAccessibility = isRejectedDueToHazard ? 0 : Math.round((roadPoints * 0.4) + (accessPoints * 0.3) + (distancePoints * 0.3));

  // D. Essential Services (Water + Sanitation + Electricity)
  const waterServicePoints = Math.min(100, waterCov);
  const sanitationServicePoints = Math.min(100, toiletsCov);
  const electricityPoints = site.electricityStatus === 'Available' ? 100 : site.electricityStatus === 'Limited' ? 60 : 0;
  const rawEssentialServices = isRejectedDueToHazard ? 0 : Math.round((waterServicePoints * 0.4) + (sanitationServicePoints * 0.4) + (electricityPoints * 0.2));

  // E. Emergency Readiness (Ambulances + Vehicles + Medical)
  const ambPoints = Math.min(100, ambCov);
  const vehPoints = Math.min(100, vehCov);
  const medPoints = Math.min(100, medStaffCov);
  const rawEmergencyReadiness = isRejectedDueToHazard ? 0 : Math.round((ambPoints * 0.35) + (vehPoints * 0.35) + (medPoints * 0.30));

  // Weighted sum
  const safetyContribution = rawSafety * assumptions.weightSafety;
  const capacityContribution = rawCapacity * assumptions.weightCapacity;
  const accessibilityContribution = rawAccessibility * assumptions.weightAccessibility;
  const essentialServicesContribution = rawEssentialServices * assumptions.weightEssentialServices;
  const emergencyReadinessContribution = rawEmergencyReadiness * assumptions.weightEmergencyReadiness;

  const totalSuitability = isRejectedDueToHazard 
    ? 0 
    : Math.round((safetyContribution + capacityContribution + accessibilityContribution + essentialServicesContribution + emergencyReadinessContribution) * 10) / 10;

  return {
    siteId: site.siteId,
    siteName: site.name,
    targetPopulation: safeTarget,
    physicalSpaceCapacity,
    waterSupportedPopulation,
    sanitationSupportedPopulation,
    healthcareSupportedPopulation,
    foodSupportedPopulation,
    emergencyVehiclesSupportedPopulation,
    practicalCapacity,
    limitingResource,
    limitingResourceExplanation,
    capacityUtilizationPct,
    remainingCapacity,
    capacityStatus,
    resources: {
      water: waterResource,
      sanitation: sanitationResource,
      ambulances: ambulancesResource,
      emergencyVehicles: emergencyVehiclesResource,
      healthcare: healthcareResource,
      shelterSpace: shelterSpaceResource,
      foodStock: foodStockResource,
      electricity: {
        status: site.electricityStatus,
        details: `${site.powerGridSource} (${site.backupGeneratorCapacityKva} kVA backup)`,
        provenance: site.utilitiesProvenance
      },
      roadAccess: {
        status: site.roadStatus,
        details: `${site.accessRoadType} • ${site.independentAccessRoutesCount} independent routes`,
        provenance: site.accessibilityProvenance
      },
      hazardExposure: {
        status: isRejectedDueToHazard ? 'High' : site.hazardExposureLevel === 'LOW' ? 'Low' : 'Medium',
        details: `Landslide ${site.landslideExposurePct}%, Flood ${site.floodExposurePct}%, Slope ${site.slopeDeg}°`,
        isSafe: !isRejectedDueToHazard,
        provenance: site.hazardSafetyProvenance
      }
    },
    suitabilityScore: totalSuitability,
    scoreBreakdown: {
      safetyScore: { points: rawSafety, max: 100, weight: assumptions.weightSafety, contribution: Math.round(safetyContribution * 10) / 10 },
      capacityScore: { points: rawCapacity, max: 100, weight: assumptions.weightCapacity, contribution: Math.round(capacityContribution * 10) / 10 },
      accessibilityScore: { points: rawAccessibility, max: 100, weight: assumptions.weightAccessibility, contribution: Math.round(accessibilityContribution * 10) / 10 },
      essentialServicesScore: { points: rawEssentialServices, max: 100, weight: assumptions.weightEssentialServices, contribution: Math.round(essentialServicesContribution * 10) / 10 },
      emergencyReadinessScore: { points: rawEmergencyReadiness, max: 100, weight: assumptions.weightEmergencyReadiness, contribution: Math.round(emergencyReadinessContribution * 10) / 10 }
    },
    isRejectedDueToHazard,
    rejectionReason
  };
};

/**
 * Smart Multi-Site Distributed Relocation Solver
 * If displaced population > single site capacity, distributes population across multiple ranked safe sites
 * and aggregates total required emergency logistics.
 */
export const calculateDistributedRelocationPlan = (
  sites: SiteResourceLedger[],
  assumptions: PlanningAssumptions,
  totalDisplacedPop: number,
  sourceVillage: string = 'Meppadi'
): DistributedRelocationPlan => {
  const safeSites = sites.filter(s => !s.isInsideHazardRedZone && s.hazardExposureLevel !== 'HIGH' && s.slopeDeg < 20);

  // Evaluate single site suitability baseline
  const evaluated = safeSites.map(s => {
    const calc = calculateSiteCapacity(s, assumptions, Math.min(s.maxGrossCapacityPersons, totalDisplacedPop));
    return { site: s, calc };
  });

  // Sort by suitability score descending
  evaluated.sort((a, b) => b.calc.suitabilityScore - a.calc.suitabilityScore);

  let remainingToAllocate = totalDisplacedPop;
  const allocations: SingleSiteAllocation[] = [];

  for (const { site, calc } of evaluated) {
    if (remainingToAllocate <= 0) break;
    if (calc.practicalCapacity <= 0) continue;

    const allocPop = Math.min(remainingToAllocate, calc.practicalCapacity);
    const allocFam = Math.round(allocPop / 4); // Avg 4 persons per family
    const utilization = Math.round((allocPop / calc.practicalCapacity) * 100);

    allocations.push({
      siteId: site.siteId,
      siteName: site.name,
      allocatedPopulation: allocPop,
      allocatedFamilies: allocFam,
      practicalCapacity: calc.practicalCapacity,
      utilizationPct: utilization,
      limitingResource: calc.limitingResource,
      distanceKm: site.distanceFromMeppadiKm,
      travelTimeMins: site.travelTimeFromMeppadiMins,
      suitabilityScore: calc.suitabilityScore,
      ambulancesRequired: Math.ceil(allocPop / assumptions.peoplePerAmbulance),
      waterRequiredLitersDay: allocPop * assumptions.waterLitersPerPersonPerDay,
      toiletsRequired: Math.ceil(allocPop / assumptions.peoplePerToilet),
      rescueVehiclesRequired: Math.ceil(allocPop / assumptions.peoplePerEmergencyVehicle),
      medicalStaffRequired: Math.ceil(allocPop / assumptions.peoplePerMedicalStaff)
    });

    remainingToAllocate -= allocPop;
  }

  const totalAccommodated = totalDisplacedPop - Math.max(0, remainingToAllocate);
  const unmetPop = Math.max(0, remainingToAllocate);

  return {
    sourceVillage,
    totalDisplacedPopulation: totalDisplacedPop,
    totalDisplacedFamilies: Math.round(totalDisplacedPop / 4),
    allocations,
    totalAccommodatedPopulation: totalAccommodated,
    unmetPopulation: unmetPop,
    isFullyAccommodated: unmetPop === 0,
    totalAmbulancesRequired: allocations.reduce((acc, a) => acc + a.ambulancesRequired, 0),
    totalWaterRequiredLitersDay: allocations.reduce((acc, a) => acc + a.waterRequiredLitersDay, 0),
    totalToiletsRequired: allocations.reduce((acc, a) => acc + a.toiletsRequired, 0),
    totalRescueVehiclesRequired: allocations.reduce((acc, a) => acc + a.rescueVehiclesRequired, 0),
    totalMedicalStaffRequired: allocations.reduce((acc, a) => acc + a.medicalStaffRequired, 0),
    totalMealsPerDayRequired: totalAccommodated * assumptions.mealsPerPersonPerDay
  };
};
