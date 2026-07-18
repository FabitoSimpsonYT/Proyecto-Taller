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

router.post('/iniciar-sesion', 
  loginLimiter,
  [
    body('correo').isEmail().withMessage('Debe ser un correo válido').normalizeEmail(),
    body('contrasena').isString().isLength({ min: 6 }).withMessage('Contraseña inválida')
  ],
  authController.iniciarSesion
);
router.post('/registrar', authenticateToken, requireAdmin, authController.registrar);
router.get('/perfil', authenticateToken, authController.obtenerPerfil);

module.exports = router;
