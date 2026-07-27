const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireMecanico } = require('../middlewares/authMiddleware');

// Aplicar middlewares a todas las rutas de admin
router.use(authenticateToken);
router.use(requireMecanico);

router.get('/buses', adminController.obtenerTodosLosBuses);
router.get('/inspecciones/pendientes', adminController.obtenerReservasPendientes);
router.post('/inspecciones/confirmar-asistencia', adminController.confirmarAsistenciaAdmin);
router.post('/inspecciones/marcar-inasistencia', adminController.marcarInasistenciaAdmin);
router.post('/confirmar-asistencia', adminController.confirmarAsistenciaAdmin); // Para compatibilidad con Dashboard
router.post('/marcar-inasistencia', adminController.marcarInasistenciaAdmin); // Para compatibilidad con Dashboard
router.post('/inspecciones/lista-trabajo', adminController.enviarInspeccion);
router.post('/inspecciones/rechazar-ingreso', adminController.rechazarIngreso);
router.get('/inspecciones/:bus_id', adminController.obtenerInspeccionPorBusId);
router.post('/reparaciones', adminController.enviarReparacion);
router.get('/reparaciones/:bus_id', adminController.obtenerReparacionesPorBusId);
router.get('/despacho', adminController.obtenerBusesParaDespacho);
router.post('/despacho/:bus_id/entregar', adminController.marcarComoEntregado);
router.get('/historial', adminController.obtenerHistorialCompleto);
module.exports = router;
