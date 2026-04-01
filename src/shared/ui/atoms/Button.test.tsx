import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies primary variant classes by default', () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-orange-500');
  });

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-white');
    expect(btn.className).toContain('border-gray-300');
  });

  it('applies ghost variant classes', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button').className).toContain('bg-transparent');
  });

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button').className).toContain('bg-red-500');
  });

  it('applies size sm classes', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toContain('px-3');
  });

  it('applies size md classes by default', () => {
    render(<Button>Medium</Button>);
    expect(screen.getByRole('button').className).toContain('px-4');
  });

  it('applies size lg classes', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toContain('px-6');
  });

  it('disables the button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables the button when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner SVG when isLoading', () => {
    render(<Button isLoading>Loading</Button>);
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.classList.contains('animate-spin')).toBe(true);
  });

  it('does not show spinner when not loading', () => {
    render(<Button>Not loading</Button>);
    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeNull();
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('appends custom className', () => {
    render(<Button className="my-custom">Custom</Button>);
    expect(screen.getByRole('button').className).toContain('my-custom');
  });
});
