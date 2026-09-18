import React from 'react';
import { 
  Gauge, 
  Building2, 
  BatteryCharging, 
  Sun, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { TransformerGauge } from './TransformerGauge';
import { TelemetryChart } from './TelemetryChart';

export function LiveLoadSection({ gridMetrics, vehicles, telemetryHistory }) {
  const {
    transformerCapacityKW = 120,
    baseBuildingLoadKW = 0,
    solarGenerationKW = 0,
    totalEVChargingKW = 0,
    totalFacilityDemandKW = 0,
    netUtilityGridImportKW = 0,
    netGridExportKW = 0,
    transformerLoadPercent = 0,
    transformerHeadroomKW = 0,
    renewableEVSharePercent = 0,
    cleanEnergySelfConsumptionPercent = 100,
    isOverloadImminent = false
  } = gridMetrics || {};

  const activeChargersCount = (vehicles || []).filter(v => (v.currentAllocatedPower || 0) > 0).length;
  const isHighLoad = transformerLoadPercent >= 80;
  const isCriticalLoad = transformerLoadPercent >= 92;

  let headroomColor = 'var(--primary)';
  if (isCriticalLoad) {
    headroomColor = 'var(--danger)';
  } else if (isHighLoad) {
    headroomColor = 'var(--warning)';
  }

  return (
    <div className="live-load-container">
      {/* Section Header */}
      <div className="section-heading-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span className="section-eyebrow">03 — Live Load</span>
          <div className="live-feed-badge">
            <span className="status-live-dot" />
            <span>LIVE • 1 Hz Simulation Feed</span>
          </div>
        </div>

        <h2 className="section-main-title">See the system respond in real time.</h2>
        <p className="section-subtitle">
          Monitor grid capacity, facility demand, EV charging load and renewable generation as Voltara continuously balances the site.
        </p>
      </div>

      {/* Tiered Live KPI Grid */}
      <div className="live-kpi-deck">
        {/* 1. PRIMARY HERO KPI: Grid Capacity & Headroom */}
        <div className="live-kpi-card primary-kpi">
          <div className="kpi-top-row">
            <div className="kpi-label-group">
              <span className="kpi-tag-primary">PRIMARY CAPACITY TARGET</span>
              <h3 className="kpi-card-headline">Available Grid Headroom</h3>
            </div>
            <div className="icon-badge-round" style={{ background: 'rgba(8, 127, 91, 0.1)', color: headroomColor }}>
              <Gauge size={22} />
            </div>
          </div>

          <div className="kpi-big-value-row">
            <span className="kpi-giant-number" style={{ color: headroomColor }}>
              {transformerHeadroomKW}
            </span>
            <span className="kpi-giant-unit">kW Headroom</span>
            <span className="kpi-rating-sub">/ {transformerCapacityKW} kW Rating</span>
          </div>

          {/* Visual Headroom Progress Bar */}
          <div className="headroom-visual-strip">
            <div className="strip-label-row">
              <span>Grid Draw: <strong>{netUtilityGridImportKW} kW ({transformerLoadPercent}%)</strong></span>
              <span>Available: <strong style={{ color: headroomColor }}>{transformerHeadroomKW} kW</strong></span>
            </div>
            <div className="strip-track">
              <div 
                className="strip-fill" 
                style={{ 
                  width: `${Math.min(100, transformerLoadPercent)}%`,
                  background: isCriticalLoad ? 'var(--danger)' : (isHighLoad ? 'var(--warning)' : 'var(--electric)')
                }} 
              />
            </div>
            <div className="strip-markers">
              <span>0 kW</span>
              <span style={{ color: 'var(--warning)' }}>80% Peak Threshold</span>
              <span style={{ color: 'var(--danger)' }}>92% Overload Shedding</span>
            </div>
          </div>

          <div className="kpi-card-status-footer">
            {isCriticalLoad ? (
              <div className="status-note alert">
                <AlertTriangle size={15} />
                <span>Peak load shedding engaged to guarantee zero transformer overload.</span>
              </div>
            ) : (
              <div className="status-note normal">
                <ShieldCheck size={15} />
                <span>Operating well within thermal envelope. Zero transformer risk.</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. SECONDARY KPI: Building Load */}
        <div className="live-kpi-card secondary-kpi">
          <div className="kpi-top-row">
            <div>
              <span className="kpi-tag">FACILITY INFRASTRUCTURE</span>
              <h4 className="kpi-title-sub">Building Demand</h4>
            </div>
            <div className="icon-badge-round" style={{ background: 'rgba(121, 80, 242, 0.1)', color: '#7950F2' }}>
              <Building2 size={20} />
            </div>
          </div>

          <div className="kpi-mid-value-row">
            <span className="kpi-mid-number" style={{ color: '#7950F2' }}>{baseBuildingLoadKW}</span>
            <span className="kpi-mid-unit">kW</span>
          </div>

          <div className="kpi-mini-footer">
            <span>Baseline Operations (HVAC & IT)</span>
            <span className="kpi-tag-sub">
              {totalFacilityDemandKW > 0 ? Math.round((baseBuildingLoadKW / totalFacilityDemandKW) * 100) : 0}% of Site Demand
            </span>
          </div>
        </div>

        {/* 3. SECONDARY KPI: EV Charging Load */}
        <div className="live-kpi-card secondary-kpi">
          <div className="kpi-top-row">
            <div>
              <span className="kpi-tag">DISPATCH CLUSTER</span>
              <h4 className="kpi-title-sub">Active EV Load</h4>
            </div>
            <div className="icon-badge-round" style={{ background: 'rgba(21, 151, 229, 0.1)', color: 'var(--electric)' }}>
              <BatteryCharging size={20} />
            </div>
          </div>

          <div className="kpi-mid-value-row">
            <span className="kpi-mid-number" style={{ color: 'var(--electric)' }}>{totalEVChargingKW}</span>
            <span className="kpi-mid-unit">kW</span>
          </div>

          <div className="kpi-mini-footer">
            <span>{activeChargersCount} of {(vehicles || []).length} Bays Charging</span>
            <span className="kpi-tag-sub" style={{ color: 'var(--primary)' }}>
              {renewableEVSharePercent}% Clean Solar
            </span>
          </div>
        </div>

        {/* 4. SUPPORTING KPI: Solar Generation */}
        <div className="live-kpi-card supporting-kpi">
          <div className="kpi-top-row">
            <div>
              <span className="kpi-tag">CLEAN ENERGY</span>
              <h4 className="kpi-title-sub">Solar Generation</h4>
            </div>
            <div className="icon-badge-round" style={{ background: 'rgba(8, 127, 91, 0.1)', color: 'var(--primary)' }}>
              <Sun size={18} />
            </div>
          </div>

          <div className="kpi-mid-value-row">
            <span className="kpi-mid-number" style={{ color: 'var(--primary)' }}>{solarGenerationKW}</span>
            <span className="kpi-mid-unit">kW</span>
          </div>

          <div className="kpi-mini-footer">
            <span>Rooftop PV Array</span>
            <span className="kpi-tag-sub">{cleanEnergySelfConsumptionPercent}% Self-Used</span>
          </div>
        </div>

        {/* 5. SUPPORTING KPI: Grid Import / Export */}
        <div className="live-kpi-card supporting-kpi">
          <div className="kpi-top-row">
            <div>
              <span className="kpi-tag">UTILITY INTERCHANGE</span>
              <h4 className="kpi-title-sub">Grid Flow</h4>
            </div>
            <div className="icon-badge-round" style={{ background: 'rgba(233, 162, 59, 0.1)', color: 'var(--warning)' }}>
              <Zap size={18} />
            </div>
          </div>

          <div className="kpi-mid-value-row">
            <span className="kpi-mid-number" style={{ color: netUtilityGridImportKW > 0 ? 'var(--electric)' : 'var(--primary)' }}>
              {netUtilityGridImportKW > 0 ? netUtilityGridImportKW : (netGridExportKW > 0 ? netGridExportKW : 0)}
            </span>
            <span className="kpi-mid-unit">{netUtilityGridImportKW > 0 ? 'kW Import' : (netGridExportKW > 0 ? 'kW Export' : 'kW Balanced')}</span>
          </div>

          <div className="kpi-mini-footer">
            <span>{netUtilityGridImportKW > 0 ? 'Grid Feeding Deficit' : 'Surplus Clean Export'}</span>
            <span className="kpi-tag-sub">{transformerLoadPercent}% Substation Load</span>
          </div>
        </div>
      </div>

      {/* Load Relationship Equation Strip */}
      <div className="load-relationship-strip">
        <div className="relation-title-col">
          <span className="relation-tag">SYSTEM BALANCE</span>
          <span className="relation-heading">Power Equation</span>
        </div>

        <div className="relation-math-row">
          <div className="math-cell">
            <span className="math-label">Facility Demand</span>
            <span className="math-value">{baseBuildingLoadKW} kW</span>
          </div>
          <span className="math-operator">+</span>
          <div className="math-cell">
            <span className="math-label">EV Charging Load</span>
            <span className="math-value">{totalEVChargingKW} kW</span>
          </div>
          <span className="math-operator">=</span>
          <div className="math-cell result-cell">
            <span className="math-label">Total Site Demand</span>
            <span className="math-value" style={{ color: 'var(--dark)' }}>{totalFacilityDemandKW} kW</span>
          </div>
        </div>

        <div className="relation-divider" />

        <div className="relation-math-row">
          <div className="math-cell">
            <span className="math-label">Grid Rating</span>
            <span className="math-value">{transformerCapacityKW} kW</span>
          </div>
          <span className="math-operator">−</span>
          <div className="math-cell">
            <span className="math-label">Net Grid Draw</span>
            <span className="math-value">{netUtilityGridImportKW} kW</span>
          </div>
          <span className="math-operator">=</span>
          <div className="math-cell result-cell headroom-cell">
            <span className="math-label">Available Headroom</span>
            <span className="math-value" style={{ color: headroomColor }}>{transformerHeadroomKW} kW</span>
          </div>
        </div>
      </div>

      {/* Real-time Substation Gauge & Telemetry Chart Dual Deck */}
      <div className="live-load-deck">
        <TransformerGauge gridMetrics={gridMetrics} />
        <TelemetryChart
          telemetryHistory={telemetryHistory}
          currentGridLimit={transformerCapacityKW}
        />
      </div>
    </div>
  );
}
