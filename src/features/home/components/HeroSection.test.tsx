import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroSection } from './HeroSection';

function renderHero() {
  return render(
    <MemoryRouter>
      <HeroSection />
    </MemoryRouter>,
  );
}

describe('HeroSection', () => {
  it('renders the main heading', () => {
    renderHero();
    expect(screen.getByRole('heading', { name: /huellitasapi/i })).toBeInTheDocument();
    expect(screen.getByText(/plataforma web para la adopción de animales/i)).toBeInTheDocument();
  });

  it('renders the CTA buttons', () => {
    renderHero();
    expect(screen.getByRole('link', { name: /explorar animales/i })).toHaveAttribute('href', '/pets');
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login');
  });

  it('renders project description', () => {
    renderHero();
    expect(screen.getByText(/centraliza el proceso de adopción animal/i)).toBeInTheDocument();
  });

  it('renders the top badge', () => {
    renderHero();
    expect(screen.getByText(/proyecto de desarrollo web — tolima, colombia/i)).toBeInTheDocument();
  });

  it('renders the hero background video element', () => {
    renderHero();
    expect(document.querySelector('video')).toBeInTheDocument();
  });

  it('renders the scroll indicator', () => {
    renderHero();
    expect(screen.getByText(/conoce el proyecto/i)).toBeInTheDocument();
  });
});
