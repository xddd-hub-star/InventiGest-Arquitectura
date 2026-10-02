const ProductoRepository = require('./infrastructure/repositories/ProductoRepository');
const VentaRepository = require('./infrastructure/repositories/VentaRepository');
const UsuarioRepository = require('./infrastructure/repositories/UsuarioRepository');
const AuthService = require('./infrastructure/services/AuthService');
const Notificador = require('./infrastructure/services/Notificador');
const ServicioAutenticacion = require('./application/services/ServicioAutenticacion');
const ServicioInventario = require('./application/services/ServicioInventario');
const ServicioVenta = require('./application/services/ServicioVenta');
const ServicioReportes = require('./application/services/ServicioReportes');

// Único lugar donde se conectan las implementaciones de Infraestructura con los contratos (inyección de dependencias)
function crearServicios({ pool, jwtSecret, notificador = new Notificador() }) {
  const productoRepository = new ProductoRepository(pool);
  const ventaRepository = new VentaRepository(pool);
  const usuarioRepository = new UsuarioRepository(pool);
  const autenticador = new AuthService({ secreto: jwtSecret });

  return {
    servicioAutenticacion: new ServicioAutenticacion({ usuarioRepository, autenticador }),
    servicioInventario: new ServicioInventario({ productoRepository, notificador }),
    servicioVenta: new ServicioVenta({ ventaRepository, productoRepository, notificador }),
    servicioReportes: new ServicioReportes({ ventaRepository, productoRepository }),
  };
}

module.exports = { crearServicios };
