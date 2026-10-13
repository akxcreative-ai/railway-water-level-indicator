import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import './database/database.js';
import deviceRoutes from './routes/device.js';
import fleetRoutes from './routes/fleet.js';
import { initSocket, startOfflineWatcher } from './websocket/socket.js';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Railway Water Level Monitoring Server Running' });
});

app.use('/api', deviceRoutes);
app.use('/api', fleetRoutes);

const server = http.createServer(app);

initSocket(server);

const offlineTimeoutMs = parseInt(process.env.OFFLINE_TIMEOUT_MS || '120000', 10);
startOfflineWatcher(offlineTimeoutMs);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Railway WLI Server listening on port ${PORT}`);
});
