import { useEffect, useState } from 'react';
import { Table2, Clock, DollarSign, Calendar, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  mesasDisponibles: number;
  totalMesas: number;
  sesionesActivas: number;
  gananciasHoy: number;
  totalPagosHoy: number;
  reservasHoy: number;
}

export function AdminDashboard() {
  const { isEmployee } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    mesasDisponibles: 0,
    totalMesas: 0,
    sesionesActivas: 0,
    gananciasHoy: 0,
    totalPagosHoy: 0,
    reservasHoy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: Implementar llamadas al API real
      setStats({
        mesasDisponibles: 6,
        totalMesas: 8,
        sesionesActivas: 1,
        gananciasHoy: 130000,
        totalPagosHoy: 5,
        reservasHoy: 0,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <div className="spinner-border text-white" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  const disponibilidad = Math.round((stats.mesasDisponibles / stats.totalMesas) * 100);

  return (
    <div className="dashboard-container">
      {/* Header con gradiente */}
      <div className="dashboard-header">
        <div className="container-fluid">
          <div className="row align-items-center py-4 px-3">
            <div className="col-md-6">
              <h1 className="display-4 fw-bold text-white mb-2">
                <Activity size={48} className="me-3" style={{ verticalAlign: 'middle' }} />
                Dashboard
              </h1>
              <p className="text-white-50 mb-0 fs-5">Resumen general del sistema de billar</p>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <div className="badge bg-white text-dark px-4 py-2 fs-6 fw-semibold">
                <Clock size={18} className="me-2" style={{ verticalAlign: 'middle' }} />
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 pb-5" style={{ marginTop: '-40px' }}>
        {/* Stats Cards con diseño moderno */}
        <div className="row g-4 mb-4">
          {/* Mesas Disponibles */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="stat-card stat-card-primary">
              <div className="stat-card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="stat-info">
                    <p className="stat-label">MESAS DISPONIBLES</p>
                    <h2 className="stat-value">{stats.mesasDisponibles}<span className="stat-total">/{stats.totalMesas}</span></h2>
                    <div className="d-flex align-items-center mt-3">
                      <div className="progress stat-progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${disponibilidad}%` }}
                        />
                      </div>
                      <span className="ms-2 badge bg-white text-primary fw-bold">{disponibilidad}%</span>
                    </div>
                  </div>
                  <div className="stat-icon stat-icon-primary">
                    <Table2 size={32} />
                  </div>
                </div>
              </div>
              <div className="stat-footer">
                <TrendingUp size={14} className="me-1" />
                <small>Ocupación óptima</small>
              </div>
            </div>
          </div>

          {/* Sesiones Activas */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="stat-card stat-card-success">
              <div className="stat-card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="stat-info">
                    <p className="stat-label">SESIONES ACTIVAS</p>
                    <h2 className="stat-value">{stats.sesionesActivas}</h2>
                    <p className="stat-description mt-3">
                      {stats.sesionesActivas > 0 ? 'En juego ahora' : 'Sin actividad'}
                    </p>
                  </div>
                  <div className="stat-icon stat-icon-success">
                    <Clock size={32} />
                  </div>
                </div>
              </div>
              <div className="stat-footer">
                <Activity size={14} className="me-1" />
                <small>Tiempo real</small>
              </div>
            </div>
          </div>

          {/* Ganancias Hoy */}
          {!isEmployee && (
            <div className="col-12 col-md-6 col-xl-3">
              <div className="stat-card stat-card-warning">
                <div className="stat-card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="stat-info">
                      <p className="stat-label">GANANCIAS HOY</p>
                      <h2 className="stat-value">${(stats.gananciasHoy / 1000).toFixed(1)}k</h2>
                      <p className="stat-description mt-3">
                        {stats.totalPagosHoy} pagos realizados
                      </p>
                    </div>
                    <div className="stat-icon stat-icon-warning">
                      <DollarSign size={32} />
                    </div>
                  </div>
                </div>
                <div className="stat-footer">
                  <TrendingUp size={14} className="me-1" />
                  <small>+12% vs ayer</small>
                </div>
              </div>
            </div>
          )}

          {/* Reservas Hoy */}
          <div className="col-12 col-md-6 col-xl-3">
            <div className="stat-card stat-card-purple">
              <div className="stat-card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="stat-info">
                    <p className="stat-label">RESERVAS HOY</p>
                    <h2 className="stat-value">{stats.reservasHoy}</h2>
                    <p className="stat-description mt-3">
                      {stats.reservasHoy > 0 ? 'Programadas' : 'Sin reservas'}
                    </p>
                  </div>
                  <div className="stat-icon stat-icon-purple">
                    <Calendar size={32} />
                  </div>
                </div>
              </div>
              <div className="stat-footer">
                <Calendar size={14} className="me-1" />
                <small>Próximas horas</small>
              </div>
            </div>
          </div>
        </div>

        {/* Sesiones Activas */}
        <div className="row">
          <div className="col-12">
            <div className="card modern-card">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="fw-bold mb-1">
                      <Clock size={24} className="me-2 text-primary" style={{ verticalAlign: 'middle' }} />
                      Sesiones Activas
                    </h4>
                    <p className="text-muted mb-0">Seguimiento en tiempo real de las mesas en uso</p>
                  </div>
                  {stats.sesionesActivas > 0 && (
                    <span className="badge rounded-pill bg-success px-4 py-2 fs-6">
                      {stats.sesionesActivas} activa{stats.sesionesActivas !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                {stats.sesionesActivas === 0 ? (
                  <div className="text-center py-5 empty-state">
                    <div className="empty-icon mb-3">
                      <Clock size={64} />
                    </div>
                    <h5 className="fw-semibold text-muted mb-2">No hay sesiones activas</h5>
                    <p className="text-muted">Todas las mesas están disponibles en este momento</p>
                  </div>
                ) : (
                  <div className="alert alert-info border-0">
                    <strong>En desarrollo:</strong> La tabla de sesiones activas se mostrará aquí
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos personalizados */}
      <style>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f0f2f5;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        /* Cards de estadísticas modernos */
        .stat-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
          border: none;
          height: 100%;
        }

        .stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .stat-card-body {
          padding: 1.75rem;
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: #6c757d;
          margin-bottom: 0.75rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1;
          margin: 0;
        }

        .stat-total {
          font-size: 1.5rem;
          font-weight: 600;
          color: #adb5bd;
          margin-left: 0.25rem;
        }

        .stat-description {
          font-size: 0.9rem;
          color: #6c757d;
          margin: 0;
          font-weight: 500;
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-icon-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        .stat-icon-warning {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-icon-purple {
          background: linear-gradient(135deg, #a044ff 0%, #6a3093 100%);
        }

        .stat-footer {
          background: #f8f9fa;
          padding: 0.75rem 1.75rem;
          font-size: 0.8rem;
          color: #6c757d;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .stat-progress {
          flex: 1;
          height: 8px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
        }

        .stat-progress .progress-bar {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          transition: width 0.6s ease;
        }

        .stat-card-success .stat-progress .progress-bar {
          background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
        }

        /* Card moderno para secciones */
        .modern-card {
          border: none;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        /* Estado vacío */
        .empty-state {
          padding: 3rem 1rem;
        }

        .empty-icon {
          color: #dee2e6;
        }

        /* Animaciones */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-card {
          animation: fadeIn 0.5s ease;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}
