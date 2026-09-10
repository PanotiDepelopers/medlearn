import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api';

// Create context
const AuthContext = createContext(null);

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check auth (can be called manually)
  const checkAuth = async () => {
    const storedToken = localStorage.getItem('medlearn_token');
    const storedUser = localStorage.getItem('medlearn_user');
    
    console.log('🔍 Checking auth...');
    console.log('📦 Stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'null');
    
    if (storedToken && storedUser) {
      try {
        console.log('📡 Verifying token with server...');
        const data = await authAPI.verify();
        console.log('✅ Verification response:', data);
        
        if (data.authenticated) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          console.log('✅ User authenticated successfully!');
          return true;
        } else {
          console.log('❌ Server says not authenticated, clearing...');
          localStorage.removeItem('medlearn_token');
          localStorage.removeItem('medlearn_user');
          setIsAuthenticated(false);
          return false;
        }
      } catch (error) {
        console.error('❌ Verification failed:', error);
        localStorage.removeItem('medlearn_token');
        localStorage.removeItem('medlearn_user');
        setIsAuthenticated(false);
        return false;
      }
    } else {
      console.log('❌ No stored credentials found');
      setIsAuthenticated(false);
      return false;
    }
  };

  // Run on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await checkAuth();
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔐 Attempting login...');
      const data = await authAPI.login(username, password);
      console.log('✅ Login response:', data);
      
      if (data.success && data.token) {
        console.log('💾 Saving token to localStorage...');
        
        // Store token
        localStorage.setItem('medlearn_token', data.token);
        
        // Store user data
        const userData = {
          studentId: data.studentId,
          username: data.username,
          hasSubscription: data.hasSubscription,
          subscription: data.subscription,
          purchases: data.purchases || []
        };
        localStorage.setItem('medlearn_user', JSON.stringify(userData));
        
        // Verify it was saved
        const savedToken = localStorage.getItem('medlearn_token');
        console.log('✅ Token saved?', savedToken ? 'Yes' : 'No');
        
        // Set state immediately
        setToken(data.token);
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('✅ User logged in:', data.username);
        return data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🔓 Logging out');
    localStorage.removeItem('medlearn_token');
    localStorage.removeItem('medlearn_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('medlearn_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    checkAuth // Expose this so we can manually re-check
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};