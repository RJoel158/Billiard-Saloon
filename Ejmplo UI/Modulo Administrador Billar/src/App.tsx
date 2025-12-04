import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MesasView } from './components/MesasView';
import { SesionesView } from './components/SesionesView';
import { PagosView } from './components/PagosView';
import { ReservasView } from './components/ReservasView';
import { GananciasView } from './components/GananciasView';

export type ViewType = 'dashboard' | 'mesas' | 'sesiones' | 'pagos' | 'reservas' | 'ganancias';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'mesas':
        return <MesasView />;
      case 'sesiones':
        return <SesionesView />;
      case 'pagos':
        return <PagosView />;
      case 'reservas':
        return <ReservasView />;
      case 'ganancias':
        return <GananciasView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
}
