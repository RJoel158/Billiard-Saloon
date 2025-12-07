import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import '../styles/Auth.css';

interface ChangePasswordProps {
  email: string;
  temporaryPassword: string;
  onSuccess: () => void;
}

export function ChangePassword({ email, temporaryPassword, onSuccess }: ChangePasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/change-temporary-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          temporaryPassword,
          newPassword,
          confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al cambiar la contraseña');
        return;
      }

      setSuccess('¡Contraseña actualizada exitosamente!');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Cambiar Contraseña</h2>
        <p className="auth-subtitle">
          Esta es tu primera vez iniciando sesión. Por favor, establece una nueva contraseña para tu cuenta.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
