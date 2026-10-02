// Ejecuta un escenario real contra la API y guarda cada petición y respuesta en documentacion/evidencias.json
// Uso: node tests/evidencias.js
const fs = require('node:fs');
const path = require('node:path');
const { iniciarEntorno } = require('./helpers');

async function main() {
  const entorno = await iniciarEntorno();
  const registro = [];

  async function paso(titulo, metodo, ruta, { token, cuerpo } = {}) {
    const { estado, datos } = await entorno.api(metodo, ruta, { token, cuerpo });
    const salida = datos && datos.token ? { ...datos, token: '<jwt>' } : datos;
    registro.push({ titulo, metodo, ruta, cuerpo: cuerpo ?? null, estado, respuesta: salida });
    return datos;
  }

  const admin = await entorno.tokenAdmin();
  const vendedor = await entorno.tokenVendedor();

  await paso('Inicio de sesión correcto', 'POST', '/api/auth/login', {
    cuerpo: { email: 'admin@inventigest.local', password: 'Admin123!' },
  });
  await paso('Inicio de sesión con contraseña incorrecta', 'POST', '/api/auth/login', {
    cuerpo: { email: 'admin@inventigest.local', password: 'incorrecta' },
  });
  await paso('CU1 · Registrar producto (caso correcto)', 'POST', '/api/productos', {
    token: admin,
    cuerpo: { codigo: 'P-100', nombre: 'Audífonos', precio: 25.5, stock: 12, stockMinimo: 5 },
  });
  await paso('CU1 · Registrar producto con precio = -50 (regla de negocio)', 'POST', '/api/productos', {
    token: admin,
    cuerpo: { codigo: 'P-101', nombre: 'Producto inválido', precio: -50, stock: 1 },
  });
  await paso('CU1 · Registrar producto con código repetido', 'POST', '/api/productos', {
    token: admin,
    cuerpo: { codigo: 'P-001', nombre: 'Duplicado', precio: 10, stock: 1 },
  });
  await paso('Control de roles: un vendedor intenta registrar un producto', 'POST', '/api/productos', {
    token: vendedor,
    cuerpo: { codigo: 'P-102', nombre: 'No permitido', precio: 10, stock: 1 },
  });
  await paso('CU2 · Consultar productos (búsqueda "mouse")', 'GET', '/api/productos?busqueda=mouse', { token: vendedor });
  await paso('CU3 · Actualizar stock (+10 al producto 4)', 'PATCH', '/api/productos/4/stock', {
    token: admin,
    cuerpo: { delta: 10 },
  });
  await paso('CU3 · Actualizar stock dejándolo negativo', 'PATCH', '/api/productos/4/stock', {
    token: admin,
    cuerpo: { delta: -100000 },
  });
  await paso('CU4 · Registrar venta con descuento por volumen (6 monitores)', 'POST', '/api/ventas', {
    token: vendedor,
    cuerpo: { items: [{ productoId: 3, cantidad: 6 }] },
  });
  await paso('CU4 · Registrar venta con stock insuficiente (se revierte completa)', 'POST', '/api/ventas', {
    token: vendedor,
    cuerpo: { items: [{ productoId: 2, cantidad: 1 }, { productoId: 5, cantidad: 999 }] },
  });
  await paso('Persistencia: el stock del mouse no cambió tras la venta fallida', 'GET', '/api/productos/2', { token: vendedor });
  await paso('CU5 · Consultar ventas', 'GET', '/api/ventas', { token: vendedor });
  await paso('Reporte de resumen (admin)', 'GET', '/api/reportes/resumen', { token: admin });

  const destino = path.join(__dirname, '..', '..', 'documentacion', 'evidencias.json');
  fs.writeFileSync(destino, JSON.stringify({ alertasStockBajo: entorno.alertas, pasos: registro }, null, 2));
  console.log(`Evidencias guardadas en ${destino} (${registro.length} pasos)`);
  await entorno.cerrar();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
