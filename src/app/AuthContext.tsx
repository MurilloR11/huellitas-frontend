import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../shared/lib/supabaseClient';
import { authApi, buildAuthUser } from '../features/auth/services/authApi';
import type { AuthUser, LoginPayload } from '../features/auth/types';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? buildAuthUser(session.user) : null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? buildAuthUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(payload: LoginPayload): Promise<AuthUser> {
    return authApi.login(payload);
  }

  async function logout(): Promise<void> {
    await authApi.logout();
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
