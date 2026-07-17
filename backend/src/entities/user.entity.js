const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('Usuario', {
  nombre_completo: { type: DataTypes.STRING, allowNull: false, field: 'nombre_completo' },
  rut: { type: DataTypes.STRING, unique: true, allowNull: false },
  correo: { type: DataTypes.STRING, unique: true, allowNull: false, field: 'correo' },
  contrasena: { type: DataTypes.STRING, allowNull: false, field: 'contrasena' },
  rol: { type: DataTypes.ENUM('admin', 'mecanico'), defaultValue: 'mecanico', field: 'rol' }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = User;
