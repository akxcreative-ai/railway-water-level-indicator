import React, { useEffect, useState } from 'react';
import { fetchCoaches, fetchRakes, createCoach, updateCoach, deleteCoach } from '../services/api';

const emptyForm = { device_id: '', mpu_id: '', mac_id: '', coach_number: '', coach_type: 'AC', zone: '', division: '', depot: '', rake_id: '', train_number: '' };

const CoachesPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [rakes, setRakes] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try { setCoaches(await fetchCoaches({ search, status })); } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); fetchRakes().then(setRakes).catch(console.error); }, []);

  const startEdit = (c) => {
    setEditing(c.device_id);
    setForm({
      device_id: c.device_id, mpu_id: c.mpu_id || '', mac_id: c.mac_id || '',
      coach_number: c.coach_number || '', coach_type: c.coach_type || 'AC',
      zone: c.zone || '', division: c.division || '', depot: c.depot || '',
      rake_id: c.rake_id || '', train_number: c.train_number || ''
    });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateCoach(editing, form);
      else await createCoach(form);
      setForm(emptyForm); setEditing(null); setShowForm(false);
      fetchRakes().then(setRakes).catch(console.error);
      load();
    } catch (err) { alert(err.message); }
  };

  const inp = (k, ph, req) => (
    <input className="form-input" placeholder={ph} value={form[k]} required={!!req}
      onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2>Coaches — Zone / Depot / Status filter</h2>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(!showForm); }}>
          {showForm ? 'Close' : '+ Add Coach'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header"><span className="card-title">{editing ? `Edit ${editing}` : 'New Coach / Device Register'}</span></div>
          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {inp('device_id', 'Device ID e.g. WLI-009', true)}
              {inp('coach_number', 'Coach No. e.g. B5', true)}
              <select className="form-select" value={form.coach_type} onChange={(e) => setForm({ ...form, coach_type: e.target.value })}>
                <option>AC</option><option>Non-AC</option><option>SCN</option><option>SLR</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {inp('mpu_id', 'MPU ID e.g. MPU-009')}
              {inp('mac_id', 'MAC ID e.g. AA:BB:CC:DD:EE:09')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-select" value={form.rake_id} onChange={(e) => {
                const r = rakes.find((x) => x.rake_id === e.target.value);
                setForm({ ...form, rake_id: e.target.value, train_number: r ? r.train_number : form.train_number });
              }}>
                <option value="">Select Rake...</option>
                {rakes.map((r) => <option key={r.rake_id} value={r.rake_id}>{r.rake_id} ({r.train_number})</option>)}
              </select>
              {inp('train_number', 'Train No.')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {inp('zone', 'Zone e.g. NR')}
              {inp('division', 'Division e.g. Delhi')}
              {inp('depot', 'Depot e.g. NDLS')}
            </div>
            <div><button className="btn btn-primary" type="submit">{editing ? 'Update Coach' : 'Register Coach'}</button></div>
          </form>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 8 }}>Register ke baad MPU isi Device ID se data bhejeगा — turant dashboard me dikhega. Restart nahi chahiye.</p>
        </div>
      )}

      <div className="card mb-4">
        <div style={{ display: 'flex', gap: 12 }}>
          <input className="form-input" placeholder="Search coach / device / train..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">All Status</option>
            <option value="NORMAL">NORMAL</option>
            <option value="LOW">LOW</option>
            <option value="EMPTY">EMPTY</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>
          <button className="btn btn-primary" onClick={load}>Search</button>
        </div>
      </div>
      <div className="card">
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Coach</th><th>Train/Rake</th><th>Zone/Depot</th><th>Device</th><th>Water</th><th>Status</th><th>Battery</th><th>Network</th><th>Action</th></tr></thead>
            <tbody>
              {coaches.map((c) => (
                <tr key={c.device_id}>
                  <td>{c.coach_number} ({c.coach_type})</td>
                  <td>{c.train_number}/{c.rake_id}</td>
                  <td>{c.zone}/{c.depot}</td>
                  <td>{c.device_id}</td>
                  <td>{c.latest?.water_level ?? '--'}%</td>
                  <td><span className={`badge ${c.status === 'NORMAL' ? 'badge-success' : c.status === 'LOW' ? 'badge-warning' : c.status === 'EMPTY' ? 'badge-danger' : 'badge-neutral'}`}>{c.status}</span></td>
                  <td>{c.latest?.battery_percentage ?? '--'}%</td>
                  <td>{c.latest?.network ?? '--'} ({c.latest?.signal_strength ?? '--'})</td>
                  <td>
                    <button className="btn btn-sm" onClick={() => startEdit(c)}>Edit</button>{' '}
                    <button className="btn btn-sm btn-danger" onClick={async () => { if (window.confirm(`${c.device_id} delete? Iska saara data bhi delete hoga.`)) { try { await deleteCoach(c.device_id); load(); } catch (err) { alert(err.message); } } }}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoachesPage;
