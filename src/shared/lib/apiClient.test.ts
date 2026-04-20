import { vi } from 'vitest';

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
  },
}));

import apiClient from './apiClient';

describe('apiClient', () => {
  function getRequestInterceptor() {
    const interceptor = (apiClient.interceptors.request.handlers ?? []).find(
      (handler) => typeof handler?.fulfilled === 'function',
    );
    expect(interceptor?.fulfilled).toBeDefined();
    return interceptor!.fulfilled!;
  }

  it('has the correct default baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:5000');
  });

  it('has Content-Type header set to application/json', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('attaches Authorization header when Supabase session has access_token', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'supabase-token-123' } } });

    const interceptor = getRequestInterceptor();
    const config = await interceptor({
      headers: {} as Record<string, string>,
    } as Parameters<NonNullable<typeof interceptor>>[0]);

    expect(config.headers.Authorization).toBe('Bearer supabase-token-123');
  });

  it('does not attach Authorization header when no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const interceptor = getRequestInterceptor();
    const config = await interceptor({
      headers: {} as Record<string, string>,
    } as Parameters<NonNullable<typeof interceptor>>[0]);

    expect(config.headers.Authorization).toBeUndefined();
  });
});
