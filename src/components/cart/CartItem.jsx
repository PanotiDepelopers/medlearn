import React from 'react';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { removeFromCart } = useCart();

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h4>{item.name}</h4>
        <p>{item.item_type === 'package' ? '📦 Package' : '📚 Course'} • {item.duration}</p>
      </div>
      <div className="cart-item-actions">
        <span className="price">${(item.price || 0).toFixed(2)}</span>
        <button 
          className="cart-item-remove" 
          onClick={() => removeFromCart(item.item_id)}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default CartItem;