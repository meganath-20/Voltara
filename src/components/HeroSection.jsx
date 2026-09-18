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

      {/* RIGHT COLUMN: Premium EV, Charger & Clean Energy Composition */}
      <div className="hero-visual-col">
        <div className="hero-visual-card">
          {/* Ambient Lighting Gradients */}
          <div className="visual-ambient-glow" />

          {/* SVG Composition: EV + Smart Pedestal + Solar Canopy */}
          <svg
            className="hero-svg-illustration"
            viewBox="0 0 680 440"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="carBodyGrad" x1="120" y1="180" x2="480" y2="340" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="45%" stopColor="#E6F4F1" />
                <stop offset="100%" stopColor="#CBE5DF" />
              </linearGradient>

              <linearGradient id="carGlassGrad" x1="220" y1="190" x2="360" y2="260" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0B2625" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#1B4240" stopOpacity="0.95" />
              </linearGradient>

              <linearGradient id="chargerGrad" x1="510" y1="160" x2="570" y2="360" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#122A29" />
                <stop offset="100%" stopColor="#091A19" />
              </linearGradient>

              <linearGradient id="solarPanelGrad" x1="200" y1="40" x2="520" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0F3835" />
                <stop offset="100%" stopColor="#071B1A" />
              </linearGradient>

              <linearGradient id="cableFlowGrad" x1="510" y1="260" x2="420" y2="270" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1597E5" />
                <stop offset="100%" stopColor="#087F5B" />
              </linearGradient>

              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Ground Surface & Subtle Perspective Lines */}
            <ellipse cx="340" cy="375" rx="300" ry="38" fill="rgba(8, 127, 91, 0.05)" />
            <ellipse cx="340" cy="375" rx="220" ry="24" fill="rgba(21, 151, 229, 0.04)" />
            <line x1="80" y1="375" x2="600" y2="375" stroke="#DCE7E4" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* 2. Solar Canopy Above */}
            <g transform="translate(180, 45)">
              {/* Canopy Support Beam */}
              <path d="M 160 50 L 160 140" stroke="#CBDCD8" strokeWidth="4" strokeLinecap="round" />
              {/* Slanted Solar Panels */}
              <polygon points="20,50 300,10 320,40 40,80" fill="url(#solarPanelGrad)" stroke="#12B886" strokeWidth="1.5" />
              {/* Solar Cell Grid Lines */}
              <line x1="90" y1="40" x2="110" y2="70" stroke="#12B886" strokeWidth="1" opacity="0.6" />
              <line x1="160" y1="30" x2="180" y2="60" stroke="#12B886" strokeWidth="1" opacity="0.6" />
              <line x1="230" y1="20" x2="250" y2="50" stroke="#12B886" strokeWidth="1" opacity="0.6" />
              <line x1="30" y1="65" x2="310" y2="25" stroke="#12B886" strokeWidth="1" opacity="0.6" />
              {/* Green Sun Sparkle */}
              <circle cx="310" cy="12" r="3" fill="#087F5B" filter="url(#softGlow)" />
            </g>

            {/* 3. Electric Vehicle (EV) Body */}
            <g id="ev-car-body">
              {/* Car Shadow */}
              <ellipse cx="275" cy="365" rx="195" ry="14" fill="rgba(16, 42, 42, 0.16)" />

              {/* Main Silhouette */}
              <path
                d="M 90 330 
                   C 95 305, 120 300, 145 295 
                   C 170 290, 205 270, 235 220 
                   C 265 175, 340 175, 395 220 
                   C 425 245, 450 270, 465 295 
                   C 475 310, 475 330, 460 340 
                   C 440 348, 110 348, 90 330 Z"
                fill="url(#carBodyGrad)"
                stroke="#B8D5CE"
                strokeWidth="2"
              />

              {/* Aerodynamic Roof & Greenhouse Glass */}
              <path
                d="M 230 225 
                   C 255 185, 330 185, 385 225 
                   L 410 265 
                   L 205 265 Z"
                fill="url(#carGlassGrad)"
                stroke="#1B4240"
                strokeWidth="1.5"
              />
              {/* Pillar Divider */}
              <line x1="310" y1="192" x2="310" y2="265" stroke="#335E5B" strokeWidth="2.5" />

              {/* Character Shoulder Line */}
              <path
                d="M 120 302 Q 280 282 455 302"
                stroke="#94BEB5"
                strokeWidth="2"
                fill="none"
              />

              {/* Headlight & Tail Light */}
              <path d="M 92 318 L 115 315 L 110 326 Z" fill="#1597E5" filter="url(#softGlow)" />
              <path d="M 458 305 L 465 315 L 454 318 Z" fill="#E05252" />

              {/* Wheels */}
              {/* Front Wheel */}
              <g transform="translate(175, 342)">
                <circle r="30" fill="#0C1D1C" />
                <circle r="22" fill="#1E3937" stroke="#087F5B" strokeWidth="1.5" />
                <circle r="12" fill="#0C1D1C" />
                <circle r="4" fill="#1597E5" />
                {/* Spoke Accents */}
                <line x1="-16" y1="0" x2="16" y2="0" stroke="#8EBDB3" strokeWidth="1.5" />
                <line x1="0" y1="-16" x2="0" y2="16" stroke="#8EBDB3" strokeWidth="1.5" />
              </g>

              {/* Rear Wheel */}
              <g transform="translate(385, 342)">
                <circle r="30" fill="#0C1D1C" />
                <circle r="22" fill="#1E3937" stroke="#087F5B" strokeWidth="1.5" />
                <circle r="12" fill="#0C1D1C" />
                <circle r="4" fill="#1597E5" />
                {/* Spoke Accents */}
                <line x1="-16" y1="0" x2="16" y2="0" stroke="#8EBDB3" strokeWidth="1.5" />
                <line x1="0" y1="-16" x2="0" y2="16" stroke="#8EBDB3" strokeWidth="1.5" />
              </g>

              {/* Charging Port on Car (Rear Quarter) */}
              <circle cx="430" cy="285" r="7" fill="#087F5B" />
              <circle cx="430" cy="285" r="4" fill="#FFFFFF" />
            </g>

            {/* 4. Smart EV Charging Pedestal */}
            <g id="smart-pedestal" transform="translate(530, 200)">
              {/* Pedestal Base & Pillar */}
              <rect x="-16" y="0" width="32" height="165" rx="8" fill="url(#chargerGrad)" stroke="#1C3D3A" strokeWidth="1.5" />
              {/* Illuminated LED Status Strip */}
              <rect x="-10" y="24" width="20" height="40" rx="4" fill="#087F5B" filter="url(#softGlow)" />
              <rect x="-6" y="28" width="12" height="32" rx="2" fill="#FFFFFF" opacity="0.9" />
              {/* Voltara Brand Emblem on Pedestal */}
              <path d="M -2 76 L 3 83 L -1 83 L 1 90 L -4 84 L 0 84 Z" fill="#1597E5" />
              {/* Charging Cable Holster */}
              <circle cx="-16" cy="88" r="6" fill="#12B886" />
            </g>

            {/* 5. Connected Energy Flow Cable */}
            {/* Cable from Pedestal to Car */}
            <path
              d="M 514 288 C 490 340, 465 315, 430 285"
              stroke="#0C201F"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Animated Energy Flow Particles through Cable */}
            <path
              d="M 514 288 C 490 340, 465 315, 430 285"
              stroke="url(#cableFlowGrad)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="6 8"
              className="cable-animated-flow"
            />
          </svg>

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
                {anyCharging ? `${activeChargingEV.model}` : 'No Active Session'}
              </div>
              <div className="floating-card-sub">
                {anyCharging ? `Bay 0${activeChargingEV.bay} • Priority ${activeChargingEV.priorityMode}` : 'Awaiting EV connection'}
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
                    <span>SoC: {activeChargingEV.currentSoC}%</span>
                    <span>Target: {activeChargingEV.targetSoC}%</span>
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
                <span>Zero Overload Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
