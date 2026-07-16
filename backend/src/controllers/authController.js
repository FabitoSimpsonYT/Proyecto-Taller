const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw { status: 400, message: 'Email y contraseña son obligatorios' };

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

module.exports = {
  login,
  getProfile
};
