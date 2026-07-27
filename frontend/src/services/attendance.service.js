import api from './api';

export const confirmarReserva = async (id) => {
  const response = await api.post(`/reserva-atencion/${id}/confirmar`);
  return response;
};
