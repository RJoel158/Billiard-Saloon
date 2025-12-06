import api from './api';

export interface SystemSetting {
  id: number;
  key: string;
  value: any;
  rawValue: string;
  type: 'string' | 'number' | 'boolean' | 'time' | 'json';
  description: string;
  updatedAt: string;
}

export interface SettingsGroup {
  business: SystemSetting[];
  schedule: SystemSetting[];
  reservations: SystemSetting[];
  pricing: SystemSetting[];
  system: SystemSetting[];
}

export const settingsService = {
  // Obtener todas las configuraciones
  getAll: async (): Promise<SystemSetting[]> => {
    const response = await api.get<{ success: boolean; data: SystemSetting[] }>('/settings');
    return response.data.data || [];
  },

  // Obtener configuraciones agrupadas
  getGrouped: async (): Promise<SettingsGroup> => {
    const response = await api.get<{ success: boolean; data: SettingsGroup }>('/settings');
    return response.data.data || { business: [], schedule: [], reservations: [], pricing: [], system: [] };
  },

  // Obtener por grupo específico
  getByGroup: async (group: string): Promise<SystemSetting[]> => {
    const response = await api.get<{ success: boolean; data: SystemSetting[] }>(`/settings?group=${group}`);
    return response.data.data || [];
  },

  // Obtener configuración por clave
  getByKey: async (key: string): Promise<SystemSetting> => {
    const response = await api.get<{ success: boolean; data: SystemSetting }>(`/settings/${key}`);
    return response.data.data;
  },

  // Actualizar configuración
  update: async (key: string, value: any): Promise<SystemSetting> => {
    const response = await api.put<{ success: boolean; data: SystemSetting }>(`/settings/${key}`, { value });
    return response.data.data;
  },

  // Actualizar múltiples configuraciones
  updateBatch: async (settings: { key: string; value: any }[]): Promise<SystemSetting[]> => {
    const response = await api.put<{ success: boolean; data: SystemSetting[] }>('/settings/batch', { settings });
    return response.data.data || [];
  },

  // Obtener horario de atención
  getBusinessHours: async (): Promise<{ opening_time: string; closing_time: string; business_days: number[] }> => {
    const response = await api.get<{ success: boolean; data: any }>('/settings/business-hours');
    return response.data.data || { opening_time: '09:00', closing_time: '23:00', business_days: [1,2,3,4,5,6,7] };
  },
};
