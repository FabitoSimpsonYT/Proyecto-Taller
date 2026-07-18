const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { validarReserva } = require('../validations/reservationValidation');

router.get('/clientes/:rut', publicController.obtenerClientePorRut);
router.get('/vehiculos/:patente', publicController.obtenerVehiculoPorPatente);
router.post('/reserva-atencion', validarReserva, publicController.crearReserva);
router.get('/reserva-atencion/patente/:patente', publicController.obtenerReservaPendientePorPatente);
router.post('/reserva-atencion/:id/confirmar', publicController.confirmarAsistencia);

module.exports = router;
