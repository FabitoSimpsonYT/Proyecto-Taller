const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const Inspection = sequelize.define('Inspection', {
  bus_id: { type: DataTypes.INTEGER, allowNull: false },
  inspector_id: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false },
  exams_notes: { type: DataTypes.TEXT },
  inspection_date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
  tableName: 'inspections',
  timestamps: false
});

module.exports = Inspection;
