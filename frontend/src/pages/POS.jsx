import { useEffect, useState } from 'react';
import { api } from '../api/cliente.js';

export default function POS() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [ventas, setVentas] = useState([]);

  const cargar = () => {
    api.productos().then(setProductos).catch((e) => setError(e.message));
    api.ventas().then(setVentas).catch(() => {});
  };
  useEffect(cargar, []);

  const cambiar = (id, cantidad) => {
    const siguiente = { ...carrito };
    if (cantidad > 0) siguiente[id] = cantidad;
    else delete siguiente[id];
    setCarrito(siguiente);
  };

  const items = Object.entries(carrito).map(([id, cantidad]) => ({ productoId: Number(id), cantidad }));
  const subtotal = items.reduce((suma, i) => suma + i.cantidad * productos.find((p) => p.id === i.productoId).precio, 0);

  const vender = async () => {
    setMensaje('');
    setError('');
    try {
      const venta = await api.registrarVenta(items);
      setMensaje(`Venta #${venta.id} registrada. Total: ${venta.total.toFixed(2)} (descuento ${venta.descuento.toFixed(2)}).`);
      setCarrito({});
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h2>Punto de venta</h2>
      {mensaje && <p className="ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Disponible</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.precio.toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={carrito[p.id] ?? ''}
                  onChange={(e) => cambiar(p.id, Number(e.target.value))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Subtotal: <strong>{subtotal.toFixed(2)}</strong> (el descuento por volumen lo calcula el servidor)
      </p>
      <button disabled={items.length === 0} onClick={vender}>
        Registrar venta
      </button>

      <h3>Ventas recientes</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Vendedor</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {ventas.slice(0, 10).map((v) => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{new Date(v.fecha).toLocaleString()}</td>
              <td>{v.vendedor}</td>
              <td>{v.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
