import React from 'react';

const Spinner = ({ size = 'medium' }) => {
  const sizes = {
    small: '20px',
    medium: '30px',
    large: '40px'
  };

  return (
    <div 
      className="spinner" 
      style={{ 
        width: sizes[size] || sizes.medium,
        height: sizes[size] || sizes.medium,
        border: '3px solid rgba(99, 102, 241, 0.3)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        display: 'inline-block'
      }}
    />
  );
};

export default Spinner;