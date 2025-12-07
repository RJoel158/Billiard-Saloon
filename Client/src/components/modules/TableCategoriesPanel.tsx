import { useState, useEffect } from 'react';
import { tableCategoryApi } from '../../services/api';

export function TableCategoriesPanel() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await tableCategoryApi.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price),
      };
      if (editingId) {
        await tableCategoryApi.update(editingId, payload);
      } else {
        await tableCategoryApi.create(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', base_price: '' });
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      base_price: category.base_price.toString(),
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await tableCategoryApi.delete(id);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="module-panel">
      <div className="module-header">
        <h2>📂 Categorías de Mesas</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nueva Categoría
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio Base/Hora</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td><strong>{category.name}</strong></td>
              <td>{category.description || '-'}</td>
              <td>Bs {category.base_price.toFixed(2)}</td>
              <td className="actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(category)}>
                  Editar
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(category.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Precio Base por Hora (Bs) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  required
                />
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
