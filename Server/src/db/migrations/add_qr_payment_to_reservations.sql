-- Migration: Add qr_payment_path to reservations
-- Date: 2025-12-08

ALTER TABLE reservations 
ADD COLUMN qr_payment_path VARCHAR(255) NULL AFTER end_time,
ADD COLUMN payment_verified BOOLEAN DEFAULT FALSE AFTER qr_payment_path;

-- Comentario para futuras referencias
COMMENT ON COLUMN reservations.qr_payment_path IS 'Ruta del comprobante de pago QR subido por el cliente';
COMMENT ON COLUMN reservations.payment_verified IS 'Indica si el admin verificó el pago del comprobante QR';
