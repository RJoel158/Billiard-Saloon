import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Modal, Input } from '../components/ui';
import type { BilliardTable, TableCategory } from '../types';
import api from '../utils/api';
import { getTableStatusLabel, getTableStatusColor } from '../utils/formatters';
import './TablesManagement.css';

export function TablesManagement() {
  const [tables, setTables] = useState<BilliardTable[]>([]);
  const [categories, setCategories] = useState<TableCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<BilliardTable | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    code: '',
    description: '',
    status: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tablesRes, categoriesRes] = await Promise.all([
        api.get<BilliardTable[]>('/tables'),
        api.get<TableCategory[]>('/table-categories'),
      ]);
      setTables(tablesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (table?: BilliardTable) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        category_id: table.category_id.toString(),
        code: table.code,
        description: table.description || '',
        status: table.status,
      });
    } else {
      setEditingTable(null);
      setFormData({
        category_id: categories[0]?.id.toString() || '',
        code: '',
        description: '',
        status: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
      };

      if (editingTable) {
        await api.put(`/tables/${editingTable.id}`, payload);
      } else {
        await api.post('/tables', payload);
      }

      handleCloseModal();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta mesa?')) return;
    
    try {
      await api.delete(`/tables/${id}`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Error al eliminar');
    }
  };

  const handleStatusChange = async (id: number, newStatus: number) => {
    try {
      const table = tables.find(t => t.id === id);
      if (!table) return;

      await api.put(`/tables/${id}`, {
        ...table,
        status: newStatus,
      });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Error al actualizar estado');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Cargando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="tables-management">
        <div className="page-header">
          <div>
            <h2>Gestión de Mesas</h2>
            <p className="page-subtitle">Administra las mesas de billar del salón</p>
          </div>
          <Button onClick={() => handleOpenModal()}>+ Nueva Mesa</Button>
        </div>

        <div className="tables-grid">
          {tables.map((table) => {
            const category = categories.find(c => c.id === table.category_id);
            return (
              <Card key={table.id}>
                <div className="table-card">
                  <div className="table-card-header">
                    <div className="table-code">{table.code}</div>
                    <span className={`table-status status-${getTableStatusColor(table.status)}`}>
                      {getTableStatusLabel(table.status)}
                    </span>
                  </div>

                  <div className="table-info">
                    <div className="table-category">
                      {category?.name || 'Sin categoría'}
                    </div>
                    {table.description && (
                      <div className="table-description">{table.description}</div>
                    )}
                  </div>

                  <div className="table-actions">
                    <select
                      value={table.status}
                      onChange={(e) => handleStatusChange(table.id, parseInt(e.target.value))}
                      className="status-select"
                    >
                      <option value={1}>Disponible</option>
                      <option value={2}>Ocupada</option>
                      <option value={3}>Mantenimiento</option>
                    </select>
                    <Button size="sm" variant="secondary" onClick={() => handleOpenModal(table)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(table.id)}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTable ? 'Editar Mesa' : 'Nueva Mesa'}>
          <form onSubmit={handleSubmit} className="table-form">
            <Input
              label="Código de Mesa"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="T-01"
              required
            />

            <div className="input-wrapper">
              <label className="input-label">Categoría</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ubicación o características"
            />

            <div className="input-wrapper">
              <label className="input-label">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                className="input"
              >
                <option value={1}>Disponible</option>
                <option value={2}>Ocupada</option>
                <option value={3}>Mantenimiento</option>
              </select>
            </div>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTable ? 'Guardar Cambios' : 'Crear Mesa'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
