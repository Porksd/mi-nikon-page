-- Migration: Sistema de Números de Serie para Registro de Productos
-- Permite validar y registrar productos con números de serie únicos

-- Tabla de números de serie
CREATE TABLE IF NOT EXISTS public.serial_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    serial_number TEXT NOT NULL UNIQUE,
    product_id TEXT,  -- Puede ser null si no se conoce el producto asociado
    product_name TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'registered')),
    registered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_serial_numbers_serial ON public.serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_user ON public.serial_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON public.serial_numbers(status);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_product ON public.serial_numbers(product_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_serial_numbers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_serial_numbers_updated_at
    BEFORE UPDATE ON public.serial_numbers
    FOR EACH ROW
    EXECUTE FUNCTION update_serial_numbers_updated_at();

-- Enable RLS
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own registered serial numbers
CREATE POLICY "Users can view own serial numbers"
    ON public.serial_numbers
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Users cannot directly insert/update/delete serial numbers (admin only through functions)
CREATE POLICY "Only service role can modify serial numbers"
    ON public.serial_numbers
    FOR ALL
    USING (auth.role() = 'service_role');

-- Function to register a serial number to a user
CREATE OR REPLACE FUNCTION register_serial_number(
    p_serial_number TEXT,
    p_user_id UUID,
    p_product_id TEXT DEFAULT NULL,
    p_product_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_serial RECORD;
    v_result JSON;
BEGIN
    -- Find the serial number
    SELECT * INTO v_serial
    FROM public.serial_numbers
    WHERE serial_number = p_serial_number;
    
    -- Check if serial number exists
    IF v_serial IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'SERIAL_NOT_FOUND',
            'message', 'Número de serie no encontrado en nuestra base de datos'
        );
    END IF;
    
    -- Check if already registered
    IF v_serial.status = 'registered' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'ALREADY_REGISTERED',
            'message', 'Este número de serie ya ha sido registrado'
        );
    END IF;
    
    -- Register the serial number
    UPDATE public.serial_numbers
    SET 
        user_id = p_user_id,
        product_id = COALESCE(p_product_id, product_id),
        product_name = COALESCE(p_product_name, product_name),
        status = 'registered',
        registered_at = NOW()
    WHERE serial_number = p_serial_number;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'message', 'Producto registrado exitosamente',
        'data', json_build_object(
            'serial_number', p_serial_number,
            'product_id', COALESCE(p_product_id, v_serial.product_id),
            'product_name', COALESCE(p_product_name, v_serial.product_name),
            'registered_at', NOW()
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'DATABASE_ERROR',
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if serial number is available
CREATE OR REPLACE FUNCTION check_serial_number(p_serial_number TEXT)
RETURNS JSON AS $$
DECLARE
    v_serial RECORD;
BEGIN
    SELECT * INTO v_serial
    FROM public.serial_numbers
    WHERE serial_number = p_serial_number;
    
    IF v_serial IS NULL THEN
        RETURN json_build_object(
            'exists', false,
            'available', false,
            'message', 'Número de serie no encontrado'
        );
    END IF;
    
    IF v_serial.status = 'registered' THEN
        RETURN json_build_object(
            'exists', true,
            'available', false,
            'status', 'registered',
            'message', 'Número de serie ya registrado'
        );
    END IF;
    
    RETURN json_build_object(
        'exists', true,
        'available', true,
        'status', 'available',
        'product_id', v_serial.product_id,
        'product_name', v_serial.product_name,
        'message', 'Número de serie válido y disponible para registro'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for admin to see registration stats
CREATE OR REPLACE VIEW serial_numbers_stats AS
SELECT 
    COUNT(*) as total_serials,
    COUNT(CASE WHEN status = 'available' THEN 1 END) as available_serials,
    COUNT(CASE WHEN status = 'registered' THEN 1 END) as registered_serials,
    COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users_registered
FROM public.serial_numbers;

-- Grant permissions
GRANT SELECT ON serial_numbers_stats TO authenticated;
