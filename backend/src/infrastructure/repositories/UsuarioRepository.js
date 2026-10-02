const IUsuarioRepository = require('../../domain/interfaces/IUsuarioRepository');
const { Usuario } = require('../../domain/entities/Usuario');

// Implementa IUsuarioRepository sobre PostgreSQL
class UsuarioRepository extends IUsuarioRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async obtenerPorEmail(email) {
    const { rows } = await this.pool.query(
      'SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = $1',
      [email]
    );
    if (!rows[0]) return null;
    const fila = rows[0];
    return new Usuario({
      id: fila.id,
      nombre: fila.nombre,
      email: fila.email,
      passwordHash: fila.password_hash,
      rol: fila.rol,
    });
  }
}

module.exports = UsuarioRepository;
