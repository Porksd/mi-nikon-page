-- Seed data generated at 2026-01-18 23:20:29.777930
BEGIN;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.user_products CASCADE;

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000033046', 'Nikon Z5 Body con Adaptador FTZ II', 'Compacta pero potente.Simple pero sofisticada.', 209560000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-120434_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031162', 'Nikon Z50 II Kit Lente Nikkor Z 16-50mm + 50-250mm', 'Características Increíbles.Efectos creativos inspiradores', 156070000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241120-054614_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031147', 'Nikon Z9 Body', 'La Nikon más rápida y poderosa de la historia.', 659090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20211123-050426_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100175', 'MOCHILA NIKON CARION', 'Bolso para c&amp;aacute;maras Reflex.', 3990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20200605-094936_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100187', 'Paquete de batería Multi Power MB-N10', 'Paquete de batería Multi Power MB-N10', 32990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20191121-053408_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070923', 'Lente NIKKOR Z 40mm F 2.0', 'Lente NIKKOR Z 40mm F 2.0', 37990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-091735_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070926', 'Lente NIKKOR Z 28-75mm F 2.8', 'Lente NIKKOR Z 28-75mm F 2.8', 139090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-090127_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070930', 'Lente NIKKOR Z 100-400mm f/4.5-5.6 VR S', 'Lente NIKKOR Z 100-400mm f/4.5-5.6 VR S', 369090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-094347_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1010020205', 'Memoria Lexar CF Express 128GB', 'Memoria Lexar CF Express 128GB', 17990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20220908-063050_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1040000441', 'MOCHILA PIONEER 975 RT', 'El PIONEER 975RT es la herramienta para hacer cualquier cosa: ir a cualquier parte, a la mochila de caza. Mientras que la caza de acción intuitiva en el campo es esencial y el diseño de esta mochila asegura tal experiencia. Compacto pero lleno de detalles y características exclusivas, este bolso abordará cualquier eventualidad y respaldará sigilosamente todas sus aventuras, asegurándose de que nunca se pierda una oportunidad.', 6990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180711-081316.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070044', 'Lente AF-S DX NIKKOR 18-300mm F 3.5-6.3G ED VR', 'Lente AF-S DX NIKKOR 18-300mm F 3.5-6.3G ED VR', 92990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20150813-053038.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070931', 'Lente NIKKOR Z 800mm F 6.3 VR S', 'Lente NIKKOR Z 800mm F 6.3 VR S', 899090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-084021_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070914', 'Lente NIKKOR Z 24mm F 1.8 S', 'Lente NIKKOR Z 24mm F 1.8 S ', 134990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-083148_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070929', 'Lente NIKKOR Z 24-120mm F 4.0 S', 'Lente NIKKOR Z 24-120mm F 4.0 S', 159090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-030236_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031148', 'Nikon Z8 Body', 'La cámara híbrida definitiva', 539090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20230511-014029_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031138', 'Nikon Z5 Body', 'Compacta pero potente.Simple pero sofisticada.', 209560000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-120434_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031155', 'Nikon Zf Kit Lente 40mm SE', 'Rendimientos inspirados en el cuadro completo.', 329090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20230922-040634_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000033107', 'Nikon Z6 III Body con Adaptador FTZ II', 'Rendimiento increíble.Versatilidad increíble.', 349090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20240618-051740_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000080219', 'Prostaff P3 10x42', 'Prostaff P3 10x42', 23990000.0, 'https://www.nikoncenter.cl/uploads/sport_optics/large/20251029-024042_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070941', 'Lente NIKKOR Z 135mm F 1.8 S Plena', 'Lente NIKKOR Z 135mm F 1.8 S Plena ', 349090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-031657_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1040000440', 'MOCHILA PIONEER 2100 RT', 'El PIONEER 2100 es la mochila de caza de todo, ir a cualquier parte. Mientras se caza, la acción intuitiva en el campo es esencial y el diseño de esta mochila garantiza una experiencia similar. Grande, espaciosa y llena de características y detalles dedicados, esta mochila te mantendrá organizado y listo.', 12990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180711-081147.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070943', 'Lente NIKKOR Z 58mm f/0.95 S Noct', 'Lente NIKKOR Z 58mm f/0.95 S Noct', 1099090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-082315_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('5000010409a', 'Trípode Ulanzi TT51', '', 9990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20250626-033645_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100196', 'MB-N 14 P/Z-7 II - Z-6 III y Z-5 II', 'Además de la versatilidad se encuentran los controles verticales del paquete de baterías de alimentación MB-N14. El MB-N14 ofrece una serie de botones y controles que incluyen diales de comandos principales y secundarios, multiselector, botón Fn y botón AF-ON para tomas verticales. Gracias a su agarre de diseño ergonómico, ofrece una sensación bien equilibrada cuando se usan lentes telefoto largos. También ofrece un rendimiento de resistencia al polvo y al goteo equivalente', 49990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20250407-015831_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070954', 'Lente NIKKOR Z DX 16-50mm f/2.8 VR', 'Lente NIKKOR Z DX 16-50mm f/2.8 VR', 84990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20251103-040533_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070924', 'Lente NIKKOR Z 14-24mm F 2.8 S', 'Lente NIKKOR Z 14-24mm F 2.8 S', 329090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250506-015758_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070947', 'Lente NIKKOR Z 28-400mm f/4-8 VR', 'Lente NIKKOR Z 28-400mm f/4-8 VR', 189090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-041218_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070932', 'Lente NIKKOR Z 50mm F 1.2 S', 'Lente NIKKOR Z 50mm F 1.2 S', 289090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-094432_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070925', 'Lente NIKKOR Z DX 18-140mm F 3.5-6.3 VR', 'Lente NIKKOR Z DX 18-140mm F 3.5-6.3 VR', 87990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250506-024931_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031153', 'Nikon Z30 Kit Lente Z 16-50mm + Z 50-250mm', 'Lista para el creador.', 101080000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-105600_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070911', 'Lente NIKKOR Z 24-70mm F 2.8 S', 'Lente NIKKOR Z 24-70mm F 2.8 S', 329090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-020631_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000090229', 'Adaptador de Montura FTZ II', 'Adaptador de Montura FTZ II', 29990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20220114-054117_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100195', 'Batería recargable de ion de litio EN-EL25a', 'Batería recargable de ion de litio EN-EL25a', 9990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20241119-041709_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070937', 'Lente NIKKOR Z 180-600mm F 5.6-6.3 VR', 'Lente NIKKOR Z 180-600mm F 5.6-6.3 VR', 279090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-032013_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1010020202', 'Tarjeta Memoria Lexar SD 128GB', 'Tarjeta Memoria Lexar SD 128GB ', 4990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20220908-064406_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1040000438', 'MOCHILA PIONEER 1600 RT', 'El PIONEER 1600RT es la mochila de caza de todo, ir a cualquier parte. Mientras se caza, la acción intuitiva en el campo es esencial y el diseño de esta mochila garantiza una experiencia similar. Grande, espaciosa y llena de características y detalles dedicados, esta mochila te mantendrá organizado y listo.', 10990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180711-080912.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070934', 'Lente NIKKOR Z 17-28mm F 2.8', 'Lente NIKKOR Z 17-28mm F 2.8', 164990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-083041_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100185', 'Batería EN-EL15 C', 'Batería EN-EL15 C', 8990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20201218-052912_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100148', 'Cargador de batería MH-32', 'El MH-32 es un cargador de batería diseñado para cargar las baterías recargables de ion de litio EN-EL25 de Nikon.Compatible con Nikon Mirrorless Z30, Z50 y Zfc.', 6990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20250108-022251_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070922', 'Lente NIKKOR Z 24-50mm F 4-6.3', 'Lente NIKKOR Z 24-50mm F 4-6.3', 49990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-085124_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070945', 'Lente NIKKOR Z 600mm F 4.0 TC VR S', 'Lente NIKKOR Z 600mm F 4.0 TC VR S', 2199090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-042307_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031146', 'Nikon Zfc Kit Lente Nikkor Z 16-50mm f/3.5-6.3 VR', 'Diseño icónico.Rendimiento Z.', 149090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20210702-021013_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000080714', 'Sportstar Zoom 8-24x25', 'Sportstar Zoom 8-24x25', 23990000.0, 'https://www.nikoncenter.cl/uploads/sport_optics/large/20251029-014941_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070910', 'Lente NIKKOR Z 14-30mm F 4.0 S', 'Lente NIKKOR Z 14-30mm F 4.0 S', 189090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-090622_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070944', 'Lente NIKKOR Z 40mm F 2.0 (SE)', 'Lente NIKKOR Z 40mm F 2.0 (SE)', 45990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-032707_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100146', 'Batería Recargable EN-EL 20A', 'La EN-EL20a es una Bater&amp;iacute;a recargable de ion de litio de 1110 mAh que', 7990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20181109-072643_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031163', 'Nikon P1100', 'Nikon P1100', 149090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20250207-043424_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070917', 'Lente NIKKOR Z DX 50-250mm F 4.5-6.3 VR', 'Lente NIKKOR Z DX 50-250mm F  4.5-6.3 VR', 49990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-094640_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000090195', 'Control Remoto Bluetooth ML-L7', 'Control Remoto Bluetooth ML-L7', 6990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20191121-025532_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070928', 'Lente NIKKOR Z 28mm f/2.8', 'Lente NIKKOR Z 28mm f/2.8', 35990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-083919_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000050002', 'Sistema de Flash R1C1', 'Único sistema de Flash inalámbrico para controlar totalmente las exposiciones en fotografía de aproximación. Este Kit está compuesto de dos unidades remotas SB-R200 acopladas a las ópticas y a una unidad de control SU-800 para el sistema de medición i-TTL de las cámaras. Todas las exposiciones y comunicaciones provocadas se envian externamente utilizando una comunicación inalámbrica infraroja. El kit incluye adaptadores para la iluminación frontal, filtros y anillos adaptadores para las rosca de los filtros para las lentes Nikkor más utilizadas. Adicionalmente se pueden controlar a través del SU-800 unidades SB-R200 o SB-900 y SB-600 ofreciendo la flexibilidad del Sistema de Iluminación Creativa de Nikon, tanto en interiores como exteriores.', 94990000.0, 'https://www.nikoncenter.cl/uploads/flashes/large/r1c1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070908', 'Lente NIKKOR Z 35mm F 1.8 S', 'Lente NIKKOR Z 35mm F 1.8 S', 97990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-021507_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1010010146', 'Lente Z TELECONVERTER TC-1.4x', 'Lente Z TELECONVERTER TC-1.4x', 79990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-031819_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070951', 'Lente NIKKOR Z 50mm f/1.4', 'Lente NIKKOR Z 50mm f/1.4', 69990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-090314_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070935', 'Lente NIKKOR Z 12-28mm f/3.5-5.6 PZ VR DX', 'Lente NIKKOR Z  12-28mm f/3.5-5.6 PZ VR DX', 49990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-090037_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000050504', 'Flash SB-5000', ' Iluminación inalámbrica avanzada de control por radio que no necesita línea de visión para trabajar

 Sistema de enfriamiento en un flash de uso en la zapata de contactos logrando mas de 100 disparos consecutivos a máxima potencia.
 Acceso optimizado a sus funciones de uso frecuente como el Modo de Flash, la Posición del Zoom y el Valor de la Compensación del Flash
 Totalmente compatible con todos los flashes actuales de control óptico', 62990000.0, 'https://www.nikoncenter.cl/uploads/flashes/large/20180427-074252.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000080133', 'Aculon A211 16X50', 'ACULON A211 ofrece un rendimiento óptico impecable a un precio atractivo. Los objetivos con recubrimiento multicapa y los diversos diámetros de objetivo de gran tamaño permiten obtener imágenes enormemente nítidas y un campo de visión amplio. El uso de objetivos aesféricos del ocular potencia aún más la impresionante experiencia visual.', 21990000.0, 'https://www.nikoncenter.cl/uploads/sport_optics/large/20140718-085219.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('16317069829460185181', 'Nikon Monocular 13-30x50mm Straight', '', 69990000.0, 'https://www.nikoncenter.cl/uploads/sport_optics/medium/20181005-050000.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1040000468', 'MOCHILA ALTA SKY 66', 'La ALTA SKY 66 es una mochila ideal para transportar tu equipo y trabajar, especialmente diseñada para llevar super teleobjetivos de hasta 600mm (f/4.0) &amp; 800mm (f/5.6) con la Pro DSLR, protegido de la mayor manera posible y un fácil acceso. Además de un portátil o tablet de 9. Además, incluye varias opciones para llevar el trípode.', 19990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180712-034014.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1040000444', 'BOLSO VEO TRAVEL 41', 'La mochila compacta y elegante VEO TRAVEL 41 demostrará ser un compañero de confianza mientras viajas por la vida, día a día y cuando estás de vacaciones, siempre atento a la próxima toma memorable.', 6990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180711-081931.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100180', 'Cargador Rápido MH-25a', 'Cargador rapido MH-25 permite recargar la bateria EN-EL 15.&amp;nbsp; Funciona conectado a corriente 100/240V.', 7990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20110327-114649.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000033050', 'Nikon Z50 II Kit Lente Z 16-50mm con Bolso Nikon Carion y Tarjeta SD 128GB', 'Características Increíbles.Efectos creativos inspiradores', 156070000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241120-054614_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('9862993810998437045', 'Nikon NIKKOR Z 400mm F 2.8 TC VR S (Entrega 20 Dias)', '', 1789090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-032938_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1010020201', 'Tarjeta Memoria Lexar SD 64GB', 'Tarjeta Memoria Lexar SD 64GB ', 2990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20250626-011219_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070938', 'Lente NIKKOR Z 400mm f/4.5 VR S', 'Lente NIKKOR Z 400mm f/4.5 VR S', 429090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-085024_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('01325542', 'TEST (NO COMPRAR)', 'PRODUCTO DE TEST NO COMPRAR', 10000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20190804-110527_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031157', 'Nikon Z-6 III Body', 'Rendimiento increíble.Versatilidad increíble.', 349090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20240618-051740_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031160', 'Nikon Z50 II Body', 'Características Increíbles.Efectos creativos inspiradores', 128990000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241120-054614_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1040000469', 'MALETA ALTA FLY 48 T', 'La ALTA FLY 48T es un trolley profesional diseñado para transportar 1-2 DSLR profesionales, 5-7 objetivos (hasta 300 mm f / 4), un flash y accesorios, o un drone con sus complementos. Además de un ordenador portátil de 15 &quot;, una tableta y un trípode.', 18990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180712-034234.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1040000436', 'MOCHILA PIONEER 1000 RT', 'El PIONEER 1000 mejorará su práctica de caza con arco con su sistema de sujeción y posicionamiento de soporte de aljaba dedicado. Compacto y bien pensado, ofrece una acción intuitiva en el campo. Repleta de características y detalles dedicados a la caza del arco, este bolso abordará cualquier eventualidad y respaldará sigilosamente todas sus aventuras, asegurándose de que nunca se pierda una oportunidad.', 6990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180711-080635.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000033019', 'Nikon Z5 Kit Lente Z 24-50mm con Batería EN-El 15C, Bolso Nikon Rectangular y Tarjeta SD 256GB', 'Compacta pero potente.Simple pero sofisticada.', 209560000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-120434_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070913', 'Lente NIKKOR Z 85mm F 1.8 S', 'Lente NIKKOR Z 85mm F 1.8 S', 109090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-095429_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1010020203', 'Tarjeta Memoria Lexar SD 256GB', 'Tarjeta Memoria Lexar SD 256GB ', 7990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20220908-064706_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031139', 'Nikon Z5 Kit Lente Nikkor Z 24-50mm f/4-6.3', 'Compacta pero potente.Simple pero sofisticada.', 209560000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-120434_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000080660', 'Trailblazer 10x25 ATB', 'Visualización versátil con un aumento de 10x y Eco-Glass   un cuerpo elegante y ligero lo hace una opción excelente para actividades al aire libre.
', 14990000.0, 'https://www.nikoncenter.cl/uploads/sport_optics/large/20120308-124318.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070921', 'Lente NIKKOR Z MC 105 mm F 2.8 VR S MACRO', 'Lente NIKKOR Z MC 105 mm F 2.8 VR S MACRO', 149090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-030750_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070909', 'Lente NIKKOR Z 50mm F 1.8 S', 'Lente NIKKOR Z 50mm F 1.8 S', 94990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-032318_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000033009', 'Lente NIKKOR Z 24-70mm f/4 S (Sin Caja)', 'Lente NIKKOR Z 24-70mm f/4 S (Sin Caja)', 119090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-022328_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000080718', 'Monocular 13-30x50mm Straight', '13-30x Zoom Eyepiece
Waterproof &amp; Fogproof
ED Glass', 69990000.0, 'https://www.nikoncenter.cl/uploads/sport_optics/large/20181005-050000.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070948', 'Lente NIKKOR Z 35mm f/1.4', 'Lente NIKKOR Z 35mm f/1.4', 84990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-041040_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000090062', 'TAPA FRONTAL 62mm', 'TAPA FRONTAL 62mm', 1490000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180718-052022.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031161', 'Nikon Z50 II Kit Lente Z 16-50mm', 'Características Increíbles.Efectos creativos inspiradores', 128990000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241120-054614_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031145', 'Nikon Zfc Kit Lente Nikkor Z 28mm f/2.8', 'Diseño icónico.Rendimiento Z.', 149090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20210702-021013_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070927', 'Lente NIKKOR Z DX 16-50mm F 3.5-6.3 VR', 'Lente NIKKOR Z DX 16-50mm F 3.5-6.3 VR', 36990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-042157_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100191', 'Mochila Nikon Note 1802B', 'Mochila Nikon Note 1802B', 5990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20231107-033539_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000033016', 'Nikon Z30 Kit Lente Z 16-50mm con Bolso Nikon Carion', 'Lista para el creador.', 101080000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-105600_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100188', 'Paquete de baterías de alimentación MB-N11', 'Paquete de baterías de alimentación MB-N11', 39990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20201218-052535_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031152', 'Nikon Z30 Kit Lente Z 16-50mm F 3.5-6.3 VR', 'Lista para el creador.', 87990000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-105600_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070918', 'Lente NIKKOR Z 20mm f/1.8 S', 'Lente NIKKOR Z 20mm f/1.8 S', 149090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-091453_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070916', 'Lente NIKKOR Z 24-200mm F 4-6.3 VR', 'Lente NIKKOR Z 24-200mm F 4-6.3 VR', 124990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-041747_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000080218', 'Prostaff P7 10x30', 'Prostaff P7 10x30', 28990000.0, 'https://www.nikoncenter.cl/uploads/sport_optics/large/20251029-023413_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031164', 'Nikon Z5 II Body', 'Expande tu expresión creativa.', 229090000.0, 'https://www.nikoncenter.cl/', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000033017', 'Nikon ZR Body con Tarjeta Micro SD 256GB', 'Calidad cinematográfica al alcance de la mano.', 309980000.0, 'https://www.nikoncenter.cl/', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1010010145', 'Lente Z TELECONVERTER TC-2.0x', 'Lente  Z TELECONVERTER TC-2.0x', 84990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-090202_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000080214', 'Prostaff P7 8x42', 'Prostaff P7 8x42', 28990000.0, 'https://www.nikoncenter.cl/uploads/sport_optics/large/20251029-022824_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031142', 'Nikon Z-7 II Body', 'Detalles intensos.Resultados extraordinarios.', 349090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-014708_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070950', 'Lente NIKKOR Z 28-135mm f/4 PZ', 'Lente NIKKOR Z 28-135mm f/4 PZ', 319090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-094554_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031165', 'Nikon Z5 II Kit Lente Nikkor Z 24-70mm f4 S', 'Expande tu expresión creativa.', 309090000.0, 'https://www.nikoncenter.cl/', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070953', 'Lente NIKKOR Z DX MC 35mm F 1.7', 'Lente NIKKOR Z DX MC 35mm F 1.7', 54990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20251103-040118_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070933', 'Lente NIKKOR Z 28mm F 2.8 (SE)', 'Lente NIKKOR Z 28mm F 2.8 (SE)', 40990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-015745_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1040000439', 'MOCHILA PIONEER 1600', 'El PIONEER 1600 es la mochila de caza de todo, ir a cualquier parte. Mientras se caza, la acci&amp;oacute;n intuitiva en el campo es esencial y el dise&amp;ntilde;o de esta mochila garantiza una experiencia similar. Grande, espaciosa y llena de caracter&amp;iacute;sticas y detalles dedicados, esta mochila te mantendr&amp;aacute; organizado y listo.', 12990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180711-081030.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070940', 'Lente NIKKOR Z 85mm F 1.2 S (Entrega 15 Dias)', 'Lente NIKKOR Z 85mm F 1.2 S (Entrega 15 Dias)', 359090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-084932_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070942', 'Lente NIKKOR Z DX 24mm F 1.7', 'Lente NIKKOR Z DX 24mm F 1.7', 37990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-094510_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000050700', 'FLASH SB-700', 'Flash versátil y fácil de usar, compatible con las cámaras SRL de formato FX y DX de Nikon, y el Sistema de Iluminación Creativa de Nikon. De uso increíblemente intuitivo, cuenta con una gama de funciones avanzadas que simplifican la gestión de la calidad y la dirección de la luz. Tres patrones de iluminación ofrecen un control total sobre la cobertura del flash y el modo A:B de fácil acceso permite un control inalámbrico de varios flash. Con un cuerpo compacto, es el equipamiento ideal para tener a mano cuando desee hacer fotos creativas o conseguir imágenes más equilibradas en condiciones de iluminación complicadas. Flash versátil i-TTL (TTL inteligente) compatible con las cámaras SLR de formato FX y DX, y el Sistema de Iluminación Creativa de Nikon. Zoom motorizado de varios pasos: cubre un amplio ángulo de visión de entre 24 y 120 mm. Número de guía: 25(uniforme)/28(estándar)/30 (central ponderado) (formato FX, ISO 100, m, en 35 mm). Número de guía máximo: 38 (Estándar, formato FX, ISO 100, m, a 120 mm). Los patrones de iluminación central ponderado, uniforme y estándar pueden seleccionarse para que coincidan con la situación de disparo disponible. Modo A:B para un control inalámbrico rápido: permite controlar las relaciones de luz de los flash de grupo A y B. El firmware se puede actualizar mediante el soporte de almacenamiento de la cámara conectada. Sistema automático de protección térmica: advierte si hay un calentamiento excesivo en momentos intensos de fotografías y atrasa el tiempo de recarga en caso necesario. Detección automática de filtro: El flash ajusta automáticamente los valores de temperatura del color de la cámara conectada según el color del filtro que se utiliza. Luz de ayuda de AF: cubre una distancia focal de 24 a 135 mm*. Compatible con los sensores AF Multi-CAM3500.', 42990000.0, 'https://www.nikoncenter.cl/uploads/flashes/large/20250722-035955_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070919', 'Lente NIKKOR Z 70-200mm F 2.8 VR S', 'Lente NIKKOR Z 70-200mm F 2.8 VR S ', 369090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-094724_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070920', 'Lente NIKKOR Z MC 50mm F 2.8 S MACRO', 'Lente NIKKOR Z MC 50mm F 2.8 S MACRO ', 109090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-083834_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031085', 'Nikon D7500 Kit Lente 18-140mm AF-S VR G DX', 'Formato DX - 20.9 Megapxeles - SnapBridge - Video Ultra HD 4k - ISO 100-51,200 - Bluetooth - 8 Disparos Contnuos', 164990000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20170412-105824_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031166', 'Nikon Z R Cuerpo', 'Calidad cinematográfica al alcance de la mano.', 299090000.0, 'https://www.nikoncenter.cl/', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000031154', 'Nikon Zf Body', 'Rendimientos inspirados en el cuadro completo.', 329090000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20230922-040634_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100192', 'Bolso Rectangular Nikon 1802A', 'Bolso Rectangular Nikon 1802A', 3490000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20231107-034015_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000100174', 'BOLSO NIKON CARION', 'BOLSO NIKON CARION', 1990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20200605-095019_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070949', 'Lente NIKKOR Z 35mm f/1.2 S', 'Lente NIKKOR Z 35mm f/1.2 S', 399090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-090408_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070952', 'Lente NIKKOR Z 24-70mm f/2.8 S II', 'Lente NIKKOR Z 24-70mm f/2.8 S II ', 379090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250825-021440_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1040000467', 'MOCHILA ALTA SKY 53', 'Mochila ideal para transportar tu equipo y trabajar. Interior totalmente personalizable, con una capacidad máxima en la que pueden caber 1-2 Pro DSLR con objetivos (hasta 300mm f/2.8), 6-8 objetivos, 2 flashes y accesorios, o un dron con sus respectivos accesorios + 1 Pro DSLR con objetivos. Además de un portátil o tablet de 17. Además, incluye varias opciones para llevar el trípode.', 19990000.0, 'https://www.nikoncenter.cl/uploads/accesorios/large/20180712-033741.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070936', 'Lente NIKKOR Z 70-180mm F 2.8', 'Lente NIKKOR Z 70-180mm F 2.8', 179090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-021918_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070939', 'Lente NIKKOR Z 26mm F 2.8', 'Lente NIKKOR Z 26mm F 2.8', 69990000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250507-030521_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000033115', 'Nikon Z30 Kit Lente Z 16-50mm + Lente Z 50-250mm con Mochila Nikon Carion', 'Lista para el creador.', 101080000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241121-105600_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000070946', 'Lente NIKKOR Z 600mm f/6.3 VR S', 'Lente NIKKOR Z 600mm f/6.3 VR S', 699090000.0, 'https://www.nikoncenter.cl/uploads/objetivos/large/20250508-083251_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ('1000033074', 'Nikon Z50 II Kit Lente Z 16-50mm + Lente Z 50-250mm con Mochila Manfrotto Gear y Tarjeta SD 128GB', 'Características Increíbles.Efectos creativos inspiradores', 128990000.0, 'https://www.nikoncenter.cl/uploads/camaras/large/20241120-054614_1.png', 'General', 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('cb8f6c58-f92e-419f-9cee-d8ce1de8f33a', 'andrescotal@gmail.com', 'Andres', NULL, '151719767', '932316830', 'Viana 157', 'Viña Del Mar', 'V Región de Valparaíso', '1983-05-20')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('15067924-381f-40c5-beed-393514cb160d', 'axel.garrido.a@gmail.com', 'Axel', NULL, '165732421', '995749625', 'Laderas 2668', 'Viña Del Mar', 'V Región de Valparaíso', '1986-04-20')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('8447a679-7c8b-442f-9c76-053e76eae4bf', 'consuelo.cortez.s@gmail.com', 'Consuelo', NULL, '17018239-1', '989619561', 'Calle Balada 2813', 'La Serena', 'IV Región de Coquimbo', '1988-09-19')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('e515e89e-ee23-4740-a5e7-fb16a27e5f07', 'contacto@eybcomercial.com', 'Carolina', NULL, '15229898-6', '964207917', 'Claro Solar 2165', 'Temuco', 'IX Región de La Araucanía', '1993-08-10')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('377642f3-0e60-4092-bd5a-73911642f2c5', 'contacto@todotablet.cl', 'Comercializadora', NULL, '76292976-7', '939227458', 'Carlos Valdovinos 597', 'Santiago', 'XIII Región Metropolitana', '1988-07-19')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('56ad4044-dbfc-4f1d-8810-c892d15ca100', 'diego.esmir.gonzalez.morales@gmail.com', 'Diego', NULL, '24209610k', '969059174', 'Av. Cornisa 608', 'Concón', 'V Región de Valparaíso', '1985-09-05')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('2c129b9f-a73f-445e-a579-c7afcb620362', 'jgabrielperez72@gmail.com', 'Juan Gabriel', NULL, '7748409-', '966442111', 'Antilhue 6584', 'Santiago', 'XIII Región Metropolitana', NULL)
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('7bf0fe08-ccb8-432f-8523-31289e67fd6a', 'jmonsalvereyes@gmail.com', 'Jonathan', NULL, '173039875', '56977427757', 'Avenida Cerro Paranal 515', 'Antofagasta', 'II Región de Antofagasta', '1989-07-30')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('b58c92f6-472d-42aa-a60a-51dfb0032825', 'kate.gonzreyes@gmail.com', 'Katerin', NULL, '16670569-K', '965142534', 'Las Guías 5487 Brillo Del Sol Pc 42 Lote11 5487', 'Santiago', 'XIII Región Metropolitana', '1988-03-18')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('af845101-1e5d-4e8d-88ba-27cccbcac391', 'loreto.calderonv@icloud.com', 'Loreto', NULL, '20643777-4', '56986258857', 'Calle Arrieta 111', 'Villa Alemana', 'V Región de Valparaíso', '2000-12-15')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('11b86887-21c4-4a89-9b71-5561630944be', 'mauroherc@gmail.com', 'Mauricio', NULL, '10180142-K', '940219443', 'Calle Del Sol 85 Ed. Nuevo Horizonte T1', 'Con Con', 'V Región de Valparaíso', '1967-05-06')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('48e163c5-7ea0-4ac8-b4dd-f302f9234f76', 'mauvilla@gmail.com', 'Mauricio', NULL, '13531751-9', '979863745', 'El Alerce 995', 'Machalí', 'VI Región del Libertador General Bernardo Ohiggins', '1979-03-16')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('560a8446-f46b-48f0-9c47-f9dfd4cb14cf', 'mgatica1191@gmail.com', 'Matias', NULL, '18018598-4', '963178233', 'Arquitecto Enrique Aguirre Herrera 1605', 'Santiago', 'XIII Región Metropolitana', '1991-10-17')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('28a110c9-de52-40a9-8b5c-94c0cc7adb2d', 'natalialandaez@hotmail.com', 'Natalia', NULL, '27057756-3', '954783400', 'Av. Macul 6305', 'Macul', 'XIII Región Metropolitana', '1988-07-12')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('17464d56-c6fa-40aa-a6ea-33422311f435', 'octaviomartinez@hotmail.cl', 'Octavio', NULL, '17760838-6', '989113894', 'Pedro Montt, Chincolco 340', 'Petorca', 'V Región de Valparaíso', '1990-11-10')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('1168c320-0342-407d-b88d-1c408d08a786', 'osvaldomoralesgalindo@gmail.com', 'Osvaldo', NULL, '168300727', '987960131', 'Arquimedes 1836', 'Temuco', 'IX Región de La Araucanía', '1989-03-31')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('62d56c15-84ca-42da-835a-1abd9b1cdd27', 'publicidad.agenciaten@gmail.com', 'Jorge', NULL, '12937219-2', '966685811', 'Calle Valparaiso 181', 'Punta Arenas', 'XII Región de Magallanes y la Antártica Chilena', '1975-09-26')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('ce676c47-a4f9-408b-90f6-6167955dc697', 'ricabrera@ing.ucsc.cl', 'Roberto', NULL, '18067998-7', '942050954', 'Don Bosco 62', 'Natales', 'XII Región de Magallanes y la Antártica Chilena', '1992-04-06')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('1219d4af-df96-4207-ac40-0ded16185552', 'rojashopkins@yahoo.com', 'Christine', NULL, '13335111-6', '940254875', 'Salvador Sanfuente 125', 'Viña Del Mar', 'V Región de Valparaíso', '1977-05-31')
    ON CONFLICT (email) DO NOTHING;
    

    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('883b19a9-bab3-4dc3-9b85-2d636b5bf916', 'sebastianmuriyo@gmail.com', 'SebastiÃ¡n', NULL, '16.885.697-0', '56989996076', 'Avenida Blanca Estela 2239', 'ConcÃ³n', 'V RegiÃ³n de Valparaiso', '1987-12-29')
    ON CONFLICT (email) DO NOTHING;
    

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('mgatica1191@gmail.com', '1000090062', 'N975286', '2026-01-11', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58151', 'mgatica1191@gmail.com', '2026-01-11', 20900, 'Enviado', '[{"product_id": "1000090062", "name": "TAPA FRONTAL 62mm", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58133', 'mauvilla@gmail.com', '2025-12-29', 859900, 'Enviado', '[{"product_id": "1000033044", "name": "Mirrorless Z30 Kit Lente Z 16-50mm con Bolso Nikon Carion y Tarjeta SD 64GB Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('axel.garrido.a@gmail.com', '1000031157', 'N487212', '2026-01-02', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58138', 'axel.garrido.a@gmail.com', '2026-01-02', 2700900, 'Enviado', '[{"product_id": "1000031157", "name": "Mirrorless Z-6 III Body Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('jgabrielperez72@gmail.com', '1000080218', 'N853812', '2026-01-02', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58139', 'jgabrielperez72@gmail.com', '2026-01-02', 295900, 'Enviado', '[{"product_id": "1000080218", "name": "Prostaff P7 10x30", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('consuelo.cortez.s@gmail.com', '1000100185', 'N179222', '2026-01-09', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58148', 'consuelo.cortez.s@gmail.com', '2026-01-09', 99900, 'Enviado', '[{"product_id": "1000100185", "name": "Bater\u00eda EN-EL15 C", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('mauroherc@gmail.com', '1000070914', 'N126871', '2025-12-09', 'Active');
                 

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('mauroherc@gmail.com', '1000100185', 'N861920', '2025-12-09', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58050', 'mauroherc@gmail.com', '2025-12-09', 999800, 'Enviado', '[{"product_id": "1000070914", "name": "Objetivo NIKKOR Z 24mm F 1.8 S", "quantity": "1"}, {"product_id": "1000100185", "name": "Bater\u00eda EN-EL15 C", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('mauroherc@gmail.com', '1000033107', 'N824488', '2025-01-10', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57168', 'mauroherc@gmail.com', '2025-01-10', 3049900, 'Enviado', '[{"product_id": "1000033107", "name": "Mirrorless Z6 III Body con Adaptador FTZ II Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58135', 'octaviomartinez@hotmail.cl', '2025-12-31', 1559900, 'Enviado', '[{"product_id": "1000033005", "name": "Mirrorless Z50 II Kit Lente Z 16-50mm + Lente Z 50-250mm con Mochila Nikon Carion y Tarjeta SD 64GB Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('publicidad.agenciaten@gmail.com', '1000070908', 'N530976', '2025-12-21', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58107', 'publicidad.agenciaten@gmail.com', '2025-12-21', 1000900, 'Enviado', '[{"product_id": "1000070908", "name": "Objetivo NIKKOR Z 35mm F 1.8 S", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('loreto.calderonv@icloud.com', '1000070044', 'N112104', '2025-12-17', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58098', 'loreto.calderonv@icloud.com', '2025-12-17', 809900, 'Enviado', '[{"product_id": "1000070044", "name": "Objetivo AF-S DX NIKKOR 18-300mm F 3.5-6.3G ED VR", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('sebastianmuriyo@gmail.com', '1000100195', 'N467188', '2025-12-10', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58066', 'sebastianmuriyo@gmail.com', '2025-12-10', 109900, 'Enviado', '[{"product_id": "1000100195", "name": "Bater\u00eda recargable de ion de litio EN-EL25a", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('sebastianmuriyo@gmail.com', '1000070914', 'N282639', '2025-12-09', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58058', 'sebastianmuriyo@gmail.com', '2025-12-09', 909900, 'Enviado', '[{"product_id": "1000070914", "name": "Objetivo NIKKOR Z 24mm F 1.8 S", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('kate.gonzreyes@gmail.com', '1000033019', 'N339241', '2025-12-31', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58136', 'kate.gonzreyes@gmail.com', '2025-12-31', 1696900, 'Enviado', '[{"product_id": "1000033019", "name": "Mirrorless Z5 Kit Lente Z 24-50mm con Mochila Nikon Carion y Tarjeta SD 128GB Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('contacto@todotablet.cl', '1000033009', 'N943864', '2025-12-22', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58119', 'contacto@todotablet.cl', '2025-12-22', 955900, 'Enviado', '[{"product_id": "1000033009", "name": "Objetivo NIKKOR Z 24-70mm f/4 S (Sin Caja)", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('andrescotal@gmail.com', '1000031157', 'N271042', '2025-11-29', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58009', 'andrescotal@gmail.com', '2025-11-29', 2700900, 'Enviado', '[{"product_id": "1000031157", "name": "Mirrorless Z-6 III Body Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('andrescotal@gmail.com', '1000100185', 'N921226', '2025-07-15', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57677', 'andrescotal@gmail.com', '2025-07-15', 89900, 'Enviado', '[{"product_id": "1000100185", "name": "Bater\u00eda Recargable de Ion de Litio EN-EL15c", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('andrescotal@gmail.com', '1000070951', 'N196335', '2025-07-15', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57676', 'andrescotal@gmail.com', '2025-07-15', 649900, 'Enviado', '[{"product_id": "1000070951", "name": "Objetivo NIKKOR Z 50mm f/1.4", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('jmonsalvereyes@gmail.com', '1000090195', 'N950174', '2026-01-13', 'Active');
                 

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('jmonsalvereyes@gmail.com', '1000100187', 'N209715', '2026-01-13', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58153', 'jmonsalvereyes@gmail.com', '2026-01-13', 409800, 'Enviado', '[{"product_id": "1000090195", "name": "Control Remoto Bluetooth ML-L7", "quantity": "1"}, {"product_id": "1000100187", "name": "Paquete de bater\u00eda Multi Power MB-N10", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('jmonsalvereyes@gmail.com', '1000100185', 'N806225', '2025-03-03', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57300', 'jmonsalvereyes@gmail.com', '2025-03-03', 89900, 'Enviado', '[{"product_id": "1000100185", "name": "Bater\u00eda Recargable de Ion de Litio EN-EL15c", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58140', 'ricabrera@ing.ucsc.cl', '2026-01-02', 1489900, 'Enviado', '[{"product_id": "1000033104", "name": "Coolpix Coolpix P1100 con Mochila Nikon, Tr\u00edpode Ulanzi Traveler y Tarjeta SD 64GB Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('rojashopkins@yahoo.com', '1000070929', 'N198468', '2025-10-31', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57956', 'rojashopkins@yahoo.com', '2025-10-31', 1359900, 'Enviado', '[{"product_id": "1000070929", "name": "Objetivo NIKKOR Z 24-120mm F 4.0 S", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57904', 'rojashopkins@yahoo.com', '2025-10-06', 1009900, 'Enviado', '[{"product_id": "1000033080", "name": "Coolpix Coolpix P950 con Bolso Nikon Rectangular Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('rojashopkins@yahoo.com', '1000100185', 'N125078', '2025-06-28', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57644', 'rojashopkins@yahoo.com', '2025-06-28', 179800, 'Enviado', '[{"product_id": "1000100185", "name": "Bater\u00eda Recargable de Ion de Litio EN-EL15c", "quantity": "2"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('rojashopkins@yahoo.com', '1000090229', 'N631771', '2025-06-15', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57621', 'rojashopkins@yahoo.com', '2025-06-15', 307900, 'Enviado', '[{"product_id": "1000090229", "name": "Adaptador de Montura FTZ II", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('rojashopkins@yahoo.com', '1000031157', 'N246007', '2025-06-14', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57620', 'rojashopkins@yahoo.com', '2025-06-14', 2798900, 'Enviado', '[{"product_id": "1000031157", "name": "Mirrorless Z-6 III Body Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('osvaldomoralesgalindo@gmail.com', '1000070929', 'N469306', '2025-10-01', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57882', 'osvaldomoralesgalindo@gmail.com', '2025-10-01', 1600900, 'Enviado', '[{"product_id": "1000070929", "name": "Objetivo NIKKOR Z 24-120mm F 4.0 S", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('osvaldomoralesgalindo@gmail.com', '1000100180', 'N180333', '2025-07-08', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57661', 'osvaldomoralesgalindo@gmail.com', '2025-07-08', 87900, 'Enviado', '[{"product_id": "1000100180", "name": "Cargador R\u00e1pido MH-25a", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#57651', 'osvaldomoralesgalindo@gmail.com', '2025-07-02', 2498800, 'Enviado', '[{"product_id": "1000033072", "name": "Mirrorless Z5 II Body con Adaptador FTZ II Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('contacto@eybcomercial.com', '1000070917', 'N216556', '2025-12-16', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58092', 'contacto@eybcomercial.com', '2025-12-16', 509900, 'Enviado', '[{"product_id": "1000070917", "name": "Objetivo NIKKOR Z DX 50-250mm F 4.5-6.3 VR", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('diego.esmir.gonzalez.morales@gmail.com', '1000100185', 'N193892', '2026-01-06', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58147', 'diego.esmir.gonzalez.morales@gmail.com', '2026-01-06', 99900, 'Enviado', '[{"product_id": "1000100185", "name": "Bater\u00eda EN-EL15 C", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        

                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ('natalialandaez@hotmail.com', '1000033074', 'N660648', '2026-01-13', 'Active');
                 

        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ('#58155', 'natalialandaez@hotmail.com', '2026-01-13', 1635900, 'Facturado', '[{"product_id": "1000033074", "name": "Mirrorless Z50 II Kit Lente Z 16-50mm + Lente Z 50-250mm con Mochila Manfrotto Gear y Tarjeta SD 128GB Negro", "quantity": "1"}]')
        ON CONFLICT (order_number) DO NOTHING;
        
COMMIT;-- Seed data from Clientes Ordenes Test.xlsx
BEGIN;

-- Users & Profiles

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', 'andrescomastri@mac.com', '$2a$12$ynP6Tkxuyb.uU0j7jc373uH2LzWGbvmaktBNR4xAE3jsx40BV1HQ2', NOW(), '{"first_name": "Andrés", "last_name": "Comastri"}')
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.profiles (id, first_name, last_name)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', 'Andrés', 'Comastri')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;


INSERT INTO public.customers (id, email, first_name, last_name, city, region)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', 'andrescomastri@mac.com', 'Andrés', 'Comastri', 'Cerro Navia', 'XIII Región Metropolitana')
ON CONFLICT (email) DO NOTHING;



INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', 'eduardofuentesbaltrons@gmail.com', '$2a$12$ynP6Tkxuyb.uU0j7jc373uH2LzWGbvmaktBNR4xAE3jsx40BV1HQ2', NOW(), '{"first_name": "Eduardo", "last_name": "Fuentes Baltrons"}')
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.profiles (id, first_name, last_name)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', 'Eduardo', 'Fuentes Baltrons')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;


INSERT INTO public.customers (id, email, first_name, last_name, city, region)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', 'eduardofuentesbaltrons@gmail.com', 'Eduardo', 'Fuentes Baltrons', 'Cerro Navia', 'XIII Región Metropolitana')
ON CONFLICT (email) DO NOTHING;



-- Clean up existing user if present to avoid ID conflict
DO $$
BEGIN
    DELETE FROM public.profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'apacheco@nikoncenter.cl');
    DELETE FROM auth.users WHERE email = 'apacheco@nikoncenter.cl';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', 'apacheco@nikoncenter.cl', '$2a$12$ynP6Tkxuyb.uU0j7jc373uH2LzWGbvmaktBNR4xAE3jsx40BV1HQ2', NOW(), '{"first_name": "Alan", "last_name": "Pacheco"}')
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.profiles (id, first_name, last_name)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', 'Alan', 'Pacheco')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;


INSERT INTO public.customers (id, email, first_name, last_name, city, region)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', 'apacheco@nikoncenter.cl', 'Alan', 'Pacheco', 'Maipú', 'XIII Región Metropolitana')
ON CONFLICT (email) DO NOTHING;



-- Products

INSERT INTO public.products (id, name, category, price)
VALUES ('1000031145', 'Mirrorless Z FC con Nikkor Z 28mm f/2.8 Black', 'mirrorless', 1249900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000033017', 'Mirrorless Z50 Kit Lente 18-55mm AF-P con Adaptador FTZ Negro', 'mirrorless', 899900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price, image_url)
VALUES ('1231254', 'Reflex D3500 Kit 18-55mm AF-P VR + Lente 70-300mm AF-P + Filtro Marumi 58mm + Pendrive 8GB + Garantía Extendida 1 Año Black', 'reflex', 409900, 'https://www.udeniosite.com/cl/uploads/camaras/medium/20180830-095233_1.png')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url;


INSERT INTO public.products (id, name, category, price)
VALUES ('10101', 'Coolpix B500 B500 Black + Bolso Nikon Carion + Memoria SD 16GB + Power Bank + Trípode Vivitar Black', 'coolpix', 179900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000031076', 'Coolpix W300 W300 Orange', 'coolpix', 399900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000100159', 'Batería Recargable EN-EL14 A', 'accesorios', 49900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price, image_url)
VALUES ('1000031110', 'Réflex D5600 C/ Nikkor AF-P 18-55mm DX VR + Nikkor AF-P 70-300mm Black', 'reflex', 749900, 'https://www.udeniosite.com/cl/uploads/camaras/medium/20170322-020923_1.png')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000030371', 'Coolpix S2700 Deco Purple', 'coolpix', 39900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price, image_url)
VALUES ('1000031077', 'Reflex D5600 Kit 18-55mm AF-P VR Black', 'reflex', 399900, 'https://www.udeniosite.com/cl/uploads/camaras/medium/20170322-020923_1.png')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url;


INSERT INTO public.products (id, name, category, price, image_url)
VALUES ('1000070706', 'AF-P DX NIKKOR 70-300mm f/4.5-6.3G ED', 'objetivos', 129900, 'https://www.udeniosite.com/cl/uploads/objetivos/medium/20170529-125005.png')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url;


INSERT INTO public.products (id, name, category, price, image_url)
VALUES ('1000032001', 'Reflex D7200 Kit Lente 18-140mm AF-S VR G DX Black', 'reflex', 1290000, 'https://www.udeniosite.com/cl/uploads/camaras/medium/20150413-060440_1.png')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url;


-- Orders

INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('231109150431-009524', 'andrescomastri@mac.com', '2025-01-01', 1249900.0, '[{"product_id": "1000031145", "name": "Mirrorless Z FC con Nikkor Z 28mm f/2.8 Black", "quantity": 1, "price": 1249900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('211226215027-009524', 'andrescomastri@mac.com', '2025-01-01', 899900.0, '[{"product_id": "1000033017", "name": "Mirrorless Z50 Kit Lente 18-55mm AF-P con Adaptador FTZ Negro", "quantity": 1, "price": 899900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('190307200658-009524', 'andrescomastri@mac.com', '2025-01-01', 409900.0, '[{"product_id": "1231254", "name": "Reflex D3500 Kit 18-55mm AF-P VR + Lente 70-300mm AF-P + Filtro Marumi 58mm + Pendrive 8GB + Garant\u00eda Extendida 1 A\u00f1o Black", "quantity": 1, "price": 409900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('181210000952-009524', 'andrescomastri@mac.com', '2025-01-01', 179900.0, '[{"product_id": "10101", "name": "Coolpix B500 B500 Black + Bolso Nikon Carion + Memoria SD 16GB + Power Bank + Tr\u00edpode Vivitar Black", "quantity": 1, "price": 179900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('181210000708-009524', 'andrescomastri@mac.com', '2025-01-01', 399900.0, '[{"product_id": "1000031076", "name": "Coolpix W300 W300 Orange", "quantity": 1, "price": 399900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('20170315144534', 'andrescomastri@mac.com', '2025-01-01', 49900.0, '[{"product_id": "1000100159", "name": "Bater\u00eda Recargable EN-EL14 A", "quantity": 1, "price": 49900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('210623171838-009524', 'eduardofuentesbaltrons@gmail.com', '2025-01-01', 749900.0, '[{"product_id": "1000031110", "name": "R\u00e9flex D5600 C/ Nikkor AF-P 18-55mm DX VR + Nikkor AF-P 70-300mm Black", "quantity": 1, "price": 749900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('20140603093846', 'eduardofuentesbaltrons@gmail.com', '2025-01-01', 39900.0, '[{"product_id": "1000030371", "name": "Coolpix S2700 Deco Purple", "quantity": 1, "price": 39900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('191118023534-000003', 'apacheco@nikoncenter.cl', '2025-01-01', 399900.0, '[{"product_id": "1000031077", "name": "Reflex D5600 Kit 18-55mm AF-P VR Black", "quantity": 1, "price": 399900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('190821164346-000003', 'apacheco@nikoncenter.cl', '2025-01-01', 129900.0, '[{"product_id": "1000070706", "name": "AF-P DX NIKKOR 70-300mm f/4.5-6.3G ED", "quantity": 1, "price": 129900.0}]')
ON CONFLICT (order_number) DO NOTHING;


INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, items)
VALUES ('20150804111025', 'apacheco@nikoncenter.cl', '2025-01-01', 1290000.0, '[{"product_id": "1000032001", "name": "Reflex D7200 Kit Lente 18-140mm AF-S VR G DX Black", "quantity": 1, "price": 1290000.0}]')
ON CONFLICT (order_number) DO NOTHING;


-- User Products

INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1000031145', 'SN-012088', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1000033017', 'SN-617987', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1231254', 'SN-251017', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '10101', 'SN-093264', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1000031076', 'SN-300375', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1000100159', 'SN-094919', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', '1000031110', 'SN-347180', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', '1000030371', 'SN-748091', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', '1000031077', 'SN-797919', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', '1000070706', 'SN-626861', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', '1000032001', 'SN-961785', '2025-01-01')
ON CONFLICT DO NOTHING;

COMMIT;
