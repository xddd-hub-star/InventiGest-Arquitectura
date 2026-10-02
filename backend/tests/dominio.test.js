const test = require('node:test');
const assert = require('node:assert/strict');
const Producto = require('../src/domain/entities/Producto');
const { Venta } = require('../src/domain/entities/Venta');
const ReglasVenta = require('../src/domain/rules/ReglasVenta');
const { ErrorValidacion, StockInsuficienteError } = require('../src/domain/errors');

const nuevoProducto = (extra = {}) =>
  new Producto({ id: 1, codigo: 'X-1', nombre: 'Producto de prueba', precio: 10, stock: 10, stockMinimo: 2, ...extra });

test('Producto rechaza un precio negativo con el mensaje esperado', () => {
  assert.throws(() => nuevoProducto({ precio: -50 }), (e) => {
    assert.ok(e instanceof ErrorValidacion);
    assert.equal(e.message, 'El precio debe ser mayor que cero.');
    return true;
  });
});

test('Producto rechaza stock negativo y nombre vacío', () => {
  assert.throws(() => nuevoProducto({ stock: -1 }), ErrorValidacion);
  assert.throws(() => nuevoProducto({ nombre: '   ' }), ErrorValidacion);
});

test('Producto no permite dejar el stock en negativo', () => {
  const producto = nuevoProducto({ stock: 3 });
  assert.throws(() => producto.descontarStock(4), StockInsuficienteError);
  assert.equal(producto.stock, 3);
});

test('ajustarStock repone y reduce existencias', () => {
  const producto = nuevoProducto({ stock: 3 });
  producto.ajustarStock(5);
  assert.equal(producto.stock, 8);
  producto.ajustarStock(-8);
  assert.equal(producto.stock, 0);
  assert.throws(() => producto.ajustarStock(0), ErrorValidacion);
});

test('tieneStockBajo se activa al llegar al mínimo', () => {
  const producto = nuevoProducto({ stock: 3, stockMinimo: 2 });
  assert.equal(producto.tieneStockBajo(), false);
  producto.descontarStock(1);
  assert.equal(producto.tieneStockBajo(), true);
});

test('ReglasVenta aplica el descuento por escalón', () => {
  assert.deepEqual(ReglasVenta.calcularTotales([500]), { subtotal: 500, descuento: 0, total: 500 });
  assert.deepEqual(ReglasVenta.calcularTotales([600, 400]), { subtotal: 1000, descuento: 50, total: 950 });
  assert.deepEqual(ReglasVenta.calcularTotales([5000]), { subtotal: 5000, descuento: 500, total: 4500 });
});

test('ReglasVenta consolida productos repetidos y valida cantidades', () => {
  assert.deepEqual(
    ReglasVenta.consolidarItems([{ productoId: 1, cantidad: 2 }, { productoId: 1, cantidad: 3 }]),
    [{ productoId: 1, cantidad: 5 }]
  );
  assert.throws(() => ReglasVenta.consolidarItems([]), ErrorValidacion);
  assert.throws(() => ReglasVenta.consolidarItems([{ productoId: 1, cantidad: 0 }]), ErrorValidacion);
  assert.throws(() => ReglasVenta.consolidarItems([{ productoId: 1, cantidad: 1.5 }]), ErrorValidacion);
});

test('Venta.crear descuenta stock y calcula totales', () => {
  const producto = nuevoProducto({ precio: 4.5, stock: 10 });
  const venta = Venta.crear(7, [{ producto, cantidad: 3 }]);
  assert.equal(producto.stock, 7);
  assert.equal(venta.total, 13.5);
  assert.equal(venta.detalles[0].subtotal, 13.5);
});
