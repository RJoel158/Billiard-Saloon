import { useEffect, useState } from 'react';
import { CreditCard, DollarSign, Calendar, Filter, Download } from 'lucide-react';
import { pagosService, type Payment } from '../../services';
import { Pagination } from '../Pagination';

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterMethod, setFilterMethod] = useState<number | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await pagosService.getAll(currentPage, 10);
      setPayments(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getMethodBadge = (method: number) => {
    switch (method) {
      case 1:
        return <span className="badge bg-success">Efectivo</span>;
      case 2:
        return <span className="badge bg-primary">Tarjeta</span>;
      case 3:
        return <span className="badge bg-info">QR</span>;
      case 4:
        return <span className="badge bg-secondary">Otro</span>;
      default:
        return <span className="badge bg-secondary">Desconocido</span>;
    }
  };

  const getMethodIcon = (method: number) => {
    switch (method) {
      case 1:
        return <DollarSign size={18} className="text-success" />;
      case 2:
        return <CreditCard size={18} className="text-primary" />;
      case 3:
        return <CreditCard size={18} className="text-info" />;
      default:
        return <CreditCard size={18} className="text-secondary" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    const paymentDate = new Date(payment.created_at);
    const matchesDateFrom = !dateFrom || paymentDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || paymentDate <= new Date(dateTo);
    return matchesMethod && matchesDateFrom && matchesDateTo;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  return (
    <div className="container-fluid p-4" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">
              <CreditCard size={32} className="me-2" style={{ verticalAlign: 'middle' }} />
              Gestión de Pagos
            </h1>
            <p className="text-muted mb-0">Historial y control de pagos recibidos</p>
          </div>
          <button className="btn btn-outline-primary">
            <Download size={20} className="me-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-mini bg-success-subtle text-success">
                  <DollarSign size={24} />
                </div>
                <div>
                  <small className="text-muted d-block">Total Filtrado</small>
                  <h4 className="mb-0 fw-bold">${totalAmount.toLocaleString()}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-mini bg-primary-subtle text-primary">
                  <CreditCard size={24} />
                </div>
                <div>
                  <small className="text-muted d-block">Total Pagos</small>
                  <h4 className="mb-0 fw-bold">{filteredPayments.length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-mini bg-info-subtle text-info">
                  <DollarSign size={24} />
                </div>
                <div>
                  <small className="text-muted d-block">Promedio</small>
                  <h4 className="mb-0 fw-bold">
                    ${filteredPayments.length > 0 ? Math.round(totalAmount / filteredPayments.length) : 0}
                  </h4>
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
                  <Calendar size={24} />
                </div>
                <div>
                  <small className="text-muted d-block">Hoy</small>
                  <h4 className="mb-0 fw-bold">
                    {payments.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString()).length}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                <Filter size={16} className="me-1" />
                Método de Pago
              </label>
              <select
                className="form-select"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">Todos</option>
                <option value="1">Efectivo</option>
                <option value="2">Tarjeta</option>
                <option value="3">QR</option>
                <option value="4">Otro</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Fecha Desde</label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Fecha Hasta</label>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
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
                      <th className="px-4 py-3 fw-semibold">Fecha y Hora</th>
                      <th className="px-4 py-3 fw-semibold">Sesión</th>
                      <th className="px-4 py-3 fw-semibold">Cliente</th>
                      <th className="px-4 py-3 fw-semibold">Método</th>
                      <th className="px-4 py-3 fw-semibold text-end">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          No se encontraron pagos
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-3">
                            <span className="badge bg-light text-dark">#{payment.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <small>{new Date(payment.created_at).toLocaleString('es-ES')}</small>
                          </td>
                          <td className="px-4 py-3">
                            <span className="fw-semibold">Sesión #{payment.session_id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span>{payment.session?.user ? `${payment.session.user.first_name} ${payment.session.user.last_name}` : 'Walk-in'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center gap-2">
                              {getMethodIcon(payment.method)}
                              {getMethodBadge(payment.method)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <span className="fs-5 fw-bold text-success">${Number(payment.amount).toLocaleString()}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <td colSpan={5} className="px-4 py-3 fw-bold text-end">Total:</td>
                      <td className="px-4 py-3 text-end">
                        <span className="fs-4 fw-bold text-success">${totalAmount.toLocaleString()}</span>
                      </td>
                    </tr>
                  </tfoot>
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
