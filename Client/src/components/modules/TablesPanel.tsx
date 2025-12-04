import { useState, useEffect } from 'react';
import { tableApi, tableCategoryApi } from '../../services/api';

export function TablesPanel() {
  const [tables, setTables] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    code: '',
    description: '',
    status: '1',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tablesRes, categoriesRes] = await Promise.all([
        tableApi.getAll(),
        tableCategoryApi.getAll(),
      ]);
      setTables(tablesRes.data);
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
      if (editingId) {
        await tableApi.update(editingId, {
          ...formData,
          category_id: Number(formData.category_id),
          status: Number(formData.status),
        });
      } else {
        await tableApi.create({
          ...formData,
          category_id: Number(formData.category_id),
          status: Number(formData.status),
        });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ category_id: '', code: '', description: '', status: '1' });
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (table: any) => {
    setFormData({
      category_id: table.category_id.toString(),
      code: table.code,
      description: table.description || '',
      status: table.status.toString(),
    });
    setEditingId(table.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta mesa?')) return;
    try {
      await tableApi.delete(id);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const getStatusLabel = (status: number) => {
    const labels = { 1: 'Disponible', 2: 'Ocupada', 3: 'Mantenimiento' };
    return labels[status as keyof typeof labels] || 'Desconocido';
  };

  const getStatusClass = (status: number) => {
    const classes = { 1: 'status-available', 2: 'status-occupied', 3: 'status-pending' };
    return classes[status as keyof typeof classes] || '';
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'N/A';
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="module-panel">
      <div className="module-header">
        <h2>🎱 Mesas de Billar</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nueva Mesa
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table.id}>
              <td>{table.id}</td>
              <td><strong>{table.code}</strong></td>
              <td>{getCategoryName(table.category_id)}</td>
              <td>{table.description || '-'}</td>
              <td>
                <span className={`status-badge ${getStatusClass(table.status)}`}>
                  {getStatusLabel(table.status)}
                </span>
              </td>
              <td className="actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(table)}>
                  Editar
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(table.id)}>
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
              <h3>{editingId ? 'Editar Mesa' : 'Nueva Mesa'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Código *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
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
                  <label>Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="1">Disponible</option>
                    <option value="2">Ocupada</option>
                    <option value="3">Mantenimiento</option>
                  </select>
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
