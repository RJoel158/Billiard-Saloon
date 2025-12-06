import { useEffect, useState } from 'react';
import { Settings, Clock, Calendar, DollarSign, Building2, Save, RotateCcw } from 'lucide-react';
import { settingsService, type SystemSetting } from '../../services/settings.service';

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'reservations' | 'pricing' | 'business'>('schedule');
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAll();
      setSettings(data);
      
      // Inicializar formData con los valores actuales
      const initialData: { [key: string]: any } = {};
      data.forEach(setting => {
        initialData[setting.key] = setting.value;
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Preparar solo los campos que cambiaron
      const updates = Object.keys(formData).filter(key => {
        const setting = settings.find(s => s.key === key);
        return setting && setting.value !== formData[key];
      }).map(key => ({
        key,
        value: formData[key]
      }));

      if (updates.length > 0) {
        await settingsService.updateBatch(updates);
        await fetchSettings();
        setHasChanges(false);
        alert('Configuración guardada exitosamente');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const initialData: { [key: string]: any } = {};
    settings.forEach(setting => {
      initialData[setting.key] = setting.value;
    });
    setFormData(initialData);
    setHasChanges(false);
  };

  const renderField = (setting: SystemSetting) => {
    const value = formData[setting.key] ?? setting.value;

    switch (setting.type) {
      case 'boolean':
        return (
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id={setting.key}
              checked={value === true || value === 'true'}
              onChange={(e) => handleChange(setting.key, e.target.checked)}
            />
            <label className="form-check-label" htmlFor={setting.key}>
              {setting.description}
            </label>
          </div>
        );

      case 'time':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold">{setting.description}</label>
            <input
              type="time"
              className="form-control"
              value={value}
              onChange={(e) => handleChange(setting.key, e.target.value)}
            />
          </div>
        );

      case 'number':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold">{setting.description}</label>
            <input
              type="number"
              className="form-control"
              value={value}
              onChange={(e) => handleChange(setting.key, e.target.value)}
              step={setting.key.includes('rate') || setting.key.includes('tax') ? '0.01' : '1'}
            />
          </div>
        );

      default:
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold">{setting.description}</label>
            <input
              type="text"
              className="form-control"
              value={value}
              onChange={(e) => handleChange(setting.key, e.target.value)}
            />
          </div>
        );
    }
  };

  const scheduleSettings = settings.filter(s => 
    s.key.includes('opening_') || s.key.includes('closing_') || s.key.includes('business_days')
  );

  const reservationSettings = settings.filter(s => 
    s.key.includes('reservation_') || s.key.includes('cancellation_') || s.key.includes('max_concurrent')
  );

  const pricingSettings = settings.filter(s => 
    s.key.includes('penalty') || s.key.includes('overtime') || s.key.includes('tax_') || 
    s.key.includes('grace_') || s.key.includes('currency')
  );

  const businessSettings = settings.filter(s => 
    s.key.includes('business_name') || s.key.includes('timezone') || s.key.includes('allow_walkin')
  );

  return (
    <div className="container-fluid p-4" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">
              <Settings size={32} className="me-2" style={{ verticalAlign: 'middle' }} />
              Configuración del Sistema
            </h1>
            <p className="text-muted mb-0">Gestiona los parámetros del negocio</p>
          </div>
          <div className="d-flex gap-2">
            {hasChanges && (
              <button className="btn btn-outline-secondary" onClick={handleReset}>
                <RotateCcw size={18} className="me-2" />
                Descartar
              </button>
            )}
            <button 
              className="btn btn-success" 
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              <Save size={18} className="me-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-3">
            {/* Sidebar Navigation */}
            <div className="card border-0 shadow-sm">
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'schedule' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schedule')}
                >
                  <Clock size={20} />
                  Horarios
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'reservations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reservations')}
                >
                  <Calendar size={20} />
                  Reservas
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'pricing' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pricing')}
                >
                  <DollarSign size={20} />
                  Precios y Multas
                </button>
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${activeTab === 'business' ? 'active' : ''}`}
                  onClick={() => setActiveTab('business')}
                >
                  <Building2 size={20} />
                  Negocio
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {/* Schedule Settings */}
                {activeTab === 'schedule' && (
                  <>
                    <h4 className="mb-4 fw-bold">
                      <Clock size={24} className="me-2" />
                      Configuración de Horarios
                    </h4>
                    <div className="row">
                      {scheduleSettings.map(setting => (
                        <div key={setting.key} className="col-md-6">
                          {renderField(setting)}
                        </div>
                      ))}
                    </div>
                    <div className="alert alert-info mt-3">
                      <strong>Nota:</strong> El horario de atención limita las reservas y sesiones a estos tiempos.
                    </div>
                  </>
                )}

                {/* Reservation Settings */}
                {activeTab === 'reservations' && (
                  <>
                    <h4 className="mb-4 fw-bold">
                      <Calendar size={24} className="me-2" />
                      Configuración de Reservas
                    </h4>
                    <div className="row">
                      {reservationSettings.map(setting => (
                        <div key={setting.key} className="col-md-6">
                          {renderField(setting)}
                        </div>
                      ))}
                    </div>
                    <div className="alert alert-info mt-3">
                      <strong>Nota:</strong> Estas configuraciones controlan las reglas de reservas del sistema.
                    </div>
                  </>
                )}

                {/* Pricing Settings */}
                {activeTab === 'pricing' && (
                  <>
                    <h4 className="mb-4 fw-bold">
                      <DollarSign size={24} className="me-2" />
                      Configuración de Precios
                    </h4>
                    <div className="row">
                      {pricingSettings.map(setting => (
                        <div key={setting.key} className="col-md-6">
                          {renderField(setting)}
                        </div>
                      ))}
                    </div>
                    <div className="alert alert-warning mt-3">
                      <strong>Importante:</strong> Las tasas y multas se aplican automáticamente en el cálculo de pagos.
                    </div>
                  </>
                )}

                {/* Business Settings */}
                {activeTab === 'business' && (
                  <>
                    <h4 className="mb-4 fw-bold">
                      <Building2 size={24} className="me-2" />
                      Configuración del Negocio
                    </h4>
                    <div className="row">
                      {businessSettings.map(setting => (
                        <div key={setting.key} className="col-md-6">
                          {renderField(setting)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
