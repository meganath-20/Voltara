import React, { useState } from 'react';
import { 
  Cpu, 
  Gauge, 
  Zap, 
  Sun, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export function AiInsightsSection({
  gridMetrics = {},
  vehicles = [],
  eventLogs = [],
  gridConfig = {},
  stats = {}
}) {
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL' | 'SHED' | 'BOOST' | 'WARN' | 'INFO'
  const [isLogExpanded, setIsLogExpanded] = useState(true);

  const {
    transformerCapacityKW = 120,
    transformerLoadPercent = 0,
    transformerHeadroomKW = 0,
    totalEVChargingKW = 0,
    solarGenerationKW = 0,
    renewableEVSharePercent = 0,
    cleanEnergySelfConsumptionPercent = 100,
    isOverloadImminent = false,
    isOverloadPrevented = false
  } = gridMetrics;

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => (v.currentAllocatedPower || 0) > 0);
  const activeCount = activeVehicles.length;
  const urgentCount = vehicles.filter(v => v.urgencyLevel === 'CRITICAL' || v.priorityMode === 'EXPRESS').length;
  const ecoSolarCount = vehicles.filter(v => v.priorityMode === 'ECO_SOLAR').length;
  const throttledCount = vehicles.filter(v => v.status === 'THROTTLED' || (v.currentAllocatedPower === 0 && v.status !== 'COMPLETED' && v.status !== 'PAUSED')).length;

  // 1. GRID INSIGHT LOGIC
  let gridInsight = {
    title: 'Grid headroom is healthy',
    statusBadge: 'OPTIMAL STABILITY',
    badgeType: 'success',
    detail: `Substation operating comfortably at ${transformerLoadPercent}% load with ${transformerHeadroomKW} kW safety headroom available for EV clustering.`,
    metricLabel: 'Available Headroom',
    metricValue: `${transformerHeadroomKW} kW`,
    subMetric: `${transformerLoadPercent}% Transformer Load`,
    icon: ShieldCheck,
    color: 'var(--primary)'
  };

  if (transformerLoadPercent >= 92 || isOverloadImminent) {
    gridInsight = {
      title: 'Grid capacity critical — Protection engaged',
      statusBadge: 'CRITICAL LOAD',
      badgeType: 'danger',
      detail: `Transformer load is at ${transformerLoadPercent}% (${transformerHeadroomKW} kW remaining). Voltara has throttled non-urgent bays to protect localized assets.`,
      metricLabel: 'Safety Headroom',
      metricValue: `${transformerHeadroomKW} kW`,
      subMetric: `${transformerLoadPercent}% High Utilization`,
      icon: AlertTriangle,
      color: 'var(--danger)'
    };
  } else if (transformerLoadPercent >= 80) {
    gridInsight = {
      title: 'Grid capacity is tightening',
      statusBadge: 'HIGH DEMAND',
      badgeType: 'warning',
      detail: `Transformer utilization has reached ${transformerLoadPercent}%. Power allocations are automatically modulated across low-urgency vehicles.`,
      metricLabel: 'Available Headroom',
      metricValue: `${transformerHeadroomKW} kW`,
      subMetric: `${transformerLoadPercent}% Transformer Load`,
      icon: Gauge,
      color: 'var(--warning)'
    };
  }

  // 2. CHARGING INSIGHT LOGIC
  let chargingInsight = {
    title: 'Charging load is being optimized',
    statusBadge: 'DYNAMIC WATER-FILLING',
    badgeType: 'electric',
    detail: `Allocating ${totalEVChargingKW} kW dynamically across ${activeCount} active vehicle(s) based on battery deficits and departure deadlines.`,
    metricLabel: 'Active EV Demand',
    metricValue: `${totalEVChargingKW} kW`,
    subMetric: `${activeCount} of ${totalVehicles} Bays Drawing Power`,
    icon: Zap,
    color: 'var(--electric)'
  };

  if (activeCount === 0 && totalVehicles > 0) {
    chargingInsight = {
      title: 'EV cluster on standby',
      statusBadge: 'STANDBY READY',
      badgeType: 'neutral',
      detail: 'All connected vehicles have satisfied target SoC or are held in standby mode. Zero idle power loss across all bays.',
      metricLabel: 'Cluster Draw',
      metricValue: '0.0 kW',
      subMetric: `${totalVehicles} Vehicles Satisfied`,
      icon: CheckCircle2,
      color: 'var(--secondary)'
    };
  } else if (throttledCount > 0) {
    chargingInsight = {
      title: 'Selective power modulation active',
      statusBadge: 'LOAD BALANCED',
      badgeType: 'warning',
      detail: `${throttledCount} low-urgency vehicle(s) throttled to maintain aggregate demand below the ${transformerCapacityKW} kW transformer cap.`,
      metricLabel: 'Optimized EV Load',
      metricValue: `${totalEVChargingKW} kW`,
      subMetric: `${throttledCount} Throttled for Headroom`,
      icon: Activity,
      color: 'var(--warning)'
    };
  }

  // 3. RENEWABLE INSIGHT LOGIC
  let renewableInsight = {
    title: 'Solar is offsetting grid demand',
    statusBadge: 'CLEAN ENERGY BOOST',
    badgeType: 'success',
    detail: `${solarGenerationKW} kW solar output is supplying ${renewableEVSharePercent}% of EV demand with ${cleanEnergySelfConsumptionPercent}% local self-consumption.`,
    metricLabel: 'Solar Generation',
    metricValue: `${solarGenerationKW} kW`,
    subMetric: `${renewableEVSharePercent}% EV Solar Share`,
    icon: Sun,
    color: 'var(--primary)'
  };

  if (solarGenerationKW <= 0.5) {
    renewableInsight = {
      title: 'Grid-supplied off-peak charging',
      statusBadge: 'ZERO SOLAR (OFF-PEAK)',
      badgeType: 'neutral',
      detail: 'Zero solar irradiance detected at current simulation hour. EV cluster drawing directly from utility grid with peak limiter active.',
      metricLabel: 'Solar Generation',
      metricValue: '0.0 kW',
      subMetric: '100% Utility Grid Sourced',
      icon: Sun,
      color: 'var(--text-dim)'
    };
  } else if (renewableEVSharePercent < 35) {
    renewableInsight = {
      title: 'Partial solar assistance active',
      statusBadge: 'HYBRID SUPPLY',
      badgeType: 'electric',
      detail: `${solarGenerationKW} kW solar generation is partially buffering building base demand, supplying ${renewableEVSharePercent}% clean power to EV bays.`,
      metricLabel: 'Solar Generation',
      metricValue: `${solarGenerationKW} kW`,
      subMetric: `${renewableEVSharePercent}% Clean Energy Share`,
      icon: Sparkles,
      color: 'var(--electric)'
    };
  }

  // 4. PRIORITY & SCHEDULING INSIGHT LOGIC
  let priorityInsight = {
    title: 'Vehicle priority dynamically balanced',
    statusBadge: 'FAIR-SHARE SCHEDULING',
    badgeType: 'electric',
    detail: 'No critical deadline conflicts detected. Available power is distributed proportionally across all bays according to urgency scores.',
    metricLabel: 'Urgency Model',
    metricValue: 'Proportional',
    subMetric: `${totalVehicles} Active Priority Profiles`,
    icon: Clock,
    color: 'var(--electric)'
  };

  if (urgentCount > 0) {
    priorityInsight = {
      title: 'Priority preemption in effect',
      statusBadge: 'EXPRESS DISPATCH',
      badgeType: 'danger',
      detail: `${urgentCount} vehicle(s) with tight departure deadlines or Express tier overrides have been granted top-tier power allocation.`,
      metricLabel: 'High-Urgency EVs',
      metricValue: `${urgentCount} Priority`,
      subMetric: 'Preemptive Headroom Quota',
      icon: Clock,
      color: '#D9480F'
    };
  } else if (ecoSolarCount > 0) {
    priorityInsight = {
      title: 'Eco Clean solar-following enabled',
      statusBadge: 'SOLAR-FOLLOWING',
      badgeType: 'success',
      detail: `${ecoSolarCount} vehicle(s) configured for Eco Clean charging, drawing power strictly during solar generation surpluses.`,
      metricLabel: 'Eco Solar EVs',
      metricValue: `${ecoSolarCount} Vehicles`,
      subMetric: 'Zero Grid Carbon Draw',
      icon: Sun,
      color: 'var(--primary)'
    };
  }

  // Filtered Event Logs
  const filteredLogs = eventLogs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.type === logFilter;
  });

  return (
    <div className="ai-insights-container">
      {/* 1. Dynamic 4-Card Real Simulation Insights Deck */}
      <div className="ai-insights-grid">
        {/* CARD 1: GRID CAPACITY */}
        <div className="ai-insight-card">
          <div className="ai-card-top">
            <div className="ai-card-category">
              <span className="ai-category-label">01 / GRID DISPATCH</span>
              <span className={`ai-badge ${gridInsight.badgeType}`}>
                {gridInsight.statusBadge}
              </span>
            </div>
            <div className="ai-icon-box" style={{ background: 'rgba(8, 127, 91, 0.1)', color: gridInsight.color }}>
              <gridInsight.icon size={18} />
            </div>
          </div>

          <div className="ai-card-body">
            <h3 className="ai-card-title">{gridInsight.title}</h3>
            <p className="ai-card-detail">{gridInsight.detail}</p>
          </div>

          <div className="ai-card-footer">
            <div className="ai-metric-item">
              <span className="ai-metric-label">{gridInsight.metricLabel}</span>
              <span className="ai-metric-val font-mono">{gridInsight.metricValue}</span>
            </div>
            <div className="ai-submetric-tag font-mono">
              {gridInsight.subMetric}
            </div>
          </div>
        </div>

        {/* CARD 2: CHARGING LOAD */}
        <div className="ai-insight-card">
          <div className="ai-card-top">
            <div className="ai-card-category">
              <span className="ai-category-label">02 / CHARGING OPTIMIZATION</span>
              <span className={`ai-badge ${chargingInsight.badgeType}`}>
                {chargingInsight.statusBadge}
              </span>
            </div>
            <div className="ai-icon-box" style={{ background: 'rgba(21, 151, 229, 0.1)', color: chargingInsight.color }}>
              <chargingInsight.icon size={18} />
            </div>
          </div>

          <div className="ai-card-body">
            <h3 className="ai-card-title">{chargingInsight.title}</h3>
            <p className="ai-card-detail">{chargingInsight.detail}</p>
          </div>

          <div className="ai-card-footer">
            <div className="ai-metric-item">
              <span className="ai-metric-label">{chargingInsight.metricLabel}</span>
              <span className="ai-metric-val font-mono">{chargingInsight.metricValue}</span>
            </div>
            <div className="ai-submetric-tag font-mono">
              {chargingInsight.subMetric}
            </div>
          </div>
        </div>

        {/* CARD 3: RENEWABLE INTEGRATION */}
        <div className="ai-insight-card">
          <div className="ai-card-top">
            <div className="ai-card-category">
              <span className="ai-category-label">03 / RENEWABLE ENERGY</span>
              <span className={`ai-badge ${renewableInsight.badgeType}`}>
                {renewableInsight.statusBadge}
              </span>
            </div>
            <div className="ai-icon-box" style={{ background: 'rgba(18, 184, 134, 0.1)', color: renewableInsight.color }}>
              <renewableInsight.icon size={18} />
            </div>
          </div>

          <div className="ai-card-body">
            <h3 className="ai-card-title">{renewableInsight.title}</h3>
            <p className="ai-card-detail">{renewableInsight.detail}</p>
          </div>

          <div className="ai-card-footer">
            <div className="ai-metric-item">
              <span className="ai-metric-label">{renewableInsight.metricLabel}</span>
              <span className="ai-metric-val font-mono">{renewableInsight.metricValue}</span>
            </div>
            <div className="ai-submetric-tag font-mono">
              {renewableInsight.subMetric}
            </div>
          </div>
        </div>

        {/* CARD 4: PRIORITY & DEADLINES */}
        <div className="ai-insight-card">
          <div className="ai-card-top">
            <div className="ai-card-category">
              <span className="ai-category-label">04 / PRIORITY SCHEDULING</span>
              <span className={`ai-badge ${priorityInsight.badgeType}`}>
                {priorityInsight.statusBadge}
              </span>
            </div>
            <div className="ai-icon-box" style={{ background: 'rgba(233, 162, 59, 0.12)', color: priorityInsight.color }}>
              <priorityInsight.icon size={18} />
            </div>
          </div>

          <div className="ai-card-body">
            <h3 className="ai-card-title">{priorityInsight.title}</h3>
            <p className="ai-card-detail">{priorityInsight.detail}</p>
          </div>

          <div className="ai-card-footer">
            <div className="ai-metric-item">
              <span className="ai-metric-label">{priorityInsight.metricLabel}</span>
              <span className="ai-metric-val font-mono">{priorityInsight.metricValue}</span>
            </div>
            <div className="ai-submetric-tag font-mono">
              {priorityInsight.subMetric}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Integrated Autonomous Decision Stream & Event Telemetry Feed */}
      <div className="ai-decision-feed-panel">
        <div className="ai-feed-header">
          <div className="ai-feed-title-wrap">
            <div className="ai-feed-icon-wrap">
              <Terminal size={16} />
            </div>
            <div>
              <h4 className="ai-feed-heading">Autonomous Algorithmic Decision Stream</h4>
              <p className="ai-feed-subtext">Real-time audit log of power allocation, load shedding, and solar routing decisions</p>
            </div>
          </div>

          <div className="ai-feed-controls">
            <div className="ai-log-filter-chips">
              <button
                className={`ai-chip ${logFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setLogFilter('ALL')}
              >
                All ({eventLogs.length})
              </button>
              <button
                className={`ai-chip ${logFilter === 'SHED' ? 'active' : ''}`}
                onClick={() => setLogFilter('SHED')}
              >
                Load Shed
              </button>
              <button
                className={`ai-chip ${logFilter === 'BOOST' ? 'active' : ''}`}
                onClick={() => setLogFilter('BOOST')}
              >
                Solar Boost
              </button>
              <button
                className={`ai-chip ${logFilter === 'WARN' ? 'active' : ''}`}
                onClick={() => setLogFilter('WARN')}
              >
                Alerts
              </button>
            </div>

            <button
              className="ai-collapse-btn"
              onClick={() => setIsLogExpanded(!isLogExpanded)}
              title={isLogExpanded ? 'Collapse Log Stream' : 'Expand Log Stream'}
              aria-label="Toggle Event Logs"
            >
              {isLogExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {isLogExpanded && (
          <div className="ai-logs-scroll-area">
            {filteredLogs.length === 0 ? (
              <div className="ai-log-empty">No events match filter &quot;{logFilter}&quot;.</div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className={`ai-log-row ${log.type}`}>
                  <span className="ai-log-timestamp font-mono">{log.timestamp}</span>
                  <div className="ai-log-badge font-mono">
                    {log.type === 'SHED' && 'LOAD SHED'}
                    {log.type === 'BOOST' && 'SOLAR BOOST'}
                    {log.type === 'WARN' && 'GRID ALERT'}
                    {log.type === 'COMPLETE' && 'CHARGED'}
                    {log.type === 'INFO' && 'OPTIMIZER'}
                  </div>
                  <span className="ai-log-msg">{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
