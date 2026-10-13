import React, { useEffect, useState } from 'react';
import { fetchFleetOverview } from '../services/api';
import { getSocket } from '../services/socket';

const badgeFor = (s) => {
  if (s === 'NORMAL') return 'badge-success';
  if (s === 'LOW') return 'badge-warning';
  if (s === 'EMPTY') return 'badge-danger';
  return 'badge-neutral';
};

const FleetDashboard = () => {
  const [data, setData] = useState(null);
  const [zone, setZone] = useState('');
  const [depot, setDepot] = useState('');

  const load = async () => {
    try { setData(await fetchFleetOverview()); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.on('reading:new', load);
    socket.on('alert:new', load);
    return () => { socket.off('reading:new', load); socket.off('alert:new', load); };
  }, []);

  if (!data) return <div className="card">Loading fleet...</div>;
  const { overview } = data;
  let coaches = data.coaches || [];
  if (zone) coaches = coaches.filter((c) => c.zone === zone);
  if (depot) coaches = coaches.filter((c) => c.depot === depot);
  const zones = [...new Set((data.coaches || []).map((c) => c.zone).filter(Boolean))];
  const depots = [...new Set((data.coaches || []).map((c) => c.depot).filter(Boolean))];

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: 12 }}>CRIS Fleet Dashboard — RDSO IS/RDSO-CG/0002:2025</h2>
      <div className="grid-4 mb-4" style={{ display: 'grid', gap: 12 }}>
        <div className="card"><div className="card-header"><span className="card-title">Total Coaches</span></div><h1>{overview.total}</h1></div>
        <div className="card"><div className="card-header"><span className="card-title">Normal (&gt;40%)</span></div><h1 style={{ color: 'var(--accent-green)' }}>{overview.normal}</h1></div>
        <div className="card"><div className="card-header"><span className="card-title">Low (&le;40%)</span></div><h1 style={{ color: 'var(--accent-amber)' }}>{overview.low}</h1></div>
        <div className="card"><div className="card-header"><span className="card-title">Empty (0%)</span></div><h1 style={{ color: 'var(--accent-red)' }}>{overview.empty}</h1></div>
      </div>

      <div className="card mb-4">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select className="form-select" value={zone} onChange={(e) => setZone(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">All Zones</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
          <select className="form-select" value={depot} onChange={(e) => setDepot(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">All Depots</option>
            {depots.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <span style={{ color: 'var(--text-secondary)' }}>Online: {overview.online} | Offline: {overview.offline}</span>
        </div>
      </div>

      <div className="grid-4" style={{ display: 'grid', gap: 12 }}>
        {coaches.map((c) => (
          <div key={c.device_id} className="card">
            <div className="card-header">
              <span className="card-title">Coach {c.coach_number} | {c.train_number}</span>
              <span className={`badge ${badgeFor(c.status)}`}>{c.status}</span>
            </div>
            <div style={{ fontSize: 42, fontWeight: 800 }}>{c.latest ? `${c.latest.water_level}%` : '--'}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {c.device_id} | {c.coach_type} | {c.zone}/{c.depot} | Rake {c.rake_id}<br />
              Batt: {c.latest?.battery_percentage ?? '--'}% | {c.latest?.network ?? '--'} | GPS: {c.latest?.gps_status ?? '--'}
            </div>
            <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, marginTop: 8 }}>
              <div style={{
                width: `${c.latest?.water_level || 0}%`, height: '100%', borderRadius: 4,
                background: c.status === 'NORMAL' ? 'var(--accent-green)' : c.status === 'LOW' ? 'var(--accent-amber)' : 'var(--accent-red)'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetDashboard;
