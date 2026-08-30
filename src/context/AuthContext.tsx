import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '../types';

const TOKEN_KEY = 'agencia_auth_token_v1';

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  token: string | null;
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<LoginResult>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authFetch = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers || {});
      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      return fetch(input, { ...init, headers });
    },
    [token]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      if (!token) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await authFetch('/api/me');
        if (!res.ok) throw new Error('sessão inválida');
        const data = await res.json();
        if (!cancelled) setCurrentUser(data.user);
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, senha: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Não foi possível entrar.' };
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Erro de conexão com o servidor. Tente novamente.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, currentUser, isLoading, login, logout, setCurrentUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
