import { useBillarStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CreditCard, DollarSign } from 'lucide-react';
import { Input } from './ui/input';
import { useState } from 'react';

export function PagosView() {
  const { pagos } = useBillarStore();
  const [filtro, setFiltro] = useState('');

  const totalPagos = pagos.reduce((sum, p) => sum + p.monto, 0);
  const pagosPorEfectivo = pagos.filter(p => p.metodoPago === 'efectivo').reduce((sum, p) => sum + p.monto, 0);
  const pagosPorTarjeta = pagos.filter(p => p.metodoPago === 'tarjeta').reduce((sum, p) => sum + p.monto, 0);
  const pagosPorTransferencia = pagos.filter(p => p.metodoPago === 'transferencia').reduce((sum, p) => sum + p.monto, 0);

  const pagosHoy = pagos.filter(p => {
    const hoy = new Date();
    return p.fecha.toDateString() === hoy.toDateString();
  });
  const totalHoy = pagosHoy.reduce((sum, p) => sum + p.monto, 0);

  const pagosFiltrados = pagos.filter(p => 
    p.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
    p.numeroMesa.toString().includes(filtro)
  );

  const getMetodoPagoColor = (metodo: string) => {
    switch (metodo) {
      case 'efectivo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'tarjeta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'transferencia':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return '';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-8">Gestión de Pagos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Pagos</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalPagos.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{pagos.length} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pagos Hoy</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalHoy.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{pagosHoy.length} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Efectivo</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${pagosPorEfectivo.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round((pagosPorEfectivo / totalPagos) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tarjeta/Transfer</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${(pagosPorTarjeta + pagosPorTransferencia).toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(((pagosPorTarjeta + pagosPorTransferencia) / totalPagos) * 100)}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historial de Pagos</span>
            <Input
              placeholder="Buscar por cliente o mesa..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-xs"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagosFiltrados.map(pago => (
                <TableRow key={pago.id}>
                  <TableCell>
                    {pago.fecha.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit',
                      year: 'numeric'
                    })}
                    {' '}
                    {pago.fecha.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </TableCell>
                  <TableCell>Mesa {pago.numeroMesa}</TableCell>
                  <TableCell>{pago.cliente}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getMetodoPagoColor(pago.metodoPago)}>
                      {pago.metodoPago.charAt(0).toUpperCase() + pago.metodoPago.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${pago.monto.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
