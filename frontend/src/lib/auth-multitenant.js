import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getMe } from './api-multitenant';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('pactum_token');
    if (token) {
      try {
        const response = await getMe();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('pactum_token');
        localStorage.removeItem('pactum_user');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    localStorage.setItem('pactum_token', response.data.access_token);
    localStorage.setItem('pactum_user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('pactum_token');
    localStorage.removeItem('pactum_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
