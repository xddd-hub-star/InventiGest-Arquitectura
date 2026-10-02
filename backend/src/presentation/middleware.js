const {
  ErrorValidacion,
  NoEncontradoError,
  StockInsuficienteError,
  ConflictoError,
  CredencialesInvalidasError,
} = require('../domain/errors');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Exige un token válido y deja el usuario en req.usuario
function requerirSesion(servicioAutenticacion) {
  return (req, res, next) => {
    const cabecera = req.headers.authorization || '';
    const [tipo, token] = cabecera.split(' ');
    if (tipo !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Debe iniciar sesión.' });
    }
    try {
      req.usuario = servicioAutenticacion.verificarToken(token);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requerirRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario?.rol)) {
      return res.status(403).json({ error: 'No tiene permisos para esta operación.' });
    }
    return next();
  };
}

const ESTADOS = [
  [ErrorValidacion, 400],
  [CredencialesInvalidasError, 401],
  [NoEncontradoError, 404],
  [StockInsuficienteError, 409],
  [ConflictoError, 409],
];

// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, next) {
  const coincidencia = ESTADOS.find(([Clase]) => error instanceof Clase);
  if (coincidencia) return res.status(coincidencia[1]).json({ error: error.message });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'El cuerpo JSON no es válido.' });
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
}

module.exports = { asyncHandler, requerirSesion, requerirRol, manejarErrores };
