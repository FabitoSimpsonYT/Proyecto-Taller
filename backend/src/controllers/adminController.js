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
    const result = await adminService.confirmarAsistencia(req.body.bus_id, req.user.id);
    res.json(result);
  } catch (error) { next(error); }
};

const marcarInasistenciaAdmin = async (req, res, next) => {
  try {
    const result = await adminService.marcarInasistencia(req.body.bus_id, req.user.id);
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

const rechazarIngreso = async (req, res, next) => {
  try {
    const result = await adminService.rechazarIngreso(req.body.bus_id, req.user.id);
    res.json(result);
  } catch (error) { next(error); }
};

const obtenerBusesParaDespacho = async (req, res, next) => {
  try {
    const result = await adminService.obtenerBusesParaDespacho();
    res.json(result);
  } catch (error) { next(error); }
};

const marcarComoEntregado = async (req, res, next) => {
  try {
    const result = await adminService.marcarComoEntregado(req.params.bus_id, req.user.id);
    res.json(result);
  } catch (error) { next(error); }
};

const obtenerHistorialCompleto = async (req, res, next) => {
  try {
    const reservaciones = await adminService.obtenerHistorialCompleto();
    res.json(reservaciones);
  } catch (error) { next(error); }
};

module.exports = {
  obtenerTodosLosBuses,
  obtenerReservasPendientes,
  confirmarAsistenciaAdmin,
  marcarInasistenciaAdmin,
  enviarInspeccion,
  rechazarIngreso,
  enviarReparacion,
  obtenerReparacionesPorBusId,
  obtenerInspeccionPorBusId,
  obtenerBusesParaDespacho,
  marcarComoEntregado,
  obtenerHistorialCompleto
};
