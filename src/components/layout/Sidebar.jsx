import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    // Listen for sidebar toggle events
    const handleToggle = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('toggleSidebar', handleToggle);

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        // Also update the overlay
        window.dispatchEvent(new CustomEvent('overlayUpdate', { detail: { open: false } }));
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Close on outside click
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768 && 
          sidebarRef.current && 
          !sidebarRef.current.contains(e.target) && 
          isOpen) {
        // Check if click was on the menu button
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn && !menuBtn.contains(e.target)) {
          setIsOpen(false);
          window.dispatchEvent(new CustomEvent('overlayUpdate', { detail: { open: false } }));
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Close on resize to desktop
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('overlayUpdate', { detail: { open: false } }));
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('toggleSidebar', handleToggle);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const closeSidebar = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('overlayUpdate', { detail: { open: false } }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeSidebar();
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2><i className="fas fa-heartbeat"></i> MedLearn</h2>
            {/* Close button - only visible on mobile */}
            <button 
              className="sidebar-close-btn"
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="student-info">
            👤 {user?.username} • {user?.studentId}
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/buy-courses" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-shopping-bag"></i> Buy Courses
          </NavLink>
          <NavLink 
            to="/my-courses" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-book-open"></i> My Courses
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </NavLink>
          <NavLink 
            to="/purchases" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
          >
            <i className="fas fa-receipt"></i> Purchases
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;