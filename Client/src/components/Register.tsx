import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from './ui';
import '../styles/Auth.css';

interface RegisterProps {
  onSwitch: () => void;
}

export function Register({ onSwitch }: RegisterProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone: phone || undefined,
      });
      
      setSuccess('¡Registro exitoso!');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre"
            type="text"
            placeholder="Tu nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <Input
            label="Apellido"
            type="text"
            placeholder="Tu apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Teléfono (opcional)"
            type="tel"
            placeholder="+591 12345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={onSwitch} className="switch-button">
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}
