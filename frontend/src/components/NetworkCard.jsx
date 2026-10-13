import React from 'react';
import { Wifi, Signal } from 'lucide-react';
import { getSignalStrengthLabel, formatTimeAgo } from '../utils/helpers';

const NetworkCard = ({ network, signalStrength, lastUpdated }) => {
  const signal = getSignalStrengthLabel(signalStrength);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Wifi size={20} className="text-muted" />
          Network Connectivity
        </h3>
        <span className="badge badge-info">{network || '--'}</span>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Signal size={16} /> Signal Strength
          </span>
          <span style={{ fontWeight: 500 }}>{signalStrength !== null && signalStrength !== undefined ? `${signalStrength}%` : '--'}</span>
        </div>
        
        {/* Signal Bar visualization */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${signalStrength || 0}%`,
            backgroundColor: `var(--accent-${signal.color === 'success' ? 'green' : signal.color === 'warning' ? 'amber' : 'red'})`,
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ fontSize: '0.75rem', marginTop: '4px', textAlign: 'right' }} className={`text-${signal.color}`}>
          {signal.label}
        </div>
      </div>
      
      <div className="text-sm text-muted">
        Updated: {formatTimeAgo(lastUpdated)}
      </div>
    </div>
  );
};

export default NetworkCard;
