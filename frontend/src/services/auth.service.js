import api from './api';

export const obtenerPerfil = async () => {
  const response = await api.get('/auth/perfil');
  return response;
};

export const iniciarSesionApi = async (correo, contrasena) => {
  const response = await api.post('/auth/iniciar-sesion', { correo, contrasena });
  return response;
};

export const registrarUsuarioApi = async (datosFormulario) => {
  const response = await api.post('/auth/registrar', datosFormulario);
  return response;
};
