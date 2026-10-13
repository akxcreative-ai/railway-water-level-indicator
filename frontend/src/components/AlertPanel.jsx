import React from 'react';
import { AlertTriangle, Info, Bell, CheckCircle } from 'lucide-react';
import { formatTimeAgo } from '../utils/helpers';

const AlertPanel = ({ alerts, onAcknowledge }) => {
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'CRITICAL': return { icon: AlertTriangle, color: 'var(--accent-red)', bg: 'rgba(239, 68, 68, 0.1)', badge: 'badge-danger' };
      case 'HIGH': return { icon: AlertTriangle, color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.1)', badge: 'badge-warning' };
      case 'WARNING': return { icon: Info, color: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.1)', badge: 'badge-info' };
      default: return { icon: Bell, color: 'var(--text-muted)', bg: 'var(--bg-secondary)', badge: 'badge-neutral' };
    }
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <h3 className="card-title">
          <Bell size={20} className="text-muted" />
          Active Alerts
        </h3>
        <span className="badge badge-danger">{alerts?.filter(a => !a.acknowledged).length || 0} New</span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!alerts || alerts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '24px' }}>
            No active alerts
          </div>
        ) : (
          alerts.map(alert => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;
            
            return (
              <div key={alert.id} className={`alert-item ${alert.acknowledged ? 'acknowledged' : ''}`}>
                <div className="alert-icon" style={{ backgroundColor: config.bg, color: config.color }}>
                  <Icon size={20} />
                </div>
                <div className="alert-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="alert-title">{alert.alert_type.replace('_', ' ')}</div>
                    <span className={`badge ${config.badge}`}>{alert.severity}</span>
                  </div>
                  <div style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                    Value: {alert.value}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="alert-time">{formatTimeAgo(alert.created_at)}</span>
                    {!alert.acknowledged && (
                      <button 
                        className="btn btn-sm" 
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        <CheckCircle size={14} /> Ack
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
