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

export interface FinalizeSessionDto {
  payment_method: number;
  penalty_amount?: number;
  penalty_reason?: string;
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

  // Obtener sesiones activas
  getActive: async (): Promise<Session[]> => {
    const response = await api.get<{ success: boolean; data: Session[] }>('/sessions/active');
    return response.data.data || [];
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

  // Finalizar sesión (con pago automático)
  finalize: async (id: number, data?: FinalizeSessionDto): Promise<Session> => {
    const response = await api.post<Session>(`/sessions/${id}/finalize`, data || {});
    return response.data;
  },

  // Eliminar sesión
  delete: async (id: number): Promise<void> => {
    await api.delete(`/sessions/${id}`);
  },
};
