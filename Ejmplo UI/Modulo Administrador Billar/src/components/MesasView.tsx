import { useBillarStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MesaEstado } from '../lib/types';

const estadoColors = {
  disponible: 'bg-green-500',
  ocupada: 'bg-red-500',
  reservada: 'bg-yellow-500',
  mantenimiento: 'bg-gray-500',
};

const estadoLabels = {
  disponible: 'Disponible',
  ocupada: 'Ocupada',
  reservada: 'Reservada',
  mantenimiento: 'Mantenimiento',
};

const tipoLabels = {
  pool: 'Pool',
  snooker: 'Snooker',
  carambola: 'Carambola',
};

export function MesasView() {
  const { mesas, updateMesaEstado } = useBillarStore();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl">Gestión de Mesas</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {mesas.filter(m => m.estado === 'disponible').length} Disponibles
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {mesas.filter(m => m.estado === 'ocupada').length} Ocupadas
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {mesas.filter(m => m.estado === 'reservada').length} Reservadas
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mesas.map((mesa) => (
          <Card key={mesa.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2 ${estadoColors[mesa.estado]}`} />
            
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mesa {mesa.numero}</span>
                <Badge variant="secondary">{tipoLabels[mesa.tipo]}</Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <p className="text-lg">{estadoLabels[mesa.estado]}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Tarifa por hora</p>
                <p className="text-lg">${mesa.tarifaPorHora.toLocaleString()}</p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Cambiar Estado
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cambiar Estado - Mesa {mesa.numero}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm">Nuevo Estado</label>
                      <Select
                        defaultValue={mesa.estado}
                        onValueChange={(value) => updateMesaEstado(mesa.id, value as MesaEstado)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disponible">Disponible</SelectItem>
                          <SelectItem value="ocupada">Ocupada</SelectItem>
                          <SelectItem value="reservada">Reservada</SelectItem>
                          <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
