import api from './api';

export const obtenerHistorial = async () => {
  const response = await api.get('/admin/historial');
  return response.data;
};
