// ===========================================
// PureSkin Store — Auth Context
// ===========================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  role: 'OWNER' | 'STAFF' | 'USER';
  canRestock: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isOwner: boolean;
  isStaff: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: User }>('/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = () => {
    window.location.href = '/api/auth/discord';
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isOwner: user?.role === 'OWNER',
    isStaff: user?.role === 'STAFF' || user?.role === 'OWNER',
    login,
    logout,
    refresh: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
