import React from 'react';
import { 
  ArrowRight, 
  Zap, 
  Sun, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  BatteryCharging,
  Gauge
} from 'lucide-react';

export function HeroSection({ vehicles, gridMetrics, onExploreClick }) {
  // Find currently charging vehicle with highest power draw, or first active vehicle
  const activeChargingEV = vehicles.find(v => (v.currentAllocatedPower || 0) > 0 && v.status !== 'PAUSED') || null;
  const anyCharging = !!activeChargingEV;

  const solarKW = gridMetrics?.solarGenerationKW ?? 0;
  const headroomKW = gridMetrics?.transformerHeadroomKW ?? 0;
  const totalEVLoad = gridMetrics?.totalEVChargingKW ?? 0;
  const loadPercent = gridMetrics?.transformerLoadPercent ?? 0;

  return (
    <div className="hero-container">
      {/* LEFT COLUMN: Brand Messaging, Headline & Action */}
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-badge-icon" />
          <span>Smart EV Charging & Localized Grid Management</span>
        </div>

        <h1 className="hero-headline">
          Charge Smarter
          <span className="hero-headline-gradient">For A Greener Tomorrow.</span>
        </h1>

        <p className="hero-description">
          Voltara intelligently coordinates EV charging with local grid capacity, renewable energy, 
          building demand, and vehicle priorities — keeping charging efficient, reliable, and grid-aware.
        </p>

        <div className="hero-cta-group">
          <button 
            className="btn btn-primary hero-btn"
            onClick={onExploreClick}
            aria-label="Explore Charging Flow"
          >
            <span>Explore Charging</span>
            <ArrowRight size={17} strokeWidth={2.5} />
          </button>

          <div className="hero-status-tag">
            <span className="status-live-dot" />
            <span>
              {anyCharging ? `${vehicles.filter(v => (v.currentAllocatedPower || 0) > 0).length} Bays Active` : 'Grid Standby'}
              {' • '}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{totalEVLoad} kW Flowing</span>
            </span>
          </div>
        </div>

        {/* Secondary Info Pillars */}
        <div className="hero-stats-strip">
          <div className="hero-stat-item">
            <div className="stat-icon-wrap" style={{ background: 'rgba(8, 127, 91, 0.1)', color: 'var(--primary)' }}>
              <Sun size={18} />
            </div>
            <div>
              <div className="stat-number">{solarKW} <span className="stat-unit">kW</span></div>
              <div className="stat-label">Solar Generation</div>
            </div>
          </div>

          <div className="hero-stat-item">
            <div className="stat-icon-wrap" style={{ background: 'rgba(21, 151, 229, 0.1)', color: 'var(--electric)' }}>
              <Gauge size={18} />
            </div>
            <div>
              <div className="stat-number">{headroomKW} <span className="stat-unit">kW</span></div>
              <div className="stat-label">Grid Headroom</div>
            </div>
          </div>

          <div className="hero-stat-item">
            <div className="stat-icon-wrap" style={{ background: 'rgba(18, 184, 134, 0.1)', color: 'var(--secondary)' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Overload Safe</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Premium Realistic EV Showcase & Live Floating Telemetry */}
      <div className="hero-visual-col">
        <div className="hero-visual-card">
          {/* Ambient Lighting Gradients */}
          <div className="visual-ambient-glow" />

          {/* High-Resolution Realistic Centerpiece EV Visual */}
          <div className="hero-image-stage">
            <img 
              src="/assets/hero-ev.jpg" 
              alt="Voltara Smart Electric Vehicle Charging at Next-Gen Solar Substation" 
              className="hero-centerpiece-img"
              loading="eager"
            />
            {/* Cinematic Gradient Overlays to Blend Seamlessly */}
            <div className="hero-img-overlay-bottom" />
            <div className="hero-img-overlay-side" />
            
            {/* Pulsing Energy Cable Glow Accent */}
            <div className="hero-cable-beacon-glow" title="Active Dynamic Power Line" />
          </div>

          {/* FLOATING CARD 1 (Top Left): Live Active Charging Status */}
          <div className="hero-floating-card card-charge-status">
            <div className="floating-card-header">
              <span className={`live-pulse-indicator ${anyCharging ? 'active' : ''}`} />
              <span className="floating-card-tag">
                {anyCharging ? 'CHARGING NOW' : 'DISPATCH STANDBY'}
              </span>
            </div>

            <div className="floating-card-body">
              <div className="floating-card-title">
                {anyCharging ? `${activeChargingEV.model}` : 'Grid Fleet Standby'}
              </div>
              <div className="floating-card-sub">
                {anyCharging ? `Bay 0${activeChargingEV.bay} • ${activeChargingEV.priorityMode} Priority` : 'Awaiting EV connection'}
              </div>

              {anyCharging ? (
                <div className="floating-power-row">
                  <span className="power-kw-big">{activeChargingEV.currentAllocatedPower}</span>
                  <span className="power-unit-label">kW Active</span>
                  <span className="power-amps-tag">{activeChargingEV.allocatedAmps} A</span>
                </div>
              ) : (
                <div className="floating-power-row standby">
                  <span className="power-kw-big">0.0</span>
                  <span className="power-unit-label">kW Standby</span>
                </div>
              )}

              {anyCharging && (
                <div className="floating-soc-progress">
                  <div className="soc-label-row">
                    <span>Battery {activeChargingEV.currentSoC}%</span>
                    <span>Target {activeChargingEV.targetSoC}%</span>
                  </div>
                  <div className="soc-track-mini">
                    <div 
                      className="soc-fill-mini" 
                      style={{ width: `${Math.min(100, activeChargingEV.currentSoC)}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FLOATING CARD 2 (Bottom Right): Live Energy Flow Headroom */}
          <div className="hero-floating-card card-energy-status">
            <div className="floating-card-header">
              <Activity size={14} color="var(--primary)" />
              <span className="floating-card-tag">LIVE GRID BALANCE</span>
            </div>

            <div className="floating-metrics-mini-grid">
              <div className="mini-metric-col">
                <span className="mini-label">Rooftop Solar</span>
                <span className="mini-val" style={{ color: 'var(--primary)' }}>
                  {solarKW} <span style={{ fontSize: '0.68rem' }}>kW</span>
                </span>
              </div>
              <div className="mini-metric-col">
                <span className="mini-label">Transformer Cap</span>
                <span className="mini-val" style={{ color: loadPercent >= 85 ? 'var(--warning)' : 'var(--electric)' }}>
                  {headroomKW} <span style={{ fontSize: '0.68rem' }}>kW Left</span>
                </span>
              </div>
            </div>

            <div className="floating-card-footer">
              <div className="pill-protected">
                <ShieldCheck size={13} />
                <span>Zero Overload Safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
