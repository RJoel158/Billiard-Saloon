import { useState, useEffect } from 'react';
import { sessionApi, reservationApi, tableApi } from '../../services/api';

export function SessionsPanel() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStartForm, setShowStartForm] = useState(false);
  const [formData, setFormData] = useState({
    table_id: '',
    session_type: '2', // 1=reserva, 2=walk-in
    reservation_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, reservationsRes, tablesRes] = await Promise.all([
        sessionApi.getAll(),
        reservationApi.getAll(),
        tableApi.getAll(),
      ]);
      setSessions(sessionsRes.data);
      setReservations(reservationsRes.data.filter((r: any) => r.status === 2)); // Solo confirmadas
      setTables(tablesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sessionApi.start({
        table_id: Number(formData.table_id),
        session_type: Number(formData.session_type),
        reservation_id: formData.reservation_id ? Number(formData.reservation_id) : undefined,
      });
      setShowStartForm(false);
      setFormData({ table_id: '', session_type: '2', reservation_id: '' });
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEndSession = async (id: number) => {
    if (!confirm('¿Finalizar esta sesión?')) return;
    try {
      await sessionApi.end(id);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusLabel = (status: number) => {
    const labels = { 1: 'Activa', 2: 'Cerrada', 3: 'Cancelada' };
    return labels[status as keyof typeof labels] || 'Desconocido';
  };

  const getStatusClass = (status: number) => {
    const classes = { 1: 'status-confirmed', 2: 'status-expired', 3: 'status-cancelled' };
    return classes[status as keyof typeof classes] || '';
  };

  const getSessionTypeLabel = (type: number) => {
    return type === 1 ? 'Reserva' : 'Walk-in';
  };

  const getTableCode = (tableId: number) => {
    return tables.find((t) => t.id === tableId)?.code || 'N/A';
  };

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return 'En curso...';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="module-panel">
      <div className="module-header">
        <h2>⏱️ Sesiones</h2>
        <button className="btn btn-primary" onClick={() => setShowStartForm(true)}>
          ▶️ Iniciar Sesión
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mesa</th>
            <th>Tipo</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Duración</th>
            <th>Costo Final</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>{session.id}</td>
              <td><strong>{getTableCode(session.table_id)}</strong></td>
              <td>{getSessionTypeLabel(session.session_type)}</td>
              <td>{new Date(session.start_time).toLocaleString('es-BO')}</td>
              <td>
                {session.end_time ? new Date(session.end_time).toLocaleString('es-BO') : '-'}
              </td>
              <td>{calculateDuration(session.start_time, session.end_time)}</td>
              <td>
                {session.final_cost ? `Bs ${session.final_cost.toFixed(2)}` : '-'}
              </td>
              <td>
                <span className={`status-badge ${getStatusClass(session.status)}`}>
                  {getStatusLabel(session.status)}
                </span>
              </td>
              <td className="actions">
                {session.status === 1 && (
                  <button className="btn btn-danger" onClick={() => handleEndSession(session.id)}>
                    ⏹️ Finalizar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showStartForm && (
        <div className="modal-overlay" onClick={() => setShowStartForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Iniciar Sesión</h3>
            </div>
            <form onSubmit={handleStartSession}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mesa *</label>
                  <select
                    value={formData.table_id}
                    onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {tables
                      .filter((t) => t.status === 1)
                      .map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.code}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Sesión *</label>
                  <select
                    value={formData.session_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        session_type: e.target.value,
                        reservation_id: e.target.value === '2' ? '' : formData.reservation_id,
                      })
                    }
                  >
                    <option value="2">Walk-in</option>
                    <option value="1">Con Reserva</option>
                  </select>
                </div>
                {formData.session_type === '1' && (
                  <div className="form-group">
                    <label>Reserva *</label>
                    <select
                      value={formData.reservation_id}
                      onChange={(e) => setFormData({ ...formData, reservation_id: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar</option>
                      {reservations
                        .filter((r) => r.table_id === Number(formData.table_id))
                        .map((res) => (
                          <option key={res.id} value={res.id}>
                            Reserva #{res.id} - {res.reservation_date} {res.start_time}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStartForm(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Iniciar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
