const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bus = sequelize.define('Bus', {
  patente: { type: DataTypes.STRING, allowNull: false },
  marca_carroceria: { type: DataTypes.STRING },
  modelo_carroceria: { type: DataTypes.STRING },
  marca_chasis: { type: DataTypes.STRING },
  modelo_chasis: { type: DataTypes.STRING },
  ano_fabricacion: { type: DataTypes.INTEGER },
  
  owner_rut: { type: DataTypes.STRING, allowNull: false },
  owner_name: { type: DataTypes.STRING, allowNull: false },
  owner_email: { type: DataTypes.STRING, allowNull: false },
  owner_phone: { type: DataTypes.STRING },
  
  driver_rut: { type: DataTypes.STRING },
  driver_name: { type: DataTypes.STRING },
  driver_phone: { type: DataTypes.STRING },
  
  reservation_date: { type: DataTypes.DATE },
  
  status: { type: DataTypes.ENUM('pending', 'in_process', 'approved', 'rejected'), defaultValue: 'pending' },
}, {
  tableName: 'buses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Bus;
