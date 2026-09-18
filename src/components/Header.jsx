import React from 'react';
import { Zap, Sun, Moon, Plus, RotateCcw, Play, Pause, FastForward } from 'lucide-react';

export function Header({
  gridConfig,
  setGridConfig,
  gridMetrics,
  onOpenAddModal,
  onReset
}) {
  const { timeOfDayHours, simulationSpeed, isPaused } = gridConfig;

  // Format hours into 12h or 24h clock: e.g. 13.5 -> "13:30"
  const totalMinutes = Math.round(timeOfDayHours * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const isDaytime = hours >= 6 && hours <= 19;

  // Status badge logic
  let statusType = 'safe';
  let statusText = 'GRID BALANCED';
  if (gridMetrics.transformerLoadPercent >= 92) {
    statusType = 'danger';
    statusText = 'OVERLOAD SHEDDING ACTIVE';
  } else if (gridMetrics.transformerLoadPercent >= 80) {
    statusType = 'warn';
    statusText = 'HIGH PEAK DEMAND';
  }

  return (
    <header className="glass-panel header-wrapper">
      <div className="logo-group">
        <div className="logo-icon">
          <Zap size={26} strokeWidth={2.5} />
        </div>
        <div className="logo-text">
          <h1>
            VoltGrid Pro
            <span className="badge-pro">Smart Microgrid</span>
          </h1>
          <p className="logo-subtitle">
            Autonomous Cluster EV Power Coordination & Localized Grid Balancing
          </p>
        </div>
      </div>

      <div className="header-status-group">
        {/* Status Indicator */}
        <div className={`status-pill ${statusType}`}>
          <span className="status-dot" />
          <span>{statusText}</span>
        </div>

        {/* Live Simulation Clock */}
        <div className="time-control-box">
          {isDaytime ? (
            <Sun size={18} color="#00f59b" />
          ) : (
            <Moon size={18} color="#38bdf8" />
          )}
          <span style={{ fontWeight: 700 }}>{timeFormatted}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            {isDaytime ? 'Solar Active' : 'Off-Peak'}
          </span>
        </div>

        {/* Speed Controls */}
        <div className="speed-btn-group">
          <button
            className={`speed-btn ${isPaused ? 'active' : ''}`}
            onClick={() => setGridConfig(prev => ({ ...prev, isPaused: !prev.isPaused }))}
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          {[1, 5, 10].map(speed => (
            <button
              key={speed}
              className={`speed-btn ${!isPaused && simulationSpeed === speed ? 'active' : ''}`}
              onClick={() => setGridConfig(prev => ({ ...prev, simulationSpeed: speed, isPaused: false }))}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Actions */}
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} strokeWidth={2.5} />
          <span>Connect EV</span>
        </button>

        <button className="btn btn-secondary" onClick={onReset} title="Reset to default optimal state">
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
}
