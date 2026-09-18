import React from 'react';
import { Activity, ShieldCheck, Clock, CheckCircle2, Zap } from 'lucide-react';
import { getFairnessHistory } from '../hooks/useGridSimulation';

export function SmartMetricsDashboard({ gridMetrics, vehicles }) {
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

      <div className="metrics-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
        
        {/* WATTWISE PANEL */}
        <div className="dashboard-panel" style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Zap color="var(--electric)" />
            <h3 style={{ margin: 0, color: 'var(--text)' }}>WattWise Efficiency</h3>
          </div>
          
          <div className="wattwise-flow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Grid Energy</div>
              <div style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: 'bold' }}>{totalEVChargingKW.toFixed(2)} kW</div>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Useful Energy</div>
              <div style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>{totalUsefulEnergyKW.toFixed(2)} kW</div>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>+</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Losses</div>
              <div style={{ fontSize: '1.2rem', color: 'var(--warning)', fontWeight: 'bold' }}>{totalWastedEnergyKW.toFixed(2)} kW</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Baseline Loss (Est)</div>
              <div style={{ fontWeight: '500' }}>{baselineWasted.toFixed(2)} kW</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>WattWise Savings</div>
              <div style={{ fontWeight: '500', color: 'var(--primary)' }}>{wattWiseSaved} kW avoided</div>
            </div>
          </div>
        </div>

        {/* FAIRNESS MEMORY PANEL */}
        <div className="dashboard-panel" style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck color="var(--primary)" />
              <h3 style={{ margin: 0, color: 'var(--text)' }}>Fairness Memory</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {drivers.map((driver, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontWeight: '500' }}>{driver.name}</div>
                <div style={{ display: 'flex', gap: '24px', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compromises</div>
                    <div style={{ fontWeight: 'bold' }}>{driver.history.compromiseCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wait Time</div>
                    <div style={{ fontWeight: 'bold' }}>{driver.history.totalWaitingMinutes}m</div>
                  </div>
                  <div style={{ minWidth: '60px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Burden</div>
                    <div style={{ fontWeight: 'bold', color: driver.history.totalSeverity === 'High' ? 'var(--danger)' : driver.history.totalSeverity === 'Medium' ? 'var(--warning)' : 'var(--primary)' }}>
                      {driver.history.totalSeverity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
