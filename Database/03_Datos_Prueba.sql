-- InventiGest · Paso 3: datos de prueba
-- psql -U postgres -d inventigest -f Database/03_Datos_Prueba.sql
--
-- Usuarios de demostración (solo para desarrollo, cambiar en producción):
--   admin@inventigest.local     / Admin123!      (rol admin)
--   vendedor@inventigest.local  / Vendedor123!   (rol vendedor)
-- Los hashes son bcrypt (costo 10).

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
    ('Ragami Perez',  'admin@inventigest.local',    '$2b$10$xqw0qSW77YBFUpHDx9shcumzEAv4/cU.WEsBjrqP5rme46I8jjs5S', 'admin'),
    ('Vendedor Demo', 'vendedor@inventigest.local', '$2b$10$kjHE.9AGR5jI9K8c4oumjubkElvHDfRpFeLR2g9INKExWaD7.CDh.', 'vendedor');

INSERT INTO productos (codigo, nombre, precio, stock, stock_minimo) VALUES
    ('P-001', 'Teclado mecánico',        45.00,  20, 5),
    ('P-002', 'Mouse inalámbrico',       18.50,  35, 10),
    ('P-003', 'Monitor 24 pulgadas',    180.00,   8, 3),
    ('P-004', 'Cable HDMI 2 m',           6.75, 100, 20),
    ('P-005', 'Memoria USB 64 GB',       12.00,   4, 5);
