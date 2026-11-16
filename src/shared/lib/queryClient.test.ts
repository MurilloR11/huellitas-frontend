import { queryClient } from './queryClient';

describe('queryClient', () => {
  it('is a QueryClient instance', () => {
    expect(queryClient).toBeDefined();
    expect(queryClient.getDefaultOptions).toBeDefined();
  });

  it('always treats data as stale (realtime + polling keep it fresh)', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(0);
    expect(defaults.queries?.refetchInterval).toBe(30_000);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('has retry set to 1', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(1);
  });
});
