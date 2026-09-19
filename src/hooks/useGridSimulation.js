import { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_VEHICLES, DEFAULT_GRID_CONFIG } from '../data/initialData.js';
import { solveOptimalPowerDistribution } from '../algorithms/smartChargingEngine.js';

export const getFairnessHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('voltara_fairness_v2') || '{}');
  } catch(e) { return {}; }
};

export const getDriverFairness = (ownerId) => {
  const history = getFairnessHistory();
  return history[ownerId] || {
    compromiseCount: 0,
    totalWaitingMinutes: 0,
    totalSeverity: 0,
    lastCompromise: null
  };
};

export const recordFairnessCompromise = (ownerId, delayMinutes) => {
  const history = getFairnessHistory();
  const current = getDriverFairness(ownerId);
  const newCount = current.compromiseCount + 1;
  const newWait = current.totalWaitingMinutes + delayMinutes;
  
  let severity = 'Low';
  if (newCount >= 3 || newWait >= 60) severity = 'High';
  else if (newCount >= 1 || newWait >= 20) severity = 'Medium';
  
  history[ownerId] = {
    compromiseCount: newCount,
    totalWaitingMinutes: newWait,
    totalSeverity: severity,
    lastCompromise: new Date().toISOString()
  };
  localStorage.setItem('voltara_fairness_v2', JSON.stringify(history));
};

export const resetFairnessHistory = () => {
  localStorage.removeItem('voltara_fairness_v2');
  // force a small delay or reload normally, handled by caller
};

const WEATHER_MULTIPLIERS = {
  SUNNY: 1.0,
  PARTLY_CLOUDY: 0.62,
  OVERCAST: 0.22,
  NIGHT: 0.0
};

export function useGridSimulation() {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [gridConfig, setGridConfig] = useState(DEFAULT_GRID_CONFIG);
  const [manualBuildingKW, setManualBuildingKW] = useState(null);
  const [manualSolarKW, setManualSolarKW] = useState(null);
  const [manualGridLimitKW, setManualGridLimitKW] = useState(null);
  
  // Charge Pact State & Lifecycle tracking
  const [activePactProposal, setActivePactProposal] = useState(null);
  const pactCooldownRef = useRef(0);
  const rejectedDriverIdsRef = useRef(new Set());
  const consumedProposalIdsRef = useRef(new Set());
  const rejectedProposalIdsRef = useRef(new Set());

  // Historical telemetry stream for live canvas charting (last 40 points)
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [eventLogs, setEventLogs] = useState([
    {
      id: 1,
      timestamp: '13:30:00',
      type: 'INFO',
      message: 'Voltara microgrid load balancer initialized. 6 bays active.'
    },
    {
      id: 2,
      timestamp: '13:30:02',
      type: 'BOOST',
      message: 'Solar surplus detected (38.5 kW). Clean energy routing enabled.'
    }
  ]);

  const [stats, setStats] = useState({
    co2AvoidedKg: 48.6,
    overloadIncidentsPrevented: 12,
    cleanEnergyChargedKWh: 86.4,
    totalEnergyDeliveredKWh: 114.2
  });

  const lastAlertRef = useRef('');

  // Helper to add event log
  const logEvent = useCallback((type, message) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setEventLogs(prev => [
      { id: Date.now() + Math.random(), timestamp: timeStr, type, message },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  }, []);

  // Compute live solar output based on time of day (diurnal bell curve 6 AM - 7 PM)
  const calculateNaturalSolarKW = useCallback((timeOfDayHours, weather, peakCapacity) => {
    // Sun rises ~6:00 (6.0), peaks ~13:00 (13.0), sets ~19:30 (19.5)
    if (timeOfDayHours < 6.0 || timeOfDayHours > 19.5) return 0;
    const dayProgress = (timeOfDayHours - 6.0) / 13.5; // 0 to 1
    const solarFactor = Math.sin(dayProgress * Math.PI); // Smooth half-sine curve
    const weatherFactor = WEATHER_MULTIPLIERS[weather] ?? 1.0;
    const baseKW = solarFactor * peakCapacity * weatherFactor;
    // Add micro jitter (realistic sensor noise)
    const jitter = (Math.random() - 0.5) * 0.8;
    return Math.max(0, Number((baseKW + jitter).toFixed(1)));
  }, []);

  // Effective current grid settings
  const currentTransformerLimit = manualGridLimitKW ?? gridConfig.transformerCapacityKW;
  const currentSolarKW = manualSolarKW ?? calculateNaturalSolarKW(
    gridConfig.timeOfDayHours,
    gridConfig.weather,
    gridConfig.solarPeakCapacityKW
  );
  const currentBuildingKW = manualBuildingKW ?? (
    gridConfig.buildingSurgeActive 
      ? 82.5 
      : gridConfig.baseBuildingLoadKW + (Math.sin(gridConfig.timeOfDayHours * 1.5) * 4) + ((Math.random() - 0.5) * 1.2)
  );

  // Inject fairness scores into vehicles before solving
  const vehiclesWithFairness = vehicles.map(v => {
    const fairness = getDriverFairness(v.owner);
    return {
      ...v,
      fairnessHistory: fairness,
      fairnessScore: fairness.compromiseCount
    };
  });

  // Run the smart optimization algorithm
  const solvedState = solveOptimalPowerDistribution(vehiclesWithFairness, {
    transformerCapacityKW: currentTransformerLimit,
    baseBuildingLoadKW: Math.max(10, currentBuildingKW),
    solarGenerationKW: Math.max(0, currentSolarKW)
  });

  // Watch for critical grid events to log
  useEffect(() => {
    const metrics = solvedState.gridMetrics;
    if (metrics.isOverloadImminent && lastAlertRef.current !== 'overload') {
      logEvent('WARN', `Transformer load reached ${metrics.transformerLoadPercent}%! Headroom: ${metrics.transformerHeadroomKW} kW.`);
      lastAlertRef.current = 'overload';
    } else if (metrics.transformerLoadPercent < 85 && lastAlertRef.current === 'overload') {
      logEvent('INFO', `Grid load returned to normal (${metrics.transformerLoadPercent}%).`);
      lastAlertRef.current = 'normal';
    }
  }, [solvedState.gridMetrics, logEvent]);

  // Helper function to find the smallest feasible delay for a candidate vehicle
  const findSmallestFeasibleDelay = useCallback((candidateEV, currentHeadroom, allVehicles) => {
    const candidateDelays = [5, 10, 15, 20, 25, 30, 45, 60];
    const energyNeededKWh = Math.max(0, ((candidateEV.targetSoC - candidateEV.currentSoC) / 100) * candidateEV.batteryCapacity);
    
    for (const delayMins of candidateDelays) {
      const testDepartureMins = candidateEV.departureMinutesLeft + delayMins;
      const testTimeHours = Math.max(0.08, testDepartureMins / 60);
      const minUsefulKWNeeded = energyNeededKWh / testTimeHours;
      
      // Verify target SoC is reachable within candidate's charger rating
      if (minUsefulKWNeeded <= candidateEV.maxPower) {
        // Test rerun solver on test array
        const testVehicles = allVehicles.map(ev => 
          ev.id === candidateEV.id ? { ...ev, departureMinutesLeft: testDepartureMins } : ev
        );
        const testSolved = solveOptimalPowerDistribution(testVehicles, {
          transformerCapacityKW: currentTransformerLimit,
          baseBuildingLoadKW: Math.max(10, currentBuildingKW),
          solarGenerationKW: Math.max(0, currentSolarKW)
        });
        
        // If shortage is eliminated or significantly reduced, select this delay
        if (testSolved.gridMetrics.shortageKW <= 0.5 || testSolved.gridMetrics.shortageKW < solvedState.gridMetrics.shortageKW) {
          return delayMins;
        }
      }
    }
    return 20; // fallback standard increment
  }, [currentTransformerLimit, currentBuildingKW, currentSolarKW]);

  // Simulation tick loop (runs every 1000ms)
  useEffect(() => {
    if (gridConfig.isPaused) return;

    const interval = setInterval(() => {
      const speed = gridConfig.simulationSpeed; // 1x, 5x, 10x
      const deltaSeconds = 1 * speed;

      // 1. Advance diurnal clock and cooldowns
      if (pactCooldownRef.current > 0) {
        pactCooldownRef.current -= deltaSeconds;
      }

      setGridConfig(prev => {
        let newHour = prev.timeOfDayHours + (deltaSeconds / 3600) * 12; // speed up time of day slightly for vivid demo
        if (newHour >= 24) newHour = 6.0; // wrap to morning
        return {
          ...prev,
          timeOfDayHours: Number(newHour.toFixed(3))
        };
      });

      // 2. Advance charging batteries and departure times
      setVehicles(prevVehicles => {
        let anyCompleted = false;

        const updated = prevVehicles.map(ev => {
          if (ev.status === 'COMPLETED' || ev.status === 'PAUSED' || ev.priorityMode === 'PAUSED') {
            return {
              ...ev,
              departureMinutesLeft: Math.max(0, ev.departureMinutesLeft - (deltaSeconds / 60))
            };
          }

          const powerKW = ev.currentAllocatedPower || 0;
          const usefulKW = ev.usefulBatteryEnergyKW || (powerKW * 0.94);
          const energyAddedKWh = (usefulKW * (deltaSeconds / 3600));
          const newBatteryKWh = Math.min(ev.batteryCapacity, (ev.currentBatteryKWh || 0) + energyAddedKWh);
          const newSoC = Math.min(100, (newBatteryKWh / ev.batteryCapacity) * 100);
          const newDeparture = Math.max(0, ev.departureMinutesLeft - (deltaSeconds / 60));
          const newEnergyDelivered = (ev.energyDeliveredKWh || 0) + energyAddedKWh;

          const isNowCompleted = newSoC >= ev.targetSoC;
          if (isNowCompleted && ev.status !== 'COMPLETED') {
            anyCompleted = true;
          }

          return {
            ...ev,
            currentBatteryKWh: Number(newBatteryKWh.toFixed(2)),
            currentSoC: Number(newSoC.toFixed(1)),
            departureMinutesLeft: Math.round(newDeparture),
            energyDeliveredKWh: Number(newEnergyDelivered.toFixed(2)),
            status: isNowCompleted ? 'COMPLETED' : ev.status
          };
        });

        if (anyCompleted) {
          logEvent('COMPLETE', 'An electric vehicle reached its target SoC! Capacity automatically reallocated.');
        }

        return updated;
      });

      // 3. Update cumulative statistics
      const metrics = solvedState.gridMetrics;
      const energyDelta = (metrics.totalEVChargingKW * (deltaSeconds / 3600));
      const cleanDelta = energyDelta * (metrics.renewableEVSharePercent / 100);
      const co2AvoidedDelta = cleanDelta * 0.42;

      setStats(prev => ({
        totalEnergyDeliveredKWh: Number((prev.totalEnergyDeliveredKWh + energyDelta).toFixed(2)),
        cleanEnergyChargedKWh: Number((prev.cleanEnergyChargedKWh + cleanDelta).toFixed(2)),
        co2AvoidedKg: Number((prev.co2AvoidedKg + co2AvoidedDelta).toFixed(2)),
        overloadIncidentsPrevented: metrics.isOverloadPrevented 
          ? prev.overloadIncidentsPrevented + 1 
          : prev.overloadIncidentsPrevented
      }));

      // 4. Append to telemetry stream
      const timeLabel = new Date().toTimeString().split(' ')[0];
      setTelemetryHistory(prev => {
        const newPoint = {
          time: timeLabel,
          transformerLimit: metrics.transformerCapacityKW,
          buildingLoad: metrics.baseBuildingLoadKW,
          solarGeneration: metrics.solarGenerationKW,
          evTotalLoad: metrics.totalEVChargingKW,
          netGridImport: metrics.netUtilityGridImportKW,
          availableEVHeadroom: metrics.availableEVHeadroom
        };
        const next = [...prev, newPoint];
        return next.length > 40 ? next.slice(next.length - 40) : next;
      });

      // 5. Dynamic Shortage Detection for Charge Pact
      const shortage = metrics.shortageKW;

      if (shortage <= 0.5 && activePactProposal) {
        setActivePactProposal(null);
      } else if (shortage > 0.5 && !activePactProposal && pactCooldownRef.current <= 0) {
        const eligibleEVs = vehiclesWithFairness.filter(
          ev => ev.status !== 'COMPLETED' && ev.status !== 'PAUSED' && ev.priorityMode !== 'PAUSED' && !rejectedDriverIdsRef.current.has(ev.owner)
        );

        if (eligibleEVs.length > 0) {
          // Sort by fairness memory: lowest compromiseCount -> lowest totalWaitingMinutes -> departure flex
          const candidates = [...eligibleEVs].sort((a, b) => {
            const hA = a.fairnessHistory;
            const hB = b.fairnessHistory;
            if (hA.compromiseCount !== hB.compromiseCount) {
              return hA.compromiseCount - hB.compromiseCount;
            }
            if (hA.totalWaitingMinutes !== hB.totalWaitingMinutes) {
              return hA.totalWaitingMinutes - hB.totalWaitingMinutes;
            }
            return b.departureMinutesLeft - a.departureMinutesLeft;
          });
          
          const candidate = candidates[0];
          const suggestedAddMins = findSmallestFeasibleDelay(candidate, metrics.availableEVHeadroom, vehiclesWithFairness);
          const proposalId = `pact-${candidate.id}-${Math.round(shortage * 10)}`;

          if (!consumedProposalIdsRef.current.has(proposalId) && !rejectedProposalIdsRef.current.has(proposalId)) {
            setActivePactProposal({
              id: proposalId,
              driverId: candidate.id,
              owner: candidate.owner,
              model: candidate.model,
              currentSoC: candidate.currentSoC,
              targetSoC: candidate.targetSoC,
              shortageKW: shortage,
              suggestedDepartureAddMins: suggestedAddMins,
              previousBurden: candidate.fairnessHistory,
              status: 'PENDING',
              createdAt: Date.now()
            });
            logEvent('WARN', `Grid shortage of ${shortage} kW detected. Proposing Charge Pact to ${candidate.owner} (+${suggestedAddMins}m).`);
          }
        }
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [gridConfig.isPaused, gridConfig.simulationSpeed, solvedState.gridMetrics, activePactProposal, findSmallestFeasibleDelay, logEvent]);

  // SCENARIO TRIGGERS
  const triggerGridShortageDemo = () => {
    setGridConfig(prev => ({ ...prev, curtailmentActive: true, shortageDemoActive: true }));
    // 30kW available (72 cap - 42 base), requested load ~36 kW => 6kW Shortage
    setManualGridLimitKW(72);
    setManualBuildingKW(42);
    setManualSolarKW(0);
    pactCooldownRef.current = 0;
    rejectedDriverIdsRef.current = new Set();
    consumedProposalIdsRef.current = new Set();
    rejectedProposalIdsRef.current = new Set();
    
    // Configure initial profiles so total requested load equals ~36 kW
    setVehicles(prev => prev.map((ev, idx) => {
      if (idx === 0) return { ...ev, priorityMode: 'NORMAL', status: 'CHARGING' }; // ~15.4 kW
      if (idx === 1) return { ...ev, priorityMode: 'NORMAL', status: 'CHARGING' }; // ~7.7 kW
      if (idx === 2) return { ...ev, priorityMode: 'ECO', status: 'CHARGING' };    // ~4.5 kW
      if (idx === 3) return { ...ev, priorityMode: 'NORMAL', status: 'CHARGING' }; // ~8.8 kW
      return ev;
    }));

    logEvent('SHED', '⚡ DEMO SCENARIO: Grid Shortage Triggered. 30 kW headroom vs 36 kW requested load (6.0 kW shortage).');
  };

  const triggerBuildingSurge = () => {
    setGridConfig(prev => ({ ...prev, buildingSurgeActive: true, shortageDemoActive: false }));
    setManualBuildingKW(88.5);
    logEvent('SHED', '⚡ SCENARIO ACTIVATED: Facility HVAC Chiller Surge (+45 kW). Dynamic load shedding engaged to protect transformer!');
  };

  const triggerSolarCloudDrop = () => {
    setGridConfig(prev => ({ ...prev, weather: 'OVERCAST', solarDropActive: true, shortageDemoActive: false }));
    setManualSolarKW(6.2);
    logEvent('WARN', '☁️ SCENARIO ACTIVATED: Thick cloud cover over solar array. Solar generation dropped to 6.2 kW.');
  };

  const triggerCurtailmentEvent = () => {
    setGridConfig(prev => ({ ...prev, curtailmentActive: true, shortageDemoActive: false }));
    setManualGridLimitKW(68);
    logEvent('SHED', '📉 SCENARIO ACTIVATED: Utility Demand Response Event! Grid limit curtailed to 68 kW. Non-urgent chargers throttled.');
  };

  const triggerFleetRush = () => {
    const rushEV = {
      id: `ev-rush-${Date.now()}`,
      bay: vehicles.length + 1,
      owner: 'Emergency Fleet Logistics',
      model: 'Ford F-150 Lightning',
      batteryCapacity: 131,
      currentBatteryKWh: 15.7,
      currentSoC: 12,
      targetSoC: 80,
      arrivalMinutesAgo: 0,
      departureMinutesLeft: 50,
      maxPower: 19.2,
      currentAllocatedPower: 19.2,
      allocatedAmps: 83.5,
      priorityMode: 'FAST',
      status: 'CHARGING',
      energyDeliveredKWh: 0.1,
      color: '#f43f5e'
    };
    setVehicles(prev => [...prev, rushEV]);
    logEvent('BOOST', '🚗 SCENARIO ACTIVATED: Emergency delivery fleet arrival (12% SoC, departure in 50m). Top priority preemption granted.');
  };

  const resetScenarios = () => {
    resetFairnessHistory(); // Explicitly removes 'voltara_fairness_v2' from localStorage
    setGridConfig(DEFAULT_GRID_CONFIG);
    setManualBuildingKW(null);
    setManualSolarKW(null);
    setManualGridLimitKW(null);
    setVehicles(INITIAL_VEHICLES);
    setActivePactProposal(null);
    pactCooldownRef.current = 0;
    rejectedDriverIdsRef.current = new Set();
    consumedProposalIdsRef.current = new Set();
    rejectedProposalIdsRef.current = new Set();
    logEvent('INFO', '🔄 System reset to baseline optimal operating state & Charge Pact Fairness Memory cleared.');
  };

  // INDIVIDUAL VEHICLE ACTIONS
  const updateVehiclePriority = (id, newMode) => {
    setVehicles(prev => prev.map(ev => {
      if (ev.id === id) {
        const nextStatus = newMode === 'PAUSED' ? 'PAUSED' : (ev.status === 'PAUSED' ? 'CHARGING' : ev.status);
        return { 
          ...ev, 
          priorityMode: newMode,
          status: nextStatus
        };
      }
      return ev;
    }));
    logEvent('INFO', `Bay charging mode updated to ${newMode}.`);
  };

  const toggleVehiclePause = (id) => {
    setVehicles(prev => prev.map(ev => {
      if (ev.id === id) {
        const nextStatus = ev.status === 'PAUSED' ? 'CHARGING' : 'PAUSED';
        const nextMode = nextStatus === 'PAUSED' ? 'PAUSED' : 'NORMAL';
        return { ...ev, status: nextStatus, priorityMode: nextMode };
      }
      return ev;
    }));
  };

  const updateVehicleTarget = (id, newTargetSoC, newDepartureMinutes) => {
    setVehicles(prev => prev.map(ev => {
      if (ev.id === id) {
        return {
          ...ev,
          targetSoC: newTargetSoC,
          departureMinutesLeft: newDepartureMinutes
        };
      }
      return ev;
    }));
  };

  const addVehicle = (newEV) => {
    const bayNumber = vehicles.length + 1;
    const createdEV = {
      ...newEV,
      id: `ev-${Date.now()}`,
      bay: bayNumber,
      energyDeliveredKWh: 0,
      priorityMode: newEV.priorityMode || 'NORMAL',
      status: 'CHARGING'
    };
    setVehicles(prev => [...prev, createdEV]);
    logEvent('INFO', `New vehicle connected at Bay ${bayNumber}: ${newEV.model} (${newEV.currentSoC}% SoC).`);
  };

  const removeVehicle = (id) => {
    const target = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id).map((v, idx) => ({ ...v, bay: idx + 1 })));
    logEvent('INFO', `Vehicle disconnected from bay: ${target?.model || 'EV'}.`);
  };

  // CHARGE PACT ACTIONS
  const acceptChargePact = (evId, addedMinutes) => {
    const proposalToAccept = activePactProposal;
    if (!proposalToAccept) return;

    // 1. Mark proposal as ACCEPTED and consumed
    proposalToAccept.status = 'ACCEPTED';
    if (proposalToAccept.id) {
      consumedProposalIdsRef.current.add(proposalToAccept.id);
    }
    const ownerName = proposalToAccept.owner;

    // 2. Update fairness memory exactly once
    if (ownerName) {
      recordFairnessCompromise(ownerName, addedMinutes);
    }

    // 3. Clear temporary demo/load-shedding override flags that caused shortage
    const updatedConfig = {
      ...gridConfig,
      shortageDemoActive: false,
      curtailmentActive: false
    };

    // 4. Update vehicle's departure schedule synchronously
    const updatedVehicles = vehicles.map(ev => {
      if (ev.id === evId || ev.owner === ownerName) {
        return {
          ...ev,
          departureMinutesLeft: ev.departureMinutesLeft + addedMinutes
        };
      }
      return ev;
    });

    // 5. Rerun the smart charging scheduler immediately using updated state
    const updatedVehiclesWithFairness = updatedVehicles.map(v => ({
      ...v,
      fairnessHistory: getDriverFairness(v.owner),
      fairnessScore: getDriverFairness(v.owner).compromiseCount
    }));

    const currentLimit = manualGridLimitKW ?? updatedConfig.transformerCapacityKW;
    const currentSolar = manualSolarKW ?? calculateNaturalSolarKW(
      updatedConfig.timeOfDayHours,
      updatedConfig.weather,
      updatedConfig.solarPeakCapacityKW
    );
    const currentBuilding = manualBuildingKW ?? (
      updatedConfig.buildingSurgeActive 
        ? 82.5 
        : updatedConfig.baseBuildingLoadKW + (Math.sin(updatedConfig.timeOfDayHours * 1.5) * 4)
    );

    const rerunSolved = solveOptimalPowerDistribution(updatedVehiclesWithFairness, {
      transformerCapacityKW: currentLimit,
      baseBuildingLoadKW: Math.max(10, currentBuilding),
      solarGenerationKW: Math.max(0, currentSolar)
    });

    const newShortage = rerunSolved.gridMetrics.shortageKW;

    // 6. Commit state updates deterministically
    setGridConfig(updatedConfig);
    setVehicles(updatedVehicles);
    setActivePactProposal(null);
    pactCooldownRef.current = 15;

    logEvent('BOOST', `🤝 Charge Pact Accepted! ${ownerName} delayed departure by +${addedMinutes}m. Recalculated Shortage = ${newShortage} kW.`);
  };

  const declineChargePact = () => {
    const proposalToDecline = activePactProposal;
    if (!proposalToDecline) return;

    proposalToDecline.status = 'REJECTED';
    if (proposalToDecline.id) {
      rejectedProposalIdsRef.current.add(proposalToDecline.id);
    }
    const declinedOwner = proposalToDecline.owner;
    logEvent('INFO', `Charge Pact declined by ${declinedOwner}. Searching for next feasible candidate.`);
    
    if (declinedOwner) {
      rejectedDriverIdsRef.current.add(declinedOwner);
    }
    
    // Find next feasible candidate immediately
    const remainingCandidates = vehiclesWithFairness
      .filter(ev => ev.status !== 'COMPLETED' && ev.status !== 'PAUSED' && ev.priorityMode !== 'PAUSED' && !rejectedDriverIdsRef.current.has(ev.owner))
      .sort((a, b) => {
        const hA = a.fairnessHistory;
        const hB = b.fairnessHistory;
        if (hA.compromiseCount !== hB.compromiseCount) {
          return hA.compromiseCount - hB.compromiseCount;
        }
        if (hA.totalWaitingMinutes !== hB.totalWaitingMinutes) {
          return hA.totalWaitingMinutes - hB.totalWaitingMinutes;
        }
        return b.departureMinutesLeft - a.departureMinutesLeft;
      });

    if (remainingCandidates.length > 0) {
      const nextCandidate = remainingCandidates[0];
      const suggestedAddMins = findSmallestFeasibleDelay(nextCandidate, solvedState.gridMetrics.availableEVHeadroom, vehiclesWithFairness);
      const nextProposalId = `pact-${nextCandidate.id}-${Math.round(solvedState.gridMetrics.shortageKW * 10)}`;
      
      setActivePactProposal({
        id: nextProposalId,
        driverId: nextCandidate.id,
        owner: nextCandidate.owner,
        model: nextCandidate.model,
        currentSoC: nextCandidate.currentSoC,
        targetSoC: nextCandidate.targetSoC,
        shortageKW: solvedState.gridMetrics.shortageKW,
        suggestedDepartureAddMins: suggestedAddMins,
        previousBurden: nextCandidate.fairnessHistory,
        status: 'PENDING',
        createdAt: Date.now()
      });
      logEvent('WARN', `Alternative candidate identified: Proposing Charge Pact to ${nextCandidate.owner} (+${suggestedAddMins}m).`);
    } else {
      setActivePactProposal(null);
      logEvent('INFO', 'No further feasible candidates available for Charge Pact.');
    }
  };

  return {
    vehicles: solvedState.vehicles,
    gridMetrics: solvedState.gridMetrics,
    gridConfig,
    setGridConfig,
    manualBuildingKW,
    setManualBuildingKW,
    manualSolarKW,
    setManualSolarKW,
    manualGridLimitKW,
    setManualGridLimitKW,
    telemetryHistory,
    eventLogs,
    stats,
    // Scenario triggers
    triggerBuildingSurge,
    triggerSolarCloudDrop,
    triggerCurtailmentEvent,
    triggerFleetRush,
    triggerGridShortageDemo,
    resetScenarios,
    // Vehicle controls
    updateVehiclePriority,
    toggleVehiclePause,
    updateVehicleTarget,
    addVehicle,
    removeVehicle,
    logEvent,
    // Charge Pact exports
    activePactProposal,
    acceptChargePact,
    declineChargePact
  };
}

