import React from 'react';
import { ChargingBayCard } from './ChargingBayCard';
import { Layers, Plus, Filter } from 'lucide-react';

export function ChargingBayGrid({
  vehicles,
  onUpdatePriority,
  onTogglePause,
  onRemoveVehicle,
  onOpenAddModal
}) {
  const activeCount = vehicles.filter(v => (v.currentAllocatedPower || 0) > 0).length;
  const completedCount = vehicles.filter(v => v.status === 'COMPLETED' || v.currentSoC >= v.targetSoC).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="cluster-header">
        <div>
          <h2 className="section-title">
            <Layers size={20} color="#38bdf8" />
            Connected EV Charging Bays ({vehicles.length} Total)
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-vehicle power allocation dynamically adjusted based on deadline urgency and grid headroom.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{activeCount} Active</span> |{' '}
            <span style={{ color: '#00f59b', fontWeight: 700 }}>{completedCount} Ready</span>
          </span>

          <button className="btn btn-secondary" onClick={onOpenAddModal} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            <Plus size={14} />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      <div className="bay-grid">
        {vehicles.map(ev => (
          <ChargingBayCard
            key={ev.id}
            vehicle={ev}
            onUpdatePriority={onUpdatePriority}
            onTogglePause={onTogglePause}
            onRemoveVehicle={onRemoveVehicle}
          />
        ))}
      </div>
    </div>
  );
}
