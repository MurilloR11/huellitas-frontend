import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForFoundationsSection } from './ForFoundationsSection';

function renderSection() {
  return render(
    <MemoryRouter>
      <ForFoundationsSection />
    </MemoryRouter>,
  );
}

describe('ForFoundationsSection', () => {
  it('renders the section heading', () => {
    renderSection();
    expect(screen.getByText('Deja el WhatsApp para la familia')).toBeInTheDocument();
  });

  it('renders checklist items', () => {
    renderSection();
    expect(screen.getByText('Ficha clínica digital completa')).toBeInTheDocument();
    expect(screen.getByText('Gestión de solicitudes en un panel')).toBeInTheDocument();
    expect(screen.getByText('Verificación y credibilidad')).toBeInTheDocument();
    expect(screen.getByText('Cobertura en todo el departamento')).toBeInTheDocument();
  });

  it('renders mock panel with animal rows', () => {
    renderSection();
    expect(screen.getByText('Rocky')).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Bruno')).toBeInTheDocument();
  });

  it('renders the register CTA link', () => {
    renderSection();
    expect(screen.getByRole('link', { name: /registrar mi fundación/i })).toHaveAttribute('href', '/register');
  });

  it('renders foundation panel mock header', () => {
    renderSection();
    expect(screen.getByText('Panel de fundación')).toBeInTheDocument();
    expect(screen.getByText('Patitas Ibagué')).toBeInTheDocument();
    expect(screen.getByText('Verificada')).toBeInTheDocument();
  });
});
