import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CatalogCard = ({ 
  id, name, price, description, type, duration, meta, 
  isApproved, isPending, onViewDetail 
}) => {
  const { addToCart, removeFromCart, cart, loading } = useCart();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const isInCart = cart.items?.some(item => item.item_id === String(id));
  const isOwned = user?.purchases?.some(p => 
    p.items?.some(item => item.item_id === String(id) && p.status === 'approved')
  );

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOwned || isApproved || isPending || isAdding) return;
    
    setIsAdding(true);
    try {
      await addToCart({
        item_id: String(id),
        item_type: type,
        name: name,
        price: parseFloat(price) || 0,
        duration: duration || '1 month'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFromCart = async (e) => {
    e.stopPropagation();
    if (isRemoving) return;
    
    setIsRemoving(true);
    try {
      await removeFromCart(String(id));
    } finally {
      setIsRemoving(false);
    }
  };

  const getButton = () => {
    if (isOwned || isApproved) {
      return <button className="btn-success" disabled>✅ Purchased</button>;
    }
    if (isPending) {
      return <button className="btn-warning" disabled>⏳ Pending Approval</button>;
    }
    if (isInCart) {
      return (
        <button 
          className="btn-danger" 
          onClick={handleRemoveFromCart}
          disabled={loading || isRemoving}
        >
          {isRemoving ? 'Removing...' : '🗑️ Remove from Cart'}
        </button>
      );
    }
    return (
      <button 
        className="btn-primary" 
        onClick={handleAddToCart}
        disabled={loading || isAdding}
      >
        {isAdding ? 'Adding...' : '🛒 Add to Cart'}
      </button>
    );
  };

  return (
    <div className="catalog-card" onClick={() => onViewDetail(id, type)}>
      <div className="card-header">
        <h3>{name}</h3>
        <span className="price-tag">${(parseFloat(price) || 0).toFixed(2)}</span>
      </div>
      <div className="card-body">
        <p>{description || 'No description available'}</p>
      </div>
      <div className="card-meta">
        {meta.map((m, i) => <span key={i}>{m}</span>)}
      </div>
      <div className="card-actions">
        {getButton()}
      </div>
    </div>
  );
};

export default CatalogCard;