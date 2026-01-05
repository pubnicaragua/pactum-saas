import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getMe } from './api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pactum_token');
      const savedUser = localStorage.getItem('pactum_user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token is still valid
          const response = await getMe();
          setUser(response.data);
          localStorage.setItem('pactum_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Token invalid:', error);
          localStorage.removeItem('pactum_token');
          localStorage.removeItem('pactum_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await apiLogin(email, password);
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('pactum_token', access_token);
    localStorage.setItem('pactum_user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pactum_token');
    localStorage.removeItem('pactum_user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'Admin';
  const isClient = () => user?.role === 'Cliente';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isClient }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
