import { useState, useEffect } from 'react';
import { userApi, rolesApi } from '../../services/api';

export function UsersPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    role_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([userApi.getAll(), rolesApi.getAll()]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
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
        ...formData,
        role_id: Number(formData.role_id),
        password: formData.password || undefined,
      };
      if (editingId) {
        await userApi.update(editingId, payload);
      } else {
        await userApi.create(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        role_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
      });
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (user: any) => {
    setFormData({
      role_id: user.role_id.toString(),
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      password: '',
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await userApi.delete(id);
      loadData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const getRoleName = (roleId: number) => {
    return roles.find((r) => r.id === roleId)?.name || 'N/A';
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="module-panel">
      <div className="module-header">
        <h2>👥 Usuarios</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo Usuario
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                <strong>
                  {user.first_name} {user.last_name}
                </strong>
              </td>
              <td>{user.email}</td>
              <td>{user.phone || '-'}</td>
              <td>{getRoleName(user.role_id)}</td>
              <td className="actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(user)}>
                  Editar
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>
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
              <h3>{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña {editingId ? '' : '*'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingId}
                    placeholder={editingId ? 'Dejar vacío para no cambiar' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Dirección</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
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
