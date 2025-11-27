import { useState } from 'react';
import { Login } from '../components/Login';
import { Register } from '../components/Register';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuth = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-page">
      {isLogin ? (
        <Login onSwitch={toggleAuth} />
      ) : (
        <Register onSwitch={toggleAuth} />
      )}
    </div>
  );
}
