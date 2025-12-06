import { useEffect, useState } from 'react';
import { Table2, Plus, Edit2, Trash2, Search, Filter, AlertCircle, CheckCircle, Wrench } from 'lucide-react';
import { mesasService, categoriasService, type Mesa, type Categoria } from '../../services';

export function Tables() {
  const [tables, setTables] = useState<Mesa[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Mesa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    category_id: '',
    code: '',
    description: '',
    status: 1,
  });

  useEffect(() => {
    fetchTables();
    fetchCategories();
  }, [currentPage, filterStatus]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await mesasService.getAll(currentPage, 10);
      setTables(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriasService.getAll(1, 100);
      setCategories(data.items || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tableData = {
        category_id: Number(formData.category_id),
        code: formData.code,
        description: formData.description,
        status: formData.status,
      };

      if (editingTable) {
        await mesasService.update(editingTable.id, tableData);
      } else {
        await mesasService.create(tableData);
      }

      fetchTables();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving table:', error);
      alert('Error al guardar la mesa. Por favor intente nuevamente.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta mesa?')) return;
    
    try {
      await mesasService.delete(id);
      fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Error al eliminar la mesa.');
    }
  };

  const handleEdit = (table: Mesa) => {
    setEditingTable(table);
    setFormData({
      category_id: table.category_id.toString(),
      code: table.code,
      description: table.description || '',
      status: table.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTable(null);
    setFormData({
      category_id: '',
      code: '',
      description: '',
      status: 1,
    });
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="badge bg-success d-flex align-items-center gap-1"><CheckCircle size={14} />Disponible</span>;
      case 2:
        return <span className="badge bg-danger d-flex align-items-center gap-1"><AlertCircle size={14} />Ocupada</span>;
      case 3:
        return <span className="badge bg-warning text-dark d-flex align-items-center gap-1"><Wrench size={14} />Mantenimiento</span>;
      default:
        return <span className="badge bg-secondary">Desconocido</span>;
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (table.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || table.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container-fluid p-4" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">
              <Table2 size={32} className="me-2" style={{ verticalAlign: 'middle' }} />
              Gestión de Mesas
            </h1>
            <p className="text-muted mb-0">Administra las mesas de billar del sistema</p>
          </div>
          <button className="btn btn-primary btn-lg px-4" onClick={() => setShowModal(true)}>
            <Plus size={20} className="me-2" />
            Nueva Mesa
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Buscar por código o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Filter size={18} className="text-muted" />
                </span>
                <select
                  className="form-select border-start-0"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                >
                  <option value="all">Todos los estados</option>
                  <option value="1">Disponible</option>
                  <option value="2">Ocupada</option>
                  <option value="3">Mantenimiento</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 fw-semibold">Código</th>
                      <th className="px-4 py-3 fw-semibold">Categoría</th>
                      <th className="px-4 py-3 fw-semibold">Descripción</th>
                      <th className="px-4 py-3 fw-semibold">Precio Base</th>
                      <th className="px-4 py-3 fw-semibold">Estado</th>
                      <th className="px-4 py-3 fw-semibold text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTables.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          No se encontraron mesas
                        </td>
                      </tr>
                    ) : (
                      filteredTables.map((table) => {
                        const category = categories.find(c => c.id === table.category_id);
                        return (
                          <tr key={table.id}>
                            <td className="px-4 py-3">
                              <span className="fw-semibold text-primary">{table.code}</span>
                            </td>
                            <td className="px-4 py-3">{category?.name || 'N/A'}</td>
                            <td className="px-4 py-3">{table.description || '-'}</td>
                            <td className="px-4 py-3">
                              <span className="fw-semibold">${category?.base_price || 0}</span>
                            </td>
                            <td className="px-4 py-3">{getStatusBadge(table.status)}</td>
                            <td className="px-4 py-3">
                              <div className="d-flex gap-2 justify-content-end">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(table)}
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(table.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-4 border-top">
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                          Anterior
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                          Siguiente
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    {editingTable ? 'Editar Mesa' : 'Nueva Mesa'}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Categoría</label>
                      <select
                        className="form-select"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        required
                      >
                        <option value="">Seleccione una categoría</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} - ${cat.base_price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Código</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="Ej: MESA-01"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Descripción</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descripción opcional de la mesa"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Estado</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                        required
                      >
                        <option value="1">Disponible</option>
                        <option value="2">Ocupada</option>
                        <option value="3">Mantenimiento</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingTable ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
}
