import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();

  const toggleCart = () => {
    window.dispatchEvent(new CustomEvent('toggleCart'));
  };

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggleSidebar'));
  };

  return (
    <div className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mobile menu button - ALWAYS visible on mobile */}
        <button 
          className="mobile-menu-btn" 
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'white',
            border: 'none',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow)',
            transition: 'var(--transition)',
            color: 'var(--dark)'
          }}
        >
          <i className="fas fa-bars"></i>
        </button>
        <h1>📚 Course Catalog</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button className="cart-btn" onClick={toggleCart}>
          <i className="fas fa-shopping-cart"></i>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
        <div className="user-info">
          <div className="avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
          <span className="username">{user?.username || 'User'}</span>
          <span className={`subscription-badge ${user?.hasSubscription ? 'active' : 'inactive'}`}>
            {user?.hasSubscription ? '✅ Active Subscription' : '⚠️ No Subscription'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;