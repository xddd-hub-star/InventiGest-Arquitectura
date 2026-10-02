const { Router } = require('express');
const { asyncHandler } = require('./middleware');
const { ErrorValidacion } = require('../domain/errors');

// Rutas y controllers de Express (Presentación del backend): sin SQL ni reglas de negocio
function ventasRoutes({ servicioVenta }) {
  const router = Router();

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      res.status(201).json(await servicioVenta.registrarVenta(req.usuario.id, req.body));
    })
  );

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json(await servicioVenta.consultarVentas(req.query));
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) throw new ErrorValidacion('El identificador no es válido.');
      res.json(await servicioVenta.obtenerVenta(id));
    })
  );

  return router;
}

module.exports = ventasRoutes;
