import React, { useState } from 'react';
import { ChargingBayCard } from './ChargingBayCard';
import { 
  Plus, 
  Car, 
  Zap, 
  BatteryCharging, 
  Gauge, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  SlidersHorizontal
} from 'lucide-react';

export function ChargingBayGrid({
  vehicles = [],
  gridMetrics = {},
  onUpdatePriority,
  onTogglePause,
  onRemoveVehicle,
  onOpenAddModal
}) {
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'CHARGING' | 'WAITING' | 'READY'

  // Real KPI calculations from simulation state
  const totalVehicles = vehicles.length;
  const chargingVehicles = vehicles.filter(v => (v.currentAllocatedPower || 0) > 0);
  const chargingNowCount = chargingVehicles.length;
  
  const waitingVehicles = vehicles.filter(
    v => (v.status === 'THROTTLED' || v.status === 'PAUSED' || (v.currentAllocatedPower || 0) === 0) &&
         v.status !== 'COMPLETED' &&
         v.currentSoC < v.targetSoC
  );
  const waitingCount = waitingVehicles.length;

  const completedVehicles = vehicles.filter(
    v => v.status === 'COMPLETED' || v.currentSoC >= v.targetSoC
  );
  const completedCount = completedVehicles.length;

  const totalEVLoadKW = gridMetrics?.totalEVChargingKW ?? 
    Number(vehicles.reduce((sum, v) => sum + (v.currentAllocatedPower || 0), 0).toFixed(1));

  const averageSoC = totalVehicles > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.currentSoC || 0), 0) / totalVehicles)
    : 0;

  // Filtered vehicle list
  const filteredVehicles = vehicles.filter(v => {
    if (filterMode === 'CHARGING') return (v.currentAllocatedPower || 0) > 0;
    if (filterMode === 'WAITING') {
      return (v.status === 'THROTTLED' || v.status === 'PAUSED' || (v.currentAllocatedPower || 0) === 0) &&
             v.status !== 'COMPLETED' &&
             v.currentSoC < v.targetSoC;
    }
    if (filterMode === 'READY') {
      return v.status === 'COMPLETED' || v.currentSoC >= v.targetSoC;
    }
    return true;
  });

  return (
    <div className="ev-bays-cluster-wrapper">
      {/* 1. Compact Live EV Overview KPI Row */}
      <div className="ev-bays-kpi-deck">
        {/* KPI 1: Connected Vehicles */}
        <div className="ev-kpi-card">
          <div className="ev-kpi-icon-wrap" style={{ background: 'rgba(21, 151, 229, 0.1)', color: 'var(--electric)' }}>
            <Car size={18} />
          </div>
          <div className="ev-kpi-content">
            <span className="ev-kpi-label">Connected Vehicles</span>
            <div className="ev-kpi-value-row">
              <span className="ev-kpi-num font-mono">{totalVehicles}</span>
              <span className="ev-kpi-sub">Bays Occupied</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Charging Now */}
        <div className="ev-kpi-card">
          <div className="ev-kpi-icon-wrap" style={{ background: 'rgba(18, 184, 134, 0.1)', color: 'var(--secondary)' }}>
            <Zap size={18} />
          </div>
          <div className="ev-kpi-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="ev-kpi-label">Charging Now</span>
              {chargingNowCount > 0 && <span className="status-live-dot" />}
            </div>
            <div className="ev-kpi-value-row">
              <span className="ev-kpi-num font-mono" style={{ color: 'var(--primary)' }}>
                {chargingNowCount}
              </span>
              <span className="ev-kpi-sub">Drawing Power</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total EV Load */}
        <div className="ev-kpi-card">
          <div className="ev-kpi-icon-wrap" style={{ background: 'rgba(8, 127, 91, 0.1)', color: 'var(--primary)' }}>
            <Gauge size={18} />
          </div>
          <div className="ev-kpi-content">
            <span className="ev-kpi-label">Total EV Load</span>
            <div className="ev-kpi-value-row">
              <span className="ev-kpi-num font-mono">{totalEVLoadKW}</span>
              <span className="ev-kpi-unit">kW</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Average SoC */}
        <div className="ev-kpi-card">
          <div className="ev-kpi-icon-wrap" style={{ background: 'rgba(233, 162, 59, 0.12)', color: 'var(--warning)' }}>
            <BatteryCharging size={18} />
          </div>
          <div className="ev-kpi-content">
            <span className="ev-kpi-label">Average SoC</span>
            <div className="ev-kpi-value-row">
              <span className="ev-kpi-num font-mono">{averageSoC}%</span>
              <span className="ev-kpi-sub">Fleet Level</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control Toolbar & Filter Row */}
      <div className="ev-cluster-toolbar">
        <div className="ev-filter-group">
          <button
            className={`ev-filter-pill ${filterMode === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterMode('ALL')}
          >
            <span>All Vehicles</span>
            <span className="ev-pill-count">{totalVehicles}</span>
          </button>

          <button
            className={`ev-filter-pill ${filterMode === 'CHARGING' ? 'active' : ''}`}
            onClick={() => setFilterMode('CHARGING')}
          >
            <span className="ev-pill-dot charging" />
            <span>Active</span>
            <span className="ev-pill-count">{chargingNowCount}</span>
          </button>

          {waitingCount > 0 && (
            <button
              className={`ev-filter-pill ${filterMode === 'WAITING' ? 'active' : ''}`}
              onClick={() => setFilterMode('WAITING')}
            >
              <span className="ev-pill-dot waiting" />
              <span>Throttled/Waiting</span>
              <span className="ev-pill-count">{waitingCount}</span>
            </button>
          )}

          <button
            className={`ev-filter-pill ${filterMode === 'READY' ? 'active' : ''}`}
            onClick={() => setFilterMode('READY')}
          >
            <span className="ev-pill-dot ready" />
            <span>Completed</span>
            <span className="ev-pill-count">{completedCount}</span>
          </button>
        </div>

        <div className="ev-action-group">
          <button 
            className="btn btn-primary ev-add-btn" 
            onClick={onOpenAddModal}
            title="Plug in and authorize a new vehicle"
          >
            <Plus size={16} />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* 3. EV Vehicle Cards Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="ev-empty-state">
          <Car size={36} style={{ color: 'var(--text-dim)', marginBottom: '8px' }} />
          <h4 style={{ color: 'var(--dark)', fontWeight: 600 }}>No vehicles match filter</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Switch back to &quot;All Vehicles&quot; or connect a new EV to an open charging bay.
          </p>
          <button 
            className="btn btn-secondary" 
            onClick={() => setFilterMode('ALL')} 
            style={{ marginTop: '12px' }}
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="bay-grid">
          {filteredVehicles.map(ev => (
            <ChargingBayCard
              key={ev.id}
              vehicle={ev}
              gridMetrics={gridMetrics}
              onUpdatePriority={onUpdatePriority}
              onTogglePause={onTogglePause}
              onRemoveVehicle={onRemoveVehicle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
