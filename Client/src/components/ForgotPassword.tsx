import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import '../styles/Auth.css';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor ingresa tu email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
      }

      if (!response.ok) {
        setError(data.message || `Error: ${data.error || 'Error al solicitar restablecimiento'}`);
        console.error('Error response:', data);
        return;
      }

      setSuccess('Se ha enviado un código de verificación a tu correo');
      setTimeout(() => {
        setStep('code');
        setSuccess('');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      setError(errorMessage);
      console.error('Request reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetCode) {
      setError('Por favor ingresa el código de verificación');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: resetCode }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        console.error('Response status:', response.status);
        throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
      }

      if (!response.ok) {
        setError(data.message || `Error: ${data.error || 'Código inválido o expirado'}`);
        console.error('Error response:', data);
        return;
      }

      setSuccess('Código verificado correctamente');
      setTimeout(() => {
        setStep('password');
        setSuccess('');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      setError(errorMessage);
      console.error('Verify code error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Por favor completa todos los campos');
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
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: resetCode, newPassword, confirmPassword }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        throw new Error(`Error del servidor (${response.status}). Por favor intenta de nuevo.`);
      }

      if (!response.ok) {
        setError(data.message || `Error: ${data.error || 'Error al restablecer contraseña'}`);
        console.error('Error response:', data);
        return;
      }

      setSuccess('¡Contraseña restablecida exitosamente!');
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      setError(errorMessage);
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Recuperar Contraseña</h2>

        {/* Paso 1: Solicitar código */}
        {step === 'email' && (
          <form onSubmit={handleRequestReset}>
            <p className="auth-subtitle">
              Ingresa tu email y te enviaremos un código para restablecer tu contraseña.
            </p>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>

            <p className="auth-switch">
              <button type="button" onClick={onBack} className="switch-button">
                Volver al login
              </button>
            </p>
          </form>
        )}

        {/* Paso 2: Verificar código */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode}>
            <p className="auth-subtitle">
              Ingresa el código que hemos enviado a {email}
            </p>
            <div className="form-group">
              <label htmlFor="resetCode">Código de Verificación</label>
              <input
                id="resetCode"
                type="text"
                placeholder="Ej: ABC123XYZ"
                value={resetCode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setResetCode(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>

            <p className="auth-switch">
              <button 
                type="button" 
                onClick={() => setStep('email')} 
                className="switch-button"
              >
                Cambiar email
              </button>
            </p>
          </form>
        )}

        {/* Paso 3: Nueva contraseña */}
        {step === 'password' && (
          <form onSubmit={handleResetPassword}>
            <p className="auth-subtitle">
              Ingresa tu nueva contraseña
            </p>
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
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>

            <p className="auth-switch">
              <button 
                type="button" 
                onClick={() => setStep('code')} 
                className="switch-button"
              >
                Cambiar código
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
