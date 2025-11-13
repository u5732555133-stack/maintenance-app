import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from './Login';
import { useAuth } from '../../contexts/AuthContext';

vi.mock('../../contexts/AuthContext');
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('Login', () => {
  it('renders login form', () => {
    useAuth.mockReturnValue({
      login: vi.fn(),
    });

    render(<Login />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByText(/Se connecter/i)).toBeInTheDocument();
  });

  it('renders login component', () => {
    useAuth.mockReturnValue({
      login: vi.fn(),
    });

    const { container } = render(<Login />);
    expect(container).toBeTruthy();
  });
});
