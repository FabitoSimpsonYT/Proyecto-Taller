const { Bus, Inspection, Repair, User, sequelize } = require('../entities/index.entities');

const getAllBuses = async () => {
  return await Bus.findAll({ order: [['created_at', 'DESC']] });
};

const getPendingBuses = async () => {
  return await Bus.findAll({
    where: { status: ['pending', 'in_process'] },
    order: [['created_at', 'DESC']]
  });
};

const confirmAttendance = async (bus_id) => {
  const bus = await Bus.findByPk(bus_id);
  if (!bus) throw { status: 404, message: 'Bus no encontrado' };
  
  bus.status = 'in_process';
  await bus.save();
  return { message: 'Asistencia confirmada para el bus ' + bus.patente };
};

const submitWorklist = async (userId, data) => {
  const { bus_id, items, exams_notes } = data;
  if (!bus_id || !items) throw { status: 400, message: 'Bus ID e Items son obligatorios' };

  const newInspection = await Inspection.create({
    bus_id,
    inspector_id: userId,
    items,
    exams_notes
  });

  const hasFailedItems = items.some(item => item.status === 'fail');
  await Bus.update(
    { status: hasFailedItems ? 'rejected' : 'approved' },
    { where: { id: bus_id } }
  );

  return { message: 'Inspección registrada con éxito', inspection: newInspection };
};

const submitRepair = async (userId, data) => {
  const { bus_id, description, repuestos_utilizados, status } = data;
  
  await Repair.create({
    bus_id,
    mechanic_id: userId,
    description,
    repuestos_utilizados: repuestos_utilizados || [],
    status: status || 'in_progress'
  });
  
  if (status === 'completed') {
    await Bus.update({ status: 'approved' }, { where: { id: bus_id } });
  } else {
    await Bus.update({ status: 'in_process' }, { where: { id: bus_id } });
  }

  return { message: 'Reparación actualizada con éxito' };
};

const getRepairs = async (bus_id) => {
  return await Repair.findAll({
    where: { bus_id },
    include: [{ model: User, as: 'Mechanic', attributes: ['id', 'name', 'role'] }],
    order: [['repair_date', 'DESC']]
  });
};

const getInspection = async (bus_id) => {
  const inspection = await Inspection.findOne({ where: { bus_id }, order: [['inspection_date', 'DESC']] });
  return inspection || {};
};

module.exports = {
  getAllBuses,
  getPendingBuses,
  confirmAttendance,
  submitWorklist,
  submitRepair,
  getRepairs,
  getInspection
};
