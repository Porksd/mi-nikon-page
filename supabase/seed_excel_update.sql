-- Seed data from Clientes Ordenes Test.xlsx
BEGIN;

-- Users & Profiles

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', 'andrescomastri@mac.com', '$2a$10$wKkwNq/6j.6u6i.6u6i.6u6i.6u6i.6u6i.6u6i.6u6i.6u6i.6', NOW(), '{"first_name": "Andrés", "last_name": "Comastri"}')
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.profiles (id, first_name, last_name)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', 'Andrés', 'Comastri')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;


INSERT INTO public.customers (id, email, first_name, last_name, city, region)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', 'andrescomastri@mac.com', 'Andrés', 'Comastri', 'Cerro Navia', 'XIII Región Metropolitana')
ON CONFLICT (email) DO NOTHING;


INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', 'eduardofuentesbaltrons@gmail.com', '$2a$10$wKkwNq/6j.6u6i.6u6i.6u6i.6u6i.6u6i.6u6i.6u6i.6u6i.6', NOW(), '{"first_name": "Eduardo", "last_name": "Fuentes Baltrons"}')
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.profiles (id, first_name, last_name)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', 'Eduardo', 'Fuentes Baltrons')
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name;


INSERT INTO public.customers (id, email, first_name, last_name, city, region)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', 'eduardofuentesbaltrons@gmail.com', 'Eduardo', 'Fuentes Baltrons', 'Cerro Navia', 'XIII Región Metropolitana')
ON CONFLICT (email) DO NOTHING;


INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', 'apacheco@nikoncenter.cl', '$2a$10$wKkwNq/6j.6u6i.6u6i.6u6i.6u6i.6u6i.6u6i.6u6i.6u6i.6', NOW(), '{"first_name": "Alan", "last_name": "Pacheco"}')
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


INSERT INTO public.products (id, name, category, price)
VALUES ('1231254', 'Reflex D3500 Kit 18-55mm AF-P VR + Lente 70-300mm AF-P + Filtro Marumi 58mm + Pendrive 8GB + Garantía Extendida 1 Año Black', 'reflex', 409900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('10101', 'Coolpix B500 B500 Black + Bolso Nikon Carion + Memoria SD 16GB + Power Bank + Trípode Vivitar Black', 'coolpix', 179900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000031076', 'Coolpix W300 W300 Orange', 'coolpix', 399900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000100159', 'Batería Recargable EN-EL14 A', 'accesorios', 49900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000031110', 'Réflex D5600 C/ Nikkor AF-P 18-55mm DX VR + Nikkor AF-P 70-300mm Black', 'reflex', 749900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000030371', 'Coolpix S2700 Deco Purple', 'coolpix', 39900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000031077', 'Reflex D5600 Kit 18-55mm AF-P VR Black', 'reflex', 399900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000070706', 'AF-P DX NIKKOR 70-300mm f/4.5-6.3G ED', 'objetivos', 129900)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


INSERT INTO public.products (id, name, category, price)
VALUES ('1000032001', 'Reflex D7200 Kit Lente 18-140mm AF-S VR G DX Black', 'reflex', 1290000)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;


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
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1000031145', 'SN-014544', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1000033017', 'SN-422383', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1231254', 'SN-340766', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '10101', 'SN-892317', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1000031076', 'SN-121364', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('1a26fee9-14a0-5acf-986f-7296ef4bc9f6', '1000100159', 'SN-175878', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', '1000031110', 'SN-249628', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('6e12a569-42ab-532c-b6e4-ee03211249b3', '1000030371', 'SN-685607', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', '1000031077', 'SN-886660', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', '1000070706', 'SN-831301', '2025-01-01')
ON CONFLICT DO NOTHING;


INSERT INTO public.user_products (user_id, product_id, serial_number, purchase_date)
VALUES ('69c35f2f-d86d-5cb1-acac-7d930c9cecd0', '1000032001', 'SN-094761', '2025-01-01')
ON CONFLICT DO NOTHING;

COMMIT;