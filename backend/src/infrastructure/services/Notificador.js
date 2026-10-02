const INotificacionService = require('../../domain/interfaces/INotificacionService');

// Implementa INotificacionService. En este avance la alerta se registra en la consola del servidor;
// reemplazar por un envío SMTP no requiere tocar Dominio ni Aplicación (DIP).
class Notificador extends INotificacionService {
  async alertarStockBajo(producto) {
    console.warn(
      `[ALERTA] Stock bajo: ${producto.nombre} (${producto.codigo}) tiene ${producto.stock} unidades, mínimo ${producto.stockMinimo}.`
    );
  }
}

module.exports = Notificador;
