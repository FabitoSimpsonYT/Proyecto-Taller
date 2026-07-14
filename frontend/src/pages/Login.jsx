import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/index.css';
import { API_URL } from '../utils/api';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e, isGuest = false) => {
    if (e) e.preventDefault();
    setError('');
    
    const loginEmail = isGuest ? 'invitado@gmail.com' : email;
    const loginPassword = isGuest ? 'invitado123' : password;

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (setToken) setToken(response.data.token);
        
        // Forzar recarga a la ruta del dashboard para que App.js detecte el token fresco
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="encabezado">
        <h1>Arréglame la Máquina</h1>
      </header>

      <main className="seccion-principal" style={{ flex: 1, alignItems: 'center' }}>
        <div className="caja expandida" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', color: '#fce300', marginBottom: '20px' }}>
            INICIAR SESIÓN
          </h2>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '16px'
              }}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '16px'
              }}
            />
            
            {error && <p style={{ color: '#ff4d4d', margin: '0' }}>{error}</p>}
            
            <button type="submit" className="boton-amarillo" style={{ width: '100%', marginTop: '10px' }}>
              INGRESAR
            </button>
          </form>

          <div style={{ marginTop: '20px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
            <p style={{ color: '#a0a0a0', marginBottom: '15px', fontSize: '14px' }}>¿Necesitas agendar tu máquina?</p>
            <button 
              type="button" 
              onClick={() => navigate('/reserva-atencion')} 
              className="boton-blanco" 
              style={{ width: '100%' }}
            >
              AGENDA TU HORA
            </button>
          </div>
        </div>
      </main>

      <footer className="pie-de-pagina" style={{ marginTop: 'auto' }}>
        <div className="contacto-info">
          <p>Taller de Buses - Sistema de Gestión</p>
        </div>
      </footer>
    </div>
  );
}

export default Login;
