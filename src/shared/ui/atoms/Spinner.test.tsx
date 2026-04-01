import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with role status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<Spinner />);
    expect(screen.getByLabelText('Cargando...')).toBeInTheDocument();
  });

  it('applies animate-spin class', () => {
    render(<Spinner />);
    const svg = screen.getByRole('status');
    expect(svg.classList.contains('animate-spin')).toBe(true);
  });

  it('applies size md classes by default', () => {
    render(<Spinner />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveClass('h-6');
    expect(svg).toHaveClass('w-6');
  });

  it('applies size sm classes', () => {
    render(<Spinner size="sm" />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveClass('h-4');
  });

  it('applies size lg classes', () => {
    render(<Spinner size="lg" />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveClass('h-10');
  });

  it('appends custom className', () => {
    render(<Spinner className="mt-4" />);
    expect(screen.getByRole('status')).toHaveClass('mt-4');
  });
});
