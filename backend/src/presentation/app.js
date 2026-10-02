const express = require('express');
const { requerirSesion, manejarErrores } = require('./middleware');
const authRoutes = require('./auth.routes');
const productosRoutes = require('./productos.routes');
const ventasRoutes = require('./ventas.routes');
const reportesRoutes = require('./reportes.routes');

function crearApp(servicios) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  const sesion = requerirSesion(servicios.servicioAutenticacion);

  app.get('/api/health', (req, res) => res.json({ estado: 'ok' }));
  app.use('/api/auth', authRoutes(servicios));
  app.use('/api/productos', sesion, productosRoutes(servicios));
  app.use('/api/ventas', sesion, ventasRoutes(servicios));
  app.use('/api/reportes', sesion, reportesRoutes(servicios));

  app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
  app.use(manejarErrores);
  return app;
}

module.exports = { crearApp };
