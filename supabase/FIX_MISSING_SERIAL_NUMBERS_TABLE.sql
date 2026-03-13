-- ==============================================================================
-- FIX: Create missing 'serial_numbers' table
-- This fixes the error: "relation "serial_numbers" does not exist" in get_dashboard_kpis
-- ==============================================================================

-- 1. Create table serial_numbers if it doesn't exist
CREATE TABLE IF NOT EXISTS public.serial_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    serial_number TEXT NOT NULL UNIQUE,
    product_id TEXT,  
    product_name TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'registered')),
    registered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_serial_numbers_serial ON public.serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_user ON public.serial_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON public.serial_numbers(status);

-- 3. Enable RLS
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Drop existing policies to avoid errors if re-running
DROP POLICY IF EXISTS "Users can view own serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Only service role can modify serial numbers" ON public.serial_numbers;
DROP POLICY IF EXISTS "Admins can manage all serial numbers" ON public.serial_numbers;

-- Users can view their own registered serial numbers or check availability (user_id is null)
CREATE POLICY "Users can view serial numbers"
    ON public.serial_numbers
    FOR SELECT
    USING (true); 

-- Only admins/service role can modify
CREATE POLICY "Only admins/service role can modify serial numbers"
    ON public.serial_numbers
    FOR ALL
    USING (
        auth.role() = 'service_role' OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 5. Grant permissions
GRANT SELECT ON public.serial_numbers TO authenticated;
GRANT ALL ON public.serial_numbers TO service_role;
