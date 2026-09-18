import React, { useState, useEffect } from 'react';
import { Zap, Sun, Moon, Plus, RotateCcw, Play, Pause, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'grid-flow', label: 'Grid Flow' },
  { id: 'live-load', label: 'Live Load' },
  { id: 'ev-bays', label: 'EV Bays' },
  { id: 'ai-insights', label: 'AI Insights' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'impact', label: 'Impact' }
];

export function Header({
  gridConfig,
  setGridConfig,
  gridMetrics,
  activeSection,
  onNavigate,
  onOpenAddModal,
  onReset
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { timeOfDayHours, simulationSpeed, isPaused } = gridConfig;

  // Track scroll position for subtle elevation shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format hours into clock: e.g. 13.5 -> "13:30"
  const totalMinutes = Math.round(timeOfDayHours * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const isDaytime = hours >= 6 && hours <= 19;

  // Status badge logic
  let statusPillClass = '';
  let statusText = 'System Online';
  if (gridMetrics.transformerLoadPercent >= 92) {
    statusPillClass = 'danger';
    statusText = 'Load Shedding Active';
  } else if (gridMetrics.transformerLoadPercent >= 80) {
    statusPillClass = 'warn';
    statusText = 'Peak Grid Demand';
  }

  const handleNavClick = (id) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`voltara-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        {/* Brand Link */}
        <div className="brand-link" onClick={() => handleNavClick('overview')}>
          <div className="brand-symbol">
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <div className="brand-name">
            Voltara
            <span className="brand-badge">Microgrid</span>
          </div>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="header-nav" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Status Indicator */}
          <div className={`status-indicator-pill ${statusPillClass}`}>
            <span className="status-dot-pulse" />
            <span>{statusText}</span>
          </div>

          {/* Simulation Clock */}
          <div className="time-control-box" style={{ background: 'var(--surface-subtle)', color: 'var(--dark)' }}>
            {isDaytime ? (
              <Sun size={15} color="var(--primary)" />
            ) : (
              <Moon size={15} color="var(--electric)" />
            )}
            <span style={{ fontWeight: 700 }}>{timeFormatted}</span>
          </div>

          {/* Speed Controls */}
          <div className="speed-btn-group">
            <button
              className={`speed-btn ${isPaused ? 'active' : ''}`}
              onClick={() => setGridConfig(prev => ({ ...prev, isPaused: !prev.isPaused }))}
              title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            >
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
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

          {/* Primary Action Button: Connect EV */}
          <button className="btn btn-primary" onClick={onOpenAddModal} title="Connect new vehicle">
            <Plus size={15} strokeWidth={2.5} />
            <span>Get Started</span>
          </button>

          {/* Reset Action */}
          <button
            className="btn btn-secondary"
            onClick={onReset}
            title="Reset simulation parameters"
            style={{ padding: '8px 10px' }}
          >
            <RotateCcw size={14} />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: 'var(--header-height)',
          left: 0,
          right: 0,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 99
        }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 14px' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
