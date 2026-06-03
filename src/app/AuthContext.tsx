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
  commitLogin: (profile: AuthUser) => void;
  updateUser: (profile: AuthUser) => void;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchProfile(supaUser: import('@supabase/supabase-js').User): Promise<AuthUser> {
    // Supabase user_metadata is authoritative for name/phone/municipio/avatar.
    // Backend /auth/me is authoritative for role and status.
    const supabaseProfile = buildAuthUser(supaUser);
    try {
      const { data } = await apiClient.get<AuthUser>('/auth/me');
      return { ...supabaseProfile, role: data.role, status: data.status };
    } catch {
      return supabaseProfile;
    }
  }

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on subscribe (Supabase v2),
    // so we rely on it exclusively — no separate getSession() call.
    // SIGNED_IN is intentionally excluded: manual logins go through login()
    // which already calls /auth/me and updates state, so reacting to SIGNED_IN
    // here would cause a duplicate request.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        return;
      }
      // Only INITIAL_SESSION determines the auth state on page load.
      // Other events (TOKEN_REFRESHED, USER_UPDATED, SIGNED_IN, etc.) are
      // ignored here — manual logins go through login() which calls setUser directly.
      if (event !== 'INITIAL_SESSION') return;

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
    // Only authenticates with Supabase — does NOT set user in context.
    // Call commitLogin() after any required MFA step completes.
    return authApi.login(payload);
  }

  function commitLogin(profile: AuthUser): void {
    setUser(profile);
  }

  function updateUser(profile: AuthUser): void {
    setUser(profile);
  }

  async function logout(): Promise<void> {
    await authApi.logout();
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, isLoading, login, commitLogin, updateUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
