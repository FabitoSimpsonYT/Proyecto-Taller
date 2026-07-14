const { Bus, Inspection } = require('../entities');

const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener buses', details: error.message });
  }
};

const getPendingInspections = async (req, res) => {
  try {
    const pendingBuses = await Bus.findAll({
      where: { 
        status: ['pending', 'in_process']
      },
      order: [['created_at', 'DESC']]
    });
    res.json(pendingBuses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener buses pendientes', details: error.message });
  }
};

const confirmAttendanceAdmin = async (req, res) => {
  try {
    const { bus_id } = req.body;
    const bus = await Bus.findByPk(bus_id);
    
    if (!bus) return res.status(404).json({ error: 'Bus no encontrado' });

    bus.status = 'in_process';
    await bus.save();

    res.json({ message: 'Asistencia confirmada para el bus ' + bus.patente });
  } catch (error) {
    res.status(500).json({ error: 'Error al confirmar asistencia', details: error.message });
  }
};

const submitWorklist = async (req, res) => {
  try {
    const { bus_id, items, partes_3d_danadas, exams_notes } = req.body;

    if (!bus_id || !items) {
      return res.status(400).json({ error: 'Bus ID e Items son obligatorios' });
    }

    const newInspection = await Inspection.create({
      bus_id,
      inspector_id: req.user.id,
      items,
      partes_3d_danadas,
      exams_notes
    });

    const hasFailedItems = items.some(item => item.status === 'fail');
    
    await Bus.update(
      { status: hasFailedItems ? 'rejected' : 'approved' },
      { where: { id: bus_id } }
    );

    res.status(201).json({ message: 'Inspección registrada con éxito', inspection: newInspection });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar inspección', details: error.message });
  }
};

const submitRepair = async (req, res) => {
  try {
    const { bus_id, description, repuestos_utilizados, status } = req.body;
    
    // Asumiendo que usaremos Sequelize directamente o raw query si no hay entity para Repair aún.
    // Como creamos la tabla manual en SQL, usemos el model si existe, o query directo.
    // Necesitamos que 'Repair' entity exista. Lo crearé o usaré sequelize.query
    const { sequelize } = require('../entities');
    await sequelize.query(
      `INSERT INTO repairs (bus_id, mechanic_id, description, repuestos_utilizados, status) VALUES (?, ?, ?, ?, ?)`,
      { replacements: [bus_id, req.user.id, description, JSON.stringify(repuestos_utilizados || []), status || 'in_progress'] }
    );
    
    // Marcar bus status a 'in_process' o 'approved' (listo)
    if (status === 'completed') {
      await Bus.update({ status: 'approved' }, { where: { id: bus_id } });
    } else {
      await Bus.update({ status: 'in_process' }, { where: { id: bus_id } });
    }

    res.status(201).json({ message: 'Reparación actualizada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar reparación', details: error.message });
  }
};

const getRepairsByBusId = async (req, res) => {
  try {
    const { bus_id } = req.params;
    const { sequelize } = require('../entities');
    const [results] = await sequelize.query(
      `SELECT * FROM repairs WHERE bus_id = ? ORDER BY repair_date DESC`,
      { replacements: [bus_id] }
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reparaciones', details: error.message });
  }
};

const getInspectionByBusId = async (req, res) => {
  try {
    const { bus_id } = req.params;
    const inspection = await Inspection.findOne({ where: { bus_id }, order: [['inspection_date', 'DESC']] });
    res.json(inspection || {});
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener inspección', details: error.message });
  }
};

module.exports = {
  getAllBuses,
  getPendingInspections,
  confirmAttendanceAdmin,
  submitWorklist,
  submitRepair,
  getRepairsByBusId,
  getInspectionByBusId
};
