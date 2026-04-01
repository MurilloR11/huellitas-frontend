import { vi } from 'vitest';
import { authApi } from './authApi';
import apiClient from '../../../shared/lib/apiClient';

vi.mock('../../../shared/lib/apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockedClient = vi.mocked(apiClient);

describe('authApi', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('calls POST /auth/login with payload and returns data', async () => {
      const responseData = { user: { id: 1, email: 'a@b.com', name: 'A', role: 'adopter' }, token: 'tok' };
      mockedClient.post.mockResolvedValue({ data: responseData });

      const result = await authApi.login({ email: 'a@b.com', password: '123' });

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: '123' });
      expect(result).toEqual(responseData);
    });
  });

  describe('register', () => {
    it('calls POST /auth/register with payload and returns data', async () => {
      const responseData = { user: { id: 2, email: 'b@c.com', name: 'B', role: 'foundation' }, token: 'tok2' };
      mockedClient.post.mockResolvedValue({ data: responseData });

      const result = await authApi.register({ name: 'B', email: 'b@c.com', password: '123', role: 'foundation' });

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/register', {
        name: 'B',
        email: 'b@c.com',
        password: '123',
        role: 'foundation',
      });
      expect(result).toEqual(responseData);
    });
  });

  describe('me', () => {
    it('calls GET /auth/me and returns user data', async () => {
      const user = { id: 1, email: 'a@b.com', name: 'A', role: 'adopter' };
      mockedClient.get.mockResolvedValue({ data: user });

      const result = await authApi.me();

      expect(mockedClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(user);
    });
  });

  describe('logout', () => {
    it('calls POST /auth/logout', async () => {
      mockedClient.post.mockResolvedValue({ data: { message: 'ok' } });

      const result = await authApi.logout();

      expect(mockedClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual({ message: 'ok' });
    });
  });
});
