const { Bus, Inspeccion, Reparacion, Usuario, Persona, Reservacion, sequelize } = require('../entities/index.entities');

const obtenerTodosLosBuses = async () => {
  const reservaciones = await Reservacion.findAll({
    include: [
      { 
        model: Bus,
        include: [{ model: Persona, as: 'Dueno' }]
      },
      { model: Usuario, as: 'Recepcionista', attributes: ['id', 'nombre_completo', 'rol'] },
      { model: Usuario, as: 'Despachador', attributes: ['id', 'nombre_completo', 'rol'] }
    ],
    order: [['creado_en', 'DESC']]
  });

  return reservaciones.map(res => {
    const busData = res.Bus ? res.Bus.toJSON() : {};
    return {
      ...busData,
      bus_id: busData.id,
      estado: res.estado,
      fecha_reserva: res.fecha_reserva,
      reserva_id: res.id,
      id: res.id,
      Recepcionista: res.Recepcionista,
      Despachador: res.Despachador
    };
  });
};

const obtenerReservasPendientes = async () => {
  return await Reservacion.findAll({
    where: { estado: ['pendiente', 'en_proceso'] },
    include: [
      { 
        model: Bus,
        include: [{ model: Persona, as: 'Dueno' }]
      },
      { model: Usuario, as: 'Recepcionista', attributes: ['id', 'nombre_completo', 'rol'] }
    ],
    order: [['creado_en', 'DESC']]
  });
};

const confirmarAsistencia = async (reservacion_id, usuario_id) => {
  const reservacion = await Reservacion.findByPk(reservacion_id);
  if (!reservacion) throw { status: 404, message: 'Reserva no encontrada' };
  
  reservacion.estado = 'en_proceso';
  reservacion.recepcionista_id = usuario_id;
  await reservacion.save();
  return { message: 'Asistencia confirmada' };
};

const marcarInasistencia = async (reservacion_id, usuario_id) => {
  const reservacion = await Reservacion.findByPk(reservacion_id);
  if (!reservacion) throw { status: 404, message: 'Reserva no encontrada' };
  
  reservacion.estado = 'rechazado';
  reservacion.recepcionista_id = usuario_id;
  await reservacion.save();
  return { message: 'Inasistencia marcada' };
};

const enviarInspeccion = async (usuarioId, data) => {
  const { bus_id, items, notas_examen, finalizar } = data;
  if (!bus_id || !items) throw { status: 400, message: 'Bus ID e Items son obligatorios' };

  let inspeccion = await Inspeccion.findOne({ where: { bus_id }, order: [['fecha_inspeccion', 'DESC']] });
  
  if (inspeccion) {
    inspeccion.items = items;
    inspeccion.notas_examen = notas_examen;
    inspeccion.inspector_id = usuarioId;
    await inspeccion.save();
  } else {
    inspeccion = await Inspeccion.create({
      bus_id,
      inspector_id: usuarioId,
      items,
      notas_examen
    });
  }

  const hayItemsRechazados = items.some(item => item.estado === 'rechazado');
  
  // Find active reservation
  const reservacionActiva = await Reservacion.findOne({
    where: { bus_id, estado: 'en_proceso' }
  });
  
  if (reservacionActiva && finalizar) {
    reservacionActiva.estado = hayItemsRechazados ? 'rechazado' : 'en_taller';
    await reservacionActiva.save();
  }

  return { message: finalizar ? 'Inspección finalizada con éxito' : 'Progreso guardado', inspeccion };
};

const rechazarIngreso = async (bus_id, usuario_id) => {
  const reservacion = await Reservacion.findOne({ where: { bus_id, estado: 'en_proceso' } });
  if (reservacion) {
    reservacion.estado = 'rechazado';
    if (!reservacion.recepcionista_id) {
      reservacion.recepcionista_id = usuario_id;
    }
    await reservacion.save();
  }
  return { message: 'Ingreso rechazado, máquina lista para retiro.' };
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
    where: { bus_id, estado: 'en_taller' }
  });

  if (reservacionActiva) {
    reservacionActiva.estado = (estado === 'completado') ? 'aprobado' : 'en_taller';
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
  const inspeccion = await Inspeccion.findOne({ 
    where: { bus_id }, 
    include: [{ model: Usuario, as: 'Inspector', attributes: ['id', 'nombre_completo', 'rol'] }],
    order: [['fecha_inspeccion', 'DESC']] 
  });
  return inspeccion || {};
};

const obtenerBusesParaDespacho = async () => {
  const reservaciones = await Reservacion.findAll({
    where: { 
      estado: ['aprobado', 'rechazado'],
      entregado: false
    },
    include: [
      { 
        model: Bus,
        include: [{ model: Persona, as: 'Dueno' }]
      },
      { model: Usuario, as: 'Recepcionista', attributes: ['id', 'nombre_completo', 'rol'] }
    ],
    order: [['creado_en', 'DESC']]
  });

  return reservaciones.map(res => {
    const busData = res.Bus ? res.Bus.toJSON() : {};
    return {
      ...busData,
      bus_id: busData.id,
      estado: res.estado,
      fecha_reserva: res.fecha_reserva,
      reserva_id: res.id,
      id: res.id,
      Recepcionista: res.Recepcionista
    };
  });
};

const marcarComoEntregado = async (bus_id, usuario_id) => {
  const reservacion = await Reservacion.findOne({
    where: { 
      bus_id, 
      estado: ['aprobado', 'rechazado'],
      entregado: false
    }
  });

  if (!reservacion) {
    throw { status: 404, message: 'No se encontró un vehículo listo para despacho con esa patente.' };
  }

  reservacion.entregado = true;
  reservacion.despachador_id = usuario_id;
  await reservacion.save();
  return { message: 'Vehículo marcado como entregado al cliente.' };
};

const obtenerHistorialCompleto = async () => {
  const reservaciones = await Reservacion.findAll({
    include: [
      { 
        model: Bus,
        include: [
          { model: Persona, as: 'Dueno' },
          { model: Persona, as: 'Conductor' },
          { 
            model: Reparacion,
            include: [{ model: Usuario, as: 'Mecanico', attributes: ['id', 'nombre_completo', 'rol'] }],
            order: [['fecha_reparacion', 'DESC']],
            limit: 1 // esto solo trae la última reparación si la hubiera
          }
        ]
      },
      { model: Usuario, as: 'Recepcionista', attributes: ['id', 'nombre_completo', 'rol'] },
      { model: Usuario, as: 'Despachador', attributes: ['id', 'nombre_completo', 'rol'] }
    ],
    order: [['creado_en', 'DESC']]
  });

  return reservaciones.map(res => {
    const busData = res.Bus ? res.Bus.toJSON() : {};
    const ultimaReparacion = busData.Reparacions && busData.Reparacions.length > 0 ? busData.Reparacions[0] : null;
    return {
      ...busData,
      bus_id: busData.id,
      estado: res.estado,
      fecha_reserva: res.fecha_reserva,
      reserva_id: res.id,
      entregado: res.entregado,
      Recepcionista: res.Recepcionista,
      Despachador: res.Despachador,
      Mecanico: ultimaReparacion ? ultimaReparacion.Mecanico : null
    };
  });
};

module.exports = {
  obtenerTodosLosBuses,
  obtenerReservasPendientes,
  confirmarAsistencia,
  marcarInasistencia,
  enviarInspeccion,
  rechazarIngreso,
  enviarReparacion,
  obtenerReparaciones,
  obtenerInspeccion,
  obtenerBusesParaDespacho,
  marcarComoEntregado,
  obtenerHistorialCompleto
};
