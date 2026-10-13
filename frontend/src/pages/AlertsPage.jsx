import React, { useState, useEffect } from 'react';
import { fetchAlerts, acknowledgeAlert } from '../services/api';
import AlertPanel from '../components/AlertPanel';
import DeviceSelector from '../components/DeviceSelector';
import { useSelectedDevice } from '../hooks/useSelectedDevice';
import { Bell } from 'lucide-react';

const AlertsPage = () => {
  const [selectedDevice] = useSelectedDevice();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, ACKNOWLEDGED
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [selectedDevice]);

  const loadAlerts = async () => {
    try {
      const res = await fetchAlerts(100, selectedDevice);
      setAlerts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: 1 } : a));
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'ACTIVE') return !alert.acknowledged;
    if (filter === 'ACKNOWLEDGED') return alert.acknowledged;
    return true;
  });

  const activeCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="animate-fade-in">
      <DeviceSelector />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={28} color="var(--accent-amber)" />
          Alert Management
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn ${filter === 'ALL' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All ({alerts.length})
          </button>
          <button 
            className={`btn ${filter === 'ACTIVE' ? 'btn-warning' : ''}`}
            onClick={() => setFilter('ACTIVE')}
          >
            Active ({activeCount})
          </button>
          <button 
            className={`btn ${filter === 'ACKNOWLEDGED' ? 'btn-primary' : ''}`}
            onClick={() => setFilter('ACKNOWLEDGED')}
            style={filter === 'ACKNOWLEDGED' ? {} : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            Acknowledged ({alerts.length - activeCount})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="text-secondary mb-2">Total Alerts</div>
          <div className="stat-value">{alerts.length}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="text-secondary mb-2">Active Alerts</div>
          <div className="stat-value text-warning">{activeCount}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="text-secondary mb-2">Critical Alerts</div>
          <div className="stat-value text-danger">
            {alerts.filter(a => a.severity === 'CRITICAL').length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse">Loading alerts...</div>
      ) : (
        <div style={{ minHeight: '500px' }}>
          <AlertPanel alerts={filteredAlerts} onAcknowledge={handleAcknowledge} />
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
