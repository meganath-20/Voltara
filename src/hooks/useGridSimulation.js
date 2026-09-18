import { useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_VEHICLES, DEFAULT_GRID_CONFIG } from '../data/initialData';
import { solveOptimalPowerDistribution } from '../algorithms/smartChargingEngine';

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

  // Run the smart optimization algorithm
  const solvedState = solveOptimalPowerDistribution(vehicles, {
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

  // Simulation tick loop (runs every 1000ms)
  useEffect(() => {
    if (gridConfig.isPaused) return;

    const interval = setInterval(() => {
      const speed = gridConfig.simulationSpeed; // 1x, 5x, 10x
      const deltaSeconds = 1 * speed;

      // 1. Advance diurnal clock
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
          if (ev.status === 'COMPLETED' || ev.status === 'PAUSED') {
            return {
              ...ev,
              departureMinutesLeft: Math.max(0, ev.departureMinutesLeft - (deltaSeconds / 60))
            };
          }

          const powerKW = ev.currentAllocatedPower || 0;
          const energyAddedKWh = (powerKW * (deltaSeconds / 3600)) * 0.94; // 94% charging efficiency
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
      const co2AvoidedDelta = cleanDelta * 0.42; // ~0.42 kg CO2 per clean kWh

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

    }, 1000);

    return () => clearInterval(interval);
  }, [gridConfig.isPaused, gridConfig.simulationSpeed, solvedState.gridMetrics, logEvent]);

  // SCENARIO TRIGGERS
  const triggerBuildingSurge = () => {
    setGridConfig(prev => ({ ...prev, buildingSurgeActive: true }));
    setManualBuildingKW(88.5);
    logEvent('SHED', '⚡ SCENARIO ACTIVATED: Facility HVAC Chiller Surge (+45 kW). Dynamic load shedding engaged to protect transformer!');
  };

  const triggerSolarCloudDrop = () => {
    setGridConfig(prev => ({ ...prev, weather: 'OVERCAST', solarDropActive: true }));
    setManualSolarKW(6.2);
    logEvent('WARN', '☁️ SCENARIO ACTIVATED: Thick cloud cover over solar array. Solar generation dropped to 6.2 kW.');
  };

  const triggerCurtailmentEvent = () => {
    setGridConfig(prev => ({ ...prev, curtailmentActive: true }));
    setManualGridLimitKW(68); // Drop limit from 120 to 68 kW
    logEvent('SHED', '📉 SCENARIO ACTIVATED: Utility Demand Response Event! Grid limit curtailed to 68 kW. Non-urgent chargers throttled.');
  };

  const triggerFleetRush = () => {
    const rushEV = {
      id: `ev-rush-${Date.now()}`,
      bay: vehicles.length + 1,
      owner: 'Emergency Fleet Logistics',
      model: 'Ford F-150 Lightning',
      batteryCapacity: 131,
      currentBatteryKWh: 15.7, // ~12%
      currentSoC: 12,
      targetSoC: 80,
      arrivalMinutesAgo: 0,
      departureMinutesLeft: 50, // 50 mins - EMERGENCY
      maxPower: 19.2,
      currentAllocatedPower: 19.2,
      allocatedAmps: 83.5,
      priorityMode: 'EXPRESS',
      status: 'CHARGING',
      energyDeliveredKWh: 0.1,
      color: '#f43f5e'
    };
    setVehicles(prev => [...prev, rushEV]);
    logEvent('BOOST', '🚗 SCENARIO ACTIVATED: Emergency delivery fleet arrival (12% SoC, departure in 50m). Top priority preemption granted.');
  };

  const resetScenarios = () => {
    setGridConfig(DEFAULT_GRID_CONFIG);
    setManualBuildingKW(null);
    setManualSolarKW(null);
    setManualGridLimitKW(null);
    setVehicles(INITIAL_VEHICLES);
    logEvent('INFO', '🔄 System reset to baseline optimal operating state.');
  };

  // INDIVIDUAL VEHICLE ACTIONS
  const updateVehiclePriority = (id, newMode) => {
    setVehicles(prev => prev.map(ev => {
      if (ev.id === id) {
        return { ...ev, priorityMode: newMode };
      }
      return ev;
    }));
    logEvent('INFO', `Bay charging mode updated to ${newMode}.`);
  };

  const toggleVehiclePause = (id) => {
    setVehicles(prev => prev.map(ev => {
      if (ev.id === id) {
        const nextStatus = ev.status === 'PAUSED' ? 'CHARGING' : 'PAUSED';
        return { ...ev, status: nextStatus };
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
    resetScenarios,
    // Vehicle controls
    updateVehiclePriority,
    toggleVehiclePause,
    updateVehicleTarget,
    addVehicle,
    removeVehicle,
    logEvent
  };
}
