const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../entities/index.entities');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 401, message: 'Credenciales inválidas' };

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw { status: 401, message: 'Credenciales inválidas' };

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

module.exports = {
  loginUser,
  getUserProfile
};
