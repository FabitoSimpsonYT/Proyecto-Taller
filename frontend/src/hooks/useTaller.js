import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const useTaller = () => {
  const { user: userProfile, logout } = useContext(AuthContext);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);
  const [busHistory, setBusHistory] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: null });
  
  const [repairData, setRepairData] = useState({
    bus_id: '',
    description: '',
    repuestos_utilizados: [{ repuesto: '', cantidad: 1, costo: 0 }],
    status: 'in_progress'
  });
  
  const [initialDiagnosis, setInitialDiagnosis] = useState(null);

  useEffect(() => {
    fetchBuses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/buses');
      setBuses(response.data.filter(b => ['approved', 'rejected'].includes(b.status) || b.status === 'in_process'));
    } catch (error) {
      console.error('Error fetching buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusHistory = async (busId) => {
    try {
      const response = await api.get(`/admin/repairs/${busId}`);
      setBusHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
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
    setBusHistory([]);
    fetchBusHistory(bus.id);
    
    try {
      const res = await api.get(`/admin/inspections/${bus.id}`);
      const data = res.data;
        
      if (typeof data.items === 'string') {
        try { data.items = JSON.parse(data.items); } catch(e){}
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
      
      if (initialRepuestos.length === 0) {
        initialRepuestos.push({ pieza_danada: 'Adicional', repuesto: '', cantidad: 1, costo: 0 });
      }
      
      setRepairData(prev => ({
        ...prev,
        repuestos_utilizados: initialRepuestos
      }));
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
    if (e) e.preventDefault();
    if (!repairData.bus_id) return;

    setSubmitStatus({ loading: true, error: null, success: null });
    
    try {
      await api.post('/admin/repairs', {
        ...repairData,
        repuestos_utilizados: repairData.repuestos_utilizados.map(r => ({
          repuesto: r.pieza_danada && r.pieza_danada !== 'Adicional' ? `[Para ${r.pieza_danada}] ${r.repuesto}` : r.repuesto,
          cantidad: r.cantidad,
          costo: r.costo
        })),
        status: finalStatus
      });

      setSubmitStatus({ loading: false, error: null, success: 'Reparación guardada exitosamente.' });
      setTimeout(() => {
        setSelectedBus(null);
        fetchBuses();
      }, 2000);
    } catch (error) {
      console.error('Error submitting repair:', error);
      const errorMsg = error.response?.data?.error || 'Error de conexión con el servidor.';
      setSubmitStatus({ loading: false, error: errorMsg, success: null });
    }
  };

  const handleExitWithoutRepairs = async () => {
    if (!repairData.bus_id) return;
    
    if (!window.confirm('¿Estás seguro de autorizar la salida sin registrar ninguna reparación?')) {
      return;
    }

    setSubmitStatus({ loading: true, error: null, success: null });
    
    try {
      await api.post('/admin/repairs', {
        bus_id: repairData.bus_id,
        description: 'Salida autorizada sin reparaciones.',
        repuestos_utilizados: [],
        status: 'completed'
      });

      setSubmitStatus({ loading: false, error: null, success: 'Salida autorizada exitosamente.' });
      setTimeout(() => {
        setSelectedBus(null);
        fetchBuses();
      }, 2000);
    } catch (error) {
      console.error('Error exiting without repairs:', error);
      const errorMsg = error.response?.data?.error || 'Error de conexión con el servidor.';
      setSubmitStatus({ loading: false, error: errorMsg, success: null });
    }
  };

  return {
    userProfile,
    logout,
    buses,
    loading,
    selectedBus,
    setSelectedBus,
    submitStatus,
    repairData,
    setRepairData,
    initialDiagnosis,
    busHistory,
    fetchBusHistory,
    handleSelectBus,
    handleAddRepuesto,
    handleRepuestoChange,
    handleRemoveRepuesto,
    handleSubmitRepair,
    handleExitWithoutRepairs
  };
};
