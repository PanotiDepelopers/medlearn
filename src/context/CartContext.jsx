import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  const loadCart = async () => {
    try {
      const data = await cartAPI.getCart();
      setCart(data);
      return data;
    } catch (error) {
      console.error('Failed to load cart:', error);
      return null;
    }
  };

  const addToCart = async (item) => {
    setLoading(true);
    try {
      const data = await cartAPI.addItem(item);
      if (data.success) {
        setCart(data.cart);
        setLastAdded(item);
        // Use global toast or custom event
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: `✅ Added "${item.name}" to cart!`, type: 'success' }
        }));
        return data;
      } else {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: data.message || 'Item already in cart', type: 'error' }
        }));
        return null;
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: error.message || 'Failed to add item', type: 'error' }
      }));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    try {
      const data = await cartAPI.removeItem(itemId);
      if (data.success) {
        setCart(data.cart);
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Item removed from cart', type: 'info' }
        }));
        return data;
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: error.message || 'Failed to remove item', type: 'error' }
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (items, total) => {
    setLoading(true);
    try {
      const data = await cartAPI.checkout(items, total);
      if (data.success) {
        setCart({ items: [], total: 0 });
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: '✅ Purchase request submitted for approval!', type: 'success' }
        }));
        
        // Update user data
        if (data.user) {
          const currentUser = JSON.parse(localStorage.getItem('medlearn_user') || '{}');
          currentUser.purchases = data.user.purchases || [];
          currentUser.hasSubscription = data.user.hasSubscription || false;
          currentUser.subscription = data.user.subscription || {};
          localStorage.setItem('medlearn_user', JSON.stringify(currentUser));
        }
        return data;
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: error.message || 'Checkout failed', type: 'error' }
      }));
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    loadCart,
    addToCart,
    removeFromCart,
    checkout,
    cartCount: cart.items?.length || 0,
    cartTotal: cart.total || 0,
    lastAdded
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};