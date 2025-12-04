import { useState } from 'react';
import { useBillarStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar, Check, X, Plus } from 'lucide-react';

export function ReservasView() {
  const { mesas, reservas, agregarReserva, confirmarReserva, cancelarReserva } = useBillarStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    mesaId: '',
    cliente: '',
    telefono: '',
    fecha: '',
    horaInicio: '',
    duracionHoras: '1',
  });

  const mesasDisponiblesParaReserva = mesas.filter(m => m.estado === 'disponible' || m.estado === 'reservada');

  const handleSubmit = () => {
    if (formData.mesaId && formData.cliente && formData.telefono && formData.fecha && formData.horaInicio) {
      const mesa = mesas.find(m => m.id === formData.mesaId);
      if (!mesa) return;

      agregarReserva({
        id: `r${Date.now()}`,
        mesaId: formData.mesaId,
        numeroMesa: mesa.numero,
        cliente: formData.cliente,
        telefono: formData.telefono,
        fecha: new Date(formData.fecha),
        horaInicio: formData.horaInicio,
        duracionHoras: parseInt(formData.duracionHoras),
        confirmada: false,
      });

      setFormData({
        mesaId: '',
        cliente: '',
        telefono: '',
        fecha: '',
        horaInicio: '',
        duracionHoras: '1',
      });
      setOpen(false);
    }
  };

  const reservasHoy = reservas.filter(r => {
    const hoy = new Date();
    return r.fecha.toDateString() === hoy.toDateString();
  });

  const reservasFuturas = reservas.filter(r => {
    const hoy = new Date();
    return r.fecha > hoy;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Reservas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reserva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Reserva</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="mesa">Mesa</Label>
                <Select value={formData.mesaId} onValueChange={(value) => setFormData({ ...formData, mesaId: value })}>
                  <SelectTrigger id="mesa">
                    <SelectValue placeholder="Seleccionar mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mesasDisponiblesParaReserva.map(mesa => (
                      <SelectItem key={mesa.id} value={mesa.id}>
                        Mesa {mesa.numero} - ${mesa.tarifaPorHora.toLocaleString()}/hora
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Número de contacto"
                />
              </div>
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="hora">Hora de Inicio</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duracion">Duración (horas)</Label>
                <Select value={formData.duracionHoras} onValueChange={(value) => setFormData({ ...formData, duracionHoras: value })}>
                  <SelectTrigger id="duracion">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="3">3 horas</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Crear Reserva
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reservas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Reservas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reservasHoy.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Reservas Futuras</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reservasFuturas.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {reservas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay reservas registradas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservas
                  .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
                  .map(reserva => (
                    <TableRow key={reserva.id}>
                      <TableCell>
                        {reserva.fecha.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{reserva.horaInicio}</TableCell>
                      <TableCell>Mesa {reserva.numeroMesa}</TableCell>
                      <TableCell>{reserva.cliente}</TableCell>
                      <TableCell>{reserva.telefono}</TableCell>
                      <TableCell>{reserva.duracionHoras}h</TableCell>
                      <TableCell>
                        {reserva.confirmada ? (
                          <Badge className="bg-green-500">Confirmada</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!reserva.confirmada && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => confirmarReserva(reserva.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelarReserva(reserva.id)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
