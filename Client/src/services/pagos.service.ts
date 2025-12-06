import api from './api';
import type { PaginatedResponse } from './mesas.service';

export interface Payment {
  id: number;
  session_id: number;
  amount: number;
  method: number;
  created_at: string;
  session?: {
    id: number;
    table_id: number;
    user_id: number | null;
    table?: {
      code: string;
    };
    user?: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface CreatePaymentDto {
  session_id: number;
  amount: number;
  method: number;
}

export const pagosService = {
  // Obtener todos los pagos
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Payment>> => {
    const response = await api.get<PaginatedResponse<Payment>>('/payments', {
      params: { page, limit },
    });
    return response.data;
  },

  // Obtener pago por ID
  getById: async (id: number): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  // Crear nuevo pago
  create: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await api.post<Payment>('/payments', data);
    return response.data;
  },

  // Obtener pagos por rango de fechas
  getByDateRange: async (startDate: string, endDate: string): Promise<Payment[]> => {
    const response = await api.get<Payment[]>('/payments/range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Eliminar pago
  delete: async (id: number): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },
};
