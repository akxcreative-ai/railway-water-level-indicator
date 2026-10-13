import express from 'express';
import * as deviceController from '../controllers/deviceController.js';

const router = express.Router();

const authMiddleware = (req, res, next) => {
  // Header token (normal) YA ?token= query (GSM SIM800 custom header nahi bhej sakta)
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query.token) {
    token = req.query.token;
  }
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  if (token !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  next();
};

router.get('/health', deviceController.getHealth);
router.get('/device/status', deviceController.getStatus);
router.get('/device/latest', deviceController.getLatest);
router.get('/device/history', deviceController.getHistory);
router.get('/device/alerts', deviceController.getAlerts);
router.put('/device/alerts/:id/acknowledge', deviceController.acknowledgeAlert);
router.post('/device/data', authMiddleware, deviceController.postData);
router.get('/device/logs', deviceController.getLogs);

export default router;
