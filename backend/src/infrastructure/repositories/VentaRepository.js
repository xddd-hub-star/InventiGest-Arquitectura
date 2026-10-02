const IVentaRepository = require('../../domain/interfaces/IVentaRepository');
const { Venta, DetalleVenta } = require('../../domain/entities/Venta');
const { StockInsuficienteError } = require('../../domain/errors');

function aVenta(fila, detalles = []) {
  return new Venta({
    id: fila.id,
    usuarioId: fila.usuario_id,
    vendedor: fila.vendedor,
    fecha: fila.fecha,
    detalles,
    subtotal: Number(fila.subtotal),
    descuento: Number(fila.descuento),
    total: Number(fila.total),
  });
}

function aDetalle(fila) {
  return new DetalleVenta({
    productoId: fila.producto_id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    cantidad: fila.cantidad,
    precioUnitario: Number(fila.precio_unitario),
  });
}

const SELECT_VENTA = `SELECT v.id, v.usuario_id, u.nombre AS vendedor, v.fecha, v.subtotal, v.descuento, v.total
                      FROM ventas v JOIN usuarios u ON u.id = v.usuario_id`;

// Implementa IVentaRepository sobre PostgreSQL
class VentaRepository extends IVentaRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async registrar(venta) {
    const cliente = await this.pool.connect();
    try {
      await cliente.query('BEGIN');
      const { rows } = await cliente.query(
        `INSERT INTO ventas (usuario_id, subtotal, descuento, total) VALUES ($1, $2, $3, $4) RETURNING id, fecha`,
        [venta.usuarioId, venta.subtotal, venta.descuento, venta.total]
      );
      venta.id = rows[0].id;
      venta.fecha = rows[0].fecha;

      for (const d of venta.detalles) {
        // El descuento es condicional: si otra venta se llevó el stock mientras tanto, no se actualiza ninguna fila
        const resultado = await cliente.query(
          'UPDATE productos SET stock = stock - $1::int WHERE id = $2::int AND stock >= $1::int',
          [d.cantidad, d.productoId]
        );
        if (resultado.rowCount === 0) {
          throw new StockInsuficienteError(`Stock insuficiente para "${d.nombre}".`);
        }
        await cliente.query(
          `INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [venta.id, d.productoId, d.cantidad, d.precioUnitario, d.subtotal]
        );
      }
      await cliente.query('COMMIT');
      return venta;
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  async obtenerPorId(id) {
    const { rows } = await this.pool.query(`${SELECT_VENTA} WHERE v.id = $1`, [id]);
    if (!rows[0]) return null;
    const detalles = await this.pool.query(
      `SELECT d.producto_id, p.codigo, p.nombre, d.cantidad, d.precio_unitario
       FROM detalle_venta d JOIN productos p ON p.id = d.producto_id
       WHERE d.venta_id = $1 ORDER BY d.id`,
      [id]
    );
    return aVenta(rows[0], detalles.rows.map(aDetalle));
  }

  async listar({ desde, hasta } = {}) {
    const condiciones = [];
    const valores = [];
    if (desde) {
      valores.push(desde);
      condiciones.push(`v.fecha >= $${valores.length}`);
    }
    if (hasta) {
      valores.push(hasta);
      condiciones.push(`v.fecha < $${valores.length}`);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const { rows } = await this.pool.query(`${SELECT_VENTA} ${where} ORDER BY v.fecha DESC, v.id DESC`, valores);
    return rows.map((fila) => aVenta(fila));
  }
}

module.exports = VentaRepository;
