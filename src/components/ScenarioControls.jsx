import React from 'react';
import { 
  Sliders, 
  Flame, 
  CloudRain, 
  TrendingDown, 
  Truck, 
  RotateCcw, 
  SunMedium,
  CheckCircle 
} from 'lucide-react';

export function ScenarioControls({
  gridConfig,
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
  resetScenarios
}) {
  const currentTransformerLimit = manualGridLimitKW ?? gridConfig.transformerCapacityKW;
  const currentBuildingKW = manualBuildingKW ?? Math.round(gridConfig.baseBuildingLoadKW);
  const currentSolarKW = manualSolarKW ?? 38;

  return (
    <div className="glass-panel scenario-bar">
      <div className="section-header">
        <h2 className="section-title">
          <Sliders size={20} color="#f59e0b" />
          Interactive Grid Simulation & Stress-Test Suite
        </h2>
        <span className="section-badge font-mono">
          Instant Live Response
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Trigger real-world localized grid challenges with one click to observe how VoltGrid's algorithm prevents transformer overload in real time:
      </p>

      {/* 1-Click Stress Test Quick-Launchers */}
      <div className="scenario-buttons-row">
        <button 
          onClick={triggerBuildingSurge} 
          className="scenario-btn surge"
          title="Simulate central facility chiller/HVAC kicking on"
        >
          <Flame size={16} color="#f43f5e" />
          <span>⚡ HVAC Demand Spike (+45 kW)</span>
        </button>

        <button 
          onClick={triggerSolarCloudDrop} 
          className="scenario-btn cloud"
          title="Simulate sudden cloud cover over solar panels"
        >
          <CloudRain size={16} color="#f59e0b" />
          <span>☁️ Solar Cloud Dip (Drop to 6 kW)</span>
        </button>

        <button 
          onClick={triggerCurtailmentEvent} 
          className="scenario-btn curtail"
          title="Simulate utility issuing demand-response peak curtailment"
        >
          <TrendingDown size={16} color="#a855f7" />
          <span>📉 Utility DR Curtailment (Cap @ 68 kW)</span>
        </button>

        <button 
          onClick={triggerFleetRush} 
          className="scenario-btn rush"
          title="Simulate commercial delivery van arriving on empty with tight deadline"
        >
          <Truck size={16} color="#00f59b" />
          <span>🚗 Fleet Emergency Arrival (12% SoC)</span>
        </button>

        <button 
          onClick={resetScenarios} 
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem' }}
          title="Reset grid parameters to default balanced state"
        >
          <RotateCcw size={14} />
          <span>Reset All</span>
        </button>
      </div>

      {/* Interactive Manual Override Sliders */}
      <div className="sliders-grid">
        {/* Transformer Rating Slider */}
        <div className="slider-group">
          <div className="slider-label-row">
            <span>Transformer Grid Cap</span>
            <span className="slider-val" style={{ color: '#f59e0b' }}>
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
          />
        </div>

        {/* Building Base Load Slider */}
        <div className="slider-group">
          <div className="slider-label-row">
            <span>Building Facility Demand</span>
            <span className="slider-val" style={{ color: '#a855f7' }}>
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
          />
        </div>

        {/* Solar Generation Slider */}
        <div className="slider-group">
          <div className="slider-label-row">
            <span>Solar Generation Manual Override</span>
            <span className="slider-val" style={{ color: '#00f59b' }}>
              {manualSolarKW !== null ? `${manualSolarKW} kW` : 'Auto (Sun Curve)'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="65"
            step="1"
            value={manualSolarKW !== null ? manualSolarKW : 38}
            onChange={(e) => setManualSolarKW(Number(e.target.value))}
          />
        </div>

        {/* Weather Selector */}
        <div className="slider-group">
          <div className="slider-label-row">
            <span>Sky & Solar Condition</span>
            <span className="slider-val" style={{ color: '#38bdf8' }}>
              {gridConfig.weather.replace('_', ' ')}
            </span>
          </div>
          <select
            className="mode-select"
            value={gridConfig.weather}
            onChange={(e) => {
              setGridConfig(prev => ({ ...prev, weather: e.target.value }));
              setManualSolarKW(null); // return to weather-driven
            }}
            style={{ marginTop: '2px', padding: '6px 10px' }}
          >
            <option value="SUNNY">☀️ Sunny (100% Irradiance)</option>
            <option value="PARTLY_CLOUDY">⛅ Partly Cloudy (62% Irradiance)</option>
            <option value="OVERCAST">☁️ Heavy Overcast (22% Irradiance)</option>
            <option value="NIGHT">🌙 Night / Off-Peak (0% Solar)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
