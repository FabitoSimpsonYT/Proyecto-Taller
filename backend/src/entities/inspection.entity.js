const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Inspection = sequelize.define('Inspeccion', {
  bus_id: { type: DataTypes.INTEGER, allowNull: false, field: 'bus_id' },
  inspector_id: { type: DataTypes.INTEGER, allowNull: false, field: 'inspector_id' },
  items: { type: DataTypes.JSON, allowNull: false, field: 'items' },
  notas_examen: { type: DataTypes.TEXT, field: 'notas_examen' },
  fecha_inspeccion: { type: DataTypes.DATE, defaultValue: Sequelize.NOW, field: 'fecha_inspeccion' }
}, {
  tableName: 'inspecciones',
  timestamps: false
});

module.exports = Inspection;
