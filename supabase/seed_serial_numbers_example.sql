-- Script para cargar números de serie desde archivo de texto
-- Ejecutar después de migration_serial_numbers.sql
-- Formato esperado: un número de serie por línea

-- Ejemplo de carga manual (ajustar según archivo real)
-- Los números de serie del archivo PO-25073.txt

INSERT INTO public.serial_numbers (serial_number, status) VALUES
('3800360', 'available'),
('3800363', 'available'),
('3800377', 'available'),
('3800391', 'available'),
('3800398', 'available'),
('3800411', 'available'),
('3800439', 'available'),
('3800446', 'available'),
('3800468', 'available'),
('3800482', 'available'),
('3800498', 'available')
ON CONFLICT (serial_number) DO NOTHING;

-- Verificar carga
SELECT * FROM serial_numbers_stats;

-- Ver primeros 10 registros
SELECT serial_number, status, product_id, user_id, created_at 
FROM public.serial_numbers 
ORDER BY created_at DESC 
LIMIT 10;
