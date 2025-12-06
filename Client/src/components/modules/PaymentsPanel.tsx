import { useState, useEffect } from 'react';
import { paymentApi, sessionApi } from '../../services/api';

export function PaymentsPanel() {
  const [payments, setPayments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    session_id: '',
    amount: '',
    payment_method: '1',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, sessionsRes] = await Promise.all([
        paymentApi.getAll(),
        sessionApi.getAll(),
      ]);
      setPayments(paymentsRes.data);
      setSessions(sessionsRes.data.filter((s: any) => s.status === 2)); // Solo cerradas
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentApi.create({
        session_id: Number(formData.session_id),
        amount: parseFloat(formData.amount),
        payment_method: Number(formData.payment_method),
        payment_date: formData.payment_date,
        notes: formData.notes || undefined,
      });
      setShowForm(false);
      setFormData({
        session_id: '',
        amount: '',
        payment_method: '1',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este pago?')) return;
    try {
      await paymentApi.delete(id);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const getPaymentMethodLabel = (method: number) => {
    const labels = { 1: 'Efectivo', 2: 'Tarjeta', 3: 'QR', 4: 'Otro' };
    return labels[method as keyof typeof labels] || 'Desconocido';
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="module-panel">
      <div className="module-header">
        <h2>💰 Pagos</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Registrar Pago
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Sesión</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Fecha</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.id}</td>
              <td>Sesión #{payment.session_id}</td>
              <td><strong>Bs {payment.amount.toFixed(2)}</strong></td>
              <td>{getPaymentMethodLabel(payment.payment_method)}</td>
              <td>{payment.payment_date}</td>
              <td>{payment.notes || '-'}</td>
              <td className="actions">
                <button className="btn btn-danger" onClick={() => handleDelete(payment.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Pago</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Sesión *</label>
                  <select
                    value={formData.session_id}
                    onChange={(e) => {
                      const session = sessions.find((s) => s.id === Number(e.target.value));
                      setFormData({
                        ...formData,
                        session_id: e.target.value,
                        amount: session?.final_cost?.toString() || '',
                      });
                    }}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        Sesión #{session.id} - Bs {session.final_cost?.toFixed(2) || '0.00'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Monto (Bs) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Método de Pago *</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="1">Efectivo</option>
                    <option value="2">Tarjeta</option>
                    <option value="3">QR</option>
                    <option value="4">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de Pago *</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
