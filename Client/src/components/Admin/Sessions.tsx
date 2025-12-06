import { useEffect, useState } from 'react';
import { Clock, Play, Square, XCircle, DollarSign, User, Table2 } from 'lucide-react';
import { sesionesService, type Session } from '../../services';

export function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchSessions();
  }, [currentPage, filterStatus]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sesionesService.getAll(currentPage, 10);
      setSessions(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (id: number) => {
    if (!confirm('¿Finalizar esta sesión?')) return;
    
    try {
      await sesionesService.finalize(id);
      fetchSessions();
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Error al finalizar la sesión.');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="badge bg-success">Activa</span>;
      case 2:
        return <span className="badge bg-secondary">Cerrada</span>;
      case 3:
        return <span className="badge bg-danger">Cancelada</span>;
      default:
        return <span className="badge bg-secondary">Desconocido</span>;
    }
  };

  const getTypeBadge = (type: number) => {
    return type === 1 
      ? <span className="badge bg-primary">Reserva</span>
      : <span className="badge bg-info">Walk-in</span>;
  };

  const calculateDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredSessions = filterStatus === 'all' 
    ? sessions 
    : sessions.filter(s => s.status === filterStatus);

  return (
    <div className="container-fluid p-4" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark mb-1">
          <Clock size={32} className="me-2" style={{ verticalAlign: 'middle' }} />
          Gestión de Sesiones
        </h1>
        <p className="text-muted mb-0">Control de sesiones activas y finalizadas</p>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label className="form-label fw-semibold mb-2">Filtrar por estado:</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">Todos</option>
                <option value="1">Activas</option>
                <option value="2">Cerradas</option>
                <option value="3">Canceladas</option>
              </select>
            </div>
            <div className="col-md-8">
              <div className="d-flex gap-3">
                <div className="stat-mini">
                  <Play className="text-success" size={20} />
                  <div>
                    <small className="text-muted d-block">Activas</small>
                    <strong>{sessions.filter(s => s.status === 1).length}</strong>
                  </div>
                </div>
                <div className="stat-mini">
                  <Square className="text-secondary" size={20} />
                  <div>
                    <small className="text-muted d-block">Cerradas</small>
                    <strong>{sessions.filter(s => s.status === 2).length}</strong>
                  </div>
                </div>
                <div className="stat-mini">
                  <XCircle className="text-danger" size={20} />
                  <div>
                    <small className="text-muted d-block">Canceladas</small>
                    <strong>{sessions.filter(s => s.status === 3).length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 fw-semibold">Mesa</th>
                      <th className="px-4 py-3 fw-semibold">Cliente</th>
                      <th className="px-4 py-3 fw-semibold">Tipo</th>
                      <th className="px-4 py-3 fw-semibold">Inicio</th>
                      <th className="px-4 py-3 fw-semibold">Duración</th>
                      <th className="px-4 py-3 fw-semibold">Costo</th>
                      <th className="px-4 py-3 fw-semibold">Estado</th>
                      <th className="px-4 py-3 fw-semibold text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted">
                          No se encontraron sesiones
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((session) => (
                        <tr key={session.id}>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-2">
                              <Table2 size={18} className="text-primary" />
                              <span className="fw-semibold">{session.table?.code || `Mesa #${session.table_id}`}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-2">
                              <User size={18} className="text-muted" />
                              <span>{session.user ? `${session.user.first_name} ${session.user.last_name}` : 'Walk-in'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{getTypeBadge(session.session_type)}</td>
                          <td className="px-4 py-3">
                            <small>{new Date(session.start_time).toLocaleString('es-ES')}</small>
                          </td>
                          <td className="px-4 py-3">
                            <span className="badge bg-light text-dark">
                              {calculateDuration(session.start_time, session.end_time)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-1">
                              <DollarSign size={16} className="text-success" />
                              <span className="fw-semibold">${session.final_cost}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(session.status)}</td>
                          <td className="px-4 py-3">
                            <div className="d-flex gap-2 justify-content-end">
                              {session.status === 1 && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleEndSession(session.id)}
                                >
                                  <Square size={16} className="me-1" />
                                  Finalizar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-4 border-top">
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                          Anterior
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                          Siguiente
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .stat-mini {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
