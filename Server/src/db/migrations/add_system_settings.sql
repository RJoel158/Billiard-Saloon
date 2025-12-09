-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_type` varchar(20) NOT NULL DEFAULT 'string' COMMENT 'string, number, boolean, time, json',
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar valores por defecto
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('business_name', 'Salón de Billar', 'string', 'Nombre del negocio'),
('opening_time', '09:00', 'time', 'Hora de apertura'),
('closing_time', '23:00', 'time', 'Hora de cierre'),
('min_reservation_duration', '30', 'number', 'Duración mínima de reserva en minutos'),
('max_reservation_duration', '240', 'number', 'Duración máxima de reserva en minutos'),
('reservation_advance_days', '7', 'number', 'Días de anticipación máximos para reservar'),
('reservation_min_advance_hours', '2', 'number', 'Horas mínimas de anticipación para reservar'),
('cancellation_hours', '24', 'number', 'Horas antes para cancelar sin penalización'),
('late_penalty_rate', '0.15', 'number', 'Porcentaje de multa por retraso (0.15 = 15%)'),
('overtime_rate', '1.5', 'number', 'Multiplicador de tarifa por tiempo extra'),
('grace_period_minutes', '10', 'number', 'Minutos de tolerancia antes de cobrar tiempo extra'),
('max_concurrent_reservations', '3', 'number', 'Máximo de reservas simultáneas por usuario'),
('allow_walkin', 'true', 'boolean', 'Permitir sesiones walk-in sin reserva'),
('tax_rate', '0.13', 'number', 'Tasa de impuesto (0.13 = 13%)'),
('currency', 'BOB', 'string', 'Moneda del sistema'),
('timezone', 'America/La_Paz', 'string', 'Zona horaria'),
('business_days', '[1,2,3,4,5,6,7]', 'json', 'Días laborables (1=Lun, 7=Dom)'),
('maintenance_mode', 'false', 'boolean', 'Modo mantenimiento del sistema')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
