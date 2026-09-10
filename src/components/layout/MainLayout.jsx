import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CartPanel from '../cart/CartPanel';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Listen for sidebar toggle
    const handleToggle = () => {
      setSidebarOpen(prev => !prev);
    };

    // Listen for overlay updates from sidebar
    const handleOverlayUpdate = (e) => {
      setSidebarOpen(e.detail.open);
    };

    window.addEventListener('toggleSidebar', handleToggle);
    window.addEventListener('overlayUpdate', handleOverlayUpdate);

    return () => {
      window.removeEventListener('toggleSidebar', handleToggle);
      window.removeEventListener('overlayUpdate', handleOverlayUpdate);
    };
  }, []);

  const closeSidebar = () => {
    setSidebarOpen(false);
    window.dispatchEvent(new CustomEvent('overlayUpdate', { detail: { open: false } }));
  };

  return (
    <div className="app-container active">
      {/* Overlay for mobile */}
      <div 
        className={`overlay ${sidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      />
      
      <Sidebar />
      <main className="main-content">
        <Header />
        <Outlet />
      </main>
      <CartPanel />
    </div>
  );
};

export default MainLayout;