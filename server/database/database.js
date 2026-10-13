import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// DB_PATH env se (OneDrive-sync bahar) warna local file — OneDrive lock se save fail hota tha
const dbPath = process.env.DB_PATH || path.join(__dirname, 'wli.db');
try {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
} catch (e) { /* ignore */ }

let db;

const saveToDisk = () => {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Error persisting database:', err);
  }
};

const SQL = await initSqlJs();
if (fs.existsSync(dbPath)) {
  const filebuffer = fs.readFileSync(dbPath);
  db = new SQL.Database(filebuffer);
} else {
  db = new SQL.Database();
}

// Helper to convert sql.js exec result into array of objects (hoisted above initDb)
function queryObjects(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

const initDb = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT UNIQUE NOT NULL,
      mpu_id TEXT,
      mac_id TEXT,
      device_name TEXT DEFAULT 'Water Level Indicator',
      firmware_version TEXT DEFAULT '1.0.0',
      sensor_id TEXT DEFAULT 'WLS-001',
      installation_status TEXT DEFAULT 'INSTALLED',
      created_at TEXT DEFAULT (datetime('now')),
      last_seen TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS water_level_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      water_level REAL,
      battery_percentage REAL,
      battery_voltage REAL,
      latitude REAL,
      longitude REAL,
      network TEXT,
      signal_strength INTEGER,
      sensor_status TEXT,
      gps_status TEXT,
      is_demo INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (device_id) REFERENCES devices(device_id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      value REAL,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      acknowledged INTEGER DEFAULT 0,
      FOREIGN KEY (device_id) REFERENCES devices(device_id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      event TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // ---- RDSO multi-coach migration: new columns on devices ----
  const migrateAddColumn = (col, def) => {
    try { db.run(`ALTER TABLE devices ADD COLUMN ${col} ${def}`); } catch (e) { /* already exists */ }
  };
  migrateAddColumn('coach_number', 'TEXT');
  migrateAddColumn('coach_type', 'TEXT DEFAULT \'AC\'');
  migrateAddColumn('zone', 'TEXT');
  migrateAddColumn('division', 'TEXT');
  migrateAddColumn('depot', 'TEXT');
  migrateAddColumn('rake_id', 'TEXT');
  migrateAddColumn('train_number', 'TEXT');

  db.run(`
    CREATE TABLE IF NOT EXISTS rakes (
      rake_id TEXT PRIMARY KEY,
      train_number TEXT,
      train_name TEXT,
      source TEXT,
      destination TEXT,
      zone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS supervisors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      zone TEXT,
      division TEXT,
      station TEXT,
      role TEXT DEFAULT 'Watering Supervisor',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const res = db.exec("SELECT * FROM devices WHERE device_id = 'WLI-001'");
  if (!res.length || !res[0].values.length) {
    db.run(
      "INSERT INTO devices (device_id, mpu_id, mac_id, device_name, firmware_version, sensor_id) VALUES (?, ?, ?, ?, ?, ?)",
      ['WLI-001', 'MPU-001', 'AA:BB:CC:DD:EE:FF', 'Water Level Indicator - Coach 1', '1.0.0', 'WLS-001']
    );
    console.log('Inserted default device WLI-001');
    saveToDisk();
  }

  // ---- Seed rakes ----
  const seedRakes = [
    ['RAKE-12951', '12951', 'Mumbai Rajdhani', 'Mumbai Central', 'New Delhi', 'WR'],
    ['RAKE-12309', '12309', 'Patna Rajdhani', 'Patna Jn', 'New Delhi', 'ECR'],
  ];
  for (const r of seedRakes) {
    const exists = queryObjects('SELECT rake_id FROM rakes WHERE rake_id = ?', [r[0]]);
    if (!exists.length) {
      db.run('INSERT INTO rakes (rake_id, train_number, train_name, source, destination, zone) VALUES (?, ?, ?, ?, ?, ?)', r);
    }
  }

  // ---- Seed multi-coach devices (WLI-001 .. WLI-008) ----
  const seedDevices = [
    ['WLI-001', 'MPU-001', 'AA:BB:CC:DD:EE:01', 'B1', 'AC', 'NR', 'Delhi', 'NDLS', 'RAKE-12951', '12951'],
    ['WLI-002', 'MPU-002', 'AA:BB:CC:DD:EE:02', 'B2', 'AC', 'NR', 'Delhi', 'NDLS', 'RAKE-12951', '12951'],
    ['WLI-003', 'MPU-003', 'AA:BB:CC:DD:EE:03', 'S1', 'Non-AC', 'NR', 'Delhi', 'NDLS', 'RAKE-12951', '12951'],
    ['WLI-004', 'MPU-004', 'AA:BB:CC:DD:EE:04', 'S2', 'Non-AC', 'NR', 'Delhi', 'NDLS', 'RAKE-12951', '12951'],
    ['WLI-005', 'MPU-005', 'AA:BB:CC:DD:EE:05', 'B3', 'AC', 'ECR', 'Danapur', 'PNBE', 'RAKE-12309', '12309'],
    ['WLI-006', 'MPU-006', 'AA:BB:CC:DD:EE:06', 'S3', 'Non-AC', 'ECR', 'Danapur', 'PNBE', 'RAKE-12309', '12309'],
    ['WLI-007', 'MPU-007', 'AA:BB:CC:DD:EE:07', 'SCN-1', 'SCN', 'WR', 'Mumbai', 'BCT', 'RAKE-12951', '12951'],
    ['WLI-008', 'MPU-008', 'AA:BB:CC:DD:EE:08', 'B4', 'AC', 'ECR', 'Danapur', 'PNBE', 'RAKE-12309', '12309'],
    ['WLI-009', 'MPU-009', 'AA:BB:CC:DD:EE:09', 'B5', 'AC', 'NR', 'Delhi', 'NDLS', 'RAKE-12309', '12309'],
  ];
  for (const d of seedDevices) {
    const exists = queryObjects('SELECT device_id FROM devices WHERE device_id = ?', [d[0]]);
    if (!exists.length) {
      db.run(
        `INSERT INTO devices (device_id, mpu_id, mac_id, device_name, firmware_version, sensor_id, coach_number, coach_type, zone, division, depot, rake_id, train_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d[0], d[1], d[2], `WLI - Coach ${d[3]}`, '1.0.0', `WLS-${d[0].split('-')[1]}`, d[3], d[4], d[5], d[6], d[7], d[8], d[9]]
      );
    } else {
      db.run(
        `UPDATE devices SET mpu_id=?, mac_id=?, coach_number=COALESCE(coach_number,?), coach_type=COALESCE(coach_type,?),
         zone=COALESCE(zone,?), division=COALESCE(division,?), depot=COALESCE(depot,?), rake_id=COALESCE(rake_id,?), train_number=COALESCE(train_number,?)
         WHERE device_id=?`,
        [d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9], d[0]]
      );
    }
  }

  // ---- Seed supervisors ----
  const supCount = queryObjects('SELECT COUNT(*) as c FROM supervisors');
  if (!supCount.length || supCount[0].c === 0) {
    const seeds = [
      ['Ramesh Kumar', '9811000001', 'NR', 'Delhi', 'NDLS', 'Watering Supervisor'],
      ['Suresh Yadav', '9811000002', 'NR', 'Prayagraj', 'CNB', 'Watering Supervisor'],
      ['Anil Singh', '9811000003', 'ECR', 'Pt Deen Dayal', 'MGS', 'Watering Supervisor'],
      ['Vijay Patel', '9811000004', 'WR', 'Mumbai', 'BCT', 'Depot Incharge'],
    ];
    for (const s of seeds) {
      db.run('INSERT INTO supervisors (name, phone, zone, division, station, role) VALUES (?, ?, ?, ?, ?, ?)', s);
    }
  }

  // ---- Seed demo readings so fleet dashboard is not empty ----
  const now = new Date();
  const seedLevels = { 'WLI-001': 78, 'WLI-002': 35, 'WLI-003': 62, 'WLI-004': 0, 'WLI-005': 55, 'WLI-006': 28, 'WLI-007': 85, 'WLI-008': 48 };
  for (const [devId, lvl] of Object.entries(seedLevels)) {
    const existing = queryObjects('SELECT id FROM water_level_readings WHERE device_id = ? LIMIT 1', [devId]);
    if (!existing.length) {
      db.run(
        `INSERT INTO water_level_readings (device_id, water_level, battery_percentage, battery_voltage, latitude, longitude, network, signal_strength, sensor_status, gps_status, is_demo, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [devId, lvl, 85, 13.1, 28.6139, 77.2090, '4G', 78, 'OK', 'FIXED', 0, now.toISOString()]
      );
    }
  }
  saveToDisk();
};

initDb();

export const getDb = () => db;

export const insertReading = (data) => {
  try {
    db.run(
      `INSERT INTO water_level_readings (
        device_id, water_level, battery_percentage, battery_voltage,
        latitude, longitude, network, signal_strength, sensor_status,
        gps_status, is_demo, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.deviceId, data.waterLevel, data.batteryPercentage, data.batteryVoltage,
        data.latitude, data.longitude, data.network, data.signalStrength,
        data.sensorStatus, data.gpsStatus, data.isDemo ? 1 : 0, data.timestamp
      ]
    );
    saveToDisk();
    const rows = queryObjects('SELECT * FROM water_level_readings ORDER BY id DESC LIMIT 1');
    return rows[0] || {};
  } catch (err) {
    console.error('Error inserting reading:', err);
    throw err;
  }
};

export const getLatestReading = (deviceId) => {
  try {
    const rows = queryObjects('SELECT * FROM water_level_readings WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1', [deviceId]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error getting latest reading:', err);
    throw err;
  }
};

export const getHistory = (deviceId, range) => {
  try {
    let timeModifier;
    switch (range) {
      case '1h': timeModifier = '-1 hour'; break;
      case '6h': timeModifier = '-6 hours'; break;
      case '7d': timeModifier = '-7 days'; break;
      case '24h':
      default: timeModifier = '-1 day'; break;
    }
    
    return queryObjects(
      `SELECT * FROM water_level_readings 
       WHERE device_id = ? AND timestamp >= datetime('now', ?)
       ORDER BY timestamp ASC`,
      [deviceId, timeModifier]
    );
  } catch (err) {
    console.error('Error getting history:', err);
    throw err;
  }
};

export const insertAlert = (alert) => {
  try {
    db.run(
      `INSERT INTO alerts (device_id, alert_type, severity, value, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [alert.device_id, alert.alert_type, alert.severity, alert.value, alert.message]
    );
    saveToDisk();
    const rows = queryObjects('SELECT * FROM alerts ORDER BY id DESC LIMIT 1');
    return rows[0] || {};
  } catch (err) {
    console.error('Error inserting alert:', err);
    throw err;
  }
};

export const getAlerts = (deviceId, limit = 50) => {
  try {
    return queryObjects('SELECT * FROM alerts WHERE device_id = ? ORDER BY created_at DESC LIMIT ?', [deviceId, limit]);
  } catch (err) {
    console.error('Error getting alerts:', err);
    throw err;
  }
};

export const acknowledgeAlert = (alertId) => {
  try {
    db.run('UPDATE alerts SET acknowledged = 1 WHERE id = ?', [alertId]);
    saveToDisk();
    return { changes: 1 };
  } catch (err) {
    console.error('Error acknowledging alert:', err);
    throw err;
  }
};

export const updateDeviceLastSeen = (deviceId, timestamp) => {
  try {
    db.run('UPDATE devices SET last_seen = ? WHERE device_id = ?', [timestamp, deviceId]);
    saveToDisk();
  } catch (err) {
    console.error('Error updating last seen:', err);
    throw err;
  }
};

export const updateDeviceDetails = (deviceId, mpuId, macId) => {
  try {
    if (mpuId || macId) {
      db.run('UPDATE devices SET mpu_id = COALESCE(?, mpu_id), mac_id = COALESCE(?, mac_id) WHERE device_id = ?', [mpuId, macId, deviceId]);
      saveToDisk();
    }
  } catch (err) {
    console.error('Error updating device details:', err);
    throw err;
  }
};

export const getAllDeviceIds = () => {
  try {
    return queryObjects('SELECT device_id, last_seen FROM devices ORDER BY device_id').map((r) => r.device_id);
  } catch (err) {
    console.error('Error listing devices:', err);
    return ['WLI-001'];
  }
};

export const getDevice = (deviceId) => {
  try {
    const rows = queryObjects('SELECT * FROM devices WHERE device_id = ?', [deviceId]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error getting device:', err);
    throw err;
  }
};

export const insertLog = (deviceId, event, details) => {
  try {
    db.run(
      'INSERT INTO system_logs (device_id, event, details) VALUES (?, ?, ?)',
      [deviceId, event, typeof details === 'string' ? details : JSON.stringify(details)]
    );
    saveToDisk();
  } catch (err) {
    console.error('Error inserting log:', err);
    throw err;
  }
};

export const getLogs = (deviceId, limit = 100) => {
  try {
    return queryObjects('SELECT * FROM system_logs WHERE device_id = ? ORDER BY created_at DESC LIMIT ?', [deviceId, limit]);
  } catch (err) {
    console.error('Error getting logs:', err);
    throw err;
  }
};

export const getReadingsCount = (deviceId) => {
  try {
    const rows = queryObjects('SELECT COUNT(*) as count FROM water_level_readings WHERE device_id = ?', [deviceId]);
    return rows[0] ? rows[0].count : 0;
  } catch (err) {
    console.error('Error counting readings:', err);
    throw err;
  }
};

export const getAlertsCount = (deviceId) => {
  try {
    const rows = queryObjects('SELECT COUNT(*) as count FROM alerts WHERE device_id = ?', [deviceId]);
    return rows[0] ? rows[0].count : 0;
  } catch (err) {
    console.error('Error counting alerts:', err);
    throw err;
  }
};

// ---------- RDSO Fleet helpers ----------
const waterStatus = (lvl) => {
  if (lvl === null || lvl === undefined) return 'OFFLINE';
  if (lvl === 0) return 'EMPTY';
  if (lvl <= 40) return 'LOW';
  return 'NORMAL';
};

export const getAllDevicesWithLatest = () => {
  const devices = queryObjects('SELECT * FROM devices ORDER BY device_id');
  return devices.map((d) => {
    const latest = queryObjects(
      'SELECT * FROM water_level_readings WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1',
      [d.device_id]
    )[0] || null;
    let online = false;
    if (d.last_seen) {
      online = (new Date() - new Date(d.last_seen)) <= 15 * 60 * 1000;
    } else if (latest) {
      online = (new Date() - new Date(latest.timestamp)) <= 15 * 60 * 1000;
    }
    return { ...d, latest, status: latest ? waterStatus(latest.water_level) : 'OFFLINE', online };
  });
};

export const getFleetOverview = () => {
  const all = getAllDevicesWithLatest();
  const overview = { total: all.length, normal: 0, low: 0, empty: 0, offline: 0, online: 0 };
  for (const c of all) {
    if (c.online) overview.online += 1; else overview.offline += 1;
    if (c.status === 'NORMAL') overview.normal += 1;
    else if (c.status === 'LOW') overview.low += 1;
    else if (c.status === 'EMPTY') overview.empty += 1;
    else overview.offline += 0;
  }
  return { overview, coaches: all };
};

export const getRakesWithStatus = () => {
  const rakes = queryObjects('SELECT * FROM rakes ORDER BY train_number');
  const coaches = getAllDevicesWithLatest();
  return rakes.map((r) => {
    const list = coaches.filter((c) => c.rake_id === r.rake_id);
    const low = list.filter((c) => c.status === 'LOW' || c.status === 'EMPTY').length;
    return { ...r, coachCount: list.length, lowCount: low, coaches: list };
  });
};

export const getRakeDetail = (rakeId) => {
  const rows = queryObjects('SELECT * FROM rakes WHERE rake_id = ?', [rakeId]);
  if (!rows.length) return null;
  const coaches = getAllDevicesWithLatest().filter((c) => c.rake_id === rakeId);
  return { ...rows[0], coaches };
};

export const getSupervisors = () => queryObjects('SELECT * FROM supervisors ORDER BY id DESC');

export const addSupervisor = ({ name, phone, zone, division, station, role }) => {
  db.run('INSERT INTO supervisors (name, phone, zone, division, station, role) VALUES (?, ?, ?, ?, ?, ?)',
    [name, phone, zone || '', division || '', station || '', role || 'Watering Supervisor']);
  saveToDisk();
  return queryObjects('SELECT * FROM supervisors ORDER BY id DESC LIMIT 1')[0];
};

export const updateSupervisor = (id, { name, phone, zone, division, station, role }) => {
  db.run('UPDATE supervisors SET name=?, phone=?, zone=?, division=?, station=?, role=? WHERE id=?',
    [name, phone, zone, division, station, role, id]);
  saveToDisk();
  return queryObjects('SELECT * FROM supervisors WHERE id = ?', [id])[0];
};

export const deleteSupervisor = (id) => {
  db.run('DELETE FROM supervisors WHERE id = ?', [id]);
  saveToDisk();
  return { success: true };
};

export const addDevice = (d) => {
  db.run(
    `INSERT INTO devices (device_id, mpu_id, mac_id, device_name, firmware_version, sensor_id, coach_number, coach_type, zone, division, depot, rake_id, train_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [d.device_id, d.mpu_id || '', d.mac_id || '', d.device_name || `WLI - Coach ${d.coach_number || d.device_id}`,
     d.firmware_version || '1.0.0', d.sensor_id || '', d.coach_number || '', d.coach_type || 'AC',
     d.zone || '', d.division || '', d.depot || '', d.rake_id || '', d.train_number || '']
  );
  saveToDisk();
  return queryObjects('SELECT * FROM devices WHERE device_id = ?', [d.device_id])[0];
};

export const updateDevice = (deviceId, d) => {
  db.run(
    `UPDATE devices SET mpu_id=?, mac_id=?, device_name=?, coach_number=?, coach_type=?, zone=?, division=?, depot=?, rake_id=?, train_number=?
     WHERE device_id=?`,
    [d.mpu_id || '', d.mac_id || '', d.device_name || `WLI - Coach ${d.coach_number || deviceId}`,
     d.coach_number || '', d.coach_type || 'AC', d.zone || '', d.division || '', d.depot || '',
     d.rake_id || '', d.train_number || '', deviceId]
  );
  saveToDisk();
  return queryObjects('SELECT * FROM devices WHERE device_id = ?', [deviceId])[0];
};

export const deleteDevice = (deviceId) => {
  db.run('DELETE FROM water_level_readings WHERE device_id = ?', [deviceId]);
  db.run('DELETE FROM alerts WHERE device_id = ?', [deviceId]);
  db.run('DELETE FROM devices WHERE device_id = ?', [deviceId]);
  saveToDisk();
  return { success: true };
};

export const addRake = (r) => {
  db.run('INSERT INTO rakes (rake_id, train_number, train_name, source, destination, zone) VALUES (?, ?, ?, ?, ?, ?)',
    [r.rake_id, r.train_number || '', r.train_name || '', r.source || '', r.destination || '', r.zone || '']);
  saveToDisk();
  return queryObjects('SELECT * FROM rakes WHERE rake_id = ?', [r.rake_id])[0];
};

export const updateRake = (rakeId, r) => {
  db.run('UPDATE rakes SET train_number=?, train_name=?, source=?, destination=?, zone=? WHERE rake_id=?',
    [r.train_number || '', r.train_name || '', r.source || '', r.destination || '', r.zone || '', rakeId]);
  saveToDisk();
  return queryObjects('SELECT * FROM rakes WHERE rake_id = ?', [rakeId])[0];
};

export const deleteRake = (rakeId) => {
  const linked = queryObjects('SELECT device_id FROM devices WHERE rake_id = ?', [rakeId]);
  if (linked.length) return { success: false, error: `Rake me ${linked.length} coach linked hain. Pehle unhe dusre rake me shift karo ya delete karo.` };
  db.run('DELETE FROM rakes WHERE rake_id = ?', [rakeId]);
  saveToDisk();
  return { success: true };
};

export const getAllAlerts = (limit = 100) => {
  return queryObjects('SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?', [limit]);
};

export const getReportsSummary = () => {
  const coaches = getAllDevicesWithLatest();
  const byZone = {};
  const byDepot = {};
  for (const c of coaches) {
    const z = c.zone || 'Unknown';
    const dpt = c.depot || 'Unknown';
    byZone[z] = byZone[z] || { total: 0, low: 0, empty: 0 };
    byDepot[dpt] = byDepot[dpt] || { total: 0, low: 0, empty: 0 };
    byZone[z].total += 1; byDepot[dpt].total += 1;
    if (c.status === 'LOW') { byZone[z].low += 1; byDepot[dpt].low += 1; }
    if (c.status === 'EMPTY') { byZone[z].empty += 1; byDepot[dpt].empty += 1; }
  }
  const alertsByType = queryObjects('SELECT alert_type, COUNT(*) as count FROM alerts GROUP BY alert_type');
  return { byZone, byDepot, alertsByType, totalCoaches: coaches.length };
};
