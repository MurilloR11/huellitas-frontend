import { render, screen } from '@testing-library/react';
import { TestimonialsSection } from './TestimonialsSection';

describe('TestimonialsSection', () => {
  it('renders the section heading', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('Tres perspectivas del Tolima')).toBeInTheDocument();
  });

  it('renders all three testimonials', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('Carolina Ríos')).toBeInTheDocument();
    expect(screen.getByText('Andrés Molina')).toBeInTheDocument();
    expect(screen.getByText('Felipe Torres')).toBeInTheDocument();
  });

  it('renders testimonial quotes', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText(/antes teníamos un grupo de whatsapp/i)).toBeInTheDocument();
  });

  it('renders star ratings', () => {
    const { container } = render(<TestimonialsSection />);
    // 3 testimonials x 5 stars = 15 star icons
    const stars = container.querySelectorAll('.fill-brand');
    expect(stars.length).toBe(15);
  });
});
