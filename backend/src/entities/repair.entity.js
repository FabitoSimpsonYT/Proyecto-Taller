const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Bus = require('./bus.entity');
const User = require('./user.entity');

const Repair = sequelize.define('Repair', {
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
  mechanic_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  repuestos_utilizados: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed'),
    defaultValue: 'in_progress',
  },
  repair_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'repairs',
  timestamps: false
});

module.exports = Repair;
