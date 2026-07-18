import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/api';
import '../styles/Taller.css';

function Reception() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busSeleccionado, setBusSeleccionado] = useState(null);
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [estadoEnvio, setEstadoEnvio] = useState({ cargando: false, error: null, exito: null });
  
  const token = localStorage.getItem('token');

  // Worklist State
  const [listaTrabajo, setListaTrabajo] = useState([]);
  const [nombreNuevoItem, setNombreNuevoItem] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    obtenerPerfilUsuario();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerPerfilUsuario = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        setPerfilUsuario(user);
        await obtenerBuses();
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      navigate('/login');
    }
  };

  const obtenerBuses = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/buses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBuses(data.filter(b => b.estado === 'en_proceso'));
      }
    } catch (error) {
      console.error('Error al obtener buses:', error);
    } finally {
      setCargando(false);
    }
  };

  const manejarSeleccionBus = (bus) => {
    setBusSeleccionado(bus);
    setEstadoEnvio({ cargando: false, error: null, exito: null });
    setListaTrabajo([]);
    setNombreNuevoItem('');
    setNotas('');
  };

  const manejarAgregarItem = () => {
    if (nombreNuevoItem.trim()) {
      setListaTrabajo([...listaTrabajo, { name: nombreNuevoItem.trim(), status: 'pendiente' }]);
      setNombreNuevoItem('');
    }
  };

  const manejarConfirmar = async (e) => {
    e.preventDefault();
    if (!busSeleccionado) return;

    setEstadoEnvio({ cargando: true, error: null, exito: null });
    
    try {
      const itemsArray = listaTrabajo.map(item => ({
        nombre_item: item.name,
        estado: item.status
      }));

      const worklistRes = await fetch(`${API_URL}/api/admin/inspecciones/lista-trabajo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bus_id: busSeleccionado.id,
          items: itemsArray,
          notas_examen: notas
        })
      });

      if (worklistRes.ok) {
        setEstadoEnvio({ cargando: false, error: null, exito: 'Diagnóstico guardado exitosamente. El bus ha pasado al Taller.' });
        setTimeout(() => {
          setBusSeleccionado(null);
          obtenerBuses();
        }, 2000);
      } else {
        const err = await worklistRes.json();
        setEstadoEnvio({ cargando: false, error: err.error || 'Error al guardar diagnóstico', exito: null });
      }
    } catch (error) {
      console.error('Error enviando lista de trabajo:', error);
      setEstadoEnvio({ cargando: false, error: 'Error de conexión con el servidor.', exito: null });
    }
  };

  return (
    <div className="taller-container">
      <header className="taller-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver al Panel
          </button>
          <h1>Worklist de Recepción</h1>
        </div>
        <div className="user-info">
          <span className="user-name">{perfilUsuario?.nombre}</span>
          <span className="role mechanic">Recepcionista</span>
        </div>
      </header>

      <main className="taller-content">
        {!busSeleccionado ? (
          <div className="buses-selection">
            <h2 className="section-title">Máquinas en Espera de Recepción</h2>
            {cargando ? (
              <div className="loader">Cargando máquinas...</div>
            ) : buses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No hay buses pendientes de recepción</h3>
                <p>Confirma la asistencia de reservas desde el panel de control para que aparezcan aquí.</p>
              </div>
            ) : (
              <div className="taller-grid">
                {buses.map(bus => (
                  <div key={bus.id} className="bus-card" onClick={() => manejarSeleccionBus(bus)}>
                    <div className="bus-card-header">
                      <h3>{bus.patente}</h3>
                      <span className="status-badge pending">EN RECEPCIÓN</span>
                    </div>
                    <div className="bus-card-body">
                      <p><strong>Dueño:</strong> {bus.Dueno?.nombre_completo || 'S/N'}</p>
                      <p><strong>Modelo:</strong> {bus.marca_carroceria} {bus.modelo_carroceria} / {bus.marca_chasis} {bus.modelo_chasis}</p>
                      <p><strong>Año:</strong> {bus.ano_fabricacion}</p>
                    </div>
                    <div className="bus-card-footer">
                      <button className="btn-start-inspection" style={{ backgroundColor: '#fce300', color: '#111' }}>
                        HACER CHECKLIST ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="inspection-workspace">
            <div className="workspace-header">
              <button className="btn-cancel" onClick={() => setBusSeleccionado(null)}>
                ✕ Cancelar Checklist
              </button>
              <h2>Diagnóstico: <span className="patente-highlight">{busSeleccionado.patente}</span></h2>
            </div>
            
            <div className="workspace-layout">
              <aside className="vehicle-info-panel">
                <h3>Detalles del Vehículo</h3>
                <div className="info-group">
                  <label>Propietario</label>
                  <p>{busSeleccionado.Dueno?.nombre_completo || 'S/N'} ({busSeleccionado.Dueno?.rut || 'S/N'})</p>
                  <p>Tel: {busSeleccionado.Dueno?.telefono || 'S/N'}</p>
                </div>
                {busSeleccionado.Conductor?.nombre_completo && (
                  <>
                    <hr />
                    <div className="info-group">
                      <label>Conductor</label>
                      <p>{busSeleccionado.Conductor.nombre_completo} {busSeleccionado.Conductor.rut ? `(${busSeleccionado.Conductor.rut})` : ''}</p>
                      {busSeleccionado.Conductor.telefono && <p>Tel: {busSeleccionado.Conductor.telefono}</p>}
                    </div>
                  </>
                )}
                <hr />
                <div className="info-group">
                  <label>Carrocería</label>
                  <p>{busSeleccionado.marca_carroceria} {busSeleccionado.modelo_carroceria}</p>
                </div>
                <div className="info-group">
                  <label>Chasis</label>
                  <p>{busSeleccionado.marca_chasis} {busSeleccionado.modelo_chasis}</p>
                </div>
                <div className="info-group">
                  <label>Año de Fabricación</label>
                  <p>{busSeleccionado.ano_fabricacion}</p>
                </div>
                <hr />
                <div className="info-group">
                  <label>Reserva Original</label>
                  <p>{new Date(busSeleccionado.fecha_reserva).toLocaleString('es-CL')}</p>
                </div>
                {busSeleccionado.detalles_visuales && busSeleccionado.detalles_visuales.length > 0 && (
                  <>
                    <hr />
                    <div className="info-group">
                      <label style={{ color: '#fce300' }}>Detalles a Visualizar (Cliente)</label>
                      <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                        {busSeleccionado.detalles_visuales.map((detail, idx) => (
                          <li key={idx} style={{ marginBottom: '5px' }}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </aside>

              <div className="repair-form-panel">
                <form onSubmit={manejarConfirmar}>
                  <h3>Checklist de Inspección Visual</h3>
                  
                  <div className="repuestos-section">
                    <div className="repuestos-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {listaTrabajo.map((item, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
                          <label style={{ color: '#aaa', textTransform: 'capitalize', marginBottom: '8px' }}>Estado de {item.name}</label>
                          <select 
                            value={item.status} 
                            onChange={(e) => {
                               const newWorklist = [...listaTrabajo];
                               newWorklist[index].status = e.target.value;
                               setListaTrabajo(newWorklist);
                            }}
                            style={{ padding: '12px', borderRadius: '8px', background: '#333', color: 'white', border: '1px solid #555' }}
                          >
                            <option value="pendiente">Pendiente de Revisión</option>
                            <option value="aprobado">OK (Buen Estado)</option>
                            <option value="rechazado">Falla / Dañado</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Nueva pieza a inspeccionar..." 
                        value={nombreNuevoItem}
                        onChange={e => setNombreNuevoItem(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '5px', background: '#222', color: 'white', border: '1px solid #555' }}
                      />
                      <button type="button" onClick={manejarAgregarItem} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        + Añadir
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label>Observaciones Adicionales / Detalles a Manipular</label>
                    <textarea 
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Ej: Espejo roto, raya lateral profunda, etc..."
                      rows="4"
                    />
                  </div>

                  {estadoEnvio.error && (
                    <div className="error-message" style={{ color: '#ff4444', backgroundColor: 'rgba(255,68,68,0.1)', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                      {estadoEnvio.error}
                    </div>
                  )}

                  {estadoEnvio.exito && (
                    <div className="success-message" style={{ color: '#00ff88', backgroundColor: 'rgba(0,255,136,0.1)', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                      {estadoEnvio.exito}
                    </div>
                  )}

                  <div className="form-actions" style={{ marginTop: '30px' }}>
                    <button 
                      type="submit" 
                      className="btn-submit"
                      disabled={estadoEnvio.cargando}
                      style={{ background: 'linear-gradient(45deg, #fce300, #ffb300)', color: '#111', width: '100%' }}
                    >
                      {estadoEnvio.cargando ? 'Guardando...' : 'ACTUALIZAR WORKLIST'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Reception;
