import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Calendar, BarChart3, Download } from 'lucide-react';
import { pagosService, type Payment } from '../../services';

interface RevenueStats {
  today: number;
  week: number;
  month: number;
  total: number;
}

interface MethodStats {
  cash: number;
  card: number;
  qr: number;
  other: number;
}

export function Revenue() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });
  const [methodStats, setMethodStats] = useState<MethodStats>({
    cash: 0,
    card: 0,
    qr: 0,
    other: 0
  });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      // Fetch multiple pages to get all payments
      const data = await pagosService.getAll(1, 1000);
      const allPayments = data.items || [];
      setPayments(allPayments);
      calculateStats(allPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData: Payment[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const stats: RevenueStats = {
      today: 0,
      week: 0,
      month: 0,
      total: 0
    };

    const methods: MethodStats = {
      cash: 0,
      card: 0,
      qr: 0,
      other: 0
    };

    paymentsData.forEach((payment) => {
      const amount = Number(payment.amount);
      const paymentDate = new Date(payment.created_at);

      stats.total += amount;

      if (paymentDate >= today) {
        stats.today += amount;
      }
      if (paymentDate >= weekAgo) {
        stats.week += amount;
      }
      if (paymentDate >= monthAgo) {
        stats.month += amount;
      }

      switch (payment.method) {
        case 1:
          methods.cash += amount;
          break;
        case 2:
          methods.card += amount;
          break;
        case 3:
          methods.qr += amount;
          break;
        default:
          methods.other += amount;
      }
    });

    setRevenueStats(stats);
    setMethodStats(methods);
  };

  const filterPaymentsByDate = () => {
    if (!dateFrom && !dateTo) return payments;

    return payments.filter((payment) => {
      const paymentDate = new Date(payment.created_at);
      const matchesFrom = !dateFrom || paymentDate >= new Date(dateFrom);
      const matchesTo = !dateTo || paymentDate <= new Date(dateTo);
      return matchesFrom && matchesTo;
    });
  };

  const filteredPayments = filterPaymentsByDate();
  const filteredTotal = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const getMethodPercentage = (amount: number) => {
    return methodStats.cash + methodStats.card + methodStats.qr + methodStats.other > 0
      ? ((amount / (methodStats.cash + methodStats.card + methodStats.qr + methodStats.other)) * 100).toFixed(1)
      : '0.0';
  };

  return (
    <div className="container-fluid p-4" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">
              <TrendingUp size={32} className="me-2" style={{ verticalAlign: 'middle' }} />
              Análisis de Ganancias
            </h1>
            <p className="text-muted mb-0">Dashboard de ingresos y estadísticas financieras</p>
          </div>
          <button className="btn btn-outline-primary">
            <Download size={20} className="me-2" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Revenue Stats */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className="stat-icon-mini bg-success-subtle text-success">
                      <DollarSign size={24} />
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block">Hoy</small>
                      <h4 className="mb-0 fw-bold text-success">${revenueStats.today.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className="stat-icon-mini bg-info-subtle text-info">
                      <Calendar size={24} />
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block">Última Semana</small>
                      <h4 className="mb-0 fw-bold text-info">${revenueStats.week.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className="stat-icon-mini bg-warning-subtle text-warning">
                      <BarChart3 size={24} />
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block">Último Mes</small>
                      <h4 className="mb-0 fw-bold text-warning">${revenueStats.month.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-3">
                    <div className="stat-icon-mini bg-primary-subtle text-primary">
                      <TrendingUp size={24} />
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block">Total Histórico</small>
                      <h4 className="mb-0 fw-bold text-primary">${revenueStats.total.toLocaleString()}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Distribution */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Distribución por Método de Pago</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">💵 Efectivo</span>
                      <span className="fw-semibold">${methodStats.cash.toLocaleString()} ({getMethodPercentage(methodStats.cash)}%)</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${getMethodPercentage(methodStats.cash)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">💳 Tarjeta</span>
                      <span className="fw-semibold">${methodStats.card.toLocaleString()} ({getMethodPercentage(methodStats.card)}%)</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${getMethodPercentage(methodStats.card)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">📱 QR</span>
                      <span className="fw-semibold">${methodStats.qr.toLocaleString()} ({getMethodPercentage(methodStats.qr)}%)</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-info"
                        style={{ width: `${getMethodPercentage(methodStats.qr)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-0">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">🔄 Otros</span>
                      <span className="fw-semibold">${methodStats.other.toLocaleString()} ({getMethodPercentage(methodStats.other)}%)</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-secondary"
                        style={{ width: `${getMethodPercentage(methodStats.other)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h5 className="fw-bold mb-4">Resumen de Transacciones</h5>
                  <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
                    <div>
                      <small className="text-muted d-block">Total de Pagos</small>
                      <h4 className="mb-0 fw-bold">{payments.length}</h4>
                    </div>
                    <div className="stat-icon-mini bg-primary-subtle text-primary">
                      <BarChart3 size={24} />
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
                    <div>
                      <small className="text-muted d-block">Promedio por Pago</small>
                      <h4 className="mb-0 fw-bold">
                        ${payments.length > 0 ? Math.round(revenueStats.total / payments.length).toLocaleString() : 0}
                      </h4>
                    </div>
                    <div className="stat-icon-mini bg-success-subtle text-success">
                      <DollarSign size={24} />
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                    <div>
                      <small className="text-muted d-block">Promedio Diario (30 días)</small>
                      <h4 className="mb-0 fw-bold">
                        ${Math.round(revenueStats.month / 30).toLocaleString()}
                      </h4>
                    </div>
                    <div className="stat-icon-mini bg-info-subtle text-info">
                      <Calendar size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Filtrar por Fecha</h5>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label">Desde</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Hasta</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
              {(dateFrom || dateTo) && (
                <div className="mt-3 p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Total en Rango Seleccionado:</span>
                    <h4 className="mb-0 fw-bold text-success">${filteredTotal.toLocaleString()}</h4>
                  </div>
                  <small className="text-muted">
                    {filteredPayments.length} pagos encontrados
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-4">Últimas Transacciones</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 fw-semibold">Fecha</th>
                      <th className="px-4 py-3 fw-semibold">Método</th>
                      <th className="px-4 py-3 fw-semibold">Sesión</th>
                      <th className="px-4 py-3 fw-semibold text-end">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 10).map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3">
                          <small>{new Date(payment.created_at).toLocaleString('es-ES')}</small>
                        </td>
                        <td className="px-4 py-3">
                          {payment.method === 1 && <span className="badge bg-success">Efectivo</span>}
                          {payment.method === 2 && <span className="badge bg-primary">Tarjeta</span>}
                          {payment.method === 3 && <span className="badge bg-info">QR</span>}
                          {payment.method === 4 && <span className="badge bg-secondary">Otro</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-muted">Sesión #{payment.session_id}</span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <span className="fw-bold text-success">${Number(payment.amount).toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
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
