-- Enhanced Schema for Mi Nikon Experience

-- 1. Customers Table (Simulating Nikon Center DB)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    rut TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table (Catalog)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- SKU or ID from Merchant Center
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2),
    image_url TEXT,
    category TEXT,
    stock_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    order_number TEXT PRIMARY KEY,
    customer_email TEXT REFERENCES public.customers(email),
    order_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(12,2),
    status TEXT,
    items JSONB, -- Storing items as JSON for simplicity: [{product_id, name, quantity, price}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Registered Products (My Gear)
-- This links actual app users (auth.users) or customers to products
CREATE TABLE IF NOT EXISTS public.user_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- Nullable if we want to link to customers table instead, but ideally should comprise 'My Gear'
    customer_email TEXT, -- Backup link to legacy customer
    product_id TEXT REFERENCES public.products(id),
    serial_number TEXT,
    purchase_date DATE,
    warranty_status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

-- Policies
-- Products are viewable by everyone
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- Customers: Admins can view all, Users can view their own (by email matching auth email - tricky without custom claim, strictly speaking we might need a function or just allow basic read for now for demo)
-- For this demo, we'll allow authenticated users to read (in real app, strict filtering)
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);

-- User Products: Users can view/insert their own
CREATE POLICY "Users can view own gear" ON public.user_products FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add own gear" ON public.user_products FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Customers/Orders: For now, accessible to authenticated users (simulating Admin access or user's own data logic handling in specific functions)
CREATE POLICY "Enable read access for authenticated users" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated orders" ON public.orders FOR SELECT TO authenticated USING (true);
