import { vi } from 'vitest';
import type { User } from '@supabase/supabase-js';

const { mockSignIn, mockSignUp, mockSignOut, mockGetUser } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn().mockResolvedValue({ error: null }),
  mockGetUser: vi.fn(),
}));

vi.mock('../../../shared/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getUser: mockGetUser,
    },
  },
}));

import { authApi } from './authApi';

const fakeUser: Partial<User> = {
  id: 'uuid-123',
  email: 'a@b.com',
  user_metadata: { full_name: 'Test User', role: 'ciudadano' },
};

describe('authApi', () => {
  afterEach(() => vi.clearAllMocks());

  describe('login', () => {
    it('calls signInWithPassword and returns AuthUser', async () => {
      mockSignIn.mockResolvedValue({ data: { user: fakeUser, session: {} }, error: null });

      const result = await authApi.login({ email: 'a@b.com', password: 'pass' });

      expect(mockSignIn).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pass' });
      expect(result.id).toBe('uuid-123');
      expect(result.email).toBe('a@b.com');
      expect(result.full_name).toBe('Test User');
    });

    it('throws a readable error on invalid credentials', async () => {
      mockSignIn.mockResolvedValue({ data: {}, error: { message: 'Invalid login credentials' } });

      await expect(authApi.login({ email: 'x@y.com', password: 'wrong' })).rejects.toThrow(
        'Correo o contraseña incorrectos',
      );
    });
  });

  describe('register', () => {
    it('calls signUp with correct options and returns AuthUser', async () => {
      mockSignUp.mockResolvedValue({ data: { user: fakeUser, session: null }, error: null });

      const result = await authApi.register({
        full_name: 'Test User',
        email: 'a@b.com',
        password: 'Pass1234!',
        role: 'ciudadano',
      });

      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@b.com',
          options: expect.objectContaining({
            data: expect.objectContaining({ full_name: 'Test User', role: 'ciudadano' }),
          }),
        }),
      );
      expect(result.id).toBe('uuid-123');
    });
  });

  describe('logout', () => {
    it('calls signOut', async () => {
      await authApi.logout();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('returns null when no user is authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await authApi.me();
      expect(result).toBeNull();
    });

    it('returns AuthUser when session exists', async () => {
      mockGetUser.mockResolvedValue({ data: { user: fakeUser } });

      const result = await authApi.me();
      expect(result?.id).toBe('uuid-123');
    });
  });
});
