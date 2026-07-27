const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservacion', {
  fecha_reserva: { type: DataTypes.DATE, allowNull: false, field: 'fecha_reserva' },
  estado: { type: DataTypes.ENUM('pendiente', 'en_proceso', 'en_taller', 'aprobado', 'rechazado'), defaultValue: 'pendiente', field: 'estado' },
  entregado: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'entregado' },
  detalles_cliente: { type: DataTypes.JSON, allowNull: true, field: 'detalles_cliente' },
  // bus_id se agregará en index.entities.js a través de las relaciones
  // relaciones de usuario
  recepcionista_id: { type: DataTypes.INTEGER, allowNull: true, field: 'recepcionista_id' },
  despachador_id: { type: DataTypes.INTEGER, allowNull: true, field: 'despachador_id' }
}, {
  tableName: 'reservaciones',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = Reservation;
