-- Shopping Cart Test Data
-- Create test carts for 4 users with different abandonment scenarios

-- Clean existing test data
DELETE FROM public.cart_notifications WHERE cart_id IN (
    SELECT id FROM public.shopping_carts WHERE customer_email IN (
        'apacheco@nikoncenter.cl',
        'eduardofuentesbaltrons@gmail.com',
        'andrescomastri@mac.com',
        'gabriel.taito@udenio.com'
    )
);

DELETE FROM public.cart_items WHERE cart_id IN (
    SELECT id FROM public.shopping_carts WHERE customer_email IN (
        'apacheco@nikoncenter.cl',
        'eduardofuentesbaltrons@gmail.com',
        'andrescomastri@mac.com',
        'gabriel.taito@udenio.com'
    )
);

DELETE FROM public.shopping_carts WHERE customer_email IN (
    'apacheco@nikoncenter.cl',
    'eduardofuentesbaltrons@gmail.com',
    'andrescomastri@mac.com',
    'gabriel.taito@udenio.com'
);

-- SCENARIO 1: apacheco@nikoncenter.cl
-- Cart created 2 hours ago - Recently abandoned
-- High-value cart with camera and lens

DO $$
DECLARE
    v_user_id UUID;
    v_cart_id UUID;
BEGIN
    -- Get user_id from profiles
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'apacheco@nikoncenter.cl' LIMIT 1;
    
    -- Insert cart
    INSERT INTO public.shopping_carts (
        user_id,
        customer_email,
        created_at,
        updated_at,
        last_viewed_at,
        status,
        notes
    ) VALUES (
        v_user_id,
        'apacheco@nikoncenter.cl',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '2 hours',
        'active',
        'High-value cart - Camera body + lens'
    ) RETURNING id INTO v_cart_id;
    
    -- Add cart items
    INSERT INTO public.cart_items (cart_id, product_id, product_name, product_image, product_category, quantity, unit_price, added_at) VALUES
    (v_cart_id, 'Z6III', 'Nikon Z6 III', 'https://www.nikoncenter.cl/uploads/camaras/large/20240618-051740_1.png', 'Cámaras Mirrorless', 1, 3490900, NOW() - INTERVAL '2 hours'),
    (v_cart_id, 'Z24-120F4', 'Nikkor Z 24-120mm f/4 S', 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-030236_1.png', 'Lentes S-Line', 1, 1590900, NOW() - INTERVAL '1 hour 45 minutes');
    
    RAISE NOTICE 'Cart created for apacheco@nikoncenter.cl - ID: %', v_cart_id;
END $$;

-- SCENARIO 2: eduardofuentesbaltrons@gmail.com
-- Cart created 1 day ago (24 hours) - Prime for first reminder
-- Mid-value cart with lens and accessories

DO $$
DECLARE
    v_user_id UUID;
    v_cart_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'eduardofuentesbaltrons@gmail.com' LIMIT 1;
    
    INSERT INTO public.shopping_carts (
        user_id,
        customer_email,
        created_at,
        updated_at,
        last_viewed_at,
        status,
        abandoned_at,
        notes
    ) VALUES (
        v_user_id,
        'eduardofuentesbaltrons@gmail.com',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day',
        'abandoned',
        NOW() - INTERVAL '23 hours',
        'Abandoned after 1 day - Ready for reminder notification'
    ) RETURNING id INTO v_cart_id;
    
    INSERT INTO public.cart_items (cart_id, product_id, product_name, product_image, product_category, quantity, unit_price, added_at) VALUES
    (v_cart_id, 'Z85F18', 'Nikkor Z 85mm f/1.8 S', 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-095429_1.png', 'Lentes S-Line', 1, 999900, NOW() - INTERVAL '1 day'),
    (v_cart_id, 'MC-DC2', 'Cable de Control Remoto MC-DC2', 'https://www.nikoncenter.cl/uploads/accesorios/large/accesorio.png', 'Accesorios', 1, 29900, NOW() - INTERVAL '1 day'),
    (v_cart_id, 'EN-EL15C', 'Batería EN-EL15c', 'https://www.nikoncenter.cl/uploads/accesorios/large/accesorio.png', 'Accesorios', 2, 89900, NOW() - INTERVAL '23 hours');
    
    -- Create a notification record (as if system already sent one)
    INSERT INTO public.cart_notifications (
        cart_id,
        user_id,
        notification_type,
        title,
        message,
        created_at,
        sent_at,
        status
    ) VALUES (
        v_cart_id,
        v_user_id,
        'reminder_1h',
        '¡Tu carrito te está esperando!',
        'Tienes 3 productos guardados por un valor de $1.209.700. Completa tu compra ahora.',
        NOW() - INTERVAL '23 hours',
        NOW() - INTERVAL '23 hours',
        'sent'
    );
    
    RAISE NOTICE 'Cart created for eduardofuentesbaltrons@gmail.com - ID: %', v_cart_id;
END $$;

-- SCENARIO 3: andrescomastri@mac.com
-- Cart created 3 days ago - Needs follow-up reminder
-- Low-value cart with single accessory (edge case)

DO $$
DECLARE
    v_user_id UUID;
    v_cart_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'andrescomastri@mac.com' LIMIT 1;
    
    INSERT INTO public.shopping_carts (
        user_id,
        customer_email,
        created_at,
        updated_at,
        last_viewed_at,
        status,
        abandoned_at,
        notes
    ) VALUES (
        v_user_id,
        'andrescomastri@mac.com',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '2 days 18 hours',
        'abandoned',
        NOW() - INTERVAL '3 days',
        'Abandoned 3 days ago - Single item, may need discount incentive'
    ) RETURNING id INTO v_cart_id;
    
    INSERT INTO public.cart_items (cart_id, product_id, product_name, product_image, product_category, quantity, unit_price, added_at) VALUES
    (v_cart_id, 'SB-5000', 'Flash Speedlight SB-5000', 'https://www.nikoncenter.cl/uploads/flashes/large/20180427-074252.png', 'Iluminación', 1, 549990, NOW() - INTERVAL '3 days');
    
    -- Multiple notifications sent
    INSERT INTO public.cart_notifications (cart_id, user_id, notification_type, title, message, created_at, sent_at, status) VALUES
    (v_cart_id, v_user_id, 'reminder_1h', '¡Tu carrito te está esperando!', 'Tienes un producto guardado. ¿Necesitas ayuda para decidir?', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'sent'),
    (v_cart_id, v_user_id, 'reminder_24h', 'Todavía interesado en Flash SB-5000?', 'Tu carrito sigue disponible. Completa tu compra hoy.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'sent');
    
    RAISE NOTICE 'Cart created for andrescomastri@mac.com - ID: %', v_cart_id;
END $$;

-- SCENARIO 4: gabriel.taito@udenio.com
-- Cart created 7 days ago - Critical stage (about to expire)
-- Multiple items, high engagement potential

DO $$
DECLARE
    v_user_id UUID;
    v_cart_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'gabriel.taito@udenio.com' LIMIT 1;
    
    INSERT INTO public.shopping_carts (
        user_id,
        customer_email,
        created_at,
        updated_at,
        last_viewed_at,
        status,
        abandoned_at,
        notes
    ) VALUES (
        v_user_id,
        'gabriel.taito@udenio.com',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '6 days 12 hours',
        'abandoned',
        NOW() - INTERVAL '7 days',
        'Critical stage - 7 days old, ready for final push with discount'
    ) RETURNING id INTO v_cart_id;
    
    INSERT INTO public.cart_items (cart_id, product_id, product_name, product_image, product_category, quantity, unit_price, added_at) VALUES
    (v_cart_id, 'Z50II-KIT', 'Nikon Z50 II Kit 16-50mm', 'https://www.nikoncenter.cl/uploads/camaras/large/20241120-054614_1.png', 'Cámaras Mirrorless', 1, 1560700, NOW() - INTERVAL '7 days'),
    (v_cart_id, 'Z50-250', 'Nikkor Z DX 50-250mm f/4.5-6.3 VR', 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-035800_1.png', 'Lentes', 1, 499900, NOW() - INTERVAL '7 days'),
    (v_cart_id, 'MOCHILA-BP', 'Mochila Nikon Backpack', 'https://www.nikoncenter.cl/uploads/accesorios/large/accesorio.png', 'Accesorios', 1, 79900, NOW() - INTERVAL '6 days 18 hours');
    
    -- Full notification history
    INSERT INTO public.cart_notifications (cart_id, user_id, notification_type, title, message, created_at, sent_at, viewed_at, status) VALUES
    (v_cart_id, v_user_id, 'reminder_1h', '¡Tu carrito te está esperando!', 'Tienes 3 productos guardados. ¿Listo para completar tu compra?', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days 20 hours', 'viewed'),
    (v_cart_id, v_user_id, 'reminder_24h', 'Tu equipo Nikon te espera', 'Z50 II Kit + lente adicional. Tu setup perfecto está a un click.', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days 22 hours', 'viewed'),
    (v_cart_id, v_user_id, 'reminder_3d', '🎁 Último recordatorio + Regalo', 'Completa tu compra y lleva una SD Card de 64GB de regalo.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NULL, 'sent'),
    (v_cart_id, v_user_id, 'expiring_soon', '⚠️ Tu carrito expira en 24 horas', 'No pierdas tu selección. 5% de descuento si compras hoy.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL, 'sent');
    
    RAISE NOTICE 'Cart created for gabriel.taito@udenio.com - ID: %', v_cart_id;
END $$;

-- VERIFICATION QUERIES

SELECT
    sc.customer_email,
    sc.status,
    sc.items_count,
    TO_CHAR(sc.total_value, 'FM$999,999,999') as total_value,
    ROUND(EXTRACT(EPOCH FROM (NOW() - sc.updated_at))/3600, 1) || ' hours' AS abandoned_duration,
    (SELECT COUNT(*) FROM public.cart_notifications WHERE cart_id = sc.id) as notifications_sent,
    sc.notes
FROM public.shopping_carts sc
WHERE sc.customer_email IN (
    'apacheco@nikoncenter.cl',
    'eduardofuentesbaltrons@gmail.com',
    'andrescomastri@mac.com',
    'gabriel.taito@udenio.com'
)
ORDER BY sc.updated_at DESC;

-- View cart items detail
SELECT 
    sc.customer_email,
    ci.product_name,
    ci.quantity,
    TO_CHAR(ci.unit_price, 'FM$999,999,999') as unit_price,
    TO_CHAR(ci.subtotal, 'FM$999,999,999') as subtotal
FROM public.shopping_carts sc
JOIN public.cart_items ci ON ci.cart_id = sc.id
WHERE sc.customer_email IN (
    'apacheco@nikoncenter.cl',
    'eduardofuentesbaltrons@gmail.com',
    'andrescomastri@mac.com',
    'gabriel.taito@udenio.com'
)
ORDER BY sc.customer_email, ci.added_at;

-- View notification history
SELECT 
    sc.customer_email,
    cn.notification_type,
    cn.title,
    cn.status,
    ROUND(EXTRACT(EPOCH FROM (NOW() - cn.created_at))/3600, 1) || ' hours ago' AS sent_time
FROM public.cart_notifications cn
JOIN public.shopping_carts sc ON sc.id = cn.cart_id
WHERE sc.customer_email IN (
    'apacheco@nikoncenter.cl',
    'eduardofuentesbaltrons@gmail.com',
    'andrescomastri@mac.com',
    'gabriel.taito@udenio.com'
)
ORDER BY cn.created_at DESC;

-- Summary using the view
SELECT * FROM abandoned_carts_summary
WHERE customer_email IN (
    'apacheco@nikoncenter.cl',
    'eduardofuentesbaltrons@gmail.com',
    'andrescomastri@mac.com',
    'gabriel.taito@udenio.com'
);
