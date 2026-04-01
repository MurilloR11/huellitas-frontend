import { render, screen } from '@testing-library/react';
import { HowItWorksSection } from './HowItWorksSection';

describe('HowItWorksSection', () => {
  it('renders the section heading', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText('Del animal al hogar')).toBeInTheDocument();
  });

  it('renders all three steps', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText('La fundación registra al animal con ficha completa')).toBeInTheDocument();
    expect(screen.getByText('El ciudadano busca, filtra y solicita')).toBeInTheDocument();
    expect(screen.getByText('La plataforma notifica al adoptante automáticamente')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders feature tags for each step', () => {
    render(<HowItWorksSection />);
    expect(screen.getByText('Ficha clínica')).toBeInTheDocument();
    expect(screen.getByText('Filtros avanzados')).toBeInTheDocument();
    expect(screen.getByText('Notificación automática')).toBeInTheDocument();
  });
});
