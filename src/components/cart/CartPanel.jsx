import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';

const CartPanel = () => {
  const { cart, checkout } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Listen for cart toggle events
  useEffect(() => {
    const handleCartToggle = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('toggleCart', handleCartToggle);
    
    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Close on outside click
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('toggleCart', handleCartToggle);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  const handleCheckout = async () => {
    if (cart.items?.length === 0) return;
    await checkout(cart.items, cart.total);
    setIsOpen(false);
  };

  return (
    <div className={`cart-panel ${isOpen ? 'open' : ''}`} ref={panelRef}>
      <div className="cart-panel-header">
        <h3><i className="fas fa-shopping-cart"></i> Your Cart</h3>
        <button className="cart-close" onClick={handleClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="cart-items">
        {!cart.items?.length ? (
          <div className="cart-empty">
            <i className="fas fa-shopping-bag"></i>
            <p>Your cart is empty</p>
            <span style={{ fontSize: '14px' }}>Browse courses and add items to your cart</span>
          </div>
        ) : (
          cart.items.map((item) => (
            <CartItem key={item.item_id} item={item} />
          ))
        )}
      </div>
      <div className="cart-footer">
        <div className="cart-total">
          <span>Total</span>
          <span>${(cart.total || 0).toFixed(2)}</span>
        </div>
        <button 
          className="btn-checkout" 
          disabled={!cart.items?.length}
          onClick={handleCheckout}
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPanel;