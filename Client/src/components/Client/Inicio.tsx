import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

export function ClientInicio() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Bienvenido al Billar Club</h1>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Reserva tu Mesa Ahora</h2>
        <p className="mb-6">
          Disfruta de las mejores mesas de billar en la ciudad. ¡Reserva en línea y asegura tu lugar!
        </p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Ver Mesas Disponibles
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Reserva Fácil</h3>
          </div>
          <p className="text-gray-600">
            Reserva tu mesa con anticipación y evita esperas. Sistema en línea disponible 24/7.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Horario Flexible</h3>
          </div>
          <p className="text-gray-600">
            Abierto todos los días con horarios extendidos para tu comodidad.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Ubicación Central</h3>
          </div>
          <p className="text-gray-600">
            Fácil acceso y estacionamiento disponible. En el corazón de la ciudad.
          </p>
        </div>
      </div>

      {/* Categorías de Mesas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestras Mesas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Pool Estándar</h3>
            <p className="text-gray-600 mb-4">Mesa profesional de pool, perfecta para partidas casuales y torneos.</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-600">$12.50/hora</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Reservar
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Pool VIP</h3>
            <p className="text-gray-600 mb-4">Mesa premium con mayor tamaño y mejor acabado para una experiencia superior.</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-600">$15.50/hora</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
