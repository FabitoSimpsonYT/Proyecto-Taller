const publicService = require('../services/publicService');

const obtenerClientePorRut = async (req, res, next) => {
  try {
    const result = await publicService.obtenerClientePorRut(req.params.rut);
    res.json(result);
  } catch (error) { next(error); }
};

const obtenerVehiculoPorPatente = async (req, res, next) => {
  try {
    const result = await publicService.obtenerVehiculoPorPatente(req.params.patente);
    res.json(result);
  } catch (error) { next(error); }
};

const crearReserva = async (req, res, next) => {
  try {
    const result = await publicService.crearReserva(req.body, req.headers['authorization']);
    res.status(201).json(result);
  } catch (error) { next(error); }
};

const obtenerReservaPendientePorPatente = async (req, res, next) => {
  try {
    const result = await publicService.obtenerReservaPendiente(req.params.patente);
    res.json(result);
  } catch (error) { next(error); }
};

const confirmarAsistencia = async (req, res, next) => {
  try {
    const result = await publicService.confirmarAsistencia(req.params.id);
    res.json(result);
  } catch (error) { next(error); }
};

module.exports = {
  obtenerClientePorRut,
  obtenerVehiculoPorPatente,
  crearReserva,
  obtenerReservaPendientePorPatente,
  confirmarAsistencia
};
