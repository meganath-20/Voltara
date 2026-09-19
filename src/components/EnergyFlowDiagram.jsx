import React from 'react';
import { Sun, Zap, Building2, BatteryCharging, ArrowDown, ArrowUp, Activity, ShieldCheck, RefreshCw } from 'lucide-react';

export function EnergyFlowDiagram({ gridMetrics }) {
  const {
    netUtilityGridImportKW = 0,
    netGridExportKW = 0,
    solarGenerationKW = 0,
    baseBuildingLoadKW = 0,
    totalEVChargingKW = 0,
    renewableEVSharePercent = 0,
    transformerCapacityKW = 120,
    transformerHeadroomKW = 0,
    cleanEnergySelfConsumptionPercent = 100,
    totalFacilityDemandKW = 0
  } = gridMetrics || {};

  const isExporting = netGridExportKW > 0;
  const isImporting = netUtilityGridImportKW > 0;

  // Calculate flow speeds (higher kW = faster dashed animation)
  const gridFlowDuration = (isImporting ? netUtilityGridImportKW : netGridExportKW) > 1 
    ? `${Math.max(0.7, 3.2 - ((isImporting ? netUtilityGridImportKW : netGridExportKW) / transformerCapacityKW) * 2.2)}s` 
    : '0s';
  const solarFlowDuration = solarGenerationKW > 1 
    ? `${Math.max(0.6, 3.2 - (solarGenerationKW / 60) * 2.2)}s` 
    : '0s';
  const buildingFlowDuration = `${Math.max(0.7, 3.2 - (baseBuildingLoadKW / 85) * 2.2)}s`;
  const evFlowDuration = totalEVChargingKW > 1 
    ? `${Math.max(0.5, 3.2 - (totalEVChargingKW / 95) * 2.2)}s` 
    : '0s';

  return (
    <div className="energy-flow-card">
      {/* Top Diagram Header */}
      <div className="flow-card-header">
        <div className="flow-title-group">
          <div className="flow-icon-symbol">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="flow-main-heading">Site Power Dispatch & Routing</h3>
            <p className="flow-sub-heading">Real-time localized energy distribution topology</p>
          </div>
        </div>

        <div className="flow-badges-group">
          <div className="flow-pill solar-pill">
            <Sun size={13} />
            <span>{renewableEVSharePercent}% EV Solar Share</span>
          </div>
          <div className="flow-pill bus-pill">
            <RefreshCw size={13} />
            <span>Self-Balancing Bus</span>
          </div>
        </div>
      </div>

      {/* Main SVG Energy Topology Surface */}
      <div className="flow-canvas-container">
        <svg 
          viewBox="0 0 840 440" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="flow-svg-viewport"
        >
          <defs>
            {/* Subtle light background dot pattern */}
            <pattern id="flowGridDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#DDE9E6" />
            </pattern>

            {/* Gradient Paths */}
            <linearGradient id="solarToBusGrad" x1="180" y1="90" x2="420" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#087F5B" />
              <stop offset="100%" stopColor="#12B886" />
            </linearGradient>

            <linearGradient id="gridToBusGrad" x1="660" y1="90" x2="420" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1597E5" />
              <stop offset="100%" stopColor="#087F5B" />
            </linearGradient>

            <linearGradient id="busToGridExportGrad" x1="420" y1="220" x2="660" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#12B886" />
              <stop offset="100%" stopColor="#087F5B" />
            </linearGradient>

            <linearGradient id="busToBuildingGrad" x1="420" y1="220" x2="180" y2="350" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#12B886" />
              <stop offset="100%" stopColor="#7950F2" />
            </linearGradient>

            <linearGradient id="busToEVGrad" x1="420" y1="220" x2="660" y2="350" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#12B886" />
              <stop offset="100%" stopColor="#1597E5" />
            </linearGradient>

            {/* Drop Shadows */}
            <filter id="nodeCardShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#102A2A" floodOpacity="0.06" />
            </filter>
            <filter id="busGlowShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="#087F5B" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background Surface */}
          <rect width="840" height="440" rx="16" fill="#F8FBFA" />
          <rect width="840" height="440" rx="16" fill="url(#flowGridDots)" />

          {/* BACKGROUND CONDUIT TRACKS */}
          <path d="M 180 90 C 290 90, 320 220, 420 220" stroke="#DDEAE7" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M 660 90 C 550 90, 520 220, 420 220" stroke="#DDEAE7" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M 420 220 C 320 220, 290 350, 180 350" stroke="#DDEAE7" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M 420 220 C 520 220, 550 350, 660 350" stroke="#DDEAE7" strokeWidth="10" fill="none" strokeLinecap="round" />

          {/* ACTIVE ANIMATED ENERGY FLOW PARTICLES */}
          {/* 1. Solar -> Bus Flow (Green) */}
          {solarGenerationKW > 1 && (
            <path
              d="M 180 90 C 290 90, 320 220, 420 220"
              stroke="url(#solarToBusGrad)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="flow-path-forward"
              style={{ animationDuration: solarFlowDuration }}
            />
          )}

          {/* 2. Grid -> Bus Flow (Blue Import) OR Bus -> Grid (Green Export) */}
          {isImporting && (
            <path
              d="M 660 90 C 550 90, 520 220, 420 220"
              stroke="url(#gridToBusGrad)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="flow-path-forward"
              style={{ animationDuration: gridFlowDuration }}
            />
          )}

          {isExporting && (
            <path
              d="M 420 220 C 520 220, 550 90, 660 90"
              stroke="url(#busToGridExportGrad)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="flow-path-forward"
              style={{ animationDuration: gridFlowDuration }}
            />
          )}

          {/* 3. Bus -> Facility Building Demand Flow (Purple) */}
          {baseBuildingLoadKW > 1 && (
            <path
              d="M 420 220 C 320 220, 290 350, 180 350"
              stroke="url(#busToBuildingGrad)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="flow-path-forward"
              style={{ animationDuration: buildingFlowDuration }}
            />
          )}

          {/* 4. Bus -> Smart EV Cluster Flow (Green / Blue) */}
          {totalEVChargingKW > 1 && (
            <path
              d="M 420 220 C 520 220, 550 350, 660 350"
              stroke="url(#busToEVGrad)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="flow-path-forward"
              style={{ animationDuration: evFlowDuration }}
            />
          )}

          {/* ============================================================
              FOUR MAJOR STAGE NODES (Solar, Grid, Building, EV Cluster)
             ============================================================ */}

          {/* STAGE 1: SOLAR (Top Left) */}
          <g transform="translate(180, 90)" className="diagram-node">
          <rect x="-105" y="-50" width="210" height="100" rx="16" fill="#FFFFFF" stroke="#087F5B" strokeWidth="2" filter="url(#nodeCardShadow)" />
            <circle cx="-50" cy="0" r="22" fill="rgba(8, 127, 91, 0.1)" />
            <foreignObject x="-62" y="-12" width="24" height="24">
              <Sun size={24} color="#087F5B" />
            </foreignObject>
            <text x="-15" y="-14" fill="#536B69" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" letterSpacing="0.05em">
              1. ROOFTOP SOLAR
            </text>
            <text x="-15" y="10" fill="#102A2A" fontSize="20" fontWeight="800" fontFamily="var(--font-heading)">
              {solarGenerationKW} <tspan fontSize="12" fill="#536B69">kW</tspan>
            </text>
            <text x="-15" y="28" fill="#087F5B" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
              {cleanEnergySelfConsumptionPercent}% Self-Used
            </text>
          </g>

          {/* STAGE 2: GRID & SUBSTATION (Top Right) */}
          <g transform="translate(660, 90)" className="diagram-node">
          <rect
  x="-105"
  y="-50"
  width="210"
  height="100"
  rx="16"
  fill="#FFFFFF"
  stroke={isImporting ? '#1597E5' : '#087F5B'}
  strokeWidth="2"
  filter="url(#nodeCardShadow)"
/>
            <circle cx="-50" cy="0" r="22" fill={isImporting ? 'rgba(21, 151, 229, 0.1)' : 'rgba(8, 127, 91, 0.1)'} />
            <foreignObject x="-62" y="-12" width="24" height="24">
              <Zap size={24} color={isImporting ? '#1597E5' : '#087F5B'} />
            </foreignObject>
            <text x="-15" y="-14" fill="#536B69" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" letterSpacing="0.05em">
              2. {isExporting ? 'GRID EXPORT' : 'UTILITY GRID'}
            </text>
            <text x="-15" y="10" fill="#102A2A" fontSize="20" fontWeight="800" fontFamily="var(--font-heading)">
              {isExporting ? netGridExportKW : netUtilityGridImportKW} <tspan fontSize="12" fill="#536B69">kW</tspan>
            </text>
            <text x="-15" y="28" fill={isImporting ? '#1597E5' : '#087F5B'} fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
              {transformerHeadroomKW} kW Headroom
            </text>
          </g>

          {/* STAGE 3: BUILDING INFRASTRUCTURE (Bottom Left) */}
          <g transform="translate(180, 350)" className="diagram-node">
          <rect x="-105" y="-50" width="210" height="100" rx="16" fill="#FFFFFF" stroke="#7950F2" strokeWidth="2" filter="url(#nodeCardShadow)" />
            <circle cx="-50" cy="0" r="22" fill="rgba(121, 80, 242, 0.1)" />
            <foreignObject x="-62" y="-12" width="24" height="24">
              <Building2 size={24} color="#7950F2" />
            </foreignObject>
            <text x="-15" y="-14" fill="#536B69" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" letterSpacing="0.05em">
              3. BUILDING DEMAND
            </text>
            <text x="-15" y="10" fill="#102A2A" fontSize="20" fontWeight="800" fontFamily="var(--font-heading)">
            {baseBuildingLoadKW.toFixed(1)} <tspan fontSize="12" fill="#536B69">kW</tspan>
            </text>
            <text x="-15" y="28" fill="#7950F2" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
              HVAC, IT & Lighting
            </text>
          </g>

          {/* STAGE 4: SMART EV CLUSTER (Bottom Right) */}
          <g transform="translate(660, 350)" className="diagram-node">
          <rect x="-105" y="-50" width="210" height="100" rx="16" fill="#FFFFFF" stroke="#12B886" strokeWidth="2" filter="url(#nodeCardShadow)" />
            <circle cx="-50" cy="0" r="22" fill="rgba(18, 184, 134, 0.1)" />
            <foreignObject x="-62" y="-12" width="24" height="24">
              <BatteryCharging size={24} color="#087F5B" />
            </foreignObject>
            <text x="-15" y="-14" fill="#536B69" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" letterSpacing="0.05em">
              4. EV CHARGING
            </text>
            <text x="-15" y="10" fill="#102A2A" fontSize="20" fontWeight="800" fontFamily="var(--font-heading)">
              {totalEVChargingKW} <tspan fontSize="12" fill="#536B69">kW</tspan>
            </text>
            <text x="-15" y="28" fill="#087F5B" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
              Dynamic Water-Filling
            </text>
          </g>

          {/* CENTRAL EMS BALANCING HUB (Voltara Bus) */}
          <g transform="translate(420, 220)">
            <circle r="60" fill="#FFFFFF" stroke="#087F5B" strokeWidth="3" filter="url(#busGlowShadow)" />
            <circle r="66" fill="none" stroke="#12B886" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.7">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="25s" repeatCount="indefinite" />
            </circle>
            
            <text y="-22" textAnchor="middle" fill="#087F5B" fontSize="10" fontWeight="800" fontFamily="var(--font-mono)" letterSpacing="0.08em">
              VOLTARA BUS
            </text>
            <text y="4" textAnchor="middle" fill="#102A2A" fontSize="20" fontWeight="800" fontFamily="var(--font-heading)">
              {totalFacilityDemandKW}
            </text>
            <text y="18" textAnchor="middle" fill="#536B69" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
              kW Total Demand
            </text>
            
            {/* Clean Status Pill inside hub */}
            <rect x="-48" y="26" width="96" height="18" rx="9" fill="rgba(8, 127, 91, 0.1)" />
            <text y="38" textAnchor="middle" fill="#087F5B" fontSize="8.5" fontWeight="700" fontFamily="var(--font-mono)">
              {renewableEVSharePercent}% SOLAR ROUTED
            </text>
          </g>
        </svg>
      </div>

      {/* Diagram Footer: 4-Node Process Progression Strip */}
      <div className="flow-story-strip">
        <div className="story-step">
          <div className="step-num">01</div>
          <div className="step-info">
            <span className="step-name">Harvest Solar</span>
            <span className="step-detail">{solarGenerationKW} kW generation prioritize local use</span>
          </div>
        </div>
        <div className="story-arrow">→</div>

        <div className="story-step">
          <div className="step-num">02</div>
          <div className="step-info">
            <span className="step-name">Sample Grid</span>
            <span className="step-detail">{isExporting ? `Exporting ${netGridExportKW} kW` : `Importing ${netUtilityGridImportKW} kW`}</span>
          </div>
        </div>
        <div className="story-arrow">→</div>

        <div className="story-step">
          <div className="step-num">03</div>
          <div className="step-info">
            <span className="step-name">Support Building</span>
            <span className="step-detail">{baseBuildingLoadKW.toFixed(1)} kW baseline load guaranteed</span>
          </div>
        </div>
        <div className="story-arrow">→</div>

        <div className="story-step">
          <div className="step-num">04</div>
          <div className="step-info">
            <span className="step-name">Charge EV Cluster</span>
            <span className="step-detail">{totalEVChargingKW} kW dispatched safely</span>
          </div>
        </div>
      </div>
    </div>
  );
}
