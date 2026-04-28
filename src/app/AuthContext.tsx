import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../shared/lib/supabaseClient';
import { authApi, buildAuthUser } from '../features/auth/services/authApi';
import apiClient from '../shared/lib/apiClient';
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

  async function fetchProfile(fallbackUser: import('@supabase/supabase-js').User): Promise<AuthUser> {
    try {
      const { data } = await apiClient.get<AuthUser>('/auth/me');
      return data;
    } catch {
      // Si el backend no está disponible, usa user_metadata como fallback
      return buildAuthUser(fallbackUser);
    }
  }

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on subscribe (Supabase v2),
    // so we rely on it exclusively — no separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        return;
      }
      // Only fetch profile on events that indicate a new or restored session.
      // Ignore TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY, etc.
      if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN') {
        setIsLoading(false);
        return;
      }
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
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
