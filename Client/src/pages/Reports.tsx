import { useState, useEffect } from 'react';
import { paymentApi, sessionApi, reservationApi } from '../services/api';
import './Reports.css';

interface ReportData {
  daily: { date: string; revenue: number; sessions: number }[];
  monthly: { month: string; revenue: number; sessions: number }[];
  byPaymentMethod: { method: string; amount: number; count: number }[];
  byTable: { table: string; revenue: number; sessions: number }[];
}

export function Reports() {
  const [reportData, setReportData] = useState<ReportData>({
    daily: [],
    monthly: [],
    byPaymentMethod: [],
    byTable: [],
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [avgSessionValue, setAvgSessionValue] = useState(0);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, sessionsRes] = await Promise.all([
        paymentApi.getAll(),
        sessionApi.getAll(),
      ]);

      const payments = paymentsRes.data.filter((p: any) => {
        return p.payment_date >= dateRange.start && p.payment_date <= dateRange.end;
      });

      const sessions = sessionsRes.data.filter((s: any) => {
        const sessionDate = new Date(s.start_time).toISOString().split('T')[0];
        return sessionDate >= dateRange.start && sessionDate <= dateRange.end && s.status === 2;
      });

      // Calcular totales
      const revenue = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      setTotalRevenue(revenue);
      setTotalSessions(sessions.length);
      setAvgSessionValue(sessions.length > 0 ? revenue / sessions.length : 0);

      // Agrupar por día
      const dailyMap = new Map<string, { revenue: number; sessions: number }>();
      payments.forEach((p: any) => {
        const existing = dailyMap.get(p.payment_date) || { revenue: 0, sessions: 0 };
        dailyMap.set(p.payment_date, {
          revenue: existing.revenue + p.amount,
          sessions: existing.sessions + 1,
        });
      });
      const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        ...data,
      })).sort((a, b) => a.date.localeCompare(b.date));

      // Agrupar por mes
      const monthlyMap = new Map<string, { revenue: number; sessions: number }>();
      payments.forEach((p: any) => {
        const month = p.payment_date.substring(0, 7);
        const existing = monthlyMap.get(month) || { revenue: 0, sessions: 0 };
        monthlyMap.set(month, {
          revenue: existing.revenue + p.amount,
          sessions: existing.sessions + 1,
        });
      });
      const monthly = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        ...data,
      }));

      // Agrupar por método de pago
      const paymentMethodMap = new Map<number, { amount: number; count: number }>();
      payments.forEach((p: any) => {
        const existing = paymentMethodMap.get(p.payment_method) || { amount: 0, count: 0 };
        paymentMethodMap.set(p.payment_method, {
          amount: existing.amount + p.amount,
          count: existing.count + 1,
        });
      });
      const byPaymentMethod = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
        method: getPaymentMethodName(method),
        ...data,
      }));

      // Agrupar por mesa
      const tableMap = new Map<number, { revenue: number; sessions: number }>();
      sessions.forEach((s: any) => {
        const payment = payments.find((p: any) => p.session_id === s.id);
        if (payment) {
          const existing = tableMap.get(s.table_id) || { revenue: 0, sessions: 0 };
          tableMap.set(s.table_id, {
            revenue: existing.revenue + payment.amount,
            sessions: existing.sessions + 1,
          });
        }
      });
      const byTable = Array.from(tableMap.entries()).map(([tableId, data]) => ({
        table: `Mesa ${tableId}`,
        ...data,
      }));

      setReportData({ daily, monthly, byPaymentMethod, byTable });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodName = (method: number) => {
    const names: Record<number, string> = {
      1: 'Efectivo',
      2: 'Tarjeta',
      3: 'QR',
      4: 'Otro',
    };
    return names[method] || 'Desconocido';
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Ingresos (Bs)', 'Sesiones'];
    const rows = reportData.daily.map((d) => [d.date, d.revenue.toFixed(2), d.sessions]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${dateRange.start}_${dateRange.end}.csv`;
    a.click();
  };

  if (loading) return <div className="loading">Cargando reportes...</div>;

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>📊 Reportes y Análisis</h1>
        <button onClick={exportToCSV} className="btn-export">
          📥 Exportar CSV
        </button>
      </div>

      {/* Filtro de fechas */}
      <div className="date-filter">
        <div className="date-input-group">
          <label>Fecha Inicio:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>
        <div className="date-input-group">
          <label>Fecha Fin:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
        <button onClick={loadReportData} className="btn-apply">
          Aplicar
        </button>
      </div>

      {/* Resumen general */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>💰 Ingresos Totales</h3>
          <p className="summary-value">Bs {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>🎱 Total Sesiones</h3>
          <p className="summary-value">{totalSessions}</p>
        </div>
        <div className="summary-card">
          <h3>📈 Promedio por Sesión</h3>
          <p className="summary-value">Bs {avgSessionValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Ingresos diarios */}
      <div className="report-section">
        <h2>Ingresos Diarios</h2>
        <div className="chart-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ingresos (Bs)</th>
                <th>Sesiones</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {reportData.daily.map((item) => (
                <tr key={item.date}>
                  <td>{item.date}</td>
                  <td>Bs {item.revenue.toFixed(2)}</td>
                  <td>{item.sessions}</td>
                  <td>Bs {(item.revenue / item.sessions).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Por método de pago */}
      <div className="report-section">
        <h2>Por Método de Pago</h2>
        <div className="payment-methods-grid">
          {reportData.byPaymentMethod.map((item) => (
            <div key={item.method} className="payment-method-card">
              <h4>{item.method}</h4>
              <p className="method-amount">Bs {item.amount.toFixed(2)}</p>
              <p className="method-count">{item.count} transacciones</p>
              <div className="method-percentage">
                {((item.amount / totalRevenue) * 100).toFixed(1)}% del total
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Por mesa */}
      <div className="report-section">
        <h2>Rendimiento por Mesa</h2>
        <div className="tables-grid">
          {reportData.byTable
            .sort((a, b) => b.revenue - a.revenue)
            .map((item) => (
              <div key={item.table} className="table-performance-card">
                <h4>{item.table}</h4>
                <div className="performance-stats">
                  <div>
                    <label>Ingresos:</label>
                    <span>Bs {item.revenue.toFixed(2)}</span>
                  </div>
                  <div>
                    <label>Sesiones:</label>
                    <span>{item.sessions}</span>
                  </div>
                  <div>
                    <label>Promedio:</label>
                    <span>Bs {(item.revenue / item.sessions).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Resumen mensual */}
      {reportData.monthly.length > 0 && (
        <div className="report-section">
          <h2>Resumen Mensual</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Ingresos (Bs)</th>
                <th>Sesiones</th>
                <th>Promedio/Día</th>
              </tr>
            </thead>
            <tbody>
              {reportData.monthly.map((item) => (
                <tr key={item.month}>
                  <td>{item.month}</td>
                  <td>Bs {item.revenue.toFixed(2)}</td>
                  <td>{item.sessions}</td>
                  <td>Bs {(item.revenue / 30).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
