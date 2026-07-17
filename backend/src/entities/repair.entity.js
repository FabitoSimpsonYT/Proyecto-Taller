const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Bus = require('./bus.entity');
const User = require('./user.entity');

const Repair = sequelize.define('Reparacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  bus_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Bus,
      key: 'id'
    }
  },
  mecanico_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'mecanico_id',
    references: {
      model: User,
      key: 'id'
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'descripcion'
  },
  repuestos_utilizados: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'repuestos_utilizados'
  },
  estado: {
    type: DataTypes.ENUM('en_proceso', 'completado'),
    defaultValue: 'en_proceso',
    field: 'estado'
  },
  fecha_reparacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_reparacion'
  },
}, {
  tableName: 'reparaciones',
  timestamps: false
});

module.exports = Repair;
