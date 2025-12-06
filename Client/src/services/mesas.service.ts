import api from './api';

export interface Mesa {
  id: number;
  category_id: number;
  code: string;
  description: string;
  status: number;
  category?: {
    id: number;
    name: string;
    description: string;
    base_price: number;
    status: number;
  };
}

export interface CreateMesaDto {
  category_id: number;
  code: string;
  description?: string;
  status: number;
}

export interface UpdateMesaDto extends Partial<CreateMesaDto> {}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const mesasService = {
  // Obtener todas las mesas con paginación
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Mesa>> => {
    const response = await api.get<PaginatedResponse<Mesa>>('/billiard-tables', {
      params: { page, limit },
    });
    return response.data;
  },

  // Obtener una mesa por ID
  getById: async (id: number): Promise<Mesa> => {
    const response = await api.get<Mesa>(`/billiard-tables/${id}`);
    return response.data;
  },

  // Crear nueva mesa
  create: async (data: CreateMesaDto): Promise<Mesa> => {
    const response = await api.post<Mesa>('/billiard-tables', data);
    return response.data;
  },

  // Actualizar mesa
  update: async (id: number, data: UpdateMesaDto): Promise<Mesa> => {
    const response = await api.put<Mesa>(`/billiard-tables/${id}`, data);
    return response.data;
  },

  // Eliminar mesa
  delete: async (id: number): Promise<void> => {
    await api.delete(`/billiard-tables/${id}`);
  },
};
