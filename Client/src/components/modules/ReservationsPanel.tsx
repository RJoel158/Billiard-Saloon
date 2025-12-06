import { useState, useEffect } from 'react';
import { reservationApi, tableApi, userApi } from '../../services/api';

export function ReservationsPanel() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    user_id: '',
    table_id: '',
    reservation_date: '',
    start_time: '',
    end_time: '',
    num_people: '1',
    special_requests: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reservationsRes, tablesRes, usersRes] = await Promise.all([
        reservationApi.getAll(),
        tableApi.getAll(),
        userApi.getAll(),
      ]);
      setReservations(reservationsRes.data);
      setTables(tablesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.table_id || !formData.reservation_date) {
      alert('Selecciona mesa y fecha');
      return;
    }
    try {
      const res = await reservationApi.getAvailableSlots(
        Number(formData.table_id),
        formData.reservation_date
      );
      setAvailableSlots(res.data.available_slots || []);
      setShowAvailability(true);
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reservationApi.create({
        user_id: Number(formData.user_id),
        table_id: Number(formData.table_id),
        reservation_date: formData.reservation_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        num_people: Number(formData.num_people),
        special_requests: formData.special_requests || undefined,
      });
      setShowForm(false);
      setFormData({
        user_id: '',
        table_id: '',
        reservation_date: '',
        start_time: '',
        end_time: '',
        num_people: '1',
        special_requests: '',
      });
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await reservationApi.approve(id);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Razón del rechazo:');
    if (!reason) return;
    try {
      await reservationApi.reject(id, reason);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      await reservationApi.delete(id);
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

  const getTableCode = (tableId: number) => {
    return tables.find((t) => t.id === tableId)?.code || 'N/A';
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'N/A';
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="module-panel">
      <div className="module-header">
        <h2>📅 Reservas</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nueva Reserva
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Mesa</th>
            <th>Fecha</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
            <th>Personas</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res.id}>
              <td>{res.id}</td>
              <td>{getUserName(res.user_id)}</td>
              <td><strong>{getTableCode(res.table_id)}</strong></td>
              <td>{res.reservation_date}</td>
              <td>{res.start_time}</td>
              <td>{res.end_time}</td>
              <td>{res.num_people}</td>
              <td>
                <span className={`status-badge ${getStatusClass(res.status)}`}>
                  {getStatusLabel(res.status)}
                </span>
              </td>
              <td className="actions">
                {res.status === 1 && (
                  <>
                    <button className="btn btn-success" onClick={() => handleApprove(res.id)}>
                      Aprobar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleReject(res.id)}>
                      Rechazar
                    </button>
                  </>
                )}
                {res.status !== 3 && (
                  <button className="btn btn-secondary" onClick={() => handleCancel(res.id)}>
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Reserva</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Usuario *</label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mesa *</label>
                  <select
                    value={formData.table_id}
                    onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={formData.reservation_date}
                    onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={checkAvailability}
                    style={{ marginTop: '24px' }}
                  >
                    Ver Disponibilidad
                  </button>
                </div>
                <div className="form-group">
                  <label>Hora Inicio *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora Fin *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Número de Personas *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.num_people}
                    onChange={(e) => setFormData({ ...formData, num_people: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Solicitudes Especiales</label>
                  <textarea
                    value={formData.special_requests}
                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAvailability && (
        <div className="modal-overlay" onClick={() => setShowAvailability(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Horarios Disponibles</h3>
            </div>
            <div className="availability-grid">
              {availableSlots.length === 0 ? (
                <p>No hay horarios disponibles para esta fecha</p>
              ) : (
                availableSlots.map((slot, idx) => (
                  <div key={idx} className="time-slot available">
                    {slot}
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAvailability(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
