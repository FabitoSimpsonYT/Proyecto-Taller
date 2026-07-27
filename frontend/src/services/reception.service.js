import api from './api';

export const obtenerBusesEnRecepcion = async () => {
  const response = await api.get('/admin/inspecciones/pendientes');
  response.data = response.data.map(res => ({
    ...res.Bus,
    estado: res.estado,
    fecha_reserva: res.fecha_reserva,
    reserva_id: res.id,
    detalles_cliente: res.detalles_cliente,
    Recepcionista: res.Recepcionista
  }));
  return response;
};

export const guardarWorklist = async (busId, itemsArray, notas, finalizar = false) => {
  const response = await api.post('/admin/inspecciones/lista-trabajo', {
    bus_id: busId,
    items: itemsArray,
    notas_examen: notas,
    finalizar
  });
  return response;
};
export const rechazarIngreso = async (busId) => {
  const response = await api.post('/admin/inspecciones/rechazar-ingreso', {
    bus_id: busId
  });
  return response;
};
