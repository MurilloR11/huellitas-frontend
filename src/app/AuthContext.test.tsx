import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';
import type { AuthUser } from '../features/auth/types';

const mockUser: AuthUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'adopter',
};

function TestConsumer() {
  const ctx = useContext(AuthContext);
  if (!ctx) return <div>No context</div>;

  return (
    <div>
      <span data-testid="is-auth">{String(ctx.isAuthenticated)}</span>
      <span data-testid="user-name">{ctx.user?.name ?? 'none'}</span>
      <button onClick={() => ctx.login(mockUser, 'fake-token')}>Login</button>
      <button onClick={() => ctx.logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
  });

  it('login sets user and isAuthenticated, stores token', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByText('Login'));

    expect(screen.getByTestId('is-auth')).toHaveTextContent('true');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('logout clears user and removes token', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByText('Login'));
    expect(screen.getByTestId('is-auth')).toHaveTextContent('true');

    await user.click(screen.getByText('Logout'));
    expect(screen.getByTestId('is-auth')).toHaveTextContent('false');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('returns null context outside provider', () => {
    render(<TestConsumer />);
    expect(screen.getByText('No context')).toBeInTheDocument();
  });
});
