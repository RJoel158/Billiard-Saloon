import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

interface LoginProps {
  onSwitch: () => void;
  onForgotPassword?: () => void;
  onLoginSuccess?: (
    email: string,
    password: string,
    requiresPasswordChange: boolean,
    token?: string,
    user?: any
  ) => void;
}

export function Login({
  onSwitch,
  onForgotPassword,
  onLoginSuccess,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al iniciar sesión");
        return;
      }

      console.log("Login exitoso:", data);
      console.log("requiresPasswordChange:", data.requiresPasswordChange);
      console.log("password_changed:", data.user.password_changed);

      // Solo guardar el token si NO requiere cambio de contraseña
      if (!data.requiresPasswordChange && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Llamar callback si existe
      if (onLoginSuccess) {
        onLoginSuccess(email, password, data.requiresPasswordChange, data.token, data.user);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="auth-links">
          <p className="auth-switch">
            ¿Olvidaste tu contraseña?{" "}
            <button
              type="button"
              onClick={onForgotPassword}
              className="switch-button"
            >
              Recupérala aquí
            </button>
          </p>

          <p className="auth-switch">
            ¿No tienes cuenta?{" "}
            <button type="button" onClick={onSwitch} className="switch-button">
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
