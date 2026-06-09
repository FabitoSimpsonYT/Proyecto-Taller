import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ handleLogout }) {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'pending', 'inspections'
  const token = localStorage.getItem('token');

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
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/buses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBuses(data);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  const pendingBuses = buses.filter(b => b.status === 'pending');
  const inProcessBuses = buses.filter(b => b.status === 'in_process');

  if (loading) {
    return <div className="dashboard-container"><p>Cargando...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Panel de Control - Arregla Tu Tarro</h1>
          <div className="user-info">
            <span>{userProfile?.name}</span>
            <span className={`role ${userProfile?.role}`}>{userProfile?.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
            <button onClick={() => { handleLogout(); navigate('/login'); }} className="logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {activeTab !== 'menu' && (
          <nav className="sidebar">
            <div className="nav-menu">
              <button className="nav-item" onClick={() => setActiveTab('menu')}>
                ← Volver al Menú
              </button>
              <button className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                Vehículos Reservados ({pendingBuses.length})
              </button>
              <button className={`nav-item ${activeTab === 'inspections' ? 'active' : ''}`} onClick={() => setActiveTab('inspections')}>
                Máquinas en Taller ({inProcessBuses.length})
              </button>
            </div>
          </nav>
        )}

        <main className="main-content" style={activeTab === 'menu' ? { marginLeft: 0 } : {}}>
          {activeTab === 'menu' && (
            <div className="main-menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: '40px' }}>
              <button 
                onClick={() => setActiveTab('pending')}
                style={{ backgroundColor: '#2a2a2a', border: '2px solid #fce300', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2 style={{ color: '#fce300', marginBottom: '10px' }}>Confirmar Asistencia del Bus</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Ver vehículos reservados que deben llegar al taller hoy.</p>
                <span style={{ marginTop: '20px', backgroundColor: '#fce300', color: 'black', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{pendingBuses.length} Pendientes</span>
              </button>

              <button 
                onClick={() => setActiveTab('inspections')}
                style={{ backgroundColor: '#2a2a2a', border: '2px solid #4CAF50', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2 style={{ color: '#4CAF50', marginBottom: '10px' }}>Máquinas en Taller</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Elaborar checklist y confirmar salida de buses en revisión.</p>
                <span style={{ marginTop: '20px', backgroundColor: '#4CAF50', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{inProcessBuses.length} En Proceso</span>
              </button>
            </div>
          )}

          {activeTab === 'pending' && (
            <AdminPending buses={pendingBuses} token={token} onUpdate={fetchBuses} />
          )}

          {activeTab === 'inspections' && (
            <AdminInspections buses={inProcessBuses} token={token} onUpdate={fetchBuses} />
          )}
        </main>
      </div>
    </div>
  );
}

function AdminPending({ buses, token, onUpdate }) {
  const confirmAttendance = async (busId) => {
    try {
      const response = await fetch('http://localhost:5000/api/inspections/confirm-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bus_id: busId })
      });

      if (response.ok) {
        alert('Asistencia confirmada. El bus pasó a la cola de inspección.');
        onUpdate();
      }
    } catch (error) {
      console.error('Error confirming attendance:', error);
    }
  };

  return (
    <div className="admin-section">
      <h2>Vehículos Reservados (Confirmar Asistencia)</h2>
      {buses.length === 0 ? (
        <div className="empty-state">
          <p>No hay buses reservados pendientes en este momento.</p>
        </div>
      ) : (
        <div className="buses-grid">
          {buses.map(bus => (
            <div key={bus.id} className="bus-card admin-card">
              <div className="bus-header">
                <h3>{bus.patente}</h3>
                <span className="status-badge pending">RESERVADO</span>
              </div>
              <div className="bus-details">
                <p style={{ color: '#fce300', fontWeight: 'bold' }}>Reserva: {new Date(bus.reservation_date).toLocaleString('es-CL')}</p>
                <hr style={{margin: '10px 0', borderColor: '#444'}} />
                <p><strong>Dueño:</strong> {bus.owner_name}</p>
                <p><strong>RUT Dueño:</strong> {bus.owner_rut}</p>
                <p><strong>Email:</strong> {bus.owner_email}</p>
                <p><strong>Teléfono:</strong> {bus.owner_phone}</p>
                <hr style={{margin: '10px 0', borderColor: '#444'}} />
                <p><strong>Bus:</strong> {bus.carroceria} - {bus.chasis} ({bus.ano_fabricacion})</p>
                {bus.driver_name && (
                  <p><strong>Chofer Asignado:</strong> {bus.driver_name} ({bus.driver_rut})</p>
                )}
              </div>
              <button
                className="btn-action"
                style={{ backgroundColor: '#4CAF50', color: 'white', marginTop: '15px' }}
                onClick={() => confirmAttendance(bus.id)}
              >
                Confirmar Ingreso al Taller
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminInspections({ buses, token, onUpdate }) {
  const [inspectionData, setInspectionData] = useState({
    bus_id: '',
    items: [
      { item_name: 'Frenos', status: 'pending' },
      { item_name: 'Luces', status: 'pending' },
      { item_name: 'Aceite', status: 'pending' },
      { item_name: 'Neumáticos', status: 'pending' }
    ],
    exams_notes: ''
  });

  const handleAddItem = () => {
    setInspectionData({
      ...inspectionData,
      items: [...inspectionData.items, { item_name: '', status: 'pending' }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...inspectionData.items];
    newItems[index][field] = value;
    setInspectionData({ ...inspectionData, items: newItems });
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!inspectionData.bus_id) return alert('Debes seleccionar un bus');
    
    try {
      const response = await fetch('http://localhost:5000/api/inspections/checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inspectionData)
      });

      if (response.ok) {
        alert('Inspección guardada y bus actualizado.');
        setInspectionData({
          bus_id: '',
          items: [
            { item_name: 'Frenos', status: 'pending' },
            { item_name: 'Luces', status: 'pending' },
            { item_name: 'Aceite', status: 'pending' },
            { item_name: 'Neumáticos', status: 'pending' }
          ],
          exams_notes: ''
        });
        onUpdate();
      }
    } catch (error) {
      console.error('Error submitting inspection:', error);
    }
  };

  return (
    <div className="admin-section">
      <h2>Máquinas en Taller (Checklist y Salida)</h2>
      {buses.length === 0 ? (
        <div className="empty-state">
          <p>No hay buses en proceso de inspección. Confirma asistencia de vehículos reservados primero.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitInspection} className="inspection-form">
          <div className="form-group">
            <label>Seleccionar Bus en Taller</label>
            <select
              value={inspectionData.bus_id}
              onChange={(e) => setInspectionData({ ...inspectionData, bus_id: parseInt(e.target.value) })}
              required
              style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
            >
              <option value="">-- Selecciona un bus --</option>
              {buses.map(bus => (
                <option key={bus.id} value={bus.id}>
                  {bus.patente} - {bus.owner_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Checklist de Revisión Técnica</label>
            {inspectionData.items.map((item, index) => (
              <div key={index} className="checklist-item" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Ítem de revisión"
                  value={item.item_name}
                  onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                  style={{ padding: '8px', flex: 1 }}
                />
                <select
                  value={item.status}
                  onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                  style={{ padding: '8px' }}
                >
                  <option value="pending">Pendiente</option>
                  <option value="pass">Aprobado</option>
                  <option value="fail">Rechazado</option>
                </select>
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="btn-add-item" style={{ padding: '5px 10px', marginTop: '10px' }}>
              + Agregar Ítem
            </button>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Notas Clínicas / Mecánicas</label>
            <textarea
              value={inspectionData.exams_notes}
              onChange={(e) => setInspectionData({ ...inspectionData, exams_notes: e.target.value })}
              placeholder="Observaciones de los exámenes realizados..."
              style={{ width: '100%', minHeight: '100px', padding: '10px', marginTop: '5px' }}
            ></textarea>
          </div>

          <button type="submit" className="btn-submit" style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#fce300', color: 'black', fontWeight: 'bold' }}>
            Guardar Inspección y Notificar
          </button>
        </form>
      )}
    </div>
  );
}

function AdminHistory({ buses }) {
  const history = buses.filter(b => b.status === 'approved' || b.status === 'rejected');

  return (
    <div className="admin-section">
      <h2>Historial de Buses Revisados</h2>
      {history.length === 0 ? (
        <div className="empty-state">
          <p>Aún no hay buses con inspección finalizada.</p>
        </div>
      ) : (
        <div className="buses-grid">
          {history.map(bus => (
            <div key={bus.id} className="bus-card admin-card">
              <div className="bus-header">
                <h3>{bus.patente}</h3>
                <span className={`status-badge ${bus.status}`}>{bus.status.toUpperCase()}</span>
              </div>
              <div className="bus-details">
                <p><strong>Dueño:</strong> {bus.owner_name}</p>
                <p><strong>Bus:</strong> {bus.carroceria} - {bus.chasis}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
