-- Add new columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'En Venta';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS publish INTEGER DEFAULT 1;

COMMENT ON COLUMN public.products.publish IS '1: publicado, 2: despublicado';

-- 1. Standardize Categories
-- Map existing categories to: Cámaras, Lentes, Flash, Accesorios
UPDATE public.products SET category = 'Cámaras' WHERE category ILIKE '%camera%' OR category ILIKE '%cámara%' OR category ILIKE '%dslr%' OR category ILIKE '%mirrorless%';
UPDATE public.products SET category = 'Lentes' WHERE category ILIKE '%lens%' OR category ILIKE '%lente%' OR category ILIKE '%objetivo%';

-- Force Lenses based on Name prefixes (Lentes, Nikkor, AF-P, AF-S)
-- User specified: "Lentes, Nikkor, AF-P, AF-S" at the beginning of name
UPDATE public.products 
SET category = 'Lentes' 
WHERE name ILIKE 'Lente%' 
   OR name ILIKE 'Lentes%' 
   OR name ILIKE 'Nikkor%' 
   OR name ILIKE 'AF-P%' 
   OR name ILIKE 'AF-S%';

UPDATE public.products SET category = 'Flash' WHERE category ILIKE '%flash%' OR category ILIKE '%speedlight%';
UPDATE public.products SET category = 'Accesorios' WHERE category NOT IN ('Cámaras', 'Lentes', 'Flash');

-- 2. Initialize Subcategories and Status
UPDATE public.products SET subcategory = 'General', status = 'En Venta';

-- 3. Classify Subcategories

-- Coolpix
UPDATE public.products SET subcategory = 'Coolpix', category = 'Cámaras' WHERE name ILIKE '%coolpix%';

-- Z Series Cameras -> Set Category to Cámaras explicitly (Fixes issue where unwanted defaults were applied)
UPDATE public.products 
SET subcategory = 'ZSeries', category = 'Cámaras' 
WHERE name ~* '\y(Z\s?30|Z\s?50(\s?II)?|Z\s?f|Z\s?fc|Z\s?5(\s?II)?|Z\s?6(\s?III|\s?II)?|Z\s?7(\s?II)?|Z\s?R|Z\s?8|Z\s?9)\y';

-- Z Series Lenses (Contains Z: "Lente Z", "Nikkor Z", "XXX Z XXX")
-- Also ensures category is 'Lentes' just in case
UPDATE public.products 
SET subcategory = 'ZSeries', category = 'Lentes'
WHERE (category = 'Lentes' OR name ILIKE 'Lente%' OR name ILIKE 'Lentes%' OR name ILIKE 'Nikkor%' OR name ILIKE 'AF-P%' OR name ILIKE 'AF-S%')
  AND (name ILIKE '%Nikkor Z%' OR name ILIKE '%Lente Z%' OR name ILIKE '% Z %' OR name LIKE '% Z');

-- Reflex Cameras -> Set Category to Cámaras explicitly
UPDATE public.products 
SET subcategory = 'Réflex', category = 'Cámaras' 
WHERE name ~* '\y(D300s?|D3[0-5]00|D5[0-6]00|D4s?|D5|D6|D500|D600|D610|D700|D7000|D7100|D7200|D7500|D750|D780|D800|D810A?|D850|Df)\y';

-- Reflex Lenses (Remaining lenses that are not ZSeries)
-- Force category Lentes effectively
UPDATE public.products 
SET subcategory = 'Réflex', category = 'Lentes' 
WHERE (category = 'Lentes' OR name ILIKE 'Lente%' OR name ILIKE 'Lentes%' OR name ILIKE 'Nikkor%' OR name ILIKE 'AF-P%' OR name ILIKE 'AF-S%')
  AND (subcategory IS NULL OR subcategory != 'ZSeries');

-- 4. Set Publish Status
-- Reset all to Unpublished (2) first to be safe
UPDATE public.products SET publish = 2;

-- Publish (1) all Lenses
UPDATE public.products SET publish = 1 WHERE category = 'Lentes';

-- Publish (1) Cameras with price 0 (assuming these are the legacy/selectable models without inventory)
-- AND restrict to the allowed models list if that's still the requirement, or just all price 0 cameras?
-- User said: "todas las cámaras con precio 0.0 ... queden publicados"
UPDATE public.products 
SET publish = 1 
WHERE category = 'Cámaras' AND price = 0;

-- Ensure the specific list of allowed models is published regardless of price (or maybe purely based on price 0 now?)
-- The user said: "todas las cámaras con precio 0.0... queden publicados". 
-- Previously, we only wanted specific models. If the specific models I inserted have price 0, they will be covered.
-- Let's stick strictly to the user's new request: 
-- "todas las cámaras con precio 0.0 y todos los lentes queden publicados y todo el resto en estado despublicado"

-- So:
-- 1. Everything -> 2
-- 2. Lenses -> 1
-- 3. Cameras with price 0 -> 1

-- If I need to ensure the specific models are the ones with price 0, I should probably update them to price 0 if they aren't, 
-- but I'll assume the inserted ones are price 0 (my insert script set them to 0).

-- Let's Make sure the allowed models (from my previous insert) are definitely published. 
-- My insert script set price to 0. So they should be covered by "price = 0".

-- Clarification: "todo el resto en estado despublicado".
-- This implies Accessories, Flash, etc. might be unpublished if they are not Lenses or Cameras with price 0.
-- Wait, did the user mean "all OTHER cameras" or "everything else in the database"?
-- "todo el resto en estado despublicado" usually means everything else.
-- So Accessories and Flash will be hidden unless I explicitly publish them?
-- Looking at context, this seems to be about "Mi Equipo" selector.
-- If I hide accessories, they won't show up in the selector.
-- Creating a cleaner list.
-- The user previously said: "El listado se cargó, pero en el lanzamiento de la beta, hablandod de cámaras, sólo quiero que aparezcan los modelos que te pasé."
-- Now: "todas las cámaras con precio 0.0 y todos los lentes queden publicados"
-- The models I inserted have price 0.
-- So this seems consistent.
-- What about Accessories? 
-- "todo el resto en estado despublicado". I will follow this literally. 
-- Accessories/Flash will handle `publish = 2`.

-- Final logic to write:
UPDATE public.products SET publish = 2; -- Default everything to hidden
UPDATE public.products SET publish = 1 WHERE category = 'Lentes';
UPDATE public.products SET publish = 1 WHERE category = 'Cámaras' AND price = 0;
