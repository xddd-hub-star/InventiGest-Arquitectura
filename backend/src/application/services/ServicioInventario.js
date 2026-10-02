const Producto = require('../../domain/entities/Producto');
const { NoEncontradoError, ConflictoError } = require('../../domain/errors');
const CrearProductoDTO = require('../dtos/CrearProductoDTO');
const ProductoDTO = require('../dtos/ProductoDTO');

// Orquesta la gestión de inventario y stock
class ServicioInventario {
  constructor({ productoRepository, notificador }) {
    this.productoRepository = productoRepository;
    this.notificador = notificador;
  }

  async registrarProducto(cuerpo) {
    const datos = CrearProductoDTO.desde(cuerpo);
    const producto = new Producto(datos); // las validaciones viven en el dominio
    if (await this.productoRepository.obtenerPorCodigo(producto.codigo)) {
      throw new ConflictoError(`Ya existe un producto con el código "${producto.codigo}".`);
    }
    return ProductoDTO.desde(await this.productoRepository.guardar(producto));
  }

  async consultarProductos(filtro = {}) {
    const productos = await this.productoRepository.listar(filtro);
    return productos.map(ProductoDTO.desde);
  }

  async obtenerProducto(id) {
    return ProductoDTO.desde(await this.#cargar(id));
  }

  async actualizarStock(id, delta) {
    const producto = await this.#cargar(id);
    producto.ajustarStock(delta);
    await this.productoRepository.guardar(producto);
    if (producto.tieneStockBajo()) await this.#alertar(producto);
    return ProductoDTO.desde(producto);
  }

  async #cargar(id) {
    const producto = await this.productoRepository.obtenerPorId(id);
    if (!producto) throw new NoEncontradoError('Producto no encontrado.');
    return producto;
  }

  async #alertar(producto) {
    try {
      await this.notificador.alertarStockBajo(producto);
    } catch (error) {
      console.error('No se pudo enviar la alerta de stock bajo:', error.message);
    }
  }
}

module.exports = ServicioInventario;
