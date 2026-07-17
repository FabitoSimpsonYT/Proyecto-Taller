import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const useTaller = () => {
  const { usuario: perfilUsuario, cerrarSesion } = useContext(AuthContext);
  const [buses, setBuses] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busSeleccionado, setBusSeleccionado] = useState(null);
  const [historialBus, setHistorialBus] = useState([]);
  const [estadoEnvio, setEstadoEnvio] = useState({ cargando: false, error: null, exito: null });
  
  const [datosReparacion, setDatosReparacion] = useState({
    bus_id: '',
    descripcion: '',
    repuestos_utilizados: [{ repuesto: '', cantidad: 1, costo: 0 }],
    estado: 'en_proceso'
  });
  
  const [diagnosticoInicial, setDiagnosticoInicial] = useState(null);

  useEffect(() => {
    obtenerBuses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerBuses = async () => {
    setCargando(true);
    try {
      const response = await api.get('/admin/buses');
      setBuses(response.data.filter(b => ['aprobado', 'rechazado'].includes(b.estado) || b.estado === 'en_proceso'));
    } catch (error) {
      console.error('Error al obtener buses:', error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerHistorialBus = async (busId) => {
    try {
      const response = await api.get(`/admin/reparaciones/${busId}`);
      setHistorialBus(response.data);
    } catch (error) {
      console.error('Error al obtener historial:', error);
    }
  };

  const manejarSeleccionBus = async (bus) => {
    setBusSeleccionado(bus);
    setEstadoEnvio({ cargando: false, error: null, exito: null });
    setDatosReparacion({
      bus_id: bus.id,
      descripcion: '',
      repuestos_utilizados: [{ repuesto: '', cantidad: 1, costo: 0 }],
      estado: 'en_proceso'
    });
    setDiagnosticoInicial(null);
    setHistorialBus([]);
    obtenerHistorialBus(bus.id);
    
    try {
      const res = await api.get(`/admin/inspecciones/${bus.id}`);
      const data = res.data;
        
      if (typeof data.items === 'string') {
        try { data.items = JSON.parse(data.items); } catch(e){}
      }

      setDiagnosticoInicial(data);
      
      let repuestosIniciales = [];
      
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach(it => {
          if (it.estado === 'rechazado') {
            repuestosIniciales.push({ pieza_danada: it.nombre_item, repuesto: '', cantidad: 1, costo: 0 });
          }
        });
      }
      
      if (repuestosIniciales.length === 0) {
        repuestosIniciales.push({ pieza_danada: 'Adicional', repuesto: '', cantidad: 1, costo: 0 });
      }
      
      setDatosReparacion(prev => ({
        ...prev,
        repuestos_utilizados: repuestosIniciales
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const manejarAgregarRepuesto = () => {
    setDatosReparacion({
      ...datosReparacion,
      repuestos_utilizados: [...datosReparacion.repuestos_utilizados, { pieza_danada: 'Adicional', repuesto: '', cantidad: 1, costo: 0 }]
    });
  };

  const manejarCambioRepuesto = (index, field, value) => {
    const nuevosRepuestos = [...datosReparacion.repuestos_utilizados];
    nuevosRepuestos[index][field] = value;
    setDatosReparacion({ ...datosReparacion, repuestos_utilizados: nuevosRepuestos });
  };

  const manejarEliminarRepuesto = (index) => {
    const nuevosRepuestos = datosReparacion.repuestos_utilizados.filter((_, i) => i !== index);
    setDatosReparacion({ ...datosReparacion, repuestos_utilizados: nuevosRepuestos });
  };

  const manejarEnvioReparacion = async (e, estadoFinal = 'en_proceso') => {
    if (e) e.preventDefault();
    if (!datosReparacion.bus_id) return;

    setEstadoEnvio({ cargando: true, error: null, exito: null });
    
    try {
      await api.post('/admin/reparaciones', {
        ...datosReparacion,
        repuestos_utilizados: datosReparacion.repuestos_utilizados.map(r => ({
          repuesto: r.pieza_danada && r.pieza_danada !== 'Adicional' ? `[Para ${r.pieza_danada}] ${r.repuesto}` : r.repuesto,
          cantidad: r.cantidad,
          costo: r.costo
        })),
        estado: estadoFinal
      });

      setEstadoEnvio({ cargando: false, error: null, exito: 'Reparación guardada exitosamente.' });
      setTimeout(() => {
        setBusSeleccionado(null);
        obtenerBuses();
      }, 2000);
    } catch (error) {
      console.error('Error al enviar reparación:', error);
      const errorMsg = error.response?.data?.error || 'Error de conexión con el servidor.';
      setEstadoEnvio({ cargando: false, error: errorMsg, exito: null });
    }
  };

  const manejarSalidaSinReparacion = async () => {
    if (!datosReparacion.bus_id) return;
    
    if (!window.confirm('¿Estás seguro de autorizar la salida sin registrar ninguna reparación?')) {
      return;
    }

    setEstadoEnvio({ cargando: true, error: null, exito: null });
    
    try {
      await api.post('/admin/reparaciones', {
        bus_id: datosReparacion.bus_id,
        descripcion: 'Salida autorizada sin reparaciones.',
        repuestos_utilizados: [],
        estado: 'completado'
      });

      setEstadoEnvio({ cargando: false, error: null, exito: 'Salida autorizada exitosamente.' });
      setTimeout(() => {
        setBusSeleccionado(null);
        obtenerBuses();
      }, 2000);
    } catch (error) {
      console.error('Error al salir sin reparaciones:', error);
      const errorMsg = error.response?.data?.error || 'Error de conexión con el servidor.';
      setEstadoEnvio({ cargando: false, error: errorMsg, exito: null });
    }
  };

  return {
    perfilUsuario,
    cerrarSesion,
    buses,
    cargando,
    busSeleccionado,
    setBusSeleccionado,
    estadoEnvio,
    datosReparacion,
    setDatosReparacion,
    diagnosticoInicial,
    historialBus,
    obtenerHistorialBus,
    manejarSeleccionBus,
    manejarAgregarRepuesto,
    manejarCambioRepuesto,
    manejarEliminarRepuesto,
    manejarEnvioReparacion,
    manejarSalidaSinReparacion
  };
};
