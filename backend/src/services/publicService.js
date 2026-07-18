const { Bus, Persona, Reservacion } = require('../entities/index.entities');
const { enviarCorreoRegistro } = require('./emailService');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

const obtenerClientePorRut = async (rut) => {
  const persona = await Persona.findOne({
    where: { rut }
  });
  if (!persona) throw { status: 404, message: 'Cliente no encontrado' };
  return { nombre_dueno: persona.nombre_completo, correo_dueno: persona.correo, telefono_dueno: persona.telefono };
};

const obtenerVehiculoPorPatente = async (patente) => {
  const bus = await Bus.findOne({
    where: { patente }
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

const crearReserva = async (data, authHeader) => {
  const { patente, rut_dueno, nombre_dueno, correo_dueno, telefono_dueno, fecha_reserva, marca_carroceria, modelo_carroceria, marca_chasis, modelo_chasis, ano_fabricacion } = data;
  
  if (!patente || !rut_dueno || !nombre_dueno || !fecha_reserva) {
    throw { status: 400, message: 'Faltan datos obligatorios, incluyendo la fecha de reserva' };
  }

  const reqDateTime = new Date(fecha_reserva);
  const now = new Date();
  
  let isAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.rol === 'admin') isAdmin = true;
    } catch (e) {}
  }

  if (!isAdmin && reqDateTime <= now) {
    throw { status: 400, message: 'Solo los administradores pueden registrar una reserva con fecha y hora actual o pasada.' };
  }

  const estadoInicial = (isAdmin && reqDateTime <= now) ? 'en_proceso' : 'pendiente';

  // 1. Buscar o Crear la Persona (Dueño)
  let persona = await Persona.findOne({ where: { rut: rut_dueno } });
  if (!persona) {
    persona = await Persona.create({
      rut: rut_dueno,
      nombre_completo: nombre_dueno,
      telefono: telefono_dueno || 'S/N',
      correo: correo_dueno
    });
  }

  // 2. Buscar o Crear el Bus
  let bus = await Bus.findOne({ where: { patente } });
  if (!bus) {
    bus = await Bus.create({
      patente,
      marca_carroceria,
      modelo_carroceria,
      marca_chasis,
      modelo_chasis,
      ano_fabricacion,
      dueno_id: persona.id
    });
  } else {
    // Si el bus existe pero cambiaron los datos, se podrían actualizar (opcional)
    if (bus.dueno_id !== persona.id) {
      bus.dueno_id = persona.id;
      await bus.save();
    }
  }

  // 3. Verificar si el bus ya tiene una reserva activa
  const reservaExistente = await Reservacion.findOne({
    where: { bus_id: bus.id, estado: ['pendiente', 'en_proceso'] }
  });

  if (reservaExistente) {
    throw { status: 400, message: 'Este vehículo ya tiene una reserva activa o se encuentra ingresado en el taller.' };
  }

  // 4. Crear la nueva reserva
  const nuevaReserva = await Reservacion.create({
    bus_id: bus.id,
    fecha_reserva,
    estado: estadoInicial
  });

  if (correo_dueno) {
    enviarCorreoRegistro(correo_dueno, nombre_dueno, patente, fecha_reserva, nuevaReserva.id).catch(console.error);
  }
  
  return { bus, reservacion: nuevaReserva };
};

const obtenerReservaPendiente = async (patente) => {
  const reservacion = await Reservacion.findOne({ 
    where: { estado: ['pendiente', 'en_proceso'] },
    include: [{
      model: Bus,
      where: { patente: patente.toUpperCase() }
    }]
  });
  if (!reservacion) throw { status: 404, message: 'No se encontró reserva pendiente para esa patente.' };
  return { reservacion, bus: reservacion.Bus };
};

const confirmarAsistencia = async (id) => {
  const reservacion = await Reservacion.findByPk(id);
  if (!reservacion) throw { status: 404, message: 'Reserva no encontrada' };
  
  if (reservacion.estado === 'pendiente') {
    reservacion.estado = 'en_proceso';
    await reservacion.save();
  }
  return { message: 'Asistencia confirmada exitosamente' };
};

module.exports = {
  obtenerClientePorRut,
  obtenerVehiculoPorPatente,
  crearReserva,
  obtenerReservaPendiente,
  confirmarAsistencia
};


