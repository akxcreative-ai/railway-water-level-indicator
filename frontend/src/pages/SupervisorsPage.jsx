import React, { useEffect, useState } from 'react';
import { fetchSupervisors, createSupervisor, updateSupervisor, deleteSupervisor } from '../services/api';

const emptyForm = { name: '', phone: '', zone: '', division: '', station: '', role: 'Watering Supervisor' };

const SupervisorsPage = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const load = async () => { try { setList(await fetchSupervisors()); } catch (e) { console.error(e); } };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateSupervisor(editing, form);
      else await createSupervisor(form);
      setForm(emptyForm); setEditing(null); load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: 12 }}>Watering Supervisors — Zonal/Division numbers (Clause 6.10)</h2>
      <div className="grid-2" style={{ display: 'grid', gap: 12 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">{editing ? 'Edit Supervisor' : 'Add Supervisor'}</span></div>
          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <input className="form-input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="form-input" placeholder="Phone (10 digit)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder="Zone e.g. NR" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} />
              <input className="form-input" placeholder="Division e.g. Delhi" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder="Station e.g. NDLS" value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} />
              <input className="form-input" placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Add'}</button>
              {editing && <button className="btn" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
            </div>
          </form>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 8 }}>Low/Empty alert par CRIS inhi numbers par Broadcast/RCS bhejega. Zonal/Division authority yahi update karegi.</p>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Registered Numbers ({list.length})</span></div>
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Station</th><th>Action</th></tr></thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}<br /><small style={{ color: 'var(--text-secondary)' }}>{s.zone}/{s.division} — {s.role}</small></td>
                    <td>{s.phone}</td>
                    <td>{s.station}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => { setEditing(s.id); setForm(s); }}>Edit</button>{' '}
                      <button className="btn btn-sm btn-danger" onClick={async () => { if (window.confirm('Delete?')) { await deleteSupervisor(s.id); load(); } }}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorsPage;
