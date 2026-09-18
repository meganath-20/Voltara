import React, { useState } from 'react';
import { useGridSimulation } from './hooks/useGridSimulation';
import { Header } from './components/Header';
import { KpiMetricsBar } from './components/KpiMetricsBar';
import { EnergyFlowDiagram } from './components/EnergyFlowDiagram';
import { TransformerGauge } from './components/TransformerGauge';
import { TelemetryChart } from './components/TelemetryChart';
import { ChargingBayGrid } from './components/ChargingBayGrid';
import { ScenarioControls } from './components/ScenarioControls';
import { EventLogDrawer } from './components/EventLogDrawer';
import { AddVehicleModal } from './components/AddVehicleModal';

export function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    vehicles,
    gridMetrics,
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
    // Scenarios
    triggerBuildingSurge,
    triggerSolarCloudDrop,
    triggerCurtailmentEvent,
    triggerFleetRush,
    resetScenarios,
    // EV actions
    updateVehiclePriority,
    toggleVehiclePause,
    addVehicle,
    removeVehicle
  } = useGridSimulation();

  return (
    <div className="app-container">
      {/* 1. Header & Live Clock */}
      <Header
        gridConfig={gridConfig}
        setGridConfig={setGridConfig}
        gridMetrics={gridMetrics}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onReset={resetScenarios}
      />

      {/* 2. Top KPI Cards Strip */}
      <KpiMetricsBar
        gridMetrics={gridMetrics}
        vehicles={vehicles}
        stats={stats}
      />

      {/* 3. Main Operational Split (Topology + Chart vs Transformer Gauge + Event Logs) */}
      <div className="dashboard-grid">
        {/* Left Col: Dynamic Flow & Telemetry Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <EnergyFlowDiagram gridMetrics={gridMetrics} />
          <TelemetryChart
            telemetryHistory={telemetryHistory}
            currentGridLimit={gridMetrics.transformerCapacityKW}
          />
        </div>

        {/* Right Col: Substation Transformer Stress Meter & Real-Time Algorithmic Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TransformerGauge gridMetrics={gridMetrics} />
          <EventLogDrawer eventLogs={eventLogs} />
        </div>
      </div>

      {/* 4. Interactive Simulation & 1-Click Stress Test Suite */}
      <ScenarioControls
        gridConfig={gridConfig}
        setGridConfig={setGridConfig}
        manualBuildingKW={manualBuildingKW}
        setManualBuildingKW={setManualBuildingKW}
        manualSolarKW={manualSolarKW}
        setManualSolarKW={setManualSolarKW}
        manualGridLimitKW={manualGridLimitKW}
        setManualGridLimitKW={setManualGridLimitKW}
        triggerBuildingSurge={triggerBuildingSurge}
        triggerSolarCloudDrop={triggerSolarCloudDrop}
        triggerCurtailmentEvent={triggerCurtailmentEvent}
        triggerFleetRush={triggerFleetRush}
        resetScenarios={resetScenarios}
      />

      {/* 5. Connected EV Charging Bays Cluster */}
      <ChargingBayGrid
        vehicles={vehicles}
        onUpdatePriority={updateVehiclePriority}
        onTogglePause={toggleVehiclePause}
        onRemoveVehicle={removeVehicle}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Modal to connect new EV */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddVehicle={addVehicle}
      />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 0 10px',
        color: 'var(--text-dim)',
        fontSize: '0.78rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div>
          VoltGrid Pro • Smart EV Charging & Localized Microgrid Coordination System
        </div>
        <div>
          Dynamic fair-share water-filling algorithm with deadline urgency scheduling, rooftop solar self-consumption optimization, and guaranteed transformer overload prevention.
        </div>
      </footer>
    </div>
  );
}

export default App;
