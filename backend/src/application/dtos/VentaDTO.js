// DTO de salida: una venta con sus líneas
class VentaDTO {
  static desde(venta) {
    return {
      id: venta.id,
      fecha: venta.fecha,
      vendedor: venta.vendedor,
      subtotal: venta.subtotal,
      descuento: venta.descuento,
      total: venta.total,
      detalles: venta.detalles.map((d) => ({
        productoId: d.productoId,
        codigo: d.codigo,
        nombre: d.nombre,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal: d.subtotal,
      })),
    };
  }
}

module.exports = VentaDTO;
