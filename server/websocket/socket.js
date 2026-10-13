import { Server } from 'socket.io';
import * as db from '../database/database.js';

let io;
const deviceTimeouts = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const broadcastReading = (data) => {
  if (io) {
    io.emit('reading:new', data);
  }
};

export const broadcastAlert = (alert) => {
  if (io) {
    io.emit('alert:new', alert);
  }
};

export const broadcastDeviceStatus = (status) => {
  if (io) {
    io.emit('device:status', status);
  }
};

export const startOfflineWatcher = (offlineTimeoutMs) => {
  console.log(`Starting offline watcher, timeout = ${offlineTimeoutMs}ms`);
  setInterval(() => {
    try {
      const ids = db.getAllDeviceIds ? db.getAllDeviceIds() : ['WLI-001'];
      for (const id of ids) {
        checkOne(id);
      }
    } catch (err) {
      console.error('Error in offline watcher:', err);
    }
  }, 30000);
};

const checkOne = (deviceId) => {
    try {
      const offlineTimeoutMs = parseInt(process.env.OFFLINE_TIMEOUT_MS || '120000', 10);
      const device = db.getDevice(deviceId);
      if (!device || !device.last_seen) return;

      const now = new Date();
      const lastSeenDate = new Date(device.last_seen);
      const timeDiff = now - lastSeenDate;
      const isOffline = timeDiff > offlineTimeoutMs;
      
      const currentState = deviceTimeouts.get(device.device_id) || { offline: false };
      
      if (isOffline && !currentState.offline) {
        console.log(`Device ${device.device_id} went offline`);
        deviceTimeouts.set(device.device_id, { offline: true });
        
        broadcastDeviceStatus({ deviceId: device.device_id, status: 'offline' });
        
        const newAlert = db.insertAlert({
          device_id: device.device_id,
          alert_type: 'DEVICE_OFFLINE',
          severity: 'HIGH',
          value: null,
          message: `Device has not reported for ${Math.floor(timeDiff/1000)} seconds`
        });
        
        broadcastAlert(newAlert);
        
        db.insertLog(device.device_id, 'DEVICE_OFFLINE', 'Device missed check-in window');
        
      } else if (!isOffline && currentState.offline) {
        console.log(`Device ${device.device_id} came back online`);
        deviceTimeouts.set(device.device_id, { offline: false });
        broadcastDeviceStatus({ deviceId: device.device_id, status: 'online' });
        
        db.insertLog(device.device_id, 'DEVICE_ONLINE', 'Device resumed communication');
      }
    } catch (err) {
      console.error('Error in offline watcher:', err);
    }
};
