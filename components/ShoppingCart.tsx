import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { ShoppingCart as Cart, CartItem } from '../types';
import {
  getOrCreateActiveCart,
  updateCartItemQuantity,
  removeItemFromCart,
  completeCart,
  formatPrice,
  getHoursSinceUpdate
} from '../utils/cartService';
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle, Package, Clock, ExternalLink } from 'lucide-react';

const ShoppingCartPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Cart | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState(false);

  useEffect(() => {
    checkAuthAndLoadCart();
  }, []);

  const checkAuthAndLoadCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/login');
      return;
    }

    await loadCart(session.user.id, session.user.email || '');
  };

  const loadCart = async (userId: string, email: string) => {
    setLoading(true);
    const activeCart = await getOrCreateActiveCart(userId, email);
    setCart(activeCart);
    setLoading(false);
  };

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    if (!cart) return;
    
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    setUpdating(item.id);
    const success = await updateCartItemQuantity(item.id, newQuantity);
    
    if (success) {
      // Reload cart to get updated totals
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadCart(session.user.id, session.user.email || '');
      }
    }
    setUpdating(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!cart || !confirm('¿Eliminar este producto del carrito?')) return;

    setUpdating(itemId);
    const success = await removeItemFromCart(itemId);
    
    if (success) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadCart(session.user.id, session.user.email || '');
      }
    }
    setUpdating(null);
  };

  const handleCheckout = () => {
    setCheckoutMode(true);
  };

  const handleCompleteCheckout = async () => {
    if (!cart) return;

    // In production, this would integrate with payment gateway
    const success = await completeCart(cart.id);
    
    if (success) {
      alert('¡Compra completada! Serás redirigido a Nikon Center para finalizar el pago.');
      window.open('https://www.nikoncenter.cl/carrito', '_blank');
      navigate('/account');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nikon-yellow mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-12">
        <div className="bg-nikon-surface border border-nikon-border rounded-xl p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold text-white mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-400 mb-6">Explora nuestro catálogo y agrega productos para empezar tu compra.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/recommendations')}
              className="px-6 py-3 bg-nikon-yellow hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors"
            >
              Ver Recomendaciones
            </button>
            <button
              onClick={() => navigate('/gear')}
              className="px-6 py-3 bg-nikon-surface border border-nikon-border hover:border-white text-white font-medium rounded-lg transition-colors"
            >
              Explorar Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hoursAbandoned = getHoursSinceUpdate(cart.updated_at);

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="w-8 h-8 text-nikon-yellow" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Mi Carrito</h1>
        </div>
        <p className="text-gray-400">
          {cart.items_count} producto{cart.items_count !== 1 ? 's' : ''} · Total: {formatPrice(cart.total_value)}
        </p>
      </div>

      {/* Abandonment Warning */}
      {hoursAbandoned >= 1 && cart.status === 'active' && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-yellow-500 mb-1">⏰ Tu carrito está esperando</h3>
            <p className="text-sm text-gray-300">
              Hace {hoursAbandoned} hora{hoursAbandoned !== 1 ? 's' : ''} que agregaste productos. 
              {hoursAbandoned > 48 && <strong className="text-yellow-500"> ¡Completa tu compra antes de que expiren!</strong>}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Productos</h2>
            
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-black/30 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-black rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-nikon-yellow uppercase tracking-wider mb-1">
                          {item.product_category}
                        </p>
                        <h3 className="font-bold text-white text-sm md:text-base leading-tight">
                          {item.product_name}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updating === item.id}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-nikon-surface border border-gray-700 hover:border-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="w-12 text-center font-bold text-white">
                          {updating === item.id ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          disabled={updating === item.id}
                          className="w-8 h-8 flex items-center justify-center bg-nikon-surface border border-gray-700 hover:border-white disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {formatPrice(item.unit_price)} c/u
                        </p>
                        <p className="font-bold text-white text-lg">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-nikon-surface border border-nikon-border rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">Resumen</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-800">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({cart.items_count} productos)</span>
                <span>{formatPrice(cart.total_value)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Envío</span>
                <span className="text-green-500">Gratis</span>
              </div>
              {hoursAbandoned > 72 && (
                <div className="flex justify-between text-nikon-yellow font-medium">
                  <span>Descuento especial 🎁</span>
                  <span>-{formatPrice(cart.total_value * 0.05)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-6 text-xl font-bold">
              <span className="text-white">Total</span>
              <span className="text-nikon-yellow">
                {formatPrice(hoursAbandoned > 72 ? cart.total_value * 0.95 : cart.total_value)}
              </span>
            </div>

            {!checkoutMode ? (
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-nikon-yellow hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
              >
                Continuar Compra
                <ExternalLink className="w-5 h-5" />
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-medium text-white mb-1">Redireccionamiento a Nikon Center</p>
                      <p>Serás llevado a la tienda oficial para completar tu pago de forma segura.</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleCompleteCheckout}
                  className="w-full py-4 bg-nikon-yellow hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors"
                >
                  Ir a Nikon Center Chile
                </button>
                
                <button
                  onClick={() => setCheckoutMode(false)}
                  className="w-full py-3 bg-transparent border border-gray-700 hover:border-white text-white font-medium rounded-lg transition-colors"
                >
                  Volver
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Compra 100% segura. Productos oficiales con garantía. Envío gratis a todo Chile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
