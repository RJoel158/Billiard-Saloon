import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from './ui';
import '../styles/Auth.css';

interface LoginProps {
  onSwitch: () => void;
}

export function Login({ onSwitch }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Cargando...' : 'Entrar'}
          </Button>
        </form>

        <p className="auth-switch">
          ¿No tienes cuenta?{' '}
          <button type="button" onClick={onSwitch} className="switch-button">
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}
