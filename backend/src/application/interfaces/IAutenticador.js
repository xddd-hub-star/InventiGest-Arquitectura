// Contrato: verificar contraseñas y emitir/validar tokens de sesión
class IAutenticador {
  async verificarPassword(passwordPlano, hash) { throw new Error('No implementado'); }
  emitirToken(usuario) { throw new Error('No implementado'); }
  verificarToken(token) { throw new Error('No implementado'); }
}

module.exports = IAutenticador;
