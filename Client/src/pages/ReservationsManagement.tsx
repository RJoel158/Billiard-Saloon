import { useState, useEffect } from 'react';
import { reservationApi, userApi, tableApi } from '../services/api';
import './ReservationsManagement.css';

export function ReservationsManagement() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reservationsRes, usersRes, tablesRes] = await Promise.all([
        reservationApi.getAll(),
        userApi.getAll(),
        tableApi.getAll(),
      ]);
      setReservations(reservationsRes.data);
      setUsers(usersRes.data);
      setTables(tablesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('¿Aprobar esta reserva?')) return;
    try {
      await reservationApi.approve(id);
      alert('Reserva aprobada exitosamente');
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Ingrese la razón del rechazo:');
    if (!reason) return;
    try {
      await reservationApi.reject(id, reason);
      alert('Reserva rechazada');
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      await reservationApi.delete(id);
      alert('Reserva cancelada');
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusLabel = (status: number) => {
    const labels = { 1: 'Pendiente', 2: 'Confirmada', 3: 'Cancelada', 4: 'Expirada' };
    return labels[status as keyof typeof labels] || 'Desconocido';
  };

  const getStatusClass = (status: number) => {
    const classes = {
      1: 'status-pending',
      2: 'status-confirmed',
      3: 'status-cancelled',
      4: 'status-expired',
    };
    return classes[status as keyof typeof classes] || '';
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'N/A';
  };

  const getTableCode = (tableId: number) => {
    return tables.find((t) => t.id === tableId)?.code || 'N/A';
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 1;
    if (filter === 'confirmed') return r.status === 2;
    if (filter === 'cancelled') return r.status === 3;
    return true;
  });

  const stats = {
    pending: reservations.filter((r) => r.status === 1).length,
    confirmed: reservations.filter((r) => r.status === 2).length,
    cancelled: reservations.filter((r) => r.status === 3).length,
    total: reservations.length,
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="reservations-management">
      <div className="page-header">
        <h1>📅 Gestión de Reservas</h1>
        <button onClick={loadData} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      {/* Estadísticas */}
      <div className="reservations-stats">
        <div className="stat-item" onClick={() => setFilter('pending')}>
          <div className="stat-number pending">{stats.pending}</div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className="stat-item" onClick={() => setFilter('confirmed')}>
          <div className="stat-number confirmed">{stats.confirmed}</div>
          <div className="stat-label">Confirmadas</div>
        </div>
        <div className="stat-item" onClick={() => setFilter('cancelled')}>
          <div className="stat-number cancelled">{stats.cancelled}</div>
          <div className="stat-label">Canceladas</div>
        </div>
        <div className="stat-item" onClick={() => setFilter('all')}>
          <div className="stat-number total">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </button>
        <button
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmadas
        </button>
        <button
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Canceladas
        </button>
      </div>

      {/* Tabla de reservas */}
      <div className="reservations-table-wrapper">
        <table className="reservations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Mesa</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Duración</th>
              <th>Personas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                  No hay reservas {filter !== 'all' && `en estado ${filter}`}
                </td>
              </tr>
            ) : (
              filteredReservations.map((reservation) => (
                <tr key={reservation.id} onClick={() => setSelectedReservation(reservation)}>
                  <td>#{reservation.id}</td>
                  <td>{getUserName(reservation.user_id)}</td>
                  <td><strong>{getTableCode(reservation.table_id)}</strong></td>
                  <td>{reservation.reservation_date}</td>
                  <td>
                    {reservation.start_time} - {reservation.end_time}
                  </td>
                  <td>
                    {(() => {
                      const start = new Date(`2000-01-01 ${reservation.start_time}`);
                      const end = new Date(`2000-01-01 ${reservation.end_time}`);
                      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      return `${diff.toFixed(1)}h`;
                    })()}
                  </td>
                  <td>{reservation.num_people}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                      {getStatusLabel(reservation.status)}
                    </span>
                  </td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    {reservation.status === 1 && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(reservation.id)}
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReject(reservation.id)}
                        >
                          ✗ Rechazar
                        </button>
                      </>
                    )}
                    {(reservation.status === 1 || reservation.status === 2) && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancel(reservation.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      {selectedReservation && (
        <div className="modal-overlay" onClick={() => setSelectedReservation(null)}>
          <div className="modal-details" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de Reserva #{selectedReservation.id}</h2>
              <button onClick={() => setSelectedReservation(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Cliente:</label>
                  <span>{getUserName(selectedReservation.user_id)}</span>
                </div>
                <div className="detail-item">
                  <label>Mesa:</label>
                  <span>{getTableCode(selectedReservation.table_id)}</span>
                </div>
                <div className="detail-item">
                  <label>Fecha:</label>
                  <span>{selectedReservation.reservation_date}</span>
                </div>
                <div className="detail-item">
                  <label>Hora Inicio:</label>
                  <span>{selectedReservation.start_time}</span>
                </div>
                <div className="detail-item">
                  <label>Hora Fin:</label>
                  <span>{selectedReservation.end_time}</span>
                </div>
                <div className="detail-item">
                  <label>Personas:</label>
                  <span>{selectedReservation.num_people}</span>
                </div>
                <div className="detail-item">
                  <label>Estado:</label>
                  <span className={`status-badge ${getStatusClass(selectedReservation.status)}`}>
                    {getStatusLabel(selectedReservation.status)}
                  </span>
                </div>
                {selectedReservation.special_requests && (
                  <div className="detail-item full-width">
                    <label>Solicitudes Especiales:</label>
                    <span>{selectedReservation.special_requests}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
