import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patente: '',
    carroceria: '',
    chasis: '',
    ano_fabricacion: '',
    owner_rut: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    driver_rut: '',
    driver_name: '',
    driver_phone: '',
    reservation_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/buses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          patente: '', carroceria: '', chasis: '', ano_fabricacion: '',
          owner_rut: '', owner_name: '', owner_email: '', owner_phone: '',
          driver_rut: '', driver_name: '', driver_phone: '', reservation_date: ''
        });
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div style={{ backgroundColor: '#111', backgroundImage: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.03), transparent 40%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.03), transparent 40%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', padding: '50px', borderRadius: '20px', border: '1px solid rgba(252, 227, 0, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ color: '#fce300', marginBottom: '20px', fontSize: '32px', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase' }}>¡Hora Reservada con Éxito!</h2>
          <p style={{ color: '#ccc', marginBottom: '30px', fontSize: '16px', lineHeight: '1.6' }}>Tu bus ha sido ingresado al sistema para la hora indicada. El administrador te confirmará la recepción.</p>
          <button 
            onClick={() => setSuccess(false)}
            style={{ padding: '15px 30px', background: 'linear-gradient(45deg, #fce300, #ffb300)', border: 'none', color: '#111', fontWeight: '900', fontSize: '16px', borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 5px 15px rgba(252, 227, 0, 0.3)' }}
          >
            AGENDAR OTRA HORA
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white', fontSize: '15px', boxSizing: 'border-box',
    transition: 'border-color 0.3s, box-shadow 0.3s'
  };
  
  const labelStyle = { color: '#aaa', display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' };

  return (
    <div style={{ backgroundColor: '#111', backgroundImage: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.03), transparent 40%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.03), transparent 40%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px', paddingBottom: '50px' }}>
      <div style={{ position: 'absolute', top: 30, right: 30 }}>
        <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#fce300'; e.currentTarget.style.color = '#fce300'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#ccc'; }}>Acceso Admin</button>
      </div>

      <h1 style={{ color: '#fce300', marginBottom: '10px', fontSize: '48px', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase', textShadow: '2px 2px 10px rgba(252, 227, 0, 0.2)' }}>Arregla Tu Tarro</h1>
      <p style={{ color: '#ccc', marginBottom: '40px', fontSize: '18px', letterSpacing: '1px' }}>Reserva tu hora de atención para evaluación mecánica</p>
      
      <div style={{ background: 'rgba(20, 20, 20, 0.7)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', padding: '50px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', width: '100%', maxWidth: '650px' }}>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '0', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>1. Datos del Bus y Reserva</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#fce300', display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase' }}>Fecha y Hora de Reserva *</label>
              <input type="datetime-local" name="reservation_date" required value={formData.reservation_date} onChange={handleChange} style={{...inputStyle, border: '1px solid rgba(252, 227, 0, 0.3)'}} />
            </div>
            <div>
              <label style={labelStyle}>Patente *</label>
              <input type="text" name="patente" required value={formData.patente} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Año *</label>
              <input type="number" name="ano_fabricacion" required value={formData.ano_fabricacion} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Carrocería *</label>
              <input type="text" name="carroceria" required value={formData.carroceria} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Chasis *</label>
              <input type="text" name="chasis" required value={formData.chasis} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '40px', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>2. Datos del Dueño</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>RUT *</label>
              <input type="text" name="owner_rut" required value={formData.owner_rut} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nombre Completo *</label>
              <input type="text" name="owner_name" required value={formData.owner_name} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" name="owner_email" required value={formData.owner_email} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono *</label>
              <input type="text" name="owner_phone" required value={formData.owner_phone} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '40px', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>3. Datos del Chofer (Opcional)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>RUT</label>
              <input type="text" name="driver_rut" value={formData.driver_rut} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nombre Completo</label>
              <input type="text" name="driver_name" value={formData.driver_name} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Teléfono</label>
              <input type="text" name="driver_phone" value={formData.driver_phone} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '40px', padding: '18px', background: 'linear-gradient(45deg, #fce300, #ffb300)', border: 'none', color: '#111', fontWeight: '900', fontSize: '18px', letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 20px rgba(252, 227, 0, 0.4)', transition: 'transform 0.2s' }}>
            {loading ? 'Procesando...' : 'Confirmar Reserva de Hora'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LandingForm;
