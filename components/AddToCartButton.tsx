import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { ShoppingCart, Check } from 'lucide-react';
import { getOrCreateActiveCart, addItemToCart } from '../utils/cartService';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  price: number;
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
  onSuccess?: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productName,
  productImage,
  productCategory,
  price,
  variant = 'primary',
  className = '',
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Redirect to login
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Get or create active cart
      const cart = await getOrCreateActiveCart(session.user.id, session.user.email || '');
      
      if (!cart) {
        alert('Error al crear el carrito. Por favor intenta nuevamente.');
        setLoading(false);
        return;
      }

      // Add item to cart
      const item = await addItemToCart(
        cart.id,
        productId,
        productName,
        productImage,
        productCategory,
        price,
        1
      );

      if (item) {
        setAdded(true);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Reset after 2 seconds
        setTimeout(() => {
          setAdded(false);
        }, 2000);
      } else {
        alert('Error al agregar al carrito. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={loading || added}
        className={`p-2 rounded-full bg-nikon-yellow hover:bg-yellow-500 text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title={added ? 'Agregado al carrito' : 'Agregar al carrito'}
      >
        {added ? (
          <Check className="w-5 h-5" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={loading || added}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-nikon-surface border border-nikon-border hover:border-nikon-yellow text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Agregando...</span>
          </>
        ) : added ? (
          <>
            <Check className="w-4 h-4" />
            <span>Agregado</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Agregar al Carrito</span>
          </>
        )}
      </button>
    );
  }

  // Primary variant (default)
  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || added}
      className={`flex items-center justify-center gap-2 px-6 py-3 bg-nikon-yellow hover:bg-yellow-500 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <span>Agregando...</span>
        </>
      ) : added ? (
        <>
          <Check className="w-5 h-5" />
          <span>¡Agregado!</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          <span>Agregar al Carrito</span>
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
