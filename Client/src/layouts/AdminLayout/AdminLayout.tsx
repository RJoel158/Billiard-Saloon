import type { ReactNode } from 'react';
import { LayoutDashboard, Table2, Clock, CreditCard, Calendar, TrendingUp, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export type AdminViewType = 'dashboard' | 'mesas' | 'sesiones' | 'pagos' | 'reservas' | 'ganancias';

interface AdminLayoutProps {
  children: ReactNode;
  currentView: AdminViewType;
  onViewChange: (view: AdminViewType) => void;
}

const menuItems = [
  { id: 'dashboard' as AdminViewType, label: 'Dashboard', icon: LayoutDashboard, employeeAccess: true },
  { id: 'mesas' as AdminViewType, label: 'Mesas', icon: Table2, employeeAccess: true },
  { id: 'sesiones' as AdminViewType, label: 'Sesiones', icon: Clock, employeeAccess: true },
  { id: 'pagos' as AdminViewType, label: 'Pagos', icon: CreditCard, employeeAccess: true },
  { id: 'reservas' as AdminViewType, label: 'Reservas', icon: Calendar, employeeAccess: true },
  { id: 'ganancias' as AdminViewType, label: 'Ganancias', icon: TrendingUp, employeeAccess: false },
];

export function AdminLayout({ children, currentView, onViewChange }: AdminLayoutProps) {
  const { user, logout, isEmployee } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filtrar items del menú según el tipo de usuario
  const availableMenuItems = isEmployee 
    ? menuItems.filter(item => item.employeeAccess)
    : menuItems;

  return (
    <div className="admin-layout">
      {/* Sidebar Desktop */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-container">
            <div className="brand-icon">
              <Table2 size={28} />
            </div>
            <div>
              <h1 className="brand-title">Billar System</h1>
              {isEmployee && (
                <span className="badge bg-warning text-dark badge-sm">Empleado</span>
              )}
              {!isEmployee && (
                <span className="badge bg-success badge-sm">Administrador</span>
              )}
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <small className="nav-section-title">MENÚ PRINCIPAL</small>
            {availableMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {currentView === item.id && <div className="nav-indicator" />}
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* User Profile */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <p className="user-name">{user?.first_name} {user?.last_name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-logout">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
          <p className="version-text">Sistema de Gestión v1.0</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="btn-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="d-flex align-items-center gap-2">
          <Table2 size={24} className="text-primary" />
          <h1 className="mobile-title">Billar System</h1>
        </div>
        <div className="user-avatar-mobile">
          <User size={20} />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          <aside className="sidebar sidebar-mobile">
            <div className="sidebar-header">
              <div className="brand-container">
                <div className="brand-icon">
                  <Table2 size={28} />
                </div>
                <div>
                  <h1 className="brand-title">Billar System</h1>
                  {isEmployee && (
                    <span className="badge bg-warning text-dark badge-sm">Empleado</span>
                  )}
                  {!isEmployee && (
                    <span className="badge bg-success badge-sm">Administrador</span>
                  )}
                </div>
              </div>
            </div>
            
            <nav className="sidebar-nav">
              <div className="nav-section">
                <small className="nav-section-title">MENÚ PRINCIPAL</small>
                {availableMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                      {currentView === item.id && <div className="nav-indicator" />}
                    </button>
                  );
                })}
              </div>
            </nav>
            
            <div className="sidebar-footer">
              <div className="user-profile">
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <div className="user-info">
                  <p className="user-name">{user?.first_name} {user?.last_name}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
              </div>
              <button onClick={logout} className="btn-logout">
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Estilos */}
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f0f2f5;
        }

        /* Sidebar Desktop */
        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #1a1d29 0%, #2d3142 100%);
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 1000;
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .brand-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          margin: 0 0 0.25rem 0;
          letter-spacing: -0.5px;
        }

        .badge-sm {
          font-size: 0.65rem;
          padding: 0.25rem 0.5rem;
          font-weight: 600;
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          overflow-y: auto;
        }

        .nav-section {
          margin-bottom: 2rem;
        }

        .nav-section-title {
          display: block;
          padding: 0 1rem 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 1rem;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          border-radius: 10px;
          margin-bottom: 0.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateX(4px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          font-weight: 600;
        }

        .nav-indicator {
          position: absolute;
          right: 1rem;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
        }

        /* Sidebar Footer */
        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .user-avatar {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .user-avatar-mobile {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-logout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .btn-logout:hover {
          background: rgba(220, 53, 69, 0.2);
          border-color: rgba(220, 53, 69, 0.4);
          color: #ff6b6b;
        }

        .version-text {
          margin-top: 1rem;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.3);
          text-align: center;
          margin-bottom: 0;
        }

        /* Mobile Header */
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          border-bottom: 1px solid #e0e0e0;
          padding: 0 1rem;
          align-items: center;
          justify-content: space-between;
          z-index: 999;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .btn-menu {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: #333;
        }

        .mobile-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        /* Mobile Sidebar */
        .sidebar-mobile {
          display: none;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1001;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 280px;
          min-height: 100vh;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }

          .mobile-header {
            display: flex;
          }

          .sidebar-overlay {
            display: block;
          }

          .sidebar-mobile {
            display: flex;
            width: 280px;
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 1002;
          }

          .main-content {
            margin-left: 0;
            padding-top: 60px;
          }
        }

        /* Scrollbar personalizado */
        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
