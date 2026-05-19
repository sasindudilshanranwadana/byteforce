import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';

const mockSendPasswordReset = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ sendPasswordReset: mockSendPasswordReset }),
}));

vi.mock('../components/ui/Toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders email field', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'notanemail');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('calls sendPasswordReset with email on valid submit', async () => {
    const user = userEvent.setup();
    mockSendPasswordReset.mockResolvedValue();
    renderPage();
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(mockSendPasswordReset).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('shows success state after email sent', async () => {
    const user = userEvent.setup();
    mockSendPasswordReset.mockResolvedValue();
    renderPage();
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });
});
