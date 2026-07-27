import api from './api';

export const obtenerBusesAdmin = async () => {
  const response = await api.get('/admin/buses');
  return response;
};

export const confirmarAsistenciaAdmin = async (busId) => {
  const response = await api.post('/admin/confirmar-asistencia', { bus_id: busId });
  return response;
};

export const marcarInasistenciaAdmin = async (busId) => {
  const response = await api.post('/admin/marcar-inasistencia', { bus_id: busId });
  return response;
};
