import React from 'react';
import { Activity, ShieldCheck, Clock, CheckCircle2, Zap } from 'lucide-react';
import { getFairnessHistory } from '../hooks/useGridSimulation';

export function SmartMetricsDashboard({ gridMetrics, vehicles, backendData }) {
  const history = getFairnessHistory();
  const drivers = vehicles.map(v => ({
    name: v.owner,
    history: history[v.owner] || { compromiseCount: 0, totalWaitingMinutes: 0, totalSeverity: 'Low' }
  }));

  const {
    totalEVChargingKW = 0,
    totalUsefulEnergyKW = 0,
    totalWastedEnergyKW = 0
  } = gridMetrics;

  const baselineWasted = totalEVChargingKW * 0.06; // Assume baseline 94% fixed efficiency, so 6% loss
  const wattWiseSaved = Math.max(0, baselineWasted - totalWastedEnergyKW).toFixed(2);

  return (
    <section className="page-section" id="smart-metrics">
      <div className="section-heading-group">
        <span className="section-eyebrow">NEW MVP CAPABILITIES</span>
        <h2 className="section-main-title">WattWise & Fairness Memory</h2>
        <p className="section-subtitle">
          Real-time tracking of smart efficiency curves and historical compromise burdens.
        </p>
      </div>

      <div className="metrics-dashboard-grid">
        
        {/* WATTWISE PANEL */}
        <div className="dashboard-panel wattwise-panel-card">
          <div className="panel-header-row">
            <div className="panel-title-group">
              <div className="panel-icon-wrap zap-icon">
                <Zap size={18} color="var(--electric)" />
              </div>
              <div>
                <h3 className="panel-main-title">WattWise Dynamic Efficiency</h3>
                <p className="panel-sub-title">Real-time inverter modulation & thermal loss minimization</p>
              </div>
            </div>
            <span className="panel-badge-pill font-mono">Dynamic Curve</span>
          </div>
          
          {/* Energy Distribution Tree Flow */}
          <div className="wattwise-tree-container">
            {/* Top Node: Grid Energy */}
            <div className="tree-node node-grid-source">
              <div className="node-label">1. GRID INPUT LOAD</div>
              <div className="node-value font-mono">{totalEVChargingKW.toFixed(2)} <span className="node-unit">kW</span></div>
            </div>

            {/* Tree Branch Connectors */}
            <div className="tree-branch-lines">
              <div className="branch-line branch-left" />
              <div className="branch-line branch-right" />
            </div>

            {/* Bottom Split Nodes: Useful vs Loss */}
            <div className="tree-split-row">
              <div className="tree-node node-useful">
                <div className="node-badge positive">USEFUL BATTERY ENERGY</div>
                <div className="node-value font-mono" style={{ color: 'var(--primary)' }}>
                  {totalUsefulEnergyKW.toFixed(2)} <span className="node-unit">kW</span>
                </div>
                <div className="node-hint">Directly stored into vehicle packs</div>
              </div>

              <div className="tree-node node-losses">
                <div className="node-badge warning">DISSIPATED LOSSES</div>
                <div className="node-value font-mono" style={{ color: 'var(--warning)' }}>
                  {totalWastedEnergyKW.toFixed(2)} <span className="node-unit">kW</span>
                </div>
                <div className="node-hint">Minimised across modulated curve</div>
              </div>
            </div>
          </div>

          {/* Savings Comparison Footer */}
          <div className="wattwise-comparison-footer">
            <div className="comparison-metric">
              <span className="comp-label">Estimated Baseline Fixed Loss</span>
              <span className="comp-value font-mono">{baselineWasted.toFixed(2)} kW (6.0%)</span>
            </div>
            <div className="comparison-metric right">
              <span className="comp-label">WattWise Active Savings</span>
              <span className="comp-value-highlight font-mono">
                {wattWiseSaved > 0 ? `+${wattWiseSaved} kW Saved` : 'Peak Efficiency'}
              </span>
            </div>
          </div>
        </div>

        {/* FAIRNESS MEMORY PANEL */}
        <div className="dashboard-panel fairness-panel-card">
          <div className="panel-header-row">
            <div className="panel-title-group">
              <div className="panel-icon-wrap shield-icon">
                <ShieldCheck size={18} color="var(--primary)" />
              </div>
              <div>
                <h3 className="panel-main-title">Fairness Memory</h3>
                <p className="panel-sub-title">Historical compromise tracking preventing driver fatigue</p>
              </div>
            </div>
            <span className="panel-badge-pill green font-mono">Equitable</span>
          </div>

          <div className="fairness-drivers-list">
            {drivers.map((driver, idx) => {
              const burden = driver.history.totalSeverity || 'Low';
              return (
                <div key={idx} className="fairness-driver-row">
                  <div className="driver-info-col">
                    <div className="driver-avatar-mini">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <div className="driver-full-name">{driver.name}</div>
                      <div className="driver-fairness-status">
                        {driver.history.compromiseCount > 0 
                          ? `${driver.history.compromiseCount} Charge Pact(s) accepted` 
                          : 'No compromises needed'}
                      </div>
                    </div>
                  </div>

                  <div className="driver-metrics-col">
                    <div className="driver-stat-box">
                      <span className="dstat-label">Wait Added</span>
                      <span className="dstat-val font-mono">{driver.history.totalWaitingMinutes}m</span>
                    </div>

                    <div className="driver-burden-pill-wrap">
                      <span className={`burden-badge ${burden.toLowerCase()}`}>
                        {burden} Burden
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* BACKEND DATA CONNECTION */}
        {backendData && (
          <div className="dashboard-panel">
            <div className="panel-header-row">
              <div>
                <h3 className="panel-main-title">Python Backend Telemetry</h3>
                <p className="panel-sub-title">
                  Calibrated energy data from the Voltara backend
                </p>
              </div>
              <span className="panel-badge-pill green font-mono">LIVE API</span>
            </div>

            <div className="wattwise-comparison-footer">
              <div className="comparison-metric">
                <span className="comp-label">Building Load</span>
                <span className="comp-value font-mono">
                  {backendData.building_load_kw.toFixed(2)} kW
                </span>
              </div>

              <div className="comparison-metric right">
                <span className="comp-label">Connected EVs</span>
                <span className="comp-value-highlight font-mono">
                  {backendData.connected_ev_count}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
