/**
 * Smart EV Charging & Localized Grid Management Engine
 * Implements deadline-aware urgency scheduling, WattWise efficiency optimization,
 * rooftop solar surplus maximization, and guaranteed transformer overload protection.
 */

export const MIN_CHARGER_POWER_KW = 1.38; // Standard J1772/Type 2 minimum (6A @ 230V)
export const AC_VOLTAGE = 230;

/**
 * WattWise Dynamic Efficiency Profile:
 * 3 kW = 95%
 * 5 kW = 94%
 * 7 kW = 90%
 * 11 kW = 85%
 */
export function getWattWiseEfficiency(kw) {
  if (kw <= 0) return 100;
  if (kw <= 3) return 95;
  if (kw <= 5) return 95 - ((kw - 3) / 2) * 1; // 3 kW -> 95%, 5 kW -> 94%
  if (kw <= 7) return 94 - ((kw - 5) / 2) * 4; // 5 kW -> 94%, 7 kW -> 90%
  if (kw <= 11) return 90 - ((kw - 7) / 4) * 5; // 7 kW -> 90%, 11 kW -> 85%
  return Math.max(75, 85 - ((kw - 11) / 5) * 5); // >11 kW extrapolates down smoothly
}

/**
 * Calculates requested charging power based on vehicle charging profile mode, deadline requirement, and physical charger max.
 */
export function getRequestedPowerForMode(ev) {
  const maxCap = ev.maxPower || 11;
  const mode = ev.priorityMode || 'NORMAL';
  const isPaused = ev.status === 'PAUSED' || mode === 'PAUSED';
  const isCompleted = ev.status === 'COMPLETED' || ev.currentSoC >= ev.targetSoC;

  if (isPaused || isCompleted) return 0;

  // Minimum gross power required to reach target SoC by departure deadline
  const energyNeededKWh = Math.max(0, (((ev.targetSoC || 80) - (ev.currentSoC || 20)) / 100) * (ev.batteryCapacity || 75));
  const timeRemainingHours = Math.max(0.08, (ev.departureMinutesLeft || 60) / 60);
  const minUsefulSpeedKW = energyNeededKWh / timeRemainingHours;
  // Account for ~94% average WattWise inverter efficiency
  const minGrossRequiredKW = minUsefulSpeedKW / 0.94;

  switch (mode) {
    case 'FAST':
    case 'EXPRESS':
      // FAST mode requests maximum available charger rating or required speed
      return Math.min(maxCap, Math.max(minGrossRequiredKW, maxCap));
    case 'ECO':
    case 'ECO_SOLAR':
      // Eco profile targets low-loss high-efficiency operating point (3.5 - 5 kW)
      return Math.min(maxCap, Math.max(MIN_CHARGER_POWER_KW, Math.min(5.0, minGrossRequiredKW)));
    case 'NORMAL':
    case 'AUTO':
    default: {
      // Normal profile targets optimal rate balancing deadline feasibility and standard cap
      const baseModeCap = Math.round(maxCap * 0.7 * 10) / 10;
      // If deadline requires more, request up to maxCap; if departure is extended, required speed drops
      const targetRate = Math.min(maxCap, Math.max(MIN_CHARGER_POWER_KW, Math.min(baseModeCap, minGrossRequiredKW)));
      return Number(targetRate.toFixed(1));
    }
  }
}

/**
 * Calculates urgency score and scheduling parameters for a single EV,
 * factoring in energy requirements, departure deadline, and WattWise efficiency.
 */
export function calculateEVUrgency(ev) {
  const energyNeededKWh = Math.max(0, ((ev.targetSoC - ev.currentSoC) / 100) * ev.batteryCapacity);
  const timeRemainingHours = Math.max(0.08, ev.departureMinutesLeft / 60); // min 5 mins to avoid div/0
  const requestedPowerKW = getRequestedPowerForMode(ev);
  
  // Useful battery energy required vs gross charging speed
  const minUsefulSpeedKW = energyNeededKWh / timeRemainingHours;
  const feasibilityRatio = minUsefulSpeedKW / Math.max(1, ev.maxPower || 11);

  // Mode weight bonuses
  let modeBonus = 0;
  const mode = ev.priorityMode || 'NORMAL';
  if (mode === 'FAST' || mode === 'EXPRESS') modeBonus = 0.5;
  if (mode === 'ECO' || mode === 'ECO_SOLAR') modeBonus = -0.25;

  const socDeficit = 1 - (ev.currentSoC / 100);
  const urgencyScore = (socDeficit * 0.45) + (Math.min(2.5, feasibilityRatio) * 0.45) + modeBonus;

  let urgencyLevel = 'LOW';
  if (urgencyScore > 1.2 || feasibilityRatio > 0.9) urgencyLevel = 'CRITICAL';
  else if (urgencyScore > 0.75 || feasibilityRatio > 0.6) urgencyLevel = 'HIGH';
  else if (urgencyScore > 0.4) urgencyLevel = 'MODERATE';

  return {
    energyNeededKWh,
    timeRemainingHours,
    minUsefulSpeedKW,
    feasibilityRatio,
    requestedPowerKW,
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
    const isPaused = ev.status === 'PAUSED' || ev.priorityMode === 'PAUSED';
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

  // Calculate actual total requested EV power across eligible vehicles
  const actualRequestedEVPower = Number(eligibleEVs.reduce((sum, ev) => sum + ev.requestedPowerKW, 0).toFixed(2));
  const shortageKW = Number(Math.max(0, actualRequestedEVPower - availableEVHeadroom).toFixed(2));

  // If no available headroom or no eligible EVs
  if (availableEVHeadroom <= 0.01 || eligibleEVs.length === 0) {
    const results = analyzedEVs.map(ev => ({
      ...ev,
      currentAllocatedPower: 0,
      allocatedAmps: 0,
      efficiencyPercent: 100,
      usefulBatteryEnergyKW: 0,
      wastedEnergyKW: 0,
      status: ev.isCompleted ? 'COMPLETED' : (ev.isPaused ? 'PAUSED' : 'THROTTLED'),
      isOverloadShedded: !ev.isCompleted && !ev.isPaused && availableEVHeadroom <= 0.01
    }));

    return calculateGridTotals(results, gridConfig, availableEVHeadroom, cleanSurplusKW, actualRequestedEVPower, shortageKW);
  }

  // Sort eligible EVs by Urgency Score descending
  eligibleEVs.sort((a, b) => b.urgencyScore - a.urgencyScore);

  let remainingHeadroom = availableEVHeadroom;

  // PASS 1: Guarantee Minimum Operational Power (1.38 kW) to as many eligible EVs as possible,
  // prioritizing high-urgency vehicles first.
  for (const ev of eligibleEVs) {
    const minNeeded = Math.min(MIN_CHARGER_POWER_KW, ev.requestedPowerKW);
    if (remainingHeadroom >= minNeeded) {
      ev.allocatedPowerKW = minNeeded;
      remainingHeadroom -= minNeeded;
    } else {
      ev.allocatedPowerKW = 0;
    }
  }

  // PASS 2: Multi-factor Proportional Headroom Distribution capped by ev.requestedPowerKW
  let activeInIteration = eligibleEVs.filter(ev => ev.allocatedPowerKW > 0 && ev.allocatedPowerKW < ev.requestedPowerKW);

  while (remainingHeadroom > 0.1 && activeInIteration.length > 0) {
    const totalUrgencyWeight = activeInIteration.reduce((sum, ev) => sum + ev.urgencyScore, 0);
    let distributedInPass = 0;

    for (const ev of activeInIteration) {
      if (remainingHeadroom <= 0.01) break;

      const share = (ev.urgencyScore / totalUrgencyWeight) * remainingHeadroom;
      const maxPossibleAdd = ev.requestedPowerKW - ev.allocatedPowerKW;
      const powerToAdd = Math.min(share, maxPossibleAdd);

      if (powerToAdd > 0) {
        ev.allocatedPowerKW += powerToAdd;
        distributedInPass += powerToAdd;
      }
    }

    remainingHeadroom -= distributedInPass;

    const nextActive = activeInIteration.filter(ev => ev.allocatedPowerKW < (ev.requestedPowerKW - 0.05));
    if (distributedInPass < 0.05 || (nextActive.length === activeInIteration.length && distributedInPass < 0.1)) {
      break;
    }
    activeInIteration = nextActive;
  }

  // PASS 3: WattWise Efficiency Optimization
  // If remaining headroom exists, distribute to vehicles operating at near high-efficiency thresholds (3 - 7 kW) up to requestedPowerKW or maxPower
  if (remainingHeadroom > 0.2) {
    for (const ev of eligibleEVs) {
      if (remainingHeadroom <= 0.01) break;
      const cap = Math.min(ev.maxPower, Math.max(ev.requestedPowerKW, 7.0));
      const powerToAdd = Math.min(remainingHeadroom, cap - ev.allocatedPowerKW);
      if (powerToAdd > 0.1) {
        ev.allocatedPowerKW += powerToAdd;
        remainingHeadroom -= powerToAdd;
      }
    }
  }

  // PASS 4: Hard Safety Constraint Clamp
  let totalAllocated = eligibleEVs.reduce((sum, ev) => sum + ev.allocatedPowerKW, 0);
  if (totalAllocated > availableEVHeadroom) {
    const excess = totalAllocated - availableEVHeadroom;
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

  // Re-assign status and calculate amps & WattWise efficiency
  const finalEVs = [...eligibleEVs, ...nonEligibleEVs].map(ev => {
    const finalKW = Math.max(0, Number(ev.allocatedPowerKW.toFixed(2)));
    const amps = Number(((finalKW * 1000) / AC_VOLTAGE).toFixed(1));

    let efficiencyPercent = 100;
    if (finalKW > 0) {
      efficiencyPercent = getWattWiseEfficiency(finalKW);
    }
    efficiencyPercent = Math.min(100, Math.max(75, Math.round(efficiencyPercent)));
    
    const usefulBatteryEnergyKW = finalKW * (efficiencyPercent / 100);
    const wastedEnergyKW = finalKW - usefulBatteryEnergyKW;

    let status = ev.status;
    if (ev.isCompleted) {
      status = 'COMPLETED';
    } else if (ev.isPaused) {
      status = 'PAUSED';
    } else if (finalKW === 0) {
      status = 'THROTTLED';
    } else if (finalKW < (ev.requestedPowerKW * 0.85)) {
      status = 'MODULATED';
    } else {
      status = 'CHARGING';
    }

    return {
      ...ev,
      currentAllocatedPower: finalKW,
      allocatedAmps: amps,
      efficiencyPercent,
      usefulBatteryEnergyKW: Number(usefulBatteryEnergyKW.toFixed(2)),
      wastedEnergyKW: Number(wastedEnergyKW.toFixed(2)),
      status,
      isOverloadShedded: !ev.isCompleted && !ev.isPaused && finalKW === 0
    };
  });

  finalEVs.sort((a, b) => a.bay - b.bay);

  return calculateGridTotals(finalEVs, gridConfig, availableEVHeadroom, cleanSurplusKW, actualRequestedEVPower, shortageKW);
}

/**
 * Calculates total cluster consumption, grid load, transformer stress, clean energy share, and shortage metrics.
 */
function calculateGridTotals(vehicles, gridConfig, availableEVHeadroom, cleanSurplusKW, actualRequestedEVPower, shortageKW) {
  const {
    transformerCapacityKW = 120,
    baseBuildingLoadKW = 45,
    solarGenerationKW = 35
  } = gridConfig;

  const totalEVChargingKW = vehicles.reduce((sum, ev) => sum + (ev.currentAllocatedPower || 0), 0);
  const totalWastedEnergyKW = vehicles.reduce((sum, ev) => sum + (ev.wastedEnergyKW || 0), 0);
  const totalUsefulEnergyKW = vehicles.reduce((sum, ev) => sum + (ev.usefulBatteryEnergyKW || 0), 0);
  
  const totalFacilityDemandKW = baseBuildingLoadKW + totalEVChargingKW;
  const netUtilityGridImportKW = Math.max(0, totalFacilityDemandKW - solarGenerationKW);
  const netGridExportKW = Math.max(0, solarGenerationKW - totalFacilityDemandKW);

  const transformerLoadPercent = Math.min(125, (netUtilityGridImportKW / transformerCapacityKW) * 100);
  const transformerHeadroomKW = Math.max(0, transformerCapacityKW - netUtilityGridImportKW);

  const solarSurplusForEVs = Math.max(0, solarGenerationKW - baseBuildingLoadKW);
  const evPoweredBySolarKW = Math.min(totalEVChargingKW, solarSurplusForEVs);
  const renewableEVSharePercent = totalEVChargingKW > 0 
    ? Math.min(100, Math.round((evPoweredBySolarKW / totalEVChargingKW) * 100))
    : (solarGenerationKW > 0 ? 100 : 0);

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
      totalUsefulEnergyKW: Number(totalUsefulEnergyKW.toFixed(2)),
      totalWastedEnergyKW: Number(totalWastedEnergyKW.toFixed(2)),
      transformerLoadPercent: Number(transformerLoadPercent.toFixed(1)),
      transformerHeadroomKW: Number(transformerHeadroomKW.toFixed(2)),
      availableEVHeadroom: Number(availableEVHeadroom.toFixed(2)),
      actualRequestedEVPower,
      shortageKW,
      renewableEVSharePercent,
      cleanEnergySelfConsumptionPercent,
      isOverloadImminent,
      isOverloadPrevented
    }
  };
}

