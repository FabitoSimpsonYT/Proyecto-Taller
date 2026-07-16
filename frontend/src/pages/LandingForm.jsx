import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/api';
import Swal from 'sweetalert2';

function LandingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patente: '',
    marca_carroceria: '',
    modelo_carroceria: '',
    marca_chasis: '',
    modelo_chasis: '',
    ano_fabricacion: '',
    owner_rut: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    driver_rut: '',
    driver_name: '',
    driver_phone: '',
    reservation_date: '',
    reservation_time: '',
    visual_details: []
  });
  const [newDetail, setNewDetail] = useState('');

  const handleAddDetail = (e) => {
    e.preventDefault();
    if (newDetail.trim() !== '') {
      setFormData({ ...formData, visual_details: [...formData.visual_details, newDetail.trim()] });
      setNewDetail('');
    }
  };

  const handleRemoveDetail = (index) => {
    const updatedDetails = [...formData.visual_details];
    updatedDetails.splice(index, 1);
    setFormData({ ...formData, visual_details: updatedDetails });
  };
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchingClient, setSearchingClient] = useState(false);
  const [searchingPatente, setSearchingPatente] = useState(false);

  const [isMarcaCustom, setIsMarcaCustom] = useState(false);
  const [isModeloCustom, setIsModeloCustom] = useState(false);
  const [isMarcaChasisCustom, setIsMarcaChasisCustom] = useState(false);
  const [isModeloChasisCustom, setIsModeloChasisCustom] = useState(false);

  const marcasCarroceria = [
    'Marcopolo', 'Inrecar', 'Maxibus/EMA-Maxibus', 'LR BUS', 'Metalpar',
    'ZhongTong', 'Neobus', 'Volare', 'Caio', 'Mascarello'
  ];

  const modelosCarroceria = {
    'Marcopolo': ['Senior 2000', 'Senior (Modelo 2006)', 'New Senior'],
    'Inrecar': ['Capricornio', 'Capricornio 2', 'Geminis', 'Geminis 2', 'Crucero'],
    'Maxibus/EMA-Maxibus': ['Astor', 'Lydo', 'New Astor'],
    'LR BUS': ["Nuevo Milenio '99", 'Nuevo Milenio 2002', 'Nuevo Milenio 2004', 'Modelo 2007', 'Modelo 2008 (XL)', 'Modelo 2013 (XL)'],
    'Metalpar': ['Pucara Evolution IV G1', 'Pucara Evolution IV G2', 'Ralun', 'Rayen', 'Maule (Youyi Bus)', 'Pukara by Sunlong', 'Maule (Sunlong)'],
    'ZhongTong': [],
    'Neobus': ['Thunder+ (Modelo 2002)', 'Thunder+ (Modelo 2006)', 'Thunder+ (Modelo 2016)'],
    'Volare': ['W8 (Modelo 2003)', 'W8 (Modelo 2007)', 'W9 (Modelo 2007)', 'W9 Fly', 'DW9 Fly', 'Volare V9L', 'Volare Attack 9 (Modelo 1)', 'Volare Attack 9 (Modelo 2)'],
    'Caio': ['Piccolo (Modelo 2003)', 'Foz (Modelo 2006)', 'Foz 2400 (Modelo 2014)', 'F2400 (Modelo 2018)', 'F2400 (Modelo 2022)'],
    'Mascarello': ['Gran Micro (2003)', 'Gran Micro (2010)', 'Gran Micro S3 (2013)', 'City S3 (2019)']
  };

  const marcasChasis = [
    'Mercedes-Benz', 'Volkswagen', 'Agrale', 'Scania', 'Volvo', 'Chevrolet', 'Ford'
  ];

  const modelosChasis = {
    'Mercedes-Benz': ['LO 812', 'LO 915', 'LO 916', 'OH 1115', 'OH 1420', 'O 500'],
    'Volkswagen': ['9.150 OD', '15.190 OD', '17.210 OD', '17.230 OD'],
    'Agrale': ['MT 12.0', 'MT 15.0', 'MT 17.0', 'MA 15.0'],
    'Scania': ['K 310', 'K 360', 'K 400', 'K 440'],
    'Volvo': ['B270F', 'B290R', 'B340M', 'B420R'],
    'Chevrolet': ['NPR', 'NQR'],
    'Ford': ['Cargo 815', 'Cargo 1519']
  };

  const validateRut = (rut) => {
    if (!/^[0-9]+-[0-9kK]{1}$/.test(rut)) return false;
    const [rutNum, dv] = rut.split('-');
    let M = 0, S = 1, T = parseInt(rutNum, 10);
    for (; T; T = Math.floor(T / 10)) {
      S = (S + T % 10 * (9 - M++ % 6)) % 11;
    }
    return (S ? S - 1 : 'k').toString() === dv.toLowerCase();
  };

  const handleRutBlur = async (e) => {
    let rut = e.target.value.trim();
    if (!rut) return;
    
    // Auto-formateo básico si no tiene guión
    if (!rut.includes('-') && rut.length > 1) {
      rut = rut.slice(0, -1) + '-' + rut.slice(-1);
      setFormData(prev => ({ ...prev, owner_rut: rut }));
    }

    if (!validateRut(rut)) {
      Swal.fire('Error', 'RUT inválido. El formato debe ser XXXXXXXX-X y ser un RUT chileno válido.', 'error');
      return;
    }

    setSearchingClient(true);
    try {
      const response = await fetch(`${API_URL}/api/clientes/${rut}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          owner_name: data.owner_name || prev.owner_name,
          owner_email: data.owner_email || prev.owner_email,
          owner_phone: data.owner_phone || prev.owner_phone
        }));
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setSearchingClient(false);
    }
  };

  const handlePatenteBlur = async (e) => {
    const patente = e.target.value.trim().toUpperCase();
    if (!patente) return;

    setSearchingPatente(true);
    try {
      const response = await fetch(`${API_URL}/api/vehiculos/${patente}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          ano_fabricacion: data.ano_fabricacion || prev.ano_fabricacion,
          marca_carroceria: data.marca_carroceria || prev.marca_carroceria,
          modelo_carroceria: data.modelo_carroceria || prev.modelo_carroceria,
          marca_chasis: data.marca_chasis || prev.marca_chasis,
          modelo_chasis: data.modelo_chasis || prev.modelo_chasis
        }));
        
        if (data.marca_carroceria) {
          setIsMarcaCustom(!marcasCarroceria.includes(data.marca_carroceria));
        }
        if (data.modelo_carroceria && data.marca_carroceria && modelosCarroceria[data.marca_carroceria]) {
          setIsModeloCustom(!modelosCarroceria[data.marca_carroceria].includes(data.modelo_carroceria));
        } else if (data.modelo_carroceria) {
          setIsModeloCustom(true);
        }

        if (data.marca_chasis) {
          setIsMarcaChasisCustom(!marcasChasis.includes(data.marca_chasis));
        }
        if (data.modelo_chasis && data.marca_chasis && modelosChasis[data.marca_chasis]) {
          setIsModeloChasisCustom(!modelosChasis[data.marca_chasis].includes(data.modelo_chasis));
        } else if (data.modelo_chasis) {
          setIsModeloChasisCustom(true);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
    } finally {
      setSearchingPatente(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    const patenteRegex = /^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/;
    if (!patenteRegex.test(formData.patente)) {
      Swal.fire('Error', 'La patente debe tener formato XXXX11 o XX1111', 'error');
      return;
    }

    if (!validateRut(formData.owner_rut)) {
      Swal.fire('Error', 'RUT del dueño inválido.', 'error');
      return;
    }

    if (formData.driver_rut && !validateRut(formData.driver_rut)) {
      Swal.fire('Error', 'RUT del chofer inválido.', 'error');
      return;
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0 = Enero, 8 = Septiembre
    const maxYear = currentMonth >= 8 ? currentYear + 1 : currentYear;
    
    if (parseInt(formData.ano_fabricacion) > maxYear) {
      Swal.fire('Error', `El año de fabricación no puede ser mayor a ${maxYear} (solo se permite el año siguiente a partir de septiembre)`, 'error');
      return;
    }

    setLoading(true);
    
    try {
      const dataToSubmit = { ...formData };
      dataToSubmit.reservation_date = `${formData.reservation_date}T${formData.reservation_time}`;
      delete dataToSubmit.reservation_time;

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/reserva-atencion`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(dataToSubmit)
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.status === 'in_process') {
          navigate('/recepcion');
        } else {
          setSuccess(true);
          setFormData({
            patente: '', marca_carroceria: '', modelo_carroceria: '', marca_chasis: '', modelo_chasis: '', ano_fabricacion: '',
            owner_rut: '', owner_name: '', owner_email: '', owner_phone: '',
            driver_rut: '', driver_name: '', driver_phone: '', reservation_date: '', reservation_time: ''
          });
        }
      } else {
        const errorData = await response.json();
        let errorMessage = 'Error: ' + (errorData.error || 'Ocurrió un problema al procesar la solicitud');
        
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage += '\n\nPor favor corrige lo siguiente:\n';
          errorData.details.forEach(detail => {
            errorMessage += `- ${detail.msg}\n`;
          });
        }
        
        Swal.fire('Error', errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error reserving hour:', error);
      Swal.fire('Error', 'Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'patente') {
      value = value.toUpperCase();
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleMarcaSelectChange = (e) => {
    const value = e.target.value;
    if (value === 'Otra') {
      setIsMarcaCustom(true);
      setIsModeloCustom(true); // If brand is custom, model must be custom
      setFormData({ ...formData, marca_carroceria: '', modelo_carroceria: '' });
    } else {
      setIsMarcaCustom(false);
      setIsModeloCustom(false);
      setFormData({ ...formData, marca_carroceria: value, modelo_carroceria: '' });
    }
  };

  const handleModeloSelectChange = (e) => {
    const value = e.target.value;
    if (value === 'Otro') {
      setIsModeloCustom(true);
      setFormData({ ...formData, modelo_carroceria: '' });
    } else {
      setIsModeloCustom(false);
      setFormData({ ...formData, modelo_carroceria: value });
    }
  };

  const handleMarcaChasisSelectChange = (e) => {
    const value = e.target.value;
    if (value === 'Otra') {
      setIsMarcaChasisCustom(true);
      setIsModeloChasisCustom(true); 
      setFormData({ ...formData, marca_chasis: '', modelo_chasis: '' });
    } else {
      setIsMarcaChasisCustom(false);
      setIsModeloChasisCustom(false);
      setFormData({ ...formData, marca_chasis: value, modelo_chasis: '' });
    }
  };

  const handleModeloChasisSelectChange = (e) => {
    const value = e.target.value;
    if (value === 'Otro') {
      setIsModeloChasisCustom(true);
      setFormData({ ...formData, modelo_chasis: '' });
    } else {
      setIsModeloChasisCustom(false);
      setFormData({ ...formData, modelo_chasis: value });
    }
  };

  if (success) {
    return (
      <div style={{ backgroundColor: '#111', backgroundImage: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.03), transparent 40%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.03), transparent 40%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', padding: '50px', borderRadius: '20px', border: '1px solid rgba(252, 227, 0, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ color: '#fce300', marginBottom: '20px', fontSize: '32px', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase' }}>¡Hora Reservada con Éxito!</h2>
          <p style={{ color: '#ccc', marginBottom: '30px', fontSize: '16px', lineHeight: '1.6' }}>Tu bus ha sido ingresado al sistema para la hora indicada. El administrador te confirmará la recepción.</p>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '15px 30px', background: 'linear-gradient(45deg, #fce300, #ffb300)', border: 'none', color: '#111', fontWeight: '900', fontSize: '16px', borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 5px 15px rgba(252, 227, 0, 0.3)' }}
          >
            IR AL INICIO
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

      <h1 style={{ color: '#fce300', marginBottom: '10px', fontSize: '48px', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase', textShadow: '2px 2px 10px rgba(252, 227, 0, 0.2)' }}>Arréglame la Máquina</h1>
      <p style={{ color: '#ccc', marginBottom: '40px', fontSize: '18px', letterSpacing: '1px' }}>Reserva tu hora de atención para evaluación mecánica</p>
      
      <div style={{ background: 'rgba(20, 20, 20, 0.7)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', padding: '50px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', width: '100%', maxWidth: '650px' }}>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '0', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>1. Datos del Dueño (Cliente)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>RUT del Dueño * {searchingClient && <span style={{ color: '#fce300', fontSize: '12px', marginLeft: '10px' }}>(Buscando...)</span>}</label>
              <input type="text" name="owner_rut" required value={formData.owner_rut} onChange={handleChange} onBlur={handleRutBlur} style={inputStyle} placeholder="Ej: 12345678-9 (Ingresar para autocompletar)" />
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

          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '40px', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>2. Datos del Bus y Reserva</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(252, 227, 0, 0.2)' }}>
              <label style={{ color: '#fce300', display: 'block', fontSize: '16px', marginBottom: '15px', fontWeight: '900', textTransform: 'uppercase', borderBottom: '1px solid rgba(252, 227, 0, 0.2)', paddingBottom: '10px' }}>Fecha y Hora de Reserva *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Fecha *</label>
                  <input type="date" name="reservation_date" required value={formData.reservation_date} onChange={handleChange} style={{...inputStyle, border: '1px solid rgba(252, 227, 0, 0.3)'}} />
                </div>
                <div>
                  <label style={labelStyle}>Hora *</label>
                  <input type="time" name="reservation_time" required value={formData.reservation_time} onChange={handleChange} style={{...inputStyle, border: '1px solid rgba(252, 227, 0, 0.3)'}} />
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Patente * {searchingPatente && <span style={{ color: '#fce300', fontSize: '12px', marginLeft: '10px' }}>(Buscando...)</span>}</label>
              <input type="text" name="patente" required value={formData.patente} onChange={handleChange} onBlur={handlePatenteBlur} style={inputStyle} placeholder="Ej: XX1111 (Ingresar para autocompletar)" />
            </div>
            <div>
              <label style={labelStyle}>Año *</label>
              <input type="number" name="ano_fabricacion" required value={formData.ano_fabricacion} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Marca Carrocería *</label>
              <select 
                value={isMarcaCustom ? 'Otra' : (formData.marca_carroceria || '')} 
                onChange={handleMarcaSelectChange} 
                style={inputStyle} 
                required={!isMarcaCustom}
              >
                <option value="" disabled>Seleccione una marca</option>
                {marcasCarroceria.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
                <option value="Otra">Otra (escribir nueva marca)</option>
              </select>
              {isMarcaCustom && (
                <input 
                  type="text" 
                  name="marca_carroceria" 
                  required 
                  value={formData.marca_carroceria} 
                  onChange={handleChange} 
                  style={{...inputStyle, marginTop: '10px'}} 
                  placeholder="Escriba la marca"
                />
              )}
            </div>
            <div>
              <label style={labelStyle}>Modelo Carrocería *</label>
              <select 
                value={isModeloCustom ? 'Otro' : (formData.modelo_carroceria || '')} 
                onChange={handleModeloSelectChange} 
                style={inputStyle} 
                required={!isModeloCustom}
                disabled={!formData.marca_carroceria && !isMarcaCustom}
              >
                <option value="" disabled>Seleccione un modelo</option>
                {(!isMarcaCustom && formData.marca_carroceria && modelosCarroceria[formData.marca_carroceria]) && 
                  modelosCarroceria[formData.marca_carroceria].map(modelo => (
                    <option key={modelo} value={modelo}>{modelo}</option>
                  ))
                }
                <option value="Otro">Otro (escribir nuevo modelo)</option>
              </select>
              {isModeloCustom && (
                <input 
                  type="text" 
                  name="modelo_carroceria" 
                  required 
                  value={formData.modelo_carroceria} 
                  onChange={handleChange} 
                  style={{...inputStyle, marginTop: '10px'}} 
                  placeholder="Escriba el modelo"
                />
              )}
            </div>
            <div>
              <label style={labelStyle}>Marca Chasis *</label>
              <select 
                value={isMarcaChasisCustom ? 'Otra' : (formData.marca_chasis || '')} 
                onChange={handleMarcaChasisSelectChange} 
                style={inputStyle} 
                required={!isMarcaChasisCustom}
              >
                <option value="" disabled>Seleccione una marca</option>
                {marcasChasis.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
                <option value="Otra">Otra (escribir nueva marca)</option>
              </select>
              {isMarcaChasisCustom && (
                <input 
                  type="text" 
                  name="marca_chasis" 
                  required 
                  value={formData.marca_chasis} 
                  onChange={handleChange} 
                  style={{...inputStyle, marginTop: '10px'}} 
                  placeholder="Escriba la marca de chasis"
                />
              )}
            </div>
            <div>
              <label style={labelStyle}>Modelo Chasis *</label>
              <select 
                value={isModeloChasisCustom ? 'Otro' : (formData.modelo_chasis || '')} 
                onChange={handleModeloChasisSelectChange} 
                style={inputStyle} 
                required={!isModeloChasisCustom}
                disabled={!formData.marca_chasis && !isMarcaChasisCustom}
              >
                <option value="" disabled>Seleccione un modelo</option>
                {(!isMarcaChasisCustom && formData.marca_chasis && modelosChasis[formData.marca_chasis]) && 
                  modelosChasis[formData.marca_chasis].map(modelo => (
                    <option key={modelo} value={modelo}>{modelo}</option>
                  ))
                }
                <option value="Otro">Otro (escribir nuevo modelo)</option>
              </select>
              {isModeloChasisCustom && (
                <input 
                  type="text" 
                  name="modelo_chasis" 
                  required 
                  value={formData.modelo_chasis} 
                  onChange={handleChange} 
                  style={{...inputStyle, marginTop: '10px'}} 
                  placeholder="Escriba el modelo del chasis"
                />
              )}
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

          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '40px', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>4. Detalles a Visualizar (Opcional)</h3>
          <div>
            <label style={labelStyle}>Agregar partes del vehículo, pintura u observaciones para el taller</label>
            <div className="add-detail-container">
              <input 
                type="text" 
                value={newDetail} 
                onChange={(e) => setNewDetail(e.target.value)} 
                style={inputStyle} 
                placeholder="Ej: Revisar pintura lado izquierdo"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDetail(e);
                  }
                }}
              />
              <button type="button" onClick={handleAddDetail} className="btn-add-detail">+ Añadir</button>
            </div>
            
            {formData.visual_details.length > 0 && (
              <div className="details-list">
                {formData.visual_details.map((detail, index) => (
                  <div key={index} className="detail-item">
                    <span>{detail}</span>
                    <button type="button" onClick={() => handleRemoveDetail(index)} className="btn-remove-detail">✕</button>
                  </div>
                ))}
              </div>
            )}
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
