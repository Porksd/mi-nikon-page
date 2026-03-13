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
