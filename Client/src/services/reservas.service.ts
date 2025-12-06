import api from './api';
import type { PaginatedResponse } from './mesas.service';

export interface Reservation {
  id: number;
  user_id: number;
  table_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  duration_hours?: number;
  notes?: string | null;
  status: number;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  table?: {
    id: number;
    code: string;
    description?: string;
  };
}

export interface CreateReservationDto {
  user_id: number;
  table_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  duration_hours?: number;
  notes?: string | null;
  status?: number;
}

export interface UpdateReservationDto {
  user_id?: number;
  table_id?: number;
  status?: number;
  reservation_date?: string;
  start_time?: string;
  end_time?: string;
  duration_hours?: number;
  notes?: string | null;
}

export const reservasService = {
  // Obtener todas las reservas
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Reservation>> => {
    const response = await api.get<PaginatedResponse<Reservation>>('/reservations', {
      params: { page, limit },
    });
    return response.data;
  },

  // Obtener reserva por ID
  getById: async (id: number): Promise<Reservation> => {
    const response = await api.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  // Crear nueva reserva
  create: async (data: CreateReservationDto): Promise<Reservation> => {
    const response = await api.post<Reservation>('/reservations', data);
    return response.data;
  },

  // Actualizar reserva
  update: async (id: number, data: UpdateReservationDto): Promise<Reservation> => {
    const response = await api.put<Reservation>(`/reservations/${id}`, data);
    return response.data;
  },

  // Confirmar reserva
  confirm: async (id: number): Promise<Reservation> => {
    const response = await api.put<Reservation>(`/reservations/${id}`, { status: 2 });
    return response.data;
  },

  // Cancelar reserva
  cancel: async (id: number): Promise<Reservation> => {
    const response = await api.put<Reservation>(`/reservations/${id}`, { status: 3 });
    return response.data;
  },

  // Eliminar reserva
  delete: async (id: number): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },

  // Obtener reservas por usuario
  getByUser: async (userId: number): Promise<Reservation[]> => {
    const response = await api.get<Reservation[]>(`/reservations/user/${userId}`);
    return response.data;
  },
};
