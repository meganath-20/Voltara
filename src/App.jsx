import React, { useState, useEffect } from 'react';
import { useGridSimulation } from './hooks/useGridSimulation';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SectionNav } from './components/SectionNav';
import { ScrollReveal } from './components/ScrollReveal';
import { KpiMetricsBar } from './components/KpiMetricsBar';
import { EnergyFlowDiagram } from './components/EnergyFlowDiagram';
import { GridFlowStory } from './components/GridFlowStory';
import { LiveLoadSection } from './components/LiveLoadSection';
import { TransformerGauge } from './components/TransformerGauge';
import { TelemetryChart } from './components/TelemetryChart';
import { ChargingBayGrid } from './components/ChargingBayGrid';
import { ScenarioControls } from './components/ScenarioControls';
import { AiInsightsSection } from './components/AiInsightsSection';
import { ImpactSection } from './components/ImpactSection';
import { AddVehicleModal } from './components/AddVehicleModal';
import { ChargePactModal } from './components/ChargePactModal';
import { SmartMetricsDashboard } from './components/SmartMetricsDashboard';

const SECTION_IDS = [
  'overview',
  'grid-flow',
  'live-load',
  'smart-metrics',
  'ev-bays',
  'ai-insights',
  'scenarios',
  'impact'
];

export function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const {
    vehicles,
    gridMetrics,
    gridConfig,
    setGridConfig,
    manualBuildingKW,
    setManualBuildingKW,
    manualSolarKW,
    setManualSolarKW,
    manualGridLimitKW,
    setManualGridLimitKW,
    telemetryHistory,
    eventLogs,
    stats,
    // Scenarios
    triggerBuildingSurge,
    triggerSolarCloudDrop,
    triggerCurtailmentEvent,
    triggerFleetRush,
    resetScenarios,
    // EV actions
    updateVehiclePriority,
    toggleVehiclePause,
    addVehicle,
    removeVehicle,
    // Pact actions
    activePactProposal,
    acceptChargePact,
    declineChargePact
  } = useGridSimulation();

  // Synchronize active section based on scroll position accounting for sticky header
  useEffect(() => {
    let rafId = null;

    const updateActiveSection = () => {
      // Header height is 72px, headerOffset is 84px.
      // Use focal reading point of 110px below top of viewport.
      const scrollPosition = window.scrollY + 110;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // When user reaches near the bottom of the page, activate the final section
      if (window.scrollY + windowHeight >= documentHeight - 60) {
        setActiveSection(SECTION_IDS[SECTION_IDS.length - 1]);
        return;
      }

      // Determine which section currently encompasses the focal reading line
      let currentId = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (top <= scrollPosition) {
            currentId = id;
          } else {
            break;
          }
        }
      }

      setActiveSection(prev => (prev !== currentId ? currentId : prev));
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateActiveSection(); // Initialize on mount

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Robust smooth scroll to section accounting for sticky header height
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 84;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      setActiveSection(id);
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="voltara-layout">
      {/* 1. Compact Sticky Header Navigation */}
      <Header
        gridConfig={gridConfig}
        setGridConfig={setGridConfig}
        gridMetrics={gridMetrics}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onReset={resetScenarios}
      />

      {/* 2. Desktop Floating Right-Side Section Indicator */}
      <SectionNav
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* 3. Main Continuous Scrolling Content Body */}
      <main className="continuous-main">
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
          
          {/* SECTION 01 — OVERVIEW & HERO */}
          <section id="overview" className="page-section hero-overview-section">
            {/* Premium Voltara Product Hero */}
            <ScrollReveal>
              <HeroSection
                vehicles={vehicles}
                gridMetrics={gridMetrics}
                onExploreClick={() => scrollToSection('grid-flow')}
              />
            </ScrollReveal>

            {/* Live System Snapshot (KPI Bar Below Hero) */}
            <ScrollReveal>
              <div className="system-snapshot-wrapper">
                <div className="snapshot-header">
                  <div className="snapshot-badge">
                    <span className="status-live-dot" />
                    <span>LIVE SYSTEM SNAPSHOT</span>
                  </div>
                  <span className="snapshot-subtext">Real-time localized telemetry feeds across substation & EV cluster</span>
                </div>
                <KpiMetricsBar
                  gridMetrics={gridMetrics}
                  vehicles={vehicles}
                  stats={stats}
                />
              </div>
            </ScrollReveal>
          </section>

          {/* SECTION 02 — GRID FLOW */}
          <section id="grid-flow" className="page-section grid-flow-section">
            <div className="grid-flow-layout">
              {/* Left Column: Narrative, Headroom Formula & 4-Stage Timeline */}
              <div className="grid-flow-story-col">
                <ScrollReveal>
                  <GridFlowStory gridMetrics={gridMetrics} />
                </ScrollReveal>
              </div>

              {/* Right Column: Interactive Energy Flow Topology */}
              <div className="grid-flow-diagram-col">
                <ScrollReveal>
                  <EnergyFlowDiagram gridMetrics={gridMetrics} />
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* SECTION 03 — LIVE LOAD */}
          <section id="live-load" className="page-section live-load-section">
            <ScrollReveal>
              <LiveLoadSection
                gridMetrics={gridMetrics}
                vehicles={vehicles}
                telemetryHistory={telemetryHistory}
              />
            </ScrollReveal>
          </section>

          {/* SECTION 03.5 — SMART METRICS & FAIRNESS */}
          <ScrollReveal>
            <SmartMetricsDashboard
              gridMetrics={gridMetrics}
              vehicles={vehicles}
            />
          </ScrollReveal>

          {/* SECTION 04 — EV BAYS */}
          <section id="ev-bays" className="page-section">
            <ScrollReveal>
              <div className="section-heading-group">
                <span className="section-eyebrow">04 — EV BAYS</span>
                <h2 className="section-main-title">Every vehicle. Smarter charging.</h2>
                <p className="section-subtitle">
                  Voltara dynamically allocates charging power based on battery state, departure time, grid capacity and available renewable energy.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <ChargingBayGrid
                vehicles={vehicles}
                gridMetrics={gridMetrics}
                onUpdatePriority={updateVehiclePriority}
                onTogglePause={toggleVehiclePause}
                onRemoveVehicle={removeVehicle}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            </ScrollReveal>
          </section>

          {/* SECTION 05 — AI INSIGHTS */}
          <section id="ai-insights" className="page-section">
            <ScrollReveal>
              <div className="section-heading-group">
                <span className="section-eyebrow">05 — AI INSIGHTS</span>
                <h2 className="section-main-title">Intelligence behind every charge.</h2>
                <p className="section-subtitle">
                  Voltara continuously interprets grid demand, vehicle priorities and renewable availability to make charging decisions in real time.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <AiInsightsSection
                gridMetrics={gridMetrics}
                vehicles={vehicles}
                eventLogs={eventLogs}
                gridConfig={gridConfig}
                stats={stats}
              />
            </ScrollReveal>
          </section>

          {/* SECTION 06 — SCENARIOS */}
          <section id="scenarios" className="page-section">
            <ScrollReveal>
              <div className="section-heading-group">
                <span className="section-eyebrow">06 — Scenarios</span>
                <h2 className="section-main-title">Interactive Grid Simulation & Stress-Test Suite</h2>
                <p className="section-subtitle">
                  Test the resilience of Voltara's optimization algorithm against sudden HVAC chiller spikes, solar cloud passes, utility curtailments, and commercial rush arrivals.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <ScenarioControls
                gridConfig={gridConfig}
                setGridConfig={setGridConfig}
                manualBuildingKW={manualBuildingKW}
                setManualBuildingKW={setManualBuildingKW}
                manualSolarKW={manualSolarKW}
                setManualSolarKW={setManualSolarKW}
                manualGridLimitKW={manualGridLimitKW}
                setManualGridLimitKW={setManualGridLimitKW}
                triggerBuildingSurge={triggerBuildingSurge}
                triggerSolarCloudDrop={triggerSolarCloudDrop}
                triggerCurtailmentEvent={triggerCurtailmentEvent}
                triggerFleetRush={triggerFleetRush}
                resetScenarios={resetScenarios}
              />
            </ScrollReveal>
          </section>

          {/* SECTION 07 — IMPACT */}
          <section id="impact" className="page-section">
            <ScrollReveal>
              <div className="section-heading-group">
                <span className="section-eyebrow">07 — Impact</span>
                <h2 className="section-main-title">Cumulative Environmental & Reliability Impact</h2>
                <p className="section-subtitle">
                  Quantified environmental savings, shielded transformer overloads, clean energy throughput, and self-consumption rates.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <ImpactSection
                stats={stats}
                gridMetrics={gridMetrics}
              />
            </ScrollReveal>
          </section>

        </div>
      </main>

      {/* 4. Modal to Connect New EV */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddVehicle={addVehicle}
      />

      {/* 5. Charge Pact Proposal Modal */}
      <ChargePactModal
        activePactProposal={activePactProposal}
        onAccept={acceptChargePact}
        onDecline={declineChargePact}
      />

      {/* 6. Voltara Clean Footer */}
      <footer className="voltara-footer">
        <div>
          <strong style={{ color: 'var(--dark)' }}>Voltara</strong> • Smart EV Charging & Localized Microgrid Coordination System
        </div>
        <div>
          Dynamic fair-share water-filling algorithm with deadline urgency scheduling, rooftop solar self-consumption optimization, and guaranteed transformer overload prevention.
        </div>
      </footer>
    </div>
  );
}

export default App;
