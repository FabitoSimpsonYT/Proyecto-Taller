import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Taller.css';

function Reception() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: null });
  
  const token = localStorage.getItem('token');

  // Worklist State
  const [worklist, setWorklist] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [notes, setNotes] = useState('');
  const [damagedParts, setDamagedParts] = useState([]);

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
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/login');
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
        setBuses(data.filter(b => b.status === 'in_process'));
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    setSubmitStatus({ loading: false, error: null, success: null });
    setWorklist([]);
    setNewItemName('');
    setNotes('');
    setDamagedParts([]);
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      setWorklist([...worklist, { name: newItemName.trim(), status: 'pending' }]);
      setNewItemName('');
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!selectedBus) return;

    setSubmitStatus({ loading: true, error: null, success: null });
    
    try {
      const itemsArray = worklist.map(item => ({
        item_name: item.name,
        status: item.status
      }));

      const worklistRes = await fetch(`http://localhost:5000/api/admin/inspections/worklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bus_id: selectedBus.id,
          items: itemsArray,
          partes_3d_danadas: damagedParts,
          exams_notes: notes
        })
      });

      if (worklistRes.ok) {
        setSubmitStatus({ loading: false, error: null, success: 'Diagnóstico guardado exitosamente. El bus ha pasado al Taller.' });
        setTimeout(() => {
          setSelectedBus(null);
          fetchBuses();
        }, 2000);
      } else {
        const err = await worklistRes.json();
        setSubmitStatus({ loading: false, error: err.error || 'Error al guardar diagnóstico', success: null });
      }
    } catch (error) {
      console.error('Error submitting worklist:', error);
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
          <h1>Worklist de Recepción</h1>
        </div>
        <div className="user-info">
          <span className="user-name">{userProfile?.name}</span>
          <span className="role mechanic">Recepcionista</span>
        </div>
      </header>

      <main className="taller-content">
        {!selectedBus ? (
          <div className="buses-selection">
            <h2 className="section-title">Máquinas en Espera de Recepción</h2>
            {loading ? (
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
                  <div key={bus.id} className="bus-card" onClick={() => handleSelectBus(bus)}>
                    <div className="bus-card-header">
                      <h3>{bus.patente}</h3>
                      <span className="status-badge pending">EN RECEPCIÓN</span>
                    </div>
                    <div className="bus-card-body">
                      <p><strong>Dueño:</strong> {bus.owner_name}</p>
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
              <button className="btn-cancel" onClick={() => setSelectedBus(null)}>
                ✕ Cancelar Checklist
              </button>
              <h2>Diagnóstico: <span className="patente-highlight">{selectedBus.patente}</span></h2>
            </div>
            
            <div className="workspace-layout">
              <aside className="vehicle-info-panel">
                <h3>Detalles del Vehículo</h3>
                <div className="info-group">
                  <label>Propietario</label>
                  <p>{selectedBus.owner_name} ({selectedBus.owner_rut})</p>
                  <p>Tel: {selectedBus.owner_phone}</p>
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
                <div className="info-group">
                  <label>Año de Fabricación</label>
                  <p>{selectedBus.ano_fabricacion}</p>
                </div>
                <hr />
                <div className="info-group">
                  <label>Reserva Original</label>
                  <p>{new Date(selectedBus.reservation_date).toLocaleString('es-CL')}</p>
                </div>
              </aside>

              <div className="repair-form-panel">
                <form onSubmit={handleConfirm}>
                  <h3>Checklist de Inspección Visual</h3>
                  
                  <div className="repuestos-section">
                    <div className="repuestos-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {worklist.map((item, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
                          <label style={{ color: '#aaa', textTransform: 'capitalize', marginBottom: '8px' }}>Estado de {item.name}</label>
                          <select 
                            value={item.status} 
                            onChange={(e) => {
                               const newWorklist = [...worklist];
                               newWorklist[index].status = e.target.value;
                               setWorklist(newWorklist);
                            }}
                            style={{ padding: '12px', borderRadius: '8px', background: '#333', color: 'white', border: '1px solid #555' }}
                          >
                            <option value="pending">Pendiente de Revisión</option>
                            <option value="pass">OK (Buen Estado)</option>
                            <option value="fail">Falla / Dañado</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Nueva pieza a inspeccionar..." 
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        style={{ flex: 1, padding: '10px', borderRadius: '5px', background: '#222', color: 'white', border: '1px solid #555' }}
                      />
                      <button type="button" onClick={handleAddItem} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        + Añadir
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '30px' }}>
                    <label>Modelo 3D (Daños Estructurales)</label>
                    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#333', color: '#fff', borderRadius: '10px', marginTop: '10px' }}>
                      <p>El modelo 3D interactivo ha sido deshabilitado temporalmente.</p>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label>Observaciones Adicionales / Detalles a Manipular</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Espejo roto, raya lateral profunda, etc..."
                      rows="4"
                    />
                  </div>

                  {submitStatus.error && (
                    <div className="error-message" style={{ color: '#ff4444', backgroundColor: 'rgba(255,68,68,0.1)', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                      {submitStatus.error}
                    </div>
                  )}

                  {submitStatus.success && (
                    <div className="success-message" style={{ color: '#00ff88', backgroundColor: 'rgba(0,255,136,0.1)', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                      {submitStatus.success}
                    </div>
                  )}

                  <div className="form-actions" style={{ marginTop: '30px' }}>
                    <button 
                      type="submit" 
                      className="btn-submit"
                      disabled={submitStatus.loading}
                      style={{ background: 'linear-gradient(45deg, #fce300, #ffb300)', color: '#111', width: '100%' }}
                    >
                      {submitStatus.loading ? 'Guardando...' : 'ACTUALIZAR WORKLIST'}
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
