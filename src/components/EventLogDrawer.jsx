import React from 'react';
import { Terminal, ShieldAlert, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

export function EventLogDrawer({ eventLogs }) {
  return (
    <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="section-header">
        <h2 className="section-title">
          <Terminal size={18} color="#38bdf8" />
          Autonomous Load Balancer Decision & Event Telemetry
        </h2>
        <span className="section-badge font-mono">
          {eventLogs.length} Events Logged
        </span>
      </div>

      <div className="event-logs-container">
        {eventLogs.map((log) => (
          <div key={log.id} className={`log-entry ${log.type}`}>
            <span className="log-time">{log.timestamp}</span>
            <span className="log-text">
              {log.type === 'SHED' && <strong style={{ color: '#f43f5e' }}>[LOAD SHED] </strong>}
              {log.type === 'BOOST' && <strong style={{ color: '#00f59b' }}>[CLEAN BOOST] </strong>}
              {log.type === 'WARN' && <strong style={{ color: '#f59e0b' }}>[GRID ALERT] </strong>}
              {log.type === 'COMPLETE' && <strong style={{ color: '#a855f7' }}>[COMPLETED] </strong>}
              {log.type === 'INFO' && <strong style={{ color: '#38bdf8' }}>[OPTIMIZER] </strong>}
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
