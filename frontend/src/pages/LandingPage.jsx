import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaSearch, FaWrench, FaFacebookF, FaInstagram, FaLinkedinIn, FaCheckSquare, FaBus, FaCogs, FaClipboardCheck, FaServer, FaCheck, FaWhatsapp } from 'react-icons/fa';
import '../styles/LandingPage.css';

function TarjetaCaracteristica({ icono, titulo, descripcion, detalles }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div
      className={`caja ${expandido ? 'expandida' : ''}`}
      onClick={() => setExpandido(!expandido)}
      style={{ cursor: 'pointer' }}
    >
      <div className="icono-ventaja">{icono}</div>
      <h3>{titulo}</h3>
      <p>{descripcion}</p>

      {expandido && (
        <ul className="detalles-caja">
          {detalles.map((detalle, indice) => (
            <li key={indice}><FaCheckSquare className="check-icon" /> {detalle}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page-container">
      {/* 1. Encabezado o Navegación */}
      <header className="encabezado">
        <h1>Arréglame la Máquina</h1>
        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#como-funciona">Cómo Funciona</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      {/* 2. Sección Principal (Lo primero que se ve) */}
      <main>
        <section id="inicio" className="seccion-principal">
          <div className="seccion-principal-contenido">
            <div className="seccion-principal-imagen">
              <div className="imagen-con-degradado"></div>
            </div>
            <div className="seccion-principal-texto">
              <h2>EL SISTEMA MÁS SIMPLE PARA<br />TU TALLER DE BUSES</h2>
              <p>
                <strong>Software 100% gratuito.</strong> Controla tus órdenes de compra, inventario de repuestos y 
                mantenimiento de tu flota en un solo lugar fácil de usar.
              </p>
              <div className="botones-accion">
                <button className="boton-blanco" onClick={() => navigate('/agendar')}>AGENDA TU HORA</button>
                <button className="boton-amarillo" onClick={() => navigate('/login')}>INICIAR SESIÓN</button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Sección de Ventajas (Las 3 cajitas expansibles) */}
        <section id="caracteristicas" className="seccion-caracteristicas">
          <h2>Ventajas de Arréglame la Máquina</h2>
          <div className="lista-cajas">
            <TarjetaCaracteristica
              icono={<FaBoxOpen />}
              titulo="Órdenes de Compra"
              descripcion="Digitaliza tus pedidos y ahorra tiempo con procesos automáticos."
              detalles={[
                "Workflow de aprobación de compras",
                "Envío automático al proveedor por email",
                "Seguimiento de tiempos de entrega en tiempo real"
              ]}
            />
            <TarjetaCaracteristica
              icono={<FaSearch />}
              titulo="Inventario de Precisión"
              descripcion="Controla cada tornillo y evita pérdidas de stock innecesarias."
              detalles={[
                "Historial completo de entradas y salidas",
                "Alertas de stock crítico",
                "Valoración de inventario en tiempo real"
              ]}
            />
            <TarjetaCaracteristica
              icono={<FaWrench />}
              titulo="Mantenimiento de Flota"
              descripcion="Asegura la operatividad de tus buses con un control de costos exacto."
              detalles={[
                "Creación de Órdenes de Trabajo (OT)",
                "Worklist de diagnóstico preventivo",
                "Consumo de inventario enlazado automáticamente"
              ]}
            />
            <TarjetaCaracteristica
              icono={<FaServer />}
              titulo="Privacidad Local"
              descripcion="Tu información es solo tuya. Sin dependencias de la nube."
              detalles={[
                "Instalación en servidores de tu taller",
                "Acceso sin necesidad de internet (Offline)",
                "Bases de datos seguras dentro de tu propiedad"
              ]}
            />
          </div>
        </section>
        
        {/* Sección: Cómo Funciona */}
        <section id="como-funciona" className="seccion-pasos">
          <h2>¿Cómo Funciona?</h2>
          <p className="subtitulo-seccion">Un proceso simple para talleres eficientes</p>
          <div className="contenedor-pasos">
            <div className="paso-card">
              <div className="numero-paso">1</div>
              <div className="icono-paso"><FaBus /></div>
              <h3>Recepción</h3>
              <p>Ingresas el bus al taller y creas una orden detallando el problema reportado por el conductor.</p>
            </div>
            <div className="paso-card">
              <div className="numero-paso">2</div>
              <div className="icono-paso"><FaCogs /></div>
              <h3>Reparación</h3>
              <p>Los mecánicos solicitan repuestos. El sistema busca en tu inventario y los descuenta o crea alertas de compra.</p>
            </div>
            <div className="paso-card">
              <div className="numero-paso">3</div>
              <div className="icono-paso"><FaClipboardCheck /></div>
              <h3>Control</h3>
              <p>La unidad sale a ruta y el sistema te entrega el costo exacto de la reparación y el estado de tu stock.</p>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Pie de página (Footer) */}
      <footer id="contacto" className="pie-de-pagina">
        <div className="contacto-info">
          <p>¿Tienes dudas? Escríbenos a fabian.mora2301@alumnos.ubiobio.cl</p>
          <p>Teléfono: +56974111524</p>
        </div>
        <div className="redes-sociales">
          <a href="#facebook" aria-label="Facebook"><FaFacebookF /></a>
          <a href="#instagram" aria-label="Instagram"><FaInstagram /></a>
          <a href="#linkedin" aria-label="LinkedIn"><FaLinkedinIn /></a>
        </div>
      </footer>

      {/* Botón de WhatsApp Flotante */}
      <a 
        href="https://wa.me/56974111524" 
        className="boton-whatsapp" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </div>
  );
}

export default LandingPage;
