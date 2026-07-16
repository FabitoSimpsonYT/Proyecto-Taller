const { Bus } = require('../entities/index.entities');
const { sendRegistrationEmail } = require('./emailService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

const getClientByRut = async (rut) => {
  const bus = await Bus.findOne({
    where: { owner_rut: rut },
    order: [['created_at', 'DESC']]
  });
  if (!bus) throw { status: 404, message: 'Cliente no encontrado' };
  return { owner_name: bus.owner_name, owner_email: bus.owner_email, owner_phone: bus.owner_phone };
};

const getVehicleByPatente = async (patente) => {
  const bus = await Bus.findOne({
    where: { patente },
    order: [['created_at', 'DESC']]
  });
  if (!bus) throw { status: 404, message: 'Vehículo no encontrado' };
  return {
    ano_fabricacion: bus.ano_fabricacion,
    marca_carroceria: bus.marca_carroceria,
    modelo_carroceria: bus.modelo_carroceria,
    marca_chasis: bus.marca_chasis,
    modelo_chasis: bus.modelo_chasis
  };
};

const createReservation = async (data, authHeader) => {
  const { patente, owner_rut, owner_name, owner_email, reservation_date } = data;
  
  if (!patente || !owner_rut || !owner_name || !owner_email || !reservation_date) {
    throw { status: 400, message: 'Faltan datos obligatorios, incluyendo la fecha de reserva' };
  }

  const reqDateTime = new Date(reservation_date);
  const now = new Date();
  
  let isAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.role === 'admin') isAdmin = true;
    } catch (e) {}
  }

  if (!isAdmin && reqDateTime <= now) {
    throw { status: 400, message: 'Solo los administradores pueden registrar una reserva con fecha y hora actual o pasada.' };
  }

  const initialStatus = (isAdmin && reqDateTime <= now) ? 'in_process' : 'pending';

  const busInWorkshop = await Bus.findOne({
    where: { patente, status: ['in_process', 'approved', 'rejected'] }
  });
  if (busInWorkshop) throw { status: 400, message: 'Este vehículo ya se encuentra ingresado en el taller.' };

  let existingPendingBus = await Bus.findOne({ where: { patente, status: 'pending' } });
  
  if (existingPendingBus) {
    Object.assign(existingPendingBus, data, { status: initialStatus });
    await existingPendingBus.save();
    sendRegistrationEmail(owner_email, owner_name, patente, reservation_date, existingPendingBus.id).catch(console.error);
    return existingPendingBus;
  }

  const newBus = await Bus.create({ ...data, status: initialStatus });
  sendRegistrationEmail(owner_email, owner_name, patente, reservation_date, newBus.id).catch(console.error);
  return newBus;
};

const getPendingReservation = async (patente) => {
  const bus = await Bus.findOne({ 
    where: { patente: patente.toUpperCase(), status: ['pending', 'in_process'] } 
  });
  if (!bus) throw { status: 404, message: 'No se encontró reserva pendiente para esa patente.' };
  return bus;
};

const confirmAttendance = async (id) => {
  const bus = await Bus.findByPk(id);
  if (!bus) throw { status: 404, message: 'Reserva no encontrada' };
  
  if (bus.status === 'pending') {
    bus.status = 'in_process';
    await bus.save();
  }
  return { message: 'Asistencia confirmada exitosamente' };
};

module.exports = {
  getClientByRut,
  getVehicleByPatente,
  createReservation,
  getPendingReservation,
  confirmAttendance
};
