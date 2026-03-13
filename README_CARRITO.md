# 🛒 Sistema de Carrito Abandonado - Mi Nikon Experience

## 📋 Resumen de Implementación

Se ha implementado un sistema completo de carritos abandonados con:

✅ **4 componentes principales:**
1. ✅ Componente ShoppingCart completo
2. ✅ Banner de carrito abandonado en Home
3. ✅ Notificaciones de carrito en MyAccount
4. ✅ Panel de administración de carritos

## 🚀 Cómo Probar en Local

### Paso 1: Configurar Base de Datos

1. **Abre el Dashboard de Supabase**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Ejecuta las migraciones SQL**
   
   **Primero**, ejecuta el archivo de migración:
   ```bash
   # Desde SQL Editor en Supabase Dashboard
   # Copia y pega el contenido de:
   supabase/migration_shopping_cart.sql
   ```

   **Segundo**, carga los datos de prueba:
   ```bash
   # Copia y pega el contenido de:
   supabase/seed_shopping_cart_test.sql
   ```

### Paso 2: Instalar Dependencias (si no lo has hecho)

```bash
cd "j:\Empres\Nikon\IA\Proyectos\Mi Nikon\mi-nikon-experience"
npm install
```

### Paso 3: Iniciar el Servidor Local

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 🧪 Usuarios de Prueba

Puedes iniciar sesión con cualquiera de estos emails (todos tienen carritos de prueba):

| Email | Escenario | Productos | Valor |
|-------|-----------|-----------|-------|
| `apacheco@nikoncenter.cl` | Recién creado (2h) | Z6 III + Lente | $5,081,800 |
| `eduardofuentesbaltrons@gmail.com` | Abandonado 1 día | Lente 85mm + Accesorios | $1,209,700 |
| `andrescomastri@mac.com` | Abandonado 3 días | Flash SB-5000 | $549,990 |
| `gabriel.taito@udenio.com` | Crítico 7 días | Z50 II Kit + Lente | $2,140,500 |

**Contraseña de todos:** `123456` (si ya están registrados en tu BD)

## 🎯 Funcionalidades a Probar

### 1. **Banner de Carrito Abandonado en Home** 🏠
- ✅ Inicia sesión con cualquier usuario de prueba
- ✅ Verás un banner amarillo mostrando productos pendientes
- ✅ Botón "Ver mi carrito" te lleva directo al carrito
- ✅ Botón "Más tarde" oculta el banner (guardado en localStorage)
- ✅ Si el carrito tiene más de 72h, muestra descuento del 5%

### 2. **Página de Carrito** 🛒
- ✅ Navega a `/cart` o click en ícono de carrito (navbar)
- ✅ Ver todos los productos con imágenes
- ✅ Cambiar cantidades con botones +/-
- ✅ Eliminar productos con botón de basura
- ✅ Ver subtotales y total actualizado en tiempo real
- ✅ Alerta de tiempo abandonado (si >1h)
- ✅ Descuento especial si >72h abandonado
- ✅ Botón "Continuar Compra" → redirige a Nikon Center

**Contador en Navbar:**
- ✅ Badge con número de items en el ícono del carrito
- ✅ Se actualiza automáticamente al cambiar cantidades

### 3. **Notificaciones de Carrito** 🔔
- ✅ Ve a "Mi Cuenta" (`/account`)
- ✅ En "Configuración de Notificaciones" verás nueva categoría: **Carrito**
- ✅ Toggle para activar/desactivar notificaciones de carrito
- ✅ En el futuro aquí aparecerán recordatorios automáticos

### 4. **Panel de Administración** 👨‍💼
- ✅ Inicia sesión con: `apacheco@nikoncenter.cl`
- ✅ Ve a `/admin`
- ✅ Click en pestaña **"🛒 Carritos"**

**Verás 4 tarjetas de analítica:**
- **Carritos Activos**: Cuántos carritos hay en progreso
- **Abandonados**: Carritos sin actividad
- **Completados**: Compras finalizadas
- **Potencial de Recuperación**: Valor total en carritos abandonados

**Tabla de Carritos Abandonados:**
- Email del cliente
- Número de productos
- Valor total
- Tiempo abandonado (en horas)
- Estado (color según urgencia: verde/amarillo/naranja/rojo)
- Notificaciones enviadas

## 📊 Queries de Verificación (Opcional)

Si quieres verificar los datos directamente en Supabase:

```sql
-- Ver todos los carritos
SELECT * FROM shopping_carts ORDER BY updated_at DESC;

-- Ver items de un carrito específico
SELECT * FROM cart_items WHERE cart_id = 'TU_CART_ID';

-- Ver resumen de carritos abandonados (usa la vista)
SELECT * FROM abandoned_carts_summary;

-- Ver notificaciones de carrito
SELECT * FROM cart_notifications ORDER BY created_at DESC;
```

## 🔧 Archivos Creados/Modificados

### Nuevos Archivos:
- ✅ `types.ts` - Interfaces de TypeScript expandidas
- ✅ `utils/cartService.ts` - Funciones CRUD de carrito
- ✅ `components/ShoppingCart.tsx` - Página del carrito
- ✅ `supabase/migration_shopping_cart.sql` - Schema de BD
- ✅ `supabase/seed_shopping_cart_test.sql` - Datos de prueba

### Archivos Modificados:
- ✅ `App.tsx` - Nueva ruta `/cart`
- ✅ `components/Layout.tsx` - Ícono de carrito con contador
- ✅ `components/Home.tsx` - Banner de carrito abandonado
- ✅ `components/MyAccount.tsx` - Categoría de notificaciones
- ✅ `components/AdminDashboard.tsx` - Pestaña de carritos

## 🎨 Diseño y UX

**Colores Temáticos:**
- 🟨 Amarillo Nikon: Elementos principales, CTAs
- 🟧 Naranja: Alertas de abandono
- 🟥 Rojo: Carritos críticos (>7 días)
- 🟩 Verde: Carritos activos, éxitos

**Componentes Lucide-React usados:**
- `ShoppingCart` - Ícono de carrito
- `Trash2` - Eliminar producto
- `Plus/Minus` - Controles de cantidad
- `Clock` - Tiempo abandonado
- `AlertCircle` - Alertas
- `ExternalLink` - Checkout externo
- `TrendingUp/DollarSign` - Analytics

## 🐛 Solución de Problemas

### Error: "Cannot find module 'cartService'"
```bash
# Asegúrate de estar en el directorio correcto
cd "j:\Empres\Nikon\IA\Proyectos\Mi Nikon\mi-nikon-experience"
# Reinicia el servidor
npm run dev
```

### No veo el banner de carrito
- Verifica que el carrito tenga items (`items_count > 0`)
- El banner solo aparece si el carrito tiene >1 hora de abandono
- Revisa localStorage: `cart-banner-dismissed-{cart_id}` debe ser `null`

### El contador no aparece en navbar
- Verifica que estés autenticado
- Revisa que el carrito tenga items
- Refresca la página después de modificar el carrito

### Error en panel admin
- Solo emails en `ADMIN_EMAILS` pueden acceder
- Edita `components/Layout.tsx` línea 7 para agregar tu email

## 📈 Próximos Pasos Sugeridos

1. **Integrar botón "Agregar al Carrito"** en:
   - Página de Recomendaciones
   - Catálogo de productos (Gear)
   - Fichas de producto individuales

2. **Sistema de notificaciones push real:**
   - Integrar con Firebase Cloud Messaging
   - Programar cron jobs en Supabase Edge Functions
   - Automatizar envío según tiempo de abandono

3. **Email de recuperación** (cuando se reactive el servicio):
   - Templates personalizados
   - Links de recuperación directa
   - Códigos de descuento únicos

4. **Analytics avanzados:**
   - Gráficos de conversión por tiempo
   - Segmentación por tipo de producto
   - Valor promedio de carrito

5. **Integración con Nikon Center:**
   - API para sincronizar inventario real
   - Webhook de confirmación de pago
   - Actualizar stock automáticamente

## 📞 Soporte

Si encuentras problemas, revisa:
1. Console del navegador (F12)
2. Logs de Supabase (Dashboard → Logs)
3. Network tab para ver requests fallidas

---

**¡Listo para probar! 🚀**

Inicia sesión con cualquier usuario de prueba y explora las funcionalidades.
