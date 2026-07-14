const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { validateReservation } = require('../validations/reservationValidation');

router.get('/clientes/:rut', publicController.getClientByRut);
router.get('/vehiculos/:patente', publicController.getVehicleByPatente);
router.post('/reserva-atencion', validateReservation, publicController.createReservation);
router.get('/reserva-atencion/patente/:patente', publicController.getPendingReservationByPatente);
router.post('/reserva-atencion/:id/confirm', publicController.confirmAttendance);

module.exports = router;
