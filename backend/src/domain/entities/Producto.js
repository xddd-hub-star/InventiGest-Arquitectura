const { ErrorValidacion } = require('../errors');
const ReglasStock = require('../rules/ReglasStock');

// Entidad de dominio: Producto (estado encapsulado, se modifica solo mediante métodos)
class Producto {
  #id;
  #codigo;
  #nombre;
  #precio;
  #stock;
  #stockMinimo;
  #activo;

  constructor({ id = null, codigo, nombre, precio, stock = 0, stockMinimo = 5, activo = true }) {
    this.#id = id;
    this.#codigo = Producto.#validarTexto(codigo, 'El código', 30);
    this.#nombre = Producto.#validarTexto(nombre, 'El nombre', 120);
    this.#precio = Producto.#validarPrecio(precio);
    this.#stock = Producto.#validarEntero(stock, 'El stock');
    this.#stockMinimo = Producto.#validarEntero(stockMinimo, 'El stock mínimo');
    this.#activo = Boolean(activo);
  }

  static #validarTexto(valor, campo, max) {
    const limpio = typeof valor === 'string' ? valor.trim() : '';
    if (!limpio) throw new ErrorValidacion(`${campo} es obligatorio.`);
    if (limpio.length > max) throw new ErrorValidacion(`${campo} no puede superar ${max} caracteres.`);
    return limpio;
  }

  static #validarPrecio(valor) {
    if (typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) {
      throw new ErrorValidacion('El precio debe ser mayor que cero.');
    }
    return valor;
  }

  static #validarEntero(valor, campo) {
    if (!Number.isInteger(valor) || valor < 0) {
      throw new ErrorValidacion(`${campo} debe ser un entero mayor o igual a cero.`);
    }
    return valor;
  }

  get id() { return this.#id; }
  get codigo() { return this.#codigo; }
  get nombre() { return this.#nombre; }
  get precio() { return this.#precio; }
  get stock() { return this.#stock; }
  get stockMinimo() { return this.#stockMinimo; }
  get activo() { return this.#activo; }

  asignarId(id) {
    this.#id = id;
  }

  descontarStock(cantidad) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new ErrorValidacion('La cantidad debe ser un entero mayor que cero.');
    }
    ReglasStock.validarDisponibilidad(this, cantidad);
    this.#stock -= cantidad;
  }

  // delta > 0 repone existencias; delta < 0 las reduce (sin dejar el stock negativo)
  ajustarStock(delta) {
    if (!Number.isInteger(delta) || delta === 0) {
      throw new ErrorValidacion('El ajuste debe ser un entero distinto de cero.');
    }
    if (delta > 0) this.#stock += delta;
    else this.descontarStock(-delta);
  }

  tieneStockBajo() {
    return ReglasStock.esStockBajo(this);
  }
}

module.exports = Producto;
