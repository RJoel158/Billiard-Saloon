import { useState } from 'react';
import './TestPanel.css';
import { UsersPanel } from './modules/UsersPanel';
import { RolesPanel } from './modules/RolesPanel';
import { TableCategoriesPanel } from './modules/TableCategoriesPanel';
import { TablesPanel } from './modules/TablesPanel';
import { ReservationsPanel } from './modules/ReservationsPanel';
import { SessionsPanel } from './modules/SessionsPanel';
import { PaymentsPanel } from './modules/PaymentsPanel';
import { DynamicPricingPanel } from './modules/DynamicPricingPanel';

type Module = 
  | 'users' 
  | 'roles' 
  | 'categories' 
  | 'tables' 
  | 'reservations' 
  | 'sessions' 
  | 'payments' 
  | 'pricing';

export function TestPanel() {
  const [activeModule, setActiveModule] = useState<Module>('tables');

  const modules = [
    { id: 'users' as Module, name: 'Usuarios', icon: '👥' },
    { id: 'roles' as Module, name: 'Roles', icon: '🔐' },
    { id: 'categories' as Module, name: 'Categorías', icon: '📋' },
    { id: 'tables' as Module, name: 'Mesas', icon: '🎱' },
    { id: 'reservations' as Module, name: 'Reservas', icon: '📅' },
    { id: 'sessions' as Module, name: 'Sesiones', icon: '⏱️' },
    { id: 'payments' as Module, name: 'Pagos', icon: '💰' },
    { id: 'pricing' as Module, name: 'Precios', icon: '💲' },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'users':
        return <UsersPanel />;
      case 'roles':
        return <RolesPanel />;
      case 'categories':
        return <TableCategoriesPanel />;
      case 'tables':
        return <TablesPanel />;
      case 'reservations':
        return <ReservationsPanel />;
      case 'sessions':
        return <SessionsPanel />;
      case 'payments':
        return <PaymentsPanel />;
      case 'pricing':
        return <DynamicPricingPanel />;
      default:
        return <div>Selecciona un módulo</div>;
    }
  };

  return (
    <div className="test-panel">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>🎱 Billiard Saloon</h1>
          <p>Panel de Pruebas</p>
        </div>
        <nav className="sidebar-nav">
          {modules.map((module) => (
            <button
              key={module.id}
              className={`nav-item ${activeModule === module.id ? 'active' : ''}`}
              onClick={() => setActiveModule(module.id)}
            >
              <span className="icon">{module.icon}</span>
              <span className="label">{module.name}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">
        {renderModule()}
      </main>
    </div>
  );
}
