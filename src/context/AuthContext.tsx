import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  session: Session | null;
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<LoginResult>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    papel: row.papel,
    cor_avatar: row.cor_avatar,
    avatar_url: row.avatar_url ?? undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Observa a sessão do Supabase Auth (login, logout, refresh de token em outras abas...).
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setHasCheckedSession(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setHasCheckedSession(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Carrega o perfil (tabela usuarios) correspondente à sessão atual.
  // Depende só do id do usuário (não do objeto `session` inteiro): o Supabase
  // troca a referência da sessão a cada refresh silencioso de token (a cada
  // hora, em segundo plano), e recarregar o perfil nesses casos faria o app
  // inteiro piscar de volta para a tela de carregamento sem necessidade.
  const userId = session?.user?.id;
  useEffect(() => {
    if (!hasCheckedSession) return; // sessão inicial ainda não verificada

    let cancelled = false;

    async function loadProfile() {
      if (!userId) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const { data, error } = await supabase.from('usuarios').select('*').eq('id', userId).single();

      if (cancelled) return;
      if (error || !data) {
        console.error('Falha ao carregar perfil do usuário', error);
        setCurrentUser(null);
      } else {
        setCurrentUser(mapRowToUser(data));
      }
      setIsLoading(false);
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCheckedSession, userId]);

  const authFetch = useCallback(
    async (input: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers || {});
      const accessToken = session?.access_token;
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
      if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      return fetch(input, { ...init, headers });
    },
    [session]
  );

  const login = async (email: string, senha: string): Promise<LoginResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      return { ok: false, error: 'Email ou senha inválidos.' };
    }
    return { ok: true };
  };

  const logout = () => {
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, currentUser, isLoading, login, logout, setCurrentUser, authFetch }}
    >
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
