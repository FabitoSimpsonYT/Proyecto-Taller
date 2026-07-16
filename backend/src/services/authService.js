const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../entities/index.entities');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    // Mitigación de timing attack: procesamos un hash simulado para igualar los tiempos de respuesta
    await bcrypt.compare(password, '$2a$10$dummyHashToMatchTheLengthOfARealHash123456789012345678');
    throw { status: 401, message: 'el email o la contraseña son incorrectos' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw { status: 401, message: 'el email o la contraseña son incorrectos' };

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token, user: { id: user.id, email: user.email, name: user.full_name, role: user.role } };
};

const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };
  
  return { ...user.toJSON(), name: user.full_name };
};

const registerUser = async (full_name, email, password, role) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw { status: 400, message: 'El correo ya está registrado' };

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = await User.create({
    full_name,
    email,
    password: hashedPassword,
    role
  });

  return { id: newUser.id, email: newUser.email, name: newUser.full_name, role: newUser.role };
};

module.exports = {
  loginUser,
  getUserProfile,
  registerUser
};
