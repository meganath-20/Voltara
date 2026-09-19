import React from 'react';
import { ShieldAlert, CheckCircle, XCircle, Sparkles, UserCheck, Clock, Zap } from 'lucide-react';

export function ChargePactModal({ activePactProposal, onAccept, onDecline }) {
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
    <div className="voltara-modal-overlay pact-modal-overlay">
      <div className="voltara-modal-content pact-modal-content">
        <div className="pact-modal-header">
          <div className="pact-header-icon-wrap">
            <ShieldAlert size={24} color="var(--warning)" />
          </div>
          <div>
            <h3 className="pact-title">Charge Pact Required Approval</h3>
            <span className="pact-subtitle">Automated Grid Headroom Protection Protocol</span>
          </div>
        </div>
        
        <div className="pact-modal-body">
          {/* Deficit Alert Banner */}
          <div className="pact-shortage-alert">
            <div className="alert-badge-icon">
              <Zap size={16} />
            </div>
            <div className="alert-text-group">
              <div className="alert-title">Grid Shortage Detected: {shortageKW} kW</div>
              <div className="alert-sub">Cluster demand currently exceeds transformer headroom ceiling.</div>
            </div>
          </div>

          {/* Core Proposal Details Card */}
          <div className="pact-details-card">
            <div className="pact-detail-item">
              <span className="pact-label">Selected Driver</span>
              <span className="pact-val-highlight">{owner} <span className="model-sub">({model})</span></span>
            </div>

            <div className="pact-detail-item">
              <span className="pact-label">Proposed Schedule Adjustment</span>
              <span className="pact-val-badge">
                <Clock size={13} />
                <span>+{suggestedDepartureAddMins} minutes departure delay</span>
              </span>
            </div>

            <div className="pact-detail-item column">
              <span className="pact-label">Algorithmic Resolution Rationale</span>
              <p className="pact-reason-note">
                Absorbs the {shortageKW} kW grid deficit by extending charging window, guaranteeing all other active EVs meet their departure targets without peak overload.
              </p>
            </div>
          </div>

          {/* Fairness Memory Context */}
          <div className="pact-reward-box">
            <div className="reward-header-row">
              <UserCheck size={15} color="var(--primary)" />
              <span className="reward-title">Fairness History Context</span>
            </div>
            <div className="reward-summary">
              Prior compromises: <strong>{previousBurden?.compromiseCount || 0}</strong> ({previousBurden?.totalWaitingMinutes || 0} min total wait) • Severity: <strong style={{ color: previousBurden?.totalSeverity === 'High' ? 'var(--danger)' : previousBurden?.totalSeverity === 'Medium' ? 'var(--warning)' : 'var(--primary)' }}>{previousBurden?.totalSeverity || 'Low'}</strong>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pact-modal-actions">
          <button 
            className="btn-pact-decline"
            onClick={onDecline}
            title="Decline proposal and evaluate next candidate"
          >
            <XCircle size={16} />
            <span>REJECT (Next EV)</span>
          </button>
          <button 
            className="btn-pact-accept"
            onClick={() => onAccept(evId, suggestedDepartureAddMins)}
            title="Authorize schedule adjustment and record fairness credit"
          >
            <CheckCircle size={16} />
            <span>ACCEPT PROPOSAL</span>
          </button>
        </div>
      </div>
    </div>
  );
}
