require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la Base de Datos (MariaDB vía Sequelize)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Desactivar logs SQL en la consola
  }
);

// --- MODELOS ---

const User = sequelize.define('User', {
  full_name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin'), defaultValue: 'admin' }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Bus = sequelize.define('Bus', {
  patente: { type: DataTypes.STRING, unique: true, allowNull: false },
  carroceria: { type: DataTypes.STRING },
  chasis: { type: DataTypes.STRING },
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

const Inspection = sequelize.define('Inspection', {
  bus_id: { type: DataTypes.INTEGER, allowNull: false },
  inspector_id: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false },
  exams_notes: { type: DataTypes.TEXT },
  inspection_date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, {
  tableName: 'inspections',
  timestamps: false
});

// Relaciones
Bus.hasMany(Inspection, { foreignKey: 'bus_id' });
Inspection.belongsTo(Bus, { foreignKey: 'bus_id' });

User.hasMany(Inspection, { foreignKey: 'inspector_id' });
Inspection.belongsTo(User, { as: 'Inspector', foreignKey: 'inspector_id' });

// --- MIDDLEWARE AUTENTICACIÓN ---

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

// --- RUTAS DE AUTENTICACIÓN ---

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.full_name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión', details: error.message });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ ...user.toJSON(), name: user.full_name });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el perfil', details: error.message });
  }
});

// --- RUTAS PÚBLICAS ---

// Registrar nuevo bus (público, sin token)
app.post('/api/buses', async (req, res) => {
  try {
    const { 
      patente, carroceria, chasis, ano_fabricacion,
      owner_rut, owner_name, owner_email, owner_phone,
      driver_rut, driver_name, driver_phone, reservation_date
    } = req.body;
    
    if (!patente || !owner_rut || !owner_name || !owner_email || !reservation_date) {
      return res.status(400).json({ error: 'Faltan datos obligatorios, incluyendo la fecha de reserva' });
    }

    const newBus = await Bus.create({
      patente,
      carroceria,
      chasis,
      ano_fabricacion,
      owner_rut,
      owner_name,
      owner_email,
      owner_phone,
      driver_rut,
      driver_name,
      driver_phone,
      reservation_date,
      status: 'pending'
    });

    res.status(201).json(newBus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el bus', details: error.message });
  }
});

// --- RUTAS DE ADMINISTRADOR ---

// Obtener buses (todos, o filtrar por estado)
app.get('/api/admin/buses', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const buses = await Bus.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener buses', details: error.message });
  }
});

// Obtener buses pendientes de inspección (pending e in_process)
app.get('/api/inspections/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pendingBuses = await Bus.findAll({
      where: { 
        status: ['pending', 'in_process']
      },
      order: [['created_at', 'DESC']]
    });
    res.json(pendingBuses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener buses pendientes', details: error.message });
  }
});

// Confirmar asistencia (pasa a in_process)
app.post('/api/inspections/confirm-attendance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { bus_id } = req.body;
    const bus = await Bus.findByPk(bus_id);
    
    if (!bus) return res.status(404).json({ error: 'Bus no encontrado' });

    bus.status = 'in_process';
    await bus.save();

    res.json({ message: 'Asistencia confirmada para el bus ' + bus.patente });
  } catch (error) {
    res.status(500).json({ error: 'Error al confirmar asistencia', details: error.message });
  }
});

// Registrar checklist de inspección y aprobar/rechazar bus
app.post('/api/inspections/checklist', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { bus_id, items, exams_notes } = req.body;

    if (!bus_id || !items) {
      return res.status(400).json({ error: 'Bus ID e Items son obligatorios' });
    }

    const newInspection = await Inspection.create({
      bus_id,
      inspector_id: req.user.id,
      items,
      exams_notes
    });

    const hasFailedItems = items.some(item => item.status === 'fail');
    
    await Bus.update(
      { status: hasFailedItems ? 'rejected' : 'approved' },
      { where: { id: bus_id } }
    );

    // Acá podríamos implementar Nodemailer a futuro para notificar al owner_email

    res.status(201).json({ message: 'Inspección registrada con éxito', inspection: newInspection });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar inspección', details: error.message });
  }
});

// --- ENDPOINT DE SALUD ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// --- INICIO DEL SERVIDOR ---

async function testDataBase() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MariaDB establecida correctamente.');
    await sequelize.sync();
    console.log('Tablas sincronizadas correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
  await testDataBase();
});
