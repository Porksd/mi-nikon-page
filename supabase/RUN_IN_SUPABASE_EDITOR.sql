
-- ==============================================================================
-- STEP 1: NOTIFICATIONS (Must run first as it is referenced by analytics)
-- ==============================================================================

-- 0. PRE-REQUISITE: Ensure profiles has is_admin
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;


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

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON public.user_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created ON public.user_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.user_notifications;
CREATE POLICY "Users can view own notifications"
    ON public.user_notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.user_notifications;
CREATE POLICY "Users can update own notifications"
    ON public.user_notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Only service role can create notifications (admin/system)
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.user_notifications;
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

-- ==============================================================================
-- STEP 2: PROFILE EXPANSION (Must run before analytics as it adds fields to views)
-- ==============================================================================

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
        WHEN p.phone IS NULL OR p.phone = '' THEN 'Teléfono'
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

-- ==============================================================================
-- STEP 3: TIME TRACKING (Must run before analytics)
-- ==============================================================================

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
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_session_start ON user_activity_logs(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_date ON user_activity_logs(user_id, session_start DESC);

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

DROP TRIGGER IF EXISTS trg_calculate_duration ON user_activity_logs;
CREATE TRIGGER trg_calculate_duration
    BEFORE INSERT OR UPDATE ON user_activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_session_duration();

-- 4. RLS POLICIES
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity_logs;
CREATE POLICY "Users can view own activity"
    ON user_activity_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own activity logs
DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity_logs;
CREATE POLICY "Users can insert own activity"
    ON user_activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own activity logs (for session_end)
DROP POLICY IF EXISTS "Users can update own activity" ON user_activity_logs;
CREATE POLICY "Users can update own activity"
    ON user_activity_logs FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin can view all activity logs
DROP POLICY IF EXISTS "Admins can view all activity" ON user_activity_logs;
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
    COALESCE(ROUND(AVG(ual.duration_minutes)::numeric, 0), 0) as avg_session_minutes,
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

-- ==============================================================================
-- STEP 3.5: WORKSHOP & PRODUCT SCHEMA (Required for Analytics)
-- ==============================================================================

-- 1. Ensure WORKSHOPS table exists
CREATE TABLE IF NOT EXISTS public.workshops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    teacher TEXT,
    date DATE,
    time TIME,
    location TEXT,
    total_spots INTEGER DEFAULT 0,
    max_participants INTEGER DEFAULT 30,
    available_spots INTEGER
);

-- Ensure columns exist even if table was created previously (Fix for missing column errors)
ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 30;
ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS available_spots INTEGER;
ALTER TABLE public.workshops ADD COLUMN IF NOT EXISTS total_spots INTEGER DEFAULT 0;

-- 2. Ensure WORKSHOP_REGISTRATIONS table exists
CREATE TABLE IF NOT EXISTS public.workshop_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    UNIQUE(workshop_id, user_id)
);

-- 3. Add STATUS column to workshop_registrations if not exists
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

-- 4. Ensure PRODUCTS table exists
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    image_url TEXT,
    category TEXT,
    stock_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Ensure USER_PRODUCTS table exists
CREATE TABLE IF NOT EXISTS public.user_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    product_id TEXT REFERENCES public.products(id),
    serial_number TEXT,
    purchase_date DATE,
    warranty_status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS (Safe to run multiple times)
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

-- 7. Basic Policies (Drop first to avoid errors)
DROP POLICY IF EXISTS "Workshops are viewable by everyone" ON public.workshops;
CREATE POLICY "Workshops are viewable by everyone" ON public.workshops FOR SELECT USING (true);

DROP POLICY IF EXISTS "Registrations viewable by everyone" ON public.workshop_registrations;
CREATE POLICY "Registrations viewable by everyone" ON public.workshop_registrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);


-- ==============================================================================
-- STEP 4: ANALYTICS (Depends on all previous steps)
-- ==============================================================================

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
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_date ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_data ON analytics_events USING gin(event_data);

-- 3. RLS POLICIES
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
DROP POLICY IF EXISTS "Users can insert own events" ON analytics_events;
CREATE POLICY "Users can insert own events"
    ON analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admin can view all events
DROP POLICY IF EXISTS "Admins can view all events" ON analytics_events;
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
