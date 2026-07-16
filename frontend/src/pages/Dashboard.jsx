import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

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
        <main className="main-content" style={{ marginLeft: 0 }}>
          {activeTab !== 'menu' && (
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => setActiveTab('menu')}
                style={{ backgroundColor: '#444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
              >
                ← Volver al Menú
              </button>
            </div>
          )}
          {activeTab === 'menu' && (
            <div className="main-menu-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
              <button 
                onClick={() => setActiveTab('pending')}
                style={{ width: '100%', maxWidth: '350px', backgroundColor: '#2a2a2a', border: '2px solid #fce300', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2 style={{ color: '#fce300', marginBottom: '10px' }}>Confirmar Asistencia</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Ver vehículos reservados pendientes de confirmación.</p>
                <span style={{ marginTop: '20px', backgroundColor: '#fce300', color: 'black', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{pendingBuses.length} Pendientes</span>
              </button>

              <button 
                onClick={() => navigate('/recepcion')}
                style={{ width: '100%', maxWidth: '350px', backgroundColor: '#2a2a2a', border: '2px solid #00cc6a', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2 style={{ color: '#00cc6a', marginBottom: '10px' }}>Worklist de Recepción</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Realizar diagnóstico inicial e ingresar bus al taller.</p>
                <span style={{ marginTop: '20px', backgroundColor: '#00cc6a', color: 'black', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{inProcessBuses.length} Recepcionadas</span>
              </button>

              <button 
                onClick={() => navigate('/taller')}
                style={{ width: '100%', maxWidth: '350px', backgroundColor: '#2a2a2a', border: '2px solid #ff4444', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2 style={{ color: '#ff4444', marginBottom: '10px' }}>Worklist / Taller</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Gestionar repuestos a colocar y dar salida a máquinas.</p>
                <span style={{ marginTop: '20px', backgroundColor: '#ff4444', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{inTallerBuses.length} En Taller</span>
              </button>

              <button 
                onClick={() => navigate('/agendar')}
                style={{ width: '100%', maxWidth: '350px', backgroundColor: '#2a2a2a', border: '2px solid #3b82f6', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Crear Reserva</h2>
                <p style={{ color: '#aaa', margin: 0 }}>Agendar hora manualmente en el sistema.</p>
              </button>

              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('users')}
                  style={{ width: '100%', maxWidth: '350px', backgroundColor: '#2a2a2a', border: '2px solid #a855f7', borderRadius: '15px', padding: '40px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <h2 style={{ color: '#a855f7', marginBottom: '10px' }}>Gestión de Usuarios</h2>
                  <p style={{ color: '#aaa', margin: 0 }}>Crear nuevas cuentas para administradores o mecánicos.</p>
                </button>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <AdminPending buses={pendingBuses} onUpdate={fetchBuses} navigate={navigate} />
          )}

          {activeTab === 'users' && userProfile?.role === 'admin' && (
            <UserManagement />
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
      Swal.fire({
        icon: 'success',
        title: 'Asistencia confirmada',
        text: 'Redirigiendo al checklist de recepción...',
        timer: 2000,
        showConfirmButton: false
      });
      onUpdate();
      setTimeout(() => navigate('/recepcion'), 2000);
    } catch (error) {
      console.error('Error confirming attendance:', error);
      Swal.fire('Error', 'No se pudo confirmar la asistencia', 'error');
    }
  };

  const markNoShow = async (busId) => {
    const result = await Swal.fire({
      title: '¿Confirmar inasistencia?',
      text: 'Esta acción registrará que el bus no asistió y lo quitará de la lista.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      cancelButtonColor: '#444',
      confirmButtonText: 'Sí, marcar inasistencia',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      await api.post('/admin/mark-no-show', { bus_id: busId });
      Swal.fire('Registrada', 'Inasistencia registrada exitosamente.', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error marking no show:', error);
      Swal.fire('Error', 'No se pudo marcar la inasistencia', 'error');
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  className="btn-action"
                  style={{ backgroundColor: '#4CAF50', color: 'white', flex: 1 }}
                  onClick={() => confirmAttendance(bus.id)}
                >
                  Confirmar Ingreso al Taller
                </button>
                <button
                  className="btn-action"
                  style={{ backgroundColor: '#f44336', color: 'white', flex: 1 }}
                  onClick={() => markNoShow(bus.id)}
                >
                  Marcar Inasistencia
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserManagement() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'mecanico'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.post('/auth/register', formData);
      setMessage('Usuario creado exitosamente');
      setFormData({ full_name: '', email: '', password: '', role: 'mecanico' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el usuario');
    }
  };

  return (
    <div className="admin-section" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#2a2a2a', padding: '30px', borderRadius: '10px' }}>
      <h2 style={{ color: '#a855f7', marginBottom: '20px' }}>Crear Nuevo Usuario</h2>
      
      {message && <div style={{ padding: '10px', backgroundColor: 'rgba(0, 204, 106, 0.2)', color: '#00cc6a', marginBottom: '15px', borderRadius: '5px', border: '1px solid #00cc6a' }}>{message}</div>}
      {error && <div style={{ padding: '10px', backgroundColor: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ff4444' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Nombre Completo:</label>
          <input 
            type="text" 
            name="full_name" 
            value={formData.full_name} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: 'white' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Correo Electrónico:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: 'white' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Contraseña:</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: 'white' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Rol:</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: 'white' }}
          >
            <option value="mecanico">Mecánico</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '12px', backgroundColor: '#a855f7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Crear Cuenta
        </button>
      </form>
    </div>
  );
}

export default Dashboard;
