import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LostAnimalsSection } from './LostAnimalsSection';

describe('LostAnimalsSection', () => {
  it('renders the section heading', () => {
    render(<LostAnimalsSection />);
    expect(screen.getByText('¿Encontraste un animal extraviado en el Tolima?')).toBeInTheDocument();
  });

  it('renders the "coming soon" badge', () => {
    render(<LostAnimalsSection />);
    expect(screen.getByText('Próximamente')).toBeInTheDocument();
  });

  it('renders feature pills', () => {
    render(<LostAnimalsSection />);
    expect(screen.getByText('Búsqueda por municipio')).toBeInTheDocument();
    expect(screen.getByText('Foto y descripción')).toBeInTheDocument();
    expect(screen.getByText('Notificación al dueño')).toBeInTheDocument();
  });

  it('renders the email signup form', () => {
    render(<LostAnimalsSection />);
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /avísame/i })).toBeInTheDocument();
  });

  it('accepts email input', async () => {
    const user = userEvent.setup();
    render(<LostAnimalsSection />);

    const input = screen.getByPlaceholderText('tu@email.com');
    await user.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });

  it('renders sample animal cards', () => {
    render(<LostAnimalsSection />);
    expect(screen.getByText('Michi — gato naranja')).toBeInTheDocument();
    expect(screen.getByText('Perdido')).toBeInTheDocument();
    expect(screen.getByText('Encontrado')).toBeInTheDocument();
  });

  it('renders placeholder for future feature', () => {
    render(<LostAnimalsSection />);
    expect(screen.getByText('Reportar animal perdido o encontrado')).toBeInTheDocument();
    expect(screen.getByText('Disponible pronto')).toBeInTheDocument();
  });
});
