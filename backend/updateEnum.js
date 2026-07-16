require('dotenv').config();
const sequelize = require('./src/config/database');

async function updateEnum() {
  try {
    await sequelize.authenticate();
    await sequelize.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'mecanico') NOT NULL DEFAULT 'mecanico'");
    console.log("Columna role actualizada correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error actualizando la columna role:", error);
    process.exit(1);
  }
}

updateEnum();
