import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AuthVerifyCodeForm from './AuthVerifyCodeForm';
import { useAuthContext } from '@/auth/useAuthContext';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { JWTContextType } from '@/auth/types';

jest.mock('@/auth/useAuthContext');
const useRouter = jest.spyOn(require('next/router'), 'useRouter');
type UseAuthContextMock = jest.Mock<Partial<JWTContextType>>;

describe('AuthVerifyCodeForm', () => {
  let useAuthContextMock: UseAuthContextMock;

  beforeEach(() => {
    useAuthContextMock = useAuthContext as UseAuthContextMock;
  });

  it('shows and hides errors correctly', async () => {
    const mockVerify = jest.fn();
    useAuthContextMock.mockImplementation(() => ({
      verify: mockVerify,
    }));
    useRouter.mockImplementation(() => ({
      push: jest.fn(),
      query: {},
    }));

    const mocks: MockedResponse[] = [];

    render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks}>
          <AuthVerifyCodeForm />
        </MockedProvider>
      </SnackbarProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'Verify' });
    const [value1, value2, value3, value4, value5, value6] = screen.getAllByRole('spinbutton');

    fireEvent.change(value1, { target: { value: '1' } });
    fireEvent.change(value2, { target: { value: '2' } });
    fireEvent.change(value3, { target: { value: '' } });
    fireEvent.change(value4, { target: { value: '' } });
    fireEvent.change(value5, { target: { value: '' } });
    fireEvent.change(value6, { target: { value: '' } });

    userEvent.click(submitButton);

    await waitFor(() => expect(screen.queryByText(/required/)).toBeInTheDocument());

    fireEvent.change(value3, { target: { value: '3' } });
    fireEvent.change(value4, { target: { value: '4' } });
    fireEvent.change(value5, { target: { value: '5' } });
    fireEvent.change(value6, { target: { value: '6' } });

    userEvent.click(submitButton);

    await waitFor(async () => {
      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(mockVerify).toHaveBeenCalledWith('123456');
    });

    await waitFor(() => expect(screen.queryByText(/required/i)).not.toBeInTheDocument());
  });

  it('should reset the form on mount and fill inputs when receiving a token query param', async () => {
    const token = '543210';
    const mockVerify = jest.fn();
    useAuthContextMock.mockImplementation(() => ({
      verify: mockVerify,
    }));
    useRouter.mockImplementation(() => ({
      push: jest.fn(),
      query: { token },
    }));

    await act(() => {
      render(
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <AuthVerifyCodeForm />
          </MockedProvider>
        </SnackbarProvider>
      );
    });

    expect(screen.getAllByRole('spinbutton').length).toEqual(6);

    await waitFor(() =>
      screen.getAllByRole('spinbutton').forEach((input, index) => {
        expect(input).toHaveValue(parseInt(token[index]));
      })
    );
  });

  it('should call useRouter push with correct params after verification is successful', async () => {
    const mockVerify = jest.fn();
    useAuthContextMock.mockImplementation(() => ({
      verify: mockVerify,
    }));
    const routerPush = jest.fn();
    useRouter.mockImplementation(() => ({
      push: routerPush,
      query: {},
    }));

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <AuthVerifyCodeForm />
        </MockedProvider>
      </SnackbarProvider>
    );

    const inputValues = '123456';
    const submitButton = screen.getByRole('button', { name: 'Verify' });

    await waitFor(async () => {
      screen.getAllByRole('spinbutton').forEach((input, index) => {
        fireEvent.change(input, { target: { value: parseInt(inputValues[index]) } });
      });
    });

    userEvent.click(submitButton);

    await waitFor(async () => {
      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(routerPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
