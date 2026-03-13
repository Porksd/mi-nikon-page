-- Safe migration script: Checks if tables exist before creating
-- Part 1: Banners
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  tagline text,
  link text,
  image_url text not null,
  mobile_image_url text,
  button_text text default 'VER MÁS',
  sort_order int default 0,
  is_active boolean default true
);

-- Enable RLS for banners (safe to run multiple times)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Banners are viewable by everyone'
    ) THEN
        CREATE POLICY "Banners are viewable by everyone" ON public.banners FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Only admins can insert banners'
    ) THEN
        CREATE POLICY "Only admins can insert banners" ON public.banners FOR INSERT WITH CHECK (
            auth.uid() IN (SELECT id FROM public.profiles)
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Admins can update banners'
    ) THEN
        CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE USING (
             auth.uid() IN (SELECT id FROM public.profiles)
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND policyname = 'Admins can delete banners'
    ) THEN
        CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE USING (
             auth.uid() IN (SELECT id FROM public.profiles)
        );
    END IF;
END
$$;

-- Part 2: User Feedback
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    message text not null,
    rating int,
    category text
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_feedback' AND policyname = 'Users can insert their own feedback'
    ) THEN
        CREATE POLICY "Users can insert their own feedback" ON public.user_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_feedback' AND policyname = 'Admins can view all feedback'
    ) THEN
        CREATE POLICY "Admins can view all feedback" ON public.user_feedback FOR SELECT USING (
            auth.uid() IN (SELECT id FROM public.profiles)
        );
    END IF;
END
$$;

-- Part 3: User Equipment
CREATE TABLE IF NOT EXISTS public.user_equipment (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    product_name text not null,
    product_type text not null,
    is_interested boolean default false
);

ALTER TABLE public.user_equipment ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_equipment' AND policyname = 'Users can manage their own equipment'
    ) THEN
        CREATE POLICY "Users can manage their own equipment" ON public.user_equipment FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Part 4: Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('workshop-images', 'workshop-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true) ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    -- Workshop Images Policies
    IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Workshop images are publicly accessible' ) THEN
        CREATE POLICY "Workshop images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'workshop-images' );
    END IF;
    IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can upload workshop images' ) THEN
        CREATE POLICY "Anyone can upload workshop images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'workshop-images' );
    END IF;

    -- Banner Images Policies
    IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Banner images are publicly accessible' ) THEN
        CREATE POLICY "Banner images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'banner-images' );
    END IF;
    IF NOT EXISTS ( SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can upload banner images' ) THEN
        CREATE POLICY "Anyone can upload banner images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'banner-images' );
    END IF;
END
$$;

-- Part 5: Initialize Banners with Provided HTML Content
-- We check if table is empty to avoid duplicates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.banners) THEN
        INSERT INTO public.banners (title, tagline, link, image_url, button_text, sort_order) VALUES
        ('Nuevo Firmware 2.0', 'Rendimiento impresionante, Ahora mejorado.', 'https://downloadcenter.nikonimglib.com/es/download/fw/571.html', 'https://www.nikoncenter.cl/uploads/shortcuts/pub_20250829-013533.jpg', 'DESCARGAR', 1),
        ('DX 16-50mm f/2.8 VR', 'Rendimiento de zoom rápido y versátil para fotos y vídeos.', 'https://www.nikoncenter.cl/lentes/mirrorless/nikkor-z-dx-16-50mm-f28-vr', 'https://www.nikoncenter.cl/uploads/shortcuts/pub_20260112-094159.jpg', 'VER MÁS', 2),
        ('Nuevo Firmware 5.0', 'Nuevas y poderosas ventajas y mejoras', 'https://downloadcenter.nikonimglib.com/es/products/589/Z_9.html', 'https://www.nikoncenter.cl/uploads/shortcuts/pub_20240328-112737.jpg', 'DESCARGAR', 3),
        ('DX MC 35mm f/1.7', 'Ligero, brillante y hermoso.', 'https://www.nikoncenter.cl/lentes/mirrorless/nikkor-z-dx-mc-35mm-f-17', 'https://www.nikoncenter.cl/uploads/shortcuts/pub_20260112-094427.jpg', 'VER MÁS', 4);
    END IF;
END
$$;
