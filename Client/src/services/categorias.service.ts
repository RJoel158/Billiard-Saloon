import api from './api';
import type { PaginatedResponse } from './mesas.service';

export interface Categoria {
  id: number;
  name: string;
  description: string;
  base_price: number;
  status: number;
}

export const categoriasService = {
  // Obtener todas las categorías
  getAll: async (page: number = 1, limit: number = 100) => {
    const response = await api.get<PaginatedResponse<Categoria>>('/table-categories', {
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

  // Obtener categoría por ID
  getById: async (id: number): Promise<Categoria> => {
    const response = await api.get<Categoria>(`/table-categories/${id}`);
    return response.data;
  },
};
