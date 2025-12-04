import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, Button } from '../components/ui';
import { CloseSessionModal } from '../components/CloseSessionModal';
import type { Session, BilliardTable } from '../types';
import api from '../utils/api';
import { formatDateTime, calculateDuration } from '../utils/formatters';
import './ActiveSessions.css';

export function ActiveSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tables, setTables] = useState<BilliardTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, tablesRes] = await Promise.all([
        api.get<Session[]>('/sessions/active'),
        api.get<BilliardTable[]>('/tables'),
      ]);
      setSessions(sessionsRes.data);
      setTables(tablesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClosed = () => {
    setSelectedSession(null);
    loadData();
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
      <div className="active-sessions">
        <div className="page-header">
          <div>
            <h2>Sesiones Activas</h2>
            <p className="page-subtitle">{sessions.length} sesión{sessions.length !== 1 ? 'es' : ''} en curso</p>
          </div>
          <div className="header-actions">
            <Button variant="secondary" onClick={loadData}>
              Actualizar
            </Button>
            <Button onClick={() => navigate('/admin/sessions/new')}>
              + Nueva Sesión
            </Button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <div className="empty-state">
              <div className="empty-icon">-</div>
              <h3>No hay sesiones activas</h3>
              <p>Todas las mesas están disponibles</p>
            </div>
          </Card>
        ) : (
          <div className="sessions-grid">
            {sessions.map((session) => (
              <Card key={session.id}>
                <div className="session-card">
                  <div className="session-header">
                    <div className="session-table">{getTableCode(session.table_id)}</div>
                    <div className="session-badge active">
                      En curso
                    </div>
                  </div>

                  <div className="session-timer">
                    <div className="timer-label">Tiempo transcurrido</div>
                    <div className="timer-value">
                      {calculateDuration(session.start_time)}
                    </div>
                  </div>

                  <div className="session-details">
                    <div className="detail-row">
                      <span className="detail-icon">●</span>
                      <span className="detail-label">Inicio:</span>
                      <span className="detail-value">{formatDateTime(session.start_time)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-icon">●</span>
                      <span className="detail-label">Tipo:</span>
                      <span className="detail-value">
                        {session.session_type === 1 ? 'Con Reserva' : 'Sin Reserva'}
                      </span>
                    </div>
                    {session.user_id && (
                      <div className="detail-row">
                        <span className="detail-icon">●</span>
                        <span className="detail-label">Usuario:</span>
                        <span className="detail-value">ID: {session.user_id}</span>
                      </div>
                    )}
                  </div>

                  <div className="session-actions">
                    <Button
                      onClick={() => setSelectedSession(session)}
                      variant="danger"
                      style={{ width: '100%' }}
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <CloseSessionModal
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          onSuccess={handleSessionClosed}
          tableCode={selectedSession ? getTableCode(selectedSession.table_id) : ''}
        />
      </div>
    </Layout>
  );
}
