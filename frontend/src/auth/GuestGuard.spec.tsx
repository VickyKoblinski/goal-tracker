import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useAuthContext } from './useAuthContext';
import GuestGuard from './GuestGuard';

jest.mock('next/router');
jest.mock('./useAuthContext');

describe('GuestGuard', () => {
  const mockRouterPush = jest.fn();
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseAuthContext = useAuthContext as jest.Mock;

  beforeEach(() => {
    mockRouterPush.mockReset();
    mockUseRouter.mockReturnValue({ push: mockRouterPush });
    mockUseAuthContext.mockReturnValue({ isAuthenticated: false, isInitialized: false });
  });

  test('should render children when not authenticated and initialized', () => {
    mockUseAuthContext.mockReturnValue({ isAuthenticated: false, isInitialized: true });
    render(
      <GuestGuard>
        <div>Child component</div>
      </GuestGuard>
    );
    expect(screen.getByText('Child component')).toBeInTheDocument();
  });

  test('should redirect to dashboard when authenticated and initialized', () => {
    mockUseAuthContext.mockReturnValue({ isAuthenticated: true, isInitialized: true });
    render(
      <GuestGuard>
        <div>Child component</div>
      </GuestGuard>
    );
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    expect(screen.queryByText('Child component')).not.toBeInTheDocument();
  });

  test('should show loading screen when not authenticated and not initialized', () => {
    mockUseAuthContext.mockReturnValue({ isAuthenticated: false, isInitialized: false });
    render(
      <GuestGuard>
        <div>Child component</div>
      </GuestGuard>
    );
    expect(screen.queryByText('Child component')).not.toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(screen.queryByTestId('loading-screen')).toBeInTheDocument();
  });
});
