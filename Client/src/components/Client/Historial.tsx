import { Clock } from 'lucide-react';

export function ClientHistorial() {
  // TODO: Fetch historial from API
  const historial = [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Historial de Sesiones</h1>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sesiones</h3>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Horas Jugadas</h3>
          <div className="text-3xl font-bold text-blue-600">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Gastado</h3>
          <div className="text-3xl font-bold text-green-600">$0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Este Mes</h3>
          <div className="text-3xl font-bold text-purple-600">0</div>
        </div>
      </div>

      {/* Lista de historial */}
      <div className="bg-white rounded-lg shadow">
        {historial.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin historial</h3>
            <p className="text-gray-600">
              Tus sesiones anteriores aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Aquí irá el historial cuando se implemente */}
          </div>
        )}
      </div>
    </div>
  );
}
