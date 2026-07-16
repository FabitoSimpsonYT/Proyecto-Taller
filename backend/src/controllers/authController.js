const authService = require('../services/authService');
const { validationResult } = require('express-validator');

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const result = await authService.getUserProfile(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password || !role) {
      throw { status: 400, message: 'Todos los campos son obligatorios' };
    }
    const result = await authService.registerUser(full_name, email, password, role);
    res.status(201).json({ message: 'Usuario creado exitosamente', user: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getProfile,
  register
};
