import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  it('renders the heading', () => {
    renderLoginPage();
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderLoginPage();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderLoginPage();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const passwordInput = screen.getByLabelText('Contraseña');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByLabelText('Mostrar contraseña');
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Ocultar contraseña')).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    renderLoginPage();
    expect(screen.getByRole('link', { name: /crear una cuenta/i })).toHaveAttribute('href', '/register');
  });

  it('renders link back to home', () => {
    renderLoginPage();
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/');
  });

  it('renders forgot password link', () => {
    renderLoginPage();
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
  });

  it('renders keep session checkbox', () => {
    renderLoginPage();
    expect(screen.getByLabelText('Mantener sesión iniciada')).toBeInTheDocument();
  });

  it('renders the left panel features on desktop', () => {
    renderLoginPage();
    expect(screen.getByText('Fundaciones verificadas')).toBeInTheDocument();
    expect(screen.getByText('Fichas clínicas digitales')).toBeInTheDocument();
    expect(screen.getByText('Notificaciones automáticas')).toBeInTheDocument();
  });

  it('renders the brand name', () => {
    renderLoginPage();
    const huellitasTexts = screen.getAllByText('Huellitas');
    expect(huellitasTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('prevents default form submission', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    await user.click(submitBtn);

    // Page should still be rendered (no navigation)
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
  });
});
