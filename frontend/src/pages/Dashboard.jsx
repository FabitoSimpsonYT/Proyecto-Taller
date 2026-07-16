import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

function Dashboard({ handleLogout }) {
  const navigate = useNavigate();
  const { user: userProfile } = useContext(AuthContext);
  const [buses, setBuses] = useState([]);
  const [loadingBuses, setLoadingBuses] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await api.get('/admin/buses');
      setBuses(response.data);
    } catch (error) {
      console.error('Error fetching buses:', error);
    } finally {
      setLoadingBuses(false);
    }
  };

  const pendingBuses = buses.filter(b => b.status === 'pending');
  const inProcessBuses = buses.filter(b => b.status === 'in_process');
  const inTallerBuses = buses.filter(b => ['approved', 'rejected'].includes(b.status));

  if (loadingBuses) {
    return <div className="dashboard-container"><p>Cargando datos del taller...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Panel de Control - Arréglame la Máquina</h1>
          <div className="user-info">
            <span>{userProfile?.name}</span>
            <span className={`role ${userProfile?.role}`}>{userProfile?.role === 'admin' ? 'Administrador' : 'Mecánico'}</span>
            <button onClick={handleLogout} className="logout-btn">
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
                <h2 style={{ color: '#fce300', marginBottom: '10px' }}>1. Confirmar Asistencia</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Ver vehículos reservados pendientes de confirmación.</p>
                <span style={{ marginTop: '20px', backgroundColor: '#fce300', color: 'black', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{pendingBuses.length} Pendientes</span>
              </button>

              <button 
                onClick={() => navigate('/recepcion')}
                style={{ backgroundColor: '#2a2a2a', border: '2px solid #00cc6a', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2 style={{ color: '#00cc6a', marginBottom: '10px' }}>2. Worklist de Recepción</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Realizar diagnóstico inicial e ingresar bus al taller.</p>
              </button>

              <button 
                onClick={() => navigate('/taller')}
                style={{ backgroundColor: '#2a2a2a', border: '2px solid #ff4444', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2 style={{ color: '#ff4444', marginBottom: '10px' }}>3. Worklist / Taller</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Gestionar repuestos a colocar y dar salida a máquinas.</p>
                <span style={{ marginTop: '20px', backgroundColor: '#ff4444', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{inTallerBuses.length} En Taller</span>
              </button>

              <button 
                onClick={() => navigate('/agendar')}
                style={{ backgroundColor: '#2a2a2a', border: '2px solid #3b82f6', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>4. Crear Reserva</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Agendar hora manualmente en el sistema.</p>
              </button>
            </div>
          )}

          {activeTab === 'pending' && (
            <AdminPending buses={pendingBuses} onUpdate={fetchBuses} navigate={navigate} />
          )}
        </main>
      </div>
    </div>
  );
}

function AdminPending({ buses, onUpdate, navigate }) {
  const confirmAttendance = async (busId) => {
    try {
      await api.post('/admin/confirm-attendance', { bus_id: busId });
      alert('Asistencia confirmada. Redirigiendo al checklist de recepción...');
      onUpdate();
      navigate('/recepcion');
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
                <p><strong>Bus:</strong> {bus.marca_carroceria} {bus.modelo_carroceria} / {bus.marca_chasis} {bus.modelo_chasis} ({bus.ano_fabricacion})</p>
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

export default Dashboard;
