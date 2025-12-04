import { Calendar } from 'lucide-react';

export function ClientReservas() {
  // TODO: Fetch reservas from API
  const reservas = [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Nueva Reserva
        </button>
      </div>

      {/* Estado de reservas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pendientes</h3>
          <div className="text-3xl font-bold text-yellow-600">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Confirmadas</h3>
          <div className="text-3xl font-bold text-green-600">0</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Próximas</h3>
          <div className="text-3xl font-bold text-blue-600">0</div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="bg-white rounded-lg shadow">
        {reservas.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes reservas</h3>
            <p className="text-gray-600 mb-6">
              Comienza reservando una mesa para tu próxima partida
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Hacer una Reserva
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Aquí irán las reservas cuando se implementen */}
          </div>
        )}
      </div>
    </div>
  );
}
