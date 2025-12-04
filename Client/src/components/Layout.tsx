import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>🎱 Billar Saloon</h1>
        </div>
        <div className="navbar-menu">
          <span className="navbar-user">
            {user?.first_name} {user?.last_name}
            {isAdmin && <span className="badge">Admin</span>}
          </span>
          <Button variant="secondary" size="sm" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </nav>
      <div className="layout-content">{children}</div>
    </div>
  );
}
