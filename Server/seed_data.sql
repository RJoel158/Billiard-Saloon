-- Script de datos de prueba para Billiard Saloon

-- Insertar roles
INSERT INTO roles (name, description) VALUES
('Admin', 'Administrador del sistema con todos los permisos'),
('Cliente', 'Cliente que puede realizar reservas'),
('Empleado', 'Empleado del salón de billar');

-- Insertar usuarios de prueba
-- Contraseña: admin123 (hash bcrypt)
INSERT INTO users (role_id, first_name, last_name, email, password, phone, address) VALUES
(1, 'Juan', 'Pérez', 'admin@billiard.com', '$2b$10$rFk1qXZJ8XW8xK7.1YJ0MO5pYZqJ6zQZ7YH4xK7.1YJ0MO5pYZqJ6u', '70123456', 'Av. Principal 123'),
(2, 'María', 'López', 'maria@email.com', '$2b$10$rFk1qXZJ8XW8xK7.1YJ0MO5pYZqJ6zQZ7YH4xK7.1YJ0MO5pYZqJ6u', '71234567', 'Calle Secundaria 456'),
(2, 'Carlos', 'García', 'carlos@email.com', '$2b$10$rFk1qXZJ8XW8xK7.1YJ0MO5pYZqJ6zQZ7YH4xK7.1YJ0MO5pYZqJ6u', '72345678', 'Zona Norte 789'),
(3, 'Ana', 'Martínez', 'ana@billiard.com', '$2b$10$rFk1qXZJ8XW8xK7.1YJ0MO5pYZqJ6zQZ7YH4xK7.1YJ0MO5pYZqJ6u', '73456789', 'Zona Sur 101');

-- Insertar categorías de mesas
INSERT INTO table_categories (name, description, base_price) VALUES
('Pool Estándar', 'Mesa de pool tamaño estándar', 25.00),
('Pool Premium', 'Mesa de pool profesional', 35.00),
('Snooker', 'Mesa de snooker profesional', 45.00),
('Pool VIP', 'Mesa de pool en sala privada', 50.00);

-- Insertar mesas de billar
INSERT INTO billiard_tables (category_id, code, description, status) VALUES
(1, 'P1', 'Mesa pool 1 - Sala principal', 1),
(1, 'P2', 'Mesa pool 2 - Sala principal', 1),
(2, 'PP1', 'Mesa pool premium 1', 1),
(2, 'PP2', 'Mesa pool premium 2', 1),
(3, 'S1', 'Mesa snooker 1', 1),
(3, 'S2', 'Mesa snooker 2', 1),
(4, 'VIP1', 'Mesa VIP sala privada 1', 1),
(4, 'VIP2', 'Mesa VIP sala privada 2', 1);

-- Insertar reglas de precios dinámicos
INSERT INTO dynamic_pricing (category_id, day_of_week, start_time, end_time, multiplier, description) VALUES
-- Descuento en horario matutino (lunes a viernes)
(1, 1, '08:00:00', '12:00:00', 0.8, 'Descuento 20% horario matutino'),
(1, 2, '08:00:00', '12:00:00', 0.8, 'Descuento 20% horario matutino'),
(1, 3, '08:00:00', '12:00:00', 0.8, 'Descuento 20% horario matutino'),
(1, 4, '08:00:00', '12:00:00', 0.8, 'Descuento 20% horario matutino'),
(1, 5, '08:00:00', '12:00:00', 0.8, 'Descuento 20% horario matutino'),

-- Tarifa premium fines de semana
(1, 5, '18:00:00', '23:00:00', 1.3, 'Tarifa viernes noche +30%'),
(1, 6, '12:00:00', '23:00:00', 1.5, 'Tarifa sábado +50%'),
(1, 0, '12:00:00', '23:00:00', 1.5, 'Tarifa domingo +50%'),

-- Happy hour
(2, NULL, '15:00:00', '17:00:00', 0.9, 'Happy hour - 10%');

-- Insertar algunas reservas de ejemplo
INSERT INTO reservations (user_id, table_id, reservation_date, start_time, end_time, num_people, status, special_requests) VALUES
(2, 1, '2025-12-03', '18:00:00', '20:00:00', 4, 2, 'Mesa junto a la ventana si es posible'),
(3, 3, '2025-12-03', '19:00:00', '21:00:00', 2, 1, NULL),
(2, 5, '2025-12-04', '20:00:00', '22:00:00', 4, 1, 'Celebración de cumpleaños');

-- Insertar una sesión cerrada con pago (para reportes)
INSERT INTO sessions (table_id, session_type, reservation_id, start_time, end_time, final_cost, status) VALUES
(2, 2, NULL, '2025-12-02 10:00:00', '2025-12-02 12:30:00', 75.00, 2);

INSERT INTO payments (session_id, amount, payment_method, payment_date, notes) VALUES
(1, 75.00, 1, '2025-12-02', 'Pago en efectivo');

-- Log del sistema
INSERT INTO system_logs (log_type, message, user_id) VALUES
('INFO', 'Sistema inicializado con datos de prueba', 1);
