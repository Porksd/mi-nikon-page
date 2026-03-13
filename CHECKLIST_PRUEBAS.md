# ✅ Checklist de Verificación Pre-Prueba

## 📋 Antes de Iniciar el Servidor

### 1. Archivos Base de Datos
- [ ] `supabase/migration_shopping_cart.sql` existe
- [ ] `supabase/seed_shopping_cart_test.sql` existe

### 2. Componentes React
- [ ] `components/ShoppingCart.tsx` existe
- [ ] `components/AddToCartButton.tsx` existe
- [ ] `components/Home.tsx` actualizado (con banner)
- [ ] `components/MyAccount.tsx` actualizado (categoría carrito)
- [ ] `components/AdminDashboard.tsx` actualizado (pestaña carritos)
- [ ] `components/Recommendations.tsx` actualizado (botones agregar)

### 3. Utilidades y Tipos
- [ ] `utils/cartService.ts` existe
- [ ] `types.ts` actualizado (interfaces de carrito)
- [ ] `index.css` actualizado (animación fadeIn)

### 4. Configuración de Rutas
- [ ] `App.tsx` tiene ruta `/cart`
- [ ] `Layout.tsx` tiene ícono de carrito en navbar
- [ ] `Layout.tsx` tiene contador de items

### 5. Dependencias
- [ ] `node_modules/` instalado
- [ ] `@supabase/supabase-js` instalado
- [ ] `lucide-react` instalado
- [ ] `react-router-dom` instalado

---

## 🗄️ Configuración de Supabase

### En Supabase Dashboard:

1. **SQL Editor**
   - [ ] Ejecutado `migration_shopping_cart.sql` ✓
   - [ ] Sin errores en la consola
   - [ ] Tablas creadas:
     - [ ] `shopping_carts`
     - [ ] `cart_items`
     - [ ] `cart_notifications`
   - [ ] Vista creada: `abandoned_carts_summary`

2. **SQL Editor (Seed Data)**
   - [ ] Ejecutado `seed_shopping_cart_test.sql` ✓
   - [ ] 4 carritos de prueba creados
   - [ ] Items agregados a los carritos
   - [ ] Notificaciones de prueba creadas

3. **Verificación de Datos**
   ```sql
   -- Ejecuta esto para verificar:
   SELECT COUNT(*) FROM shopping_carts;
   -- Debe retornar: 4
   
   SELECT COUNT(*) FROM cart_items;
   -- Debe retornar: 9-10 items
   
   SELECT * FROM abandoned_carts_summary;
   -- Debe mostrar los 4 carritos con estadísticas
   ```

4. **Table Editor (Verificación Visual)**
   - [ ] Tabla `shopping_carts` tiene 4 filas
   - [ ] Cada carrito tiene `items_count > 0`
   - [ ] Los valores de `total_value` son correctos

---

## 🚀 Inicio del Servidor

### Terminal PowerShell:
```powershell
cd "j:\Empres\Nikon\IA\Proyectos\Mi Nikon\mi-nikon-experience"

# Opción 1: Script automatizado
.\test-carrito.ps1

# Opción 2: Manual
npm run dev
```

### Verificaciones Post-Inicio:
- [ ] Servidor corriendo en `http://localhost:3000`
- [ ] Sin errores en la terminal
- [ ] Sin errores en consola del navegador (F12)

---

## 🧪 Tests Funcionales

### Test 1: Autenticación y Banner
1. [ ] Abrir `http://localhost:3000`
2. [ ] Click en "Iniciar Sesión"
3. [ ] Email: `apacheco@nikoncenter.cl` / Pass: `123456`
4. [ ] ✅ **Debería ver:** Banner amarillo con mensaje de carrito
5. [ ] Banner muestra "2 productos" y precio total
6. [ ] Click en "Ver mi carrito" → redirige a `/cart`

### Test 2: Página de Carrito
1. [ ] En `/cart` ver 2 productos (Z6 III + Lente)
2. [ ] Click en botón "+" → cantidad aumenta
3. [ ] Click en botón "-" → cantidad disminuye
4. [ ] Total se actualiza automáticamente
5. [ ] Alerta de "Tu carrito está esperando" (2 horas)
6. [ ] Click en "Continuar Compra" → muestra mensaje de redirección
7. [ ] Click en ícono de basura → confirmar → producto eliminado

### Test 3: Contador en Navbar
1. [ ] En navbar, ícono de carrito muestra badge con número
2. [ ] Número coincide con items en el carrito
3. [ ] Click en ícono → redirige a `/cart`
4. [ ] Cambiar cantidad en carrito → refrescar página → contador actualizado

### Test 4: Agregar Producto desde Recomendaciones
1. [ ] Ir a `/recommendations`
2. [ ] Ver botones "Agregar al Carrito" (amarillos)
3. [ ] Click en "Agregar al Carrito"
4. [ ] Botón cambia a "Agregando..." (loading)
5. [ ] Botón cambia a "¡Agregado!" con check ✓
6. [ ] Contador en navbar aumenta
7. [ ] Ir a `/cart` → nuevo producto aparece

### Test 5: Notificaciones (MyAccount)
1. [ ] Ir a `/account`
2. [ ] Ver sección "Configuración de Notificaciones"
3. [ ] Ver toggle para categoría "Carrito" 🛒
4. [ ] Toggle funcional (on/off)
5. [ ] Estado persiste al refrescar página

### Test 6: Panel Admin (Solo apacheco@nikoncenter.cl)
1. [ ] Ir a `/admin`
2. [ ] Ver pestaña "🛒 Carritos"
3. [ ] Click en pestaña de Carritos
4. [ ] Ver 4 tarjetas de KPIs con valores
5. [ ] Ver tabla con 4 carritos
6. [ ] Tabla muestra:
   - [ ] Emails correctos
   - [ ] Número de productos
   - [ ] Valores en formato CLP
   - [ ] Tiempo en horas
   - [ ] Estados con colores (verde/amarillo/naranja/rojo)
   - [ ] Número de notificaciones enviadas

### Test 7: Carrito Abandonado (Usuario con 1 día)
1. [ ] Cerrar sesión (logout)
2. [ ] Iniciar sesión: `eduardofuentesbaltrons@gmail.com` / `123456`
3. [ ] Banner muestra "1 día" abandonado
4. [ ] Banner menciona "3 productos"
5. [ ] Ir a `/cart`
6. [ ] Ver alerta de "Hace 24 horas que agregaste productos"
7. [ ] Ver 3 productos en carrito (Lente + Accesorios)

### Test 8: Carrito Crítico (Usuario con 7 días)
1. [ ] Cerrar sesión
2. [ ] Iniciar sesión: `gabriel.taito@udenio.com` / `123456`
3. [ ] Banner muestra "7 días" abandonado
4. [ ] Banner muestra "5% descuento si compras hoy! 🎁"
5. [ ] Ir a `/cart`
6. [ ] Ver alerta roja/crítica de tiempo
7. [ ] Ver sección de "Descuento especial" en resumen
8. [ ] Total muestra precio con 5% de descuento

### Test 9: Carrito Vacío
1. [ ] En cualquier carrito, eliminar todos los productos
2. [ ] Ver mensaje "Tu carrito está vacío"
3. [ ] Ver botones para explorar productos
4. [ ] Contador en navbar muestra "0" o desaparece
5. [ ] Banner en home no aparece (refrescar página)

### Test 10: Responsivo (Mobile)
1. [ ] Reducir tamaño de ventana (< 768px)
2. [ ] Menú hamburguesa funciona
3. [ ] Link "Mi Carrito (X)" en menú mobile
4. [ ] Carrito se ve correctamente en mobile
5. [ ] Botones apilados verticalmente
6. [ ] Admin panel responsive (tabla con scroll horizontal)

---

## 🔍 Verificación de Errores

### Console del Navegador (F12 → Console)
Buscar estos errores comunes:

❌ **Posibles Errores:**
- `Cannot find module 'cartService'` → Reiniciar servidor
- `ShoppingCart is not defined` → Verificar import en App.tsx
- `RLS policy violation` → Verificar RLS policies en Supabase
- `Invalid price format` → Verificar que precios sean números

✅ **Debe estar limpio:**
- Sin errores rojos
- Warnings normales de React permitidos
- Requests a Supabase exitosos (200)

### Network Tab (F12 → Network)
- [ ] Requests a `/rest/v1/shopping_carts` → Status 200
- [ ] Requests a `/rest/v1/cart_items` → Status 200
- [ ] POST al agregar producto → Status 201
- [ ] PATCH al cambiar cantidad → Status 200

---

## 📊 Queries de Verificación SQL

Ejecuta en Supabase SQL Editor:

```sql
-- 1. Ver todos los carritos de prueba
SELECT 
    customer_email,
    status,
    items_count,
    total_value,
    EXTRACT(EPOCH FROM (NOW() - updated_at))/3600 as hours_abandoned
FROM shopping_carts
ORDER BY updated_at DESC;

-- 2. Ver items por carrito
SELECT 
    sc.customer_email,
    ci.product_name,
    ci.quantity,
    ci.unit_price,
    ci.subtotal
FROM cart_items ci
JOIN shopping_carts sc ON sc.id = ci.cart_id
ORDER BY sc.customer_email;

-- 3. Ver resumen analítico
SELECT * FROM abandoned_carts_summary;

-- 4. Ver notificaciones
SELECT 
    cn.notification_type,
    cn.title,
    cn.status,
    sc.customer_email
FROM cart_notifications cn
JOIN shopping_carts sc ON sc.id = cn.cart_id
ORDER BY cn.created_at DESC;
```

---

## ✨ Checklist Final

Antes de considerar completo:

### Funcionalidad Core
- [ ] Banner de carrito abandonado funciona
- [ ] Agregar productos al carrito funciona
- [ ] Cambiar cantidades funciona
- [ ] Eliminar productos funciona
- [ ] Totales se calculan correctamente
- [ ] Contador en navbar actualiza
- [ ] Redirección a checkout funciona

### UI/UX
- [ ] Animaciones suaves
- [ ] Loading states visibles
- [ ] Feedback visual inmediato
- [ ] Responsive en mobile
- [ ] Colores consistentes con tema Nikon

### Admin
- [ ] Panel accesible solo para admins
- [ ] KPIs muestran datos correctos
- [ ] Tabla de carritos completa
- [ ] Estados con colores correctos

### Base de Datos
- [ ] Triggers de totales funcionan
- [ ] RLS policies protegen datos
- [ ] Vista analítica funciona
- [ ] Índices creados correctamente

---

## 🐛 Solución de Problemas Comunes

### Error: "No aparece el banner"
**Causa:** Carrito sin items o tiempo < 1 hora
**Solución:** 
```sql
-- Forzar tiempo de abandono
UPDATE shopping_carts 
SET updated_at = NOW() - INTERVAL '2 hours'
WHERE customer_email = 'tu-email@ejemplo.com';
```

### Error: "Contador siempre en 0"
**Causa:** Cart no cargado en Layout
**Solución:** Verificar que `loadCartCount()` se ejecute en useEffect

### Error: "Panel admin no visible"
**Causa:** Email no está en ADMIN_EMAILS
**Solución:** Editar `Layout.tsx` línea 7 y agregar tu email

### Error: "Botón agregar no funciona"
**Causa:** Usuario no autenticado
**Solución:** Iniciar sesión primero

---

## 🎉 ¡Todo Listo!

Si todos los checks están ✅, el sistema está **100% funcional**.

**Próximo paso:** Subir a Vercel cuando estés listo.

**Comando para deploy:**
```bash
npm run build
# Luego conecta con Vercel Dashboard
```

---

**Fecha de Checklist:** 26 de Enero, 2026
**Versión:** 1.0.0
**Estado:** ✅ Implementación Completa
