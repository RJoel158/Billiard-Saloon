import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export function ClientPerfil() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Información Personal</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Nombre Completo</p>
                  <p className="font-semibold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Correo Electrónico</p>
                  <p className="font-semibold text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-semibold text-gray-900">
                    {user?.phone || 'No registrado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Miembro Desde</p>
                  <p className="font-semibold text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Editar Perfil
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Reservas Totales</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Horas de Juego</p>
                <p className="text-2xl font-bold text-green-600">0h</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gastado</p>
                <p className="text-2xl font-bold text-purple-600">$0</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-bold mb-2">¿Necesitas Ayuda?</h3>
            <p className="text-sm text-blue-100 mb-4">
              Contáctanos para cualquier consulta o problema
            </p>
            <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
