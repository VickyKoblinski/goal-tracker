import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthRegisterForm from './AuthRegisterForm';
import { useAuthContext } from '@/auth/useAuthContext';
import { JWTContextType } from '@/auth/types';
jest.mock('@/auth/useAuthContext');
type UseAuthContextMock = jest.Mock<Partial<JWTContextType>>;

describe('AuthRegisterForm', () => {
  let useAuthContextMock: UseAuthContextMock;

  beforeEach(() => {
    useAuthContextMock = useAuthContext as UseAuthContextMock;
  });

  test('submits form with valid input', async () => {
    const mockRegister = jest.fn();
    useAuthContextMock.mockImplementation(() => ({
      register: mockRegister,
    }));

    render(<AuthRegisterForm />);

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    const username = 'testuser';
    const email = 'test@example.com';
    const password = 'testpassword';

    // Enter input values
    fireEvent.change(usernameInput, { target: { value: username } });
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });
    // Submit form
    userEvent.click(submitButton);

    await waitFor(() => {
      // Check that register function was called with expected input
      expect(mockRegister).toHaveBeenCalledWith({ username, email, password });
    });
  });

  test('displays error message on failed form submission', async () => {
    const mockRegister = jest.fn(() => {
      throw new Error('Registration failed');
    });
    useAuthContextMock.mockImplementation(() => ({
      register: mockRegister,
    }));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<AuthRegisterForm />);

    const usernameInput = screen.getByLabelText('Username');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Create account' });

    const username = 'testuser';
    const email = 'test@example.com';
    const password = 'testpassword';

    // Enter input values
    fireEvent.change(usernameInput, { target: { value: username } });
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });

    // Submit form
    userEvent.click(submitButton);

    // Check that error message is displayed
    expect(await screen.findByText('Registration failed')).toBeInTheDocument();
  });
});
