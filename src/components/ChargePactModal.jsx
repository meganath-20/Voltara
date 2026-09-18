import React from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

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
          <ShieldAlert size={28} color="var(--warning)" />
          <h3>Charge Pact Proposal</h3>
        </div>
        
        <div className="pact-modal-body">
          <div className="pact-shortage-alert">
            <strong>Grid Shortage: </strong> {shortageKW} kW
          </div>

          <div className="pact-details">
            <div className="pact-detail-item">
              <span>Driver:</span>
              <strong>{owner} ({model})</strong>
            </div>
            <div className="pact-detail-item">
              <span>Required change:</span>
              <strong style={{ color: 'var(--warning)' }}>+{suggestedDepartureAddMins} minutes delay</strong>
            </div>
            <div className="pact-detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
              <span>Reason:</span>
              <strong style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                This resolves the {shortageKW} kW shortage while preserving all other vehicle deadlines in the cluster.
              </strong>
            </div>
          </div>

          <div className="pact-reward">
            <span>Previous compromise burden:</span><br/>
            <strong>
              {previousBurden?.compromiseCount || 0} compromises ({previousBurden?.totalWaitingMinutes || 0} min)
            </strong>
          </div>
        </div>

        <div className="pact-modal-actions">
          <button 
            className="btn-pact-decline"
            onClick={onDecline}
          >
            <XCircle size={16} /> REJECT
          </button>
          <button 
            className="btn-pact-accept"
            onClick={() => onAccept(evId, suggestedDepartureAddMins)}
          >
            <CheckCircle size={16} /> ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
}
