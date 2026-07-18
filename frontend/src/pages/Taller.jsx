import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Taller.css';
import { useTaller } from '../hooks/useTaller';
import Swal from 'sweetalert2';

function Taller() {
  const navigate = useNavigate();
  const {
    perfilUsuario,
    cerrarSesion,
    buses,
    cargando,
    busSeleccionado,
    setBusSeleccionado,
    estadoEnvio,
    datosReparacion,
    setDatosReparacion,
    diagnosticoInicial,
    manejarSeleccionBus,
    manejarAgregarRepuesto,
    manejarCambioRepuesto,
    manejarEliminarRepuesto,
    manejarEnvioReparacion,
    manejarSalidaSinReparacion,
    historialBus
  } = useTaller();

  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  return (
    <div className="taller-container">
      <header className="taller-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver al Panel
          </button>
          <h1>Módulo de Taller Mecánico</h1>
        </div>
        <div className="user-info">
          <span className="user-name">{perfilUsuario?.nombre}</span>
          <span className="role mechanic">Mecánico Inspector</span>
        </div>
      </header>

      <main className="taller-content">
        {!busSeleccionado ? (
          <div className="buses-selection">
            <h2 className="section-title">Máquinas en Espera de Revisión</h2>
            {cargando ? (
              <div className="loader">Cargando máquinas...</div>
            ) : buses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔧</div>
                <h3>No hay buses en el taller</h3>
                <p>Las recepciones de hoy ya han sido procesadas o aún no han ingresado máquinas.</p>
              </div>
            ) : (
              <div className="taller-grid">
                {buses.map(bus => (
                  <div key={bus.id} className="bus-card" onClick={() => manejarSeleccionBus(bus)}>
                    <div className="bus-card-header">
                      <h3>{bus.patente}</h3>
                      <span className="status-badge process">EN TALLER</span>
                    </div>
                    <div className="bus-card-body">
                      <p><strong>Dueño:</strong> {bus.Dueno?.nombre_completo || 'S/N'}</p>
                      <p><strong>Modelo:</strong> {bus.marca_carroceria} {bus.modelo_carroceria} / {bus.marca_chasis} {bus.modelo_chasis}</p>
                      <p><strong>Año:</strong> {bus.ano_fabricacion}</p>
                    </div>
                    <div className="bus-card-footer">
                      <button className="btn-start-inspection">
                        INICIAR REVISIÓN ➔
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
                ✕ Cancelar Revisión
              </button>
              <h2>Worklist: Piezas a Cambiar en <span className="patente-highlight">{busSeleccionado.patente}</span></h2>
              <button className="btn-history" onClick={() => setMostrarHistorial(true)} style={{ marginLeft: 'auto', background: '#333', color: '#fff', border: '1px solid #555', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                Ver Historial
              </button>
            </div>
            
            <div className="workspace-layout">
              <aside className="vehicle-info-panel">
                <h3>Detalles del Vehículo</h3>
                <div className="info-group">
                  <label>Propietario</label>
                  <p>{busSeleccionado.Dueno?.nombre_completo || 'S/N'}</p>
                </div>
                <hr />
                <div className="info-group">
                  <label>Carrocería</label>
                  <p>{busSeleccionado.marca_carroceria} {busSeleccionado.modelo_carroceria}</p>
                </div>
                <div className="info-group">
                  <label>Chasis</label>
                  <p>{busSeleccionado.marca_chasis} {busSeleccionado.modelo_chasis}</p>
                </div>
                
                {diagnosticoInicial && (
                  <div style={{ marginTop: '20px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px' }}>
                    <h4 style={{ color: '#fce300', marginTop: 0 }}>Diagnóstico Recepción</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc', fontSize: '13px' }}>
                      {diagnosticoInicial.items && Array.isArray(diagnosticoInicial.items) && diagnosticoInicial.items.map((it, i) => (
                        <li key={i}>{it.nombre_item}: {it.estado === 'aprobado' ? '✅' : it.estado === 'rechazado' ? '❌' : '⏳'}</li>
                      ))}
                    </ul>
                    {diagnosticoInicial.notas_examen && (
                      <p style={{ color: '#aaa', fontSize: '12px', marginTop: '10px', fontStyle: 'italic' }}>"{diagnosticoInicial.notas_examen}"</p>
                    )}
                  </div>
                )}
              </aside>

              <div className="inspection-form-panel">
                {estadoEnvio.error && <div className="alert error">{estadoEnvio.error}</div>}
                {estadoEnvio.exito && <div className="alert success">{estadoEnvio.exito}</div>}
                
                <form onSubmit={(e) => manejarEnvioReparacion(e, 'en_proceso')}>
                  <div className="notes-section">
                    <h4>Trabajo a realizar / Observaciones Mecánicas</h4>
                    <textarea
                      value={datosReparacion.descripcion}
                      onChange={(e) => setDatosReparacion({ ...datosReparacion, descripcion: e.target.value })}
                      placeholder="Detallar reparaciones efectuadas, ajustes, etc..."
                      rows={4}
                      required
                    ></textarea>
                  </div>

                  <div className="worklist-items" style={{ marginTop: '20px' }}>
                    <div className="items-header">
                      <h4>Piezas y Repuestos</h4>
                      <button type="button" className="btn-add" onClick={manejarAgregarRepuesto}>
                        + Agregar Adicional
                      </button>
                    </div>
                    
                    <div className="items-list">
                      {datosReparacion.repuestos_utilizados.map((item, index) => (
                        <div key={index} className="worklist-item pass" style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 0.8fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                          <div className="pieza-danada-label" style={{ fontWeight: 'bold', color: item.pieza_danada !== 'Adicional' ? '#ff4444' : '#aaa' }}>
                            {item.pieza_danada !== 'Adicional' ? `⚠️ ${item.pieza_danada}` : '➕ Adicional'}
                          </div>
                          <input
                            type="text"
                            placeholder="Repuesto a colocar"
                            value={item.repuesto}
                            onChange={(e) => manejarCambioRepuesto(index, 'repuesto', e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Cant."
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => manejarCambioRepuesto(index, 'cantidad', e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Costo"
                            min="0"
                            value={item.costo}
                            onChange={(e) => manejarCambioRepuesto(index, 'costo', e.target.value)}
                            required
                          />
                          <button 
                            type="button" 
                            className="btn-remove"
                            onClick={() => manejarEliminarRepuesto(index)}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <button 
                      type="submit" 
                      className={`btn-submit`}
                      style={{ flex: 1, backgroundColor: '#333', minWidth: '150px' }}
                      disabled={estadoEnvio.cargando || estadoEnvio.exito}
                    >
                      GUARDAR AVANCE
                    </button>
                    <button 
                      type="button" 
                      className={`btn-submit`}
                      style={{ flex: 1, backgroundColor: '#4CAF50', minWidth: '150px' }}
                      onClick={(e) => {
                        // Validate manually before submitting as completed
                        if (!datosReparacion.descripcion.trim()) {
                          Swal.fire('Atención', 'Por favor, ingresa el trabajo a realizar / observaciones.', 'warning');
                          return;
                        }
                        manejarEnvioReparacion(e, 'completado');
                      }}
                      disabled={estadoEnvio.cargando || estadoEnvio.exito}
                    >
                      FINALIZAR REPARACIÓN
                    </button>
                    <button 
                      type="button" 
                      className={`btn-submit`}
                      style={{ flex: 1, backgroundColor: '#ff4444', minWidth: '150px' }}
                      onClick={manejarSalidaSinReparacion}
                      disabled={estadoEnvio.cargando || estadoEnvio.exito}
                    >
                      DAR SALIDA SIN REPARAR
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {mostrarHistorial && (
        <div className="history-modal-overlay" onClick={() => setMostrarHistorial(false)}>
          <div className="history-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Historial de Reparaciones - {busSeleccionado?.patente}</h2>
              <button className="btn-close" onClick={() => setMostrarHistorial(false)}>✕</button>
            </div>
            <div className="modal-body">
              {historialBus.length === 0 ? (
                <p style={{ color: '#aaa' }}>No hay reparaciones previas registradas para esta máquina.</p>
              ) : (
                historialBus.map(record => (
                  <div key={record.id} className="history-record">
                    <div className="history-record-header">
                      <strong>Fecha:</strong> {new Date(record.fecha_reparacion).toLocaleDateString()} a las {new Date(record.fecha_reparacion).toLocaleTimeString()}
                      <span className={`status-badge ${record.estado}`}>{record.estado === 'completado' ? 'Completado' : 'En Proceso'}</span>
                    </div>
                    <div className="history-record-mechanic">
                      <strong>Mecánico:</strong> {record.Mecanico ? record.Mecanico.nombre_completo : `ID: ${record.mecanico_id}`}
                    </div>
                    <div className="history-record-desc">
                      <strong>Trabajo realizado:</strong>
                      <p>{record.descripcion}</p>
                    </div>
                    {record.repuestos_utilizados && record.repuestos_utilizados.length > 0 && (
                      <div className="history-record-parts">
                        <strong>Repuestos:</strong>
                        <ul>
                          {record.repuestos_utilizados.map((r, idx) => (
                            <li key={idx}>- {r.cantidad}x {r.repuesto} (${r.costo})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Taller;
