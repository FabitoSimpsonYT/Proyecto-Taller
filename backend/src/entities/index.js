const User = require('./User');
const Bus = require('./Bus');
const Inspection = require('./Inspection');

// Relaciones
Bus.hasMany(Inspection, { foreignKey: 'bus_id' });
Inspection.belongsTo(Bus, { foreignKey: 'bus_id' });

User.hasMany(Inspection, { foreignKey: 'inspector_id' });
Inspection.belongsTo(User, { as: 'Inspector', foreignKey: 'inspector_id' });

module.exports = {
  User,
  Bus,
  Inspection
};
