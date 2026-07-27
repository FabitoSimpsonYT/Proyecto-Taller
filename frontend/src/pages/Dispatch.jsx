import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerBusesParaDespacho, marcarComoEntregado } from '../services/dispatch.service';
import { obtenerPerfil } from '../services/auth.service';
import '../styles/Taller.css'; // Podemos reusar los estilos del taller o recepcion

function Dispatch() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    obtenerBuses();
    const perfil = obtenerPerfil();
    if (perfil) {
      setPerfilUsuario(perfil);
    }
  }, []);

  const obtenerBuses = async () => {
    try {
      setCargando(true);
      const res = await obtenerBusesParaDespacho();
      setBuses(res.data);
    } catch (error) {
      console.error("Error obteniendo buses para despacho", error);
      setMensaje({ tipo: 'error', texto: 'Error cargando las máquinas listas para despacho.' });
    } finally {
      setCargando(false);
    }
  };

  const manejarEntrega = async (bus) => {
    if (!window.confirm(`¿Confirmar que el cliente se llevó la máquina con patente ${bus.patente}?`)) return;

    try {
      await marcarComoEntregado(bus.id);
      setMensaje({ tipo: 'exito', texto: `Máquina ${bus.patente} marcada como entregada correctamente.` });
      // Remover de la lista
      setBuses(buses.filter(b => b.id !== bus.id));
      
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
    } catch (error) {
      console.error("Error entregando bus", error);
      setMensaje({ tipo: 'error', texto: 'Hubo un error al intentar marcar la máquina como entregada.' });
    }
  };

  return (
    <div className="taller-container">
      <header className="taller-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver al Panel
          </button>
          <h1>Módulo de Despacho</h1>
        </div>
        <div className="user-info">
          <span className="user-name">{perfilUsuario?.nombre}</span>
          <span className={`role ${perfilUsuario?.rol || 'admin'}`}>
            {perfilUsuario?.rol === 'admin' ? 'Administrador' : 'Recepcionista'}
          </span>
        </div>
      </header>

      <main className="taller-content">
        <div className="buses-selection">
          <h2 className="section-title">Máquinas Listas para Retiro</h2>
          
          {mensaje.texto && (
            <div className={`alert ${mensaje.tipo === 'exito' ? 'success-message' : 'error-message'}`} style={{ marginBottom: '20px', padding: '15px', borderRadius: '8px', backgroundColor: mensaje.tipo === 'exito' ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)', color: mensaje.tipo === 'exito' ? '#00ff88' : '#ff4444' }}>
              {mensaje.texto}
            </div>
          )}

          {cargando ? (
            <div className="loader">Cargando máquinas...</div>
          ) : buses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <h3>No hay máquinas pendientes de retiro</h3>
              <p>Todas las máquinas listas ya fueron despachadas a sus dueños.</p>
            </div>
          ) : (
            <div className="taller-grid">
              {buses.map(bus => (
                <div key={bus.id} className="bus-card" style={{ cursor: 'default' }}>
                  <div className="bus-card-header">
                    <h3>{bus.patente}</h3>
                    <span className={`status-badge ${bus.estado === 'rechazado' ? 'rejected' : 'success'}`} style={{ backgroundColor: bus.estado === 'rechazado' ? '#ff4444' : '#4CAF50' }}>
                      {bus.estado === 'rechazado' ? 'RECHAZADO' : 'REPARADO'}
                    </span>
                  </div>
                  <div className="bus-card-body">
                    <p><strong>Dueño:</strong> {bus.Dueno?.nombre_completo || 'S/N'}</p>
                    <p><strong>Modelo:</strong> {bus.marca_carroceria} {bus.modelo_carroceria} / {bus.marca_chasis} {bus.modelo_chasis}</p>
                    <p><strong>Año:</strong> {bus.ano_fabricacion}</p>
                    <p>
                      <strong>Estado:</strong> {bus.estado === 'rechazado' ? 'Cliente decidió no reparar' : 'Reparación Finalizada'}
                    </p>
                    {bus.estado === 'rechazado' && bus.Recepcionista && (
                      <p style={{ color: '#ff4444', fontSize: '13px' }}>
                        Rechazado por: {bus.Recepcionista.nombre}
                      </p>
                    )}
                  </div>
                  <div className="bus-card-footer">
                    <button 
                      className="btn-start-inspection" 
                      onClick={() => manejarEntrega(bus)}
                      style={{ background: '#4CAF50', color: 'white', width: '100%', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ✓ MARCAR COMO RETIRADO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dispatch;
