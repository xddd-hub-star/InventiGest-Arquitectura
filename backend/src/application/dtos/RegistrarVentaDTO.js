const { ErrorValidacion } = require('../../domain/errors');

// DTO de entrada: ítems de una venta
class RegistrarVentaDTO {
  static desde(cuerpo = {}) {
    if (!Array.isArray(cuerpo.items)) {
      throw new ErrorValidacion('La venta debe incluir al menos un producto.');
    }
    return {
      items: cuerpo.items.map((item) => ({
        productoId: Number(item?.productoId),
        cantidad: Number(item?.cantidad),
      })),
    };
  }
}

module.exports = RegistrarVentaDTO;
