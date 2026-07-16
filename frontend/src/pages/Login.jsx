import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/index.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e, isGuest = false) => {
    if (e) e.preventDefault();
    setError('');
    
    const loginEmail = isGuest ? 'invitado@gmail.com' : email;
    const loginPassword = isGuest ? 'invitado123' : password;

    const result = await login(loginEmail, loginPassword);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-shell">
      <header className="encabezado">
        <h1>Arréglame la Máquina</h1>
      </header>

      <main className="seccion-principal auth-main">
        <div className="auth-card">
          <div className="auth-badge">Acceso al taller</div>
          <h2>INICIAR SESIÓN</h2>

          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="boton-amarillo auth-submit">
              INGRESAR
            </button>
          </form>

          <div className="auth-divider">
            <p>¿Necesitas agendar tu máquina?</p>
            <button
              type="button"
              onClick={() => navigate('/reserva-atencion')}
              className="boton-blanco auth-secondary"
            >
              AGENDA TU HORA
            </button>
          </div>
        </div>
      </main>

      <footer className="pie-de-pagina auth-footer">
        <div className="contacto-info">
          <p>Taller de Buses - Sistema de Gestión</p>
        </div>
      </footer>
    </div>
  );
}

export default Login;
