import React from 'react';
import { 
  ArrowDown, 
  ArrowRight, 
  Sun, 
  Zap, 
  Building2, 
  BatteryCharging, 
  ShieldCheck, 
  Gauge, 
  TrendingUp,
  Activity
} from 'lucide-react';

export function GridFlowStory({ gridMetrics }) {
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
    totalFacilityDemandKW = 0,
    transformerLoadPercent = 0
  } = gridMetrics || {};

  const isExporting = netGridExportKW > 0;
  const isImporting = netUtilityGridImportKW > 0;

  return (
    <div className="grid-flow-story-panel">
      {/* Eyebrow and Headline */}
      <div className="section-heading-group">
        <span className="section-eyebrow">02 — Grid Flow</span>
        <h2 className="section-main-title">Energy flows where it matters.</h2>
        <p className="section-subtitle">
          Voltara continuously balances rooftop solar generation, building demand, utility grid capacity, 
          and smart EV charging — routing surplus clean energy first while guaranteeing the substation transformer never overloads.
        </p>
      </div>

      {/* Primary Headroom & Balance Card */}
      <div className="headroom-calculation-card">
        <div className="headroom-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="icon-badge-headroom">
              <Gauge size={18} />
            </div>
            <div>
              <div className="headroom-card-title">Transformer Capacity & Headroom</div>
              <div className="headroom-card-sub">Dynamic real-time overload prevention equation</div>
            </div>
          </div>

          <div className="headroom-status-badge">
            <ShieldCheck size={14} color="var(--primary)" />
            <span>Active Protection</span>
          </div>
        </div>

        {/* Capacity Equation Box */}
        <div className="headroom-equation-box">
          <div className="equation-part">
            <span className="part-label">Grid Rating</span>
            <span className="part-val">{transformerCapacityKW.toFixed(1)}<span className="part-unit">kW</span></span>
          </div>
          <div className="equation-symbol">−</div>
          <div className="equation-part">
            <span className="part-label">{isExporting ? 'Grid Export' : 'Grid Draw'}</span>
            <span className="part-val" style={{ color: isImporting ? 'var(--electric)' : 'var(--primary)' }}>
            {(isExporting ? netGridExportKW : netUtilityGridImportKW).toFixed(1)} <span className="part-unit">kW</span>
            </span>
          </div>
          <div className="equation-symbol">=</div>
          <div className="equation-part headroom-result">
            <span className="part-label">Headroom Left</span>
            <span className="part-val" style={{ color: transformerLoadPercent >= 85 ? 'var(--warning)' : 'var(--primary)' }}>
            {transformerHeadroomKW.toFixed(1)}<span className="part-unit">kW</span>
            </span>
          </div>
        </div>

        {/* Headroom Progress Bar */}
        <div className="headroom-bar-container">
          <div className="headroom-bar-header">
            <span>Transformer Load: <strong>{transformerLoadPercent}%</strong></span>
            <span>Safety Margin: <strong>{transformerHeadroomKW.toFixed(1)} kW</strong></span>
          </div>
          <div className="headroom-track">
            <div 
              className="headroom-fill" 
              style={{ 
                width: `${Math.min(100, transformerLoadPercent)}%`,
                background: transformerLoadPercent >= 92 
                  ? 'var(--danger)' 
                  : (transformerLoadPercent >= 80 ? 'var(--warning)' : 'var(--electric)')
              }} 
            />
          </div>
        </div>

        {/* Direction & Renewable Indicators */}
        <div className="headroom-footer-metrics">
          <div className="metric-pill">
            <span className="pill-dot" style={{ background: isExporting ? 'var(--primary)' : 'var(--electric)' }} />
            <span>Mode: <strong>{isExporting ? 'Clean Solar Export' : 'Utility Grid Import'}</strong></span>
          </div>
          <div className="metric-pill">
            <span className="pill-dot" style={{ background: 'var(--primary)' }} />
            <span>Solar Utilized: <strong>{cleanEnergySelfConsumptionPercent}%</strong></span>
          </div>
        </div>
      </div>

      {/* 4-Stage Architectural Flow Timeline */}
      <div className="flow-steps-card">
        <h4 className="flow-steps-title">The 4-Stage Energy Coordination Loop</h4>
        
        <div className="flow-timeline">
          {/* Step 1 */}
          <div className="timeline-item">
            <div className="timeline-marker solar-marker">
              <Sun size={15} />
            </div>
            <div className="timeline-content">
              <div className="timeline-heading">
                <span>1. Solar Generation</span>
                <span className="timeline-kw">{solarGenerationKW.toFixed(1)} kW</span>
              </div>
              <p className="timeline-desc">Zero-carbon generation harvested from rooftop PV is given first-priority dispatch.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="timeline-item">
            <div className="timeline-marker grid-marker">
              <Zap size={15} />
            </div>
            <div className="timeline-content">
              <div className="timeline-heading">
                <span>2. Grid & Substation</span>
                <span className="timeline-kw">
  {isExporting
    ? `+${netGridExportKW.toFixed(1)} kW Export`
    : `${netUtilityGridImportKW.toFixed(1)} kW Import`}
</span>
              </div>
              <p className="timeline-desc">Monitors substation transformer thermal limits to prevent utility peak demand penalties.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="timeline-item">
            <div className="timeline-marker building-marker">
              <Building2 size={15} />
            </div>
            <div className="timeline-content">
              <div className="timeline-heading">
                <span>3. Facility Infrastructure</span>
                <span className="timeline-kw">{baseBuildingLoadKW.toFixed(1)} kW</span>
              </div>
              <p className="timeline-desc">Baseline facility operations (HVAC, IT, lighting) are guaranteed uninterrupted power.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="timeline-item">
            <div className="timeline-marker ev-marker">
              <BatteryCharging size={15} />
            </div>
            <div className="timeline-content">
              <div className="timeline-heading">
                <span>4. Smart EV Cluster</span>
                <span className="timeline-kw">{totalEVChargingKW.toFixed(1)} kW</span>
              </div>
              <p className="timeline-desc">Fair-share water-filling algorithm dynamically scales charging currents to fit available headroom.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
