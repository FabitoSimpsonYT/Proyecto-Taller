import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/api';

function ConfirmAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const confirm = async () => {
      try {
        const response = await fetch(`${API_URL}/api/reserva-atencion/${id}/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error confirming attendance:', error);
        setStatus('error');
      }
    };

    if (id) {
      confirm();
    } else {
      setStatus('error');
    }
  }, [id]);

  return (
    <div style={{ backgroundColor: '#111', backgroundImage: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.03), transparent 40%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.03), transparent 40%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', padding: '50px', borderRadius: '20px', border: '1px solid rgba(252, 227, 0, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '500px' }}>
        
        {status === 'loading' && (
          <h2 style={{ color: '#fce300', marginBottom: '20px', fontSize: '32px', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase' }}>Confirmando...</h2>
        )}

        {status === 'success' && (
          <>
            <h2 style={{ color: '#00ff88', marginBottom: '20px', fontSize: '32px', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase' }}>¡Asistencia Confirmada!</h2>
            <p style={{ color: '#ccc', marginBottom: '30px', fontSize: '16px', lineHeight: '1.6' }}>Gracias por confirmar tu asistencia. Te esperamos en Arréglame la Máquina.</p>
            <button 
              onClick={() => navigate('/')}
              style={{ padding: '15px 30px', background: 'linear-gradient(45deg, #00ff88, #00cc6a)', border: 'none', color: '#111', fontWeight: '900', fontSize: '16px', borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 5px 15px rgba(0, 255, 136, 0.3)' }}
            >
              VOLVER AL INICIO
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ color: '#ff4444', marginBottom: '20px', fontSize: '32px', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase' }}>Error</h2>
            <p style={{ color: '#ccc', marginBottom: '30px', fontSize: '16px', lineHeight: '1.6' }}>Hubo un problema al confirmar tu asistencia. Es posible que el enlace sea inválido o ya se haya confirmado.</p>
            <button 
              onClick={() => navigate('/')}
              style={{ padding: '15px 30px', background: 'linear-gradient(45deg, #ff4444, #cc0000)', border: 'none', color: 'white', fontWeight: '900', fontSize: '16px', borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 5px 15px rgba(255, 68, 68, 0.3)' }}
            >
              VOLVER AL INICIO
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmAttendance;
