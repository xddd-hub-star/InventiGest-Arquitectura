const { Router } = require('express');
const { asyncHandler, requerirRol } = require('./middleware');

function reportesRoutes({ servicioReportes }) {
  const router = Router();

  router.get(
    '/resumen',
    requerirRol('admin'),
    asyncHandler(async (req, res) => {
      res.json(await servicioReportes.resumen(req.query));
    })
  );

  return router;
}

module.exports = reportesRoutes;
