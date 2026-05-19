import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import Input from '../components/ui/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('renders hint when no error', () => {
    render(<Input hint="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('does not show hint when error is present', () => {
    render(<Input hint="Hint text" error="Error text" />);
    expect(screen.queryByText('Hint text')).not.toBeInTheDocument();
    expect(screen.getByText('Error text')).toBeInTheDocument();
  });

  it('accepts typed input', async () => {
    const user = userEvent.setup();
    render(<Input label="Email" placeholder="you@example.com" />);
    const input = screen.getByPlaceholderText('you@example.com');
    await user.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('shows required asterisk when required', () => {
    render(<Input label="Name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
