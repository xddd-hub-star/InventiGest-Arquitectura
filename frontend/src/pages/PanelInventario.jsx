import { useEffect, useState } from 'react';
import { api } from '../api/cliente.js';

const VACIO = { codigo: '', nombre: '', precio: '', stock: '0', stockMinimo: '5' };

export default function PanelInventario({ esAdmin }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [form, setForm] = useState(VACIO);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargar = () => api.productos(busqueda).then(setProductos).catch((e) => setError(e.message));
  useEffect(() => {
    cargar();
  }, [busqueda]);

  const avisar = (texto, esError = false) => {
    setMensaje(esError ? '' : texto);
    setError(esError ? texto : '');
  };

  const crear = async (e) => {
    e.preventDefault();
    try {
      await api.crearProducto({
        codigo: form.codigo,
        nombre: form.nombre,
        precio: Number(form.precio),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
      });
      setForm(VACIO);
      avisar('Producto registrado.');
      cargar();
    } catch (err) {
      avisar(err.message, true);
    }
  };

  const ajustar = async (id) => {
    const texto = window.prompt('Ajuste de stock (positivo repone, negativo reduce):', '1');
    if (texto === null) return;
    try {
      await api.ajustarStock(id, Number(texto));
      avisar('Stock actualizado.');
      cargar();
    } catch (err) {
      avisar(err.message, true);
    }
  };

  return (
    <section>
      <h2>Inventario</h2>
      <input placeholder="Buscar por nombre o código" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      {mensaje && <p className="ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            {esAdmin && <th />}
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id} className={p.stockBajo ? 'alerta' : ''}>
              <td>{p.codigo}</td>
              <td>{p.nombre}</td>
              <td>{p.precio.toFixed(2)}</td>
              <td>
                {p.stock} {p.stockBajo && <strong>(bajo)</strong>}
              </td>
              {esAdmin && (
                <td>
                  <button onClick={() => ajustar(p.id)}>Ajustar stock</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {esAdmin && (
        <form className="tarjeta" onSubmit={crear}>
          <h3>Registrar producto</h3>
          {['codigo', 'nombre', 'precio', 'stock', 'stockMinimo'].map((campo) => (
            <label key={campo}>
              {campo}
              <input value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} required />
            </label>
          ))}
          <button type="submit">Guardar</button>
        </form>
      )}
    </section>
  );
}
