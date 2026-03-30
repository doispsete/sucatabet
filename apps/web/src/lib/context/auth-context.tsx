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
        // Sempre tenta buscar o usuário. Se houver cookie httpOnly, o navegador enviará.
        // Se não houver, a API retornará 401 e o catch tratará.
        const me = await authService.me();
        setUser(me);
      } catch {
        // O middleware.ts é o único responsável por redirecionar para /login.
        setUser(null);
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
      
      // Armazena o token via localStorage para o client.ts e cookie para o middleware
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
  };

  const logout = async () => {
    try {
      await authService.logout().catch(() => {}); // Final logout attempt
    } finally {
      setUser(null);
      // Remove o token
      localStorage.removeItem('access_token');
      document.cookie = `access_token=; path=/; max-age=0`;
      router.push('/login');
    }
  };

  const refetch = async () => {
    try {
      const me = await authService.me();
      setUser(me);
    } catch (error) {
      setUser(null);
    }
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, logout, refetch }}>
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
