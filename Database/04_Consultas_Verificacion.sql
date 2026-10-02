-- InventiGest · Paso 4: consultas para verificar la base de datos

-- Productos con stock por debajo del mínimo
SELECT codigo, nombre, stock, stock_minimo
FROM productos
WHERE stock <= stock_minimo AND activo
ORDER BY stock;

-- Ventas con su vendedor
SELECT v.id, v.fecha, u.nombre AS vendedor, v.subtotal, v.descuento, v.total
FROM ventas v
JOIN usuarios u ON u.id = v.usuario_id
ORDER BY v.fecha DESC;

-- Detalle de cada venta
SELECT d.venta_id, p.codigo, p.nombre, d.cantidad, d.precio_unitario, d.subtotal
FROM detalle_venta d
JOIN productos p ON p.id = d.producto_id
ORDER BY d.venta_id, d.id;

-- Coherencia: el total de cada venta debe ser subtotal - descuento (no debe devolver filas)
SELECT id FROM ventas WHERE total <> subtotal - descuento;
