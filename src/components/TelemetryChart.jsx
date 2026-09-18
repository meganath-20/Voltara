import React, { useRef, useEffect } from 'react';
import { LineChart, Eye } from 'lucide-react';

export function TelemetryChart({ telemetryHistory, currentGridLimit }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const drawWidth = canvas.offsetWidth;
    const drawHeight = canvas.offsetHeight;

    // Clear background
    ctx.clearRect(0, 0, drawWidth, drawHeight);

    const padding = { top: 20, right: 25, bottom: 28, left: 45 };
    const chartW = drawWidth - padding.left - padding.right;
    const chartH = drawHeight - padding.top - padding.bottom;

    // Find max value for scaling (default max 140 kW)
    let maxKW = Math.max(120, currentGridLimit * 1.1);
    telemetryHistory.forEach(pt => {
      maxKW = Math.max(maxKW, pt.transformerLimit, pt.buildingLoad + pt.evTotalLoad, pt.solarGeneration);
    });
    maxKW = Math.ceil(maxKW / 20) * 20; // round to nearest 20

    // Draw Grid Lines & Y Axis Labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const yVal = (maxKW / gridSteps) * i;
      const y = padding.top + chartH - (yVal / maxKW) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(drawWidth - padding.right, y);
      ctx.stroke();

      ctx.fillText(`${Math.round(yVal)} kW`, padding.left - 8, y + 3);
    }

    if (telemetryHistory.length < 2) {
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('Accumulating real-time telemetry stream...', drawWidth / 2, drawHeight / 2);
      return;
    }

    const pointsCount = telemetryHistory.length;
    const stepX = chartW / Math.max(1, pointsCount - 1);

    // Helper to draw smooth series
    const drawSeries = (color, getValue, isDashed = false, fillGradient = null) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      if (isDashed) {
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.8;
      }

      ctx.beginPath();
      telemetryHistory.forEach((pt, idx) => {
        const x = padding.left + idx * stepX;
        const val = getValue(pt);
        const y = padding.top + chartH - (val / maxKW) * chartH;

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          // Bezier control
          const prevX = padding.left + (idx - 1) * stepX;
          const prevY = padding.top + chartH - (getValue(telemetryHistory[idx - 1]) / maxKW) * chartH;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.stroke();

      // Optional Fill Area
      if (fillGradient) {
        const lastX = padding.left + (pointsCount - 1) * stepX;
        const firstX = padding.left;
        const bottomY = padding.top + chartH;

        ctx.lineTo(lastX, bottomY);
        ctx.lineTo(firstX, bottomY);
        ctx.closePath();
        ctx.fillStyle = fillGradient;
        ctx.fill();
      }

      ctx.restore();
    };

    // 1. Solar Generation (Green fill)
    const solarGrad = ctx.createLinearGradient(0, padding.top, 0, drawHeight);
    solarGrad.addColorStop(0, 'rgba(0, 245, 155, 0.25)');
    solarGrad.addColorStop(1, 'rgba(0, 245, 155, 0.0)');
    drawSeries('#00f59b', pt => pt.solarGeneration, false, solarGrad);

    // 2. EV Total Load (Cyan)
    const evGrad = ctx.createLinearGradient(0, padding.top, 0, drawHeight);
    evGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    evGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    drawSeries('#38bdf8', pt => pt.evTotalLoad, false, evGrad);

    // 3. Base Building Load (Violet)
    drawSeries('#a855f7', pt => pt.buildingLoad);

    // 4. Net Grid Import (Amber)
    drawSeries('#f59e0b', pt => pt.netGridImport);

    // 5. Transformer Hard Limit (Dashed Red Line)
    drawSeries('#f43f5e', pt => pt.transformerLimit, true);

    // Draw last point glowing pulses
    const lastPt = telemetryHistory[telemetryHistory.length - 1];
    const lastX = padding.left + (pointsCount - 1) * stepX;

    const drawDot = (val, color) => {
      const y = padding.top + chartH - (val / maxKW) * chartH;
      ctx.beginPath();
      ctx.arc(lastX, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lastX, y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    drawDot(lastPt.evTotalLoad, '#38bdf8');
    drawDot(lastPt.solarGeneration, '#00f59b');

  }, [telemetryHistory, currentGridLimit]);

  return (
    <div className="glass-panel telemetry-card">
      <div className="section-header">
        <h2 className="section-title">
          <LineChart size={20} color="#00f59b" />
          Real-Time Multi-Stream Demand & Capacity Telemetry
        </h2>
        <span className="section-badge font-mono">
          Live Streaming (1 Hz)
        </span>
      </div>

      <div className="chart-wrapper">
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', display: 'block' }} 
        />
      </div>

      {/* Interactive Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color-box" style={{ background: '#f43f5e', border: '1px dashed #fff' }} />
          <span>Transformer Limit (kW)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box" style={{ background: '#38bdf8' }} />
          <span>EV Cluster Load (kW)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box" style={{ background: '#00f59b' }} />
          <span>Solar PV Generation (kW)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box" style={{ background: '#a855f7' }} />
          <span>Facility Building Load (kW)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color-box" style={{ background: '#f59e0b' }} />
          <span>Net Grid Import (kW)</span>
        </div>
      </div>
    </div>
  );
}
