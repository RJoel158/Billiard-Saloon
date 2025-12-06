import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dashboard } from './Dashboard';
import { ReservationsManagement } from './ReservationsManagement';
import { ActiveSessions } from './ActiveSessions';
import { Reports } from './Reports';
import { TestPanel } from '../components/TestPanel';
import './MainLayout.css';

type Page = 'dashboard' | 'reservations' | 'sessions' | 'reports' | 'test';

export function MainLayout() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'reservations':
        return <ReservationsManagement />;
      case 'sessions':
        return <ActiveSessions />;
      case 'reports':
        return <Reports />;
      case 'test':
        return <TestPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎱</span>
            {sidebarOpen && <span className="logo-text">Billiard Saloon</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </button>

          <button
            className={`nav-item ${activePage === 'reservations' ? 'active' : ''}`}
            onClick={() => setActivePage('reservations')}
          >
            <span className="nav-icon">📅</span>
            {sidebarOpen && <span className="nav-text">Reservas</span>}
          </button>

          <button
            className={`nav-item ${activePage === 'sessions' ? 'active' : ''}`}
            onClick={() => setActivePage('sessions')}
          >
            <span className="nav-icon">⏱️</span>
            {sidebarOpen && <span className="nav-text">Sesiones Activas</span>}
          </button>

          <button
            className={`nav-item ${activePage === 'reports' ? 'active' : ''}`}
            onClick={() => setActivePage('reports')}
          >
            <span className="nav-icon">📈</span>
            {sidebarOpen && <span className="nav-text">Reportes</span>}
          </button>

          <div className="nav-divider"></div>

          <button
            className={`nav-item ${activePage === 'test' ? 'active' : ''}`}
            onClick={() => setActivePage('test')}
          >
            <span className="nav-icon">🧪</span>
            {sidebarOpen && <span className="nav-text">Panel de Pruebas</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="user-role">{user?.role_name || 'Usuario'}</p>
              </div>
            )}
          </div>
          <button className="btn-logout" onClick={logout}>
            <span className="logout-icon">🚪</span>
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
