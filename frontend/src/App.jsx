import { useState } from 'react';
import { leerSesion, guardarSesion } from './api/cliente.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PanelInventario from './pages/PanelInventario.jsx';
import POS from './pages/POS.jsx';

export default function App() {
  const [sesion, setSesion] = useState(leerSesion());
  const [pagina, setPagina] = useState('pos');

  if (!sesion) {
    return (
      <Login
        alIniciar={(s) => {
          guardarSesion(s);
          setSesion(s);
        }}
      />
    );
  }

  const esAdmin = sesion.usuario.rol === 'admin';
  const paginas = [
    { id: 'pos', titulo: 'Punto de venta' },
    { id: 'inventario', titulo: 'Inventario' },
    ...(esAdmin ? [{ id: 'dashboard', titulo: 'Reportes' }] : []),
  ];

  const salir = () => {
    guardarSesion(null);
    setSesion(null);
  };

  return (
    <div className="app">
      <header>
        <h1>InventiGest</h1>
        <nav>
          {paginas.map((p) => (
            <button key={p.id} className={p.id === pagina ? 'activo' : ''} onClick={() => setPagina(p.id)}>
              {p.titulo}
            </button>
          ))}
        </nav>
        <span className="usuario">
          {sesion.usuario.nombre} ({sesion.usuario.rol}) <button onClick={salir}>Salir</button>
        </span>
      </header>
      <main>
        {pagina === 'pos' && <POS />}
        {pagina === 'inventario' && <PanelInventario esAdmin={esAdmin} />}
        {pagina === 'dashboard' && esAdmin && <Dashboard />}
      </main>
    </div>
  );
}
