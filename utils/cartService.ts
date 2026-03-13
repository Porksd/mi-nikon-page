import { supabase } from './supabaseClient';
import { ShoppingCart, CartItem, CartNotification } from '../types';

// =====================================================
// SHOPPING CART CRUD OPERATIONS
// =====================================================

/**
 * Get user's active shopping cart (or create one if doesn't exist)
 */
export async function getOrCreateActiveCart(userId: string, email: string): Promise<ShoppingCart | null> {
  try {
    // First try to get active cart
    const { data: existingCart, error: fetchError } = await supabase
      .from('shopping_carts')
      .select(`
        *,
        items:cart_items(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existingCart) {
      return existingCart as ShoppingCart;
    }

    // If no active cart, create one
    const { data: newCart, error: createError } = await supabase
      .from('shopping_carts')
      .insert({
        user_id: userId,
        customer_email: email,
        status: 'active',
        total_value: 0,
        items_count: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating cart:', createError);
      return null;
    }

    return { ...newCart, items: [] } as ShoppingCart;
  } catch (error) {
    console.error('Error in getOrCreateActiveCart:', error);
    return null;
  }
}

/**
 * Get all carts for a user (including completed/abandoned)
 */
export async function getUserCarts(userId: string): Promise<ShoppingCart[]> {
  const { data, error } = await supabase
    .from('shopping_carts')
    .select(`
      *,
      items:cart_items(*)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching user carts:', error);
    return [];
  }

  return data as ShoppingCart[];
}

/**
 * Get cart by ID with all items
 */
export async function getCartById(cartId: string): Promise<ShoppingCart | null> {
  const { data, error } = await supabase
    .from('shopping_carts')
    .select(`
      *,
      items:cart_items(*)
    `)
    .eq('id', cartId)
    .single();

  if (error) {
    console.error('Error fetching cart:', error);
    return null;
  }

  return data as ShoppingCart;
}

// =====================================================
// CART ITEM OPERATIONS
// =====================================================

/**
 * Add item to cart
 */
export async function addItemToCart(
  cartId: string,
  productId: string,
  productName: string,
  productImage: string,
  productCategory: string,
  unitPrice: number,
  quantity: number = 1
): Promise<CartItem | null> {
  try {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity
      const { data: updatedItem, error } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;
      return updatedItem as CartItem;
    }

    // Insert new item
    const { data: newItem, error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: productId,
        product_name: productName,
        product_image: productImage,
        product_category: productCategory,
        quantity,
        unit_price: unitPrice
      })
      .select()
      .single();

    if (error) throw error;

    // Update cart's last_viewed_at
    await updateCartTimestamp(cartId);

    return newItem as CartItem;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return null;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<boolean> {
  if (quantity <= 0) {
    return removeItemFromCart(itemId);
  }

  const { error } = await supabase
    .from('cart_items')
    .update({
      quantity,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId);

  return !error;
}

/**
 * Remove item from cart
 */
export async function removeItemFromCart(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  return !error;
}

/**
 * Clear all items from cart
 */
export async function clearCart(cartId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);

  return !error;
}

// =====================================================
// CART STATUS OPERATIONS
// =====================================================

/**
 * Mark cart as completed
 */
export async function completeCart(cartId: string): Promise<boolean> {
  const { error } = await supabase
    .from('shopping_carts')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', cartId);

  return !error;
}

/**
 * Mark cart as abandoned
 */
export async function markCartAsAbandoned(cartId: string): Promise<boolean> {
  const { error } = await supabase
    .from('shopping_carts')
    .update({
      status: 'abandoned',
      abandoned_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', cartId);

  return !error;
}

/**
 * Update cart timestamp (to track user activity)
 */
export async function updateCartTimestamp(cartId: string): Promise<boolean> {
  const { error } = await supabase
    .from('shopping_carts')
    .update({
      last_viewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', cartId);

  return !error;
}

// =====================================================
// CART NOTIFICATIONS
// =====================================================

/**
 * Get cart notifications for user
 */
export async function getCartNotifications(userId: string): Promise<CartNotification[]> {
  const { data, error } = await supabase
    .from('cart_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cart notifications:', error);
    return [];
  }

  return data as CartNotification[];
}

/**
 * Create cart notification
 */
export async function createCartNotification(
  cartId: string,
  userId: string,
  type: CartNotification['notification_type'],
  title: string,
  message: string
): Promise<CartNotification | null> {
  const { data, error } = await supabase
    .from('cart_notifications')
    .insert({
      cart_id: cartId,
      user_id: userId,
      notification_type: type,
      title,
      message,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  return data as CartNotification;
}

/**
 * Mark notification as viewed
 */
export async function markNotificationAsViewed(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_notifications')
    .update({
      viewed_at: new Date().toISOString(),
      status: 'viewed'
    })
    .eq('id', notificationId);

  return !error;
}

/**
 * Mark notification as clicked
 */
export async function markNotificationAsClicked(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('cart_notifications')
    .update({
      clicked_at: new Date().toISOString(),
      status: 'clicked'
    })
    .eq('id', notificationId);

  return !error;
}

// =====================================================
// ADMIN / ANALYTICS FUNCTIONS
// =====================================================

/**
 * Get abandoned carts summary (admin view)
 */
export async function getAbandonedCartsSummary() {
  const { data, error } = await supabase
    .from('abandoned_carts_summary')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching abandoned carts:', error);
    return [];
  }

  return data;
}

/**
 * Get cart analytics
 */
export async function getCartAnalytics() {
  try {
    // Total active carts
    const { count: activeCarts } = await supabase
      .from('shopping_carts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total abandoned carts
    const { count: abandonedCarts } = await supabase
      .from('shopping_carts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'abandoned');

    // Total completed carts
    const { count: completedCarts } = await supabase
      .from('shopping_carts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Total value in active carts
    const { data: activeValue } = await supabase
      .from('shopping_carts')
      .select('total_value')
      .eq('status', 'active');

    const totalActiveValue = activeValue?.reduce((sum, cart) => sum + (cart.total_value || 0), 0) || 0;

    // Total value in abandoned carts
    const { data: abandonedValue } = await supabase
      .from('shopping_carts')
      .select('total_value')
      .eq('status', 'abandoned');

    const totalAbandonedValue = abandonedValue?.reduce((sum, cart) => sum + (cart.total_value || 0), 0) || 0;

    return {
      activeCarts: activeCarts || 0,
      abandonedCarts: abandonedCarts || 0,
      completedCarts: completedCarts || 0,
      totalActiveValue,
      totalAbandonedValue,
      recoveryPotential: totalAbandonedValue,
      conversionRate: completedCarts && (activeCarts || 0) + (completedCarts || 0)
        ? ((completedCarts / ((activeCarts || 0) + completedCarts)) * 100).toFixed(1)
        : 0
    };
  } catch (error) {
    console.error('Error fetching cart analytics:', error);
    return null;
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format price as Chilean Pesos
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(price);
}

/**
 * Calculate hours since cart was last updated
 */
export function getHoursSinceUpdate(updatedAt: string): number {
  const now = new Date();
  const updated = new Date(updatedAt);
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60));
}

/**
 * Get notification message based on cart age
 */
export function getAbandonmentMessage(hoursAbandoned: number, itemsCount: number, totalValue: number): {
  title: string;
  message: string;
  type: CartNotification['notification_type'];
} {
  const formattedPrice = formatPrice(totalValue);
  
  if (hoursAbandoned < 1) {
    return {
      title: '🛒 Tienes productos en tu carrito',
      message: `${itemsCount} producto${itemsCount > 1 ? 's' : ''} esperando por ti. Total: ${formattedPrice}`,
      type: 'reminder_1h'
    };
  } else if (hoursAbandoned < 24) {
    return {
      title: '⏰ ¡No olvides tu carrito!',
      message: `Tienes ${itemsCount} producto${itemsCount > 1 ? 's' : ''} guardado${itemsCount > 1 ? 's' : ''} (${formattedPrice}). ¿Listo para finalizar tu compra?`,
      type: 'reminder_1h'
    };
  } else if (hoursAbandoned < 72) {
    return {
      title: '🎁 Tu carrito te extraña',
      message: `${itemsCount} producto${itemsCount > 1 ? 's' : ''} por ${formattedPrice}. Completa tu compra y gana puntos extras.`,
      type: 'reminder_24h'
    };
  } else if (hoursAbandoned < 168) {
    return {
      title: '💰 Oferta especial para ti',
      message: `Tu carrito de ${formattedPrice} está esperando. ¡Complétalo hoy y obtén beneficios exclusivos!`,
      type: 'reminder_3d'
    };
  } else {
    return {
      title: '⚠️ Última oportunidad',
      message: `Tu carrito expira pronto. ${itemsCount} productos por ${formattedPrice}. ¡No los pierdas!`,
      type: 'reminder_7d'
    };
  }
}
