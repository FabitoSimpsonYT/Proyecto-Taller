const adminService = require('../services/adminService');

const getAllBuses = async (req, res, next) => {
  try {
    const result = await adminService.getAllBuses();
    res.json(result);
  } catch (error) { next(error); }
};

const getPendingInspections = async (req, res, next) => {
  try {
    const result = await adminService.getPendingBuses();
    res.json(result);
  } catch (error) { next(error); }
};

const confirmAttendanceAdmin = async (req, res, next) => {
  try {
    const result = await adminService.confirmAttendance(req.body.bus_id);
    res.json(result);
  } catch (error) { next(error); }
};

const submitWorklist = async (req, res, next) => {
  try {
    const result = await adminService.submitWorklist(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) { next(error); }
};

const submitRepair = async (req, res, next) => {
  try {
    const result = await adminService.submitRepair(req.user.id, req.body);
    res.status(201).json(result);
  } catch (error) { next(error); }
};

const getRepairsByBusId = async (req, res, next) => {
  try {
    const result = await adminService.getRepairs(req.params.bus_id);
    res.json(result);
  } catch (error) { next(error); }
};

const getInspectionByBusId = async (req, res, next) => {
  try {
    const result = await adminService.getInspection(req.params.bus_id);
    res.json(result);
  } catch (error) { next(error); }
};

module.exports = {
  getAllBuses,
  getPendingInspections,
  confirmAttendanceAdmin,
  submitWorklist,
  submitRepair,
  getRepairsByBusId,
  getInspectionByBusId
};
