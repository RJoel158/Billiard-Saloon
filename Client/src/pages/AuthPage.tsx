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

  const handleLoginSuccess = (email: string, password: string, needsPasswordChange: boolean) => {
    setUserEmail(email);
    setUserPassword(password);
    if (needsPasswordChange) {
      setAuthView('changePassword');
      setRequiresPasswordChange(true);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setRequiresPasswordChange(false);
    setUserEmail(null);
    setUserPassword(null);
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
