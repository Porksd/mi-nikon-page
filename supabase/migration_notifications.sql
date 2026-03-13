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
--     '¡Nuevo Workshop Disponible!',
--     'Regístrate para el workshop de Fotografía de Retrato este sábado.',
--     'workshop',
--     '/workshops'
-- );

-- SELECT create_notification_for_all(
--     '¡Nueva Actualización Disponible!',
--     'Actualiza el firmware de tu cámara Z para mejorar el rendimiento.',
--     'firmware',
--     'https://downloadcenter.nikonimglib.com/es/index.html'
-- );

-- SELECT notify_product_owners(
--     'Z6III',
--     'Firmware 2.0 para Z6 III',
--     'Nueva actualización disponible con mejoras de rendimiento y nuevas funciones.',
--     'firmware',
--     'https://downloadcenter.nikonimglib.com'
-- );
