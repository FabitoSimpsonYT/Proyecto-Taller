const { body, validationResult } = require('express-validator');

// Validar RUT chileno
const isValidRut = (rut) => {
  if (!/^[0-9]+-[0-9kK]{1}$/.test(rut)) return false;
  const [rutNum, dv] = rut.split('-');
  let M = 0, S = 1, T = parseInt(rutNum, 10);
  for (; T; T = Math.floor(T / 10)) {
    S = (S + T % 10 * (9 - M++ % 6)) % 11;
  }
  return (S ? S - 1 : 'k').toString() === dv.toLowerCase();
};

const validarReserva = [
  body('rut_dueno')
    .notEmpty().withMessage('El RUT del dueño es obligatorio')
    .custom((value) => {
      if (!isValidRut(value)) throw new Error('RUT del dueño inválido');
      return true;
    }),
  body('nombre_dueno').notEmpty().withMessage('El nombre del dueño es obligatorio'),
  body('correo_dueno').isEmail().withMessage('El email del dueño debe ser válido'),
  body('telefono_dueno').notEmpty().withMessage('El teléfono del dueño es obligatorio'),
  
  body('fecha_reserva').notEmpty().withMessage('La fecha de reserva es obligatoria').isISO8601().withMessage('Formato de fecha inválido'),
  
  body('patente')
    .notEmpty().withMessage('La patente es obligatoria')
    .matches(/^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/).withMessage('La patente debe tener formato XXXX11 o XX1111'),
  body('ano_fabricacion')
    .notEmpty().withMessage('El año de fabricación es obligatorio')
    .custom((value) => {
      const year = parseInt(value, 10);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // 0 = Enero, 8 = Septiembre
      
      const maxYear = currentMonth >= 8 ? currentYear + 1 : currentYear;
      
      if (year < 1950 || year > maxYear) {
        throw new Error(`El año de fabricación debe estar entre 1950 y ${maxYear}`);
      }
      return true;
    }),
  body('marca_carroceria').notEmpty().withMessage('La marca de la carrocería es obligatoria'),
  body('modelo_carroceria').notEmpty().withMessage('El modelo de la carrocería es obligatorio'),
  body('marca_chasis').notEmpty().withMessage('La marca del chasis es obligatoria'),
  body('modelo_chasis').notEmpty().withMessage('El modelo del chasis es obligatorio'),

  // Chofer es opcional
  body('rut_conductor').optional({ checkFalsy: true }).custom((value) => {
    if (!isValidRut(value)) throw new Error('RUT del chofer inválido');
    return true;
  }),
  
  // Detalles visuales opcionales
  body('detalles_visuales').optional().isArray().withMessage('Los detalles visuales deben ser un array'),

  // Middleware para retornar errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Errores de validación', details: errors.array() });
    }
    next();
  }
];

module.exports = {
  validarReserva
};
