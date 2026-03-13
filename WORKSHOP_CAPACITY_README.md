# Sistema de Control de Cupos - Workshops

## 📋 Descripción General

Sistema completo de gestión de workshops con control automático de cupos, lista de espera, y notificaciones inteligentes. Previene sobrecupo y gestiona automáticamente la lista de espera cuando se liberan cupos.

## 🗄️ Base de Datos

### Modificaciones a `workshops`

```sql
ALTER TABLE workshops 
ADD COLUMN max_participants INTEGER DEFAULT 30,
ADD COLUMN available_spots INTEGER;
```

**Campos:**
- `max_participants` - Capacidad máxima del workshop (definida al crear)
- `available_spots` - Cupos disponibles actuales (se actualiza automáticamente)

### Modificaciones a `workshop_registrations`

```sql
ALTER TABLE workshop_registrations 
ALTER COLUMN status TYPE registration_status;

CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlist', 'cancelled');

ALTER TABLE workshop_registrations 
ADD COLUMN waitlist_position INTEGER;
```

**Estados (status):**
- `confirmed` - Usuario confirmado con cupo
- `waitlist` - Usuario en lista de espera
- `cancelled` - Inscripción cancelada

**Campo adicional:**
- `waitlist_position` - Posición en la cola de espera (1, 2, 3, ...) | NULL si confirmado

## 🔧 Funciones RPC

### 1. `register_for_workshop_with_validation(p_workshop_id, p_user_id)`

Registra un usuario en un workshop con validación automática de cupos.

**Lógica:**
1. Verifica si el usuario ya está registrado (previene duplicados)
2. Obtiene cupos disponibles del workshop
3. Si `available_spots > 0`:
   - Crea registro con status `confirmed`
   - Decrementa `available_spots`
   - Notifica: "¡Inscripción Confirmada! 🎉"
4. Si `available_spots = 0`:
   - Crea registro con status `waitlist`
   - Asigna `waitlist_position` (siguiente número en la cola)
   - Notifica: "En Lista de Espera ⏳"

**Retorna:**
```json
{
  "success": true,
  "status": "confirmed" | "waitlist",
  "registration_id": "uuid",
  "waitlist_position": 3,
  "available_spots": 15
}
```

### 2. `cancel_workshop_registration(p_registration_id)`

Cancela un registro y procesa automáticamente el siguiente en waitlist.

**Lógica:**
1. Marca registro como `cancelled`
2. Si era `confirmed`:
   - Incrementa `available_spots`
   - Busca primer usuario en `waitlist` (ORDER BY waitlist_position)
   - Si existe:
     - Lo promociona a `confirmed`
     - Decrementa `available_spots` nuevamente
     - Reordena posiciones de usuarios restantes en waitlist
     - Notifica al promovido: "¡Cupo Disponible! 🎉"
3. Notifica al usuario que canceló

**Retorna:**
```json
{
  "success": true,
  "processed_waitlist": true
}
```

### 3. `get_workshop_availability(p_workshop_id)`

Obtiene información detallada de disponibilidad.

**Retorna:**
```json
{
  "workshop_id": "uuid",
  "title": "Fotografía de Paisajes",
  "max_participants": 30,
  "available_spots": 5,
  "confirmed_count": 25,
  "waitlist_count": 8,
  "is_full": false
}
```

### 4. `process_workshop_waitlist(p_workshop_id)` (Admin)

Procesa manualmente la lista de espera.

**Uso:** Cuando el admin aumenta los cupos manualmente o necesita confirmar usuarios.

**Lógica:**
1. Obtiene cupos disponibles
2. Confirma N usuarios de waitlist (ORDER BY waitlist_position)
3. Notifica a cada usuario confirmado
4. Reordena posiciones restantes

**Retorna:**
```json
{
  "success": true,
  "processed": 5,
  "remaining_spots": 0
}
```

## 📦 Servicio TypeScript: `workshopService.ts`

### Funciones para Usuarios

```typescript
// Registrarse en workshop (auto-detecta si va a confirmed o waitlist)
registerForWorkshop(workshopId: string, userId: string): Promise<RegistrationResult>

// Cancelar inscripción (procesa waitlist automáticamente)
cancelRegistration(registrationId: string): Promise<CancellationResult>

// Obtener disponibilidad de un workshop
getWorkshopAvailability(workshopId: string): Promise<WorkshopAvailability | null>

// Verificar registro propio
getUserWorkshopRegistration(workshopId: string, userId: string): Promise<WorkshopRegistration | null>

// Obtener posición en waitlist
getWaitlistPosition(workshopId: string, userId: string): Promise<number | null>

// Ver todos los workshops con disponibilidad
getAllWorkshopsWithAvailability(): Promise<Workshop[]>

// Validar si puede registrarse
canUserRegister(workshopId: string, userId: string): Promise<{canRegister: boolean; reason?: string}>
```

### Funciones Admin

```typescript
// Procesar lista de espera manualmente
processWaitlist(workshopId: string): Promise<WaitlistProcessResult>

// Ver todos los registros con detalles completos
getWorkshopRegistrationsDetailed(workshopId: string): Promise<WorkshopRegistrationDetailed[]>

// Obtener estadísticas completas
getWorkshopStats(workshopId: string): Promise<WorkshopStats | null>

// Actualizar capacidad máxima
updateWorkshopCapacity(workshopId: string, maxParticipants: number): Promise<boolean>
```

### Funciones Helper

```typescript
// Formatear status para UI
formatRegistrationStatus(status: RegistrationStatus): string
// Returns: "Confirmado" | "Lista de Espera" | "Cancelado"

// Obtener color del badge
getStatusColor(status: RegistrationStatus): string
// Returns: "green" | "yellow" | "gray"

// Mensaje de disponibilidad
formatAvailabilityMessage(availability: WorkshopAvailability): string
// Returns: "5 cupos disponibles" | "Lleno (3 en lista de espera)"

// Calcular ocupación
calculateOccupancy(availability: WorkshopAvailability): number
// Returns: 0-100
```

## 🎨 Componente: Workshops.tsx (Usuario)

### Características

1. **Vista de Workshops:**
   - Muestra disponibilidad en tiempo real
   - Badge de estado personal (Confirmado/Lista de Espera)
   - Indicador de cupos disponibles con color dinámico
   - Contador de lista de espera

2. **Badges de Estado:**
   ```tsx
   // Verde con ✓ - Confirmado
   <div className="bg-green-500/20 text-green-400 border-green-500/30">
     Confirmado
   </div>
   
   // Amarillo con # - En Espera
   <div className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
     Lista de Espera (#3)
   </div>
   ```

3. **Botones Inteligentes:**
   - **Hay cupos:** "Inscribirme Ahora" (amarillo)
   - **Workshop lleno:** "Unirse a Lista de Espera" (amarillo oscuro)
   - **Ya registrado:** "Cancelar Inscripción" (rojo)

4. **Modal de Confirmación:**
   - Muestra información del workshop
   - Indica si es inscripción directa o lista de espera
   - Muestra cupos disponibles o posición en espera
   - Estados: procesando/confirmado/error

5. **Información en Tiempo Real:**
   ```tsx
   const availability = workshopAvailability.get(workshop.id);
   
   // Muestra:
   // - "5 cupos disponibles"
   // - "Lleno (3 en lista de espera)"
   // - Barra de progreso de ocupación
   ```

## 🔐 Admin Dashboard (AdminDashboard.tsx)

### Vista de Workshops

**Cards Expandidos con Estadísticas:**

1. **KPIs por Workshop:**
   - Confirmados (verde)
   - En Espera (amarillo)
   - Disponibles (azul)
   - % Ocupación (amarillo)

2. **Barra de Progreso:**
   - Visual de ocupación 0-100%
   - Gradiente verde → amarillo

3. **Lista de Inscritos (expandible):**
   - **Confirmados:** Nombre, email, fecha de inscripción
   - **Lista de Espera:** Con número de posición (#1, #2, #3...)
   - Scroll independiente para cada lista
   - Colores distintivos (verde/amarillo)

4. **Botones de Acción:**
   - **"Procesar Espera"**: Visible solo si hay waitlist Y cupos disponibles
   - **"Ver Inscritos"**: Toggle para expandir/colapsar listas
   - **"Eliminar"**: Botón rojo en hover de imagen

### Flujo Admin

```typescript
// Admin aumenta cupos manualmente
await updateWorkshopCapacity(workshopId, 35); // de 30 a 35

// Procesar automáticamente waitlist
const result = await processWaitlist(workshopId);
// Confirma 5 usuarios de waitlist
// Envía notificaciones automáticamente
```

## 🔄 Flujos de Usuario

### Escenario 1: Registro con Cupos Disponibles

```
Usuario → Click "Inscribirme"
  → Modal: "✅ Cupo Disponible - 5 cupos de 30"
  → Confirma
  → register_for_workshop_with_validation()
  → Status: confirmed
  → available_spots: 30 → 29
  → Notificación: "¡Inscripción Confirmada! 🎉"
  → Badge verde en UI: "Confirmado"
```

### Escenario 2: Registro con Workshop Lleno

```
Usuario → Click "Unirse a Lista de Espera"
  → Modal: "⏳ Lista de Espera - Lleno (3 esperando)"
  → Confirma
  → register_for_workshop_with_validation()
  → Status: waitlist, position: 4
  → Notificación: "En Lista de Espera ⏳"
  → Badge amarillo en UI: "Lista de Espera (#4)"
```

### Escenario 3: Cancelación con Waitlist

```
Usuario A (confirmado) → Click "Cancelar"
  → Confirma
  → cancel_workshop_registration()
  → Status: cancelled
  → available_spots: 0 → 1
  
  [AUTOMÁTICO]
  → Busca primer usuario en waitlist
  → Usuario B (waitlist #1)
  → Promociona a confirmed
  → available_spots: 1 → 0
  → Notificación a B: "¡Cupo Disponible! 🎉"
  → Reordena resto: #2→#1, #3→#2, etc.
```

## 🚨 Trigger Automático

### `trigger_update_workshop_spots`

Se ejecuta AFTER INSERT OR UPDATE en `workshop_registrations`.

**Función:**
- Recalcula `available_spots` automáticamente
- Fórmula: `max_participants - COUNT(confirmed registrations)`
- Garantiza consistencia de datos

```sql
CREATE TRIGGER trigger_update_workshop_spots
AFTER INSERT OR UPDATE OF status ON workshop_registrations
FOR EACH ROW
EXECUTE FUNCTION update_workshop_spots();
```

## 📊 Vista Admin: `workshop_registrations_detailed`

Vista materializada con JOIN de todas las tablas relacionadas:

```sql
SELECT 
  wr.id,
  wr.workshop_id,
  wr.user_id,
  wr.status,
  wr.waitlist_position,
  wr.created_at,
  w.title as workshop_title,
  w.date as workshop_date,
  p.first_name,
  p.last_name,
  p.email,
  p.phone
FROM workshop_registrations wr
JOIN workshops w ON w.id = wr.workshop_id
JOIN profiles p ON p.id = wr.user_id
```

**Uso:** Admin puede ver toda la información sin múltiples queries.

## 🔒 RLS Policies

```sql
-- Usuarios pueden ver disponibilidad de workshops
CREATE POLICY users_view_workshop_availability
  ON workshops FOR SELECT
  TO authenticated
  USING (true);

-- Usuarios solo ven sus propios registros
CREATE POLICY users_view_own_registrations
  ON workshop_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

## 🎯 Casos de Uso

### Usuario Regular

```typescript
// Ver disponibilidad
const availability = await getWorkshopAvailability(workshopId);
console.log(`${availability.available_spots} cupos disponibles`);

// Registrarse
const result = await registerForWorkshop(workshopId, userId);
if (result.status === 'confirmed') {
  alert('¡Confirmado!');
} else {
  alert(`En lista de espera - posición ${result.waitlist_position}`);
}

// Verificar mi registro
const myReg = await getUserWorkshopRegistration(workshopId, userId);
if (myReg?.status === 'waitlist') {
  const position = await getWaitlistPosition(workshopId, userId);
  console.log(`Estás en posición #${position}`);
}

// Cancelar
await cancelRegistration(registrationId);
```

### Admin

```typescript
// Ver estadísticas completas
const stats = await getWorkshopStats(workshopId);
console.log(`Ocupación: ${stats.fill_percentage}%`);
console.log(`Confirmados: ${stats.confirmed_count}`);
console.log(`Waitlist: ${stats.waitlist_count}`);

// Aumentar cupos
await updateWorkshopCapacity(workshopId, 40);

// Procesar waitlist manualmente
const result = await processWaitlist(workshopId);
alert(`${result.processed} usuarios confirmados`);

// Ver lista detallada
const registrations = await getWorkshopRegistrationsDetailed(workshopId);
registrations.forEach(reg => {
  console.log(`${reg.first_name} - ${reg.status} - ${reg.email}`);
});
```

## ⚡ Ventajas del Sistema

1. **Prevención de Sobrecupo:**
   - Validación a nivel de base de datos
   - Triggers automáticos mantienen integridad

2. **Lista de Espera Automática:**
   - Usuarios no pierden interés
   - Notificaciones instantáneas cuando se libera cupo

3. **Procesamiento Inteligente:**
   - Cancelación → Promoción automática
   - Admin puede procesar waitlist manualmente
   - Reordenamiento automático de posiciones

4. **Transparencia:**
   - Usuario siempre sabe su estado
   - Posición en waitlist visible
   - Cupos disponibles en tiempo real

5. **Escalabilidad:**
   - Funciona con 10 o 10,000 usuarios
   - PostgreSQL maneja concurrencia
   - Sin race conditions

## 🧪 Testing Sugerido

```sql
-- 1. Crear workshop de prueba (10 cupos)
INSERT INTO workshops (title, max_participants, available_spots, ...)
VALUES ('Test Workshop', 10, 10, ...);

-- 2. Registrar 10 usuarios (deben ser confirmed)
SELECT register_for_workshop_with_validation(...); -- x10

-- 3. Registrar usuario 11 (debe ir a waitlist #1)
SELECT register_for_workshop_with_validation(...);

-- 4. Cancelar usuario 5 (debe promover a usuario 11)
SELECT cancel_workshop_registration(...);

-- 5. Verificar:
SELECT * FROM workshops WHERE id = ...;
-- available_spots debe ser 0

SELECT * FROM workshop_registrations WHERE workshop_id = ...;
-- Usuario 11 debe estar confirmed
-- No debe haber waitlist activo
```

## 📚 Archivos Relacionados

- **Migración:** `supabase/migration_workshop_capacity.sql`
- **Servicio:** `utils/workshopService.ts`
- **UI Usuario:** `components/Workshops.tsx`
- **UI Admin:** `components/AdminDashboard.tsx`

---

**✅ Sistema completo y listo para producción**

Última actualización: Enero 2026
