const { Bus } = require('../entities');
const { sendRegistrationEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');

const getClientByRut = async (req, res) => {
  try {
    const rut = req.params.rut;
    const bus = await Bus.findOne({
      where: { owner_rut: rut },
      order: [['created_at', 'DESC']]
    });

    if (!bus) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({
      owner_name: bus.owner_name,
      owner_email: bus.owner_email,
      owner_phone: bus.owner_phone
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar cliente', details: error.message });
  }
};

const getVehicleByPatente = async (req, res) => {
  try {
    const patente = req.params.patente;
    const bus = await Bus.findOne({
      where: { patente: patente },
      order: [['created_at', 'DESC']]
    });

    if (!bus) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json({
      ano_fabricacion: bus.ano_fabricacion,
      marca_carroceria: bus.marca_carroceria,
      modelo_carroceria: bus.modelo_carroceria,
      marca_chasis: bus.marca_chasis,
      modelo_chasis: bus.modelo_chasis
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar vehículo', details: error.message });
  }
};

const createReservation = async (req, res) => {
  try {
    const { 
      patente, marca_carroceria, modelo_carroceria, marca_chasis, modelo_chasis, ano_fabricacion,
      owner_rut, owner_name, owner_email, owner_phone,
      driver_rut, driver_name, driver_phone, reservation_date
    } = req.body;
    
    if (!patente || !owner_rut || !owner_name || !owner_email || !reservation_date) {
      return res.status(400).json({ error: 'Faltan datos obligatorios, incluyendo la fecha de reserva' });
    }

    const reqDateTime = new Date(reservation_date);
    const now = new Date();
    
    let isAdmin = false;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (e) {
        // Token inválido o expirado, se ignora
      }
    }

    if (!isAdmin && reqDateTime <= now) {
      return res.status(400).json({ error: 'Solo los administradores pueden registrar una reserva con fecha y hora actual o pasada.' });
    }

    const initialStatus = (isAdmin && reqDateTime <= now) ? 'in_process' : 'pending';

    const busInWorkshop = await Bus.findOne({
      where: {
        patente,
        status: ['in_process', 'approved', 'rejected']
      }
    });

    if (busInWorkshop) {
      return res.status(400).json({ error: 'Este vehículo ya se encuentra ingresado en el taller.' });
    }

    let existingPendingBus = await Bus.findOne({
      where: {
        patente,
        status: 'pending'
      }
    });

    if (existingPendingBus) {
      existingPendingBus.marca_carroceria = marca_carroceria;
      existingPendingBus.modelo_carroceria = modelo_carroceria;
      existingPendingBus.marca_chasis = marca_chasis;
      existingPendingBus.modelo_chasis = modelo_chasis;
      existingPendingBus.ano_fabricacion = ano_fabricacion;
      existingPendingBus.owner_rut = owner_rut;
      existingPendingBus.owner_name = owner_name;
      existingPendingBus.owner_email = owner_email;
      existingPendingBus.owner_phone = owner_phone;
      existingPendingBus.driver_rut = driver_rut;
      existingPendingBus.driver_name = driver_name;
      existingPendingBus.driver_phone = driver_phone;
      existingPendingBus.reservation_date = reservation_date;
      existingPendingBus.status = initialStatus;
      
      await existingPendingBus.save();

      // Enviar el correo en segundo plano (fire and forget) para no demorar la respuesta
      sendRegistrationEmail(owner_email, owner_name, patente, reservation_date, existingPendingBus.id).catch(console.error);

      return res.status(200).json(existingPendingBus);
    }

    const newBus = await Bus.create({
      patente,
      marca_carroceria,
      modelo_carroceria,
      marca_chasis,
      modelo_chasis,
      ano_fabricacion,
      owner_rut,
      owner_name,
      owner_email,
      owner_phone,
      driver_rut,
      driver_name,
      driver_phone,
      reservation_date,
      status: initialStatus
    });

    // Enviar el correo en segundo plano
    sendRegistrationEmail(owner_email, owner_name, patente, reservation_date, newBus.id).catch(console.error);

    res.status(201).json(newBus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el bus', details: error.message });
  }
};

const getPendingReservationByPatente = async (req, res) => {
  try {
    const patente = req.params.patente.toUpperCase();
    const bus = await Bus.findOne({ 
      where: { 
        patente,
        status: ['pending', 'in_process']
      } 
    });
    
    if (!bus) {
      return res.status(404).json({ error: 'No se encontró reserva pendiente para esa patente.' });
    }
    
    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el bus', details: error.message });
  }
};

const confirmAttendance = async (req, res) => {
  try {
    const bus = await Bus.findByPk(req.params.id);
    if (!bus) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    // Si ya está in_process o approved, no hacer nada pero retornar éxito
    if (bus.status === 'pending') {
      bus.status = 'in_process';
      await bus.save();
    }
    
    res.json({ message: 'Asistencia confirmada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al confirmar la asistencia', details: error.message });
  }
};

module.exports = {
  getClientByRut,
  getVehicleByPatente,
  createReservation,
  getPendingReservationByPatente,
  confirmAttendance
};
