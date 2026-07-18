const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservacion', {
  fecha_reserva: { type: DataTypes.DATE, allowNull: false, field: 'fecha_reserva' },
  estado: { type: DataTypes.ENUM('pendiente', 'en_proceso', 'aprobado', 'rechazado'), defaultValue: 'pendiente', field: 'estado' },
  // bus_id se agregará en index.entities.js a través de las relaciones
}, {
  tableName: 'reservaciones',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = Reservation;
