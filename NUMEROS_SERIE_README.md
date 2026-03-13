# Sistema de Números de Serie - Guía de Implementación

## 📋 Resumen
Sistema para validar y registrar productos Nikon usando números de serie únicos. Permite a los usuarios registrar sus equipos y desbloquear funcionalidades adicionales (manuales, firmware).

## 🚀 Pasos de Implementación

### 1. Ejecutar Migración en Supabase

**Archivo:** `supabase/migration_serial_numbers.sql`

1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega el contenido completo de `migration_serial_numbers.sql`
3. Click en **Run**
4. Verifica que se crearon:
   - Tabla `serial_numbers`
   - Funciones `register_serial_number()` y `check_serial_number()`
   - Vista `serial_numbers_stats`
   - Políticas RLS

### 2. Generar SQL de Carga desde Archivos TXT

**Herramienta:** `scripts/generate_serial_inserts.py`

**Uso:**
```powershell
cd j:\Empres\Nikon\IA
python scripts/generate_serial_inserts.py "Productos/Números de Serie/PO-25073.txt" Z6III "Nikon Z6 III"
```

**Parámetros:**
- `archivo_txt`: Ruta al archivo con números de serie (uno por línea)
- `product_id` (opcional): ID del producto (ej: Z6III, Z85F18)
- `product_name` (opcional): Nombre del producto (ej: "Nikon Z6 III")

**Salida:**
Genera archivo `*_load.sql` con INSERT statements listos para ejecutar.

### 3. Cargar Números de Serie en Supabase

1. Abre el archivo `*_load.sql` generado
2. Copia el contenido
3. Pega en Supabase SQL Editor
4. Click en **Run**
5. Verifica la carga con el query de verificación al final del archivo

**Ejemplo de archivo generado:**
```sql
-- Carga de números de serie desde: PO-25073.txt
-- Total de números: 219
-- Producto: Nikon Z6 III (Z6III)

INSERT INTO public.serial_numbers (serial_number, product_id, product_name, status) VALUES
('3800360', 'Z6III', 'Nikon Z6 III', 'available'),
('3800363', 'Z6III', 'Nikon Z6 III', 'available'),
...
ON CONFLICT (serial_number) DO NOTHING;
```

### 4. Verificar Carga

```sql
-- Ver estadísticas
SELECT * FROM serial_numbers_stats;

-- Ver números disponibles
SELECT COUNT(*) FROM public.serial_numbers WHERE status = 'available';

-- Ver últimos registrados
SELECT serial_number, product_name, status, registered_at 
FROM public.serial_numbers 
WHERE status = 'registered' 
ORDER BY registered_at DESC 
LIMIT 10;
```

## 📦 Estructura de Archivos

```
Productos/
  └── Números de Serie/
      ├── PO-25073.txt          # Archivo original con números
      └── PO-25073_load.sql     # Generado por script Python

supabase/
  ├── migration_serial_numbers.sql      # Migración principal
  └── seed_serial_numbers_example.sql   # Ejemplo de carga manual

scripts/
  └── generate_serial_inserts.py        # Generador de SQL

utils/
  └── serialService.ts                  # Servicio TypeScript
```

## 🔄 Flujo de Registro

1. **Usuario ingresa número de serie** en modal de registro
2. **Sistema valida** con `check_serial_number()`:
   - ✅ Existe y disponible → continúa
   - ❌ No existe → mensaje error
   - ❌ Ya registrado → mensaje error
3. **Sistema registra** con `register_serial_number()`:
   - Asocia número a user_id
   - Marca status = 'registered'
   - Guarda timestamp de registro
4. **Producto aparece como registrado** en Mi Equipo

## 🎯 Productos Registrables

Solo estos tipos pueden registrarse con número de serie:
- **Cámaras Reflex** (D series)
- **Cámaras Mirrorless** (Z series)
- **Lentes** (Nikkor)
- **Flashes** (Speedlight)

**NO registrables:** Accesorios, cámaras compactas (Coolpix), Sport Optics

## 📊 Monitoreo Admin

```sql
-- Dashboard de administrador
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'available' THEN 1 END) as disponibles,
    COUNT(CASE WHEN status = 'registered' THEN 1 END) as registrados,
    COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as usuarios_unicos
FROM public.serial_numbers;

-- Productos más registrados
SELECT 
    product_name,
    COUNT(*) as registros
FROM public.serial_numbers
WHERE status = 'registered'
GROUP BY product_name
ORDER BY registros DESC;
```

## 🔒 Seguridad

- **RLS activo:** Usuarios solo ven sus propios números registrados
- **Validación server-side:** Funciones PostgreSQL con `SECURITY DEFINER`
- **Números únicos:** Constraint UNIQUE previene duplicados
- **Auditoría:** Timestamp de registro y user_id

## 🐛 Troubleshooting

**Error: "Número de serie no encontrado"**
- Verifica que el número esté cargado en la base de datos
- Confirma formato correcto (sin espacios, mayúsculas)

**Error: "Ya registrado"**
- El número ya fue usado por otro usuario
- Contactar soporte si es error

**Script Python no funciona**
- Verifica que Python 3.x esté instalado
- Archivo txt debe estar en formato UTF-8
- Un número por línea, sin caracteres especiales

## 📝 Próximos Pasos

1. ✅ Ejecutar migración
2. ✅ Cargar números de serie reales
3. 🔄 Actualizar componente Gear.tsx con modal de registro
4. 🔄 Agregar botones Manual/Firmware para productos registrados
5. 🔄 Integrar en flujo de onboarding
