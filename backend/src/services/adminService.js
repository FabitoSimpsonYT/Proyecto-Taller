const { Bus, Inspeccion, Reparacion, Usuario, Persona, Reservacion, sequelize } = require('../entities/index.entities');

const obtenerTodosLosBuses = async () => {
  return await Bus.findAll({ 
    include: [{ model: Persona, as: 'Dueno' }],
    order: [['creado_en', 'DESC']] 
  });
};

const obtenerReservasPendientes = async () => {
  return await Reservacion.findAll({
    where: { estado: ['pendiente', 'en_proceso'] },
    include: [{ 
      model: Bus,
      include: [{ model: Persona, as: 'Dueno' }]
    }],
    order: [['creado_en', 'DESC']]
  });
};

const confirmarAsistencia = async (reservacion_id) => {
  const reservacion = await Reservacion.findByPk(reservacion_id);
  if (!reservacion) throw { status: 404, message: 'Reserva no encontrada' };
  
  reservacion.estado = 'en_proceso';
  await reservacion.save();
  return { message: 'Asistencia confirmada' };
};

const marcarInasistencia = async (reservacion_id) => {
  const reservacion = await Reservacion.findByPk(reservacion_id);
  if (!reservacion) throw { status: 404, message: 'Reserva no encontrada' };
  
  reservacion.estado = 'rechazado';
  await reservacion.save();
  return { message: 'Inasistencia marcada' };
};

const enviarInspeccion = async (usuarioId, data) => {
  const { bus_id, items, notas_examen } = data;
  if (!bus_id || !items) throw { status: 400, message: 'Bus ID e Items son obligatorios' };

  const nuevaInspeccion = await Inspeccion.create({
    bus_id,
    inspector_id: usuarioId,
    items,
    notas_examen
  });

  const hayItemsRechazados = items.some(item => item.estado === 'rechazado');
  
  // Find active reservation
  const reservacionActiva = await Reservacion.findOne({
    where: { bus_id, estado: 'en_proceso' }
  });
  
  if (reservacionActiva) {
    reservacionActiva.estado = hayItemsRechazados ? 'rechazado' : 'aprobado';
    await reservacionActiva.save();
  }

  return { message: 'Inspección registrada con éxito', inspeccion: nuevaInspeccion };
};

const enviarReparacion = async (usuarioId, data) => {
  const { bus_id, descripcion, repuestos_utilizados, estado } = data;
  
  await Reparacion.create({
    bus_id,
    mecanico_id: usuarioId,
    descripcion,
    repuestos_utilizados: repuestos_utilizados || [],
    estado: estado || 'en_proceso'
  });
  
  // Find active reservation
  const reservacionActiva = await Reservacion.findOne({
    where: { bus_id, estado: ['en_proceso', 'pendiente'] }
  });

  if (reservacionActiva) {
    reservacionActiva.estado = (estado === 'completado') ? 'aprobado' : 'en_proceso';
    await reservacionActiva.save();
  }

  return { message: 'Reparación actualizada con éxito' };
};

const obtenerReparaciones = async (bus_id) => {
  return await Reparacion.findAll({
    where: { bus_id },
    include: [{ model: Usuario, as: 'Mecanico', attributes: ['id', 'nombre_completo', 'rol'] }],
    order: [['fecha_reparacion', 'DESC']]
  });
};

const obtenerInspeccion = async (bus_id) => {
  const inspeccion = await Inspeccion.findOne({ where: { bus_id }, order: [['fecha_inspeccion', 'DESC']] });
  return inspeccion || {};
};

module.exports = {
  obtenerTodosLosBuses,
  obtenerReservasPendientes,
  confirmarAsistencia,
  marcarInasistencia,
  enviarInspeccion,
  enviarReparacion,
  obtenerReparaciones,
  obtenerInspeccion
};
