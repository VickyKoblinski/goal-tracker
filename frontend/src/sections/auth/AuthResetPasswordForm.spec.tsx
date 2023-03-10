import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import AuthResetPasswordForm from './AuthResetPasswordForm';
import { CreateResetPasswordDocument } from '@/generated/graphql';
import { PATH_AUTH } from '@/routes/paths';

const useRouter = jest.spyOn(require('next/router'), 'useRouter');
const mocks: MockedResponse[] = [
  {
    request: {
      query: CreateResetPasswordDocument,
      variables: { email: 'test@example.com' },
    },
    result: { data: { createResetPassword: { resetPassword: { id: '123' } } } },
  },
];

describe('AuthResetPasswordForm', () => {
  useRouter.mockImplementation(() => ({
    push: jest.fn(),
  }));

  it('renders without error', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthResetPasswordForm />
      </MockedProvider>
    );
    expect(await screen.findByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send request/i })).toBeInTheDocument();
  });

  it('submits the form with correct values', async () => {
    const mockPush = jest.fn();
    useRouter.mockImplementation(() => ({
      push: mockPush,
    }));

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthResetPasswordForm />
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'test@example.com' },
    });
    expect(await screen.findByLabelText('Email address')).toHaveValue('test@example.com');
    userEvent.click(screen.getByRole('button', { name: /send request/i }));

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(PATH_AUTH.newPassword, {
        query: { email: 'test@example.com' },
      });
    });
  });

  it('shows validation messages on invalid input', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthResetPasswordForm />
      </MockedProvider>
    );

    await act(async () => {
      userEvent.clear(await screen.findByLabelText('Email address'));
    });
    userEvent.click(screen.getByRole('button', { name: /send request/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });
});
