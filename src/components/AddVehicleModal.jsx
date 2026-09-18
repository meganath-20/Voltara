import React, { useState } from 'react';
import { X, Zap, Clock, BatteryCharging } from 'lucide-react';
import { VEHICLE_CATALOG } from '../data/initialData';

export function AddVehicleModal({ isOpen, onClose, onAddVehicle }) {
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);
  const [owner, setOwner] = useState('Guest Driver');
  const [currentSoC, setCurrentSoC] = useState(25);
  const [targetSoC, setTargetSoC] = useState(80);
  const [departureMinutes, setDepartureMinutes] = useState(120);
  const [priorityMode, setPriorityMode] = useState('AUTO');

  if (!isOpen) return null;

  const catalogItem = VEHICLE_CATALOG[selectedModelIdx] || VEHICLE_CATALOG[0];

  const handleSubmit = (e) => {
    e.preventDefault();

    const initialKWh = (currentSoC / 100) * catalogItem.batteryCapacity;

    onAddVehicle({
      owner: owner.trim() || 'Guest Driver',
      model: catalogItem.model,
      batteryCapacity: catalogItem.batteryCapacity,
      currentBatteryKWh: Number(initialKWh.toFixed(1)),
      currentSoC: Number(currentSoC),
      targetSoC: Number(targetSoC),
      arrivalMinutesAgo: 0,
      departureMinutesLeft: Number(departureMinutes),
      maxPower: catalogItem.maxPower,
      priorityMode,
      color: catalogItem.color
    });

    onClose();
  };

  const hours = Math.floor(departureMinutes / 60);
  const mins = departureMinutes % 60;
  const departureFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="section-title">
            <Zap size={20} color="#00f59b" />
            Connect New Electric Vehicle to Cluster
          </h2>
          <button onClick={onClose} className="speed-btn" style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Vehicle Model Selector */}
          <div className="form-group">
            <label className="form-label">Vehicle Model Preset</label>
            <select
              className="form-select"
              value={selectedModelIdx}
              onChange={(e) => setSelectedModelIdx(Number(e.target.value))}
            >
              {VEHICLE_CATALOG.map((item, idx) => (
                <option key={item.model} value={idx}>
                  {item.image} {item.model} ({item.batteryCapacity} kWh pack, max {item.maxPower} kW)
                </option>
              ))}
            </select>
          </div>

          {/* Owner / Driver Name */}
          <div className="form-group">
            <label className="form-label">Owner / Fleet Tag</label>
            <input
              type="text"
              className="form-input"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g. Courier Van #4, Emma Watson"
              required
            />
          </div>

          {/* Current SoC Slider */}
          <div className="form-group">
            <div className="slider-label-row">
              <span className="form-label">Current Battery SoC</span>
              <span className="slider-val" style={{ color: currentSoC < 25 ? '#f43f5e' : '#38bdf8' }}>
                {currentSoC}% ({((currentSoC / 100) * catalogItem.batteryCapacity).toFixed(1)} kWh)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="90"
              step="1"
              value={currentSoC}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCurrentSoC(val);
                if (val >= targetSoC) setTargetSoC(Math.min(100, val + 10));
              }}
            />
          </div>

          {/* Target SoC Slider */}
          <div className="form-group">
            <div className="slider-label-row">
              <span className="form-label">Target Charge Level</span>
              <span className="slider-val" style={{ color: '#00f59b' }}>
                {targetSoC}%
              </span>
            </div>
            <input
              type="range"
              min={Math.min(100, currentSoC + 5)}
              max="100"
              step="1"
              value={targetSoC}
              onChange={(e) => setTargetSoC(Number(e.target.value))}
            />
          </div>

          {/* Departure Deadline Slider */}
          <div className="form-group">
            <div className="slider-label-row">
              <span className="form-label">Departure Deadline</span>
              <span className="slider-val" style={{ color: departureMinutes < 60 ? '#f43f5e' : '#f59e0b' }}>
                {departureFormatted}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="480"
              step="10"
              value={departureMinutes}
              onChange={(e) => setDepartureMinutes(Number(e.target.value))}
            />
          </div>

          {/* Charging Priority Mode */}
          <div className="form-group">
            <label className="form-label">Priority Scheduling Profile</label>
            <select
              className="form-select"
              value={priorityMode}
              onChange={(e) => setPriorityMode(e.target.value)}
            >
              <option value="AUTO">Smart Balanced (Urgency Metric)</option>
              <option value="EXPRESS">Express Priority (Preemptive Top-Tier)</option>
              <option value="ECO_SOLAR">Eco Clean (Surplus Solar Only)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Zap size={16} />
              <span>Plug In & Authorize</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
