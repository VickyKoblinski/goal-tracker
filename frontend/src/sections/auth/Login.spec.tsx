import { render, screen } from '@testing-library/react';
import Login from './Login';
import { useAuthContext } from '@/auth/useAuthContext';
import { JWTContextType } from '@/auth/types';

// Mock the useAuthContext hook
jest.mock('@/auth/useAuthContext');
type UseAuthContextMock = jest.Mock<Partial<JWTContextType>>;

jest.mock('./AuthLoginForm', () => {
  return function MockAuthLoginForm() {
    return <div data-testid="mock-auth-login-form" />;
  };
});

jest.mock('./AuthWithSocial', () => {
  return function MockAuthWithSocial() {
    return <div data-testid="mock-auth-with-social" />;
  };
});

test('renders correctly', () => {
  const useAuthContextMock = useAuthContext as UseAuthContextMock;
  useAuthContextMock.mockImplementation(() => ({}));

  render(<Login />);

  // Check if the main title is correctly rendered
  expect(screen.getByText(/sign in to achieve\.guru/i)).toBeInTheDocument();

  // Check if the "Create an account" link is correctly rendered and points to the right URL
  const createAccountLink = screen.getByText(/create an account/i);
  expect(createAccountLink).toBeInTheDocument();
  expect(createAccountLink.getAttribute('href')).toBe('/auth/register');

  // Check if the login form and social providers components are correctly rendered
  expect(screen.getByTestId('mock-auth-login-form')).toBeInTheDocument();
  expect(screen.getByTestId('mock-auth-with-social')).toBeInTheDocument();
});
