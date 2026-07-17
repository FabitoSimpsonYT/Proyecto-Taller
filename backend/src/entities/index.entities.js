const Usuario = require('./user.entity');
const Bus = require('./bus.entity');
const Inspeccion = require('./inspection.entity');
const Reparacion = require('./repair.entity');
const Persona = require('./persona.entity');
const Reservacion = require('./reservation.entity');
const sequelize = require('../config/database');

// Relaciones Personas y Buses
Persona.hasMany(Bus, { foreignKey: 'dueno_id' });
Bus.belongsTo(Persona, { as: 'Dueno', foreignKey: 'dueno_id' });

Persona.hasMany(Bus, { foreignKey: 'conductor_id' });
Bus.belongsTo(Persona, { as: 'Conductor', foreignKey: 'conductor_id' });

// Relaciones Buses y Reservaciones
Bus.hasMany(Reservacion, { foreignKey: 'bus_id' });
Reservacion.belongsTo(Bus, { foreignKey: 'bus_id' });

// Relaciones Inspecciones
Bus.hasMany(Inspeccion, { foreignKey: 'bus_id' });
Inspeccion.belongsTo(Bus, { foreignKey: 'bus_id' });

Usuario.hasMany(Inspeccion, { foreignKey: 'inspector_id' });
Inspeccion.belongsTo(Usuario, { as: 'Inspector', foreignKey: 'inspector_id' });

// Relaciones Reparaciones
Bus.hasMany(Reparacion, { foreignKey: 'bus_id' });
Reparacion.belongsTo(Bus, { foreignKey: 'bus_id' });

Usuario.hasMany(Reparacion, { foreignKey: 'mecanico_id' });
Reparacion.belongsTo(Usuario, { as: 'Mecanico', foreignKey: 'mecanico_id' });

module.exports = {
  sequelize,
  Usuario,
  Persona,
  Reservacion,
  Bus,
  Inspeccion,
  Reparacion
};
