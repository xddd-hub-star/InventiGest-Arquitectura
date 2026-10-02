import { useEffect, useState } from 'react';
import { api } from '../api/cliente.js';

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.resumen().then(setResumen).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!resumen) return <p>Cargando…</p>;

  return (
    <section>
      <h2>Reportes</h2>
      <div className="indicadores">
        <div className="tarjeta">
          <span>Ventas</span>
          <strong>{resumen.cantidadVentas}</strong>
        </div>
        <div className="tarjeta">
          <span>Total vendido</span>
          <strong>{resumen.totalVendido.toFixed(2)}</strong>
        </div>
        <div className="tarjeta">
          <span>Descuentos otorgados</span>
          <strong>{resumen.totalDescuentos.toFixed(2)}</strong>
        </div>
      </div>
      <h3>Productos con stock bajo</h3>
      {resumen.productosStockBajo.length === 0 ? (
        <p>Ninguno.</p>
      ) : (
        <ul>
          {resumen.productosStockBajo.map((p) => (
            <li key={p.id}>
              {p.nombre}: {p.stock} (mínimo {p.stockMinimo})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
