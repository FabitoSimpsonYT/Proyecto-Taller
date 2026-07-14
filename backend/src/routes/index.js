const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const publicRoutes = require('./publicRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
// Las rutas públicas no tienen prefijo adicional para mantener compatibilidad con el frontend actual
router.use('/', publicRoutes);
// Las rutas de admin (algunas tenían /api/admin y otras /api/inspections)
// Mantenemos las rutas raíz relativas en adminRoutes, así que mapeamos directamente a /api en server.js
router.use('/admin', adminRoutes);
// Para las rutas de inspecciones que empiezan con /api/inspections
router.use('/', adminRoutes); 

module.exports = router;
