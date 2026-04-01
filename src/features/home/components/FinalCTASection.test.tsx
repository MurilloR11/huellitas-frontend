import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FinalCTASection } from './FinalCTASection';

function renderSection() {
  return render(
    <MemoryRouter>
      <FinalCTASection />
    </MemoryRouter>,
  );
}

describe('FinalCTASection', () => {
  it('renders the section heading', () => {
    renderSection();
    expect(screen.getByText('El Tolima adopta diferente')).toBeInTheDocument();
  });

  it('renders the three path cards', () => {
    renderSection();
    expect(screen.getByText('Digitaliza tu refugio')).toBeInTheDocument();
    expect(screen.getByText('Encuentra tu compañero')).toBeInTheDocument();
    expect(screen.getByText('Conecta tu app al Tolima')).toBeInTheDocument();
  });

  it('renders the "most popular" badge', () => {
    renderSection();
    expect(screen.getByText('Más popular')).toBeInTheDocument();
  });

  it('renders trust strip items', () => {
    renderSection();
    expect(screen.getByText('Fundaciones verificadas')).toBeInTheDocument();
    expect(screen.getByText('Todo el Tolima')).toBeInTheDocument();
    expect(screen.getByText('Datos protegidos')).toBeInTheDocument();
    expect(screen.getByText('Acceso inmediato')).toBeInTheDocument();
  });

  it('renders CTA links', () => {
    renderSection();
    expect(screen.getByRole('link', { name: /registrar fundación/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /explorar animales/i })).toHaveAttribute('href', '/pets');
    expect(screen.getByRole('link', { name: /obtener api key/i })).toHaveAttribute('href', '/register');
  });
});
