// Contrato: consultar/guardar productos y existencias
class IProductoRepository {
  async obtenerPorId(id) { throw new Error('No implementado'); }
  async obtenerPorCodigo(codigo) { throw new Error('No implementado'); }
  async obtenerPorIds(ids) { throw new Error('No implementado'); }
  async listar(filtro) { throw new Error('No implementado'); }
  async listarStockBajo() { throw new Error('No implementado'); }
  // Inserta si el producto no tiene id; actualiza si ya lo tiene. Devuelve el producto guardado.
  async guardar(producto) { throw new Error('No implementado'); }
}

module.exports = IProductoRepository;
