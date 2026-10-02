const { StockInsuficienteError } = require('../errors');

// Regla de negocio: disponibilidad y stock mínimo
class ReglasStock {
  static hayDisponibilidad(producto, cantidad) {
    return producto.stock >= cantidad;
  }

  static validarDisponibilidad(producto, cantidad) {
    if (!ReglasStock.hayDisponibilidad(producto, cantidad)) {
      throw new StockInsuficienteError(
        `Stock insuficiente para "${producto.nombre}": disponible ${producto.stock}, solicitado ${cantidad}.`
      );
    }
  }

  static esStockBajo(producto) {
    return producto.stock <= producto.stockMinimo;
  }
}

module.exports = ReglasStock;
