import api from './api';
import type { LoginResponse, RegisterData } from '../types/auth.types';

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  // Registro
  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  // Verificar token
  verifyToken: async (): Promise<{ valid: boolean }> => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};
