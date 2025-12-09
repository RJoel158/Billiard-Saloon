import { useState, useEffect } from 'react';
import { dynamicPricingApi, tableCategoryApi } from '../../services/api';

export function DynamicPricingPanel() {
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    multiplier: '1.0',
    description: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pricingRes, categoriesRes] = await Promise.all([
        dynamicPricingApi.getAll(),
        tableCategoryApi.getAll(),
      ]);
      setPricingRules(pricingRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        category_id: Number(formData.category_id),
        day_of_week: formData.day_of_week ? Number(formData.day_of_week) : undefined,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        multiplier: parseFloat(formData.multiplier),
        description: formData.description || undefined,
      };
      if (editingId) {
        await dynamicPricingApi.update(editingId, payload);
      } else {
        await dynamicPricingApi.create(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        category_id: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        multiplier: '1.0',
        description: '',
      });
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (rule: any) => {
    setFormData({
      category_id: rule.category_id.toString(),
      day_of_week: rule.day_of_week?.toString() || '',
      start_time: rule.start_time || '',
      end_time: rule.end_time || '',
      multiplier: rule.multiplier.toString(),
      description: rule.description || '',
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta regla de precios?')) return;
    try {
      await dynamicPricingApi.delete(id);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const getDayName = (day: number | null) => {
    if (day === null) return 'Todos';
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[day] || 'N/A';
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'N/A';
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="module-panel">
      <div className="module-header">
        <h2>💲 Precios Dinámicos</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nueva Regla
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Categoría</th>
            <th>Día</th>
            <th>Horario</th>
            <th>Multiplicador</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pricingRules.map((rule) => (
            <tr key={rule.id}>
              <td>{rule.id}</td>
              <td>{getCategoryName(rule.category_id)}</td>
              <td>{getDayName(rule.day_of_week)}</td>
              <td>
                {rule.start_time || 'Todo el día'} - {rule.end_time || ''}
              </td>
              <td><strong>x{rule.multiplier}</strong></td>
              <td>{rule.description || '-'}</td>
              <td className="actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(rule)}>
                  Editar
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(rule.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Regla' : 'Nueva Regla de Precios'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Día de la Semana</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                  >
                    <option value="">Todos los días</option>
                    <option value="0">Domingo</option>
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Hora Inicio</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Hora Fin</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Multiplicador *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.multiplier}
                    onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
                    required
                  />
                  <small>Ej: 1.5 = +50%, 0.8 = -20%</small>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Ej: Precio especial fines de semana"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
