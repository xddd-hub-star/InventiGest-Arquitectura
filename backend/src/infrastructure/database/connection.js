const { Pool } = require('pg');

// Conexión y configuración de PostgreSQL.
// Usa DATABASE_URL si existe; si no, las variables estándar PGHOST, PGPORT, PGUSER, PGPASSWORD y PGDATABASE.
function crearPool() {
  if (process.env.DATABASE_URL) {
    return new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return new Pool({ database: process.env.PGDATABASE || 'inventigest' });
}

module.exports = { crearPool };
