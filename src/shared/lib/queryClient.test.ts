import { queryClient } from './queryClient';

describe('queryClient', () => {
  it('is a QueryClient instance', () => {
    expect(queryClient).toBeDefined();
    expect(queryClient.getDefaultOptions).toBeDefined();
  });

  it('has staleTime set to 5 minutes', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(1000 * 60 * 5);
  });

  it('has retry set to 1', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.retry).toBe(1);
  });
});
