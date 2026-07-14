import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Taller.css';

function Taller({ handleLogout }) {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: null });
  
  const token = localStorage.getItem('token');

  const [repairData, setRepairData] = useState({
    bus_id: '',
    description: '',
    repuestos_utilizados: [{ repuesto: '', cantidad: 1, costo: 0 }],
    status: 'in_progress'
  });
  
  const [initialDiagnosis, setInitialDiagnosis] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        setUserProfile(user);
        await fetchBuses();
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      handleLogout();
    }
  };

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/buses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBuses(data.filter(b => ['approved', 'rejected'].includes(b.status)));
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBus = async (bus) => {
    setSelectedBus(bus);
    setSubmitStatus({ loading: false, error: null, success: null });
    setRepairData({
      bus_id: bus.id,
      description: '',
      repuestos_utilizados: [{ repuesto: '', cantidad: 1, costo: 0 }],
      status: 'in_progress'
    });
    setInitialDiagnosis(null);
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/inspections/${bus.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        // Parse JSON fields if MariaDB returns them as strings
        if (typeof data.items === 'string') {
          try { data.items = JSON.parse(data.items); } catch(e){}
        }
        if (typeof data.partes_3d_danadas === 'string') {
          try { data.partes_3d_danadas = JSON.parse(data.partes_3d_danadas); } catch(e){}
        }

        setInitialDiagnosis(data);
        
        let initialRepuestos = [];
        
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach(it => {
            if (it.status === 'fail') {
              initialRepuestos.push({ pieza_danada: it.item_name, repuesto: '', cantidad: 1, costo: 0 });
            }
          });
        }
        
        if (data.partes_3d_danadas && Array.isArray(data.partes_3d_danadas)) {
          data.partes_3d_danadas.forEach(part => {
            if (!initialRepuestos.find(r => r.pieza_danada === part)) {
              initialRepuestos.push({ pieza_danada: part, repuesto: '', cantidad: 1, costo: 0 });
            }
          });
        }
        
        if (initialRepuestos.length === 0) {
          initialRepuestos.push({ pieza_danada: 'Adicional', repuesto: '', cantidad: 1, costo: 0 });
        }
        
        setRepairData(prev => ({
          ...prev,
          repuestos_utilizados: initialRepuestos
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRepuesto = () => {
    setRepairData({
      ...repairData,
      repuestos_utilizados: [...repairData.repuestos_utilizados, { pieza_danada: 'Adicional', repuesto: '', cantidad: 1, costo: 0 }]
    });
  };

  const handleRepuestoChange = (index, field, value) => {
    const newReps = [...repairData.repuestos_utilizados];
    newReps[index][field] = value;
    setRepairData({ ...repairData, repuestos_utilizados: newReps });
  };

  const handleRemoveRepuesto = (index) => {
    const newReps = repairData.repuestos_utilizados.filter((_, i) => i !== index);
    setRepairData({ ...repairData, repuestos_utilizados: newReps });
  };

  const handleSubmitRepair = async (e, finalStatus = 'in_progress') => {
    e.preventDefault();
    if (!repairData.bus_id) return;

    setSubmitStatus({ loading: true, error: null, success: null });
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...repairData,
          repuestos_utilizados: repairData.repuestos_utilizados.map(r => ({
            repuesto: r.pieza_danada && r.pieza_danada !== 'Adicional' ? `[Para ${r.pieza_danada}] ${r.repuesto}` : r.repuesto,
            cantidad: r.cantidad,
            costo: r.costo
          })),
          status: finalStatus
        })
      });

      if (response.ok) {
        setSubmitStatus({ loading: false, error: null, success: 'Reparación guardada exitosamente.' });
        setTimeout(() => {
          setSelectedBus(null);
          fetchBuses();
        }, 2000);
      } else {
        const err = await response.json();
        setSubmitStatus({ loading: false, error: err.error || 'Error al guardar reparación', success: null });
      }
    } catch (error) {
      console.error('Error submitting repair:', error);
      setSubmitStatus({ loading: false, error: 'Error de conexión con el servidor.', success: null });
    }
  };

  const handleExitWithoutRepairs = async () => {
    if (!repairData.bus_id) return;
    
    if (!window.confirm('¿Estás seguro de autorizar la salida sin registrar ninguna reparación?')) {
      return;
    }

    setSubmitStatus({ loading: true, error: null, success: null });
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bus_id: repairData.bus_id,
          description: 'Salida autorizada sin reparaciones.',
          repuestos_utilizados: [],
          status: 'completed'
        })
      });

      if (response.ok) {
        setSubmitStatus({ loading: false, error: null, success: 'Salida autorizada exitosamente.' });
        setTimeout(() => {
          setSelectedBus(null);
          fetchBuses();
        }, 2000);
      } else {
        const err = await response.json();
        setSubmitStatus({ loading: false, error: err.error || 'Error al autorizar salida', success: null });
      }
    } catch (error) {
      console.error('Error exiting without repairs:', error);
      setSubmitStatus({ loading: false, error: 'Error de conexión con el servidor.', success: null });
    }
  };

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
          <span className="user-name">{userProfile?.name}</span>
          <span className="role mechanic">Mecánico Inspector</span>
        </div>
      </header>

      <main className="taller-content">
        {!selectedBus ? (
          <div className="buses-selection">
            <h2 className="section-title">Máquinas en Espera de Revisión</h2>
            {loading ? (
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
                  <div key={bus.id} className="bus-card" onClick={() => handleSelectBus(bus)}>
                    <div className="bus-card-header">
                      <h3>{bus.patente}</h3>
                      <span className="status-badge process">EN TALLER</span>
                    </div>
                    <div className="bus-card-body">
                      <p><strong>Dueño:</strong> {bus.owner_name}</p>
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
              <button className="btn-cancel" onClick={() => setSelectedBus(null)}>
                ✕ Cancelar Revisión
              </button>
              <h2>Worklist: Piezas a Cambiar en <span className="patente-highlight">{selectedBus.patente}</span></h2>
            </div>
            
            <div className="workspace-layout">
              <aside className="vehicle-info-panel">
                <h3>Detalles del Vehículo</h3>
                <div className="info-group">
                  <label>Propietario</label>
                  <p>{selectedBus.owner_name}</p>
                </div>
                <hr />
                <div className="info-group">
                  <label>Carrocería</label>
                  <p>{selectedBus.marca_carroceria} {selectedBus.modelo_carroceria}</p>
                </div>
                <div className="info-group">
                  <label>Chasis</label>
                  <p>{selectedBus.marca_chasis} {selectedBus.modelo_chasis}</p>
                </div>
                
                {initialDiagnosis && (
                  <div style={{ marginTop: '20px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px' }}>
                    <h4 style={{ color: '#fce300', marginTop: 0 }}>Diagnóstico Recepción</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc', fontSize: '13px' }}>
                      {initialDiagnosis.items && Array.isArray(initialDiagnosis.items) && initialDiagnosis.items.map((it, i) => (
                        <li key={i}>{it.item_name}: {it.status === 'pass' ? '✅' : it.status === 'fail' ? '❌' : '⏳'}</li>
                      ))}
                    </ul>
                    {initialDiagnosis.partes_3d_danadas && Array.isArray(initialDiagnosis.partes_3d_danadas) && initialDiagnosis.partes_3d_danadas.length > 0 && (
                       <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '10px' }}>Partes dañadas: {initialDiagnosis.partes_3d_danadas.join(', ')}</p>
                    )}
                    {initialDiagnosis.exams_notes && (
                      <p style={{ color: '#aaa', fontSize: '12px', marginTop: '10px', fontStyle: 'italic' }}>"{initialDiagnosis.exams_notes}"</p>
                    )}
                  </div>
                )}
              </aside>

              <div className="inspection-form-panel">
                {submitStatus.error && <div className="alert error">{submitStatus.error}</div>}
                {submitStatus.success && <div className="alert success">{submitStatus.success}</div>}
                
                <form onSubmit={(e) => handleSubmitRepair(e, 'in_progress')}>
                  <div className="notes-section">
                    <h4>Trabajo a realizar / Observaciones Mecánicas</h4>
                    <textarea
                      value={repairData.description}
                      onChange={(e) => setRepairData({ ...repairData, description: e.target.value })}
                      placeholder="Detallar reparaciones efectuadas, ajustes, etc..."
                      rows={4}
                      required
                    ></textarea>
                  </div>

                  <div className="worklist-items" style={{ marginTop: '20px' }}>
                    <div className="items-header">
                      <h4>Piezas y Repuestos</h4>
                      <button type="button" className="btn-add" onClick={handleAddRepuesto}>
                        + Agregar Adicional
                      </button>
                    </div>
                    
                    <div className="items-list">
                      {repairData.repuestos_utilizados.map((item, index) => (
                        <div key={index} className="worklist-item pass" style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 0.8fr 1fr auto', gap: '10px', alignItems: 'center' }}>
                          <div className="pieza-danada-label" style={{ fontWeight: 'bold', color: item.pieza_danada !== 'Adicional' ? '#ff4444' : '#aaa' }}>
                            {item.pieza_danada !== 'Adicional' ? `⚠️ ${item.pieza_danada}` : '➕ Adicional'}
                          </div>
                          <input
                            type="text"
                            placeholder="Repuesto a colocar"
                            value={item.repuesto}
                            onChange={(e) => handleRepuestoChange(index, 'repuesto', e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Cant."
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => handleRepuestoChange(index, 'cantidad', e.target.value)}
                            required
                          />
                          <input
                            type="number"
                            placeholder="Costo"
                            min="0"
                            value={item.costo}
                            onChange={(e) => handleRepuestoChange(index, 'costo', e.target.value)}
                            required
                          />
                          <button 
                            type="button" 
                            className="btn-remove"
                            onClick={() => handleRemoveRepuesto(index)}
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
                      disabled={submitStatus.loading || submitStatus.success}
                    >
                      GUARDAR AVANCE
                    </button>
                    <button 
                      type="button" 
                      className={`btn-submit`}
                      style={{ flex: 1, backgroundColor: '#4CAF50', minWidth: '150px' }}
                      onClick={(e) => {
                        // Validate manually before submitting as completed
                        if (!repairData.description.trim()) {
                          alert('Por favor, ingresa el trabajo a realizar / observaciones.');
                          return;
                        }
                        handleSubmitRepair(e, 'completed');
                      }}
                      disabled={submitStatus.loading || submitStatus.success}
                    >
                      FINALIZAR REPARACIÓN
                    </button>
                    <button 
                      type="button" 
                      className={`btn-submit`}
                      style={{ flex: 1, backgroundColor: '#ff4444', minWidth: '150px' }}
                      onClick={handleExitWithoutRepairs}
                      disabled={submitStatus.loading || submitStatus.success}
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
    </div>
  );
}

export default Taller;
