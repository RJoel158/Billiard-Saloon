import { useBillarStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table2, Clock, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function Dashboard() {
  const { mesas, sesiones, pagos, reservas } = useBillarStore();
  
  const mesasDisponibles = mesas.filter(m => m.estado === 'disponible').length;
  const sesionesActivas = sesiones.filter(s => s.activa).length;
  const gananciasHoy = pagos
    .filter(p => {
      const hoy = new Date();
      return p.fecha.toDateString() === hoy.toDateString();
    })
    .reduce((sum, p) => sum + p.monto, 0);
  const reservasHoy = reservas.filter(r => {
    const hoy = new Date();
    return r.fecha.toDateString() === hoy.toDateString();
  }).length;

  // Datos para gráfico de barras - pagos por método
  const pagosPorMetodo = pagos.reduce((acc, pago) => {
    acc[pago.metodoPago] = (acc[pago.metodoPago] || 0) + pago.monto;
    return acc;
  }, {} as Record<string, number>);

  const dataPagos = Object.entries(pagosPorMetodo).map(([metodo, monto]) => ({
    metodo: metodo.charAt(0).toUpperCase() + metodo.slice(1),
    monto,
  }));

  // Datos para gráfico de pie - estado de mesas
  const mesasPorEstado = mesas.reduce((acc, mesa) => {
    acc[mesa.estado] = (acc[mesa.estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dataMesas = Object.entries(mesasPorEstado).map(([estado, cantidad]) => ({
    name: estado.charAt(0).toUpperCase() + estado.slice(1),
    value: cantidad,
  }));

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Mesas Disponibles</CardTitle>
            <Table2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mesasDisponibles} / {mesas.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((mesasDisponibles / mesas.length) * 100)}% disponibilidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Sesiones Activas</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{sesionesActivas}</div>
            <p className="text-xs text-gray-500 mt-1">
              En juego ahora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ganancias Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${gananciasHoy.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {pagos.filter(p => {
                const hoy = new Date();
                return p.fecha.toDateString() === hoy.toDateString();
              }).length} pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Reservas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reservasHoy}</div>
            <p className="text-xs text-gray-500 mt-1">
              Programadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pagos por Método</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataPagos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metodo" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="monto" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Mesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataMesas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataMesas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sesiones Activas</CardTitle>
        </CardHeader>
        <CardContent>
          {sesionesActivas === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay sesiones activas</p>
          ) : (
            <div className="space-y-4">
              {sesiones
                .filter(s => s.activa)
                .map(sesion => {
                  const mesa = mesas.find(m => m.id === sesion.mesaId);
                  const tiempoTranscurrido = Math.floor((Date.now() - sesion.horaInicio.getTime()) / (1000 * 60));
                  const montoActual = mesa ? Math.ceil((tiempoTranscurrido / 60) * mesa.tarifaPorHora) : 0;
                  
                  return (
                    <div key={sesion.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Mesa {sesion.numeroMesa}</p>
                        <p className="text-sm text-gray-500">{sesion.cliente}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{tiempoTranscurrido} minutos</p>
                        <p className="text-sm text-gray-500">${montoActual.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
