import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './components/auth/Login';
import MainLayout from './components/layout/MainLayout';
import CatalogGrid from './components/catalog/CatalogGrid';
import MyCourses from './components/dashboard/MyCourses';
import Purchases from './components/dashboard/Purchases';
import PrivateRoute from './components/common/PrivateRoute';
import { getLandingRoute } from './utils/authHelpers';
import Spinner from './components/common/Spinner';

/**
 * SmartHomeRedirect: 
 * When user hits "/", redirect to /my-courses if they have purchases
 */
const SmartHomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spinner size="large" />
      </div>
    );
  }

  const landingRoute = getLandingRoute(user);
  
  // If landing is /my-courses, redirect there
  if (landingRoute === '/my-courses') {
    return <Navigate to="/my-courses" replace />;
  }
  
  // Otherwise show the catalog
  return <CatalogGrid />;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              padding: '16px 24px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            }
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<MainLayout />}>
              {/* Smart redirect for homepage */}
              <Route index element={<SmartHomeRedirect />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="purchases" element={<Purchases />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;