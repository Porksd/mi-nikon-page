/**
 * Workshop Service
 * 
 * Servicio completo para gestión de workshops con control de cupos,
 * lista de espera automática, y notificaciones.
 */

import { supabase } from './supabaseClient';

// ============================================
// Types & Interfaces
// ============================================

export type RegistrationStatus = 'confirmed' | 'waitlist' | 'cancelled';

export interface WorkshopRegistration {
  id: string;
  workshop_id: string;
  user_id: string;
  status: RegistrationStatus;
  waitlist_position: number | null;
  created_at: string;
}

export interface WorkshopAvailability {
  workshop_id: string;
  title: string;
  max_participants: number;
  available_spots: number;
  confirmed_count: number;
  waitlist_count: number;
  is_full: boolean;
}

export interface RegistrationResult {
  success: boolean;
  status?: RegistrationStatus;
  registration_id?: string;
  waitlist_position?: number;
  available_spots?: number;
  error?: string;
}

export interface CancellationResult {
  success: boolean;
  processed_waitlist: boolean;
  error?: string;
}

export interface WaitlistProcessResult {
  success: boolean;
  processed: number;
  remaining_spots: number;
  message?: string;
}

export interface WorkshopRegistrationDetailed {
  id: string;
  workshop_id: string;
  user_id: string;
  status: RegistrationStatus;
  waitlist_position: number | null;
  created_at: string;
  workshop_title: string;
  workshop_date: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

// ============================================
// Main Functions
// ============================================

/**
 * Registra un usuario en un workshop con validación automática de cupos
 * Si no hay cupos, lo agrega a lista de espera
 * NOTA: Implementación directa sin RPC para compatibilidad
 */
export async function registerForWorkshop(
  workshopId: string,
  userId: string
): Promise<RegistrationResult> {
  try {
    // 1. Verificar si ya está registrado
    const { data: existingReg } = await supabase
      .from('workshop_registrations')
      .select('id, status')
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)
      .in('status', ['confirmed', 'waitlist'])
      .single();

    if (existingReg) {
      return {
        success: false,
        error: 'Ya estás registrado en este workshop'
      };
    }

    // 2. Obtener info del workshop
    const { data: workshop, error: wsError } = await supabase
      .from('workshops')
      .select('id, total_spots')
      .eq('id', workshopId)
      .single();

    if (wsError || !workshop) {
      return {
        success: false,
        error: 'Workshop no encontrado'
      };
    }

    // 3. Contar confirmados actuales
    const { count: confirmedCount } = await supabase
      .from('workshop_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId)
      .eq('status', 'confirmed');

    const availableSpots = workshop.total_spots - (confirmedCount || 0);
    
    // 4. Determinar status según disponibilidad
    let status: RegistrationStatus;
    let waitlistPosition: number | null = null;

    if (availableSpots > 0) {
      status = 'confirmed';
    } else {
      status = 'waitlist';
      
      // Calcular posición en lista de espera
      const { count: waitlistCount } = await supabase
        .from('workshop_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('workshop_id', workshopId)
        .eq('status', 'waitlist');
      
      waitlistPosition = (waitlistCount || 0) + 1;
    }

    // 5. Crear registro
    const { data: newReg, error: insertError } = await supabase
      .from('workshop_registrations')
      .insert({
        workshop_id: workshopId,
        user_id: userId,
        status: status,
        waitlist_position: waitlistPosition
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting registration:', insertError);
      return {
        success: false,
        error: insertError.message
      };
    }

    return {
      success: true,
      status: status,
      registration_id: newReg.id,
      waitlist_position: waitlistPosition || undefined,
      available_spots: status === 'confirmed' ? availableSpots - 1 : 0
    };
  } catch (error) {
    console.error('Exception in registerForWorkshop:', error);
    return {
      success: false,
      error: 'Error al registrarse en el workshop'
    };
  }
}

/**
 * Cancela un registro de workshop
 * Si era confirmado, procesa automáticamente el siguiente en waitlist
 * NOTA: Implementación directa sin RPC para compatibilidad
 */
export async function cancelRegistration(
  registrationId: string
): Promise<CancellationResult> {
  try {
    // 1. Obtener info del registro
    const { data: registration, error: regError } = await supabase
      .from('workshop_registrations')
      .select('workshop_id, status')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return {
        success: false,
        processed_waitlist: false,
        error: 'Registro no encontrado'
      };
    }

    const wasConfirmed = registration.status === 'confirmed';
    const workshopId = registration.workshop_id;

    // 2. Actualizar a cancelled
    const { error: updateError } = await supabase
      .from('workshop_registrations')
      .update({ status: 'cancelled', waitlist_position: null })
      .eq('id', registrationId);

    if (updateError) {
      return {
        success: false,
        processed_waitlist: false,
        error: updateError.message
      };
    }

    // 3. Si era confirmado, promover al primero de la lista de espera
    let processedWaitlist = false;
    if (wasConfirmed) {
      const { data: nextInLine } = await supabase
        .from('workshop_registrations')
        .select('id')
        .eq('workshop_id', workshopId)
        .eq('status', 'waitlist')
        .order('waitlist_position', { ascending: true })
        .limit(1)
        .single();

      if (nextInLine) {
        await supabase
          .from('workshop_registrations')
          .update({ status: 'confirmed', waitlist_position: null })
          .eq('id', nextInLine.id);
        
        processedWaitlist = true;
        
        // Reordenar posiciones de waitlist
        const { data: remainingWaitlist } = await supabase
          .from('workshop_registrations')
          .select('id')
          .eq('workshop_id', workshopId)
          .eq('status', 'waitlist')
          .order('waitlist_position', { ascending: true });

        if (remainingWaitlist) {
          for (let i = 0; i < remainingWaitlist.length; i++) {
            await supabase
              .from('workshop_registrations')
              .update({ waitlist_position: i + 1 })
              .eq('id', remainingWaitlist[i].id);
          }
        }
      }
    }

    return {
      success: true,
      processed_waitlist: processedWaitlist
    };
  } catch (error) {
    console.error('Exception in cancelRegistration:', error);
    return {
      success: false,
      processed_waitlist: false,
      error: 'Error al cancelar inscripción'
    };
  }
}

/**
 * Obtiene información detallada de disponibilidad de un workshop
 * NOTA: Implementación directa sin RPC para compatibilidad
 */
export async function getWorkshopAvailability(
  workshopId: string
): Promise<WorkshopAvailability | null> {
  try {
    // Obtener info del workshop
    const { data: workshop, error: wsError } = await supabase
      .from('workshops')
      .select('id, title, total_spots')
      .eq('id', workshopId)
      .single();

    if (wsError || !workshop) {
      console.error('Error getting workshop:', wsError);
      return null;
    }

    // Contar confirmados
    const { count: confirmedCount } = await supabase
      .from('workshop_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId)
      .eq('status', 'confirmed');

    // Contar en lista de espera
    const { count: waitlistCount } = await supabase
      .from('workshop_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId)
      .eq('status', 'waitlist');

    const confirmed = confirmedCount || 0;
    const waitlist = waitlistCount || 0;
    const available = workshop.total_spots - confirmed;

    return {
      workshop_id: workshop.id,
      title: workshop.title,
      max_participants: workshop.total_spots,
      available_spots: Math.max(0, available),
      confirmed_count: confirmed,
      waitlist_count: waitlist,
      is_full: available <= 0
    };
  } catch (error) {
    console.error('Exception in getWorkshopAvailability:', error);
    return null;
  }
}

/**
 * Obtiene el registro de un usuario en un workshop específico
 */
export async function getUserWorkshopRegistration(
  workshopId: string,
  userId: string
): Promise<WorkshopRegistration | null> {
  try {
    const { data, error } = await supabase
      .from('workshop_registrations')
      .select('*')
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)
      .in('status', ['confirmed', 'waitlist'])
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No registration found
        return null;
      }
      console.error('Error getting user registration:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getUserWorkshopRegistration:', error);
    return null;
  }
}

/**
 * Obtiene la posición en lista de espera de un usuario
 */
export async function getWaitlistPosition(
  workshopId: string,
  userId: string
): Promise<number | null> {
  try {
    const registration = await getUserWorkshopRegistration(workshopId, userId);
    
    if (!registration || registration.status !== 'waitlist') {
      return null;
    }

    return registration.waitlist_position;
  } catch (error) {
    console.error('Exception in getWaitlistPosition:', error);
    return null;
  }
}

/**
 * Obtiene todos los workshops con su información de disponibilidad
 */
export async function getAllWorkshopsWithAvailability() {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        *,
        registrations:workshop_registrations(count)
      `)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error getting workshops:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Exception in getAllWorkshopsWithAvailability:', error);
    return [];
  }
}

// ============================================
// Admin Functions
// ============================================

/**
 * Procesa manualmente la lista de espera de un workshop (Admin only)
 * Confirma tantos usuarios como cupos disponibles haya
 * NOTA: Implementación directa sin RPC para compatibilidad
 */
export async function processWaitlist(
  workshopId: string
): Promise<WaitlistProcessResult> {
  try {
    // 1. Obtener info del workshop
    const { data: workshop, error: wsError } = await supabase
      .from('workshops')
      .select('total_spots')
      .eq('id', workshopId)
      .single();

    if (wsError || !workshop) {
      return {
        success: false,
        processed: 0,
        remaining_spots: 0,
        message: 'Workshop no encontrado'
      };
    }

    // 2. Contar confirmados actuales
    const { count: confirmedCount } = await supabase
      .from('workshop_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId)
      .eq('status', 'confirmed');

    const availableSpots = workshop.total_spots - (confirmedCount || 0);

    if (availableSpots <= 0) {
      return {
        success: true,
        processed: 0,
        remaining_spots: 0,
        message: 'No hay cupos disponibles'
      };
    }

    // 3. Obtener usuarios en espera ordenados por posición
    const { data: waitlistUsers, error: wlError } = await supabase
      .from('workshop_registrations')
      .select('id')
      .eq('workshop_id', workshopId)
      .eq('status', 'waitlist')
      .order('waitlist_position', { ascending: true })
      .limit(availableSpots);

    if (wlError || !waitlistUsers || waitlistUsers.length === 0) {
      return {
        success: true,
        processed: 0,
        remaining_spots: availableSpots,
        message: 'No hay usuarios en lista de espera'
      };
    }

    // 4. Confirmar usuarios
    const idsToConfirm = waitlistUsers.map(u => u.id);
    const { error: updateError } = await supabase
      .from('workshop_registrations')
      .update({ status: 'confirmed', waitlist_position: null })
      .in('id', idsToConfirm);

    if (updateError) {
      return {
        success: false,
        processed: 0,
        remaining_spots: availableSpots,
        message: updateError.message
      };
    }

    // 5. Reordenar posiciones restantes
    const { data: remainingWaitlist } = await supabase
      .from('workshop_registrations')
      .select('id')
      .eq('workshop_id', workshopId)
      .eq('status', 'waitlist')
      .order('waitlist_position', { ascending: true });

    if (remainingWaitlist) {
      for (let i = 0; i < remainingWaitlist.length; i++) {
        await supabase
          .from('workshop_registrations')
          .update({ waitlist_position: i + 1 })
          .eq('id', remainingWaitlist[i].id);
      }
    }

    return {
      success: true,
      processed: idsToConfirm.length,
      remaining_spots: availableSpots - idsToConfirm.length,
      message: `${idsToConfirm.length} usuarios confirmados`
    };
  } catch (error) {
    console.error('Exception in processWaitlist:', error);
    return {
      success: false,
      processed: 0,
      remaining_spots: 0,
      message: 'Error al procesar lista de espera'
    };
  }
}

/**
 * Obtiene todos los registros de un workshop con información detallada (Admin)
 */
export async function getWorkshopRegistrationsDetailed(
  workshopId: string
): Promise<WorkshopRegistrationDetailed[]> {
  try {
    const { data, error } = await supabase
      .from('workshop_registrations_detailed')
      .select('*')
      .eq('workshop_id', workshopId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting detailed registrations:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Exception in getWorkshopRegistrationsDetailed:', error);
    return [];
  }
}

/**
 * Obtiene estadísticas de un workshop (Admin)
 */
export async function getWorkshopStats(workshopId: string) {
  try {
    const availability = await getWorkshopAvailability(workshopId);
    const registrations = await getWorkshopRegistrationsDetailed(workshopId);

    if (!availability) {
      return null;
    }

    const confirmedUsers = registrations.filter(r => r.status === 'confirmed');
    const waitlistUsers = registrations.filter(r => r.status === 'waitlist');
    const cancelledUsers = registrations.filter(r => r.status === 'cancelled');

    return {
      ...availability,
      confirmed_users: confirmedUsers,
      waitlist_users: waitlistUsers,
      cancelled_count: cancelledUsers.length,
      fill_percentage: (availability.confirmed_count / availability.max_participants) * 100
    };
  } catch (error) {
    console.error('Exception in getWorkshopStats:', error);
    return null;
  }
}

/**
 * Actualiza manualmente los cupos máximos de un workshop (Admin)
 */
export async function updateWorkshopCapacity(
  workshopId: string,
  maxParticipants: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('workshops')
      .update({ 
        max_participants: maxParticipants,
        // Recalcular available_spots basado en confirmed registrations
        available_spots: maxParticipants
      })
      .eq('id', workshopId);

    if (error) {
      console.error('Error updating workshop capacity:', error);
      return false;
    }

    // Trigger recalculará los cupos disponibles automáticamente
    return true;
  } catch (error) {
    console.error('Exception in updateWorkshopCapacity:', error);
    return false;
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Verifica si un usuario puede registrarse en un workshop
 */
export async function canUserRegister(
  workshopId: string,
  userId: string
): Promise<{ canRegister: boolean; reason?: string }> {
  try {
    // Verificar si ya está registrado
    const existingRegistration = await getUserWorkshopRegistration(workshopId, userId);
    
    if (existingRegistration) {
      if (existingRegistration.status === 'confirmed') {
        return { canRegister: false, reason: 'Ya estás confirmado en este workshop' };
      }
      if (existingRegistration.status === 'waitlist') {
        return { canRegister: false, reason: 'Ya estás en la lista de espera' };
      }
    }

    return { canRegister: true };
  } catch (error) {
    console.error('Exception in canUserRegister:', error);
    return { canRegister: false, reason: 'Error al verificar registro' };
  }
}

/**
 * Formatea el status para mostrar al usuario
 */
export function formatRegistrationStatus(status: RegistrationStatus): string {
  const statusMap = {
    confirmed: 'Confirmado',
    waitlist: 'Lista de Espera',
    cancelled: 'Cancelado'
  };

  return statusMap[status] || status;
}

/**
 * Obtiene el color del badge según el status
 */
export function getStatusColor(status: RegistrationStatus): string {
  const colorMap = {
    confirmed: 'green',
    waitlist: 'yellow',
    cancelled: 'gray'
  };

  return colorMap[status] || 'gray';
}

/**
 * Formatea mensaje de disponibilidad
 */
export function formatAvailabilityMessage(availability: WorkshopAvailability): string {
  if (availability.is_full) {
    if (availability.waitlist_count > 0) {
      return `Lleno (${availability.waitlist_count} en lista de espera)`;
    }
    return 'Lleno';
  }

  const spotsText = availability.available_spots === 1 ? 'cupo' : 'cupos';
  return `${availability.available_spots} ${spotsText} disponibles`;
}

/**
 * Calcula porcentaje de ocupación
 */
export function calculateOccupancy(availability: WorkshopAvailability): number {
  return Math.round((availability.confirmed_count / availability.max_participants) * 100);
}
