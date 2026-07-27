import React, { useState, useEffect } from 'react';
import { obtenerHistorial } from '../services/history.service';
import '../styles/Dashboard.css'; // Podemos reusar algunos estilos
import { useNavigate } from 'react-router-dom';

function History() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const data = await obtenerHistorial();
      setHistorial(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el historial. Intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const traducirEstado = (estado, entregado) => {
    if (entregado) return 'Entregado al Cliente';
    switch (estado) {
      case 'pendiente': return 'Asistencia Pendiente';
      case 'en_proceso': return 'En Taller / Inspección';
      case 'aprobado': return 'Reparación Finalizada';
      case 'rechazado': return 'Rechazado por Cliente';
      default: return estado;
    }
  };

  const getStatusColor = (estado, entregado) => {
    if (entregado) return '#4CAF50';
    switch (estado) {
      case 'pendiente': return '#ff9800';
      case 'en_proceso': return '#2196F3';
      case 'aprobado': return '#4CAF50';
      case 'rechazado': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Historial General y Auditoría</h1>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Volver al Panel
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {cargando ? (
          <div className="loading-state">Cargando historial...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <div className="history-table-container" style={{ overflowX: 'auto', backgroundColor: 'var(--panel-bg)', borderRadius: '10px', padding: '20px' }}>
            {historial.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa' }}>No hay registros en el historial.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '15px 10px' }}>Fecha Reserva</th>
                    <th style={{ padding: '15px 10px' }}>Patente</th>
                    <th style={{ padding: '15px 10px' }}>Dueño</th>
                    <th style={{ padding: '15px 10px' }}>Estado Actual</th>
                    <th style={{ padding: '15px 10px' }}>Recepción</th>
                    <th style={{ padding: '15px 10px' }}>Mecánico</th>
                    <th style={{ padding: '15px 10px' }}>Despacho</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((res) => (
                    <tr key={res.reserva_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '15px 10px' }}>{new Date(res.fecha_reserva).toLocaleDateString()}</td>
                      <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{res.patente}</td>
                      <td style={{ padding: '15px 10px' }}>{res.Dueno?.nombre_completo || 'S/N'}</td>
                      <td style={{ padding: '15px 10px' }}>
                        <span style={{ 
                          backgroundColor: getStatusColor(res.estado, res.entregado), 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          color: 'white'
                        }}>
                          {traducirEstado(res.estado, res.entregado)}
                        </span>
                      </td>
                      <td style={{ padding: '15px 10px', fontSize: '13px' }}>
                        {res.Recepcionista ? (
                          <span style={{ color: '#aaa' }}>{res.Recepcionista.nombre}</span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '15px 10px', fontSize: '13px' }}>
                        {res.Mecanico ? (
                          <span style={{ color: '#aaa' }}>{res.Mecanico.nombre}</span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '15px 10px', fontSize: '13px' }}>
                        {res.Despachador ? (
                          <span style={{ color: '#aaa' }}>{res.Despachador.nombre}</span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default History;
