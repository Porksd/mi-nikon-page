-- Create a table for public profiles using Supabase Auth
create table items (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);

create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  first_name text,
  last_name text,
  phone text
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name', new.raw_user_meta_data ->> 'phone');
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- Enhanced Schema for Mi Nikon Experience

-- 1. Customers Table (Simulating Nikon Center DB)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    rut TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table (Catalog)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- SKU or ID from Merchant Center
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    image_url TEXT,
    category TEXT,
    stock_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    order_number TEXT PRIMARY KEY,
    customer_email TEXT REFERENCES public.customers(email),
    order_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(12,2),
    status TEXT,
    items JSONB, -- Storing items as JSON for simplicity: [{product_id, name, quantity, price}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Registered Products (My Gear)
-- This links actual app users (auth.users) or customers to products
CREATE TABLE IF NOT EXISTS public.user_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- Nullable if we want to link to customers table instead, but ideally should comprise 'My Gear'
    customer_email TEXT, -- Backup link to legacy customer
    product_id TEXT REFERENCES public.products(id),
    serial_number TEXT,
    purchase_date DATE,
    warranty_status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

-- Policies
-- Products are viewable by everyone
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- Customers: Admins can view all, Users can view their own (by email matching auth email - tricky without custom claim, strictly speaking we might need a function or just allow basic read for now for demo)
-- For this demo, we'll allow authenticated users to read (in real app, strict filtering)
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);

-- User Products: Users can view/insert their own
CREATE POLICY "Users can view own gear" ON public.user_products FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add own gear" ON public.user_products FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Customers/Orders: For now, accessible to authenticated users (simulating Admin access or user's own data logic handling in specific functions)
CREATE POLICY "Enable read access for authenticated users" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated orders" ON public.orders FOR SELECT TO authenticated USING (true);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean default false;
-- Add email column to profiles table
alter table profiles add column if not exists email text;

-- Update the handle_new_user trigger function to include email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, email)
  values (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name', 
    new.raw_user_meta_data ->> 'phone',
    new.email
  );
  return new;
end;
$$;

-- Optional: Backfill existing users (if any exist without email in profiles)
update profiles 
set email = auth.users.email 
from auth.users 
where profiles.id = auth.users.id 
and profiles.email is null;

-- Workshops Table
create table if not exists workshops (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    description text,
    image_url text,
    teacher text,
    date date,
    time time,
    location text,
    total_spots int not null default 0
);

-- Workshop Registrations
create table if not exists workshop_registrations (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    workshop_id uuid references workshops(id) on delete cascade not null,
    user_id uuid references auth.users(id) not null,
    unique(workshop_id, user_id)
);

-- Notifications
create table if not exists notifications (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    message text not null,
    category text not null check (category in ('eventos', 'mi_equipo', 'novedades', 'promociones')),
    target_audience text default 'all'
);

-- User Notification Preferences
create table if not exists user_notification_preferences (
    user_id uuid references auth.users(id) on delete cascade not null,
    category text not null check (category in ('eventos', 'mi_equipo', 'novedades', 'promociones')),
    enabled boolean default true,
    primary key (user_id, category)
);

-- RLS
alter table workshops enable row level security;
alter table workshop_registrations enable row level security;
alter table notifications enable row level security;
alter table user_notification_preferences enable row level security;

-- Policies
create policy "Workshops are viewable by everyone" on workshops for select using (true);
create policy "Workshops are editable by everyone" on workshops for all using (true); 

create policy "Registrations viewable by everyone" on workshop_registrations for select using (true);
create policy "Users can register" on workshop_registrations for insert with check (auth.uid() = user_id);
create policy "Users can unregister" on workshop_registrations for delete using (auth.uid() = user_id);

create policy "Notifications viewable by everyone" on notifications for select using (true);
create policy "Notifications editable by everyone" on notifications for all using (true); 

create policy "Users manage own preferences" on user_notification_preferences for all using (auth.uid() = user_id);
-- Migration: Sistema de Notificaciones para Usuarios
-- Permite enviar notificaciones in-app a los usuarios sobre workshops, productos, firmware, etc.

-- Tabla de notificaciones de usuarios
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('workshop', 'product', 'firmware', 'general', 'carrito', 'promocion')),
    link TEXT, -- URL opcional para navegar cuando se hace click
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ãndices
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON public.user_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created ON public.user_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.user_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON public.user_notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Only service role can create notifications (admin/system)
CREATE POLICY "Service role can insert notifications"
    ON public.user_notifications
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Function to create notification for a user
CREATE OR REPLACE FUNCTION create_user_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_category TEXT,
    p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.user_notifications (user_id, title, message, category, link)
    VALUES (p_user_id, p_title, p_message, p_category, p_link)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for all users
CREATE OR REPLACE FUNCTION create_notification_for_all(
    p_title TEXT,
    p_message TEXT,
    p_category TEXT,
    p_link TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    INSERT INTO public.user_notifications (user_id, title, message, category, link)
    SELECT id, p_title, p_message, p_category, p_link
    FROM auth.users;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for users with specific product
CREATE OR REPLACE FUNCTION notify_product_owners(
    p_product_id TEXT,
    p_title TEXT,
    p_message TEXT,
    p_category TEXT,
    p_link TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    INSERT INTO public.user_notifications (user_id, title, message, category, link)
    SELECT DISTINCT user_id, p_title, p_message, p_category, p_link
    FROM public.user_products
    WHERE product_id = p_product_id AND user_id IS NOT NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count for user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.user_notifications
    WHERE user_id = p_user_id AND read = FALSE;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for notification stats (admin)
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
    category,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN read = TRUE THEN 1 END) as read_notifications,
    COUNT(CASE WHEN read = FALSE THEN 1 END) as unread_notifications,
    ROUND(100.0 * COUNT(CASE WHEN read = TRUE THEN 1 END) / NULLIF(COUNT(*), 0), 2) as read_percentage
FROM public.user_notifications
GROUP BY category;

-- Grant permissions
GRANT SELECT ON notification_stats TO authenticated;

-- Example notifications (you can run these after migration to test)
-- SELECT create_user_notification(
--     '<user_id>',
--     'Â¡Nuevo Workshop Disponible!',
--     'RegÃ­strate para el workshop de FotografÃ­a de Retrato este sÃ¡bado.',
--     'workshop',
--     '/workshops'
-- );

-- SELECT create_notification_for_all(
--     'Â¡Nueva ActualizaciÃ³n Disponible!',
--     'Actualiza el firmware de tu cÃ¡mara Z para mejorar el rendimiento.',
--     'firmware',
--     'https://downloadcenter.nikonimglib.com/es/index.html'
-- );

-- SELECT notify_product_owners(
--     'Z6III',
--     'Firmware 2.0 para Z6 III',
--     'Nueva actualizaciÃ³n disponible con mejoras de rendimiento y nuevas funciones.',
--     'firmware',
--     'https://downloadcenter.nikonimglib.com'
-- );
-- =====================================================
-- MIGRATION: Profile Expansion
-- =====================================================
-- Purpose: Add birthday and social media fields to profiles
-- Features:
--   - Birthday field for special offers
--   - Social media links (Instagram, Facebook, TikTok)
--   - Profile completion tracking
--   - Incentive for completing profile
-- =====================================================

-- 1. ADD COLUMNS TO PROFILES
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completion_date TIMESTAMPTZ;

-- Backfill full_name if empty
UPDATE profiles
SET full_name = TRIM(BOTH FROM COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE full_name IS NULL;

-- 2. CREATE FUNCTION: Check profile completion
CREATE OR REPLACE FUNCTION check_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Consider profile complete if required fields are filled
    NEW.profile_completed := (
        NEW.full_name IS NOT NULL AND 
        NEW.full_name != '' AND
        NEW.email IS NOT NULL AND 
        NEW.email != '' AND
        NEW.phone IS NOT NULL AND 
        NEW.phone != '' AND
        NEW.birthday IS NOT NULL
    );
    
    -- Set completion date when profile is first completed
    IF NEW.profile_completed AND OLD.profile_completed = false THEN
        NEW.profile_completion_date := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CREATE TRIGGER: Auto-check profile completion
DROP TRIGGER IF EXISTS trg_check_profile_completion ON profiles;
CREATE TRIGGER trg_check_profile_completion
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION check_profile_completion();

-- 4. FUNCTION: Get profile completion status
CREATE OR REPLACE FUNCTION get_profile_completion_status(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_profile RECORD;
    v_missing_fields TEXT[];
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Profile not found');
    END IF;
    
    -- Build array of missing fields
    v_missing_fields := ARRAY[]::TEXT[];
    
    IF v_profile.full_name IS NULL OR v_profile.full_name = '' THEN
        v_missing_fields := array_append(v_missing_fields, 'full_name');
    END IF;
    
    IF v_profile.email IS NULL OR v_profile.email = '' THEN
        v_missing_fields := array_append(v_missing_fields, 'email');
    END IF;
    
    IF v_profile.phone IS NULL OR v_profile.phone = '' THEN
        v_missing_fields := array_append(v_missing_fields, 'phone');
    END IF;
    
    IF v_profile.birthday IS NULL THEN
        v_missing_fields := array_append(v_missing_fields, 'birthday');
    END IF;
    
    RETURN jsonb_build_object(
        'completed', v_profile.profile_completed,
        'completion_date', v_profile.profile_completion_date,
        'missing_fields', v_missing_fields,
        'completion_percentage', 
            CASE 
                WHEN array_length(v_missing_fields, 1) IS NULL THEN 100
                ELSE ROUND(((4 - array_length(v_missing_fields, 1))::numeric / 4) * 100)
            END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNCTION: Update profile with completion check
CREATE OR REPLACE FUNCTION update_profile_with_completion(
    p_full_name TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_birthday DATE DEFAULT NULL,
    p_instagram TEXT DEFAULT NULL,
    p_facebook TEXT DEFAULT NULL,
    p_tiktok TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_updated_profile profiles%ROWTYPE;
BEGIN
    UPDATE profiles
    SET 
        full_name = COALESCE(p_full_name, full_name),
        phone = COALESCE(p_phone, phone),
        birthday = COALESCE(p_birthday, birthday),
        instagram = COALESCE(p_instagram, instagram),
        facebook = COALESCE(p_facebook, facebook),
        tiktok = COALESCE(p_tiktok, tiktok),
        updated_at = NOW()
    WHERE id = auth.uid()
    RETURNING * INTO v_updated_profile;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'profile', row_to_json(v_updated_profile),
        'completion_status', get_profile_completion_status()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. VIEW: Incomplete profiles (for admin reminders)
CREATE OR REPLACE VIEW incomplete_profiles AS
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.phone,
    p.birthday,
    p.profile_completed,
    p.created_at,
    EXTRACT(DAY FROM (NOW() - p.created_at)) as days_since_registration,
    CASE 
        WHEN p.full_name IS NULL OR p.full_name = '' THEN 'Nombre completo'
        ELSE NULL
    END as missing_name,
    CASE 
        WHEN p.phone IS NULL OR p.phone = '' THEN 'TelÃ©fono'
        ELSE NULL
    END as missing_phone,
    CASE 
        WHEN p.birthday IS NULL THEN 'Fecha de nacimiento'
        ELSE NULL
    END as missing_birthday
FROM profiles p
WHERE p.profile_completed = false
ORDER BY p.created_at DESC;

-- 7. FUNCTION: Get users with upcoming birthdays (admin)
CREATE OR REPLACE FUNCTION get_upcoming_birthdays(p_days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    birthday DATE,
    days_until_birthday INTEGER,
    age INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.email,
        p.birthday,
        EXTRACT(DAY FROM (
            DATE(EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                 EXTRACT(MONTH FROM p.birthday) || '-' || 
                 EXTRACT(DAY FROM p.birthday)) - CURRENT_DATE
        ))::INTEGER as days_until_birthday,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthday))::INTEGER as age
    FROM profiles p
    WHERE p.birthday IS NOT NULL
        AND EXTRACT(DAY FROM (
            DATE(EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
                 EXTRACT(MONTH FROM p.birthday) || '-' || 
                 EXTRACT(DAY FROM p.birthday)) - CURRENT_DATE
        )) BETWEEN 0 AND p_days_ahead
    ORDER BY days_until_birthday ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. GRANT PERMISSIONS
GRANT SELECT ON incomplete_profiles TO authenticated;

-- 9. UPDATE EXISTING PROFILES
-- Set profile_completed to false for all existing profiles
UPDATE profiles SET profile_completed = false WHERE profile_completed IS NULL;

-- Check completion for profiles that have all required fields
UPDATE profiles
SET profile_completed = true,
    profile_completion_date = NOW()
WHERE full_name IS NOT NULL 
    AND full_name != '' 
    AND email IS NOT NULL 
    AND email != ''
    AND phone IS NOT NULL 
    AND phone != ''
    AND birthday IS NOT NULL
    AND profile_completed = false;

-- =====================================================
-- VERIFICATION QUERIES (commented)
-- =====================================================
/*
-- Check profile completion status
SELECT * FROM get_profile_completion_status();

-- View incomplete profiles
SELECT * FROM incomplete_profiles;

-- Get upcoming birthdays
SELECT * FROM get_upcoming_birthdays(7);

-- Update profile test
SELECT * FROM update_profile_with_completion(
    p_birthday := '1990-05-15',
    p_instagram := '@mynikon'
);

-- Check profile fields
SELECT id, full_name, email, phone, birthday, instagram, facebook, tiktok, 
       profile_completed, profile_completion_date
FROM profiles
WHERE id = auth.uid();
*/
-- Migration: Sistema de NÃºmeros de Serie para Registro de Productos
-- Permite validar y registrar productos con nÃºmeros de serie Ãºnicos

-- Tabla de nÃºmeros de serie
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

-- Ãndices para optimizar bÃºsquedas
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
            'message', 'NÃºmero de serie no encontrado en nuestra base de datos'
        );
    END IF;
    
    -- Check if already registered
    IF v_serial.status = 'registered' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'ALREADY_REGISTERED',
            'message', 'Este nÃºmero de serie ya ha sido registrado'
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
            'message', 'NÃºmero de serie no encontrado'
        );
    END IF;
    
    IF v_serial.status = 'registered' THEN
        RETURN json_build_object(
            'exists', true,
            'available', false,
            'status', 'registered',
            'message', 'NÃºmero de serie ya registrado'
        );
    END IF;
    
    RETURN json_build_object(
        'exists', true,
        'available', true,
        'status', 'available',
        'product_id', v_serial.product_id,
        'product_name', v_serial.product_name,
        'message', 'NÃºmero de serie vÃ¡lido y disponible para registro'
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
-- Shopping Cart System Migration
-- Abandoned cart tracking and notifications

-- Shopping Carts Table
CREATE TABLE IF NOT EXISTS public.shopping_carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL, -- Backup identifier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'expired')),
    total_value DECIMAL(12,2) DEFAULT 0,
    items_count INT DEFAULT 0,
    abandoned_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id UUID REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL, -- References products(id)
    product_name TEXT NOT NULL,
    product_image TEXT,
    product_category TEXT,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Notifications Table
CREATE TABLE IF NOT EXISTS public.cart_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id UUID REFERENCES public.shopping_carts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('reminder_1h', 'reminder_24h', 'reminder_3d', 'reminder_7d', 'discount_offer', 'expiring_soon')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'clicked', 'dismissed'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopping_carts_user_id ON public.shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_email ON public.shopping_carts(customer_email);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_status ON public.shopping_carts(status);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_updated ON public.shopping_carts(updated_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_notifications_cart ON public.cart_notifications(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_notifications_user ON public.cart_notifications(user_id);

-- Enable Row Level Security
ALTER TABLE public.shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Shopping Carts: Users can view and modify their own carts
CREATE POLICY "Users can view own carts" 
ON public.shopping_carts FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR customer_email = auth.jwt()->>'email');

CREATE POLICY "Users can insert own carts" 
ON public.shopping_carts FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR customer_email = auth.jwt()->>'email');

CREATE POLICY "Users can update own carts" 
ON public.shopping_carts FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR customer_email = auth.jwt()->>'email');

-- Cart Items: Users can manage items in their carts
CREATE POLICY "Users can view own cart items" 
ON public.cart_items FOR SELECT 
TO authenticated 
USING (
    cart_id IN (
        SELECT id FROM public.shopping_carts 
        WHERE user_id = auth.uid() OR customer_email = auth.jwt()->>'email'
    )
);

CREATE POLICY "Users can insert own cart items" 
ON public.cart_items FOR INSERT 
TO authenticated 
WITH CHECK (
    cart_id IN (
        SELECT id FROM public.shopping_carts 
        WHERE user_id = auth.uid() OR customer_email = auth.jwt()->>'email'
    )
);

CREATE POLICY "Users can update own cart items" 
ON public.cart_items FOR UPDATE 
TO authenticated 
USING (
    cart_id IN (
        SELECT id FROM public.shopping_carts 
        WHERE user_id = auth.uid() OR customer_email = auth.jwt()->>'email'
    )
);

CREATE POLICY "Users can delete own cart items" 
ON public.cart_items FOR DELETE 
TO authenticated 
USING (
    cart_id IN (
        SELECT id FROM public.shopping_carts 
        WHERE user_id = auth.uid() OR customer_email = auth.jwt()->>'email'
    )
);

-- Cart Notifications: Users can view their own notifications
CREATE POLICY "Users can view own cart notifications" 
ON public.cart_notifications FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "System can insert cart notifications" 
ON public.cart_notifications FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "Users can update own cart notifications" 
ON public.cart_notifications FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Function to update cart totals automatically
CREATE OR REPLACE FUNCTION update_cart_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.shopping_carts
    SET 
        total_value = (
            SELECT COALESCE(SUM(subtotal), 0)
            FROM public.cart_items
            WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
        ),
        items_count = (
            SELECT COALESCE(SUM(quantity), 0)
            FROM public.cart_items
            WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to maintain cart totals
DROP TRIGGER IF EXISTS trigger_update_cart_totals_insert ON public.cart_items;
CREATE TRIGGER trigger_update_cart_totals_insert
AFTER INSERT ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION update_cart_totals();

DROP TRIGGER IF EXISTS trigger_update_cart_totals_update ON public.cart_items;
CREATE TRIGGER trigger_update_cart_totals_update
AFTER UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION update_cart_totals();

DROP TRIGGER IF EXISTS trigger_update_cart_totals_delete ON public.cart_items;
CREATE TRIGGER trigger_update_cart_totals_delete
AFTER DELETE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION update_cart_totals();

-- Function to mark carts as abandoned
CREATE OR REPLACE FUNCTION mark_abandoned_carts()
RETURNS void AS $$
BEGIN
    UPDATE public.shopping_carts
    SET 
        status = 'abandoned',
        abandoned_at = NOW()
    WHERE 
        status = 'active'
        AND updated_at < NOW() - INTERVAL '1 hour'
        AND abandoned_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- View for abandoned carts needing attention
CREATE OR REPLACE VIEW abandoned_carts_summary AS
SELECT 
    sc.id,
    sc.customer_email,
    sc.created_at,
    sc.updated_at,
    sc.total_value,
    sc.items_count,
    EXTRACT(EPOCH FROM (NOW() - sc.updated_at))/3600 AS hours_abandoned,
    CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - sc.updated_at))/3600 < 1 THEN 'recent'
        WHEN EXTRACT(EPOCH FROM (NOW() - sc.updated_at))/3600 < 24 THEN 'reminder_1h'
        WHEN EXTRACT(EPOCH FROM (NOW() - sc.updated_at))/3600 < 72 THEN 'reminder_24h'
        WHEN EXTRACT(EPOCH FROM (NOW() - sc.updated_at))/3600 < 168 THEN 'reminder_3d'
        ELSE 'reminder_7d'
    END AS notification_stage,
    (
        SELECT COUNT(*) 
        FROM public.cart_notifications cn 
        WHERE cn.cart_id = sc.id
    ) AS notifications_sent
FROM public.shopping_carts sc
WHERE sc.status IN ('active', 'abandoned')
ORDER BY sc.updated_at DESC;

COMMENT ON TABLE public.shopping_carts IS 'Stores user shopping carts for abandoned cart tracking';
COMMENT ON TABLE public.cart_items IS 'Individual items in shopping carts';
COMMENT ON TABLE public.cart_notifications IS 'History of notifications sent for abandoned carts';
COMMENT ON VIEW abandoned_carts_summary IS 'Summary view of abandoned carts with notification recommendations';
-- =====================================================
-- MIGRATION: Time Tracking System
-- =====================================================
-- Purpose: Track user activity sessions and calculate accumulated usage times
-- Features:
--   - Session tracking with start/end timestamps
--   - Automatic duration calculation
--   - Aggregate stats: daily, weekly, monthly, total
--   - Inactivity detection for admin alerts
-- =====================================================

-- 1. CREATE TABLE: user_activity_logs
-- Stores individual session records
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    duration_minutes INTEGER,
    page_path TEXT,
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_session_end CHECK (session_end IS NULL OR session_end >= session_start),
    CONSTRAINT valid_duration CHECK (duration_minutes IS NULL OR duration_minutes >= 0)
);

-- 2. CREATE INDEXES
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_session_start ON user_activity_logs(session_start DESC);
CREATE INDEX idx_user_activity_logs_user_date ON user_activity_logs(user_id, session_start DESC);

-- 3. CREATE TRIGGER: Auto-calculate duration on session end
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Only calculate if session_end is set and duration is not manually provided
    IF NEW.session_end IS NOT NULL AND NEW.duration_minutes IS NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_duration
    BEFORE INSERT OR UPDATE ON user_activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_session_duration();

-- 4. RLS POLICIES
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity"
    ON user_activity_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own activity logs
CREATE POLICY "Users can insert own activity"
    ON user_activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own activity logs (for session_end)
CREATE POLICY "Users can update own activity"
    ON user_activity_logs FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin can view all activity logs
CREATE POLICY "Admins can view all activity"
    ON user_activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- 5. FUNCTION: Start new session
CREATE OR REPLACE FUNCTION start_user_session(
    p_page_path TEXT DEFAULT NULL,
    p_device_info TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    INSERT INTO user_activity_logs (user_id, page_path, device_info)
    VALUES (auth.uid(), p_page_path, p_device_info)
    RETURNING id INTO v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCTION: End session
CREATE OR REPLACE FUNCTION end_user_session(
    p_session_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_duration INTEGER;
BEGIN
    UPDATE user_activity_logs
    SET session_end = NOW()
    WHERE id = p_session_id AND user_id = auth.uid()
    RETURNING duration_minutes INTO v_duration;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Session not found');
    END IF;
    
    RETURN jsonb_build_object('success', true, 'duration_minutes', v_duration);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. VIEW: Daily activity stats per user
CREATE OR REPLACE VIEW daily_activity_stats AS
SELECT 
    user_id,
    DATE(session_start) as activity_date,
    COUNT(*) as session_count,
    SUM(duration_minutes) as total_minutes,
    ROUND(AVG(duration_minutes)::numeric, 2) as avg_session_minutes,
    MIN(session_start) as first_session,
    MAX(session_end) as last_session
FROM user_activity_logs
WHERE session_end IS NOT NULL
GROUP BY user_id, DATE(session_start);

-- 8. VIEW: Weekly activity stats per user
CREATE OR REPLACE VIEW weekly_activity_stats AS
SELECT 
    user_id,
    DATE_TRUNC('week', session_start) as week_start,
    COUNT(*) as session_count,
    SUM(duration_minutes) as total_minutes,
    ROUND(AVG(duration_minutes)::numeric, 2) as avg_session_minutes,
    COUNT(DISTINCT DATE(session_start)) as active_days
FROM user_activity_logs
WHERE session_end IS NOT NULL
GROUP BY user_id, DATE_TRUNC('week', session_start);

-- 9. VIEW: Monthly activity stats per user
CREATE OR REPLACE VIEW monthly_activity_stats AS
SELECT 
    user_id,
    DATE_TRUNC('month', session_start) as month_start,
    COUNT(*) as session_count,
    SUM(duration_minutes) as total_minutes,
    ROUND(AVG(duration_minutes)::numeric, 2) as avg_session_minutes,
    COUNT(DISTINCT DATE(session_start)) as active_days
FROM user_activity_logs
WHERE session_end IS NOT NULL
GROUP BY user_id, DATE_TRUNC('month', session_start);

-- 10. VIEW: Total activity stats per user
CREATE OR REPLACE VIEW user_total_activity AS
SELECT 
    u.id as user_id,
    p.full_name,
    p.email,
    COALESCE(SUM(ual.duration_minutes), 0) as total_minutes,
    COALESCE(ROUND((SUM(ual.duration_minutes) / 60.0)::numeric, 2), 0) as total_hours,
    COUNT(ual.id) as total_sessions,
    COALESCE(ROUND(AVG(ual.duration_minutes)::numeric, 2), 0) as avg_session_minutes,
    MAX(ual.session_start) as last_active,
    MIN(ual.session_start) as first_active,
    COUNT(DISTINCT DATE(ual.session_start)) as total_active_days,
    CASE 
        WHEN MAX(ual.session_start) < NOW() - INTERVAL '7 days' THEN true
        ELSE false
    END as is_inactive
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_activity_logs ual ON ual.user_id = u.id AND ual.session_end IS NOT NULL
GROUP BY u.id, p.full_name, p.email;

-- 11. FUNCTION: Get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    SELECT jsonb_build_object(
        'total_minutes', COALESCE(total_minutes, 0),
        'total_hours', COALESCE(total_hours, 0),
        'total_sessions', COALESCE(total_sessions, 0),
        'avg_session_minutes', COALESCE(avg_session_minutes, 0),
        'last_active', last_active,
        'first_active', first_active,
        'total_active_days', COALESCE(total_active_days, 0),
        'is_inactive', COALESCE(is_inactive, false)
    ) INTO v_result
    FROM user_total_activity
    WHERE user_id = v_user_id;
    
    RETURN COALESCE(v_result, jsonb_build_object(
        'total_minutes', 0, 'total_hours', 0, 'total_sessions', 0,
        'avg_session_minutes', 0, 'total_active_days', 0, 'is_inactive', true
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. FUNCTION: Get inactive users (admin only)
CREATE OR REPLACE FUNCTION get_inactive_users(
    p_days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    email TEXT,
    last_active TIMESTAMPTZ,
    days_inactive INTEGER
) AS $$
BEGIN
    -- Verify admin access
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = true
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin only.';
    END IF;
    
    RETURN QUERY
    SELECT 
        uta.user_id,
        uta.full_name,
        uta.email,
        uta.last_active,
        EXTRACT(DAY FROM (NOW() - uta.last_active))::INTEGER as days_inactive
    FROM user_total_activity uta
    WHERE uta.last_active < NOW() - (p_days_threshold || ' days')::INTERVAL
        OR uta.last_active IS NULL
    ORDER BY uta.last_active DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. GRANT PERMISSIONS
GRANT SELECT ON daily_activity_stats TO authenticated;
GRANT SELECT ON weekly_activity_stats TO authenticated;
GRANT SELECT ON monthly_activity_stats TO authenticated;
GRANT SELECT ON user_total_activity TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES (commented)
-- =====================================================
/*
-- Check table structure
SELECT * FROM user_activity_logs LIMIT 5;

-- View total activity for current user
SELECT * FROM get_user_activity_summary();

-- View daily stats
SELECT * FROM daily_activity_stats WHERE user_id = auth.uid() ORDER BY activity_date DESC LIMIT 7;

-- View inactive users (admin only)
SELECT * FROM get_inactive_users(7);

-- Manual session test
SELECT start_user_session('/gear', 'Desktop Chrome');
SELECT end_user_session('session-id-here');
*/
-- Safe migration script: Checks if tables exist before creating
-- Part 1: Banners
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  tagline text,
  link text,
  image_url text not null,
  mobile_image_url text,
  button_text text default 'VER MÃS',
  sort_order int default 0,
  is_active boolean default true
);

-- Enable RLS for banners (safe to run multiple times)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Banners are viewable by everyone'
    ) THEN
        CREATE POLICY "Banners are viewable by everyone" ON public.banners FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Only admins can insert banners'
    ) THEN
        CREATE POLICY "Only admins can insert banners" ON public.banners FOR INSERT WITH CHECK (
            auth.uid() IN (SELECT id FROM public.profiles)
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Admins can update banners'
    ) THEN
        CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE USING (
             auth.uid() IN (SELECT id FROM public.profiles)
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Admins can delete banners'
    ) THEN
        CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE USING (
             auth.uid() IN (SELECT id FROM public.profiles)
        );
    END IF;
END
$$;

-- Part 2: User Feedback
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    message text not null,
    rating int,
    category text
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_feedback' AND policyname = 'Users can insert their own feedback'
    ) THEN
        CREATE POLICY "Users can insert their own feedback" ON public.user_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_feedback' AND policyname = 'Admins can view all feedback'
    ) THEN
        CREATE POLICY "Admins can view all feedback" ON public.user_feedback FOR SELECT USING (
            auth.uid() IN (SELECT id FROM public.profiles)
        );
    END IF;
END
$$;

-- Part 3: User Equipment
CREATE TABLE IF NOT EXISTS public.user_equipment (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    product_name text not null,
    product_type text not null,
    is_interested boolean default false
);

ALTER TABLE public.user_equipment ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_equipment' AND policyname = 'Users can manage their own equipment'
    ) THEN
        CREATE POLICY "Users can manage their own equipment" ON public.user_equipment FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Part 4: Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('workshop-images', 'workshop-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true) ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    -- Workshop Images Policies
    IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Workshop images are publicly accessible' ) THEN
        CREATE POLICY "Workshop images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'workshop-images' );
    END IF;
    IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can upload workshop images' ) THEN
        CREATE POLICY "Anyone can upload workshop images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'workshop-images' );
    END IF;

    -- Banner Images Policies
    IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Banner images are publicly accessible' ) THEN
        CREATE POLICY "Banner images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'banner-images' );
    END IF;
    IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can upload banner images' ) THEN
        CREATE POLICY "Anyone can upload banner images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'banner-images' );
    END IF;
END
$$;

-- Part 5: Initialize Banners with Provided HTML Content
-- We check if table is empty to avoid duplicates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.banners) THEN
        INSERT INTO public.banners (title, tagline, link, image_url, button_text, sort_order) VALUES
        ('Nuevo Firmware 2.0', 'Rendimiento impresionante, Ahora mejorado.', 'https://downloadcenter.nikonimglib.com/es/download/fw/571.html', 'https://www.nikoncenter.cl/uploads/shortcuts/pub_20250829-013533.jpg', 'DESCARGAR', 1),
        ('DX 16-50mm f/2.8 VR', 'Rendimiento de zoom rÃ¡pido y versÃ¡til para fotos y vÃ­deos.', 'https://www.nikoncenter.cl/lentes/mirrorless/nikkor-z-dx-16-50mm-f28-vr', 'https://www.nikoncenter.cl/uploads/shortcuts/pub_20260112-094159.jpg', 'VER MÃS', 2),
        ('Nuevo Firmware 5.0', 'Nuevas y poderosas ventajas y mejoras', 'https://downloadcenter.nikonimglib.com/es/products/589/Z_9.html', 'https://www.nikoncenter.cl/uploads/shortcuts/pub_20240328-112737.jpg', 'DESCARGAR', 3),
        ('DX MC 35mm f/1.7', 'Ligero, brillante y hermoso.', 'https://www.nikoncenter.cl/lentes/mirrorless/nikkor-z-dx-mc-35mm-f-17', 'https://www.nikoncenter.cl/uploads/shortcuts/pub_20260112-094427.jpg', 'VER MÃS', 4);
    END IF;
END
$$;
-- =====================================================
-- Migration: Workshop Capacity Control System
-- Description: Sistema completo de control de cupos para workshops
--              con lista de espera automÃ¡tica y notificaciones
-- Date: 2026-01-26
-- =====================================================

-- ============================================
-- 1. Modificar workshop_registrations (MOVED UP)
-- ============================================

-- Agregar columna status si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workshop_registrations' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE workshop_registrations 
    ADD COLUMN status TEXT DEFAULT 'confirmed';
  END IF;
END $$;

-- Crear tipo enum para status (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
    CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlist', 'cancelled');
  END IF;
END $$;

-- Convertir columna a tipo enum
ALTER TABLE workshop_registrations 
ALTER COLUMN status DROP DEFAULT,
ALTER COLUMN status TYPE registration_status USING status::registration_status,
ALTER COLUMN status SET DEFAULT 'confirmed';

-- Agregar Ã­ndices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_workshop_registrations_status 
  ON workshop_registrations(status);
CREATE INDEX IF NOT EXISTS idx_workshop_registrations_workshop_status 
  ON workshop_registrations(workshop_id, status);

-- ============================================
-- 2. Agregar columna waitlist_position (MOVED UP)
-- ============================================

ALTER TABLE workshop_registrations 
ADD COLUMN IF NOT EXISTS waitlist_position INTEGER;

CREATE INDEX IF NOT EXISTS idx_workshop_registrations_waitlist 
  ON workshop_registrations(workshop_id, waitlist_position) 
  WHERE status = 'waitlist';

-- ============================================
-- 3. Agregar columnas de control de cupos a workshops
-- ============================================

-- Agregar max_participants y available_spots a workshops
ALTER TABLE workshops 
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS available_spots INTEGER;

-- Inicializar available_spots basado en registros existentes
UPDATE workshops
SET available_spots = COALESCE(max_participants, 30) - (
  SELECT COUNT(*) 
  FROM workshop_registrations 
  WHERE workshop_registrations.workshop_id = workshops.id
  AND workshop_registrations.status != 'cancelled'
)
WHERE available_spots IS NULL;

-- ============================================
-- 4. FunciÃ³n para registrar con validaciÃ³n
-- ============================================

CREATE OR REPLACE FUNCTION register_for_workshop_with_validation(
  p_workshop_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_available_spots INTEGER;
  v_max_participants INTEGER;
  v_already_registered BOOLEAN;
  v_registration_id UUID;
  v_status registration_status;
  v_waitlist_position INTEGER;
BEGIN
  -- Verificar si ya estÃ¡ registrado
  SELECT EXISTS(
    SELECT 1 FROM workshop_registrations
    WHERE workshop_id = p_workshop_id 
    AND user_id = p_user_id
    AND status IN ('confirmed', 'waitlist')
  ) INTO v_already_registered;

  IF v_already_registered THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ya estÃ¡s registrado en este workshop',
      'status', null
    );
  END IF;

  -- Obtener informaciÃ³n del workshop
  SELECT available_spots, max_participants
  INTO v_available_spots, v_max_participants
  FROM workshops
  WHERE id = p_workshop_id;

  IF v_available_spots IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Workshop no encontrado',
      'status', null
    );
  END IF;

  -- Determinar status segÃºn disponibilidad
  IF v_available_spots > 0 THEN
    v_status := 'confirmed';
    v_waitlist_position := NULL;
    
    -- Actualizar cupos disponibles
    UPDATE workshops
    SET available_spots = available_spots - 1
    WHERE id = p_workshop_id;
  ELSE
    v_status := 'waitlist';
    
    -- Calcular posiciÃ³n en lista de espera
    SELECT COALESCE(MAX(waitlist_position), 0) + 1
    INTO v_waitlist_position
    FROM workshop_registrations
    WHERE workshop_id = p_workshop_id AND status = 'waitlist';
  END IF;

  -- Crear registro
  INSERT INTO workshop_registrations (workshop_id, user_id, status, waitlist_position)
  VALUES (p_workshop_id, p_user_id, v_status, v_waitlist_position)
  RETURNING id INTO v_registration_id;

  -- Crear notificaciÃ³n
  IF v_status = 'confirmed' THEN
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (
      p_user_id,
      'Â¡InscripciÃ³n Confirmada! ðŸŽ‰',
      'Tu cupo en el workshop ha sido confirmado. Te esperamos.',
      'workshops'
    );
  ELSE
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (
      p_user_id,
      'En Lista de Espera â³',
      'EstÃ¡s en la lista de espera. Te notificaremos si se libera un cupo.',
      'workshops'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', v_status,
    'registration_id', v_registration_id,
    'waitlist_position', v_waitlist_position,
    'available_spots', CASE WHEN v_status = 'confirmed' THEN v_available_spots - 1 ELSE v_available_spots END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FunciÃ³n para cancelar registro
-- ============================================

CREATE OR REPLACE FUNCTION cancel_workshop_registration(
  p_registration_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_workshop_id UUID;
  v_user_id UUID;
  v_old_status registration_status;
  v_next_waitlist_user UUID;
  v_next_registration_id UUID;
BEGIN
  -- Obtener datos del registro
  SELECT workshop_id, user_id, status
  INTO v_workshop_id, v_user_id, v_old_status
  FROM workshop_registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registro no encontrado');
  END IF;

  -- Cancelar registro
  UPDATE workshop_registrations
  SET status = 'cancelled'
  WHERE id = p_registration_id;

  -- Si era confirmado, liberar cupo y procesar waitlist
  IF v_old_status = 'confirmed' THEN
    -- Incrementar cupos disponibles
    UPDATE workshops
    SET available_spots = available_spots + 1
    WHERE id = v_workshop_id;

    -- Buscar primer usuario en waitlist
    SELECT user_id, id
    INTO v_next_waitlist_user, v_next_registration_id
    FROM workshop_registrations
    WHERE workshop_id = v_workshop_id
    AND status = 'waitlist'
    ORDER BY waitlist_position ASC
    LIMIT 1;

    -- Si hay alguien en waitlist, promoverlo
    IF v_next_waitlist_user IS NOT NULL THEN
      -- Actualizar a confirmado
      UPDATE workshop_registrations
      SET status = 'confirmed', waitlist_position = NULL
      WHERE id = v_next_registration_id;

      -- Decrementar cupos disponibles nuevamente
      UPDATE workshops
      SET available_spots = available_spots - 1
      WHERE id = v_workshop_id;

      -- Reordenar posiciones de waitlist
      UPDATE workshop_registrations
      SET waitlist_position = waitlist_position - 1
      WHERE workshop_id = v_workshop_id
      AND status = 'waitlist'
      AND waitlist_position > (
        SELECT waitlist_position FROM workshop_registrations WHERE id = v_next_registration_id
      );

      -- Notificar al usuario promovido
      INSERT INTO notifications (user_id, title, message, category)
      VALUES (
        v_next_waitlist_user,
        'Â¡Cupo Disponible! ðŸŽ‰',
        'Se ha liberado un cupo en el workshop. Tu inscripciÃ³n ha sido confirmada.',
        'workshops'
      );
    END IF;
  END IF;

  -- Notificar cancelaciÃ³n al usuario original
  INSERT INTO notifications (user_id, title, message, category)
  VALUES (
    v_user_id,
    'InscripciÃ³n Cancelada',
    'Tu inscripciÃ³n al workshop ha sido cancelada.',
    'workshops'
  );

  RETURN jsonb_build_object('success', true, 'processed_waitlist', v_next_waitlist_user IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. FunciÃ³n para obtener disponibilidad
-- ============================================

CREATE OR REPLACE FUNCTION get_workshop_availability(p_workshop_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'workshop_id', w.id,
    'title', w.title,
    'max_participants', w.max_participants,
    'available_spots', w.available_spots,
    'confirmed_count', (
      SELECT COUNT(*) FROM workshop_registrations 
      WHERE workshop_id = w.id AND status = 'confirmed'
    ),
    'waitlist_count', (
      SELECT COUNT(*) FROM workshop_registrations 
      WHERE workshop_id = w.id AND status = 'waitlist'
    ),
    'is_full', w.available_spots = 0
  )
  INTO v_result
  FROM workshops w
  WHERE w.id = p_workshop_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. FunciÃ³n para procesar manualmente waitlist
-- ============================================

CREATE OR REPLACE FUNCTION process_workshop_waitlist(p_workshop_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_available_spots INTEGER;
  v_processed_count INTEGER := 0;
  v_waitlist_user RECORD;
BEGIN
  -- Obtener cupos disponibles
  SELECT available_spots INTO v_available_spots
  FROM workshops WHERE id = p_workshop_id;

  IF v_available_spots IS NULL OR v_available_spots <= 0 THEN
    RETURN jsonb_build_object('success', false, 'processed', 0, 'message', 'No hay cupos disponibles');
  END IF;

  -- Procesar usuarios en waitlist
  FOR v_waitlist_user IN
    SELECT id, user_id, waitlist_position
    FROM workshop_registrations
    WHERE workshop_id = p_workshop_id
    AND status = 'waitlist'
    ORDER BY waitlist_position ASC
    LIMIT v_available_spots
  LOOP
    -- Confirmar registro
    UPDATE workshop_registrations
    SET status = 'confirmed', waitlist_position = NULL
    WHERE id = v_waitlist_user.id;

    -- Notificar usuario
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (
      v_waitlist_user.user_id,
      'Â¡Cupo Confirmado! ðŸŽ‰',
      'Tu cupo en el workshop ha sido confirmado.',
      'workshops'
    );

    v_processed_count := v_processed_count + 1;
  END LOOP;

  -- Actualizar cupos disponibles
  UPDATE workshops
  SET available_spots = available_spots - v_processed_count
  WHERE id = p_workshop_id;

  -- Reordenar posiciones restantes
  UPDATE workshop_registrations
  SET waitlist_position = waitlist_position - v_processed_count
  WHERE workshop_id = p_workshop_id
  AND status = 'waitlist';

  RETURN jsonb_build_object(
    'success', true, 
    'processed', v_processed_count,
    'remaining_spots', v_available_spots - v_processed_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Trigger para mantener integridad
-- ============================================

CREATE OR REPLACE FUNCTION update_workshop_spots()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular cupos disponibles
  UPDATE workshops
  SET available_spots = max_participants - (
    SELECT COUNT(*)
    FROM workshop_registrations
    WHERE workshop_id = NEW.workshop_id
    AND status = 'confirmed'
  )
  WHERE id = NEW.workshop_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_update_workshop_spots ON workshop_registrations;

-- Crear trigger
CREATE TRIGGER trigger_update_workshop_spots
AFTER INSERT OR UPDATE OF status ON workshop_registrations
FOR EACH ROW
EXECUTE FUNCTION update_workshop_spots();

-- ============================================
-- 9. RLS Policies
-- ============================================

-- Permitir a usuarios ver disponibilidad de workshops
DROP POLICY IF EXISTS users_view_workshop_availability ON workshops;
CREATE POLICY users_view_workshop_availability
  ON workshops FOR SELECT
  TO authenticated
  USING (true);

-- Permitir a usuarios ver sus propios registros
DROP POLICY IF EXISTS users_view_own_registrations ON workshop_registrations;
CREATE POLICY users_view_own_registrations
  ON workshop_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 10. Vista para admin: Lista de inscritos
-- ============================================

CREATE OR REPLACE VIEW workshop_registrations_detailed AS
SELECT 
  wr.id,
  wr.workshop_id,
  wr.user_id,
  wr.status,
  wr.waitlist_position,
  wr.created_at,
  w.title as workshop_title,
  w.date as workshop_date,
  p.first_name,
  p.last_name,
  p.email,
  p.phone
FROM workshop_registrations wr
JOIN workshops w ON w.id = wr.workshop_id
JOIN profiles p ON p.id = wr.user_id
ORDER BY w.date DESC, wr.created_at ASC;

-- ============================================
-- Comentarios y documentaciÃ³n
-- ============================================

COMMENT ON COLUMN workshops.max_participants IS 'NÃºmero mÃ¡ximo de participantes permitidos';
COMMENT ON COLUMN workshops.available_spots IS 'Cupos disponibles actuales (se actualiza automÃ¡ticamente)';
COMMENT ON COLUMN workshop_registrations.status IS 'Estado: confirmed (confirmado), waitlist (lista de espera), cancelled (cancelado)';
COMMENT ON COLUMN workshop_registrations.waitlist_position IS 'PosiciÃ³n en lista de espera (NULL si confirmado)';

COMMENT ON FUNCTION register_for_workshop_with_validation IS 'Registra usuario en workshop con validaciÃ³n de cupos. Retorna status y posiciÃ³n en waitlist si aplica.';
COMMENT ON FUNCTION cancel_workshop_registration IS 'Cancela registro y procesa automÃ¡ticamente el siguiente en waitlist si aplica.';
COMMENT ON FUNCTION get_workshop_availability IS 'Obtiene informaciÃ³n detallada de disponibilidad de un workshop.';
COMMENT ON FUNCTION process_workshop_waitlist IS 'Procesa manualmente la lista de espera de un workshop (admin).';

-- =====================================================
-- Fin de migraciÃ³n
-- =====================================================
-- =====================================================
-- MIGRATION: Analytics & Metrics Tracking
-- =====================================================
-- Purpose: Track user interactions and generate comprehensive analytics
-- Features:
--   - Page view tracking
--   - Product view tracking
--   - AI query tracking
--   - Tutorial view tracking
--   - Comprehensive KPI views
-- =====================================================

-- 1. CREATE TABLE: analytics_events
-- Generic event tracking table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'page_view', 'product_view', 'tutorial_view', 'ai_query', 'workshop_register', etc.
    event_category TEXT, -- 'navigation', 'content', 'interaction', 'search'
    event_data JSONB, -- Flexible data storage
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEXES
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_user_date ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_data ON analytics_events USING gin(event_data);

-- 3. RLS POLICIES
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own events"
    ON analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin can view all events
CREATE POLICY "Admins can view all events"
    ON analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- 4. FUNCTION: Log analytics event
CREATE OR REPLACE FUNCTION log_analytics_event(
    p_event_type TEXT,
    p_event_category TEXT DEFAULT NULL,
    p_event_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO analytics_events (user_id, event_type, event_category, event_data)
    VALUES (auth.uid(), p_event_type, p_event_category, p_event_data)
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VIEW: Active users stats
CREATE OR REPLACE VIEW analytics_active_users AS
SELECT 
    'daily' as period,
    COUNT(DISTINCT user_id) as user_count,
    DATE(created_at) as date
FROM analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)

UNION ALL

SELECT 
    'weekly' as period,
    COUNT(DISTINCT user_id) as user_count,
    DATE_TRUNC('week', created_at)::date as date
FROM analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', created_at)

UNION ALL

SELECT 
    'monthly' as period,
    COUNT(DISTINCT user_id) as user_count,
    DATE_TRUNC('month', created_at)::date as date
FROM analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)

ORDER BY date DESC;

-- 6. VIEW: Most viewed pages
CREATE OR REPLACE VIEW analytics_top_pages AS
SELECT 
    event_data->>'page' as page_path,
    event_data->>'page_name' as page_name,
    COUNT(*) as view_count,
    COUNT(DISTINCT user_id) as unique_users,
    MAX(created_at) as last_viewed
FROM analytics_events
WHERE event_type = 'page_view'
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY event_data->>'page', event_data->>'page_name'
ORDER BY view_count DESC
LIMIT 20;

-- 7. VIEW: Most viewed products
CREATE OR REPLACE VIEW analytics_top_products AS
SELECT 
    event_data->>'product_id' as product_id,
    event_data->>'product_name' as product_name,
    event_data->>'category' as category,
    COUNT(*) as view_count,
    COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE event_type = 'product_view'
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY event_data->>'product_id', event_data->>'product_name', event_data->>'category'
ORDER BY view_count DESC
LIMIT 20;

-- 8. VIEW: Most registered products (using existing data)
CREATE OR REPLACE VIEW analytics_top_registered_products AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.category,
    COUNT(*) as registration_count,
    COUNT(DISTINCT up.user_id) as unique_users
FROM user_products up
JOIN products p ON p.id = up.product_id
GROUP BY p.id, p.name, p.category
ORDER BY registration_count DESC
LIMIT 20;

-- 9. VIEW: AI Assistant queries
CREATE OR REPLACE VIEW analytics_ai_queries AS
SELECT 
    DATE(created_at) as query_date,
    COUNT(*) as total_queries,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(LENGTH(event_data->>'query')) as avg_query_length
FROM analytics_events
WHERE event_type = 'ai_query'
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY query_date DESC;

-- 10. VIEW: Most viewed tutorials
CREATE OR REPLACE VIEW analytics_top_tutorials AS
SELECT 
    event_data->>'tutorial_id' as tutorial_id,
    event_data->>'tutorial_title' as tutorial_title,
    COUNT(*) as view_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(NULLIF((event_data->>'duration_seconds')::numeric, 0)) as avg_duration_seconds
FROM analytics_events
WHERE event_type = 'tutorial_view'
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY event_data->>'tutorial_id', event_data->>'tutorial_title'
ORDER BY view_count DESC
LIMIT 20;

-- 11. VIEW: Workshop engagement
CREATE OR REPLACE VIEW analytics_workshop_stats AS
SELECT 
    w.id as workshop_id,
    w.title,
    w.date,
    COUNT(DISTINCT wr.user_id) as total_registrations,
    COUNT(DISTINCT CASE WHEN wr.status = 'confirmed' THEN wr.user_id END) as confirmed_count,
    COUNT(DISTINCT CASE WHEN wr.status = 'waitlist' THEN wr.user_id END) as waitlist_count,
    COUNT(DISTINCT CASE WHEN wr.status = 'cancelled' THEN wr.user_id END) as cancelled_count,
    w.max_participants,
    ROUND((COUNT(DISTINCT CASE WHEN wr.status = 'confirmed' THEN wr.user_id END)::numeric / NULLIF(w.max_participants, 0)) * 100, 2) as fill_percentage
FROM workshops w
LEFT JOIN workshop_registrations wr ON wr.workshop_id = w.id
GROUP BY w.id, w.title, w.date, w.max_participants
ORDER BY w.date DESC;

-- 12. VIEW: User engagement scores
CREATE OR REPLACE VIEW analytics_user_engagement AS
SELECT 
    u.id as user_id,
    p.full_name,
    p.email,
    -- Activity metrics
    COALESCE(uta.total_minutes, 0) as total_time_minutes,
    COALESCE(uta.total_sessions, 0) as total_sessions,
    -- Product engagement
    (SELECT COUNT(*) FROM user_products WHERE user_id = u.id) as registered_products_count,
    -- Event engagement
    (SELECT COUNT(*) FROM analytics_events WHERE user_id = u.id AND event_type = 'ai_query') as ai_queries_count,
    (SELECT COUNT(*) FROM analytics_events WHERE user_id = u.id AND event_type = 'tutorial_view') as tutorials_viewed_count,
    (SELECT COUNT(*) FROM workshop_registrations WHERE user_id = u.id) as workshops_registered_count,
    -- Engagement score (weighted formula)
    (
        (COALESCE(uta.total_minutes, 0) / 60.0) * 2 + -- Hours * 2
        (SELECT COUNT(*) FROM user_products WHERE user_id = u.id) * 10 + -- Products * 10
        (SELECT COUNT(*) FROM analytics_events WHERE user_id = u.id AND event_type = 'ai_query') * 5 + -- AI queries * 5
        (SELECT COUNT(*) FROM analytics_events WHERE user_id = u.id AND event_type = 'tutorial_view') * 3 + -- Tutorials * 3
        (SELECT COUNT(*) FROM workshop_registrations WHERE user_id = u.id) * 15 -- Workshops * 15
    )::numeric as engagement_score,
    uta.last_active,
    CASE 
        WHEN uta.last_active IS NULL THEN 'inactive'
        WHEN uta.last_active >= NOW() - INTERVAL '7 days' THEN 'active'
        WHEN uta.last_active >= NOW() - INTERVAL '30 days' THEN 'moderate'
        ELSE 'inactive'
    END as engagement_level
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_total_activity uta ON uta.user_id = u.id
ORDER BY engagement_score DESC;

-- 13. VIEW: Daily activity summary (for dashboard charts)
CREATE OR REPLACE VIEW analytics_daily_summary AS
SELECT 
    DATE(created_at) as activity_date,
    COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN id END) as page_views,
    COUNT(DISTINCT CASE WHEN event_type = 'product_view' THEN id END) as product_views,
    COUNT(DISTINCT CASE WHEN event_type = 'ai_query' THEN id END) as ai_queries,
    COUNT(DISTINCT CASE WHEN event_type = 'tutorial_view' THEN id END) as tutorial_views,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_events
FROM analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY activity_date DESC;

-- 14. FUNCTION: Get dashboard KPIs
CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'active_users_today', (
            SELECT COUNT(DISTINCT user_id) 
            FROM analytics_events 
            WHERE created_at >= CURRENT_DATE
        ),
        'active_users_week', (
            SELECT COUNT(DISTINCT user_id) 
            FROM analytics_events 
            WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        ),
        'active_users_month', (
            SELECT COUNT(DISTINCT user_id) 
            FROM analytics_events 
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        'total_products_registered', (
            SELECT COUNT(*) FROM user_products
        ),
        'total_serial_numbers', (
            SELECT COUNT(*) FROM serial_numbers WHERE status = 'registered'
        ),
        'total_workshops', (
            SELECT COUNT(*) FROM workshops
        ),
        'upcoming_workshops', (
            SELECT COUNT(*) FROM workshops WHERE date >= CURRENT_DATE
        ),
        'total_ai_queries', (
            SELECT COUNT(*) FROM analytics_events WHERE event_type = 'ai_query'
        ),
        'ai_queries_today', (
            SELECT COUNT(*) FROM analytics_events 
            WHERE event_type = 'ai_query' AND created_at >= CURRENT_DATE
        ),
        'avg_session_duration_minutes', (
            SELECT COALESCE(ROUND(AVG(duration_minutes)::numeric, 2), 0)
            FROM user_activity_logs
            WHERE session_end IS NOT NULL
        ),
        'total_notifications_sent', (
            SELECT COUNT(*) FROM user_notifications
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. GRANT PERMISSIONS
GRANT SELECT ON analytics_active_users TO authenticated;
GRANT SELECT ON analytics_top_pages TO authenticated;
GRANT SELECT ON analytics_top_products TO authenticated;
GRANT SELECT ON analytics_top_registered_products TO authenticated;
GRANT SELECT ON analytics_ai_queries TO authenticated;
GRANT SELECT ON analytics_top_tutorials TO authenticated;
GRANT SELECT ON analytics_workshop_stats TO authenticated;
GRANT SELECT ON analytics_user_engagement TO authenticated;
GRANT SELECT ON analytics_daily_summary TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES (commented)
-- =====================================================
/*
-- Get dashboard KPIs
SELECT * FROM get_dashboard_kpis();

-- View daily summary
SELECT * FROM analytics_daily_summary LIMIT 7;

-- View active users
SELECT * FROM analytics_active_users WHERE period = 'daily' LIMIT 7;

-- Top products
SELECT * FROM analytics_top_products;

-- Top registered products
SELECT * FROM analytics_top_registered_products;

-- User engagement
SELECT * FROM analytics_user_engagement ORDER BY engagement_score DESC LIMIT 10;

-- Workshop stats
SELECT * FROM analytics_workshop_stats;

-- Log test event
SELECT log_analytics_event(
    'page_view',
    'navigation',
    '{"page": "/gear", "page_name": "Mi Equipo"}'::jsonb
);
*/
