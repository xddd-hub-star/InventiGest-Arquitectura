const fs = require('node:fs');
const path = require('node:path');
const { newDb } = require('pg-mem');
const { crearServicios } = require('../src/compositionRoot');
const { crearApp } = require('../src/presentation/app');

const CARPETA_SQL = path.join(__dirname, '..', '..', 'Database');

// Levanta la API completa sobre una base en memoria creada con los mismos scripts SQL del proyecto
async function iniciarEntorno() {
  const db = newDb();
  db.public.none(fs.readFileSync(path.join(CARPETA_SQL, '02_Crear_Tablas.sql'), 'utf8'));
  db.public.none(fs.readFileSync(path.join(CARPETA_SQL, '03_Datos_Prueba.sql'), 'utf8'));
  const { Pool } = db.adapters.createPg();
  const pool = new Pool();

  const alertas = [];
  const notificador = { alertarStockBajo: async (producto) => alertas.push(producto.codigo) };
  const app = crearApp(crearServicios({ pool, jwtSecret: 'secreto-solo-para-pruebas', notificador }));

  const servidor = await new Promise((resolver) => {
    const s = app.listen(0, () => resolver(s));
  });
  const base = `http://127.0.0.1:${servidor.address().port}`;

  async function api(metodo, ruta, { token, cuerpo } = {}) {
    const respuesta = await fetch(base + ruta, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    return { estado: respuesta.status, datos: await respuesta.json() };
  }

  async function iniciarSesion(email, password) {
    const { datos } = await api('POST', '/api/auth/login', { cuerpo: { email, password } });
    return datos.token;
  }

  return {
    api,
    alertas,
    db,
    tokenAdmin: () => iniciarSesion('admin@inventigest.local', 'Admin123!'),
    tokenVendedor: () => iniciarSesion('vendedor@inventigest.local', 'Vendedor123!'),
    cerrar: () => new Promise((resolver) => servidor.close(resolver)),
  };
}

module.exports = { iniciarEntorno };
