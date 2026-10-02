const { ErrorValidacion } = require('../../domain/errors');

function fechaValida(valor, campo) {
  if (valor === undefined || valor === '') return undefined;
  if (typeof valor !== 'string' || Number.isNaN(Date.parse(valor))) {
    throw new ErrorValidacion(`La fecha "${campo}" no es válida (use AAAA-MM-DD).`);
  }
  return valor;
}

// DTO de entrada: rango de fechas opcional para consultas (desde inclusivo, hasta exclusivo)
class FiltroFechasDTO {
  static desde(consulta = {}) {
    return { desde: fechaValida(consulta.desde, 'desde'), hasta: fechaValida(consulta.hasta, 'hasta') };
  }
}

module.exports = FiltroFechasDTO;
