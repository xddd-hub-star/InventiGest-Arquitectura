// DTO de entrada: datos para registrar un producto
class CrearProductoDTO {
  static desde(cuerpo = {}) {
    return {
      codigo: cuerpo.codigo,
      nombre: cuerpo.nombre,
      precio: typeof cuerpo.precio === 'string' ? Number(cuerpo.precio) : cuerpo.precio,
      stock: cuerpo.stock ?? 0,
      stockMinimo: cuerpo.stockMinimo ?? 5,
    };
  }
}

module.exports = CrearProductoDTO;
