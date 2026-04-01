import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PublicAPISection } from './PublicAPISection';

function renderSection() {
  return render(
    <MemoryRouter>
      <PublicAPISection />
    </MemoryRouter>,
  );
}

describe('PublicAPISection', () => {
  it('renders the section heading', () => {
    renderSection();
    expect(screen.getByText('Los datos del Tolima, listos para tu app')).toBeInTheDocument();
  });

  it('renders all feature items', () => {
    renderSection();
    expect(screen.getByText(/filtros por especie, ciudad/i)).toBeInTheDocument();
    expect(screen.getByText(/autenticación por api key/i)).toBeInTheDocument();
    expect(screen.getByText(/endpoints de fundaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/datos en tiempo real/i)).toBeInTheDocument();
  });

  it('renders the terminal mock', () => {
    renderSection();
    expect(screen.getByText('GET /api/v1/animales')).toBeInTheDocument();
  });

  it('renders the CTA link', () => {
    renderSection();
    expect(screen.getByRole('link', { name: /obtener api key/i })).toHaveAttribute('href', '/register');
  });
});
