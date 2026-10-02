const { Router } = require('express');
const { asyncHandler, requerirRol } = require('./middleware');
const { ErrorValidacion } = require('../domain/errors');

function leerId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorValidacion('El identificador no es válido.');
  return id;
}

function productosRoutes({ servicioInventario }) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json(await servicioInventario.consultarProductos({ busqueda: req.query.busqueda }));
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      res.json(await servicioInventario.obtenerProducto(leerId(req.params.id)));
    })
  );

  router.post(
    '/',
    requerirRol('admin'),
    asyncHandler(async (req, res) => {
      res.status(201).json(await servicioInventario.registrarProducto(req.body));
    })
  );

  router.patch(
    '/:id/stock',
    requerirRol('admin'),
    asyncHandler(async (req, res) => {
      res.json(await servicioInventario.actualizarStock(leerId(req.params.id), req.body?.delta));
    })
  );

  return router;
}

module.exports = productosRoutes;
