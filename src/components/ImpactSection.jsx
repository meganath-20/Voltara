import React from 'react';
import { Leaf, ShieldCheck, Zap, Sun, Award, TrendingUp } from 'lucide-react';

export function ImpactSection({ stats, gridMetrics }) {
  return (
    <div className="impact-grid">
      {/* 1. CO2 Avoided */}
      <div className="impact-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Environmental Offset
          </span>
          <div className="icon-box" style={{ background: 'rgba(8, 127, 91, 0.1)', color: 'var(--primary)' }}>
            <Leaf size={22} />
          </div>
        </div>
        <div>
          <div className="impact-stat-number" style={{ color: 'var(--primary)' }}>
            {stats.co2AvoidedKg} <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>kg</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Net CO₂ emissions avoided via rooftop solar priority routing.
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          Equivalent to {(stats.co2AvoidedKg * 0.045).toFixed(1)} mature tree-years planted
        </div>
      </div>

      {/* 2. Overload Incidents Prevented */}
      <div className="impact-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Grid Resilience
          </span>
          <div className="icon-box" style={{ background: 'rgba(21, 151, 229, 0.1)', color: 'var(--electric)' }}>
            <ShieldCheck size={22} />
          </div>
        </div>
        <div>
          <div className="impact-stat-number" style={{ color: 'var(--electric)' }}>
            {stats.overloadIncidentsPrevented}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Thermal overload incidents automatically shielded via peak shaving.
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          100% substation transformer uptime preserved
        </div>
      </div>

      {/* 3. Clean Energy Charged */}
      <div className="impact-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Clean EV Delivery
          </span>
          <div className="icon-box" style={{ background: 'rgba(18, 184, 134, 0.1)', color: 'var(--secondary)' }}>
            <Sun size={22} />
          </div>
        </div>
        <div>
          <div className="impact-stat-number" style={{ color: 'var(--secondary)' }}>
            {stats.cleanEnergyChargedKWh} <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>kWh</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Zero-emission energy directly channeled into EV batteries.
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          {gridMetrics.renewableEVSharePercent}% of current charging demand supplied by solar
        </div>
      </div>

      {/* 4. Total Energy Delivered */}
      <div className="impact-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Total Throughput
          </span>
          <div className="icon-box" style={{ background: 'rgba(16, 42, 42, 0.08)', color: 'var(--dark)' }}>
            <Zap size={22} />
          </div>
        </div>
        <div>
          <div className="impact-stat-number">
            {stats.totalEnergyDeliveredKWh} <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>kWh</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total cluster energy dispensed across all active EV charging bays.
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          {gridMetrics.cleanEnergySelfConsumptionPercent}% local solar generation self-consumed
        </div>
      </div>
    </div>
  );
}
