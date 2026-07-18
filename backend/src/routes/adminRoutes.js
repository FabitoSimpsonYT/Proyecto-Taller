const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Aplicar middlewares a todas las rutas de admin
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/buses', adminController.obtenerTodosLosBuses);
router.get('/inspecciones/pendientes', adminController.obtenerReservasPendientes);
router.post('/inspecciones/confirmar-asistencia', adminController.confirmarAsistenciaAdmin);
router.post('/inspecciones/marcar-inasistencia', adminController.marcarInasistenciaAdmin);
router.post('/confirmar-asistencia', adminController.confirmarAsistenciaAdmin); // Para compatibilidad con Dashboard
router.post('/marcar-inasistencia', adminController.marcarInasistenciaAdmin); // Para compatibilidad con Dashboard
router.post('/inspecciones/lista-trabajo', adminController.enviarInspeccion);
router.get('/inspecciones/:bus_id', adminController.obtenerInspeccionPorBusId);
router.post('/reparaciones', adminController.enviarReparacion);
router.get('/reparaciones/:bus_id', adminController.obtenerReparacionesPorBusId);
module.exports = router;
