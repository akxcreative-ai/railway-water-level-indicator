import * as db from '../database/database.js';
import { evaluateAlerts } from '../services/alertService.js';
import * as socket from '../websocket/socket.js';

export const postData = (req, res) => {
  try {
    const {
      deviceId, mpuId, macId, waterLevel, batteryPercentage, batteryVoltage,
      latitude, longitude, network, signalStrength, sensorStatus, gpsStatus, timestamp
    } = req.body;

    if (!deviceId || waterLevel === undefined) {
      return res.status(400).json({ error: 'deviceId and waterLevel are required' });
    }

    const isDemo = req.query.demo === 'true';
    const ts = timestamp || new Date().toISOString();

    const readingData = {
      deviceId, waterLevel,
      mpuId: mpuId ?? null, macId: macId ?? null,
      batteryPercentage: batteryPercentage ?? null, batteryVoltage: batteryVoltage ?? null,
      latitude: latitude ?? null, longitude: longitude ?? null,
      network: network ?? null, signalStrength: signalStrength ?? null,
      sensorStatus: sensorStatus ?? 'OK', gpsStatus: gpsStatus ?? 'NO_FIX',
      isDemo, timestamp: ts
    };

    const reading = db.insertReading(readingData);
    db.updateDeviceLastSeen(deviceId, ts);
    db.updateDeviceDetails(deviceId, mpuId, macId);

    let status = 'NORMAL';
    if (waterLevel === 0) status = 'EMPTY';
    else if (waterLevel <= 40) status = 'LOW_WATER';

    const alerts = evaluateAlerts(readingData);
    const savedAlerts = [];
    
    for (const alert of alerts) {
      const saved = db.insertAlert(alert);
      savedAlerts.push(saved);
      socket.broadcastAlert(saved);
    }

    db.insertLog(deviceId, 'DATA_RECEIVED', { waterLevel, batteryPercentage });

    socket.broadcastReading({ ...reading, status });

    res.status(200).json({ success: true, status, reading, alerts: savedAlerts });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const reqDeviceId = (req) => req.query.deviceId || 'WLI-001';

export const getStatus = (req, res) => {
  try {
    const deviceId = reqDeviceId(req);
    const device = db.getDevice(deviceId);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const latestReading = db.getLatestReading(deviceId);
    const offlineTimeoutMs = parseInt(process.env.OFFLINE_TIMEOUT_MS || '120000', 10);
    
    let isOnline = false;
    if (device.last_seen) {
      const timeDiff = new Date() - new Date(device.last_seen);
      isOnline = timeDiff <= offlineTimeoutMs;
    }

    res.json({
      device,
      online: isOnline,
      latestWaterLevel: latestReading ? latestReading.water_level : null,
      lastReadingTime: latestReading ? latestReading.timestamp : null
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLatest = (req, res) => {
  try {
    const reading = db.getLatestReading(reqDeviceId(req));
    res.json(reading || {});
  } catch (error) {
    console.error('Error getting latest reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHistory = (req, res) => {
  try {
    const range = req.query.range || '24h';
    const readings = db.getHistory(reqDeviceId(req), range);
    res.json(readings);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAlerts = (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const alerts = db.getAlerts(reqDeviceId(req), limit);
    res.json(alerts);
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acknowledgeAlert = (req, res) => {
  try {
    db.acknowledgeAlert(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHealth = (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
};

export const getLogs = (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100', 10);
    const logs = db.getLogs(reqDeviceId(req), limit);
    res.json(logs);
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
