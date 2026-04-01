import { render, screen } from '@testing-library/react';
import { FeaturesGridSection } from './FeaturesGridSection';

describe('FeaturesGridSection', () => {
  it('renders the section heading', () => {
    render(<FeaturesGridSection />);
    expect(screen.getByText('Todo lo que faltaba en el Tolima')).toBeInTheDocument();
  });

  it('renders all four features', () => {
    render(<FeaturesGridSection />);
    expect(screen.getByText('Filtros que realmente importan')).toBeInTheDocument();
    expect(screen.getByText('Sin mensajes manuales')).toBeInTheDocument();
    expect(screen.getByText('Solo refugios reales y activos')).toBeInTheDocument();
    expect(screen.getByText('Disponible en todo el departamento')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<FeaturesGridSection />);
    expect(screen.getByText(/especie, ciudad, tamaño, edad/i)).toBeInTheDocument();
  });
});
