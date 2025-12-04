import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button } from '../components/ui';
import type { Reservation, BilliardTable } from '../types';
import api from '../utils/api';
import { formatDateTime, getReservationStatusLabel, getReservationStatusColor } from '../utils/formatters';
import './ReservationsManagement.css';

export function ReservationsManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<BilliardTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const endpoint = filter === 'pending' ? '/reservations/pending' : '/reservations';
      const [reservationsRes, tablesRes] = await Promise.all([
        api.get<Reservation[]>(endpoint),
        api.get<BilliardTable[]>('/tables'),
      ]);
      setReservations(reservationsRes.data);
      setTables(tablesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await api.post(`/reservations/${id}/confirm`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Error al confirmar');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    
    try {
      await api.post(`/reservations/${id}/cancel`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Error al cancelar');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Cargando...</div>
      </Layout>
    );
  }

  const getTableCode = (tableId: number) => {
    return tables.find(t => t.id === tableId)?.code || `Mesa #${tableId}`;
  };

  return (
    <Layout>
      <div className="reservations-management">
        <div className="page-header">
          <div>
            <h2>Gestión de Reservas</h2>
            <p className="page-subtitle">
              {filter === 'pending' ? 'Reservas pendientes de confirmación' : 'Todas las reservas'}
            </p>
          </div>
          <div className="header-actions">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'pending')}
              className="filter-select"
            >
              <option value="pending">Pendientes</option>
              <option value="all">Todas</option>
            </select>
            <Button variant="secondary" onClick={loadData}>
              Actualizar
            </Button>
          </div>
        </div>

        {reservations.length === 0 ? (
          <Card>
            <div className="empty-state">
              <div className="empty-icon">-</div>
              <h3>No hay reservas {filter === 'pending' ? 'pendientes' : ''}</h3>
              <p>
                {filter === 'pending'
                  ? 'Todas las reservas han sido procesadas'
                  : 'No se encontraron reservas en el sistema'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="reservations-list">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <div className="reservation-item">
                  <div className="reservation-main">
                    <div className="reservation-table-info">
                      <div className="table-badge">{getTableCode(reservation.table_id)}</div>
                      <span className={`reservation-status status-${getReservationStatusColor(reservation.status)}`}>
                        {getReservationStatusLabel(reservation.status)}
                      </span>
                    </div>

                    <div className="reservation-time-info">
                      <div className="time-block">
                        <span className="time-label">Inicio</span>
                        <span className="time-value">{formatDateTime(reservation.start_time)}</span>
                      </div>
                      <div className="time-separator">→</div>
                      <div className="time-block">
                        <span className="time-label">Fin</span>
                        <span className="time-value">{formatDateTime(reservation.end_time)}</span>
                      </div>
                    </div>

                    <div className="reservation-meta">
                      <div className="meta-item">
                        <span className="meta-icon">●</span>
                        <span className="meta-text">Usuario ID: {reservation.user_id}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">●</span>
                        <span className="meta-text">Reserva #{reservation.id}</span>
                      </div>
                      {reservation.created_at && (
                        <div className="meta-item">
                          <span className="meta-icon">●</span>
                          <span className="meta-text">Creada: {formatDateTime(reservation.created_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {reservation.status === 1 && (
                    <div className="reservation-actions">
                      <Button
                        variant="success"
                        onClick={() => handleConfirm(reservation.id)}
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(reservation.id)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
