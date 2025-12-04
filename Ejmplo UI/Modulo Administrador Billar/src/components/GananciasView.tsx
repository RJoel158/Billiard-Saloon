import { useMemo, useState } from 'react';
import { useBillarStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function GananciasView() {
  const { pagos } = useBillarStore();
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes'>('dia');

  const estadisticas = useMemo(() => {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    
    // Ganancias hoy
    const gananciasDia = pagos
      .filter(p => p.fecha >= hoy)
      .reduce((sum, p) => sum + p.monto, 0);

    // Ganancias última semana
    const haceSemana = new Date(hoy);
    haceSemana.setDate(haceSemana.getDate() - 7);
    const gananciasSemana = pagos
      .filter(p => p.fecha >= haceSemana)
      .reduce((sum, p) => sum + p.monto, 0);

    // Ganancias último mes
    const haceMes = new Date(hoy);
    haceMes.setDate(haceMes.getDate() - 30);
    const gananciasMes = pagos
      .filter(p => p.fecha >= haceMes)
      .reduce((sum, p) => sum + p.monto, 0);

    // Total histórico
    const totalHistorico = pagos.reduce((sum, p) => sum + p.monto, 0);

    // Promedio por sesión
    const promedioSesion = pagos.length > 0 ? totalHistorico / pagos.length : 0;

    return {
      gananciasDia,
      gananciasSemana,
      gananciasMes,
      totalHistorico,
      promedioSesion,
    };
  }, [pagos]);

  // Datos para gráfico de tendencia diaria (últimos 7 días)
  const datosDiarios = useMemo(() => {
    const datos: { fecha: string; monto: number }[] = [];
    const ahora = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(ahora);
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      
      const montoDelDia = pagos
        .filter(p => {
          return p.fecha.toDateString() === fecha.toDateString();
        })
        .reduce((sum, p) => sum + p.monto, 0);
      
      datos.push({ fecha: fechaStr, monto: montoDelDia });
    }
    
    return datos;
  }, [pagos]);

  // Datos por método de pago
  const datosPorMetodo = useMemo(() => {
    const metodos = ['efectivo', 'tarjeta', 'transferencia'];
    return metodos.map(metodo => ({
      metodo: metodo.charAt(0).toUpperCase() + metodo.slice(1),
      monto: pagos
        .filter(p => p.metodoPago === metodo)
        .reduce((sum, p) => sum + p.monto, 0),
    }));
  }, [pagos]);

  // Datos por hora del día
  const datosPorHora = useMemo(() => {
    const horas = Array.from({ length: 24 }, (_, i) => i);
    return horas.map(hora => ({
      hora: `${hora}:00`,
      monto: pagos
        .filter(p => p.fecha.getHours() === hora)
        .reduce((sum, p) => sum + p.monto, 0),
    })).filter(d => d.monto > 0);
  }, [pagos]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Análisis de Ganancias</h1>
        <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dia">Hoy</SelectItem>
            <SelectItem value="semana">Última Semana</SelectItem>
            <SelectItem value="mes">Último Mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ganancias Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${estadisticas.gananciasDia.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {pagos.filter(p => {
                const hoy = new Date();
                return p.fecha.toDateString() === hoy.toDateString();
              }).length} transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Última Semana</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${estadisticas.gananciasSemana.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Últimos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Último Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${estadisticas.gananciasMes.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Promedio/Sesión</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${Math.round(estadisticas.promedioSesion).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Por transacción</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={datosDiarios}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="monto" stroke="#3b82f6" name="Ganancias" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ganancias por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosPorMetodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metodo" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="monto" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución por Horas del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosPorHora}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hora" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Bar dataKey="monto" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">${estadisticas.totalHistorico.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-2">
              Todas las transacciones registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Efectivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              ${pagos.filter(p => p.metodoPago === 'efectivo').reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((pagos.filter(p => p.metodoPago === 'efectivo').reduce((sum, p) => sum + p.monto, 0) / estadisticas.totalHistorico) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Digital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              ${pagos.filter(p => p.metodoPago !== 'efectivo').reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((pagos.filter(p => p.metodoPago !== 'efectivo').reduce((sum, p) => sum + p.monto, 0) / estadisticas.totalHistorico) * 100)}% del total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
