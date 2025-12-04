import { useState, useEffect } from 'react';
import { sessionApi, tableApi, reservationApi } from '../services/api';
import './ActiveSessions.css';

export function ActiveSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStartForm, setShowStartForm] = useState(false);
  const [formData, setFormData] = useState({
    table_id: '',
    session_type: '2',
    reservation_id: '',
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Actualizar cada 10 seg
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, tablesRes] = await Promise.all([
        sessionApi.getAll(),
        tableApi.getAll(),
      ]);
      
      const allSessions = sessionsRes.data;
      const activeSessions = allSessions.filter((s: any) => s.status === 1);
      setSessions(activeSessions);
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
      alert('Sesión iniciada exitosamente');
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEndSession = async (id: number) => {
    if (!confirm('¿Finalizar esta sesión?')) return;
    try {
      const response = await sessionApi.end(id);
      const { final_cost } = response.data;
      alert(`Sesión finalizada. Total a pagar: Bs ${final_cost.toFixed(2)}`);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const calculateDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, totalHours: hours + minutes / 60 };
  };

  const estimateCost = (session: any) => {
    const table = tables.find((t) => t.id === session.table_id);
    if (!table) return 0;
    
    const duration = calculateDuration(session.start_time);
    const hours = Math.ceil(duration.totalHours); // Redondear hacia arriba
    return hours * (table.base_price || 0);
  };

  const getTableCode = (tableId: number) => {
    return tables.find((t) => t.id === tableId)?.code || `Mesa ${tableId}`;
  };

  const getSessionTypeLabel = (type: number) => {
    return type === 1 ? 'Reserva' : 'Walk-in';
  };

  const availableTables = tables.filter((t) => t.status === 1);

  if (loading) return <div className="loading">Cargando sesiones...</div>;

  return (
    <div className="active-sessions">
      <div className="sessions-header">
        <h1>⏱️ Sesiones Activas</h1>
        <div className="header-actions">
          <button onClick={loadData} className="btn-refresh">
            🔄 Actualizar
          </button>
          <button onClick={() => setShowStartForm(true)} className="btn-start-session">
            ▶️ Iniciar Sesión
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="sessions-summary">
        <div className="summary-item">
          <div className="summary-icon">🎱</div>
          <div className="summary-content">
            <h3>{sessions.length}</h3>
            <p>Sesiones Activas</p>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <h3>{availableTables.length}</h3>
            <p>Mesas Disponibles</p>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>
              Bs {sessions.reduce((sum, s) => sum + estimateCost(s), 0).toFixed(2)}
            </h3>
            <p>Ingresos Estimados</p>
          </div>
        </div>
      </div>

      {/* Grid de sesiones activas */}
      <div className="sessions-grid">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <h3>No hay sesiones activas</h3>
            <p>Inicia una nueva sesión para comenzar</p>
            <button onClick={() => setShowStartForm(true)} className="btn-start-empty">
              ▶️ Iniciar Primera Sesión
            </button>
          </div>
        ) : (
          sessions.map((session) => {
            const duration = calculateDuration(session.start_time);
            const estimatedCost = estimateCost(session);
            
            return (
              <div key={session.id} className="session-card">
                <div className="session-card-header">
                  <h3>{getTableCode(session.table_id)}</h3>
                  <span className="session-type">
                    {getSessionTypeLabel(session.session_type)}
                  </span>
                </div>

                <div className="session-timer">
                  <div className="timer-display">
                    <span className="timer-number">{String(duration.hours).padStart(2, '0')}</span>
                    <span className="timer-separator">:</span>
                    <span className="timer-number">{String(duration.minutes).padStart(2, '0')}</span>
                    <span className="timer-separator">:</span>
                    <span className="timer-number">{String(duration.seconds).padStart(2, '0')}</span>
                  </div>
                  <p className="timer-label">Tiempo transcurrido</p>
                </div>

                <div className="session-info">
                  <div className="info-row">
                    <span className="info-label">Inicio:</span>
                    <span className="info-value">
                      {new Date(session.start_time).toLocaleTimeString('es-BO')}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Estimado:</span>
                    <span className="info-value estimated-cost">
                      Bs {estimatedCost.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleEndSession(session.id)}
                  className="btn-end-session"
                >
                  ⏹️ Finalizar Sesión
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal para iniciar sesión */}
      {showStartForm && (
        <div className="modal-overlay" onClick={() => setShowStartForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Iniciar Nueva Sesión</h3>
              <button onClick={() => setShowStartForm(false)}>✕</button>
            </div>
            <form onSubmit={handleStartSession}>
              <div className="form-group">
                <label>Mesa *</label>
                <select
                  value={formData.table_id}
                  onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                  required
                >
                  <option value="">Seleccionar mesa disponible</option>
                  {availableTables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.code} - Bs {table.base_price}/hora
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de Sesión *</label>
                <select
                  value={formData.session_type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    session_type: e.target.value,
                    reservation_id: e.target.value === '2' ? '' : formData.reservation_id
                  })}
                >
                  <option value="2">Walk-in (Sin reserva)</option>
                  <option value="1">Con Reserva</option>
                </select>
              </div>

              {formData.session_type === '1' && (
                <div className="form-group">
                  <label>ID de Reserva *</label>
                  <input
                    type="number"
                    value={formData.reservation_id}
                    onChange={(e) => setFormData({ ...formData, reservation_id: e.target.value })}
                    placeholder="Ingrese el ID de la reserva confirmada"
                    required
                  />
                </div>
              )}

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowStartForm(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
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
