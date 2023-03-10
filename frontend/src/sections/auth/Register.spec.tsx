import { render, screen } from '@testing-library/react';
import Register from './Register';
import { useAuthContext } from '@/auth/useAuthContext';
import { JWTContextType } from '@/auth/types';

// Mock the useAuthContext hook
jest.mock('@/auth/useAuthContext');
type UseAuthContextMock = jest.Mock<Partial<JWTContextType>>;

jest.mock('./AuthRegisterForm', () => {
  return function MockAuthRegisterForm() {
    return <div data-testid="mock-auth-register-form" />;
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

  render(<Register />);

  // Check if the main title is correctly rendered
  expect(screen.getByText(/Get started absolutely free./i)).toBeInTheDocument();

  // Check if the "Create an account" link is correctly rendered and points to the right URL
  const createAccountLink = screen.getByText(/Sign in/i);
  expect(createAccountLink).toBeInTheDocument();
  expect(createAccountLink.getAttribute('href')).toBe('/auth/login');

  // Check if the login form and social providers components are correctly rendered
  expect(screen.getByTestId('mock-auth-register-form')).toBeInTheDocument();
  expect(screen.getByTestId('mock-auth-with-social')).toBeInTheDocument();
});
