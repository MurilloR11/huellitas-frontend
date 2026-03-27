import { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, AuthAction, AuthUser } from '../features/auth/types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { user: null, isAuthenticated: false };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  dispatch: React.Dispatch<AuthAction>;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  function login(user: AuthUser, token: string) {
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN', payload: user });
  }

  function logout() {
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
