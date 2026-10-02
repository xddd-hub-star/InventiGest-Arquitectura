const test = require('node:test');
const assert = require('node:assert/strict');
const { iniciarEntorno } = require('./helpers');

let entorno;
let admin;
let vendedor;

test.before(async () => {
  entorno = await iniciarEntorno();
  admin = await entorno.tokenAdmin();
  vendedor = await entorno.tokenVendedor();
});
test.after(() => entorno.cerrar());

const stockDe = async (id) => (await entorno.api('GET', `/api/productos/${id}`, { token: admin })).datos.stock;

test('login correcto devuelve token y usuario sin hash de contraseña', async () => {
  const { estado, datos } = await entorno.api('POST', '/api/auth/login', {
    cuerpo: { email: 'admin@inventigest.local', password: 'Admin123!' },
  });
  assert.equal(estado, 200);
  assert.ok(datos.token);
  assert.equal(datos.usuario.rol, 'admin');
  assert.equal(JSON.stringify(datos).includes('password'), false);
});

test('login con contraseña incorrecta responde 401', async () => {
  const { estado, datos } = await entorno.api('POST', '/api/auth/login', {
    cuerpo: { email: 'admin@inventigest.local', password: 'incorrecta' },
  });
  assert.equal(estado, 401);
  assert.equal(datos.error, 'Correo o contraseña incorrectos.');
});

test('sin token las rutas protegidas responden 401', async () => {
  assert.equal((await entorno.api('GET', '/api/productos')).estado, 401);
});

test('CU1 registrar producto: caso correcto queda persistido', async () => {
  const { estado, datos } = await entorno.api('POST', '/api/productos', {
    token: admin,
    cuerpo: { codigo: 'P-100', nombre: 'Audífonos', precio: 25.5, stock: 12 },
  });
  assert.equal(estado, 201);
  assert.ok(datos.id);
  const leido = await entorno.api('GET', `/api/productos/${datos.id}`, { token: admin });
  assert.equal(leido.datos.nombre, 'Audífonos');
  assert.equal(leido.datos.precio, 25.5);
});

test('CU1 registrar producto con precio -50 es rechazado', async () => {
  const { estado, datos } = await entorno.api('POST', '/api/productos', {
    token: admin,
    cuerpo: { codigo: 'P-101', nombre: 'Inválido', precio: -50, stock: 1 },
  });
  assert.equal(estado, 400);
  assert.equal(datos.error, 'El precio debe ser mayor que cero.');
});

test('CU1 registrar producto con código repetido responde 409', async () => {
  const { estado } = await entorno.api('POST', '/api/productos', {
    token: admin,
    cuerpo: { codigo: 'P-001', nombre: 'Duplicado', precio: 1, stock: 1 },
  });
  assert.equal(estado, 409);
});

test('un vendedor no puede registrar productos (403)', async () => {
  const { estado } = await entorno.api('POST', '/api/productos', {
    token: vendedor,
    cuerpo: { codigo: 'P-102', nombre: 'No permitido', precio: 1, stock: 1 },
  });
  assert.equal(estado, 403);
});

test('CU2 consultar productos: lista y búsqueda por nombre', async () => {
  const todos = await entorno.api('GET', '/api/productos', { token: vendedor });
  assert.equal(todos.estado, 200);
  assert.ok(todos.datos.length >= 5);
  const filtrados = await entorno.api('GET', '/api/productos?busqueda=mouse', { token: vendedor });
  assert.deepEqual(filtrados.datos.map((p) => p.codigo), ['P-002']);
});

test('CU2 consultar un producto inexistente responde 404', async () => {
  assert.equal((await entorno.api('GET', '/api/productos/9999', { token: vendedor })).estado, 404);
});

test('CU3 actualizar stock: repone, persiste y rechaza dejarlo negativo', async () => {
  const antes = await stockDe(4);
  const sube = await entorno.api('PATCH', '/api/productos/4/stock', { token: admin, cuerpo: { delta: 10 } });
  assert.equal(sube.datos.stock, antes + 10);
  assert.equal(await stockDe(4), antes + 10);

  const excede = await entorno.api('PATCH', '/api/productos/4/stock', { token: admin, cuerpo: { delta: -100000 } });
  assert.equal(excede.estado, 409);
  assert.equal(await stockDe(4), antes + 10);

  const invalido = await entorno.api('PATCH', '/api/productos/4/stock', { token: admin, cuerpo: { delta: 'x' } });
  assert.equal(invalido.estado, 400);
});

test('CU4 registrar venta: descuenta stock, aplica descuento y alerta stock bajo', async () => {
  const antes = await stockDe(3); // Monitor, 180.00, stock 8, mínimo 3
  const { estado, datos } = await entorno.api('POST', '/api/ventas', {
    token: vendedor,
    cuerpo: { items: [{ productoId: 3, cantidad: 6 }] },
  });
  assert.equal(estado, 201);
  assert.equal(datos.subtotal, 1080);
  assert.equal(datos.descuento, 54); // 5 % por superar 1000
  assert.equal(datos.total, 1026);
  assert.equal(datos.vendedor, 'Vendedor Demo');
  assert.equal(await stockDe(3), antes - 6);
  assert.ok(entorno.alertas.includes('P-003'));
});

test('CU4 venta con stock insuficiente es rechazada y no modifica nada (transacción)', async () => {
  const stockMouse = await stockDe(2);
  const stockUsb = await stockDe(5);
  const { estado, datos } = await entorno.api('POST', '/api/ventas', {
    token: vendedor,
    cuerpo: { items: [{ productoId: 2, cantidad: 1 }, { productoId: 5, cantidad: stockUsb + 1 }] },
  });
  assert.equal(estado, 409);
  assert.match(datos.error, /Stock insuficiente/);
  assert.equal(await stockDe(2), stockMouse);
  assert.equal(await stockDe(5), stockUsb);
});

test('CU4 venta con datos inválidos responde 400 o 404', async () => {
  const post = (cuerpo) => entorno.api('POST', '/api/ventas', { token: vendedor, cuerpo });
  assert.equal((await post({ items: [] })).estado, 400);
  assert.equal((await post({})).estado, 400);
  assert.equal((await post({ items: [{ productoId: 2, cantidad: -1 }] })).estado, 400);
  assert.equal((await post({ items: [{ productoId: 9999, cantidad: 1 }] })).estado, 404);
});

test('CU5 consultar ventas: lista y detalle de una venta', async () => {
  const lista = await entorno.api('GET', '/api/ventas', { token: vendedor });
  assert.equal(lista.estado, 200);
  assert.ok(lista.datos.length >= 1);
  const detalle = await entorno.api('GET', `/api/ventas/${lista.datos[0].id}`, { token: vendedor });
  assert.equal(detalle.estado, 200);
  assert.ok(detalle.datos.detalles.length >= 1);
  assert.equal((await entorno.api('GET', '/api/ventas/9999', { token: vendedor })).estado, 404);
  assert.equal((await entorno.api('GET', '/api/ventas?desde=no-es-fecha', { token: vendedor })).estado, 400);
});

test('reporte resumen: solo admin y refleja ventas y stock bajo', async () => {
  assert.equal((await entorno.api('GET', '/api/reportes/resumen', { token: vendedor })).estado, 403);
  const { estado, datos } = await entorno.api('GET', '/api/reportes/resumen', { token: admin });
  assert.equal(estado, 200);
  assert.ok(datos.cantidadVentas >= 1);
  assert.ok(datos.totalVendido >= 1026);
  assert.ok(datos.productosStockBajo.some((p) => p.codigo === 'P-003'));
});
