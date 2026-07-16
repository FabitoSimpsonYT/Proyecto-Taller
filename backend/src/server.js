require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importar la conexión a la base de datos
const sequelize = require('./config/database');

// Importar las rutas consolidadas
const apiRoutes = require('./routes/index.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de Seguridad: CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
  credentials: true, // Permitir cookies si fuesen necesarias
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

// --- RUTAS ---
app.use('/api', apiRoutes);

// --- ENDPOINT DE SALUD ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend modular is running' });
});

// --- MANEJO DE ERRORES CENTRALIZADO ---
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

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

const server = app.listen(PORT, async () => {
  console.log(`Servidor Backend (Modular) corriendo en el puerto ${PORT}`);
  await testDataBase();
});

// === MANEJO DE CIERRE ELEGANTE (Ctrl+C y Nodemon) ===
const gracefulShutdown = () => {
  console.log('\nCerrando servidor (Ctrl+C detectado)...');
  server.close(async () => {
    console.log('Servidor HTTP cerrado.');
    try {
      await sequelize.close();
      console.log('Conexión a base de datos cerrada.');
      process.exit(0);
    } catch (err) {
      console.error('Error al cerrar la conexión', err);
      process.exit(1);
    }
  });
};

// Escucha eventos de cierre (Ctrl+C o detener proceso)
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Soporte especial para evitar que Nodemon deje el puerto colgado al reiniciar
process.once('SIGUSR2', () => {
  server.close(async () => {
    try {
      await sequelize.close();
    } catch (e) {
      // ignorar errores al forzar reinicio
    }
    process.kill(process.pid, 'SIGUSR2');
  });
});
