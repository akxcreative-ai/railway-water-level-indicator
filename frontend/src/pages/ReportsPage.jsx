import React, { useEffect, useState } from 'react';
import { fetchReportsSummary, fetchAllAlerts } from '../services/api';

const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchReportsSummary().then(setSummary).catch(console.error);
    fetchAllAlerts(50).then(setAlerts).catch(console.error);
  }, []);

  if (!summary) return <div className="card">Loading reports...</div>;

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: 12 }}>Reports — Depot / Zone / Alert summary</h2>
      <div className="grid-2" style={{ display: 'grid', gap: 12 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Zone-wise</span></div>
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Zone</th><th>Total</th><th>Low</th><th>Empty</th></tr></thead>
              <tbody>
                {Object.entries(summary.byZone || {}).map(([z, v]) => (
                  <tr key={z}><td>{z}</td><td>{v.total}</td><td>{v.low}</td><td>{v.empty}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Depot-wise</span></div>
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Depot</th><th>Total</th><th>Low</th><th>Empty</th></tr></thead>
              <tbody>
                {Object.entries(summary.byDepot || {}).map(([d, v]) => (
                  <tr key={d}><td>{d}</td><td>{v.total}</td><td>{v.low}</td><td>{v.empty}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="grid-2" style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Alerts by Type</span></div>
          {(summary.alertsByType || []).map((a) => (
            <div key={a.alert_type} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>{a.alert_type}</span><b>{a.count}</b>
            </div>
          ))}
          <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Total coaches: {summary.totalCoaches} | 15-min cycle, no duplicate data (Clause 6.7)</p>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Latest 50 Alerts (Low 40% / Empty)</span></div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {alerts.map((a) => (
              <div key={a.id} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span className={`badge ${a.severity === 'CRITICAL' ? 'badge-danger' : a.severity === 'WARNING' ? 'badge-warning' : 'badge-info'}`}>{a.alert_type}</span>{' '}
                {a.device_id} — {a.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
