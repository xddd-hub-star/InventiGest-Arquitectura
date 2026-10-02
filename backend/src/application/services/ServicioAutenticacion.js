const { CredencialesInvalidasError, ErrorValidacion } = require('../../domain/errors');

// Orquesta autenticación y emisión de tokens
class ServicioAutenticacion {
  constructor({ usuarioRepository, autenticador }) {
    this.usuarioRepository = usuarioRepository;
    this.autenticador = autenticador;
  }

  async login({ email, password } = {}) {
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      throw new ErrorValidacion('Correo y contraseña son obligatorios.');
    }
    const usuario = await this.usuarioRepository.obtenerPorEmail(email.trim().toLowerCase());
    const valido = usuario && (await this.autenticador.verificarPassword(password, usuario.passwordHash));
    if (!valido) throw new CredencialesInvalidasError('Correo o contraseña incorrectos.');
    return {
      token: this.autenticador.emitirToken(usuario),
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    };
  }

  verificarToken(token) {
    return this.autenticador.verificarToken(token);
  }
}

module.exports = ServicioAutenticacion;
