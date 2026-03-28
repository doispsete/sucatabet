"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../api/services';
import { AuthUser, UserRole } from '../api/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function initAuth() {
      try {
        // Verifica se o cookie de token existe antes de tentar buscar o usuário
        const hasToken = typeof document !== 'undefined' && document.cookie.includes('token=');
        if (!hasToken) {
          setIsLoading(false);
          return;
        }

        const me = await authService.me();
        setUser(me);
      } catch (error) {
        setUser(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password }) as any;
      
      // Armazena o token via cookie para persistência e uso pelo middleware
      if (response.access_token) {
        document.cookie = `token=${response.access_token}; path=/; max-age=28800; SameSite=Lax`;
      }
      
      setUser(response.user);
      router.push('/');
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout().catch(() => {}); // Final logout attempt
    } finally {
      setUser(null);
      // Remove o token do cookie
      document.cookie = `token=; path=/; max-age=0`;
      router.push('/login');
    }
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, logout }}>
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
