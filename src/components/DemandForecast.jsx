import React, { useEffect, useState } from 'react';

export function DemandForecast() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/forecast')
      .then((response) => response.json())
      .then((data) => {
        setForecast(data.forecast || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Forecast API error:', error);
        setLoading(false);
      });
  }, []);

  return (
    <section style={{
      margin: '40px 0',
      padding: '28px',
      border: '1px solid #dce9e5',
      borderRadius: '20px',
      background: '#ffffff'
    }}>
      <div style={{ marginBottom: '22px' }}>
        <div style={{
          fontSize: '12px',
          letterSpacing: '2px',
          color: '#008f68',
          fontWeight: '700'
        }}>
          AI DEMAND FORECAST
        </div>

        <h2 style={{
          margin: '8px 0',
          color: '#123b36'
        }}>
          Predicted Building Load
        </h2>

        <p style={{ color: '#68807c', margin: 0 }}>
          Machine-learning forecast from historical building energy data.
        </p>
      </div>

      {loading ? (
        <p>Loading forecast...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          {forecast.map((item, index) => (
            <div
              key={item.timestamp}
              style={{
                padding: '20px',
                borderRadius: '14px',
                background: '#f5faf8',
                border: '1px solid #e0ece8'
              }}
            >
              <div style={{
                fontSize: '13px',
                color: '#718783',
                marginBottom: '10px'
              }}>
                +{(index + 1) * 15} min
              </div>

              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#008f68'
              }}>
                {item.predicted_building_load_kw}
              </div>

              <div style={{
                fontSize: '13px',
                color: '#718783'
              }}>
                kW predicted
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '20px',
        fontSize: '12px',
        color: '#7a8e8a'
      }}>
        Model: Linear Regression • Forecast horizon: 60 minutes
      </div>
    </section>
  );
}