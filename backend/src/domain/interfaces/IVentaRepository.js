// Contrato: registrar la venta de forma transaccional y consultarla
class IVentaRepository {
  // Guarda la venta, sus detalles y descuenta el stock en una sola transacción
  async registrar(venta) { throw new Error('No implementado'); }
  async obtenerPorId(id) { throw new Error('No implementado'); }
  async listar(filtro) { throw new Error('No implementado'); }
}

module.exports = IVentaRepository;
