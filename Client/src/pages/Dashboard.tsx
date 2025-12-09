import { useState, useEffect } from 'react';
import { reservationApi, sessionApi, tableApi, paymentApi } from '../services/api';
import './Dashboard.css';

interface Stats {
  totalRevenue: number;
  todayRevenue: number;
  activeSessions: number;
  pendingReservations: number;
  availableTables: number;
  totalTables: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    todayRevenue: 0,
    activeSessions: 0,
    pendingReservations: 0,
    availableTables: 0,
    totalTables: 0,
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Actualizar cada 30 seg
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [paymentsRes, sessionsRes, reservationsRes, tablesRes] = await Promise.all([
        paymentApi.getAll(),
        sessionApi.getAll(),
        reservationApi.getAll(),
        tableApi.getAll(),
      ]);

      const payments = paymentsRes.data;
      const sessions = sessionsRes.data;
      const reservations = reservationsRes.data;
      const tables = tablesRes.data;

      // Calcular estadísticas
      const totalRevenue = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      
      const today = new Date().toISOString().split('T')[0];
      const todayRevenue = payments
        .filter((p: any) => p.payment_date === today)
        .reduce((sum: number, p: any) => sum + p.amount, 0);

      const activeSessions = sessions.filter((s: any) => s.status === 1).length;
      const pendingReservations = reservations.filter((r: any) => r.status === 1).length;
      const availableTables = tables.filter((t: any) => t.status === 1).length;

      setStats({
        totalRevenue,
        todayRevenue,
        activeSessions,
        pendingReservations,
        availableTables,
        totalTables: tables.length,
      });

      // Sesiones recientes (últimas 10)
      const recent = sessions
        .sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        .slice(0, 10);
      setRecentSessions(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: number) => {
    const labels = { 1: 'Activa', 2: 'Cerrada', 3: 'Cancelada' };
    return labels[status as keyof typeof labels] || 'N/A';
  };

  const getStatusClass = (status: number) => {
    const classes = { 1: 'status-active', 2: 'status-closed', 3: 'status-cancelled' };
    return classes[status as keyof typeof classes] || '';
  };

  if (loading) {
    return <div className="dashboard-loading">Cargando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <button onClick={loadDashboardData} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Ingresos Totales</h3>
            <p className="stat-value">Bs {stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card today-revenue">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Ingresos Hoy</h3>
            <p className="stat-value">Bs {stats.todayRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card sessions">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Sesiones Activas</h3>
            <p className="stat-value">{stats.activeSessions}</p>
          </div>
        </div>

        <div className="stat-card reservations">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Reservas Pendientes</h3>
            <p className="stat-value">{stats.pendingReservations}</p>
          </div>
        </div>

        <div className="stat-card tables">
          <div className="stat-icon">🎱</div>
          <div className="stat-content">
            <h3>Mesas Disponibles</h3>
            <p className="stat-value">
              {stats.availableTables} / {stats.totalTables}
            </p>
          </div>
        </div>

        <div className="stat-card occupancy">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Ocupación</h3>
            <p className="stat-value">
              {((stats.activeSessions / stats.totalTables) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Sesiones recientes */}
      <div className="recent-sessions">
        <h2>Sesiones Recientes</h2>
        <div className="sessions-table-container">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mesa</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Costo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => (
                <tr key={session.id}>
                  <td>#{session.id}</td>
                  <td>Mesa {session.table_id}</td>
                  <td>{new Date(session.start_time).toLocaleString('es-BO')}</td>
                  <td>
                    {session.end_time
                      ? new Date(session.end_time).toLocaleString('es-BO')
                      : '-'}
                  </td>
                  <td>
                    {session.final_cost ? `Bs ${session.final_cost.toFixed(2)}` : '-'}
                  </td>
                  <td>
                    <span className={`badge ${getStatusClass(session.status)}`}>
                      {getStatusLabel(session.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
