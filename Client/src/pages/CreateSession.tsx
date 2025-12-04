import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, Button, Input, Modal } from '../components/ui';
import type { User, BilliardTable } from '../types';
import api from '../utils/api';
import './CreateSession.css';

export function CreateSession() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Step 1: Search or create user
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // Step 2: Select table
  const [tables, setTables] = useState<BilliardTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<BilliardTable | null>(null);
  
  // Register new user
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (step === 2) {
      loadAvailableTables();
    }
  }, [step]);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await api.get<{ success: boolean; data: User[] }>(`/users/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Error al buscar usuarios');
    }
  };

  const handleRegisterUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      const response = await api.post<{ success: boolean; data: User }>('/users', {
        ...newUser,
        role_id: 2, // client
      });
      
      setSelectedUser(response.data.data);
      setShowRegisterModal(false);
      setStep(2);
    } catch (error: any) {
      console.error('Error registering user:', error);
      alert(error.response?.data?.error?.message || 'Error al registrar usuario');
    }
  };

  const loadAvailableTables = async () => {
    try {
      const response = await api.get<BilliardTable[]>('/tables');
      const available = response.data.filter((t: BilliardTable) => t.status === 1);
      setTables(available);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!selectedUser || !selectedTable) {
      alert('Debe seleccionar un usuario y una mesa');
      return;
    }

    try {
      const startTime = new Date().toISOString();
      
      await api.post('/sessions', {
        user_id: selectedUser.id,
        table_id: selectedTable.id,
        start_time: startTime,
        session_type: 2, // walk-in
        status: 1, // active
      });

      alert('Sesión creada exitosamente');
      navigate('/admin/sessions');
    } catch (error: any) {
      console.error('Error creating session:', error);
      alert(error.response?.data?.message || 'Error al crear la sesión');
    }
  };

  return (
    <Layout>
      <div className="create-session">
        <h2>Nueva Sesión sin Reserva</h2>

        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Cliente</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Mesa</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Confirmar</div>
          </div>
        </div>

        {step === 1 && (
          <Card title="Buscar o Registrar Cliente">
            <div className="search-section">
              <div className="search-input-group">
                <Input
                  placeholder="Nombre o apellido del cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>Buscar</Button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="user-info">
                        <div className="user-name">{user.first_name} {user.last_name}</div>
                        <div className="user-email">{user.email}</div>
                        {user.phone && <div className="user-phone">{user.phone}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm && searchResults.length === 0 && (
                <div className="no-results">
                  <p>No se encontraron clientes con ese nombre</p>
                  <Button onClick={() => setShowRegisterModal(true)}>
                    Registrar Nuevo Cliente
                  </Button>
                </div>
              )}

              {!searchTerm && (
                <div className="empty-search">
                  <p>Ingresa el nombre del cliente o regístralo si es nuevo</p>
                  <Button variant="secondary" onClick={() => setShowRegisterModal(true)}>
                    Registrar Nuevo Cliente
                  </Button>
                </div>
              )}

              {selectedUser && (
                <div className="selected-user-card">
                  <h4>Cliente Seleccionado:</h4>
                  <p><strong>{selectedUser.first_name} {selectedUser.last_name}</strong></p>
                  <p>{selectedUser.email}</p>
                  <Button onClick={() => setStep(2)}>Continuar →</Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card title="Seleccionar Mesa">
            <div className="tables-grid">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`table-item ${selectedTable?.id === table.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTable(table)}
                >
                  <div className="table-code">{table.code}</div>
                  {table.description && <div className="table-desc">{table.description}</div>}
                </div>
              ))}
            </div>

            {tables.length === 0 && (
              <div className="no-tables">No hay mesas disponibles en este momento</div>
            )}

            <div className="step-actions">
              <Button variant="secondary" onClick={() => setStep(1)}>← Atrás</Button>
              {selectedTable && (
                <Button onClick={() => setStep(3)}>Continuar →</Button>
              )}
            </div>
          </Card>
        )}

        {step === 3 && selectedUser && selectedTable && (
          <Card title="Confirmar Sesión">
            <div className="confirmation">
              <div className="confirm-item">
                <span className="label">Cliente:</span>
                <span className="value">{selectedUser.first_name} {selectedUser.last_name}</span>
              </div>
              <div className="confirm-item">
                <span className="label">Mesa:</span>
                <span className="value">{selectedTable.code}</span>
              </div>
              <div className="confirm-item">
                <span className="label">Hora de Inicio:</span>
                <span className="value">{new Date().toLocaleString()}</span>
              </div>
              <div className="confirm-item">
                <span className="label">Tipo de Sesión:</span>
                <span className="value">Sin Reserva (Walk-in)</span>
              </div>
            </div>

            <div className="step-actions">
              <Button variant="secondary" onClick={() => setStep(2)}>← Atrás</Button>
              <Button onClick={handleCreateSession}>Crear Sesión</Button>
            </div>
          </Card>
        )}

        <Modal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          title="Registrar Nuevo Cliente"
        >
          <div className="register-form">
            <Input
              label="Nombre"
              value={newUser.first_name}
              onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
              required
            />
            <Input
              label="Apellido"
              value={newUser.last_name}
              onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <Input
              label="Teléfono"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            />
            <Input
              label="Contraseña"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegisterUser}>Registrar</Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
