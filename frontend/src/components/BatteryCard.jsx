import React from 'react';
import { Battery, BatteryFull, BatteryMedium, BatteryLow, Zap } from 'lucide-react';
import { getBatteryHealth, formatTimeAgo } from '../utils/helpers';

const BatteryCard = ({ batteryPercentage, batteryVoltage, lastUpdated }) => {
  const health = getBatteryHealth(batteryPercentage);
  
  let Icon = Battery;
  let color = 'var(--text-muted)';
  
  if (batteryPercentage !== null && batteryPercentage !== undefined) {
    if (batteryPercentage > 50) { Icon = BatteryFull; color = 'var(--accent-green)'; }
    else if (batteryPercentage >= 20) { Icon = BatteryMedium; color = 'var(--accent-amber)'; }
    else { Icon = BatteryLow; color = 'var(--accent-red)'; }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Icon size={20} color={color} />
          Power Status
        </h3>
        {batteryPercentage !== null && batteryPercentage !== undefined && (
          <span className={`badge badge-${health.color}`}>{health.label}</span>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '16px' }}>
        <div className="stat-value" style={{ color }}>
          {batteryPercentage !== null && batteryPercentage !== undefined ? `${batteryPercentage}%` : '--'}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-secondary">Voltage</span>
          <span style={{ fontWeight: 500 }}>{batteryVoltage !== null && batteryVoltage !== undefined ? `${batteryVoltage}V` : '--'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-secondary">Charging</span>
          <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={14} className="text-muted" /> Unknown
          </span>
        </div>
        <div className="text-sm text-muted" style={{ marginTop: '8px' }}>
          Updated: {formatTimeAgo(lastUpdated)}
        </div>
      </div>
    </div>
  );
};

export default BatteryCard;
