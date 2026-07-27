import api from './api';

export const obtenerBusesTaller = async () => {
  const response = await api.get('/admin/buses');
  return response;
};

export const obtenerReparaciones = async (busId) => {
  const response = await api.get(`/admin/reparaciones/${busId}`);
  return response;
};

export const obtenerInspecciones = async (busId) => {
  const response = await api.get(`/admin/inspecciones/${busId}`);
  return response;
};

export const guardarReparacion = async (payload) => {
  const response = await api.post('/admin/reparaciones', payload);
  return response;
};
