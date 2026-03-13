# 📋 Guía de Estandarización de Contenido - Mi Nikon Experience

## 🎯 Objetivo

Reemplazar todo el contenido temporal/demo con datos reales de producción antes del lanzamiento.

---

## ✅ Estado Actual

### ✔️ **COMPLETADO**

#### Productos (`supabase/seed.sql`)
- ✅ Imágenes PNG sin fondo desde nikoncenter.cl
- ✅ URLs reales: `https://www.nikoncenter.cl/uploads/[categoria]/large/[timestamp]_1.png`
- ✅ Precios actualizados
- ✅ SKUs reales
- ✅ Descripciones de producto (algunas cortas pero reales)
- ✅ Stock status correctos

#### Links Externos
- ✅ Tienda: `https://www.nikoncenter.cl/carrito`
- ✅ Búsqueda de manuales: `https://www.nikoncenter.cl/buscar?q={producto}+manual`
- ✅ Download Center: `https://downloadcenter.nikonimglib.com/es/`
- ✅ Redes sociales: Instagram, Facebook, YouTube, TikTok

---

## ⚠️ PENDIENTE DE ACTUALIZACIÓN

### 1️⃣ **Workshops** (`utils/appData.ts` → WORKSHOPS_DATA)

**Problema:** Fechas pasadas (2024), imágenes temporales de Google Cloud

**Requerido:**
```typescript
{
    id: 'uuid',
    topic: 'Nombre del workshop real',
    instructor: 'Nombre real del instructor',
    location: 'Dirección física real o "Online"',
    date: 'Fecha futura (2026 en adelante)',
    time: 'Horario real',
    spots: 'Cupos reales',
    description: 'Descripción detallada (min 100 caracteres)',
    image: 'URL a nikoncenter.cl o imagen local PNG sin fondo'
}
```

**Acción:**
1. Contactar equipo de eventos de Nikon Center
2. Obtener calendario de workshops Q1 2026
3. Solicitar imágenes profesionales de instructores (PNG sin fondo)
4. Actualizar `utils/appData.ts` líneas 1-45

**Alternativa temporal:** Crear workshops genéricos con fechas futuras correctas

---

### 2️⃣ **Tutoriales** (`utils/appData.ts` → TUTORIALS_DATA)

**Problema:** Enlaces genéricos a `/learn-and-explore`, imágenes de Google Cloud

**Requerido:**
```typescript
{
    id: 'uuid',
    title: 'Título específico del tutorial',
    category: 'Ideas e Inspiración' | 'Productos e Innovación' | 'Tips y Técnicas',
    summary: 'Resumen atractivo (50-150 caracteres)',
    link: 'URL específica a artículo/video real en nikoncenter.cl o YouTube Nikon Chile',
    thumbnail: 'URL a imagen real (16:9, PNG/JPG, mín 800x450px)'
}
```

**Acción:**
1. Revisar contenido existente en:
   - https://www.nikoncenter.cl/learn-and-explore
   - https://www.youtube.com/user/NikonChileOficial
2. Seleccionar 8-12 tutoriales más relevantes
3. Obtener URLs específicas de cada tutorial
4. Descargar thumbnails en alta calidad
5. Subir a `public/images/tutorials/` (PNG sin fondo o JPG optimizado)
6. Actualizar `utils/appData.ts` líneas 46-100

---

### 3️⃣ **Imágenes de Respaldo** (`components/Gear.tsx`)

**Problema:** Fallback a `via.placeholder.com` (línea 555)

**Ubicación:** `components/Gear.tsx:555`
```typescript
src={prod.image_url || 'https://via.placeholder.com/300?text=Nikon+Product'}
```

**Acción:**
1. Crear imagen genérica de producto Nikon
2. Guardar en `public/images/product-placeholder.png`
3. Reemplazar con ruta local:
```typescript
src={prod.image_url || '/images/product-placeholder.png'}
```

---

### 4️⃣ **Recursos AI Assistant** (`data/resources.ts`)

**Problema:** URLs placeholder a `/images/resources/` que no existen

**Ubicación:** `data/resources.ts:12, 20, 30, 40, 50...`

**Acción:**
1. Crear imágenes para cada tipo de recurso:
   - `dslr-tips.jpg` (800x600)
   - `dx-wildlife.jpg`
   - `z9-autofocus.jpg`
   - `z7-evf.jpg`
   - etc.
2. Subir a `public/images/resources/`
3. Verificar todas las rutas en `resources.ts`

**Alternativa:** Usar imágenes de productos ya existentes de nikoncenter.cl

---

## 🔧 Pasos de Implementación

### Fase 1: Imágenes Locales (1-2 horas)

1. **Crear placeholder genérico**
```bash
# En public/images/
- product-placeholder.png (300x300, PNG sin fondo)
- tutorial-placeholder.jpg (800x450, 16:9)
- workshop-placeholder.jpg (1200x800)
```

2. **Actualizar Gear.tsx**
```typescript
// Línea 555
src={prod.image_url || '/images/product-placeholder.png'}

// Línea 411 (ya tiene fallback correcto a nikoncenter.cl)
// Mantener como está
```

### Fase 2: Workshops Reales (2-4 horas)

1. **Obtener datos reales del equipo de Nikon Center:**
   - Calendario Q1 2026
   - Fotos de instructores
   - Descripciones detalladas

2. **Actualizar `utils/appData.ts`:**
```typescript
export const WORKSHOPS_DATA = [
    {
        id: 'w-2026-01-001',
        topic: 'Fotografía de Producto con Z Series',
        instructor: 'Carolina Mendoza',
        location: 'Nikon Center - Av. Providencia 2215, Santiago',
        date: '15 de Febrero, 2026',
        time: '10:00 - 13:00',
        spots: 12,
        description: 'Workshop práctico enfocado en fotografía de producto para e-commerce y redes sociales. Aprenderás iluminación de 3 puntos, composición, edición básica en Lightroom y tips para destacar en Instagram. Incluye sesión práctica con productos reales.',
        image: '/images/workshops/instructor-carolina-mendoza.png'
    },
    // ... más workshops reales
];
```

### Fase 3: Tutoriales con URLs Reales (2-3 horas)

1. **Mapear contenido existente:**
```bash
# Buscar en nikoncenter.cl:
- Artículos de blog
- Videos de YouTube
- Guías PDF

# Criterios:
- Contenido en español
- Producción profesional
- Relevante para usuarios chilenos
```

2. **Actualizar `utils/appData.ts`:**
```typescript
export const TUTORIALS_DATA = [
    {
        id: 't-2026-001',
        title: 'Configuración inicial de tu Nikon Z8',
        category: 'Tips y Técnicas',
        summary: 'Guía completa para configurar tu nueva Z8 desde cero: menús, botones personalizados, y ajustes recomendados.',
        link: 'https://www.youtube.com/watch?v=REAL_VIDEO_ID',
        thumbnail: '/images/tutorials/z8-setup-guide.jpg'
    },
    // ... más tutoriales reales
];
```

### Fase 4: Recursos AI Assistant (1-2 horas)

1. **Opción A - Reutilizar imágenes existentes:**
```typescript
// data/resources.ts
image: 'https://www.nikoncenter.cl/uploads/camaras/large/20230511-014029_1.png'
```

2. **Opción B - Crear nuevas imágenes:**
```bash
# Descargar/crear en public/images/resources/
- dslr-tips.jpg
- z9-autofocus.jpg
- lens-guide.jpg
```

---

## 📊 Checklist Final

### Antes de Producción

- [ ] **Productos:** Verificar que TODAS las image_url apuntan a nikoncenter.cl o local
- [ ] **Workshops:** Fechas futuras (>= 2026), instructores reales, imágenes profesionales
- [ ] **Tutoriales:** URLs específicas funcionales, thumbnails de alta calidad
- [ ] **Placeholders:** Eliminar todas las referencias a via.placeholder.com
- [ ] **Google Cloud Images:** Reemplazar URLs temporales de lh3.googleusercontent.com
- [ ] **Links externos:** Validar que todos apuntan a sitios correctos
- [ ] **Imágenes locales:** Confirmar que existen en public/images/

### Testing

- [ ] Abrir cada sección de la app (Home, Gear, Workshops, Tutorials, Benefits)
- [ ] Verificar que NO aparecen imágenes rotas
- [ ] Verificar que NO hay mensajes de placeholder
- [ ] Confirmar que links externos abren correctamente
- [ ] Probar flujo completo de registro a workshop
- [ ] Verificar thumbnails en diferentes tamaños de pantalla

---

## 🎨 Estándares de Imagen

### Productos
- **Formato:** PNG sin fondo
- **Dimensiones:** 800x800px mínimo
- **Peso:** < 200KB
- **Fuente:** nikoncenter.cl/uploads/

### Workshops
- **Formato:** PNG (instructores) o JPG (locaciones)
- **Dimensiones:** 1200x800px (3:2)
- **Peso:** < 300KB
- **Contenido:** Foto profesional del instructor o instalaciones

### Tutoriales
- **Formato:** JPG optimizado
- **Dimensiones:** 800x450px (16:9)
- **Peso:** < 150KB
- **Contenido:** Thumbnail representativo del contenido

### Placeholders
- **Formato:** PNG con transparencia
- **Dimensiones:** Según uso (300x300, 800x450, etc.)
- **Contenido:** Logo Nikon o gráfico genérico profesional

---

## 🚀 Script de Validación

```bash
# Ejecutar para verificar imágenes rotas
grep -r "via.placeholder" components/
grep -r "lh3.googleusercontent" utils/ components/
grep -r "demo" utils/appData.ts
grep -r "lorem" components/

# Verificar fechas pasadas
grep "2024" utils/appData.ts
grep "2025" utils/appData.ts

# Verificar URLs genéricas
grep "learn-and-explore" utils/appData.ts
```

---

## 📞 Contactos

**Para obtener contenido real:**
- **Workshops:** Coordinador de Eventos - Nikon Center
- **Tutoriales:** Equipo de Marketing - contenido@nikoncenter.cl
- **Imágenes:** Diseño Gráfico - design@nikoncenter.cl

**Repositorio de assets:**
- Servidor: `nikoncenter.cl/uploads/`
- Categorías: `camaras/`, `objetivos/`, `accesorios/`, `sport_optics/`

---

## 📝 Notas Adicionales

### Imágenes de Google Cloud (Temporales)

Actualmente hay varias URLs a `lh3.googleusercontent.com` en:
- `WORKSHOPS_DATA` (4 imágenes)
- `TUTORIALS_DATA` (4 imágenes)

Estas son **temporales** y deben reemplazarse antes de producción con imágenes alojadas en:
1. **Opción recomendada:** `public/images/` (control total, sin dependencias externas)
2. **Opción alternativa:** nikoncenter.cl/uploads/ (consistencia con productos)

### Consideraciones de Performance

- Todas las imágenes deben estar optimizadas (TinyPNG, ImageOptim)
- Formato WebP para navegadores modernos (con fallback JPG/PNG)
- Implementar lazy loading (ya configurado en componentes)
- Considerar CDN para assets estáticos si el tráfico crece

---

## ✅ Criterios de Éxito

El contenido está **listo para producción** cuando:

1. ✅ NO hay enlaces a placeholder services
2. ✅ NO hay fechas pasadas en workshops
3. ✅ TODAS las imágenes cargan correctamente
4. ✅ TODOS los links externos funcionan
5. ✅ El contenido es profesional y relevante
6. ✅ No hay errores de consola por recursos faltantes
7. ✅ La experiencia es consistente en móvil y desktop

---

**Última actualización:** Enero 26, 2026  
**Responsable:** Equipo de Desarrollo Mi Nikon Experience
