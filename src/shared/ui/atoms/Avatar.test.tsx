import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  describe('with image', () => {
    it('renders an img element when src is provided', () => {
      render(<Avatar src="https://example.com/photo.jpg" alt="John Doe" />);
      const img = screen.getByRole('img', { name: 'John Doe' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    it('applies size md classes by default', () => {
      render(<Avatar src="/photo.jpg" alt="User" />);
      const img = screen.getByRole('img');
      expect(img.className).toContain('h-10');
      expect(img.className).toContain('w-10');
    });

    it('applies size sm classes', () => {
      render(<Avatar src="/photo.jpg" alt="User" size="sm" />);
      const img = screen.getByRole('img');
      expect(img.className).toContain('h-8');
    });

    it('applies size lg classes', () => {
      render(<Avatar src="/photo.jpg" alt="User" size="lg" />);
      const img = screen.getByRole('img');
      expect(img.className).toContain('h-14');
    });
  });

  describe('without image (initials fallback)', () => {
    it('renders initials when no src is provided', () => {
      render(<Avatar alt="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders single initial for single-word name', () => {
      render(<Avatar alt="Alice" />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('takes first two words for initials', () => {
      render(<Avatar alt="Maria Clara Rodriguez" />);
      expect(screen.getByText('MC')).toBeInTheDocument();
    });

    it('renders initials in uppercase', () => {
      render(<Avatar alt="john doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('has aria-label for accessibility', () => {
      render(<Avatar alt="John Doe" />);
      expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
    });

    it('applies size md classes by default for fallback', () => {
      render(<Avatar alt="User" />);
      const el = screen.getByLabelText('User');
      expect(el.className).toContain('h-10');
    });
  });

  it('appends custom className', () => {
    render(<Avatar alt="User" className="ring-2" />);
    expect(screen.getByLabelText('User').className).toContain('ring-2');
  });
});
