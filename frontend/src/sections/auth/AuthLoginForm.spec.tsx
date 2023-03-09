import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthLoginForm from './AuthLoginForm';
import { useAuthContext } from '@/auth/useAuthContext';
import { JWTContextType } from '@/auth/types';
jest.mock('@/auth/useAuthContext');
type UseAuthContextMock = jest.Mock<Partial<JWTContextType>>;

describe('AuthLoginForm', () => {
  let useAuthContextMock: UseAuthContextMock;

  beforeEach(() => {
    useAuthContextMock = useAuthContext as UseAuthContextMock;
    useAuthContextMock.mockImplementation(() => ({
      login: jest.fn(),
    }));
  });

  test('shows the password when the show password button is clicked', () => {
    render(<AuthLoginForm />);
    const showPasswordButton = screen.getByRole('button', { name: 'toggle password visibility' });
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    waitFor(() => {
      userEvent.click(showPasswordButton);
      expect(passwordInput.type).toBe('text');
    });
  });

  test('calls the login function when the form is submitted', async () => {
    const mockLogin = jest.fn();
    (useAuthContext as jest.Mock<Partial<JWTContextType>>).mockReturnValue({
      login: mockLogin,
    });
    render(<AuthLoginForm />);
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    userEvent.click(loginButton);

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    );
  });

  test('displays an error message when login fails', async () => {
    const error = new Error('Invalid email or password');
    const mockLogin = jest.fn().mockRejectedValue(error);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    useAuthContextMock.mockReturnValue({
      login: mockLogin,
    });
    render(<AuthLoginForm />);
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    userEvent.click(loginButton);
    const errorMessage = await screen.findByText('Invalid email or password');
    expect(errorMessage).toBeInTheDocument();
  });

  test('displays a loading spinner while submitting', async () => {
    const mockLogin = jest.fn();
    useAuthContextMock.mockReturnValue({
      login: mockLogin,
    });
    render(<AuthLoginForm />);
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    userEvent.click(loginButton);
    const loadingSpinner = await screen.findByRole('progressbar');
    expect(loadingSpinner).toBeInTheDocument();
  });
});
