import api from './api';

export const obtenerBusesParaDespacho = async () => {
  const response = await api.get('/admin/despacho');
  // Formatear los datos como lo hacen otros servicios
  response.data = response.data.map(res => ({
    ...res.Bus,
    estado: res.estado,
    fecha_reserva: res.fecha_reserva,
    reserva_id: res.id,
    entregado: res.entregado
  }));
  return response;
};

export const marcarComoEntregado = async (busId) => {
  const response = await api.post(`/admin/despacho/${busId}/entregar`);
  return response;
};
