import { supabase } from './supabaseClient';

export interface SerialNumber {
  id: string;
  serial_number: string;
  product_id: string | null;
  product_name: string | null;
  user_id: string | null;
  status: 'available' | 'registered';
  registered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SerialCheckResult {
  exists: boolean;
  available: boolean;
  status?: string;
  product_id?: string;
  product_name?: string;
  message: string;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  message: string;
  data?: {
    serial_number: string;
    product_id: string;
    product_name: string;
    registered_at: string;
  };
}

/**
 * Check if a serial number exists and is available for registration
 */
export async function checkSerialNumber(serialNumber: string): Promise<SerialCheckResult> {
  try {
    const { data, error } = await supabase.rpc('check_serial_number', {
      p_serial_number: serialNumber.trim().toUpperCase()
    });

    if (error) throw error;

    return data as SerialCheckResult;
  } catch (error) {
    console.error('Error checking serial number:', error);
    return {
      exists: false,
      available: false,
      message: 'Error al verificar el número de serie'
    };
  }
}

/**
 * Register a serial number to the current user
 */
export async function registerSerialNumber(
  serialNumber: string,
  userId: string,
  productId?: string,
  productName?: string
): Promise<RegisterResult> {
  try {
    const { data, error } = await supabase.rpc('register_serial_number', {
      p_serial_number: serialNumber.trim().toUpperCase(),
      p_user_id: userId,
      p_product_id: productId || null,
      p_product_name: productName || null
    });

    if (error) throw error;

    return data as RegisterResult;
  } catch (error) {
    console.error('Error registering serial number:', error);
    return {
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Error al registrar el producto. Intenta nuevamente.'
    };
  }
}

/**
 * Get all serial numbers registered by a user
 */
export async function getUserRegisteredSerials(userId: string): Promise<SerialNumber[]> {
  try {
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'registered')
      .order('registered_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching user serials:', error);
    return [];
  }
}

/**
 * Check if a specific product is registered for a user
 */
export async function isProductRegistered(userId: string, productId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('status', 'registered')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return !!data;
  } catch (error) {
    console.error('Error checking product registration:', error);
    return false;
  }
}

/**
 * Get registration statistics (admin only)
 */
export async function getSerialNumbersStats() {
  try {
    const { data, error } = await supabase
      .from('serial_numbers_stats')
      .select('*')
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching serial stats:', error);
    return null;
  }
}

/**
 * Get serial number by product and user (for display purposes)
 */
export async function getSerialByProduct(userId: string, productId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('serial_numbers')
      .select('serial_number')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('status', 'registered')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data?.serial_number || null;
  } catch (error) {
    console.error('Error fetching serial for product:', error);
    return null;
  }
}
