import { useEffect, useState } from 'react';
import { Play, Square, Clock, DollarSign, User } from 'lucide-react';
import { mesasService, sesionesService, type Mesa, type Session } from '../../services';

export function ActiveSessions() {
  const [tables, setTables] = useState<Mesa[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Mesa | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [elapsedTimes, setElapsedTimes] = useState<{ [key: number]: string }>({});

  // Form data para iniciar sesión
  const [startFormData, setStartFormData] = useState({
    user_id: '',
    session_type: '2', // 1=reservation, 2=walk-in
  });

  // Form data para finalizar sesión
  const [endFormData, setEndFormData] = useState({
    payment_method: '1', // 1=cash, 2=card, 3=qr, 4=other
    apply_penalty: false,
    penalty_amount: '',
    penalty_reason: '',
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // Actualizar tiempos transcurridos cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimes: { [key: number]: string } = {};
      activeSessions.forEach((session) => {
        if (session.status === 1) {
          newTimes[session.id] = calculateElapsedTime(session.start_time);
        }
      });
      setElapsedTimes(newTimes);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSessions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tablesData, sessionsData] = await Promise.all([
        mesasService.getAll(1, 100),
        sesionesService.getActive(),
      ]);
      setTables(tablesData.items || []);
      setActiveSessions(sessionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateElapsedTime = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const calculateCost = (startTime: string, pricePerHour: number): number => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = diff / (1000 * 60 * 60);
    return Number((hours * pricePerHour).toFixed(2));
  };

  const getTableSession = (tableId: number): Session | undefined => {
    return activeSessions.find((s) => s.table_id === tableId && s.status === 1);
  };

  const handleStartSession = (table: Mesa) => {
    setSelectedTable(table);
    setShowStartModal(true);
    setStartFormData({
      user_id: '',
      session_type: '2',
    });
  };

  const handlePrepareEndSession = (session: Session) => {
    setSelectedSession(session);
    setShowEndModal(true);
    setEndFormData({
      payment_method: '1',
      apply_penalty: false,
      penalty_amount: '',
      penalty_reason: '',
    });
  };

  const submitStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    try {
      await sesionesService.create({
        user_id: startFormData.user_id ? Number(startFormData.user_id) : undefined,
        table_id: selectedTable.id,
        start_time: new Date().toISOString(),
        session_type: Number(startFormData.session_type),
        status: 1,
      });
      setShowStartModal(false);
      fetchData();
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Error al iniciar la sesión');
    }
  };

  const submitEndSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    try {
      const penalty = endFormData.apply_penalty ? Number(endFormData.penalty_amount) : 0;
      
      await sesionesService.finalize(selectedSession.id, {
        payment_method: Number(endFormData.payment_method),
        penalty_amount: penalty,
        penalty_reason: endFormData.penalty_reason || undefined,
      });
      
      setShowEndModal(false);
      fetchData();
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Error al finalizar la sesión');
    }
  };

  const getStatusColor = (table: Mesa): string => {
    const session = getTableSession(table.id);
    if (session) return '#2563eb'; // Azul - En uso
    if (table.status === 3) return '#dc2626'; // Rojo - Mantenimiento
    return '#10b981'; // Verde - Disponible
  };

  const getStatusText = (table: Mesa): string => {
    const session = getTableSession(table.id);
    if (session) return 'En curso';
    if (table.status === 3) return 'Mantenimiento';
    return 'Disponible';
  };

  return (
    <div className="container-fluid p-4" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">
              <Clock size={32} className="me-2" style={{ verticalAlign: 'middle' }} />
              Sesiones Activas
            </h1>
            <p className="text-muted mb-0">Control de tiempo y pagos</p>
          </div>
          <button className="btn btn-success" onClick={fetchData}>
            <Clock size={20} className="me-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {tables.map((table) => {
            const session = getTableSession(table.id);
            const isActive = !!session;
            const statusColor = getStatusColor(table);
            const pricePerHour = table.category?.base_price || 0;
            const currentCost = session ? calculateCost(session.start_time, pricePerHour) : 0;

            return (
              <div key={table.id} className="col-md-6 col-lg-4">
                <div
                  className="card border-0 shadow-sm"
                  style={{
                    borderLeft: `4px solid ${statusColor}`,
                    background: isActive ? '#eff6ff' : '#ffffff',
                  }}
                >
                  <div className="card-body">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1 fw-bold">{table.code}</h5>
                        <small className="text-muted">
                          {session?.user?.first_name} {session?.user?.last_name || 'Sin usuario'}
                        </small>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: statusColor,
                          color: 'white',
                        }}
                      >
                        {getStatusText(table)}
                      </span>
                    </div>

                    {/* Session Info */}
                    {isActive && session ? (
                      <>
                        {/* Timer */}
                        <div className="p-3 mb-3 rounded" style={{ background: '#1e3a8a', color: 'white' }}>
                          <small className="d-block mb-1 opacity-75">Tiempo transcurrido</small>
                          <div className="fs-3 fw-bold font-monospace">
                            {elapsedTimes[session.id] || '00:00:00'}
                          </div>
                        </div>

                        {/* Cost */}
                        <div className="p-3 mb-3 rounded" style={{ background: '#1e3a8a', color: 'white' }}>
                          <small className="d-block mb-1 opacity-75">Monto actual</small>
                          <div className="fs-4 fw-bold">
                            ${currentCost.toFixed(3)}
                          </div>
                          <small className="opacity-75">${pricePerHour}/hora</small>
                        </div>

                        {/* End Session Button */}
                        <button
                          className="btn btn-danger w-100"
                          onClick={() => handlePrepareEndSession(session)}
                        >
                          <Square size={18} className="me-2" />
                          Finalizar Sesión
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-center py-4 mb-3">
                          <Clock size={48} className="text-muted mb-2" />
                          <p className="text-muted mb-0">Mesa disponible</p>
                        </div>
                        <button
                          className="btn btn-success w-100"
                          onClick={() => handleStartSession(table)}
                          disabled={table.status === 3}
                        >
                          <Play size={18} className="me-2" />
                          Iniciar Sesión
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Start Session */}
      {showStartModal && selectedTable && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Iniciar Sesión - {selectedTable.code}</h5>
                <button type="button" className="btn-close" onClick={() => setShowStartModal(false)}></button>
              </div>
              <form onSubmit={submitStartSession}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">ID Usuario (opcional)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={startFormData.user_id}
                      onChange={(e) => setStartFormData({ ...startFormData, user_id: e.target.value })}
                      placeholder="Dejar vacío para walk-in"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo de Sesión</label>
                    <select
                      className="form-select"
                      value={startFormData.session_type}
                      onChange={(e) => setStartFormData({ ...startFormData, session_type: e.target.value })}
                    >
                      <option value="1">Con Reserva</option>
                      <option value="2">Walk-in</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStartModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    <Play size={18} className="me-2" />
                    Iniciar Sesión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: End Session */}
      {showEndModal && selectedSession && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Finalizar Sesión</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEndModal(false)}></button>
              </div>
              <form onSubmit={submitEndSession}>
                <div className="modal-body">
                  {/* Session Summary */}
                  <div className="p-3 mb-3 rounded" style={{ background: '#1f2937', color: 'white' }}>
                    <h6 className="text-warning mb-2">Mesa {tables.find(t => t.id === selectedSession.table_id)?.code}</h6>
                    <p className="mb-1 text-warning">
                      {selectedSession.user?.first_name} {selectedSession.user?.last_name || 'Cliente Walk-in'}
                    </p>
                    <div className="d-flex justify-content-between mt-3">
                      <div>
                        <small className="d-block opacity-75">Duración:</small>
                        <strong>{elapsedTimes[selectedSession.id] || calculateElapsedTime(selectedSession.start_time)}</strong>
                      </div>
                      <div className="text-end">
                        <small className="d-block opacity-75">Tarifa:</small>
                        <strong>${tables.find(t => t.id === selectedSession.table_id)?.category?.base_price || 0}/hora</strong>
                      </div>
                    </div>
                    <hr className="my-2 opacity-25" />
                    <div className="d-flex justify-content-between">
                      <span className="text-warning">Monto Base:</span>
                      <strong className="text-warning">
                        ${calculateCost(selectedSession.start_time, tables.find(t => t.id === selectedSession.table_id)?.category?.base_price || 0).toFixed(3)}
                      </strong>
                    </div>
                    {endFormData.apply_penalty && (
                      <div className="d-flex justify-content-between text-danger">
                        <span>Multa:</span>
                        <strong>${endFormData.penalty_amount || 0}</strong>
                      </div>
                    )}
                    <hr className="my-2 opacity-25" />
                    <div className="d-flex justify-content-between fs-5">
                      <span className="text-warning">Total:</span>
                      <strong className="text-warning">
                        ${(calculateCost(selectedSession.start_time, tables.find(t => t.id === selectedSession.table_id)?.category?.base_price || 0) + Number(endFormData.apply_penalty ? endFormData.penalty_amount || 0 : 0)).toFixed(3)}
                      </strong>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-3">
                    <label className="form-label text-warning fw-semibold">Método de Pago</label>
                    <select
                      className="form-select"
                      value={endFormData.payment_method}
                      onChange={(e) => setEndFormData({ ...endFormData, payment_method: e.target.value })}
                    >
                      <option value="1">Efectivo</option>
                      <option value="2">Tarjeta</option>
                      <option value="3">QR</option>
                      <option value="4">Otro</option>
                    </select>
                  </div>

                  {/* Penalty */}
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="applyPenalty"
                      checked={endFormData.apply_penalty}
                      onChange={(e) => setEndFormData({ ...endFormData, apply_penalty: e.target.checked })}
                    />
                    <label className="form-check-label text-warning" htmlFor="applyPenalty">
                      Aplicar multa
                    </label>
                  </div>

                  {endFormData.apply_penalty && (
                    <>
                      <div className="mb-3">
                        <label className="form-label text-warning">Monto de la Multa</label>
                        <input
                          type="number"
                          className="form-control"
                          value={endFormData.penalty_amount}
                          onChange={(e) => setEndFormData({ ...endFormData, penalty_amount: e.target.value })}
                          placeholder="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-warning">Razón de la Multa</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={endFormData.penalty_reason}
                          onChange={(e) => setEndFormData({ ...endFormData, penalty_reason: e.target.value })}
                          placeholder="Ej: Daño a equipo, retraso en pago..."
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEndModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-warning">
                    <DollarSign size={18} className="me-2" />
                    Procesar Pago
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
