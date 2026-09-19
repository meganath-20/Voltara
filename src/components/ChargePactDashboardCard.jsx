import React from 'react';
import { ShieldAlert, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

export function ChargePactDashboardCard({ activePactProposal, onAccept, onDecline }) {
  if (!activePactProposal) return null;

  const {
    evId,
    owner,
    model,
    shortageKW,
    suggestedDepartureAddMins,
    previousBurden
  } = activePactProposal;

  return (
    <div className="charge-pact-dashboard-banner" style={{
      background: 'linear-gradient(135deg, rgba(233, 162, 59, 0.14) 0%, rgba(224, 82, 82, 0.1) 100%)',
      border: '2px solid var(--warning)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 28px',
      margin: '16px 0',
      boxShadow: '0 8px 30px rgba(233, 162, 59, 0.18)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        {/* Left Column: Shortage & Driver Context */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="snapshot-badge" style={{ background: 'rgba(233, 162, 59, 0.25)', color: 'var(--dark)', borderColor: 'var(--warning)', fontWeight: 700 }}>
              <Zap size={14} color="var(--warning)" />
              <span>⚡ CHARGE PACT REQUEST</span>
            </span>
            <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', background: 'rgba(224, 82, 82, 0.15)', padding: '2px 10px', borderRadius: '12px' }}>
              GRID SHORTAGE: {shortageKW} kW
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>
            Grid Capacity Shortage Detected
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '4px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Candidate Driver</span>
              <strong style={{ fontSize: '0.95rem', color: 'var(--dark)' }}>{owner}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block' }}>{model}</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Smallest Feasible Delay</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem' }} className="font-mono">
                <Clock size={15} />
                <span>+{suggestedDepartureAddMins} minutes</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target SoC guaranteed</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Fairness Burden History</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--dark)', fontWeight: 600 }}>
                {previousBurden?.compromiseCount || 0} pacts ({previousBurden?.totalWaitingMinutes || 0}m wait)
              </span>
              <span style={{ fontSize: '0.75rem', color: previousBurden?.totalSeverity === 'High' ? 'var(--danger)' : 'var(--primary)', fontWeight: 700, display: 'block' }}>
                Severity: {previousBurden?.totalSeverity || 'Low'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', minWidth: '200px' }}>
          <button
            onClick={() => onAccept(evId, suggestedDepartureAddMins)}
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 700,
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <CheckCircle size={18} />
            <span>ACCEPT PROPOSAL</span>
          </button>

          <button
            onClick={onDecline}
            className="btn btn-secondary"
            style={{
              padding: '10px 20px',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--dark)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: '1px solid var(--border)'
            }}
          >
            <XCircle size={16} color="var(--danger)" />
            <span>REJECT (Next Driver)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
