const IProductoRepository = require('../../domain/interfaces/IProductoRepository');
const Producto = require('../../domain/entities/Producto');
const { ConflictoError } = require('../../domain/errors');

const COLUMNAS = 'id, codigo, nombre, precio, stock, stock_minimo, activo';

function aEntidad(fila) {
  return new Producto({
    id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    precio: Number(fila.precio),
    stock: fila.stock,
    stockMinimo: fila.stock_minimo,
    activo: fila.activo,
  });
}

// Implementa IProductoRepository sobre PostgreSQL
class ProductoRepository extends IProductoRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async obtenerPorId(id) {
    const { rows } = await this.pool.query(`SELECT ${COLUMNAS} FROM productos WHERE id = $1`, [id]);
    return rows[0] ? aEntidad(rows[0]) : null;
  }

  async obtenerPorCodigo(codigo) {
    const { rows } = await this.pool.query(`SELECT ${COLUMNAS} FROM productos WHERE codigo = $1`, [codigo]);
    return rows[0] ? aEntidad(rows[0]) : null;
  }

  async obtenerPorIds(ids) {
    if (ids.length === 0) return [];
    const marcadores = ids.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await this.pool.query(`SELECT ${COLUMNAS} FROM productos WHERE id IN (${marcadores})`, ids);
    return rows.map(aEntidad);
  }

  async listar({ busqueda } = {}) {
    if (busqueda) {
      const patron = `%${busqueda}%`;
      const { rows } = await this.pool.query(
        `SELECT ${COLUMNAS} FROM productos WHERE activo AND (nombre ILIKE $1 OR codigo ILIKE $1) ORDER BY nombre`,
        [patron]
      );
      return rows.map(aEntidad);
    }
    const { rows } = await this.pool.query(`SELECT ${COLUMNAS} FROM productos WHERE activo ORDER BY nombre`);
    return rows.map(aEntidad);
  }

  async listarStockBajo() {
    const { rows } = await this.pool.query(
      `SELECT ${COLUMNAS} FROM productos WHERE activo AND stock <= stock_minimo ORDER BY stock, nombre`
    );
    return rows.map(aEntidad);
  }

  async guardar(producto) {
    try {
      if (producto.id === null) {
        const { rows } = await this.pool.query(
          `INSERT INTO productos (codigo, nombre, precio, stock, stock_minimo, activo)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [producto.codigo, producto.nombre, producto.precio, producto.stock, producto.stockMinimo, producto.activo]
        );
        producto.asignarId(rows[0].id);
      } else {
        await this.pool.query(
          `UPDATE productos SET codigo = $1, nombre = $2, precio = $3, stock = $4, stock_minimo = $5, activo = $6
           WHERE id = $7`,
          [producto.codigo, producto.nombre, producto.precio, producto.stock, producto.stockMinimo, producto.activo, producto.id]
        );
      }
      return producto;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictoError(`Ya existe un producto con el código "${producto.codigo}".`);
      }
      throw error;
    }
  }
}

module.exports = ProductoRepository;
