import React from 'react';
import { 
  BatteryCharging, 
  Clock, 
  Zap, 
  Pause, 
  Play, 
  X, 
  Sparkles, 
  AlertCircle,
  CheckCircle2 
} from 'lucide-react';

export function ChargingBayCard({
  vehicle,
  onUpdatePriority,
  onTogglePause,
  onRemoveVehicle
}) {
  const {
    id,
    bay,
    owner,
    model,
    batteryCapacity,
    currentSoC,
    targetSoC,
    departureMinutesLeft,
    maxPower,
    currentAllocatedPower = 0,
    allocatedAmps = 0,
    priorityMode,
    status,
    urgencyLevel = 'MODERATE',
    urgencyScore = 1.0,
    energyDeliveredKWh = 0,
    isOverloadShedded = false
  } = vehicle;

  // Format departure minutes: e.g. 75 -> "1h 15m"
  const hoursLeft = Math.floor(departureMinutesLeft / 60);
  const minsLeft = departureMinutesLeft % 60;
  const departureStr = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`;

  const isCharging = status === 'CHARGING' || status === 'MODULATED';
  const isCompleted = status === 'COMPLETED' || currentSoC >= targetSoC;
  const isPaused = status === 'PAUSED';
  const isThrottled = status === 'THROTTLED';

  // Badge styling based on urgency
  let urgencyBadgeColor = '#38bdf8';
  let urgencyBg = 'rgba(56, 189, 248, 0.12)';
  if (isCompleted) {
    urgencyBadgeColor = '#00f59b';
    urgencyBg = 'rgba(0, 245, 155, 0.15)';
  } else if (urgencyLevel === 'CRITICAL') {
    urgencyBadgeColor = '#f43f5e';
    urgencyBg = 'rgba(244, 63, 94, 0.18)';
  } else if (urgencyLevel === 'HIGH') {
    urgencyBadgeColor = '#f59e0b';
    urgencyBg = 'rgba(245, 158, 11, 0.15)';
  }

  return (
    <div className={`bay-card ${urgencyLevel === 'CRITICAL' && !isCompleted ? 'critical-urgency' : ''} ${isCompleted ? 'completed' : ''}`}>
      {/* Top Header */}
      <div className="bay-card-top">
        <div className="vehicle-info">
          <div className="vehicle-avatar">
            {isCompleted ? '✅' : (model.includes('Truck') || model.includes('Rivian') || model.includes('Ford') ? '🛻' : (model.includes('Porsche') || model.includes('BMW') ? '🏎️' : '🚙'))}
          </div>
          <div>
            <div className="vehicle-title">{model}</div>
            <div className="vehicle-owner">{owner}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="bay-badge">
            BAY {String(bay).padStart(2, '0')}
          </span>
          <button
            onClick={() => onRemoveVehicle(id)}
            className="speed-btn"
            title="Disconnect EV from Bay"
            style={{ padding: '3px 6px', color: '#94a3b8' }}
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Battery State of Charge Bar */}
      <div className="battery-bar-container">
        <div className="battery-metrics-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BatteryCharging size={14} color={isCompleted ? '#00f59b' : '#38bdf8'} />
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {currentSoC}%
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              → Target {targetSoC}%
            </span>
          </div>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            {((currentSoC / 100) * batteryCapacity).toFixed(1)} / {batteryCapacity} kWh
          </span>
        </div>

        <div className="battery-track">
          {/* Target marker */}
          <div
            style={{
              position: 'absolute',
              left: `${targetSoC}%`,
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'rgba(255,255,255,0.4)',
              zIndex: 3
            }}
            title={`Target: ${targetSoC}%`}
          />
          {/* Battery fill */}
          <div
            className={`battery-fill ${isCharging ? 'charging' : ''}`}
            style={{
              width: `${Math.min(100, currentSoC)}%`,
              background: isCompleted 
                ? 'linear-gradient(90deg, #10b981, #00f59b)' 
                : (urgencyLevel === 'CRITICAL' ? 'linear-gradient(90deg, #f43f5e, #fb7185)' : 'linear-gradient(90deg, #0284c7, #38bdf8)')
            }}
          />
        </div>
      </div>

      {/* Operational Specs (Power, Departure, Urgency) */}
      <div className="bay-specs-grid">
        <div className="spec-item">
          <span className="spec-label">Charge Rate</span>
          <span className="spec-val" style={{ color: isCharging ? '#38bdf8' : 'var(--text-muted)' }}>
            {currentAllocatedPower} <span style={{ fontSize: '0.7rem' }}>kW</span>
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            {allocatedAmps} A @ 230V
          </span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Departure In</span>
          <span className="spec-val" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: departureMinutesLeft < 60 ? '#f43f5e' : 'var(--text-main)' }}>
            <Clock size={12} />
            {departureStr}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            Max {maxPower} kW Cap
          </span>
        </div>

        <div className="spec-item">
          <span className="spec-label">Priority Status</span>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: urgencyBg,
            color: urgencyBadgeColor,
            padding: '2px 6px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            marginTop: '2px'
          }}>
            {isCompleted ? 'COMPLETED' : urgencyLevel}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            Delivered: {energyDeliveredKWh} kWh
          </span>
        </div>
      </div>

      {/* Overload Throttled Banner */}
      {isThrottled && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '8px',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          fontSize: '0.72rem',
          color: '#f43f5e'
        }}>
          <AlertCircle size={14} />
          <span>Throttled for peak grid safety. Will auto-resume as headroom opens.</span>
        </div>
      )}

      {/* Bay Controls */}
      <div className="bay-controls-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Mode:</span>
          <select
            className="mode-select"
            value={priorityMode}
            onChange={(e) => onUpdatePriority(id, e.target.value)}
            disabled={isCompleted}
          >
            <option value="AUTO">Smart Balanced</option>
            <option value="EXPRESS">Express (High Priority)</option>
            <option value="ECO_SOLAR">Eco Clean (Solar Only)</option>
          </select>
        </div>

        <button
          onClick={() => onTogglePause(id)}
          className={`speed-btn ${isPaused ? 'active' : ''}`}
          style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
          disabled={isCompleted}
          title={isPaused ? 'Resume Charging' : 'Pause Charging'}
        >
          {isPaused ? <Play size={12} /> : <Pause size={12} />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>
    </div>
  );
}
