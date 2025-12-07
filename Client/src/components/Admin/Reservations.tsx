import { useEffect, useState } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { reservasService, type Reservation } from '../../services';
import { Pagination } from '../Pagination';
import { useSystemSettings } from '../../hooks/useSystemSettings';

export function Reservations() {
  const { settings } = useSystemSettings();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    table_id: '',
    reservation_date: '',
    duration_hours: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [currentPage]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservasService.getAll(currentPage, 10);
      setReservations(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    if (confirm('¿Confirmar esta reserva?')) {
      try {
        await reservasService.confirm(id);
        fetchReservations();
      } catch (error) {
        console.error('Error confirming reservation:', error);
        alert('Error al confirmar la reserva');
      }
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm('¿Cancelar esta reserva?')) {
      try {
        await reservasService.cancel(id);
        fetchReservations();
      } catch (error) {
        console.error('Error canceling reservation:', error);
        alert('Error al cancelar la reserva');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar permanentemente esta reserva?')) {
      try {
        await reservasService.delete(id);
        fetchReservations();
      } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Error al eliminar la reserva');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings) {
      alert('Cargando configuración del sistema...');
      return;
    }

    try {
      const reservationDate = new Date(formData.reservation_date);
      const durationHours = Number(formData.duration_hours);
      const dayOfWeek = reservationDate.getDay() === 0 ? 7 : reservationDate.getDay();
      const hour = reservationDate.getHours();
      const minute = reservationDate.getMinutes();
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // Validar día laborable
      if (!settings.business_days.includes(dayOfWeek)) {
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        alert(`El día ${dayNames[reservationDate.getDay()]} no es un día laborable del negocio.`);
        return;
      }

      // Validar horario de atención
      if (timeString < settings.opening_time || timeString > settings.closing_time) {
        alert(`La reserva debe estar dentro del horario de atención: ${settings.opening_time} - ${settings.closing_time}`);
        return;
      }

      // Validar duración mínima
      const durationMinutes = durationHours * 60;
      if (durationMinutes < settings.min_reservation_duration) {
        alert(`La duración mínima de reserva es ${settings.min_reservation_duration} minutos (${settings.min_reservation_duration / 60} horas).`);
        return;
      }

      // Validar duración máxima
      if (durationMinutes > settings.max_reservation_duration) {
        alert(`La duración máxima de reserva es ${settings.max_reservation_duration} minutos (${settings.max_reservation_duration / 60} horas).`);
        return;
      }

      // Validar tiempo de anticipación mínimo
      const now = new Date();
      const hoursInAdvance = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursInAdvance < settings.min_advance_hours) {
        alert(`Las reservas deben hacerse con al menos ${settings.min_advance_hours} horas de anticipación.`);
        return;
      }

      // Validar tiempo de anticipación máximo
      const daysInAdvance = hoursInAdvance / 24;
      if (daysInAdvance > settings.max_advance_days) {
        alert(`Las reservas no pueden hacerse con más de ${settings.max_advance_days} días de anticipación.`);
        return;
      }

      const endTime = new Date(reservationDate.getTime() + durationHours * 60 * 60 * 1000);

      if (editingId) {
        await reservasService.update(editingId, {
          user_id: Number(formData.user_id),
          table_id: Number(formData.table_id),
          reservation_date: formData.reservation_date,
          start_time: reservationDate.toISOString(),
          end_time: endTime.toISOString(),
          duration_hours: durationHours,
          notes: formData.notes || null
        });
      } else {
        await reservasService.create({
          user_id: Number(formData.user_id),
          table_id: Number(formData.table_id),
          reservation_date: formData.reservation_date,
          start_time: reservationDate.toISOString(),
          end_time: endTime.toISOString(),
          duration_hours: durationHours,
          notes: formData.notes || null
        });
      }
      setShowModal(false);
      resetForm();
      fetchReservations();
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('Error al guardar la reserva');
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      table_id: '',
      reservation_date: '',
      duration_hours: '',
      notes: ''
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (reservation: Reservation) => {
    setFormData({
      user_id: String(reservation.user_id),
      table_id: String(reservation.table_id),
      reservation_date: reservation.reservation_date.slice(0, 16),
      duration_hours: String(reservation.duration_hours),
      notes: reservation.notes || ''
    });
    setEditingId(reservation.id);
    setShowModal(true);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="badge bg-warning">Pendiente</span>;
      case 2:
        return <span className="badge bg-success">Confirmada</span>;
      case 3:
        return <span className="badge bg-danger">Cancelada</span>;
      default:
        return <span className="badge bg-secondary">Desconocido</span>;
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <AlertCircle size={18} className="text-warning" />;
      case 2:
        return <CheckCircle size={18} className="text-success" />;
      case 3:
        return <XCircle size={18} className="text-danger" />;
      default:
        return <AlertCircle size={18} className="text-secondary" />;
    }
  };

  const filteredReservations = reservations.filter(
    reservation => filterStatus === 'all' || reservation.status === filterStatus
  );

  const stats = {
    pending: reservations.filter(r => r.status === 1).length,
    confirmed: reservations.filter(r => r.status === 2).length,
    cancelled: reservations.filter(r => r.status === 3).length,
    total: reservations.length
  };

  return (
    <div className="container-fluid p-4" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">
              <Calendar size={32} className="me-2" style={{ verticalAlign: 'middle' }} />
              Gestión de Reservas
            </h1>
            <p className="text-muted mb-0">Administra las reservas de mesas</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Calendar size={20} className="me-2" />
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-mini bg-primary-subtle text-primary">
                  <Calendar size={24} />
                </div>
                <div>
                  <small className="text-muted d-block">Total Reservas</small>
                  <h4 className="mb-0 fw-bold">{stats.total}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-mini bg-warning-subtle text-warning">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <small className="text-muted d-block">Pendientes</small>
                  <h4 className="mb-0 fw-bold">{stats.pending}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-mini bg-success-subtle text-success">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <small className="text-muted d-block">Confirmadas</small>
                  <h4 className="mb-0 fw-bold">{stats.confirmed}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-mini bg-danger-subtle text-danger">
                  <XCircle size={24} />
                </div>
                <div>
                  <small className="text-muted d-block">Canceladas</small>
                  <h4 className="mb-0 fw-bold">{stats.cancelled}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Filtrar por Estado</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">Todos</option>
                <option value="1">Pendiente</option>
                <option value="2">Confirmada</option>
                <option value="3">Cancelada</option>
              </select>
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
                      <th className="px-4 py-3 fw-semibold">ID</th>
                      <th className="px-4 py-3 fw-semibold">Cliente</th>
                      <th className="px-4 py-3 fw-semibold">Mesa</th>
                      <th className="px-4 py-3 fw-semibold">Fecha y Hora</th>
                      <th className="px-4 py-3 fw-semibold">Duración</th>
                      <th className="px-4 py-3 fw-semibold">Estado</th>
                      <th className="px-4 py-3 fw-semibold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          No se encontraron reservas
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td className="px-4 py-3">
                            <span className="badge bg-light text-dark">#{reservation.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-2">
                              <User size={18} className="text-muted" />
                              <span>{reservation.user ? `${reservation.user.first_name} ${reservation.user.last_name}` : 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="fw-semibold">Mesa #{reservation.table_id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="fw-semibold">{new Date(reservation.reservation_date).toLocaleDateString('es-ES')}</div>
                              <small className="text-muted">{new Date(reservation.reservation_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-2">
                              <Clock size={16} className="text-muted" />
                              <span>{reservation.duration_hours}h</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-2">
                              {getStatusIcon(reservation.status)}
                              {getStatusBadge(reservation.status)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex gap-2 justify-content-center">
                              {reservation.status === 1 && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleConfirm(reservation.id)}
                                    title="Confirmar"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => handleCancel(reservation.id)}
                                    title="Cancelar"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditModal(reservation)}
                                title="Editar"
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(reservation.id)}
                                title="Eliminar"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingId ? 'Editar Reserva' : 'Nueva Reserva'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {settings && (
                    <div className="alert alert-info mb-3">
                      <small>
                        <strong>Restricciones:</strong><br/>
                        • Horario: {settings.opening_time} - {settings.closing_time}<br/>
                        • Duración: {settings.min_reservation_duration / 60}h - {settings.max_reservation_duration / 60}h<br/>
                        • Anticipación: {settings.min_advance_hours}h - {settings.max_advance_days} días<br/>
                        • Días laborables: {settings.business_days.map(d => ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d === 7 ? 0 : d]).join(', ')}
                      </small>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">ID Usuario</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ID Mesa</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.table_id}
                      onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha y Hora</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={formData.reservation_date}
                      onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                      required
                    />
                    {settings && (
                      <small className="text-muted">Horario de atención: {settings.opening_time} - {settings.closing_time}</small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Duración (horas)</label>
                    <input
                      type="number"
                      step="0.5"
                      min={settings ? settings.min_reservation_duration / 60 : 0.5}
                      max={settings ? settings.max_reservation_duration / 60 : 24}
                      className="form-control"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                      required
                    />
                    {settings && (
                      <small className="text-muted">Mín: {settings.min_reservation_duration / 60}h - Máx: {settings.max_reservation_duration / 60}h</small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notas</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .stat-icon-mini {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
