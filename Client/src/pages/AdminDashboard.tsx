import { useEffect, useState } from 'react';
import { Card } from '../components/ui';
import { Layout } from '../components/Layout';
import type { DashboardStats } from '../types';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import './AdminDashboard.css';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Cargando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h2>Dashboard de Administración</h2>
        
        <div className="stats-grid">
          <Card>
            <div className="stat-card">
              <div className="stat-icon active">🎮</div>
              <div className="stat-info">
                <div className="stat-label">Sesiones Activas</div>
                <div className="stat-value">{stats?.activeSessions || 0}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-icon available">✅</div>
              <div className="stat-info">
                <div className="stat-label">Mesas Disponibles</div>
                <div className="stat-value">{stats?.availableTables || 0}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-icon occupied">🔴</div>
              <div className="stat-info">
                <div className="stat-label">Mesas Ocupadas</div>
                <div className="stat-value">{stats?.occupiedTables || 0}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-icon pending">⏳</div>
              <div className="stat-info">
                <div className="stat-label">Reservas Pendientes</div>
                <div className="stat-value">{stats?.pendingReservations || 0}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-icon revenue">💰</div>
              <div className="stat-info">
                <div className="stat-label">Ingresos Hoy</div>
                <div className="stat-value">{formatCurrency(stats?.todayRevenue || 0)}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-icon revenue">📊</div>
              <div className="stat-info">
                <div className="stat-label">Ingresos del Mes</div>
                <div className="stat-value">{formatCurrency(stats?.monthRevenue || 0)}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="dashboard-actions">
          <Card title="Acciones Rápidas">
            <div className="quick-actions">
              <a href="/admin/tables" className="action-link">
                🎱 Gestionar Mesas
              </a>
              <a href="/admin/sessions" className="action-link">
                🎮 Ver Sesiones Activas
              </a>
              <a href="/admin/reservations" className="action-link">
                📅 Validar Reservas
              </a>
              <a href="/admin/pricing" className="action-link">
                💵 Tarifas Dinámicas
              </a>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
