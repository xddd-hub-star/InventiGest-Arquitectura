const { Venta } = require('../../domain/entities/Venta');
const ReglasVenta = require('../../domain/rules/ReglasVenta');
const { NoEncontradoError } = require('../../domain/errors');
const RegistrarVentaDTO = require('../dtos/RegistrarVentaDTO');
const VentaDTO = require('../dtos/VentaDTO');
const FiltroFechasDTO = require('../dtos/FiltroFechasDTO');

// Orquesta los casos de uso Registrar Venta y Consultar Ventas
class ServicioVenta {
  constructor({ ventaRepository, productoRepository, notificador }) {
    this.ventaRepository = ventaRepository;
    this.productoRepository = productoRepository;
    this.notificador = notificador;
  }

  async registrarVenta(usuarioId, cuerpo) {
    const { items } = RegistrarVentaDTO.desde(cuerpo);
    const consolidados = ReglasVenta.consolidarItems(items);

    const productos = await this.productoRepository.obtenerPorIds(consolidados.map((i) => i.productoId));
    const lineas = consolidados.map(({ productoId, cantidad }) => {
      const producto = productos.find((p) => p.id === productoId && p.activo);
      if (!producto) throw new NoEncontradoError(`El producto ${productoId} no existe o está inactivo.`);
      return { producto, cantidad };
    });

    const venta = Venta.crear(usuarioId, lineas);
    const { id } = await this.ventaRepository.registrar(venta);

    for (const { producto } of lineas) {
      if (producto.tieneStockBajo()) await this.#alertar(producto);
    }
    return VentaDTO.desde(await this.ventaRepository.obtenerPorId(id));
  }

  async consultarVentas(consulta = {}) {
    const ventas = await this.ventaRepository.listar(FiltroFechasDTO.desde(consulta));
    return ventas.map(VentaDTO.desde);
  }

  async obtenerVenta(id) {
    const venta = await this.ventaRepository.obtenerPorId(id);
    if (!venta) throw new NoEncontradoError('Venta no encontrada.');
    return VentaDTO.desde(venta);
  }

  async #alertar(producto) {
    try {
      await this.notificador.alertarStockBajo(producto);
    } catch (error) {
      console.error('No se pudo enviar la alerta de stock bajo:', error.message);
    }
  }
}

module.exports = ServicioVenta;
