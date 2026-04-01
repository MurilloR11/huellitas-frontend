import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  it('renders the heading', () => {
    renderRegisterPage();
    expect(screen.getByText('Crear una cuenta')).toBeInTheDocument();
  });

  it('renders the three account type options', () => {
    renderRegisterPage();
    expect(screen.getByText('Ciudadano')).toBeInTheDocument();
    expect(screen.getByText('Fundación')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  it('selects Ciudadano by default', () => {
    renderRegisterPage();
    expect(screen.getByRole('button', { name: /crear cuenta como ciudadano/i })).toBeInTheDocument();
  });

  it('switches to Fundación account type and shows extra fields', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.click(screen.getByText('Fundación'));

    expect(screen.getByRole('button', { name: /registrar fundación/i })).toBeInTheDocument();
    expect(screen.getByText('Municipio')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono de contacto')).toBeInTheDocument();
    expect(screen.getByText(/verificación manual/i)).toBeInTheDocument();
  });

  it('switches to Developer account type', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.click(screen.getByText('Developer'));

    expect(screen.getByRole('button', { name: /crear cuenta de desarrollador/i })).toBeInTheDocument();
  });

  it('changes name label based on account type', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();

    await user.click(screen.getByText('Fundación'));
    expect(screen.getByLabelText('Nombre de la fundación')).toBeInTheDocument();

    await user.click(screen.getByText('Developer'));
    expect(screen.getByLabelText('Nombre completo o alias')).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderRegisterPage();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const passwordInput = screen.getByLabelText('Contraseña');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByLabelText('Mostrar contraseña'));
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('shows password strength indicator when typing', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const passwordInput = screen.getByLabelText('Contraseña');
    await user.type(passwordInput, 'abc');

    expect(screen.getByText(/seguridad:/i)).toBeInTheDocument();
  });

  it('shows strong password strength', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    const passwordInput = screen.getByLabelText('Contraseña');
    await user.type(passwordInput, 'MyStr0ng!Pass');

    expect(screen.getByText(/fuerte/i)).toBeInTheDocument();
  });

  it('renders terms checkbox', () => {
    renderRegisterPage();
    expect(screen.getByText(/acepto los/i)).toBeInTheDocument();
    expect(screen.getByText('términos de uso')).toBeInTheDocument();
    expect(screen.getByText('política de privacidad')).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    renderRegisterPage();
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login');
  });

  it('renders link back to home', () => {
    renderRegisterPage();
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toHaveAttribute('href', '/');
  });

  it('renders the left panel role cards', () => {
    renderRegisterPage();
    expect(screen.getByText('Publica animales con ficha clínica completa')).toBeInTheDocument();
    expect(screen.getByText('Busca y adopta en tu municipio del Tolima')).toBeInTheDocument();
    expect(screen.getByText('Obtén tu API key y consume datos en JSON')).toBeInTheDocument();
  });
});
