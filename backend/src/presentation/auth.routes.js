const { Router } = require('express');
const { asyncHandler } = require('./middleware');

function authRoutes({ servicioAutenticacion }) {
  const router = Router();

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      res.json(await servicioAutenticacion.login(req.body));
    })
  );

  return router;
}

module.exports = authRoutes;
