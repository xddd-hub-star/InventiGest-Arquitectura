const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const IAutenticador = require('../../application/interfaces/IAutenticador');
const { CredencialesInvalidasError } = require('../../domain/errors');

// Implementa IAutenticador con bcrypt + JWT
class AuthService extends IAutenticador {
  constructor({ secreto, expiracion = '8h' }) {
    super();
    if (!secreto) throw new Error('Falta el secreto JWT (variable JWT_SECRET).');
    this.secreto = secreto;
    this.expiracion = expiracion;
  }

  verificarPassword(passwordPlano, hash) {
    return bcrypt.compare(passwordPlano, hash);
  }

  emitirToken(usuario) {
    return jwt.sign({ nombre: usuario.nombre, rol: usuario.rol }, this.secreto, {
      subject: String(usuario.id),
      expiresIn: this.expiracion,
    });
  }

  verificarToken(token) {
    try {
      const datos = jwt.verify(token, this.secreto);
      return { id: Number(datos.sub), nombre: datos.nombre, rol: datos.rol };
    } catch {
      throw new CredencialesInvalidasError('La sesión no es válida o expiró.');
    }
  }
}

module.exports = AuthService;
