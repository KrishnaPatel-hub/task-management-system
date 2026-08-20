'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('tm_token');
    if (!saved) { setLoading(false); return; }
    setToken(saved);
    api<{ user: User }>('/auth/me', {}, saved)
      .then((r) => setUser(r.user))
      .catch(() => localStorage.removeItem('tm_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const r = await api<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('tm_token', r.accessToken);
    setToken(r.accessToken); setUser(r.user);
  }

  async function register(name: string, email: string, password: string) {
    const r = await api<{ accessToken: string; user: User }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem('tm_token', r.accessToken);
    setToken(r.accessToken); setUser(r.user);
  }

  function logout() {
    localStorage.removeItem('tm_token');
    setToken(null); setUser(null);
  }

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
