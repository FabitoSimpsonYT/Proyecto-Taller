import axios from 'axios';

// Instancia de axios configurada
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Ajusta si la URL es diferente
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar el token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente (ej: Token expirado o 401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si da 401 no autorizado, probablemente el token expiró.
      // Aquí podrías despachar un evento o llamar a una función para limpiar el estado
      console.error("Token expirado o inválido. Debes volver a iniciar sesión.");
      // Limpiamos el token por seguridad
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Opcional: Redirigir al usuario al login
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
