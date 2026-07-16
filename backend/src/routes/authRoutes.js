const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // limite de 10 intentos
  message: { error: 'Demasiados intentos de inicio de sesión, intenta en 15 minutos' }
});

router.post('/login', 
  loginLimiter,
  [
    body('email').isEmail().withMessage('Debe ser un email válido').normalizeEmail(),
    body('password').isString().isLength({ min: 6 }).withMessage('Contraseña inválida')
  ],
  authController.login
);
router.post('/register', authenticateToken, requireAdmin, authController.register);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
