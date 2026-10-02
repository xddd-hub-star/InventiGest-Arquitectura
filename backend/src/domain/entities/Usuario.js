const ROLES = Object.freeze({ ADMIN: 'admin', VENDEDOR: 'vendedor' });

// Entidad de dominio: Usuario (el hash de contraseña nunca sale de esta capa hacia la API)
class Usuario {
  #passwordHash;

  constructor({ id, nombre, email, passwordHash, rol }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.rol = rol;
    this.#passwordHash = passwordHash;
  }

  get passwordHash() {
    return this.#passwordHash;
  }

  esAdmin() {
    return this.rol === ROLES.ADMIN;
  }
}

module.exports = { Usuario, ROLES };
