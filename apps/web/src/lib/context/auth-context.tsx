"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../api/services';
import { AuthUser, UserRole } from '../api/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function initAuth() {
      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password }) as any;
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        document.cookie = `access_token=${response.access_token}; path=/; max-age=28800; SameSite=Lax`;
      }
      setUser(response.user);
      router.push('/');
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout().catch(() => {});
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      document.cookie = `access_token=; path=/; max-age=0`;
      router.push('/login');
    }
  }, [router]);

  const refetch = useCallback(async () => {
    try {
      const me = await authService.me();
      setUser(me);
    } catch (error) {
      setUser(null);
    }
  }, []);

  const isAdmin = useMemo(() => user?.role === UserRole.ADMIN, [user]);

  const value = useMemo(() => ({ 
    user, 
    isLoading, 
    isAdmin, 
    login, 
    logout, 
    refetch 
  }), [user, isLoading, isAdmin, login, logout, refetch]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
