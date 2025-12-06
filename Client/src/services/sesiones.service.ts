import api from './api';
import type { PaginatedResponse } from './mesas.service';

export interface Session {
  id: number;
  user_id: number | null;
  reservation_id: number | null;
  table_id: number;
  start_time: string;
  end_time: string | null;
  session_type: number;
  final_cost: number;
  status: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  table?: {
    id: number;
    code: string;
  };
}

export interface CreateSessionDto {
  user_id?: number;
  reservation_id?: number;
  table_id: number;
  start_time: string;
  session_type: number;
  status?: number;
}

export interface UpdateSessionDto {
  end_time?: string;
  final_cost?: number;
  status?: number;
}

export const sesionesService = {
  // Obtener todas las sesiones
  getAll: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Session>>('/sessions', {
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

  // Obtener sesión por ID
  getById: async (id: number): Promise<Session> => {
    const response = await api.get<Session>(`/sessions/${id}`);
    return response.data;
  },

  // Crear nueva sesión
  create: async (data: CreateSessionDto): Promise<Session> => {
    const response = await api.post<Session>('/sessions', data);
    return response.data;
  },

  // Actualizar sesión
  update: async (id: number, data: UpdateSessionDto): Promise<Session> => {
    const response = await api.put<Session>(`/sessions/${id}`, data);
    return response.data;
  },

  // Finalizar sesión
  finalize: async (id: number): Promise<Session> => {
    const response = await api.put<Session>(`/sessions/${id}`, {
      status: 2,
      end_time: new Date().toISOString(),
    });
    return response.data;
  },

  // Eliminar sesión
  delete: async (id: number): Promise<void> => {
    await api.delete(`/sessions/${id}`);
  },
};
