import * as db from '../database/database.js';

export const getFleet = (req, res) => {
  try {
    res.json(db.getFleetOverview());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Fleet fetch failed' });
  }
};

export const getCoaches = (req, res) => {
  try {
    let list = db.getAllDevicesWithLatest();
    const { zone, depot, status, rake_id, search } = req.query;
    if (zone) list = list.filter((c) => c.zone === zone);
    if (depot) list = list.filter((c) => c.depot === depot);
    if (rake_id) list = list.filter((c) => c.rake_id === rake_id);
    if (status) list = list.filter((c) => c.status === status);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) =>
        (c.coach_number || '').toLowerCase().includes(s) ||
        (c.device_id || '').toLowerCase().includes(s) ||
        (c.train_number || '').includes(s)
      );
    }
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Coaches fetch failed' });
  }
};

export const getRakes = (req, res) => {
  try {
    res.json(db.getRakesWithStatus());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Rakes fetch failed' });
  }
};

export const getRakeById = (req, res) => {
  try {
    const rake = db.getRakeDetail(req.params.id);
    if (!rake) return res.status(404).json({ error: 'Rake not found' });
    res.json(rake);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Rake fetch failed' });
  }
};

export const createCoach = (req, res) => {
  try {
    const { device_id, coach_number } = req.body;
    if (!device_id || !coach_number) return res.status(400).json({ error: 'device_id and coach_number required' });
    if (db.getDevice(device_id)) return res.status(400).json({ error: 'Device ID already exists' });
    res.json(db.addDevice(req.body));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Create coach failed' });
  }
};

export const editCoach = (req, res) => {
  try {
    res.json(db.updateDevice(req.params.id, req.body));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Update coach failed' });
  }
};

export const removeCoach = (req, res) => {
  try {
    res.json(db.deleteDevice(req.params.id));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete coach failed' });
  }
};

export const createRake = (req, res) => {
  try {
    const { rake_id } = req.body;
    if (!rake_id) return res.status(400).json({ error: 'rake_id required' });
    if (db.getRakeDetail(rake_id)) return res.status(400).json({ error: 'Rake ID already exists' });
    res.json(db.addRake(req.body));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Create rake failed' });
  }
};

export const editRake = (req, res) => {
  try {
    res.json(db.updateRake(req.params.id, req.body));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Update rake failed' });
  }
};

export const removeRake = (req, res) => {
  try {
    const r = db.deleteRake(req.params.id);
    if (!r.success) return res.status(400).json({ error: r.error });
    res.json(r);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete rake failed' });
  }
};

export const listSupervisors = (req, res) => {
  try {
    res.json(db.getSupervisors());
  } catch (e) {
    res.status(500).json({ error: 'Supervisors fetch failed' });
  }
};

export const createSupervisor = (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'name and phone required' });
    res.json(db.addSupervisor(req.body));
  } catch (e) {
    res.status(500).json({ error: 'Create failed' });
  }
};

export const editSupervisor = (req, res) => {
  try {
    res.json(db.updateSupervisor(req.params.id, req.body));
  } catch (e) {
    res.status(500).json({ error: 'Update failed' });
  }
};

export const removeSupervisor = (req, res) => {
  try {
    res.json(db.deleteSupervisor(req.params.id));
  } catch (e) {
    res.status(500).json({ error: 'Delete failed' });
  }
};

export const allAlerts = (req, res) => {
  try {
    res.json(db.getAllAlerts(parseInt(req.query.limit || '100', 10)));
  } catch (e) {
    res.status(500).json({ error: 'Alerts fetch failed' });
  }
};

export const reports = (req, res) => {
  try {
    res.json(db.getReportsSummary());
  } catch (e) {
    res.status(500).json({ error: 'Reports fetch failed' });
  }
};
