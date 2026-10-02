const ReglasStock = require('../rules/ReglasStock');
const ReglasVenta = require('../rules/ReglasVenta');

// Línea de una venta: congela nombre y precio del producto al momento de vender
class DetalleVenta {
  constructor({ productoId, codigo, nombre, cantidad, precioUnitario }) {
    this.productoId = productoId;
    this.codigo = codigo;
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.subtotal = ReglasVenta.redondear(cantidad * precioUnitario);
  }
}

// Entidad de dominio: Venta
class Venta {
  constructor({ id = null, usuarioId, vendedor = null, fecha = null, detalles, subtotal, descuento, total }) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.vendedor = vendedor;
    this.fecha = fecha;
    this.detalles = detalles;
    this.subtotal = subtotal;
    this.descuento = descuento;
    this.total = total;
  }

  // Crea una venta nueva: valida stock, descuenta existencias de los productos y calcula totales.
  // lineas: [{ producto, cantidad }]
  static crear(usuarioId, lineas) {
    for (const { producto, cantidad } of lineas) {
      ReglasStock.validarDisponibilidad(producto, cantidad);
    }
    const detalles = lineas.map(({ producto, cantidad }) => {
      producto.descontarStock(cantidad);
      return new DetalleVenta({
        productoId: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidad,
        precioUnitario: producto.precio,
      });
    });
    const totales = ReglasVenta.calcularTotales(detalles.map((d) => d.subtotal));
    return new Venta({ usuarioId, detalles, ...totales });
  }
}

module.exports = { Venta, DetalleVenta };
