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
