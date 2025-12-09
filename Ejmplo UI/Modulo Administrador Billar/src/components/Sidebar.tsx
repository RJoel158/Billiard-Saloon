import { LayoutDashboard, Table2, Clock, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { ViewType } from '../App';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const menuItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'mesas' as ViewType, label: 'Mesas', icon: Table2 },
  { id: 'sesiones' as ViewType, label: 'Sesiones', icon: Clock },
  { id: 'pagos' as ViewType, label: 'Pagos', icon: CreditCard },
  { id: 'reservas' as ViewType, label: 'Reservas', icon: Calendar },
  { id: 'ganancias' as ViewType, label: 'Ganancias', icon: TrendingUp },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl text-white">Billar Admin</h1>
      </div>
      
      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors",
                currentView === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <p className="text-sm text-gray-400">Sistema de Gestión v1.0</p>
      </div>
    </div>
  );
}
