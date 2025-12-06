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
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const mesasService = {
  // Obtener todas las mesas con paginación
  getAll: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Mesa>>('/tables', {
      params: { page, limit },
    });
    return {
      items: response.data.data || [],
      totalPages: response.data.pagination?.totalPages || 1,
      total: response.data.pagination?.totalItems || 0,
      page: response.data.pagination?.currentPage || 1,
      limit: response.data.pagination?.itemsPerPage || limit
    };
  },

  // Obtener una mesa por ID
  getById: async (id: number): Promise<Mesa> => {
    const response = await api.get<Mesa>(`/tables/${id}`);
    return response.data;
  },

  // Crear nueva mesa
  create: async (data: CreateMesaDto): Promise<Mesa> => {
    const response = await api.post<Mesa>('/tables', data);
    return response.data;
  },

  // Actualizar mesa
  update: async (id: number, data: UpdateMesaDto): Promise<Mesa> => {
    const response = await api.put<Mesa>(`/tables/${id}`, data);
    return response.data;
  },

  // Eliminar mesa
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};
