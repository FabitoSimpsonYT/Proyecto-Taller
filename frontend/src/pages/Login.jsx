import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/index.css';

function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { iniciarSesion } = useContext(AuthContext);

  const manejarInicioSesion = async (e, esInvitado = false) => {
    if (e) e.preventDefault();
    setError('');
    
    const correoInicio = esInvitado ? 'invitado@gmail.com' : correo;
    const contrasenaInicio = esInvitado ? 'invitado123' : contrasena;

    const resultado = await iniciarSesion(correoInicio, contrasenaInicio);
    
    if (resultado.exito) {
      navigate('/dashboard');
    } else {
      setError(resultado.mensaje);
    }
  };

  return (
    <div className="auth-shell">
      <header className="encabezado">
        <h1>Arréglame la Máquina</h1>
      </header>

      <main className="seccion-principal auth-main">
        <div className="auth-card">
          <h2>INICIAR SESIÓN</h2>

          <form onSubmit={manejarInicioSesion} className="auth-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
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
