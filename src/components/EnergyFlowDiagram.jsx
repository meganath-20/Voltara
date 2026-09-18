import React from 'react';
import { Sun, Zap, Building2, BatteryCharging, Radio } from 'lucide-react';

export function EnergyFlowDiagram({ gridMetrics }) {
  const {
    netUtilityGridImportKW,
    solarGenerationKW,
    baseBuildingLoadKW,
    totalEVChargingKW,
    renewableEVSharePercent,
    transformerCapacityKW,
    cleanEnergySelfConsumptionPercent
  } = gridMetrics;

  // Determine flow speeds (higher kW = faster animated dashes)
  const gridFlowDuration = netUtilityGridImportKW > 1 
    ? `${Math.max(0.6, 3.5 - (netUtilityGridImportKW / transformerCapacityKW) * 2.5)}s` 
    : '0s';
  const solarFlowDuration = solarGenerationKW > 1 
    ? `${Math.max(0.6, 3.5 - (solarGenerationKW / 60) * 2.5)}s` 
    : '0s';
  const buildingFlowDuration = `${Math.max(0.7, 3.5 - (baseBuildingLoadKW / 80) * 2.5)}s`;
  const evFlowDuration = totalEVChargingKW > 1 
    ? `${Math.max(0.5, 3.5 - (totalEVChargingKW / 90) * 2.5)}s` 
    : '0s';

  return (
    <div className="glass-panel topology-card">
      <div className="section-header">
        <h2 className="section-title">
          <Radio size={20} color="#38bdf8" />
          Localized Power Topology & Live Energy Routing
        </h2>
        <span className="section-badge">
          Active Self-Balancing Bus
        </span>
      </div>

      <div className="flow-diagram-container">
        <svg 
          viewBox="0 0 800 360" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="gridToHub" x1="160" y1="90" x2="400" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="solarToHub" x1="640" y1="90" x2="400" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00f59b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="hubToBuilding" x1="400" y1="180" x2="160" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="hubToEV" x1="400" y1="180" x2="640" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00f59b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
            </linearGradient>

            {/* Glow Filters */}
            <filter id="glow-hub" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-solar" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND WIRES (DIM) */}
          <path d="M 170 90 C 270 90, 310 180, 400 180" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M 630 90 C 530 90, 490 180, 400 180" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M 400 180 C 310 180, 270 270, 170 270" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M 400 180 C 490 180, 530 270, 630 270" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" strokeLinecap="round" />

          {/* ACTIVE FLOW PARTICLES / DASHES */}
          {/* 1. Grid -> Hub */}
          {netUtilityGridImportKW > 1 && (
            <path
              d="M 170 90 C 270 90, 310 180, 400 180"
              stroke="url(#gridToHub)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              style={{
                animation: `flowDash ${gridFlowDuration} linear infinite`
              }}
            />
          )}

          {/* 2. Solar -> Hub */}
          {solarGenerationKW > 1 && (
            <path
              d="M 630 90 C 530 90, 490 180, 400 180"
              stroke="url(#solarToHub)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              style={{
                animation: `flowDashReverse ${solarFlowDuration} linear infinite`
              }}
            />
          )}

          {/* 3. Hub -> Facility Building Load */}
          <path
            d="M 400 180 C 310 180, 270 270, 170 270"
            stroke="url(#hubToBuilding)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8 12"
            style={{
              animation: `flowDash ${buildingFlowDuration} linear infinite`
            }}
          />

          {/* 4. Hub -> EV Cluster */}
          {totalEVChargingKW > 1 && (
            <path
              d="M 400 180 C 490 180, 530 270, 630 270"
              stroke="url(#hubToEV)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="8 12"
              style={{
                animation: `flowDash ${evFlowDuration} linear infinite`
              }}
            />
          )}

          {/* NODES */}
          {/* Node 1: Grid (Top Left) */}
          <g transform="translate(170, 90)">
            <circle r="44" fill="#0b1329" stroke="#f59e0b" strokeWidth="2" />
            <circle r="48" fill="none" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
            <foreignObject x="-36" y="-36" width="72" height="72">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#f59e0b' }}>
                <Zap size={22} />
                <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {netUtilityGridImportKW} kW
                </span>
              </div>
            </foreignObject>
            <text y="60" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600" fontFamily="var(--font-heading)">
              UTILITY GRID
            </text>
          </g>

          {/* Node 2: Solar PV (Top Right) */}
          <g transform="translate(630, 90)">
            <circle r="44" fill="#071b1e" stroke="#00f59b" strokeWidth="2" filter="url(#glow-solar)" />
            <circle r="48" fill="none" stroke="rgba(0, 245, 155, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
            <foreignObject x="-36" y="-36" width="72" height="72">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#00f59b' }}>
                <Sun size={22} />
                <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {solarGenerationKW} kW
                </span>
              </div>
            </foreignObject>
            <text y="60" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600" fontFamily="var(--font-heading)">
              ROOFTOP SOLAR PV
            </text>
          </g>

          {/* Node 3: Center Bus / EMS (Center) */}
          <g transform="translate(400, 180)">
            <circle r="52" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" filter="url(#glow-hub)" />
            <circle r="58" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" strokeDasharray="6 6">
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite" />
            </circle>
            <foreignObject x="-44" y="-44" width="88" height="88">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>
                  VOLTGRID BUS
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                  {gridMetrics.totalFacilityDemandKW}
                </span>
                <span style={{ fontSize: '8px', color: '#94a3b8' }}>
                  kW Cluster Flow
                </span>
              </div>
            </foreignObject>
            <text y="72" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">
              {renewableEVSharePercent}% SOLAR ROUTED
            </text>
          </g>

          {/* Node 4: Facility Demand (Bottom Left) */}
          <g transform="translate(170, 270)">
            <circle r="44" fill="#171026" stroke="#a855f7" strokeWidth="2" />
            <foreignObject x="-36" y="-36" width="72" height="72">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#a855f7' }}>
                <Building2 size={22} />
                <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {baseBuildingLoadKW} kW
                </span>
              </div>
            </foreignObject>
            <text y="60" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600" fontFamily="var(--font-heading)">
              BUILDING LOAD
            </text>
          </g>

          {/* Node 5: Smart EV Cluster (Bottom Right) */}
          <g transform="translate(630, 270)">
            <circle r="44" fill="#091b29" stroke="#38bdf8" strokeWidth="2" />
            <foreignObject x="-36" y="-36" width="72" height="72">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#38bdf8' }}>
                <BatteryCharging size={22} />
                <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {totalEVChargingKW} kW
                </span>
              </div>
            </foreignObject>
            <text y="60" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600" fontFamily="var(--font-heading)">
              SMART EV CLUSTER
            </text>
          </g>
        </svg>

        <style>{`
          @keyframes flowDash {
            to { stroke-dashoffset: -20; }
          }
          @keyframes flowDashReverse {
            to { stroke-dashoffset: 20; }
          }
        `}</style>
      </div>
    </div>
  );
}
