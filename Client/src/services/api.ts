import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: any) => 
    api.post('/auth/register', data),
};

// Users
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Roles
export const rolesApi = {
  getAll: () => api.get('/roles'),
  getById: (id: number) => api.get(`/roles/${id}`),
  create: (data: any) => api.post('/roles', data),
  update: (id: number, data: any) => api.put(`/roles/${id}`, data),
  delete: (id: number) => api.delete(`/roles/${id}`),
};

// Table Categories
export const tableCategoryApi = {
  getAll: () => api.get('/table-categories'),
  getById: (id: number) => api.get(`/table-categories/${id}`),
  create: (data: any) => api.post('/table-categories', data),
  update: (id: number, data: any) => api.put(`/table-categories/${id}`, data),
  delete: (id: number) => api.delete(`/table-categories/${id}`),
};

// Billiard Tables
export const tableApi = {
  getAll: () => api.get('/tables'),
  getById: (id: number) => api.get(`/tables/${id}`),
  create: (data: any) => api.post('/tables', data),
  update: (id: number, data: any) => api.put(`/tables/${id}`, data),
  delete: (id: number) => api.delete(`/tables/${id}`),
};

// Reservations
export const reservationApi = {
  getAll: () => api.get('/reservations'),
  getById: (id: number) => api.get(`/reservations/${id}`),
  getAvailableSlots: (tableId: number, date: string) => 
    api.get(`/reservations/available-slots?table_id=${tableId}&date=${date}`),
  create: (data: any) => api.post('/reservations', data),
  update: (id: number, data: any) => api.put(`/reservations/${id}`, data),
  approve: (id: number, adminId?: number) => 
    api.patch(`/reservations/${id}/approve`, { admin_user_id: adminId }),
  reject: (id: number, reason: string, adminId?: number) => 
    api.patch(`/reservations/${id}/reject`, { admin_user_id: adminId, reason }),
  delete: (id: number) => api.delete(`/reservations/${id}`),
};

// Sessions
export const sessionApi = {
  getAll: () => api.get('/sessions'),
  getById: (id: number) => api.get(`/sessions/${id}`),
  start: (data: any) => api.post('/sessions/start', data),
  end: (id: number) => api.post(`/sessions/${id}/end`),
  create: (data: any) => api.post('/sessions', data),
  update: (id: number, data: any) => api.put(`/sessions/${id}`, data),
  delete: (id: number) => api.delete(`/sessions/${id}`),
};

// Payments
export const paymentApi = {
  getAll: () => api.get('/payments'),
  getById: (id: number) => api.get(`/payments/${id}`),
  create: (data: any) => api.post('/payments', data),
  update: (id: number, data: any) => api.put(`/payments/${id}`, data),
  delete: (id: number) => api.delete(`/payments/${id}`),
};

// Dynamic Pricing
export const dynamicPricingApi = {
  getAll: () => api.get('/dynamic-pricing'),
  getById: (id: number) => api.get(`/dynamic-pricing/${id}`),
  create: (data: any) => api.post('/dynamic-pricing', data),
  update: (id: number, data: any) => api.put(`/dynamic-pricing/${id}`, data),
  delete: (id: number) => api.delete(`/dynamic-pricing/${id}`),
};
