import React from 'react';
import { 
  Sliders, 
  Flame, 
  CloudRain, 
  TrendingDown, 
  Truck, 
  RotateCcw, 
  SunMedium, 
  Play, 
  Gauge, 
  Building2, 
  Sun, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap
} from 'lucide-react';

export function ScenarioControls({
  gridConfig = {},
  setGridConfig,
  manualBuildingKW,
  setManualBuildingKW,
  manualSolarKW,
  setManualSolarKW,
  manualGridLimitKW,
  setManualGridLimitKW,
  triggerBuildingSurge,
  triggerSolarCloudDrop,
  triggerCurtailmentEvent,
  triggerFleetRush,
  triggerGridShortageDemo,
  resetScenarios
}) {
  const currentTransformerLimit = manualGridLimitKW ?? gridConfig.transformerCapacityKW;
  const currentBuildingKW = manualBuildingKW ?? Math.round(gridConfig.baseBuildingLoadKW);
  const currentSolarKW = manualSolarKW ?? (gridConfig.weather === 'OVERCAST' ? 6 : (gridConfig.weather === 'NIGHT' ? 0 : 38));

  const isSurgeActive = gridConfig.buildingSurgeActive || manualBuildingKW >= 80;
  const isSolarDropActive = gridConfig.solarDropActive || gridConfig.weather === 'OVERCAST' || (manualSolarKW !== null && manualSolarKW <= 10);
  const isCurtailmentActive = gridConfig.curtailmentActive || (manualGridLimitKW !== null && manualGridLimitKW < 90);

  const scenarioCards = [
    {
      id: 'surge',
      name: 'HVAC Chiller Spike',
      triggerTag: '+45 kW SURGE',
      icon: Flame,
      color: 'var(--danger)',
      borderColor: isSurgeActive ? 'var(--danger)' : 'var(--border)',
      isActive: isSurgeActive,
      description: 'Simulates central building chillers kicking on during peak facility hours.',
      effectText: 'Dynamic load shedding throttles non-urgent bays to protect transformer cap.',
      action: triggerBuildingSurge,
      btnLabel: 'Trigger Spike'
    },
    {
      id: 'cloud',
      name: 'Solar Cloud Dip',
      triggerTag: 'DROP TO 6 kW',
      icon: CloudRain,
      color: 'var(--warning)',
      borderColor: isSolarDropActive ? 'var(--warning)' : 'var(--border)',
      isActive: isSolarDropActive,
      description: 'Simulates heavy cloud cover sweeping across the rooftop PV array.',
      effectText: 'Re-balances grid import instantly and throttles Eco-Solar following chargers.',
      action: triggerSolarCloudDrop,
      btnLabel: 'Trigger Cloud'
    },
    {
      id: 'curtail',
      name: 'Utility DR Curtailment',
      triggerTag: 'CAP @ 68 kW',
      icon: TrendingDown,
      color: '#9C36B5',
      borderColor: isCurtailmentActive ? '#9C36B5' : 'var(--border)',
      isActive: isCurtailmentActive,
      description: 'Simulates automated grid demand-response event restricting import ceiling.',
      effectText: 'Enforces strict priority scheduling; low-urgency vehicles held in standby.',
      action: triggerCurtailmentEvent,
      btnLabel: 'Trigger Cap'
    },
    {
      id: 'rush',
      name: 'Fleet Emergency Arrival',
      triggerTag: '12% SoC / 50m',
      icon: Truck,
      color: 'var(--secondary)',
      borderColor: 'var(--border)',
      isActive: false,
      description: 'Commercial delivery logistics vehicle arrives on near-empty with tight deadline.',
      effectText: 'Preempts other bays with top-tier urgency allocation to meet turnaround target.',
      action: triggerFleetRush,
      btnLabel: 'Dispatch EV'
    },
    {
      id: 'shortage',
      name: 'Charge Pact Demo',
      triggerTag: '6 kW SHORTAGE',
      icon: ShieldAlert,
      color: 'var(--warning)',
      borderColor: isCurtailmentActive ? 'var(--warning)' : 'var(--border)',
      isActive: isCurtailmentActive,
      description: 'Grid capacity abruptly capped to 30 kW while cluster demands ~36 kW.',
      effectText: 'Triggers the Charge Pact candidate selection to absorb the 6 kW deficit.',
      action: triggerGridShortageDemo,
      btnLabel: 'Trigger Demo'
    }
  ];

  return (
    <div className="scenario-suite-container">
      {/* 1. Header Toolbar & Quick Reset */}
      <div className="scenario-toolbar-header">
        <div className="scenario-header-meta">
          <div className="scenario-icon-badge">
            <Sliders size={18} color="var(--primary)" />
          </div>
          <div>
            <h3 className="scenario-suite-title">Grid Stress-Testing Matrix</h3>
            <p className="scenario-suite-subtitle">
              Select a pre-configured stress test scenario or manually adjust sliders below to verify instant algorithmic response.
            </p>
          </div>
        </div>

        <button
          onClick={resetScenarios}
          className="scenario-reset-btn"
          title="Reset grid limits, facility demand, and solar generation to optimal baseline"
        >
          <RotateCcw size={14} />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* 2. Scenario Cards Grid: CONTROL -> CURRENT VALUE -> EFFECT */}
      <div className="scenario-card-deck">
        {scenarioCards.map((sc) => {
          const Icon = sc.icon;
          return (
            <div 
              key={sc.id} 
              className={`scenario-action-card ${sc.isActive ? 'is-scenario-active' : ''}`}
              style={{ borderColor: sc.isActive ? sc.color : undefined }}
            >
              <div className="scenario-card-header">
                <div className="scenario-title-group">
                  <div className="scenario-mini-icon" style={{ color: sc.color }}>
                    <Icon size={16} />
                  </div>
                  <span className="scenario-name">{sc.name}</span>
                </div>
                <span className="scenario-trigger-pill font-mono">{sc.triggerTag}</span>
              </div>

              <div className="scenario-card-content">
                <div className="scenario-desc-row">
                  <span className="scenario-section-tag">SCENARIO:</span>
                  <p className="scenario-desc-text">{sc.description}</p>
                </div>

                <div className="scenario-effect-row">
                  <span className="scenario-section-tag effect">ALGORITHMIC EFFECT:</span>
                  <p className="scenario-effect-text">{sc.effectText}</p>
                </div>
              </div>

              <div className="scenario-card-actions">
                <button
                  onClick={sc.action}
                  className={`scenario-launch-btn ${sc.id}`}
                >
                  <Play size={13} />
                  <span>{sc.btnLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Manual Parameter Fine-Tuning Console */}
      <div className="manual-controls-console">
        <div className="console-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="var(--primary)" />
            <h4 className="console-title">Manual Parameter Fine-Tuning Console</h4>
          </div>
          <span className="console-status-pill font-mono">1 Hz Continuous Recalculation</span>
        </div>

        <div className="sliders-control-grid">
          {/* Slider 1: Transformer Rating */}
          <div className="param-slider-card">
            <div className="param-header-row">
              <div className="param-label-wrap">
                <Gauge size={14} color="var(--warning)" />
                <span className="param-name">Transformer Grid Limit</span>
              </div>
              <span className="param-value font-mono" style={{ color: 'var(--warning)' }}>
                {currentTransformerLimit} kW
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="180"
              step="5"
              value={currentTransformerLimit}
              onChange={(e) => setManualGridLimitKW(Number(e.target.value))}
              aria-label="Transformer Grid Limit"
            />
            <div className="param-scale-row font-mono">
              <span>50 kW (Severe Cap)</span>
              <span>120 kW (Nominal)</span>
              <span>180 kW</span>
            </div>
          </div>

          {/* Slider 2: Building Facility Demand */}
          <div className="param-slider-card">
            <div className="param-header-row">
              <div className="param-label-wrap">
                <Building2 size={14} color="#9C36B5" />
                <span className="param-name">Facility Base Demand</span>
              </div>
              <span className="param-value font-mono" style={{ color: '#9C36B5' }}>
                {currentBuildingKW} kW
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="95"
              step="1"
              value={currentBuildingKW}
              onChange={(e) => setManualBuildingKW(Number(e.target.value))}
              aria-label="Facility Base Demand"
            />
            <div className="param-scale-row font-mono">
              <span>15 kW (Night)</span>
              <span>45 kW (Standard)</span>
              <span>95 kW (Spike)</span>
            </div>
          </div>

          {/* Slider 3: Solar Generation Override */}
          <div className="param-slider-card">
            <div className="param-header-row">
              <div className="param-label-wrap">
                <Sun size={14} color="var(--primary)" />
                <span className="param-name">Solar Generation Output</span>
              </div>
              <span className="param-value font-mono" style={{ color: 'var(--primary)' }}>
                {manualSolarKW !== null ? `${manualSolarKW} kW (Manual)` : `${currentSolarKW} kW (Auto)`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="65"
              step="1"
              value={manualSolarKW !== null ? manualSolarKW : currentSolarKW}
              onChange={(e) => setManualSolarKW(Number(e.target.value))}
              aria-label="Solar Generation Output"
            />
            <div className="param-scale-row font-mono">
              <span>0 kW (Night)</span>
              <span>35 kW (Nominal)</span>
              <span>65 kW (Peak Sun)</span>
            </div>
          </div>

          {/* Selector 4: Sky & Solar Weather Preset */}
          <div className="param-slider-card">
            <div className="param-header-row">
              <div className="param-label-wrap">
                <SunMedium size={14} color="var(--electric)" />
                <span className="param-name">Sky Irradiance Condition</span>
              </div>
              <span className="param-value font-mono" style={{ color: 'var(--electric)' }}>
                {gridConfig.weather.replace('_', ' ')}
              </span>
            </div>
            <select
              className="param-weather-select"
              value={gridConfig.weather}
              onChange={(e) => {
                setGridConfig(prev => ({ ...prev, weather: e.target.value }));
                setManualSolarKW(null); // return to weather curve
              }}
              aria-label="Sky Irradiance Condition"
            >
              <option value="SUNNY">☀️ Sunny (100% PV Irradiance)</option>
              <option value="PARTLY_CLOUDY">⛅ Partly Cloudy (62% PV Irradiance)</option>
              <option value="OVERCAST">☁️ Heavy Overcast (22% PV Irradiance)</option>
              <option value="NIGHT">🌙 Night / Off-Peak (0% Solar)</option>
            </select>
            <div className="param-scale-row font-mono">
              <span>Auto diurnal cycle calculation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
