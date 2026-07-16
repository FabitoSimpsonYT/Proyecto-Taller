const publicService = require('../services/publicService');

const getClientByRut = async (req, res, next) => {
  try {
    const result = await publicService.getClientByRut(req.params.rut);
    res.json(result);
  } catch (error) { next(error); }
};

const getVehicleByPatente = async (req, res, next) => {
  try {
    const result = await publicService.getVehicleByPatente(req.params.patente);
    res.json(result);
  } catch (error) { next(error); }
};

const createReservation = async (req, res, next) => {
  try {
    const result = await publicService.createReservation(req.body, req.headers['authorization']);
    res.status(201).json(result);
  } catch (error) { next(error); }
};

const getPendingReservationByPatente = async (req, res, next) => {
  try {
    const result = await publicService.getPendingReservation(req.params.patente);
    res.json(result);
  } catch (error) { next(error); }
};

const confirmAttendance = async (req, res, next) => {
  try {
    const result = await publicService.confirmAttendance(req.params.id);
    res.json(result);
  } catch (error) { next(error); }
};

module.exports = {
  getClientByRut,
  getVehicleByPatente,
  createReservation,
  getPendingReservationByPatente,
  confirmAttendance
};
