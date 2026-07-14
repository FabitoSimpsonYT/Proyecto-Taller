require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar la conexión a la base de datos
const sequelize = require('./config/database');

// Importar las rutas consolidadas
const apiRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- RUTAS ---
app.use('/api', apiRoutes);

// --- ENDPOINT DE SALUD ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend modular is running' });
});

// --- INICIO DEL SERVIDOR ---
async function testDataBase() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MariaDB establecida correctamente.');
    // Sincroniza los modelos con la base de datos
    await sequelize.sync();
    console.log('Tablas sincronizadas correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`Servidor Backend (Modular) corriendo en el puerto ${PORT}`);
  await testDataBase();
});
