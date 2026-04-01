import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FooterSection } from './FooterSection';

function renderFooter() {
  return render(
    <MemoryRouter>
      <FooterSection />
    </MemoryRouter>,
  );
}

describe('FooterSection', () => {
  it('renders the brand logo', () => {
    renderFooter();
    expect(screen.getByText('Huellitas')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
  });

  it('renders platform links', () => {
    renderFooter();
    expect(screen.getByText('Explorar animales')).toBeInTheDocument();
    expect(screen.getByText('Fundaciones')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderFooter();
    expect(screen.getByText('Proyecto')).toBeInTheDocument();
    expect(screen.getByText('Misión y Visión')).toBeInTheDocument();
    expect(screen.getByText('Objetivos')).toBeInTheDocument();
    expect(screen.getByText('Tecnologías')).toBeInTheDocument();
  });

  it('renders copyright and tagline', () => {
    renderFooter();
    expect(screen.getByText('© 2025 HuellitasAPI')).toBeInTheDocument();
    expect(screen.getByText('Hecho con amor por el Tolima')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderFooter();
    expect(screen.getByText(/primera plataforma de adopción animal del tolima/i)).toBeInTheDocument();
  });
});
