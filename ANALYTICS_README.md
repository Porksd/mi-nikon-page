# Sistema de Analytics - Mi Nikon Experience

## 📊 Descripción General

Sistema completo de analytics con tracking de eventos, KPIs y visualizaciones interactivas para monitorear el comportamiento de usuarios y el rendimiento de la plataforma.

## 🗄️ Base de Datos

### Tabla Principal: `analytics_events`

Almacena todos los eventos de tracking con estructura flexible usando JSONB:

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Tipos de Eventos:**
- `page_view` - Visitas a páginas
- `product_view` - Visualizaciones de productos
- `product_search` - Búsquedas de productos
- `tutorial_view` - Vistas de tutoriales
- `ai_query` - Consultas al asistente IA
- `workshop_register` - Inscripciones a workshops

### Vistas Analíticas (9 vistas materializadas)

1. **analytics_active_users** - Usuarios activos por período
2. **analytics_top_products** - Productos más vistos
3. **analytics_top_registered_products** - Productos más registrados
4. **analytics_top_pages** - Páginas más visitadas
5. **analytics_ai_queries** - Estadísticas de consultas IA
6. **analytics_top_tutorials** - Tutoriales más populares
7. **analytics_workshop_stats** - Estadísticas de workshops
8. **analytics_user_engagement** - Score de engagement por usuario
9. **analytics_daily_summary** - Resumen diario de actividad

### Función RPC: `get_dashboard_kpis()`

Retorna un objeto JSON con 12 KPIs principales:
- `total_users` - Total de usuarios
- `active_users_today` - Activos hoy
- `active_users_week` - Activos esta semana
- `active_users_month` - Activos este mes
- `total_products_registered` - Productos registrados
- `total_page_views` - Total vistas de página
- `total_product_views` - Total vistas de productos
- `total_ai_queries` - Total consultas IA
- `total_tutorial_views` - Total vistas tutoriales
- `avg_session_duration_minutes` - Duración promedio sesión
- `total_events` - Total eventos
- `events_last_24h` - Eventos últimas 24h

## 📦 Servicio TypeScript: `analyticsService.ts`

### Funciones de Tracking

```typescript
// Track page view
trackPageView(pagePath: string, pageName: string): Promise<void>

// Track product view
trackProductView(productId: string, productName: string, category: string): Promise<void>

// Track product search
trackProductSearch(query: string, resultsCount: number): Promise<void>

// Track AI query
trackAIQuery(query: string, responseLength: number): Promise<void>

// Track tutorial view
trackTutorialView(tutorialId: string, tutorialTitle: string, durationSeconds: number): Promise<void>

// Generic event logging
logEvent(eventType: string, eventCategory: string, eventData: Record<string, any>): Promise<void>
```

### Funciones de Recuperación de Datos

```typescript
// Get dashboard KPIs
getDashboardKPIs(): Promise<DashboardKPIs | null>

// Get daily summary (last N days)
getDailySummary(days: number = 30): Promise<DailySummary[]>

// Get active users by period
getActiveUsers(period: 'daily' | 'weekly' | 'monthly'): Promise<ActiveUsersData[]>

// Get top products viewed
getTopProducts(limit: number = 10): Promise<TopProduct[]>

// Get top registered products
getTopRegisteredProducts(limit: number = 10): Promise<TopProduct[]>

// Get top pages
getTopPages(limit: number = 10): Promise<TopPage[]>

// Get user engagement scores
getUserEngagement(limit: number = 20): Promise<UserEngagement[]>

// Get AI queries analytics
getAIQueriesAnalytics(days: number = 30): Promise<AIQueryAnalytics[]>

// Get top tutorials
getTopTutorials(limit: number = 10): Promise<TopTutorial[]>

// Get workshop statistics
getWorkshopStats(): Promise<WorkshopStats[]>
```

### Helpers

```typescript
// Format engagement level with emoji
formatEngagementLevel(score: number): string
// Returns: 🟢 Alto / 🟡 Medio / 🔴 Bajo

// Format duration in minutes to human readable
formatDuration(minutes: number): string
// Returns: "2h 30m" / "45m"

// Calculate growth percentage
calculateGrowth(current: number, previous: number): number
```

## 🎨 Panel de Administración

### Ubicación
`components/AdminDashboard.tsx` - Tab "📊 Analytics"

### Componentes Visuales

1. **KPI Cards (8 tarjetas)**
   - Usuarios Activos (hoy/semana/mes)
   - Productos Registrados
   - Consultas IA
   - Tiempo Promedio
   - Vistas Totales
   - Productos Vistos
   - Tutoriales Vistos
   - Total Eventos

2. **Gráfico LineChart - Actividad Diaria**
   - 4 líneas: page_views, product_views, ai_queries, tutorial_views
   - Últimos 30 días
   - Interactivo con tooltips

3. **Gráficos BarChart - Top 10 Productos**
   - Productos más vistos (verde)
   - Productos más registrados (naranja)
   - Layout horizontal para mejor lectura

4. **Tabla - Páginas Más Visitadas**
   - Nombre de página
   - Total vistas
   - Usuarios únicos

5. **Tabla - Engagement de Usuarios**
   - Top 20 usuarios por score
   - Score con color (verde/amarillo/naranja)
   - Total eventos
   - Última actividad

## 🔒 Seguridad (RLS Policies)

```sql
-- Los usuarios pueden insertar sus propios eventos
CREATE POLICY users_insert_own_events ON analytics_events
  FOR INSERT TO authenticated
  USING (auth.uid() = user_id);

-- Solo admins pueden ver todos los eventos
CREATE POLICY admins_view_all_events ON analytics_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

## 🚀 Implementación en Componentes

### Ejemplo: Home.tsx

```typescript
import { trackPageView } from '../utils/analyticsService';

useEffect(() => {
  trackPageView('/', 'Home');
}, []);
```

### Ejemplo: Benefits.tsx

```typescript
import { trackPageView, trackProductView, trackProductSearch } from '../utils/analyticsService';

// En useEffect
trackPageView('/benefits', 'Mi Espacio Creativo');

// En búsqueda de productos
trackProductSearch(searchQuery, resultsCount);

// En click de producto
trackProductView(product.id, product.name, product.category);
```

### Ejemplo: AIAssistantWidget.tsx

```typescript
import { trackAIQuery } from '../utils/analyticsService';

// Después de recibir respuesta
trackAIQuery(userText, responseText.length);
```

## 📈 Casos de Uso

### 1. Monitorear Actividad en Tiempo Real
```typescript
const kpis = await getDashboardKPIs();
console.log(`Usuarios activos hoy: ${kpis.active_users_today}`);
```

### 2. Analizar Tendencias de Productos
```typescript
const topProducts = await getTopProducts(10);
topProducts.forEach(p => {
  console.log(`${p.product_name}: ${p.view_count} vistas`);
});
```

### 3. Evaluar Engagement de Usuarios
```typescript
const engagement = await getUserEngagement(20);
const highEngagement = engagement.filter(u => u.engagement_score >= 100);
console.log(`${highEngagement.length} usuarios con alto engagement`);
```

### 4. Comparar Performance de Tutoriales
```typescript
const tutorials = await getTopTutorials(10);
tutorials.forEach(t => {
  console.log(`${t.tutorial_title}: ${t.view_count} vistas, ${t.avg_duration_seconds}s promedio`);
});
```

## 🔄 Mantenimiento

### Ejecutar Migración

```bash
# En Supabase SQL Editor
-- Ejecutar: supabase/migration_analytics.sql
```

### Limpiar Eventos Antiguos (opcional)

```sql
DELETE FROM analytics_events
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Actualizar Vistas (si es necesario)

Las vistas se actualizan automáticamente con cada query. Para forzar actualización de vistas materializadas (si se implementan):

```sql
REFRESH MATERIALIZED VIEW analytics_active_users;
```

## 📊 Métricas Clave

### Engagement Score Formula
```
score = (page_views × 1) + (product_views × 2) + (ai_queries × 3) + (tutorial_views × 2)
```

### Niveles de Engagement
- 🟢 Alto: score ≥ 100
- 🟡 Medio: 50 ≤ score < 100
- 🔴 Bajo: score < 50

### Usuarios Activos
- **Daily**: Actividad en las últimas 24 horas
- **Weekly**: Actividad en los últimos 7 días
- **Monthly**: Actividad en los últimos 30 días

## 🎯 Próximos Pasos

1. **Eventos Adicionales:**
   - Workshop completion
   - Product purchase
   - Profile updates
   - Notification interactions

2. **Análisis Avanzado:**
   - Funnel de conversión
   - Retención de usuarios
   - Cohort analysis
   - A/B testing support

3. **Alertas Automáticas:**
   - Notificar cuando engagement baja
   - Alertas de productos populares
   - Detección de anomalías

4. **Exportación de Datos:**
   - CSV export de reportes
   - Integración con Google Analytics
   - Webhooks para eventos críticos

## 📚 Referencias

- **Recharts Docs**: https://recharts.org/
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL JSONB**: https://www.postgresql.org/docs/current/datatype-json.html

---

**✅ Sistema completo y listo para producción**

Última actualización: Enero 2026
