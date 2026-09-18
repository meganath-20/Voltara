import React from 'react';
import { 
  BatteryCharging, 
  Clock, 
  Zap, 
  Pause, 
  Play, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Sun, 
  Sliders, 
  Activity, 
  Sparkles,
  Info
} from 'lucide-react';

/**
 * Derives the dynamic smart charging status and clear rationale
 * purely from existing simulation properties without altering algorithm logic.
 */
function getSmartChargingStatus(vehicle, gridMetrics) {
  const {
    status,
    currentSoC,
    targetSoC,
    currentAllocatedPower = 0,
    priorityMode,
    urgencyLevel = 'MODERATE',
    isOverloadShedded = false
  } = vehicle;

  const isCompleted = status === 'COMPLETED' || currentSoC >= targetSoC;
  const isPaused = status === 'PAUSED';
  const isThrottled = status === 'THROTTLED' || (!isCompleted && !isPaused && currentAllocatedPower === 0);
  const isModulated = status === 'MODULATED';
  const isCharging = currentAllocatedPower > 0;

  if (isCompleted) {
    return {
      type: 'completed',
      label: 'Target SoC Reached',
      shortBadge: 'Ready',
      reason: 'Target battery state achieved. Holding in standby.',
      themeColor: 'var(--primary)',
      badgeBg: 'rgba(8, 127, 91, 0.1)',
      borderColor: 'rgba(8, 127, 91, 0.25)',
      icon: CheckCircle2
    };
  }

  if (isPaused) {
    return {
      type: 'paused',
      label: 'Manually Paused',
      shortBadge: 'Paused',
      reason: 'Charging temporarily suspended by operator.',
      themeColor: 'var(--text-muted)',
      badgeBg: 'rgba(83, 107, 105, 0.12)',
      borderColor: 'rgba(83, 107, 105, 0.25)',
      icon: Pause
    };
  }

  if (isThrottled || isOverloadShedded) {
    return {
      type: 'throttled',
      label: 'Grid Constrained (Waiting)',
      shortBadge: 'Waiting',
      reason: 'Power suspended to prevent transformer peak overload. Auto-resumes as headroom frees.',
      themeColor: 'var(--danger)',
      badgeBg: 'rgba(224, 82, 82, 0.12)',
      borderColor: 'rgba(224, 82, 82, 0.3)',
      icon: AlertTriangle
    };
  }

  if (priorityMode === 'EXPRESS' || urgencyLevel === 'CRITICAL') {
    return {
      type: 'priority',
      label: 'Priority Charging',
      shortBadge: urgencyLevel === 'CRITICAL' ? 'Urgent' : 'Express',
      reason: urgencyLevel === 'CRITICAL'
        ? 'Imminent departure deadline. Top priority power allocation.'
        : 'Express priority scheduling active. Allocated maximum available current.',
      themeColor: '#D9480F',
      badgeBg: 'rgba(217, 72, 15, 0.12)',
      borderColor: 'rgba(217, 72, 15, 0.28)',
      icon: Zap
    };
  }

  if (priorityMode === 'ECO_SOLAR') {
    return {
      type: 'solar',
      label: 'Solar-Assisted',
      shortBadge: 'Eco Solar',
      reason: 'Modulating rate to match real-time rooftop solar generation surplus.',
      themeColor: 'var(--primary)',
      badgeBg: 'rgba(8, 127, 91, 0.12)',
      borderColor: 'rgba(8, 127, 91, 0.25)',
      icon: Sun
    };
  }

  if (isModulated) {
    return {
      type: 'modulated',
      label: 'Grid Constrained',
      shortBadge: 'Optimized Rate',
      reason: 'Output dynamically modulated to balance facility HVAC & EV cluster demand.',
      themeColor: 'var(--warning)',
      badgeBg: 'rgba(233, 162, 59, 0.14)',
      borderColor: 'rgba(233, 162, 59, 0.32)',
      icon: Sliders
    };
  }

  // Standard Smart Balanced
  const renewableShare = gridMetrics?.renewableEVSharePercent || 0;
  if (renewableShare > 50) {
    return {
      type: 'optimized-solar',
      label: 'Solar-Assisted (Optimized)',
      shortBadge: 'Solar Boost',
      reason: 'Water-filling allocation prioritizing clean rooftop PV energy.',
      themeColor: 'var(--electric)',
      badgeBg: 'rgba(21, 151, 229, 0.12)',
      borderColor: 'rgba(21, 151, 229, 0.28)',
      icon: Sparkles
    };
  }

  return {
    type: 'optimized',
    label: 'Optimized (Fair Share)',
    shortBadge: 'Optimized',
    reason: 'Dynamic water-filling algorithm balancing battery deficit and grid headroom.',
    themeColor: 'var(--electric)',
    badgeBg: 'rgba(21, 151, 229, 0.12)',
    borderColor: 'rgba(21, 151, 229, 0.25)',
    icon: Activity
  };
}

export function ChargingBayCard({
  vehicle,
  gridMetrics,
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
    priorityMode = 'AUTO',
    status,
    urgencyLevel = 'MODERATE',
    energyDeliveredKWh = 0
  } = vehicle;

  // Format departure minutes: e.g. 75 -> "1h 15m"
  const hoursLeft = Math.floor(departureMinutesLeft / 60);
  const minsLeft = departureMinutesLeft % 60;
  const departureStr = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`;

  const isCharging = (currentAllocatedPower || 0) > 0;
  const isCompleted = status === 'COMPLETED' || currentSoC >= targetSoC;
  const isPaused = status === 'PAUSED';
  const isThrottled = status === 'THROTTLED' || (!isCompleted && !isPaused && currentAllocatedPower === 0);

  const smartStatus = getSmartChargingStatus(vehicle, gridMetrics);
  const StatusIcon = smartStatus.icon;

  // Progress towards target calculation
  const progressToTarget = targetSoC > 0 
    ? Math.min(100, Math.round((currentSoC / targetSoC) * 100))
    : 100;

  // Vehicle avatar emoji
  const vehicleEmoji = isCompleted ? '⚡' : (
    model.includes('Truck') || model.includes('Rivian') || model.includes('Ford') ? '🛻' :
    (model.includes('Taycan') || model.includes('BMW') || model.includes('Porsche') ? '🏎️' :
    (model.includes('Tesla') || model.includes('Audi') ? '🚙' : '🚗'))
  );

  return (
    <div className={`ev-bay-card ${isCharging ? 'is-active-charging' : ''} ${isCompleted ? 'is-ready' : ''} ${isThrottled ? 'is-throttled' : ''}`}>
      {/* 1. Header: Avatar, Model, Driver, Bay Tag, Disconnect Button */}
      <div className="ev-bay-card-header">
        <div className="ev-vehicle-profile">
          <div className="ev-avatar-box">
            <span className="ev-avatar-emoji">{vehicleEmoji}</span>
            {isCharging && <span className="ev-charging-beacon" />}
          </div>
          <div className="ev-vehicle-meta">
            <div className="ev-vehicle-model-name" title={model}>
              {model}
            </div>
            <div className="ev-driver-name">{owner}</div>
          </div>
        </div>

        <div className="ev-bay-badge-group">
          <span className="ev-bay-chip font-mono">
            BAY {String(bay).padStart(2, '0')}
          </span>
          <button
            onClick={() => onRemoveVehicle(id)}
            className="ev-icon-btn ev-disconnect-btn"
            title="Disconnect & Release Bay"
            aria-label={`Disconnect ${model}`}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 2. Smart Charging Rationale Status Banner */}
      <div 
        className="ev-smart-status-banner"
        style={{
          background: smartStatus.badgeBg,
          borderColor: smartStatus.borderColor
        }}
      >
        <div className="ev-status-title-row" style={{ color: smartStatus.themeColor }}>
          <StatusIcon size={14} className="ev-status-icon" />
          <span className="ev-status-title-text">{smartStatus.label}</span>
          <span className="ev-status-short-chip">{smartStatus.shortBadge}</span>
        </div>
        <p className="ev-status-reason-text">{smartStatus.reason}</p>
      </div>

      {/* 3. Battery State of Charge & Progress Toward Target */}
      <div className="ev-battery-section">
        <div className="ev-battery-header-row">
          <div className="ev-soc-primary">
            <BatteryCharging 
              size={16} 
              color={isCompleted ? 'var(--primary)' : (isCharging ? 'var(--electric)' : 'var(--text-muted)')} 
            />
            <span className="ev-soc-percent font-mono">{currentSoC}%</span>
            <span className="ev-soc-kwh font-mono">
              ({((currentSoC / 100) * batteryCapacity).toFixed(1)} kWh)
            </span>
          </div>

          <div className="ev-soc-target-tag font-mono">
            <span>Target {targetSoC}%</span>
          </div>
        </div>

        {/* Dual-marker battery track */}
        <div className="ev-battery-track-wrapper">
          <div className="ev-battery-track">
            {/* Target SoC Vertical Pin */}
            <div
              className="ev-target-marker-pin"
              style={{ left: `${Math.min(100, Math.max(0, targetSoC))}%` }}
              title={`Target SoC: ${targetSoC}%`}
            >
              <span className="ev-marker-tooltip font-mono">{targetSoC}%</span>
            </div>

            {/* Current SoC Fill */}
            <div
              className={`ev-battery-fill-bar ${isCharging ? 'animated-charging' : ''}`}
              style={{
                width: `${Math.min(100, currentSoC)}%`,
                background: isCompleted
                  ? 'linear-gradient(90deg, #087F5B 0%, #12B886 100%)'
                  : (urgencyLevel === 'CRITICAL' && !isPaused
                      ? 'linear-gradient(90deg, #D9480F 0%, #E05252 100%)'
                      : 'linear-gradient(90deg, #0C8599 0%, #1597E5 100%)')
              }}
            />
          </div>

          <div className="ev-battery-sub-row">
            <span className="ev-battery-capacity-label">
              Pack: {batteryCapacity} kWh
            </span>
            <span className="ev-progress-metric font-mono">
              {progressToTarget}% to target
            </span>
          </div>
        </div>
      </div>

      {/* 4. Operational Telemetry Grid (Charge Rate, Departure, Session Energy) */}
      <div className="ev-telemetry-grid">
        {/* Metric 1: Real-time Power Output */}
        <div className="ev-metric-cell">
          <span className="ev-metric-label">Charge Rate</span>
          <div className="ev-metric-val-row">
            <span className="ev-metric-number font-mono" style={{ color: isCharging ? 'var(--electric)' : 'var(--text-muted)' }}>
              {currentAllocatedPower}
            </span>
            <span className="ev-metric-unit">kW</span>
          </div>
          <span className="ev-metric-hint font-mono">
            {allocatedAmps} A @ 230V
          </span>
        </div>

        {/* Metric 2: Departure Time Countdown */}
        <div className="ev-metric-cell">
          <span className="ev-metric-label">Departure In</span>
          <div className="ev-metric-val-row" style={{ color: departureMinutesLeft <= 60 && !isCompleted ? 'var(--danger)' : 'var(--dark)' }}>
            <Clock size={13} style={{ marginRight: '2px' }} />
            <span className="ev-metric-number font-mono">{departureStr}</span>
          </div>
          <span className="ev-metric-hint">
            Max {maxPower} kW Cap
          </span>
        </div>

        {/* Metric 3: Delivered Energy & Urgency Score */}
        <div className="ev-metric-cell">
          <span className="ev-metric-label">Delivered</span>
          <div className="ev-metric-val-row">
            <span className="ev-metric-number font-mono">{energyDeliveredKWh}</span>
            <span className="ev-metric-unit">kWh</span>
          </div>
          <span className="ev-metric-hint">
            Priority: <strong style={{ color: smartStatus.themeColor }}>{urgencyLevel}</strong>
          </span>
        </div>
      </div>

      {/* 5. Interactive Vehicle Controls Footer */}
      <div className="ev-card-controls-footer">
        <div className="ev-mode-selector-wrapper">
          <label className="ev-mode-label" htmlFor={`mode-select-${id}`}>Profile:</label>
          <select
            id={`mode-select-${id}`}
            className="ev-mode-dropdown"
            value={priorityMode}
            onChange={(e) => onUpdatePriority(id, e.target.value)}
            disabled={isCompleted}
          >
            <option value="AUTO">Smart Balanced</option>
            <option value="EXPRESS">Express Priority</option>
            <option value="ECO_SOLAR">Eco Clean (Solar)</option>
          </select>
        </div>

        <button
          onClick={() => onTogglePause(id)}
          className={`btn-action-toggle ${isPaused ? 'is-paused' : ''}`}
          disabled={isCompleted}
          title={isPaused ? 'Resume Charging' : 'Pause Charging Session'}
          aria-label={isPaused ? 'Resume Charging' : 'Pause Charging'}
        >
          {isPaused ? <Play size={13} /> : <Pause size={13} />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
      </div>
    </div>
  );
}
