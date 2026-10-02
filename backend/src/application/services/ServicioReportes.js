const ReglasVenta = require('../../domain/rules/ReglasVenta');
const ProductoDTO = require('../dtos/ProductoDTO');
const FiltroFechasDTO = require('../dtos/FiltroFechasDTO');

// Orquesta la generación de reportes
class ServicioReportes {
  constructor({ ventaRepository, productoRepository }) {
    this.ventaRepository = ventaRepository;
    this.productoRepository = productoRepository;
  }

  async resumen(consulta = {}) {
    const ventas = await this.ventaRepository.listar(FiltroFechasDTO.desde(consulta));
    const stockBajo = await this.productoRepository.listarStockBajo();
    return {
      cantidadVentas: ventas.length,
      totalVendido: ReglasVenta.redondear(ventas.reduce((suma, v) => suma + v.total, 0)),
      totalDescuentos: ReglasVenta.redondear(ventas.reduce((suma, v) => suma + v.descuento, 0)),
      productosStockBajo: stockBajo.map(ProductoDTO.desde),
    };
  }
}

module.exports = ServicioReportes;
