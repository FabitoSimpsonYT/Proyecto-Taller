const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bus = sequelize.define('Bus', {
  patente: { type: DataTypes.STRING, allowNull: false, field: 'patente' },
  marca_carroceria: { type: DataTypes.STRING, field: 'marca_carroceria' },
  modelo_carroceria: { type: DataTypes.STRING, field: 'modelo_carroceria' },
  marca_chasis: { type: DataTypes.STRING, field: 'marca_chasis' },
  modelo_chasis: { type: DataTypes.STRING, field: 'modelo_chasis' },
  ano_fabricacion: { type: DataTypes.INTEGER, field: 'ano_fabricacion' },
  
  detalles_visuales: { type: DataTypes.JSON, field: 'detalles_visuales' },
}, {
  tableName: 'buses',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = Bus;
