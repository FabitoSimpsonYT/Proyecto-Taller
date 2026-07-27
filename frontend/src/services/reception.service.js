import api from './api';

export const obtenerBusesEnRecepcion = async () => {
  const response = await api.get('/admin/buses');
  return response;
};

export const guardarWorklist = async (busId, itemsArray, notas) => {
  const response = await api.post('/admin/inspecciones/lista-trabajo', {
    bus_id: busId,
    items: itemsArray,
    notas_examen: notas
  });
  return response;
};
