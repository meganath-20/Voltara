import React from 'react';
import { Gauge, Sun, Zap, Building2, ShieldCheck, Leaf } from 'lucide-react';

export function KpiMetricsBar({ gridMetrics, vehicles, stats }) {
  const activeChargersCount = vehicles.filter(v => (v.currentAllocatedPower || 0) > 0).length;

  const isHighLoad = gridMetrics.transformerLoadPercent >= 80;
  const isCriticalLoad = gridMetrics.transformerLoadPercent >= 92;

  const headroomColor = isCriticalLoad ? '#f43f5e' : (isHighLoad ? '#f59e0b' : '#38bdf8');

  return (
    <div className="kpi-grid">
      {/* 1. Grid Headroom & Transformer Load */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Transformer Capacity</span>
          <div className="kpi-icon-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Gauge size={20} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: headroomColor }}>
            {gridMetrics.transformerHeadroomKW}
          </span>
          <span className="kpi-unit">kW Headroom</span>
        </div>
        <div className="kpi-footer">
          <span>Grid Import: {gridMetrics.netUtilityGridImportKW} / {gridMetrics.transformerCapacityKW} kW</span>
          <span className="kpi-trend" style={{ color: headroomColor }}>
            {gridMetrics.transformerLoadPercent}% Load
          </span>
        </div>
      </div>

      {/* 2. Renewable Energy Share */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Solar & Clean Energy</span>
          <div className="kpi-icon-badge" style={{ background: 'rgba(0, 245, 155, 0.15)', color: '#00f59b' }}>
            <Sun size={20} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: '#00f59b' }}>
            {gridMetrics.renewableEVSharePercent}
          </span>
          <span className="kpi-unit">% EV Solar Share</span>
        </div>
        <div className="kpi-footer">
          <span>Rooftop PV: {gridMetrics.solarGenerationKW} kW</span>
          <span className="kpi-trend" style={{ color: '#00f59b' }}>
            {gridMetrics.cleanEnergySelfConsumptionPercent}% Self-Used
          </span>
        </div>
      </div>

      {/* 3. EV Charging Cluster Load */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Active EV Cluster Load</span>
          <div className="kpi-icon-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Zap size={20} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: '#38bdf8' }}>
            {gridMetrics.totalEVChargingKW}
          </span>
          <span className="kpi-unit">kW Charging</span>
        </div>
        <div className="kpi-footer">
          <span>{activeChargersCount} of {vehicles.length} Bays Charging</span>
          <span className="kpi-trend" style={{ color: '#38bdf8' }}>
            {gridMetrics.availableEVHeadroom} kW Max Cap
          </span>
        </div>
      </div>

      {/* 4. Facility Demand & Overload Protection */}
      <div className="glass-panel kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Facility Infrastructure</span>
          <div className="kpi-icon-badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Building2 size={20} />
          </div>
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value" style={{ color: '#a855f7' }}>
            {gridMetrics.baseBuildingLoadKW}
          </span>
          <span className="kpi-unit">kW Building Load</span>
        </div>
        <div className="kpi-footer">
          <span>Total Demand: {gridMetrics.totalFacilityDemandKW} kW</span>
          <span className="kpi-trend" style={{ color: '#00f59b' }}>
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: 2 }} />
            {stats.overloadIncidentsPrevented} Protected
          </span>
        </div>
      </div>
    </div>
  );
}
