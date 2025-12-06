import { useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout, type AdminViewType } from './layouts/AdminLayout';
import { ClientLayout, type ClientViewType } from './layouts/ClientLayout';
import { AdminDashboard } from './components/Admin/Dashboard';
import { Tables } from './components/Admin/Tables';
import { Sessions } from './components/Admin/Sessions';
import { Payments } from './components/Admin/Payments';
import { Reservations } from './components/Admin/Reservations';
import { Revenue } from './components/Admin/Revenue';
import { ClientInicio } from './components/Client/Inicio';
import { ClientReservas } from './components/Client/Reservas';
import { ClientHistorial } from './components/Client/Historial';
import { ClientPerfil } from './components/Client/Perfil';
import './App.css';

function AdminApp() {
  const [currentView, setCurrentView] = useState<AdminViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'mesas':
        return <Tables />;
      case 'sesiones':
        return <Sessions />;
      case 'pagos':
        return <Payments />;
      case 'reservas':
        return <Reservations />;
      case 'ganancias':
        return <Revenue />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </AdminLayout>
  );
}

function ClientApp() {
  const [currentView, setCurrentView] = useState<ClientViewType>('inicio');

  const renderView = () => {
    switch (currentView) {
      case 'inicio':
        return <ClientInicio />;
      case 'reservas':
        return <ClientReservas />;
      case 'historial':
        return <ClientHistorial />;
      case 'perfil':
        return <ClientPerfil />;
      default:
        return <ClientInicio />;
    }
  };

  return (
    <ClientLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </ClientLayout>
  );
}

function AppContent() {
  const { isAuthenticated, isAdmin, isEmployee, isClient } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Admin y Employee usan la misma interfaz (con restricciones para Employee)
  if (isAdmin || isEmployee) {
    return <AdminApp />;
  }

  // Cliente usa una interfaz diferente
  if (isClient) {
    return <ClientApp />;
  }

  return <div>Error: Rol no reconocido</div>;
}

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
