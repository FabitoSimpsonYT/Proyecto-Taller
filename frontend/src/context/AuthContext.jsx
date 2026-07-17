import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');
      
      if (token && usuarioGuardado) {
        try {
          // Validar el token con el backend (asumiendo que /auth/perfil requiere token)
          await api.get('/auth/perfil');
          // Si no hay error, el token es válido
          setUsuario(JSON.parse(usuarioGuardado));
        } catch (error) {
          // Si da error (ej. backend apagado o token expirado), limpiamos la falsa sesión
          console.error("Token inválido o backend inalcanzable. Cerrando sesión.");
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setUsuario(null);
        }
      }
      setCargando(false);
    };

    verificarSesion();
  }, []);

  const iniciarSesion = async (correo, contrasena) => {
    try {
      const response = await api.post('/auth/iniciar-sesion', { correo, contrasena });
      const { token, usuario: nuevoUsuario } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
      
      setUsuario(nuevoUsuario);
      return { exito: true };
    } catch (error) {
      console.error("Error en login", error);
      return { 
        exito: false, 
        mensaje: error.response?.data?.error || 'Error al iniciar sesión' 
      };
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    window.location.href = '/'; 
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};
