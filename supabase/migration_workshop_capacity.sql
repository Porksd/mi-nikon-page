-- =====================================================
-- Migration: Workshop Capacity Control System
-- Description: Sistema completo de control de cupos para workshops
--              con lista de espera automática y notificaciones
-- Date: 2026-01-26
-- =====================================================

-- ============================================
-- 1. Modificar workshop_registrations (MOVED UP)
-- ============================================

-- Agregar columna status si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workshop_registrations' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE workshop_registrations 
    ADD COLUMN status TEXT DEFAULT 'confirmed';
  END IF;
END $$;

-- Crear tipo enum para status (si no existe)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
    CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlist', 'cancelled');
  END IF;
END $$;

-- Convertir columna a tipo enum
ALTER TABLE workshop_registrations 
ALTER COLUMN status DROP DEFAULT,
ALTER COLUMN status TYPE registration_status USING status::registration_status,
ALTER COLUMN status SET DEFAULT 'confirmed';

-- Agregar índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_workshop_registrations_status 
  ON workshop_registrations(status);
CREATE INDEX IF NOT EXISTS idx_workshop_registrations_workshop_status 
  ON workshop_registrations(workshop_id, status);

-- ============================================
-- 2. Agregar columna waitlist_position (MOVED UP)
-- ============================================

ALTER TABLE workshop_registrations 
ADD COLUMN IF NOT EXISTS waitlist_position INTEGER;

CREATE INDEX IF NOT EXISTS idx_workshop_registrations_waitlist 
  ON workshop_registrations(workshop_id, waitlist_position) 
  WHERE status = 'waitlist';

-- ============================================
-- 3. Agregar columnas de control de cupos a workshops
-- ============================================

-- Agregar max_participants y available_spots a workshops
ALTER TABLE workshops 
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS available_spots INTEGER;

-- Inicializar available_spots basado en registros existentes
UPDATE workshops
SET available_spots = COALESCE(max_participants, 30) - (
  SELECT COUNT(*) 
  FROM workshop_registrations 
  WHERE workshop_registrations.workshop_id = workshops.id
  AND workshop_registrations.status != 'cancelled'
)
WHERE available_spots IS NULL;

-- ============================================
-- 4. Función para registrar con validación
-- ============================================

CREATE OR REPLACE FUNCTION register_for_workshop_with_validation(
  p_workshop_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_available_spots INTEGER;
  v_max_participants INTEGER;
  v_already_registered BOOLEAN;
  v_registration_id UUID;
  v_status registration_status;
  v_waitlist_position INTEGER;
BEGIN
  -- Verificar si ya está registrado
  SELECT EXISTS(
    SELECT 1 FROM workshop_registrations
    WHERE workshop_id = p_workshop_id 
    AND user_id = p_user_id
    AND status IN ('confirmed', 'waitlist')
  ) INTO v_already_registered;

  IF v_already_registered THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ya estás registrado en este workshop',
      'status', null
    );
  END IF;

  -- Obtener información del workshop
  SELECT available_spots, max_participants
  INTO v_available_spots, v_max_participants
  FROM workshops
  WHERE id = p_workshop_id;

  IF v_available_spots IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Workshop no encontrado',
      'status', null
    );
  END IF;

  -- Determinar status según disponibilidad
  IF v_available_spots > 0 THEN
    v_status := 'confirmed';
    v_waitlist_position := NULL;
    
    -- Actualizar cupos disponibles
    UPDATE workshops
    SET available_spots = available_spots - 1
    WHERE id = p_workshop_id;
  ELSE
    v_status := 'waitlist';
    
    -- Calcular posición en lista de espera
    SELECT COALESCE(MAX(waitlist_position), 0) + 1
    INTO v_waitlist_position
    FROM workshop_registrations
    WHERE workshop_id = p_workshop_id AND status = 'waitlist';
  END IF;

  -- Crear registro
  INSERT INTO workshop_registrations (workshop_id, user_id, status, waitlist_position)
  VALUES (p_workshop_id, p_user_id, v_status, v_waitlist_position)
  RETURNING id INTO v_registration_id;

  -- Crear notificación
  IF v_status = 'confirmed' THEN
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (
      p_user_id,
      '¡Inscripción Confirmada! 🎉',
      'Tu cupo en el workshop ha sido confirmado. Te esperamos.',
      'workshops'
    );
  ELSE
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (
      p_user_id,
      'En Lista de Espera ⏳',
      'Estás en la lista de espera. Te notificaremos si se libera un cupo.',
      'workshops'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', v_status,
    'registration_id', v_registration_id,
    'waitlist_position', v_waitlist_position,
    'available_spots', CASE WHEN v_status = 'confirmed' THEN v_available_spots - 1 ELSE v_available_spots END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Función para cancelar registro
-- ============================================

CREATE OR REPLACE FUNCTION cancel_workshop_registration(
  p_registration_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_workshop_id UUID;
  v_user_id UUID;
  v_old_status registration_status;
  v_next_waitlist_user UUID;
  v_next_registration_id UUID;
BEGIN
  -- Obtener datos del registro
  SELECT workshop_id, user_id, status
  INTO v_workshop_id, v_user_id, v_old_status
  FROM workshop_registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registro no encontrado');
  END IF;

  -- Cancelar registro
  UPDATE workshop_registrations
  SET status = 'cancelled'
  WHERE id = p_registration_id;

  -- Si era confirmado, liberar cupo y procesar waitlist
  IF v_old_status = 'confirmed' THEN
    -- Incrementar cupos disponibles
    UPDATE workshops
    SET available_spots = available_spots + 1
    WHERE id = v_workshop_id;

    -- Buscar primer usuario en waitlist
    SELECT user_id, id
    INTO v_next_waitlist_user, v_next_registration_id
    FROM workshop_registrations
    WHERE workshop_id = v_workshop_id
    AND status = 'waitlist'
    ORDER BY waitlist_position ASC
    LIMIT 1;

    -- Si hay alguien en waitlist, promoverlo
    IF v_next_waitlist_user IS NOT NULL THEN
      -- Actualizar a confirmado
      UPDATE workshop_registrations
      SET status = 'confirmed', waitlist_position = NULL
      WHERE id = v_next_registration_id;

      -- Decrementar cupos disponibles nuevamente
      UPDATE workshops
      SET available_spots = available_spots - 1
      WHERE id = v_workshop_id;

      -- Reordenar posiciones de waitlist
      UPDATE workshop_registrations
      SET waitlist_position = waitlist_position - 1
      WHERE workshop_id = v_workshop_id
      AND status = 'waitlist'
      AND waitlist_position > (
        SELECT waitlist_position FROM workshop_registrations WHERE id = v_next_registration_id
      );

      -- Notificar al usuario promovido
      INSERT INTO notifications (user_id, title, message, category)
      VALUES (
        v_next_waitlist_user,
        '¡Cupo Disponible! 🎉',
        'Se ha liberado un cupo en el workshop. Tu inscripción ha sido confirmada.',
        'workshops'
      );
    END IF;
  END IF;

  -- Notificar cancelación al usuario original
  INSERT INTO notifications (user_id, title, message, category)
  VALUES (
    v_user_id,
    'Inscripción Cancelada',
    'Tu inscripción al workshop ha sido cancelada.',
    'workshops'
  );

  RETURN jsonb_build_object('success', true, 'processed_waitlist', v_next_waitlist_user IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Función para obtener disponibilidad
-- ============================================

CREATE OR REPLACE FUNCTION get_workshop_availability(p_workshop_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'workshop_id', w.id,
    'title', w.title,
    'max_participants', w.max_participants,
    'available_spots', w.available_spots,
    'confirmed_count', (
      SELECT COUNT(*) FROM workshop_registrations 
      WHERE workshop_id = w.id AND status = 'confirmed'
    ),
    'waitlist_count', (
      SELECT COUNT(*) FROM workshop_registrations 
      WHERE workshop_id = w.id AND status = 'waitlist'
    ),
    'is_full', w.available_spots = 0
  )
  INTO v_result
  FROM workshops w
  WHERE w.id = p_workshop_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Función para procesar manualmente waitlist
-- ============================================

CREATE OR REPLACE FUNCTION process_workshop_waitlist(p_workshop_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_available_spots INTEGER;
  v_processed_count INTEGER := 0;
  v_waitlist_user RECORD;
BEGIN
  -- Obtener cupos disponibles
  SELECT available_spots INTO v_available_spots
  FROM workshops WHERE id = p_workshop_id;

  IF v_available_spots IS NULL OR v_available_spots <= 0 THEN
    RETURN jsonb_build_object('success', false, 'processed', 0, 'message', 'No hay cupos disponibles');
  END IF;

  -- Procesar usuarios en waitlist
  FOR v_waitlist_user IN
    SELECT id, user_id, waitlist_position
    FROM workshop_registrations
    WHERE workshop_id = p_workshop_id
    AND status = 'waitlist'
    ORDER BY waitlist_position ASC
    LIMIT v_available_spots
  LOOP
    -- Confirmar registro
    UPDATE workshop_registrations
    SET status = 'confirmed', waitlist_position = NULL
    WHERE id = v_waitlist_user.id;

    -- Notificar usuario
    INSERT INTO notifications (user_id, title, message, category)
    VALUES (
      v_waitlist_user.user_id,
      '¡Cupo Confirmado! 🎉',
      'Tu cupo en el workshop ha sido confirmado.',
      'workshops'
    );

    v_processed_count := v_processed_count + 1;
  END LOOP;

  -- Actualizar cupos disponibles
  UPDATE workshops
  SET available_spots = available_spots - v_processed_count
  WHERE id = p_workshop_id;

  -- Reordenar posiciones restantes
  UPDATE workshop_registrations
  SET waitlist_position = waitlist_position - v_processed_count
  WHERE workshop_id = p_workshop_id
  AND status = 'waitlist';

  RETURN jsonb_build_object(
    'success', true, 
    'processed', v_processed_count,
    'remaining_spots', v_available_spots - v_processed_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Trigger para mantener integridad
-- ============================================

CREATE OR REPLACE FUNCTION update_workshop_spots()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular cupos disponibles
  UPDATE workshops
  SET available_spots = max_participants - (
    SELECT COUNT(*)
    FROM workshop_registrations
    WHERE workshop_id = NEW.workshop_id
    AND status = 'confirmed'
  )
  WHERE id = NEW.workshop_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_update_workshop_spots ON workshop_registrations;

-- Crear trigger
CREATE TRIGGER trigger_update_workshop_spots
AFTER INSERT OR UPDATE OF status ON workshop_registrations
FOR EACH ROW
EXECUTE FUNCTION update_workshop_spots();

-- ============================================
-- 9. RLS Policies
-- ============================================

-- Permitir a usuarios ver disponibilidad de workshops
DROP POLICY IF EXISTS users_view_workshop_availability ON workshops;
CREATE POLICY users_view_workshop_availability
  ON workshops FOR SELECT
  TO authenticated
  USING (true);

-- Permitir a usuarios ver sus propios registros
DROP POLICY IF EXISTS users_view_own_registrations ON workshop_registrations;
CREATE POLICY users_view_own_registrations
  ON workshop_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 10. Vista para admin: Lista de inscritos
-- ============================================

CREATE OR REPLACE VIEW workshop_registrations_detailed AS
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
ORDER BY w.date DESC, wr.created_at ASC;

-- ============================================
-- Comentarios y documentación
-- ============================================

COMMENT ON COLUMN workshops.max_participants IS 'Número máximo de participantes permitidos';
COMMENT ON COLUMN workshops.available_spots IS 'Cupos disponibles actuales (se actualiza automáticamente)';
COMMENT ON COLUMN workshop_registrations.status IS 'Estado: confirmed (confirmado), waitlist (lista de espera), cancelled (cancelado)';
COMMENT ON COLUMN workshop_registrations.waitlist_position IS 'Posición en lista de espera (NULL si confirmado)';

COMMENT ON FUNCTION register_for_workshop_with_validation IS 'Registra usuario en workshop con validación de cupos. Retorna status y posición en waitlist si aplica.';
COMMENT ON FUNCTION cancel_workshop_registration IS 'Cancela registro y procesa automáticamente el siguiente en waitlist si aplica.';
COMMENT ON FUNCTION get_workshop_availability IS 'Obtiene información detallada de disponibilidad de un workshop.';
COMMENT ON FUNCTION process_workshop_waitlist IS 'Procesa manualmente la lista de espera de un workshop (admin).';

-- =====================================================
-- Fin de migración
-- =====================================================
