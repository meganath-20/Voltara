import React from 'react';

const SECTIONS = [
  { id: 'overview', label: '01 Overview', short: 'Overview' },
  { id: 'grid-flow', label: '02 Grid Flow', short: 'Grid Flow' },
  { id: 'live-load', label: '03 Live Load', short: 'Live Load' },
  { id: 'ev-bays', label: '04 EV Bays', short: 'EV Bays' },
  { id: 'ai-insights', label: '05 AI Insights', short: 'AI Insights' },
  { id: 'scenarios', label: '06 Scenarios', short: 'Scenarios' },
  { id: 'impact', label: '07 Impact', short: 'Impact' }
];

export function SectionNav({ activeSection, onNavigate }) {
  return (
    <nav className="section-nav-tracker" aria-label="Section Navigation">
      {SECTIONS.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            className={`tracker-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(sec.id)}
            title={`Scroll to ${sec.short}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <span className="tracker-dot" />
            <span className="tracker-label">{sec.short}</span>
          </button>
        );
      })}
    </nav>
  );
}
