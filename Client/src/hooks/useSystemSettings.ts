import { useState, useEffect } from 'react';
import { settingsService } from '../services';

export interface SystemSettings {
  opening_time: string;
  closing_time: string;
  min_reservation_duration: number;
  max_reservation_duration: number;
  min_advance_hours: number;
  max_advance_days: number;
  business_days: number[];
  tax_rate: number;
  late_cancellation_penalty_rate: number;
  no_show_penalty_rate: number;
  auto_cancel_no_show_minutes: number;
  enable_notifications: boolean;
  enable_email_notifications: boolean;
  max_concurrent_reservations: number;
  grace_period_minutes: number;
  business_name: string;
  business_phone: string;
  business_email: string;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAll();
      
      // Transform array to object
      const settingsObj = data.reduce((acc: any, setting: any) => {
        let value = setting.setting_value;
        
        // Parse by type
        switch (setting.setting_type) {
          case 'boolean':
            value = value === 'true' || value === '1' || value === 1;
            break;
          case 'number':
            value = parseFloat(value);
            break;
          case 'json':
            try {
              value = Array.isArray(value) ? value : JSON.parse(value);
            } catch {
              value = [];
            }
            break;
          default:
            value = String(value);
        }
        
        acc[setting.setting_key] = value;
        return acc;
      }, {});

      setSettings(settingsObj as SystemSettings);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuración');
      console.error('Error loading system settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refresh = () => {
    loadSettings();
  };

  const isBusinessDay = (dayOfWeek: number): boolean => {
    if (!settings?.business_days) return true;
    return settings.business_days.includes(dayOfWeek);
  };

  const isWithinBusinessHours = (time: string): boolean => {
    if (!settings) return true;
    return time >= settings.opening_time && time <= settings.closing_time;
  };

  const calculateTax = (amount: number): number => {
    if (!settings) return 0;
    return amount * settings.tax_rate;
  };

  const calculateLateCancellationPenalty = (amount: number): number => {
    if (!settings) return 0;
    return amount * settings.late_cancellation_penalty_rate;
  };

  const calculateNoShowPenalty = (amount: number): number => {
    if (!settings) return 0;
    return amount * settings.no_show_penalty_rate;
  };

  return {
    settings,
    loading,
    error,
    refresh,
    isBusinessDay,
    isWithinBusinessHours,
    calculateTax,
    calculateLateCancellationPenalty,
    calculateNoShowPenalty,
  };
};
