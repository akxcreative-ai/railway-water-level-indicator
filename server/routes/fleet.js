import express from 'express';
import * as fleet from '../controllers/fleetController.js';

const router = express.Router();

router.get('/fleet/overview', fleet.getFleet);
router.get('/coaches', fleet.getCoaches);
router.post('/coaches', fleet.createCoach);
router.put('/coaches/:id', fleet.editCoach);
router.delete('/coaches/:id', fleet.removeCoach);
router.post('/rakes', fleet.createRake);
router.put('/rakes/:id', fleet.editRake);
router.delete('/rakes/:id', fleet.removeRake);
router.get('/rakes', fleet.getRakes);
router.get('/rakes/:id', fleet.getRakeById);
router.get('/supervisors', fleet.listSupervisors);
router.post('/supervisors', fleet.createSupervisor);
router.put('/supervisors/:id', fleet.editSupervisor);
router.delete('/supervisors/:id', fleet.removeSupervisor);
router.get('/alerts-all', fleet.allAlerts);
router.get('/reports/summary', fleet.reports);

export default router;
