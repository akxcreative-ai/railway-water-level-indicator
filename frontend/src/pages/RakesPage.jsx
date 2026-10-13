import React, { useEffect, useState } from 'react';
import { fetchRakes, fetchRakeDetail, createRake, updateRake, deleteRake } from '../services/api';

const emptyForm = { rake_id: '', train_number: '', train_name: '', source: '', destination: '', zone: '' };

const RakesPage = () => {
  const [rakes, setRakes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => { try { setRakes(await fetchRakes()); } catch (e) { console.error(e); } };
  useEffect(() => { load(); }, []);

  const openRake = async (id) => {
    try { setSelected(await fetchRakeDetail(id)); } catch (e) { console.error(e); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateRake(editing, form);
      else await createRake(form);
      setForm(emptyForm); setEditing(null); setShowForm(false); load();
    } catch (err) { alert(err.message); }
  };

  const inp = (k, ph, req) => (
    <input className="form-input" placeholder={ph} value={form[k]} required={!!req}
      onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2>Rake / Train-wise View (ICMS linked)</h2>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(!showForm); }}>
          {showForm ? 'Close' : '+ Add Rake'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header"><span className="card-title">{editing ? `Edit ${editing}` : 'New Rake / Train'}</span></div>
          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {inp('rake_id', 'Rake ID e.g. RAKE-12423', true)}
              {inp('train_number', 'Train No. e.g. 12423', true)}
              {inp('train_name', 'Train Name e.g. Rajdhani Exp')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {inp('source', 'Source e.g. Dibrugarh')}
              {inp('destination', 'Destination e.g. New Delhi')}
              {inp('zone', 'Zone e.g. NR')}
            </div>
            <div><button className="btn btn-primary" type="submit">{editing ? 'Update Rake' : 'Add Rake'}</button></div>
          </form>
        </div>
      )}

      <div className="grid-2" style={{ display: 'grid', gap: 12 }}>
        {rakes.map((r) => (
          <div key={r.rake_id} className="card">
            <div className="card-header">
              <span className="card-title">{r.train_number} — {r.train_name}</span>
              <span className={`badge ${r.lowCount > 0 ? 'badge-warning' : 'badge-success'}`}>
                {r.lowCount > 0 ? `${r.lowCount} LOW` : 'ALL OK'}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {r.source} → {r.destination} | Zone {r.zone} | Coaches: {r.coachCount}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {(r.coaches || []).map((c) => (
                <span key={c.device_id} className={`badge ${c.status === 'NORMAL' ? 'badge-success' : c.status === 'LOW' ? 'badge-warning' : c.status === 'EMPTY' ? 'badge-danger' : 'badge-neutral'}`}>
                  {c.coach_number}: {c.latest ? `${c.latest.water_level}%` : '--'}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={() => openRake(r.rake_id)}>Open Detail</button>
              <button className="btn btn-sm" onClick={() => { setEditing(r.rake_id); setForm(r); setShowForm(true); }}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={async () => { if (window.confirm(`${r.rake_id} delete?`)) { try { await deleteRake(r.rake_id); load(); } catch (err) { alert(err.message); } } }}>Del</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <span className="card-title">Rake {selected.rake_id} — {selected.train_number} {selected.train_name}</span>
            <button className="btn btn-sm" onClick={() => setSelected(null)}>Close</button>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Coach</th><th>Type</th><th>Device/MPU</th><th>Water %</th><th>Status</th><th>Battery</th><th>Last Update</th></tr></thead>
              <tbody>
                {selected.coaches.map((c) => (
                  <tr key={c.device_id}>
                    <td>{c.coach_number}</td><td>{c.coach_type}</td>
                    <td>{c.device_id}/{c.mpu_id}</td>
                    <td>{c.latest?.water_level ?? '--'}</td>
                    <td>{c.status}</td>
                    <td>{c.latest?.battery_percentage ?? '--'}%</td>
                    <td>{c.latest?.timestamp ?? '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RakesPage;
