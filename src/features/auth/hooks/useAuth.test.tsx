import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../../../app/AuthContext';
import type { ReactNode } from 'react';

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth', () => {
  it('returns context value when used within AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('throws when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });
});
