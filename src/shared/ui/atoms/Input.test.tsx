import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('generates id from label text', () => {
    render(<Input label="Full Name" />);
    const input = screen.getByLabelText('Full Name');
    expect(input.id).toBe('full-name');
  });

  it('uses provided id over generated one', () => {
    render(<Input label="Email" id="custom-id" />);
    const input = screen.getByLabelText('Email');
    expect(input.id).toBe('custom-id');
  });

  it('shows error message and applies error styles', () => {
    render(<Input error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-400');
  });

  it('shows hint when no error', () => {
    render(<Input hint="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<Input hint="Enter your email" error="Invalid email" />);
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('applies normal border when no error', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-gray-300');
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name');
    await user.type(input, 'John');
    expect(input).toHaveValue('John');
  });

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLInputElement | null>;
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('appends custom className', () => {
    render(<Input className="my-class" />);
    expect(screen.getByRole('textbox').className).toContain('my-class');
  });

  it('applies disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
