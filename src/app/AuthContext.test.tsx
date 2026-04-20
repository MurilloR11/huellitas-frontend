import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';

vi.mock('../shared/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

vi.mock('../features/auth/services/authApi', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
  },
  buildAuthUser: vi.fn(),
}));

function TestConsumer() {
  const ctx = useContext(AuthContext);
  if (!ctx) return <div>No context</div>;

  return (
    <div>
      <span data-testid="is-auth">{String(ctx.isAuthenticated)}</span>
      <span data-testid="user-name">{ctx.user?.full_name ?? 'none'}</span>
      <span data-testid="is-loading">{String(ctx.isLoading)}</span>
    </div>
  );
}

describe('AuthContext', () => {
  it('provides unauthenticated state after session resolves to null', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
  });

  it('returns null context outside provider', () => {
    render(<TestConsumer />);
    expect(screen.getByText('No context')).toBeInTheDocument();
  });
});
