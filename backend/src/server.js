const { crearPool } = require('./infrastructure/database/connection');
const { crearServicios } = require('./compositionRoot');
const { crearApp } = require('./presentation/app');

const puerto = Number(process.env.PORT) || 3000;
const pool = crearPool();
const app = crearApp(crearServicios({ pool, jwtSecret: process.env.JWT_SECRET }));

app.listen(puerto, () => console.log(`InventiGest API escuchando en http://localhost:${puerto}`));
