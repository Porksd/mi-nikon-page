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
