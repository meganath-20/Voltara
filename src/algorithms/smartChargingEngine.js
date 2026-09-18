/**
 * Smart EV Charging & Localized Grid Management Engine
 * Implements deadline-aware urgency scheduling, solar surplus maximization,
 * and guaranteed transformer/grid overload protection.
 */

export const MIN_CHARGER_POWER_KW = 1.38; // Standard J1772/Type 2 minimum (6A @ 230V)
export const AC_VOLTAGE = 230;

/**
 * Calculates urgency score and scheduling parameters for a single EV.
 */
export function calculateEVUrgency(ev) {
  const energyNeededKWh = Math.max(0, ((ev.targetSoC - ev.currentSoC) / 100) * ev.batteryCapacity);
  const timeRemainingHours = Math.max(0.08, ev.departureMinutesLeft / 60); // min 5 minutes to avoid div/0
  const requiredSpeedKW = energyNeededKWh / timeRemainingHours;
  const feasibilityRatio = requiredSpeedKW / (ev.maxPower || 11);

  // Mode weight bonuses
  let modeBonus = 0;
  if (ev.priorityMode === 'EXPRESS') modeBonus = 0.5;
  if (ev.priorityMode === 'ECO_SOLAR') modeBonus = -0.25;

  // Normalized urgency score (higher = needs power more urgently)
  // Weighted by:
  // 1. Low battery penalty (1 - SoC)
  // 2. Feasibility ratio (can we make deadline?)
  // 3. Priority tier override
  const socDeficit = 1 - (ev.currentSoC / 100);
  const urgencyScore = (socDeficit * 0.45) + (Math.min(2.5, feasibilityRatio) * 0.45) + modeBonus;

  let urgencyLevel = 'LOW';
  if (urgencyScore > 1.2 || feasibilityRatio > 0.9) urgencyLevel = 'CRITICAL';
  else if (urgencyScore > 0.75 || feasibilityRatio > 0.6) urgencyLevel = 'HIGH';
  else if (urgencyScore > 0.4) urgencyLevel = 'MODERATE';

  return {
    energyNeededKWh,
    timeRemainingHours,
    requiredSpeedKW,
    feasibilityRatio,
    urgencyScore: Math.max(0.01, urgencyScore),
    urgencyLevel
  };
}

/**
 * Core Dynamic Power Distribution Algorithm
 * Allocates power to all connected vehicles strictly constrained by:
 * Total Demand = Base Building Load + Sum(EV_Allocated) - Solar Generation <= Transformer Capacity
 */
export function solveOptimalPowerDistribution(vehicles, gridConfig) {
  const {
    transformerCapacityKW = 120,
    baseBuildingLoadKW = 45,
    solarGenerationKW = 35
  } = gridConfig;

  // Maximum EV charging headroom without overloading transformer
  const availableEVHeadroom = Math.max(0, transformerCapacityKW - baseBuildingLoadKW + solarGenerationKW);
  const cleanSurplusKW = Math.max(0, solarGenerationKW - baseBuildingLoadKW);

  // Evaluate each vehicle's urgency and status
  const analyzedEVs = vehicles.map(ev => {
    const analysis = calculateEVUrgency(ev);
    const isCompleted = ev.currentSoC >= ev.targetSoC || analysis.energyNeededKWh <= 0.05;
    const isPaused = ev.status === 'PAUSED';
    const isEligible = !isCompleted && !isPaused;

    return {
      ...ev,
      ...analysis,
      isCompleted,
      isPaused,
      isEligible,
      allocatedPowerKW: 0
    };
  });

  const eligibleEVs = analyzedEVs.filter(ev => ev.isEligible);
  const nonEligibleEVs = analyzedEVs.filter(ev => !ev.isEligible);

  // If no available headroom or no eligible EVs
  if (availableEVHeadroom <= 0.01 || eligibleEVs.length === 0) {
    const results = analyzedEVs.map(ev => ({
      ...ev,
      currentAllocatedPower: 0,
      allocatedAmps: 0,
      status: ev.isCompleted ? 'COMPLETED' : (ev.isPaused ? 'PAUSED' : 'THROTTLED'),
      isOverloadShedded: !ev.isCompleted && !ev.isPaused && availableEVHeadroom <= 0.01
    }));

    return calculateGridTotals(results, gridConfig, availableEVHeadroom, cleanSurplusKW);
  }

  // Sort eligible EVs by Urgency Score descending
  eligibleEVs.sort((a, b) => b.urgencyScore - a.urgencyScore);

  let remainingHeadroom = availableEVHeadroom;

  // PASS 1: Guarantee Minimum Operational Power (1.38 kW) to as many eligible EVs as possible,
  // prioritizing high-urgency vehicles first.
  for (const ev of eligibleEVs) {
    const minNeeded = Math.min(MIN_CHARGER_POWER_KW, ev.maxPower);
    if (remainingHeadroom >= minNeeded) {
      ev.allocatedPowerKW = minNeeded;
      remainingHeadroom -= minNeeded;
    } else {
      ev.allocatedPowerKW = 0; // cannot even satisfy min power threshold
    }
  }

  // PASS 2: Multi-factor Proportional Headroom Distribution
  // Allocate remaining headroom weighted by urgency scores until maxPower is reached.
  let activeInIteration = eligibleEVs.filter(ev => ev.allocatedPowerKW > 0 && ev.allocatedPowerKW < ev.maxPower);

  while (remainingHeadroom > 0.1 && activeInIteration.length > 0) {
    const totalUrgencyWeight = activeInIteration.reduce((sum, ev) => sum + ev.urgencyScore, 0);
    let distributedInPass = 0;

    for (const ev of activeInIteration) {
      if (remainingHeadroom <= 0.01) break;

      const share = (ev.urgencyScore / totalUrgencyWeight) * remainingHeadroom;
      const maxPossibleAdd = ev.maxPower - ev.allocatedPowerKW;
      const powerToAdd = Math.min(share, maxPossibleAdd);

      if (powerToAdd > 0) {
        ev.allocatedPowerKW += powerToAdd;
        distributedInPass += powerToAdd;
      }
    }

    remainingHeadroom -= distributedInPass;

    // Filter out vehicles that have reached their max power cap
    const nextActive = activeInIteration.filter(ev => ev.allocatedPowerKW < (ev.maxPower - 0.05));
    if (distributedInPass < 0.05 || nextActive.length === activeInIteration.length && distributedInPass < 0.1) {
      break; // prevent infinite loop if small increments remain
    }
    activeInIteration = nextActive;
  }

  // PASS 3: Clean Energy Priority Boost
  // If clean surplus exists, make sure vehicles in ECO_SOLAR or idle ports get filled up to solar limit
  if (cleanSurplusKW > 0 && remainingHeadroom > 0.5) {
    for (const ev of eligibleEVs) {
      if (remainingHeadroom <= 0.01) break;
      const headroomForThisEV = Math.min(remainingHeadroom, ev.maxPower - ev.allocatedPowerKW);
      if (headroomForThisEV > 0.1) {
        ev.allocatedPowerKW += headroomForThisEV;
        remainingHeadroom -= headroomForThisEV;
      }
    }
  }

  // PASS 4: Hard Safety Constraint Clamp
  // Re-verify that Sum(Allocated) <= availableEVHeadroom with 0 tolerance
  let totalAllocated = eligibleEVs.reduce((sum, ev) => sum + ev.allocatedPowerKW, 0);
  if (totalAllocated > availableEVHeadroom) {
    const excess = totalAllocated - availableEVHeadroom;
    // Trim from lowest urgency first
    const reverseEligible = [...eligibleEVs].sort((a, b) => a.urgencyScore - b.urgencyScore);
    let trimmed = 0;
    for (const ev of reverseEligible) {
      if (trimmed >= excess) break;
      const needToTrim = excess - trimmed;
      const canTrim = ev.allocatedPowerKW;
      const actualTrim = Math.min(needToTrim, canTrim);
      ev.allocatedPowerKW -= actualTrim;
      trimmed += actualTrim;
    }
  }

  // Re-assign status and calculate amps
  const finalEVs = [...eligibleEVs, ...nonEligibleEVs].map(ev => {
    const finalKW = Math.max(0, Number(ev.allocatedPowerKW.toFixed(2)));
    const amps = Number(((finalKW * 1000) / AC_VOLTAGE).toFixed(1));

    let status = ev.status;
    if (ev.isCompleted) {
      status = 'COMPLETED';
    } else if (ev.isPaused) {
      status = 'PAUSED';
    } else if (finalKW === 0) {
      status = 'THROTTLED';
    } else if (finalKW < ev.maxPower * 0.75 && ev.priorityMode !== 'ECO_SOLAR') {
      status = 'MODULATED'; // reduced due to grid/building constraints
    } else {
      status = 'CHARGING';
    }

    return {
      ...ev,
      currentAllocatedPower: finalKW,
      allocatedAmps: amps,
      status,
      isOverloadShedded: !ev.isCompleted && !ev.isPaused && finalKW === 0
    };
  });

  // Re-sort to original bay order (1 to N)
  finalEVs.sort((a, b) => a.bay - b.bay);

  return calculateGridTotals(finalEVs, gridConfig, availableEVHeadroom, cleanSurplusKW);
}

/**
 * Calculates total cluster consumption, grid load, transformer stress, and clean energy share.
 */
function calculateGridTotals(vehicles, gridConfig, availableEVHeadroom, cleanSurplusKW) {
  const {
    transformerCapacityKW = 120,
    baseBuildingLoadKW = 45,
    solarGenerationKW = 35
  } = gridConfig;

  const totalEVChargingKW = vehicles.reduce((sum, ev) => sum + (ev.currentAllocatedPower || 0), 0);
  const totalFacilityDemandKW = baseBuildingLoadKW + totalEVChargingKW;
  const netUtilityGridImportKW = Math.max(0, totalFacilityDemandKW - solarGenerationKW);
  const netGridExportKW = Math.max(0, solarGenerationKW - totalFacilityDemandKW);

  // Transformer Load %
  const transformerLoadPercent = Math.min(125, (netUtilityGridImportKW / transformerCapacityKW) * 100);
  const transformerHeadroomKW = Math.max(0, transformerCapacityKW - netUtilityGridImportKW);

  // Renewable share in EV charging
  // Clean power available for EVs = max(0, Solar - Building)
  const solarSurplusForEVs = Math.max(0, solarGenerationKW - baseBuildingLoadKW);
  const evPoweredBySolarKW = Math.min(totalEVChargingKW, solarSurplusForEVs);
  const renewableEVSharePercent = totalEVChargingKW > 0 
    ? Math.min(100, Math.round((evPoweredBySolarKW / totalEVChargingKW) * 100))
    : (solarGenerationKW > 0 ? 100 : 0);

  // Total Clean Energy Utilization % (Self-Consumption)
  const cleanEnergySelfConsumptionPercent = solarGenerationKW > 0
    ? Math.min(100, Math.round((Math.min(solarGenerationKW, totalFacilityDemandKW) / solarGenerationKW) * 100))
    : 100;

  const isOverloadImminent = transformerLoadPercent >= 92;
  const isOverloadPrevented = totalFacilityDemandKW > (transformerCapacityKW + solarGenerationKW * 0.5);

  return {
    vehicles,
    gridMetrics: {
      transformerCapacityKW,
      baseBuildingLoadKW,
      solarGenerationKW,
      totalEVChargingKW: Number(totalEVChargingKW.toFixed(2)),
      totalFacilityDemandKW: Number(totalFacilityDemandKW.toFixed(2)),
      netUtilityGridImportKW: Number(netUtilityGridImportKW.toFixed(2)),
      netGridExportKW: Number(netGridExportKW.toFixed(2)),
      transformerLoadPercent: Number(transformerLoadPercent.toFixed(1)),
      transformerHeadroomKW: Number(transformerHeadroomKW.toFixed(2)),
      availableEVHeadroom: Number(availableEVHeadroom.toFixed(2)),
      renewableEVSharePercent,
      cleanEnergySelfConsumptionPercent,
      isOverloadImminent,
      isOverloadPrevented
    }
  };
}
