import React from 'react';
import { getWaterLevelStatus, formatTimeAgo } from '../utils/helpers';

const WaterLevelGauge = ({ waterLevel, lastUpdated }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  // Clean value
  const val = typeof waterLevel === 'number' ? Math.max(0, Math.min(100, waterLevel)) : 0;
  const strokeDashoffset = circumference - (val / 100) * circumference;
  
  const statusInfo = getWaterLevelStatus(waterLevel);
  
  let arcColor = 'var(--bg-secondary)'; // default
  if (waterLevel !== null && waterLevel !== undefined) {
    if (val > 40) arcColor = 'var(--accent-green)';
    else if (val > 0) arcColor = 'var(--accent-amber)';
    else arcColor = 'var(--accent-red)';
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 className="card-title" style={{ width: '100%', justifyContent: 'flex-start' }}>Water Level</h3>
      
      <div className="gauge-container">
        <svg width="200" height="200" className="gauge-svg">
          <circle 
            cx="100" cy="100" r={radius} 
            className="gauge-track"
          />
          <circle 
            cx="100" cy="100" r={radius} 
            className="gauge-arc"
            style={{ 
              stroke: arcColor,
              strokeDasharray: circumference,
              strokeDashoffset: isNaN(strokeDashoffset) ? circumference : strokeDashoffset
            }}
          />
        </svg>
        <div className="gauge-text">
          <div className="gauge-value">{waterLevel !== null && waterLevel !== undefined ? `${Math.round(val)}%` : '--'}</div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <div className={`badge ${statusInfo.badge}`} style={{ fontSize: '1rem', padding: '6px 16px' }}>
          {statusInfo.status.replace('_', ' ')}
        </div>
        <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
          Updated: {formatTimeAgo(lastUpdated)}
        </div>
      </div>
    </div>
  );
};

export default WaterLevelGauge;
