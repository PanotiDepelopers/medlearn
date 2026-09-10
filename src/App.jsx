import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Login from './components/auth/Login';
import MainLayout from './components/layout/MainLayout';
import CatalogGrid from './components/catalog/CatalogGrid';
import MyCourses from './components/dashboard/MyCourses';
import Purchases from './components/dashboard/Purchases';
import PrivateRoute from './components/common/PrivateRoute';

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
              <Route index element={<CatalogGrid />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="purchases" element={<Purchases />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;