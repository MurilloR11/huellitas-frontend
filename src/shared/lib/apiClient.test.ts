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

  it('attaches Authorization header when token exists in localStorage', async () => {
    localStorage.setItem('token', 'test-token-123');

    const interceptor = getRequestInterceptor();
    const config = await interceptor({
      headers: {} as Record<string, string>,
    } as Parameters<NonNullable<typeof interceptor>>[0]);

    expect(config.headers.Authorization).toBe('Bearer test-token-123');
    localStorage.removeItem('token');
  });

  it('does not attach Authorization header when no token', async () => {
    localStorage.removeItem('token');

    const interceptor = getRequestInterceptor();
    const config = await interceptor({
      headers: {} as Record<string, string>,
    } as Parameters<NonNullable<typeof interceptor>>[0]);

    expect(config.headers.Authorization).toBeUndefined();
  });
});
