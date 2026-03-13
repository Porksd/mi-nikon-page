-- ==============================================================================
-- FIX: Update 'notifications' table schema to match new categories
-- This fixes the error: "new row for relation "notifications" violates check constraint"
-- ==============================================================================

-- 1. Drop the old check constraint
ALTER TABLE IF EXISTS public.notifications 
DROP CONSTRAINT IF EXISTS notifications_category_check;

-- 2. Add the new check constraint with all supported categories
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_category_check 
CHECK (category IN (
    'general', 'novedades', 
    'workshop', 'eventos', 
    'product', 'mi_equipo', 
    'promocion', 'promociones', 
    'firmware', 'carrito'
));

-- ==============================================================================
-- FIX: Ensure dashboard RPC functions exist
-- This fixes the error: "404 Not Found" for get_dashboard_kpis
-- ==============================================================================

-- 3. Re-create get_dashboard_kpis function
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

-- 4. Ensure create_notification_for_all function exists
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
    -- Insert for all users
    INSERT INTO public.user_notifications (user_id, title, message, category, link)
    SELECT id, p_title, p_message, p_category, p_link
    FROM auth.users;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions just in case
GRANT EXECUTE ON FUNCTION get_dashboard_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification_for_all TO authenticated;
GRANT SELECT, INSERT ON public.notifications TO authenticated;