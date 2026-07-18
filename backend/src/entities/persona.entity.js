const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Persona = sequelize.define('Persona', {
  rut: { type: DataTypes.STRING, unique: true, allowNull: false },
  nombre_completo: { type: DataTypes.STRING, allowNull: false, field: 'nombre_completo' },
  telefono: { type: DataTypes.STRING, allowNull: false, field: 'telefono' },
  correo: { type: DataTypes.STRING, field: 'correo' } // Opcional
}, {
  tableName: 'personas',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = Persona;
