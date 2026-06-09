import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>Sistema de Verificación de Autobuses</h1>
          <p>Gestión integral de buses y verificaciones</p>
        </div>
      </header>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <span>1</span>
            </div>
            <h3>Registro de Dueños</h3>
            <p>Registra tus datos personales, contacto y información del bus</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span>2</span>
            </div>
            <h3>Datos del Bus</h3>
            <p>Ingresa patente, carrocería, chasis y año de fabricación</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span>3</span>
            </div>
            <h3>Verificación Administrativa</h3>
            <p>Los administradores confirman asistencia y realizan inspecciones</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <span>4</span>
            </div>
            <h3>Comunicación Directa</h3>
            <p>Contacto vía email, teléfono o WhatsApp con el dueño</p>
          </div>
        </div>
      </section>

      <section className="process-section">
        <h2>Proceso de Verificación</h2>
        <div className="process-timeline">
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Registro Inicial</h4>
              <p>El dueño o conductor registra el bus con todos sus datos</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Confirmación de Asistencia</h4>
              <p>El administrador confirma la asistencia del vehículo</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Inspección y Exámenes</h4>
              <p>Se realizan exámenes técnicos y checklist de mantenimiento</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h4>Notificación al Dueño</h4>
              <p>Se contacta al dueño con los resultados y próximos pasos</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Comienza Ahora</h2>
        <p>Accede al sistema para registrar tu bus o gestionar verificaciones</p>
        <div className="cta-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/registro')}
          >
            Registrarse
          </button>
        </div>
      </section>

      <footer className="home-footer">
        <p>Sistema de Verificación de Autobuses - Gestión Integral</p>
        <p>Contacto: info@verificacionautobuses.com</p>
      </footer>
    </div>
  );
}

export default Home;
