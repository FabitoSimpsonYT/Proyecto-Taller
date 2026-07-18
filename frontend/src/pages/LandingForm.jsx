import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/api';
import Swal from 'sweetalert2';

function LandingForm() {
  const navigate = useNavigate();
  const [datosFormulario, setDatosFormulario] = useState({
    patente: '',
    marca_carroceria: '',
    modelo_carroceria: '',
    marca_chasis: '',
    modelo_chasis: '',
    ano_fabricacion: '',
    rut_dueno: '',
    nombre_dueno: '',
    correo_dueno: '',
    telefono_dueno: '',
    rut_conductor: '',
    nombre_conductor: '',
    telefono_conductor: '',
    fecha_reserva: '',
    hora_reserva: '',
    detalles_visuales: []
  });
  const [nuevoDetalle, setNuevoDetalle] = useState('');

  const manejarAgregarDetalle = (e) => {
    e.preventDefault();
    if (nuevoDetalle.trim() !== '') {
      setDatosFormulario({ ...datosFormulario, detalles_visuales: [...datosFormulario.detalles_visuales, nuevoDetalle.trim()] });
      setNuevoDetalle('');
    }
  };

  const manejarEliminarDetalle = (index) => {
    const detallesActualizados = [...datosFormulario.detalles_visuales];
    detallesActualizados.splice(index, 1);
    setDatosFormulario({ ...datosFormulario, detalles_visuales: detallesActualizados });
  };
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [buscandoPatente, setBuscandoPatente] = useState(false);

  const [esMarcaCustom, setEsMarcaCustom] = useState(false);
  const [esModeloCustom, setEsModeloCustom] = useState(false);
  const [esMarcaChasisCustom, setEsMarcaChasisCustom] = useState(false);
  const [esModeloChasisCustom, setEsModeloChasisCustom] = useState(false);

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

  const validarRut = (rut) => {
    if (!/^[0-9]+-[0-9kK]{1}$/.test(rut)) return false;
    const [rutNum, dv] = rut.split('-');
    let M = 0, S = 1, T = parseInt(rutNum, 10);
    for (; T; T = Math.floor(T / 10)) {
      S = (S + T % 10 * (9 - M++ % 6)) % 11;
    }
    return (S ? S - 1 : 'k').toString() === dv.toLowerCase();
  };

  const manejarBlurRut = async (e) => {
    let rut = e.target.value.trim();
    if (!rut) return;
    
    // Auto-formateo básico si no tiene guión
    if (!rut.includes('-') && rut.length > 1) {
      rut = rut.slice(0, -1) + '-' + rut.slice(-1);
      setDatosFormulario(prev => ({ ...prev, rut_dueno: rut }));
    }

    if (!validarRut(rut)) {
      Swal.fire('Error', 'RUT inválido. El formato debe ser XXXXXXXX-X y ser un RUT chileno válido.', 'error');
      return;
    }

    setBuscandoCliente(true);
    try {
      const response = await fetch(`${API_URL}/api/clientes/${rut}`);
      if (response.ok) {
        const data = await response.json();
        setDatosFormulario(prev => ({
          ...prev,
          nombre_dueno: data.nombre_completo || prev.nombre_dueno,
          correo_dueno: data.correo || prev.correo_dueno,
          telefono_dueno: data.telefono || prev.telefono_dueno
        }));
      }
    } catch (error) {
      console.error('Error al buscar datos del cliente:', error);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const manejarBlurPatente = async (e) => {
    const patente = e.target.value.trim().toUpperCase();
    if (!patente) return;

    setBuscandoPatente(true);
    try {
      const response = await fetch(`${API_URL}/api/vehiculos/${patente}`);
      if (response.ok) {
        const data = await response.json();
        setDatosFormulario(prev => ({
          ...prev,
          ano_fabricacion: data.ano_fabricacion || prev.ano_fabricacion,
          marca_carroceria: data.marca_carroceria || prev.marca_carroceria,
          modelo_carroceria: data.modelo_carroceria || prev.modelo_carroceria,
          marca_chasis: data.marca_chasis || prev.marca_chasis,
          modelo_chasis: data.modelo_chasis || prev.modelo_chasis
        }));
        
        if (data.marca_carroceria) {
          setEsMarcaCustom(!marcasCarroceria.includes(data.marca_carroceria));
        }
        if (data.modelo_carroceria && data.marca_carroceria && modelosCarroceria[data.marca_carroceria]) {
          setEsModeloCustom(!modelosCarroceria[data.marca_carroceria].includes(data.modelo_carroceria));
        } else if (data.modelo_carroceria) {
          setEsModeloCustom(true);
        }

        if (data.marca_chasis) {
          setEsMarcaChasisCustom(!marcasChasis.includes(data.marca_chasis));
        }
        if (data.modelo_chasis && data.marca_chasis && modelosChasis[data.marca_chasis]) {
          setEsModeloChasisCustom(!modelosChasis[data.marca_chasis].includes(data.modelo_chasis));
        } else if (data.modelo_chasis) {
          setEsModeloChasisCustom(true);
        }
      }
    } catch (error) {
      console.error('Error al buscar datos del vehículo:', error);
    } finally {
      setBuscandoPatente(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    // Validaciones
    const patenteRegex = /^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/;
    if (!patenteRegex.test(datosFormulario.patente)) {
      Swal.fire('Error', 'La patente debe tener formato XXXX11 o XX1111', 'error');
      return;
    }

    if (!validarRut(datosFormulario.rut_dueno)) {
      Swal.fire('Error', 'RUT del dueño inválido.', 'error');
      return;
    }

    if (datosFormulario.rut_conductor && !validarRut(datosFormulario.rut_conductor)) {
      Swal.fire('Error', 'RUT del chofer inválido.', 'error');
      return;
    }
    
    const anioActual = new Date().getFullYear();
    const mesActual = new Date().getMonth(); // 0 = Enero, 8 = Septiembre
    const anioMaximo = mesActual >= 8 ? anioActual + 1 : anioActual;
    
    if (parseInt(datosFormulario.ano_fabricacion) > anioMaximo) {
      Swal.fire('Error', `El año de fabricación no puede ser mayor a ${anioMaximo} (solo se permite el año siguiente a partir de septiembre)`, 'error');
      return;
    }

    setCargando(true);
    
    try {
      const datosAEnviar = { ...datosFormulario };
      datosAEnviar.fecha_reserva = `${datosFormulario.fecha_reserva}T${datosFormulario.hora_reserva}`;
      delete datosAEnviar.hora_reserva;

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/reserva-atencion`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(datosAEnviar)
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.estado === 'en_proceso') {
          navigate('/recepcion');
        } else {
          setExito(true);
          setDatosFormulario({
            patente: '', marca_carroceria: '', modelo_carroceria: '', marca_chasis: '', modelo_chasis: '', ano_fabricacion: '',
            rut_dueno: '', nombre_dueno: '', correo_dueno: '', telefono_dueno: '',
            rut_conductor: '', nombre_conductor: '', telefono_conductor: '', fecha_reserva: '', hora_reserva: ''
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
      console.error('Error al reservar hora:', error);
      Swal.fire('Error', 'Error al conectar con el servidor', 'error');
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    let valor = e.target.value;
    if (e.target.name === 'patente') {
      valor = valor.toUpperCase();
    }
    setDatosFormulario({ ...datosFormulario, [e.target.name]: valor });
  };

  const manejarCambioMarca = (e) => {
    const valor = e.target.value;
    if (valor === 'Otra') {
      setEsMarcaCustom(true);
      setEsModeloCustom(true); // If brand is custom, model must be custom
      setDatosFormulario({ ...datosFormulario, marca_carroceria: '', modelo_carroceria: '' });
    } else {
      setEsMarcaCustom(false);
      setEsModeloCustom(false);
      setDatosFormulario({ ...datosFormulario, marca_carroceria: valor, modelo_carroceria: '' });
    }
  };

  const manejarCambioModelo = (e) => {
    const valor = e.target.value;
    if (valor === 'Otro') {
      setEsModeloCustom(true);
      setDatosFormulario({ ...datosFormulario, modelo_carroceria: '' });
    } else {
      setEsModeloCustom(false);
      setDatosFormulario({ ...datosFormulario, modelo_carroceria: valor });
    }
  };

  const manejarCambioMarcaChasis = (e) => {
    const valor = e.target.value;
    if (valor === 'Otra') {
      setEsMarcaChasisCustom(true);
      setEsModeloChasisCustom(true); 
      setDatosFormulario({ ...datosFormulario, marca_chasis: '', modelo_chasis: '' });
    } else {
      setEsMarcaChasisCustom(false);
      setEsModeloChasisCustom(false);
      setDatosFormulario({ ...datosFormulario, marca_chasis: valor, modelo_chasis: '' });
    }
  };

  const manejarCambioModeloChasis = (e) => {
    const valor = e.target.value;
    if (valor === 'Otro') {
      setEsModeloChasisCustom(true);
      setDatosFormulario({ ...datosFormulario, modelo_chasis: '' });
    } else {
      setEsModeloChasisCustom(false);
      setDatosFormulario({ ...datosFormulario, modelo_chasis: valor });
    }
  };

  if (exito) {
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

  const estiloInput = {
    width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white', fontSize: '15px', boxSizing: 'border-box',
    transition: 'border-color 0.3s, box-shadow 0.3s'
  };
  
  const estiloLabel = { color: '#aaa', display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' };

  return (
    <div style={{ backgroundColor: '#111', backgroundImage: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.03), transparent 40%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.03), transparent 40%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px', paddingBottom: '50px' }}>
      <div style={{ position: 'absolute', top: 30, right: 30 }}>
        <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#fce300'; e.currentTarget.style.color = '#fce300'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#ccc'; }}>Acceso Admin</button>
      </div>

      <h1 style={{ color: '#fce300', marginBottom: '10px', fontSize: '48px', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase', textShadow: '2px 2px 10px rgba(252, 227, 0, 0.2)' }}>Arréglame la Máquina</h1>
      <p style={{ color: '#ccc', marginBottom: '40px', fontSize: '18px', letterSpacing: '1px' }}>Reserva tu hora de atención para evaluación mecánica</p>
      
      <div style={{ background: 'rgba(20, 20, 20, 0.7)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', padding: '50px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', width: '100%', maxWidth: '650px' }}>
        
        <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '0', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>1. Datos del Dueño (Cliente)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={estiloLabel}>RUT del Dueño * {buscandoCliente && <span style={{ color: '#fce300', fontSize: '12px', marginLeft: '10px' }}>(Buscando...)</span>}</label>
              <input type="text" name="rut_dueno" required value={datosFormulario.rut_dueno} onChange={manejarCambio} onBlur={manejarBlurRut} style={estiloInput} placeholder="Ej: 12345678-9 (Ingresar para autocompletar)" />
            </div>
            <div>
              <label style={estiloLabel}>Nombre Completo *</label>
              <input type="text" name="nombre_dueno" required value={datosFormulario.nombre_dueno} onChange={manejarCambio} style={estiloInput} />
            </div>
            <div>
              <label style={estiloLabel}>Email *</label>
              <input type="email" name="correo_dueno" required value={datosFormulario.correo_dueno} onChange={manejarCambio} style={estiloInput} />
            </div>
            <div>
              <label style={estiloLabel}>Teléfono *</label>
              <input type="text" name="telefono_dueno" required value={datosFormulario.telefono_dueno} onChange={manejarCambio} style={estiloInput} />
            </div>
          </div>

          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '40px', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>2. Datos del Bus y Reserva</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(252, 227, 0, 0.2)' }}>
              <label style={{ color: '#fce300', display: 'block', fontSize: '16px', marginBottom: '15px', fontWeight: '900', textTransform: 'uppercase', borderBottom: '1px solid rgba(252, 227, 0, 0.2)', paddingBottom: '10px' }}>Fecha y Hora de Reserva *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={estiloLabel}>Fecha *</label>
                  <input type="date" name="fecha_reserva" required value={datosFormulario.fecha_reserva} onChange={manejarCambio} style={{...estiloInput, border: '1px solid rgba(252, 227, 0, 0.3)'}} />
                </div>
                <div>
                  <label style={estiloLabel}>Hora *</label>
                  <input type="time" name="hora_reserva" required value={datosFormulario.hora_reserva} onChange={manejarCambio} style={{...estiloInput, border: '1px solid rgba(252, 227, 0, 0.3)'}} />
                </div>
              </div>
            </div>
            <div>
              <label style={estiloLabel}>Patente * {buscandoPatente && <span style={{ color: '#fce300', fontSize: '12px', marginLeft: '10px' }}>(Buscando...)</span>}</label>
              <input type="text" name="patente" required value={datosFormulario.patente} onChange={manejarCambio} onBlur={manejarBlurPatente} style={estiloInput} placeholder="Ej: XX1111 (Ingresar para autocompletar)" />
            </div>
            <div>
              <label style={estiloLabel}>Año *</label>
              <input type="number" name="ano_fabricacion" required value={datosFormulario.ano_fabricacion} onChange={manejarCambio} style={estiloInput} />
            </div>
            <div>
              <label style={estiloLabel}>Marca Carrocería *</label>
              <select 
                value={esMarcaCustom ? 'Otra' : (datosFormulario.marca_carroceria || '')} 
                onChange={manejarCambioMarca} 
                style={estiloInput} 
                required={!esMarcaCustom}
              >
                <option value="" disabled>Seleccione una marca</option>
                {marcasCarroceria.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
                <option value="Otra">Otra (escribir nueva marca)</option>
              </select>
              {esMarcaCustom && (
                <input 
                  type="text" 
                  name="marca_carroceria" 
                  required 
                  value={datosFormulario.marca_carroceria} 
                  onChange={manejarCambio} 
                  style={{...estiloInput, marginTop: '10px'}} 
                  placeholder="Escriba la marca"
                />
              )}
            </div>
            <div>
              <label style={estiloLabel}>Modelo Carrocería *</label>
              <select 
                value={esModeloCustom ? 'Otro' : (datosFormulario.modelo_carroceria || '')} 
                onChange={manejarCambioModelo} 
                style={estiloInput} 
                required={!esModeloCustom}
                disabled={!datosFormulario.marca_carroceria && !esMarcaCustom}
              >
                <option value="" disabled>Seleccione un modelo</option>
                {(!esMarcaCustom && datosFormulario.marca_carroceria && modelosCarroceria[datosFormulario.marca_carroceria]) && 
                  modelosCarroceria[datosFormulario.marca_carroceria].map(modelo => (
                    <option key={modelo} value={modelo}>{modelo}</option>
                  ))
                }
                <option value="Otro">Otro (escribir nuevo modelo)</option>
              </select>
              {esModeloCustom && (
                <input 
                  type="text" 
                  name="modelo_carroceria" 
                  required 
                  value={datosFormulario.modelo_carroceria} 
                  onChange={manejarCambio} 
                  style={{...estiloInput, marginTop: '10px'}} 
                  placeholder="Escriba el modelo"
                />
              )}
            </div>
            <div>
              <label style={estiloLabel}>Marca Chasis *</label>
              <select 
                value={esMarcaChasisCustom ? 'Otra' : (datosFormulario.marca_chasis || '')} 
                onChange={manejarCambioMarcaChasis} 
                style={estiloInput} 
                required={!esMarcaChasisCustom}
              >
                <option value="" disabled>Seleccione una marca</option>
                {marcasChasis.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
                <option value="Otra">Otra (escribir nueva marca)</option>
              </select>
              {esMarcaChasisCustom && (
                <input 
                  type="text" 
                  name="marca_chasis" 
                  required 
                  value={datosFormulario.marca_chasis} 
                  onChange={manejarCambio} 
                  style={{...estiloInput, marginTop: '10px'}} 
                  placeholder="Escriba la marca de chasis"
                />
              )}
            </div>
            <div>
              <label style={estiloLabel}>Modelo Chasis *</label>
              <select 
                value={esModeloChasisCustom ? 'Otro' : (datosFormulario.modelo_chasis || '')} 
                onChange={manejarCambioModeloChasis} 
                style={estiloInput} 
                required={!esModeloChasisCustom}
                disabled={!datosFormulario.marca_chasis && !esMarcaChasisCustom}
              >
                <option value="" disabled>Seleccione un modelo</option>
                {(!esMarcaChasisCustom && datosFormulario.marca_chasis && modelosChasis[datosFormulario.marca_chasis]) && 
                  modelosChasis[datosFormulario.marca_chasis].map(modelo => (
                    <option key={modelo} value={modelo}>{modelo}</option>
                  ))
                }
                <option value="Otro">Otro (escribir nuevo modelo)</option>
              </select>
              {esModeloChasisCustom && (
                <input 
                  type="text" 
                  name="modelo_chasis" 
                  required 
                  value={datosFormulario.modelo_chasis} 
                  onChange={manejarCambio} 
                  style={{...estiloInput, marginTop: '10px'}} 
                  placeholder="Escriba el modelo del chasis"
                />
              )}
            </div>
          </div>

          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '40px', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>3. Datos del Chofer (Opcional)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={estiloLabel}>RUT</label>
              <input type="text" name="rut_conductor" value={datosFormulario.rut_conductor} onChange={manejarCambio} style={estiloInput} />
            </div>
            <div>
              <label style={estiloLabel}>Nombre Completo</label>
              <input type="text" name="nombre_conductor" value={datosFormulario.nombre_conductor} onChange={manejarCambio} style={estiloInput} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={estiloLabel}>Teléfono</label>
              <input type="text" name="telefono_conductor" value={datosFormulario.telefono_conductor} onChange={manejarCambio} style={estiloInput} />
            </div>
          </div>

          <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', marginTop: '40px', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>4. Detalles a Visualizar (Opcional)</h3>
          <div>
            <label style={estiloLabel}>Agregar partes del vehículo, pintura u observaciones para el taller</label>
            <div className="add-detail-container">
              <input 
                type="text" 
                value={nuevoDetalle} 
                onChange={(e) => setNuevoDetalle(e.target.value)} 
                style={estiloInput} 
                placeholder="Ej: Revisar pintura lado izquierdo"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    manejarAgregarDetalle(e);
                  }
                }}
              />
              <button type="button" onClick={manejarAgregarDetalle} className="btn-add-detail">+ Añadir</button>
            </div>
            
            {datosFormulario.detalles_visuales.length > 0 && (
              <div className="details-list">
                {datosFormulario.detalles_visuales.map((detalle, index) => (
                  <div key={index} className="detail-item">
                    <span>{detalle}</span>
                    <button type="button" onClick={() => manejarEliminarDetalle(index)} className="btn-remove-detail">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={cargando} style={{ width: '100%', marginTop: '40px', padding: '18px', background: 'linear-gradient(45deg, #fce300, #ffb300)', border: 'none', color: '#111', fontWeight: '900', fontSize: '18px', letterSpacing: '1px', textTransform: 'uppercase', borderRadius: '10px', cursor: cargando ? 'not-allowed' : 'pointer', boxShadow: '0 8px 20px rgba(252, 227, 0, 0.4)', transition: 'transform 0.2s' }}>
            {cargando ? 'Procesando...' : 'Confirmar Reserva de Hora'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LandingForm;
