const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../entities/index.entities');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

const iniciarSesionUsuario = async (correo, contrasena) => {
  const usuario = await Usuario.findOne({ where: { correo } });
  
  if (!usuario) {
    // Mitigación de timing attack: procesamos un hash simulado para igualar los tiempos de respuesta
    await bcrypt.compare(contrasena, '$2a$10$dummyHashToMatchTheLengthOfARealHash123456789012345678');
    throw { status: 401, message: 'el correo o la contraseña son incorrectos' };
  }

  const esContrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!esContrasenaValida) throw { status: 401, message: 'el correo o la contraseña son incorrectos' };

  const token = jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token, usuario: { id: usuario.id, correo: usuario.correo, nombre: usuario.nombre_completo, rol: usuario.rol } };
};

const obtenerPerfilUsuario = async (usuarioId) => {
  const usuario = await Usuario.findByPk(usuarioId, {
    attributes: { exclude: ['contrasena'] }
  });
  
  if (!usuario) throw { status: 404, message: 'Usuario no encontrado' };
  
  return { ...usuario.toJSON(), nombre: usuario.nombre_completo };
};

const registrarUsuario = async (nombre_completo, rut, correo, contrasena, rol) => {
  const usuarioExistente = await Usuario.findOne({ where: { correo } });
  if (usuarioExistente) throw { status: 400, message: 'El correo ya está registrado' };

  const contrasenaHasheada = await bcrypt.hash(contrasena, 10);
  
  const nuevoUsuario = await Usuario.create({
    nombre_completo,
    rut,
    correo,
    contrasena: contrasenaHasheada,
    rol
  });

  return { id: nuevoUsuario.id, correo: nuevoUsuario.correo, nombre: nuevoUsuario.nombre_completo, rol: nuevoUsuario.rol };
};

module.exports = {
  iniciarSesionUsuario,
  obtenerPerfilUsuario,
  registrarUsuario
};
