import api from './api';

export const obtenerCliente = async (rut) => {
  const response = await api.get(`/clientes/${rut}`);
  return response;
};

export const obtenerVehiculo = async (patente) => {
  const response = await api.get(`/vehiculos/${patente}`);
  return response;
};

export const crearReserva = async (datosReserva) => {
  const response = await api.post('/reserva-atencion', datosReserva);
  return response;
};
