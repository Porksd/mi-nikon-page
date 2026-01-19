import csv
import json
import random
import uuid
import os
from datetime import datetime

# Paths
base_path = "j:/Empres/Nikon/IA"
clientes_path = os.path.join(base_path, "Clientes/Clientes_Nikon_Cleaned.csv")
ordenes_path = os.path.join(base_path, "Órdenes de Compra/ordenes_compra_clean.csv")
productos_path = os.path.join(base_path, "Merchant Center/Productos Merchant Center.csv")
output_path = os.path.join(base_path, "Proyectos/Mi Nikon/mi-nikon-experience/supabase/seed.sql")

def escape_sql(val):
    if val is None:
        return 'NULL'
    # Escape single quotes by doubling them
    return "'" + str(val).replace("'", "''") + "'"

def parse_date(date_str):
    # Formats seen: 14-01-2026
    try:
        if not date_str: return None
        return datetime.strptime(date_str, "%d-%m-%Y").strftime("%Y-%m-%d")
    except:
        return None

def classify_purchase(product_name):
    name_lower = product_name.lower()
    if any(x in name_lower for x in ['z9', 'z8', 'z6', 'z5', 'z50', 'z30', 'z 9', 'z 8', 'z 6', 'z 5', 'z f', 'camera', 'cámara', 'reflex', 'mirrorless', 'body', 'kit', 'd850', 'd7500', 'd780', 'coolpix']):
        return 'Camera'
    if any(x in name_lower for x in ['lente', 'nikkor', 'objetivo', 'mm f/', 'mm 1:', 'z 24-', 'z 70-', 'z 14-']):
        return 'Lens'
    return 'Other'

# 1. Load Products
products = {}
print("Loading Products...")
try:
    with open(productos_path, 'r', encoding='latin-1', errors='replace') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            clean_row = {k.strip(): v for k, v in row.items() if k}
            
            pid = clean_row.get('id')
            title = clean_row.get('ttulo') or clean_row.get('título') or list(clean_row.values())[0] # Fallback
            price_str = clean_row.get('precio', '0').replace(' CLP', '').replace('.', '') 
            try:
                price = float(price_str.split()[0])
            except:
                price = 0
                
            image = clean_row.get('enlace imagen')
            desc = clean_row.get('descripcin') or clean_row.get('descripción') or ''
            cat = clean_row.get('categora en google product') or 'General'
            
            if pid:
                products[pid] = {
                    'id': pid,
                    'name': title,
                    'description': desc,
                    'price': price,
                    'image_url': image,
                    'category': cat,
                    'stock_status': 'In Stock'
                }
except Exception as e:
    print(f"Error reading products: {e}")

# 2. Analyze Orders to Select Best Users
all_orders_by_email = {}
print("Loading Orders...")
try:
    # Use utf-8-sig to handle BOM if present
    with open(ordenes_path, 'r', encoding='utf-8-sig', errors='replace') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            clean_row = {k.strip().strip('"'): v.strip('"') for k, v in row.items() if k}
            
            email = clean_row.get('Email Cliente')
            status = clean_row.get('Estado Orden', '')
            
            # We want all history, but only valid orders
            if email and status in ['Enviado', 'Facturado']:
                date_str = clean_row.get('Fecha Orden', '')
                clean_row['parsed_date'] = parse_date(date_str)
                
                # Ensure Order Number
                order_num = clean_row.get('Num. Orden')
                if not order_num:
                     for k in clean_row.keys():
                         if 'Num. Orden' in k:
                             order_num = clean_row[k]
                             clean_row['Num. Orden'] = order_num
                             break
                
                if order_num:
                    if email not in all_orders_by_email:
                        all_orders_by_email[email] = []
                    all_orders_by_email[email].append(clean_row)

except Exception as e:
    print(f"Error reading orders: {e}")

# Selection Strategy
selected_emails = set()
users_summary = []

for email, user_orders in all_orders_by_email.items():
    has_2026 = any('2026' in o.get('Fecha Orden', '') for o in user_orders)
    
    # Analyze purchases
    bought_camera = False
    bought_lens = False
    
    for o in user_orders:
        item_names = o.get('Productos', '').split(' -|- ')
        for name in item_names:
            cat = classify_purchase(name)
            if cat == 'Camera': bought_camera = True
            if cat == 'Lens': bought_lens = True
    
    users_summary.append({
        'email': email,
        'has_2026': has_2026,
        'bought_camera': bought_camera,
        'bought_lens': bought_lens,
        'order_count': len(user_orders)
    })

# Priority 1: 2026 Users
users_2026 = [u for u in users_summary if u['has_2026']]
for u in users_2026:
    selected_emails.add(u['email'])

print(f"Initial 2026 users: {len(selected_emails)}")

# Check counts
def check_counts(emails):
    c_count = 0
    l_count = 0
    for e in emails:
        stats = next((u for u in users_summary if u['email'] == e), None)
        if stats:
             if stats['bought_camera']: c_count += 1
             if stats['bought_lens']: l_count += 1
    return c_count, l_count

c_curr, l_curr = check_counts(selected_emails)

# Fill Cameras (Need 6)
if c_curr < 6:
    needed = 6 - c_curr
    candidates = [u for u in users_summary if u['email'] not in selected_emails and u['bought_camera']]
    for u in candidates[:needed]:
        selected_emails.add(u['email'])

# Fill Lenses (Need 6)
c_curr, l_curr = check_counts(selected_emails)
if l_curr < 6:
    needed = 6 - l_curr
    candidates = [u for u in users_summary if u['email'] not in selected_emails and u['bought_lens']]
    for u in candidates[:needed]:
        selected_emails.add(u['email'])

# Fill remaining to 20
current_count = len(selected_emails)
target = 20
if current_count < target:
    needed = target - current_count
    candidates = [u for u in users_summary if u['email'] not in selected_emails]
    # Prefer users with more history
    candidates.sort(key=lambda x: x['order_count'], reverse=True)
    for u in candidates[:needed]:
        selected_emails.add(u['email'])

selected_emails_list = list(selected_emails)
print(f"Selected {len(selected_emails_list)} customers taking full history.")
c_final, l_final = check_counts(selected_emails)
print(f"Final Stats - Camera Buyers: {c_final}, Lens Buyers: {l_final}")

# 3. Load Customers
customers = []
print("Loading Customers...")
try:
    with open(clientes_path, 'r', encoding='latin-1', errors='replace') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
             email = row.get('Email')
             if email in selected_emails:
                 # Apellido;Nombre;Email;Tipo Doc.;Nrodoc;Fecha Nac.;Celular;Calle;Numero;Piso Depto;Comuna;Ciudad;Region
                 customers.append({
                     'email': email,
                     'first_name': row.get('Nombre'),
                     'last_name': row.get('Apellido'),
                     'rut': row.get('Nrodoc'),
                     'phone': row.get('Celular') or row.get('Telefono'),
                     'address': f"{row.get('Calle', '')} {row.get('Numero', '')}",
                     'city': row.get('Ciudad') or row.get('Comuna'),
                     'region': row.get('Region'),
                     'birth_date': parse_date(row.get('Fecha Nac.')),
                     'id': str(uuid.uuid4())
                 })
except Exception as e:
    print(f"Error reading customers: {e}")

# 4. Generate SQL
sql_lines = []

sql_lines.append(f"-- Seed data generated at {datetime.now()}")
sql_lines.append("BEGIN;")

# Clear existing transactional data
sql_lines.append("TRUNCATE TABLE public.orders CASCADE;")
sql_lines.append("TRUNCATE TABLE public.user_products CASCADE;")

# Products
for p in products.values():
    sql_lines.append(f"""
    INSERT INTO public.products (id, name, description, price, image_url, category, stock_status)
    VALUES ({escape_sql(p['id'])}, {escape_sql(p['name'])}, {escape_sql(p['description'])}, {p['price']}, {escape_sql(p['image_url'])}, {escape_sql(p['category'])}, 'In Stock')
    ON CONFLICT (id) DO NOTHING;
    """)

# Customers
customer_map = {} # email -> uuid
for c in customers:
    customer_map[c['email']] = c['id']
    sql_lines.append(f"""
    INSERT INTO public.customers (id, email, first_name, last_name, rut, phone, address, city, region, birth_date)
    VALUES ('{c['id']}', {escape_sql(c['email'])}, {escape_sql(c['first_name'])}, {escape_sql(c['last_name'])}, {escape_sql(c['rut'])}, {escape_sql(c['phone'])}, {escape_sql(c['address'])}, {escape_sql(c['city'])}, {escape_sql(c['region'])}, {escape_sql(c['birth_date'])})
    ON CONFLICT (email) DO NOTHING;
    """)

# Orders & User Products
seen_order_nums = set()

# Process ALL orders for selected students
for email in selected_emails:
    user_orders = all_orders_by_email.get(email, [])
    
    for o in user_orders:
        order_num = o.get('Num. Orden')
        
        if order_num in seen_order_nums:
            continue
        seen_order_nums.add(order_num)
        
        # Items
        item_ids = o.get('Codigos Prods.', '').split(' -|- ')
        item_names = o.get('Productos', '').split(' -|- ')
        item_qtys = o.get('Cantidades', '').split(' -|- ')
        
        items_json = []
        
        for i, pid in enumerate(item_ids):
            pid = pid.strip()
            name = item_names[i].strip() if i < len(item_names) else 'Unknown'
            qty = item_qtys[i].strip() if i < len(item_qtys) else '1'
            
            items_json.append({
                'product_id': pid,
                'name': name,
                'quantity': qty
            })
            
            # Register in User Products if Product exists in Catalog
            cid = customer_map.get(email)
            if cid and pid in products:
                 serial = f"N{random.randint(100000, 999999)}"
                 sql_lines.append(f"""
                 INSERT INTO public.user_products (customer_email, product_id, serial_number, purchase_date, warranty_status)
                 VALUES ({escape_sql(email)}, {escape_sql(pid)}, '{serial}', {escape_sql(o.get('parsed_date'))}, 'Active');
                 """)
        
        items_json_str = json.dumps(items_json).replace("'", "''")
        
        total = o.get('Importe IVA Inc.', '0').replace(',', '.')
        status = o.get('Estado Orden')

        sql_lines.append(f"""
        INSERT INTO public.orders (order_number, customer_email, order_date, total_amount, status, items)
        VALUES ({escape_sql(order_num)}, {escape_sql(email)}, {escape_sql(o.get('parsed_date'))}, {total}, {escape_sql(status)}, '{items_json_str}')
        ON CONFLICT (order_number) DO NOTHING;
        """)

sql_lines.append("COMMIT;")

with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"Seed file generated to {output_path}")
