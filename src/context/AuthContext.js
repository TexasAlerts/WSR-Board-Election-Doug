'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [supporter, setSupporter] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.ok && data.authenticated) {
        setSupporter(data.supporter);
      } else {
        setSupporter(null);
      }
    } catch (err) {
      setSupporter(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSupporter(null);
    } catch (err) {
    }
  };

  const refreshAuth = () => {
    return checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        supporter,
        loading,
        isAuthenticated: !!supporter,
        isAdmin: supporter?.role === 'admin' || supporter?.role === 'super_admin',
        isSuperAdmin: supporter?.role === 'super_admin',
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
