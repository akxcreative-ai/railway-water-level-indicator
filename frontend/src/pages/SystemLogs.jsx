import React, { useState, useEffect } from 'react';
import { fetchLogs } from '../services/api';
import { ScrollText, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import DeviceSelector from '../components/DeviceSelector';
import { useSelectedDevice } from '../hooks/useSelectedDevice';
import { formatDateTime } from '../utils/helpers';

const SystemLogs = () => {
  const [selectedDevice] = useSelectedDevice();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();

    // Auto refresh logs every 30 seconds
    const timer = setInterval(loadLogs, 30000);
    return () => clearInterval(timer);
  }, [selectedDevice]);

  const loadLogs = async () => {
    try {
      const res = await fetchLogs(100, selectedDevice);
      setLogs(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (event) => {
    if (!event) return <Info size={18} color="var(--accent-blue)" />;
    if (event.includes('OFFLINE') || event.includes('ERROR')) return <XCircle size={18} color="var(--accent-red)" />;
    if (event.includes('LOW') || event.includes('WARNING')) return <AlertTriangle size={18} color="var(--accent-amber)" />;
    if (event.includes('ONLINE') || event.includes('CONNECTED')) return <CheckCircle size={18} color="var(--accent-green)" />;
    return <Info size={18} color="var(--accent-blue)" />;
  };

  return (
    <div className="animate-fade-in">
      <DeviceSelector />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ScrollText size={28} color="var(--text-primary)" />
          System Logs
        </h2>
        
        <button className="btn" onClick={loadLogs} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      <div className="card">
        <div className="data-table-container" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <table className="data-table">
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', zIndex: 10 }}>
              <tr>
                <th style={{ width: '200px' }}>Timestamp</th>
                <th style={{ width: '180px' }}>Event</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && !loading ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No system logs found. Send some data from the Demo page to generate logs.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {formatDateTime(log.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getLogIcon(log.event)}
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {log.event}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
