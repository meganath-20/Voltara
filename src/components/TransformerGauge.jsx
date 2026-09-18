import React from 'react';
import { ShieldCheck, AlertTriangle, Activity } from 'lucide-react';

export function TransformerGauge({ gridMetrics }) {
  const {
    transformerLoadPercent,
    transformerCapacityKW,
    netUtilityGridImportKW,
    transformerHeadroomKW,
    isOverloadImminent
  } = gridMetrics;

  // Arc math: 220 degree arc from 160 deg to 380 deg
  const radius = 80;
  const strokeWidth = 14;
  const normalizedPercent = Math.min(100, Math.max(0, transformerLoadPercent));
  const circumference = 2 * Math.PI * radius * (240 / 360);
  const strokeDashoffset = circumference - (normalizedPercent / 100) * circumference;

  let gaugeColor = '#087F5B';
  if (transformerLoadPercent >= 92) {
    gaugeColor = '#E05252';
  } else if (transformerLoadPercent >= 80) {
    gaugeColor = '#E9A23B';
  } else if (transformerLoadPercent >= 60) {
    gaugeColor = '#1597E5';
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="section-header">
        <h2 className="section-title">
          <Activity size={20} color={gaugeColor} />
          Substation Transformer Load & Safety Margin
        </h2>
        <span className="section-badge font-mono">
          {transformerCapacityKW} kW Rating
        </span>
      </div>

      <div className="gauge-container">
        <svg width="220" height="170" viewBox="0 0 220 170">
          <defs>
            <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 35 145 A 80 80 0 1 1 185 145"
            fill="none"
            stroke="rgba(16, 42, 42, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Meter Arc */}
          <path
            d="M 35 145 A 80 80 0 1 1 185 145"
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#gauge-glow)"
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s'
            }}
          />

          {/* Threshold markers */}
          <circle cx="158" cy="45" r="3" fill="#E9A23B" title="80% Warning Threshold" />
          <circle cx="178" cy="75" r="3" fill="#E05252" title="92% Overload Shedding Threshold" />
        </svg>

        {/* Center Readout */}
        <div className="gauge-center-text">
          <div className="gauge-percent" style={{ color: gaugeColor }}>
            {transformerLoadPercent}%
          </div>
          <div className="gauge-label">
            {isOverloadImminent ? 'Critical Shedding' : 'Capacity Utilized'}
          </div>
        </div>
      </div>

      {/* Numerical Metrics Below Gauge */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        background: 'var(--surface-subtle)',
        padding: '12px 14px',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
            Grid Load Draw
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--dark)' }}>
            {netUtilityGridImportKW} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kW</span>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
            Available Headroom
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: gaugeColor }}>
            {transformerHeadroomKW} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kW</span>
          </span>
        </div>
      </div>

      {/* Safety Status Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '10px',
        background: isOverloadImminent ? 'rgba(224, 82, 82, 0.08)' : 'rgba(8, 127, 91, 0.08)',
        border: `1px solid ${isOverloadImminent ? 'rgba(224, 82, 82, 0.25)' : 'rgba(8, 127, 91, 0.2)'}`,
        fontSize: '0.8rem'
      }}>
        {isOverloadImminent ? (
          <>
            <AlertTriangle size={18} color="#E05252" />
            <span style={{ color: '#E05252', fontWeight: 600 }}>
              Peak Shaving Active: Auto-throttling non-urgent EVs to guarantee grid safety.
            </span>
          </>
        ) : (
          <>
            <ShieldCheck size={18} color="#087F5B" />
            <span style={{ color: '#087F5B', fontWeight: 600 }}>
              Operating within thermal threshold. Zero transformer overload risk.
            </span>
          </>
        )}
      </div>
    </div>
  );
}
