import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback(async (email, password) => {
    const data = await apiClient.login(email, password);
    setUser(data.user);
    setToken(data.token);
    apiClient.setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    return data;
  }, []);

  const register = useCallback(async (name, email, password, passwordConfirmation) => {
    const data = await apiClient.register(name, email, password, passwordConfirmation);
    setUser(data.user);
    setToken(data.token);
    apiClient.setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    return data;
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await apiClient.logout();
      } catch {
        // ignore logout errors
      }
    }
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    apiClient.setToken(token);
  }, [token]);

  useEffect(() => {
    apiClient.onUnauthorized = logout;
    return () => {
      apiClient.onUnauthorized = null;
    };
  }, [logout]);

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';
  const isGuest = user?.role === 'guest';

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      token,
      isAuthenticated,
      isAdmin,
      isGuest,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
