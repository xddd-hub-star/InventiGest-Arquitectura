const { ErrorValidacion } = require('../errors');

const DESCUENTOS = [
  { desde: 5000, porcentaje: 10 },
  { desde: 1000, porcentaje: 5 },
];

// Regla de negocio: cálculo de totales y validaciones de una venta
class ReglasVenta {
  static redondear(valor) {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  // Valida los ítems solicitados y suma las líneas repetidas del mismo producto
  static consolidarItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new ErrorValidacion('La venta debe incluir al menos un producto.');
    }
    const porProducto = new Map();
    for (const { productoId, cantidad } of items) {
      if (!Number.isInteger(productoId) || productoId <= 0) {
        throw new ErrorValidacion('El producto indicado no es válido.');
      }
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new ErrorValidacion('La cantidad debe ser un entero mayor que cero.');
      }
      porProducto.set(productoId, (porProducto.get(productoId) ?? 0) + cantidad);
    }
    return [...porProducto].map(([productoId, cantidad]) => ({ productoId, cantidad }));
  }

  static porcentajeDescuento(subtotal) {
    const escalon = DESCUENTOS.find((d) => subtotal >= d.desde);
    return escalon ? escalon.porcentaje : 0;
  }

  static calcularTotales(subtotales) {
    const subtotal = ReglasVenta.redondear(subtotales.reduce((suma, s) => suma + s, 0));
    const descuento = ReglasVenta.redondear((subtotal * ReglasVenta.porcentajeDescuento(subtotal)) / 100);
    const total = ReglasVenta.redondear(subtotal - descuento);
    return { subtotal, descuento, total };
  }
}

module.exports = ReglasVenta;
