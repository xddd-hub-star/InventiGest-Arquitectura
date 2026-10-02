// DTO de salida: expone un producto sin revelar la entidad de dominio
class ProductoDTO {
  static desde(producto) {
    return {
      id: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
      stockBajo: producto.tieneStockBajo(),
    };
  }
}

module.exports = ProductoDTO;
