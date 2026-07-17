const authService = require('../services/authService');
const { validationResult } = require('express-validator');

const iniciarSesion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { correo, contrasena } = req.body;

    const result = await authService.iniciarSesionUsuario(correo, contrasena);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const obtenerPerfil = async (req, res, next) => {
  try {
    const result = await authService.obtenerPerfilUsuario(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const registrar = async (req, res, next) => {
  try {
    const { nombre_completo, rut, correo, contrasena, rol } = req.body;
    if (!nombre_completo || !rut || !correo || !contrasena || !rol) {
      throw { status: 400, message: 'Todos los campos son obligatorios' };
    }
    const result = await authService.registrarUsuario(nombre_completo, rut, correo, contrasena, rol);
    res.status(201).json({ message: 'Usuario creado exitosamente', usuario: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  iniciarSesion,
  obtenerPerfil,
  registrar
};
