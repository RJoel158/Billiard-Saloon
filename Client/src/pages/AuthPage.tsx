import { useState } from 'react';
import { Login } from '../components/Login';
import { Register } from '../components/Register';
import { ChangePassword } from '../components/ChangePassword';
import { ForgotPassword } from '../components/ForgotPassword';

export function AuthPage() {
  const [authView, setAuthView] = useState<'login' | 'register' | 'changePassword' | 'forgotPassword'>('login');
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPassword, setUserPassword] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const handleLoginSuccess = (email: string, password: string, needsPasswordChange: boolean, token?: string, user?: any) => {
    setUserEmail(email);
    setUserPassword(password);
    if (token) setUserToken(token);
    if (user) setUserData(user);
    if (needsPasswordChange) {
      setAuthView('changePassword');
      setRequiresPasswordChange(true);
    }
  };

  const handlePasswordChangeSuccess = () => {
    // Guardar token después de cambiar contraseña
    if (userToken) {
      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));
    }
    setRequiresPasswordChange(false);
    setUserEmail(null);
    setUserPassword(null);
    setUserToken(null);
    setUserData(null);
    setAuthView('login');
    console.log('Contraseña cambiada exitosamente. Redirigiendo...');
  };

  const handleForgotPasswordBack = () => {
    setAuthView('login');
  };

  return (
    <div className="auth-page">
      {authView === 'login' && (
        <Login 
          onSwitch={() => setAuthView('register')} 
          onForgotPassword={() => setAuthView('forgotPassword')}
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      {authView === 'register' && (
        <Register onSwitch={() => setAuthView('login')} />
      )}

      {authView === 'changePassword' && requiresPasswordChange && userEmail && userPassword && (
        <ChangePassword 
          email={userEmail} 
          temporaryPassword={userPassword} 
          onSuccess={handlePasswordChangeSuccess} 
        />
      )}

      {authView === 'forgotPassword' && (
        <ForgotPassword onBack={handleForgotPasswordBack} />
      )}
    </div>
  );
}
