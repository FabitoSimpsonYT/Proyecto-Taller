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
      // Si el 401 viene del login, no recargamos la página
      if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // Si da 401 no autorizado en otras rutas, probablemente el token expiró.
      console.error("Token expirado o inválido. Debes volver a iniciar sesión.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;
