import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
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

  it('renders key sections as a smoke test', () => {
    renderHome();
    expect(screen.getByText(/plataforma web para la adopción de animales/i)).toBeInTheDocument();
    expect(screen.getByText(/del animal al hogar/i)).toBeInTheDocument();
    expect(screen.getByText(/todo lo que faltaba en el tolima/i)).toBeInTheDocument();
    expect(screen.getByText('© 2025 HuellitasAPI')).toBeInTheDocument();
  });
});
