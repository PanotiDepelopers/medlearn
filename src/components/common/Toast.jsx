import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  };

  const colors = {
    success: 'var(--success)',
    error: 'var(--danger)',
    info: 'var(--primary)'
  };

  return (
    <div className={`toast ${type}`} style={{ 
      animation: 'slideIn 0.3s ease',
      opacity: 1,
      transition: 'opacity 0.3s ease'
    }}>
      <i className={icons[type] || icons.info} style={{ 
        fontSize: '20px', 
        color: colors[type] || colors.info 
      }} />
      <span>{message}</span>
    </div>
  );
};

// Toast Container component with event listener
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    // Listen for toast events
    const handleToast = (e) => {
      const { message, type, duration } = e.detail;
      addToast(message, type, duration);
    };

    window.addEventListener('showToast', handleToast);
    
    // Also keep the window.showToast for backward compatibility
    window.showToast = (message, type, duration) => {
      addToast(message, type, duration);
    };

    return () => {
      window.removeEventListener('showToast', handleToast);
      delete window.showToast;
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;