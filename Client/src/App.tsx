import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import { TablesManagement } from './pages/TablesManagement';
import { ActiveSessions } from './pages/ActiveSessions';
import { ReservationsManagement } from './pages/ReservationsManagement';
import { CreateSession } from './pages/CreateSession';
import './App.css';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
          ) : (
            <AuthPage />
          )
        } 
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tables"
        element={
          <ProtectedRoute adminOnly>
            <TablesManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/sessions"
        element={
          <ProtectedRoute adminOnly>
            <ActiveSessions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/sessions/new"
        element={
          <ProtectedRoute adminOnly>
            <CreateSession />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reservations"
        element={
          <ProtectedRoute adminOnly>
            <ReservationsManagement />
          </ProtectedRoute>
        }
      />

      {/* Redirect any unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
