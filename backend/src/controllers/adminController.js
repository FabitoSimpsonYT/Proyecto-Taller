const adminService = require('../services/adminService');

const obtenerTodosLosBuses = async (req, res, next) => {
  try {
    const result = await adminService.obtenerTodosLosBuses();
    res.json(result);
  } catch (error) { next(error); }
};

const obtenerReservasPendientes = async (req, res, next) => {
  try {
    const result = await adminService.obtenerReservasPendientes();
    res.json(result);
  } catch (error) { next(error); }
};

const confirmarAsistenciaAdmin = async (req, res, next) => {
  try {
    const result = await adminService.confirmarAsistencia(req.body.bus_id);
    res.json(result);
  } catch (error) { next(error); }
};

const marcarInasistenciaAdmin = async (req, res, next) => {
  try {
    const result = await adminService.marcarInasistencia(req.body.bus_id);
    res.json(result);
  } catch (error) { next(error); }
};

const enviarInspeccion = async (req, res, next) => {
  try {
    const result = await adminService.enviarInspeccion(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) { next(error); }
};

const enviarReparacion = async (req, res, next) => {
  try {
    const result = await adminService.enviarReparacion(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) { next(error); }
};

const obtenerReparacionesPorBusId = async (req, res, next) => {
  try {
    const result = await adminService.obtenerReparaciones(req.params.bus_id);
    res.json(result);
  } catch (error) { next(error); }
};

const obtenerInspeccionPorBusId = async (req, res, next) => {
  try {
    const result = await adminService.obtenerInspeccion(req.params.bus_id);
    res.json(result);
  } catch (error) { next(error); }
};

module.exports = {
  obtenerTodosLosBuses,
  obtenerReservasPendientes,
  confirmarAsistenciaAdmin,
  marcarInasistenciaAdmin,
  enviarInspeccion,
  enviarReparacion,
  obtenerReparacionesPorBusId,
  obtenerInspeccionPorBusId
};
