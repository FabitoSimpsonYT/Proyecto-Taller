const User = require('./user.entity');
const Bus = require('./bus.entity');
const Inspection = require('./inspection.entity');
const Repair = require('./repair.entity');
const sequelize = require('../config/database');

// Relaciones Inspecciones
Bus.hasMany(Inspection, { foreignKey: 'bus_id' });
Inspection.belongsTo(Bus, { foreignKey: 'bus_id' });

User.hasMany(Inspection, { foreignKey: 'inspector_id' });
Inspection.belongsTo(User, { as: 'Inspector', foreignKey: 'inspector_id' });

// Relaciones Reparaciones
Bus.hasMany(Repair, { foreignKey: 'bus_id' });
Repair.belongsTo(Bus, { foreignKey: 'bus_id' });

User.hasMany(Repair, { foreignKey: 'mechanic_id' });
Repair.belongsTo(User, { as: 'Mechanic', foreignKey: 'mechanic_id' });

module.exports = {
  sequelize,
  User,
  Bus,
  Inspection,
  Repair
};
