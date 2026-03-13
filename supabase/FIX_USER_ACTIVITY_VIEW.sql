-- ==============================================================================
-- FIX: Update user_total_activity view to include analytics events in last_active
-- ==============================================================================

CREATE OR REPLACE VIEW user_total_activity AS
SELECT 
    u.id as user_id,
    p.full_name,
    p.email,
    -- Activity Logs Stats
    COALESCE(SUM(ual.duration_minutes), 0) as total_minutes,
    COALESCE(ROUND((SUM(ual.duration_minutes) / 60.0)::numeric, 2), 0) as total_hours,
    COUNT(ual.id) as total_sessions,
    COALESCE(ROUND(AVG(ual.duration_minutes)::numeric, 0), 0) as avg_session_minutes,
    
    -- Last Active Calculation (Max of session start OR analytics event)
    GREATEST(
        MAX(ual.session_start), 
        (SELECT MAX(created_at) FROM analytics_events WHERE user_id = u.id)
    ) as last_active,
    
    MIN(ual.session_start) as first_active,
    COUNT(DISTINCT DATE(ual.session_start)) as total_active_days,
    
    -- Inactive Flag logic
    CASE 
        WHEN GREATEST(
            MAX(ual.session_start), 
            (SELECT MAX(created_at) FROM analytics_events WHERE user_id = u.id)
        ) < NOW() - INTERVAL '7 days' THEN true
        ELSE false
    END as is_inactive

FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN user_activity_logs ual ON ual.user_id = u.id AND ual.session_end IS NOT NULL
GROUP BY u.id, p.full_name, p.email;

-- Refresh permissions
GRANT SELECT ON user_total_activity TO authenticated;
