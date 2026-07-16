const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Aplicar middlewares a todas las rutas de admin
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/buses', adminController.getAllBuses);
router.get('/inspections/pending', adminController.getPendingInspections);
router.post('/inspections/confirm-attendance', adminController.confirmAttendanceAdmin);
router.post('/inspections/mark-no-show', adminController.markNoShowAdmin);
router.post('/confirm-attendance', adminController.confirmAttendanceAdmin); // Para compatibilidad con Dashboard
router.post('/mark-no-show', adminController.markNoShowAdmin); // Para compatibilidad con Dashboard
router.post('/inspections/worklist', adminController.submitWorklist);
router.get('/inspections/:bus_id', adminController.getInspectionByBusId);
router.post('/repairs', adminController.submitRepair);
router.get('/repairs/:bus_id', adminController.getRepairsByBusId);
module.exports = router;
