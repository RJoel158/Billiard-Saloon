import { useEffect, useState } from 'react';
import { Card, Button } from '../components/ui';
import { Layout } from '../components/Layout';
import type { Reservation } from '../types';
import api from '../utils/api';
import { formatDateTime, getReservationStatusLabel, getReservationStatusColor } from '../utils/formatters';
import './ClientDashboard.css';

export function ClientDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const response = await api.get<Reservation[]>('/reservations/my-reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id: number) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;

    try {
      await api.post(`/reservations/${id}/cancel`);
      loadReservations();
    } catch (error) {
      console.error('Error canceling reservation:', error);
      alert('Error al cancelar la reserva');
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
      <div className="client-dashboard">
        <div className="dashboard-header">
          <h2>Mis Reservas</h2>
          <Button onClick={() => window.location.href = '/reservations/new'}>
            + Nueva Reserva
          </Button>
        </div>

        {reservations.length === 0 ? (
          <Card>
            <div className="empty-state">
              <p>No tienes reservas aún</p>
              <Button onClick={() => window.location.href = '/reservations/new'}>
                Crear mi primera reserva
              </Button>
            </div>
          </Card>
        ) : (
          <div className="reservations-grid">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <div className="reservation-card">
                  <div className="reservation-header">
                    <span className={`status-badge status-${getReservationStatusColor(reservation.status)}`}>
                      {getReservationStatusLabel(reservation.status)}
                    </span>
                    <span className="reservation-id">#{reservation.id}</span>
                  </div>
                  
                  <div className="reservation-details">
                    <div className="detail-row">
                      <span className="detail-label">Mesa:</span>
                      <span className="detail-value">Mesa #{reservation.table_id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Inicio:</span>
                      <span className="detail-value">{formatDateTime(reservation.start_time)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Fin:</span>
                      <span className="detail-value">{formatDateTime(reservation.end_time)}</span>
                    </div>
                  </div>

                  {reservation.status === 1 && (
                    <div className="reservation-actions">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.id)}
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
