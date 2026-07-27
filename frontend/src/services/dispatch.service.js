import api from './api';

export const obtenerBusesParaDespacho = async () => {
  const response = await api.get('/admin/despacho');
  return response;
};

export const marcarComoEntregado = async (busId) => {
  const response = await api.post(`/admin/despacho/${busId}/entregar`);
  return response;
};
