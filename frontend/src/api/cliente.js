// Único punto de comunicación del frontend con la API REST
const CLAVE = 'inventigest.sesion';

export function leerSesion() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

export function guardarSesion(sesion) {
  if (sesion) sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
  else sessionStorage.removeItem(CLAVE);
}

async function llamar(metodo, ruta, cuerpo) {
  const sesion = leerSesion();
  const respuesta = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {}),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    if (respuesta.status === 401 && sesion) {
      guardarSesion(null);
      window.location.reload();
    }
    throw new Error(datos.error || 'Error inesperado.');
  }
  return datos;
}

export const api = {
  login: (email, password) => llamar('POST', '/auth/login', { email, password }),
  productos: (busqueda = '') => llamar('GET', `/productos?busqueda=${encodeURIComponent(busqueda)}`),
  crearProducto: (producto) => llamar('POST', '/productos', producto),
  ajustarStock: (id, delta) => llamar('PATCH', `/productos/${id}/stock`, { delta }),
  registrarVenta: (items) => llamar('POST', '/ventas', { items }),
  ventas: () => llamar('GET', '/ventas'),
  resumen: () => llamar('GET', '/reportes/resumen'),
};
