class ErrorDominio extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = this.constructor.name;
  }
}

class ErrorValidacion extends ErrorDominio {}
class NoEncontradoError extends ErrorDominio {}
class StockInsuficienteError extends ErrorDominio {}
class ConflictoError extends ErrorDominio {}
class CredencialesInvalidasError extends ErrorDominio {}

module.exports = {
  ErrorDominio,
  ErrorValidacion,
  NoEncontradoError,
  StockInsuficienteError,
  ConflictoError,
  CredencialesInvalidasError,
};
