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
