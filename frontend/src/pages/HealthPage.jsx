import React, { useEffect, useState } from 'react';
import { fetchCoaches, fetchAllAlerts } from '../services/api';

const HealthPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchCoaches().then(setCoaches).catch(console.error);
    fetchAllAlerts(100).then(setAlerts).catch(console.error);
  }, []);

  const lowBatt = coaches.filter((c) => (c.latest?.battery_percentage ?? 100) <= 20);
  const sensorErr = alerts.filter((a) => a.alert_type === 'SENSOR_ERROR').slice(0, 10);
  const offline = coaches.filter((c) => !c.online);

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: 12 }}>Device Health — Battery / Sensor / Offline / Theft</h2>
      <div className="grid-3 mb-4" style={{ display: 'grid', gap: 12 }}>
        <div className="card"><div className="card-header"><span className="card-title">Low Battery (&le;20%)</span></div><h1 style={{ color: 'var(--accent-amber)' }}>{lowBatt.length}</h1></div>
        <div className="card"><div className="card-header"><span className="card-title">Offline Devices</span></div><h1 style={{ color: 'var(--accent-red)' }}>{offline.length}</h1></div>
        <div className="card"><div className="card-header"><span className="card-title">Online</span></div><h1 style={{ color: 'var(--accent-green)' }}>{coaches.length - offline.length}</h1></div>
      </div>
      <div className="grid-2" style={{ display: 'grid', gap: 12 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Battery Status per Coach</span></div>
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Coach/Device</th><th>Batt %</th><th>Voltage</th><th>Status</th></tr></thead>
              <tbody>
                {coaches.map((c) => (
                  <tr key={c.device_id}>
                    <td>{c.coach_number} / {c.device_id}</td>
                    <td>{c.latest?.battery_percentage ?? '--'}%</td>
                    <td>{c.latest?.battery_voltage ?? '--'}V</td>
                    <td>{(c.latest?.battery_percentage ?? 100) <= 20 ? <span className="badge badge-warning">REPLACE</span> : <span className="badge badge-success">OK</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Offline / No-Comm (Theft-Vandalism suspect)</span></div>
          {offline.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>All devices communicating.</p> : offline.map((c) => (
            <div key={c.device_id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <b>{c.coach_number} / {c.device_id}</b> — last seen {c.latest?.timestamp || c.last_seen || 'never'}
              <br /><small style={{ color: 'var(--accent-red)' }}>CRIS → Supplier interface ko downtime ticket bhejo (Clause 6.8 suggestion)</small>
            </div>
          ))}
          <div className="card-header" style={{ marginTop: 12 }}><span className="card-title">Recent Sensor Errors</span></div>
          {sensorErr.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No sensor errors.</p> : sensorErr.map((a) => (
            <div key={a.id} style={{ fontSize: 13 }}>{a.device_id} — {a.message}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
