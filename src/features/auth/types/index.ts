export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'adopter' | 'foundation' | 'admin';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'adopter' | 'foundation';
}

export type AuthAction =
  | { type: 'LOGIN'; payload: AuthUser }
  | { type: 'LOGOUT' };

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
