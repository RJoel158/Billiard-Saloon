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
import { Clock, Play, Square } from 'lucide-react';
import { MetodoPago } from '../lib/types';

export function SesionesView() {
  const { mesas, sesiones, iniciarSesion, finalizarSesion } = useBillarStore();
  const [open, setOpen] = useState(false);
  const [selectedMesaId, setSelectedMesaId] = useState('');
  const [cliente, setCliente] = useState('');
  const [openFinalizar, setOpenFinalizar] = useState(false);
  const [sesionToFinalize, setSesionToFinalize] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');

  const mesasDisponibles = mesas.filter(m => m.estado === 'disponible');
  const sesionesActivas = sesiones.filter(s => s.activa);

  const handleIniciar = () => {
    if (selectedMesaId && cliente) {
      iniciarSesion(selectedMesaId, cliente);
      setSelectedMesaId('');
      setCliente('');
      setOpen(false);
    }
  };

  const handleFinalizar = () => {
    if (sesionToFinalize && metodoPago) {
      finalizarSesion(sesionToFinalize, metodoPago);
      setSesionToFinalize('');
      setOpenFinalizar(false);
    }
  };

  const getTiempoTranscurrido = (horaInicio: Date) => {
    const minutos = Math.floor((Date.now() - horaInicio.getTime()) / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  };

  const getMontoActual = (sesion: typeof sesiones[0]) => {
    const mesa = mesas.find(m => m.id === sesion.mesaId);
    if (!mesa) return 0;
    const minutos = Math.floor((Date.now() - sesion.horaInicio.getTime()) / (1000 * 60));
    return Math.ceil((minutos / 60) * mesa.tarifaPorHora);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Sesiones</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Iniciar Nueva Sesión</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="mesa">Mesa</Label>
                <Select value={selectedMesaId} onValueChange={setSelectedMesaId}>
                  <SelectTrigger id="mesa">
                    <SelectValue placeholder="Seleccionar mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mesasDisponibles.map(mesa => (
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
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
              <Button onClick={handleIniciar} className="w-full" disabled={!selectedMesaId || !cliente}>
                Iniciar Sesión
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Sesiones Activas</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{sesionesActivas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Sesiones Hoy</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {sesiones.filter(s => {
                const hoy = new Date();
                return s.horaInicio.toDateString() === hoy.toDateString();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Mesas Disponibles</CardTitle>
            <Play className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mesasDisponibles.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones Activas</CardTitle>
        </CardHeader>
        <CardContent>
          {sesionesActivas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay sesiones activas</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Hora Inicio</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sesionesActivas.map(sesion => (
                  <TableRow key={sesion.id}>
                    <TableCell>Mesa {sesion.numeroMesa}</TableCell>
                    <TableCell>{sesion.cliente}</TableCell>
                    <TableCell>
                      {sesion.horaInicio.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell>{getTiempoTranscurrido(sesion.horaInicio)}</TableCell>
                    <TableCell>${getMontoActual(sesion).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">Activa</Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog open={openFinalizar && sesionToFinalize === sesion.id} onOpenChange={(open) => {
                        setOpenFinalizar(open);
                        if (!open) setSesionToFinalize('');
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSesionToFinalize(sesion.id);
                              setOpenFinalizar(true);
                            }}
                          >
                            <Square className="w-4 h-4 mr-1" />
                            Finalizar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Finalizar Sesión</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Mesa:</span>
                                <span>{sesion.numeroMesa}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Cliente:</span>
                                <span>{sesion.cliente}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Tiempo:</span>
                                <span>{getTiempoTranscurrido(sesion.horaInicio)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Total a pagar:</span>
                                <span className="text-lg">${getMontoActual(sesion).toLocaleString()}</span>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="metodoPago">Método de Pago</Label>
                              <Select value={metodoPago} onValueChange={(value) => setMetodoPago(value as MetodoPago)}>
                                <SelectTrigger id="metodoPago">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="efectivo">Efectivo</SelectItem>
                                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                  <SelectItem value="transferencia">Transferencia</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={handleFinalizar} className="w-full">
                              Confirmar Pago y Finalizar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Historial de Sesiones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mesa</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sesiones
                .filter(s => !s.activa)
                .slice(0, 10)
                .map(sesion => (
                  <TableRow key={sesion.id}>
                    <TableCell>Mesa {sesion.numeroMesa}</TableCell>
                    <TableCell>{sesion.cliente}</TableCell>
                    <TableCell>
                      {sesion.horaInicio.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell>
                      {sesion.horaFin?.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell>{sesion.duracionMinutos} min</TableCell>
                    <TableCell>${sesion.monto?.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
