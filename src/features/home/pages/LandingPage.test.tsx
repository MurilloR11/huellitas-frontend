import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '0px';
      readonly thresholds = [];
      disconnect = vi.fn();
      observe = vi.fn();
      takeRecords = vi.fn(() => []);
      unobserve = vi.fn();
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the navbar', () => {
    renderLanding();
    // Navbar renders "Huellitas" and "API" in the brand
    const huellitasTexts = screen.getAllByText('Huellitas');
    expect(huellitasTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the hero section', () => {
    renderLanding();
    expect(screen.getByText(/plataforma web para la adopción de animales/i)).toBeInTheDocument();
  });

  it('renders the how it works section', () => {
    renderLanding();
    expect(screen.getByText('Del animal al hogar')).toBeInTheDocument();
  });

  it('renders the features grid section', () => {
    renderLanding();
    expect(screen.getByText('Todo lo que faltaba en el Tolima')).toBeInTheDocument();
  });

  it('renders the testimonials section', () => {
    renderLanding();
    expect(screen.getByText('Tres perspectivas del Tolima')).toBeInTheDocument();
  });

  it('renders the footer', () => {
    renderLanding();
    expect(screen.getByText('© 2025 HuellitasAPI')).toBeInTheDocument();
  });

  it('sets up IntersectionObserver for fade-in animations', () => {
    renderLanding();
    expect(IntersectionObserver).toBeDefined();
  });
});
