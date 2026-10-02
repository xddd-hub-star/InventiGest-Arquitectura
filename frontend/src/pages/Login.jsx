import { useState } from 'react';
import { api } from '../api/cliente.js';

export default function Login({ alIniciar }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      alIniciar(await api.login(email, password));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="tarjeta login" onSubmit={enviar}>
      <h1>InventiGest</h1>
      <label>
        Correo
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Contraseña
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit">Ingresar</button>
    </form>
  );
}
