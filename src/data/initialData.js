// Predefined Vehicle Profiles & Initial State for Smart EV Cluster
export const VEHICLE_CATALOG = [
  {
    model: 'Tesla Model Y',
    batteryCapacity: 75,
    maxPower: 11, // kW AC
    type: 'SUV',
    image: '🚙',
    color: '#00f59b'
  },
  {
    model: 'Porsche Taycan',
    batteryCapacity: 93.4,
    maxPower: 22, // kW AC High Power
    type: 'Sedan',
    image: '🏎️',
    color: '#38bdf8'
  },
  {
    model: 'Hyundai Ioniq 5',
    batteryCapacity: 77.4,
    maxPower: 11,
    type: 'Crossover',
    image: '🚗',
    color: '#a855f7'
  },
  {
    model: 'Rivian R1T',
    batteryCapacity: 135,
    maxPower: 11.5,
    type: 'Truck',
    image: '🛻',
    color: '#f59e0b'
  },
  {
    model: 'BMW i4 eDrive40',
    batteryCapacity: 83.9,
    maxPower: 11,
    type: 'Sedan',
    image: '🏎️',
    color: '#06b6d4'
  },
  {
    model: 'Ford F-150 Lightning',
    batteryCapacity: 131,
    maxPower: 19.2,
    type: 'Truck',
    image: '🛻',
    color: '#f43f5e'
  },
  {
    model: 'Kia EV6 GT',
    batteryCapacity: 77.4,
    maxPower: 11,
    type: 'Crossover',
    image: '🚗',
    color: '#10b981'
  },
  {
    model: 'Audi Q8 e-tron',
    batteryCapacity: 114,
    maxPower: 22,
    type: 'SUV',
    image: '🚙',
    color: '#eab308'
  }
];

export const INITIAL_VEHICLES = [
  {
    id: 'ev-1',
    bay: 1,
    owner: 'Sarah Jenkins',
    model: 'Porsche Taycan',
    batteryCapacity: 93.4,
    currentBatteryKWh: 18.7, // ~20%
    currentSoC: 20,
    targetSoC: 85,
    arrivalMinutesAgo: 45,
    departureMinutesLeft: 75, // 1h 15m - VERY URGENT
    maxPower: 22,
    currentAllocatedPower: 18.5,
    allocatedAmps: 80,
    priorityMode: 'EXPRESS', // AUTO, EXPRESS, ECO_SOLAR
    status: 'CHARGING', // CHARGING, THROTTLED, QUEUED, COMPLETED, PAUSED
    energyDeliveredKWh: 11.2,
    color: '#38bdf8'
  },
  {
    id: 'ev-2',
    bay: 2,
    owner: 'Dr. Marcus Vance',
    model: 'Tesla Model Y',
    batteryCapacity: 75,
    currentBatteryKWh: 16.5, // ~22%
    currentSoC: 22,
    targetSoC: 80,
    arrivalMinutesAgo: 20,
    departureMinutesLeft: 140, // 2h 20m
    maxPower: 11,
    currentAllocatedPower: 9.8,
    allocatedAmps: 42.6,
    priorityMode: 'AUTO',
    status: 'CHARGING',
    energyDeliveredKWh: 3.4,
    color: '#00f59b'
  },
  {
    id: 'ev-3',
    bay: 3,
    owner: 'Elena Rostova',
    model: 'Rivian R1T',
    batteryCapacity: 135,
    currentBatteryKWh: 40.5, // ~30%
    currentSoC: 30,
    targetSoC: 90,
    arrivalMinutesAgo: 60,
    departureMinutesLeft: 360, // 6h - Lots of time
    maxPower: 11.5,
    currentAllocatedPower: 5.2,
    allocatedAmps: 22.6,
    priorityMode: 'AUTO',
    status: 'CHARGING',
    energyDeliveredKWh: 7.9,
    color: '#f59e0b'
  },
  {
    id: 'ev-4',
    bay: 4,
    owner: 'Apex Logistics (Van)',
    model: 'Ford F-150 Lightning',
    batteryCapacity: 131,
    currentBatteryKWh: 23.5, // ~18%
    currentSoC: 18,
    targetSoC: 85,
    arrivalMinutesAgo: 30,
    departureMinutesLeft: 95, // 1h 35m - Urgent commercial vehicle
    maxPower: 19.2,
    currentAllocatedPower: 16.2,
    allocatedAmps: 70.4,
    priorityMode: 'EXPRESS',
    status: 'CHARGING',
    energyDeliveredKWh: 8.6,
    color: '#f43f5e'
  },
  {
    id: 'ev-5',
    bay: 5,
    owner: 'Liam Chen',
    model: 'Hyundai Ioniq 5',
    batteryCapacity: 77.4,
    currentBatteryKWh: 54.2, // ~70%
    currentSoC: 70,
    targetSoC: 80,
    arrivalMinutesAgo: 110,
    departureMinutesLeft: 240, // 4h
    maxPower: 11,
    currentAllocatedPower: 3.8,
    allocatedAmps: 16.5,
    priorityMode: 'ECO_SOLAR', // Only charge on excess solar
    status: 'CHARGING',
    energyDeliveredKWh: 14.1,
    color: '#a855f7'
  },
  {
    id: 'ev-6',
    bay: 6,
    owner: 'Claire Dubois',
    model: 'BMW i4 eDrive40',
    batteryCapacity: 83.9,
    currentBatteryKWh: 75.5, // ~90%
    currentSoC: 90,
    targetSoC: 90,
    arrivalMinutesAgo: 150,
    departureMinutesLeft: 180,
    maxPower: 11,
    currentAllocatedPower: 0,
    allocatedAmps: 0,
    priorityMode: 'AUTO',
    status: 'COMPLETED',
    energyDeliveredKWh: 22.8,
    color: '#06b6d4'
  }
];

export const DEFAULT_GRID_CONFIG = {
  transformerCapacityKW: 120, // Grid limit / Transformer rating
  baseBuildingLoadKW: 42,     // Base facility demand (HVAC, lighting, IT)
  solarPeakCapacityKW: 55,    // Solar PV peak array
  timeOfDayHours: 13.5,       // 1:30 PM (Sun high, high generation)
  weather: 'SUNNY',           // SUNNY (1.0), PARTLY_CLOUDY (0.65), OVERCAST (0.25), NIGHT (0.0)
  simulationSpeed: 1,         // 1x, 5x, 10x
  isPaused: false,
  smartMode: 'OPTIMIZED',     // OPTIMIZED, STRICT_CAP, MAX_SOLAR, EMERGENCY_SHED
  buildingSurgeActive: false, // HVAC spike simulation
  solarDropActive: false,     // Cloud pass simulation
  curtailmentActive: false    // Utility DR event simulation
};
