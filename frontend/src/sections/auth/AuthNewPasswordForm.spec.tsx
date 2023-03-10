// Import necessary libraries and components
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import AuthNewPasswordForm from './AuthNewPasswordForm';
import { MockedProvider } from '@apollo/client/testing';
import { SubmitResetPasswordDocument } from '@/generated/graphql';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';

// Mock dependencies
const useRouter = jest.spyOn(require('next/router'), 'useRouter');

const submitResetPasswordInput = {
  email: 'test@example.com',
  emailVerificationToken: '123456',
  newPassword: 'newpassword',
};

const mocks = [
  {
    request: {
      query: SubmitResetPasswordDocument,
      variables: {
        submitResetPasswordInput,
      },
    },
    result: {
      data: {
        submitResetPassword: {
          id: '1',
        },
      },
    },
  },
];

// Define test cases
describe('AuthNewPasswordForm', () => {
  useRouter.mockImplementation(() => ({
    push: jest.fn(),
    query: {},
  }));

  it('should render with default form values', async () => {
    // Render the component
    const { container } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <AuthNewPasswordForm />
        </MockedProvider>
      </SnackbarProvider>
    );

    // Check that all input fields have been rendered
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument();

    // Check the default values of each input
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Confirm New Password')).toHaveValue('');
    const codes = screen.getAllByRole('spinbutton');
    expect(codes.length).toEqual(6);
    codes.forEach((input) => {
      expect(input).toHaveValue(null);
    });
  });

  it('should submit the form when all fields are filled out correctly', async () => {
    // Render the component
    const { container } = render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks}>
          <AuthNewPasswordForm />
        </MockedProvider>
      </SnackbarProvider>
    );

    // Fill out form values
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: submitResetPasswordInput.email },
      });

      await act(async () => {
        const inputs = screen.getAllByRole('spinbutton');
        inputs.forEach((input, i) => {
          fireEvent.change(input, {
            target: { value: submitResetPasswordInput.emailVerificationToken[i] },
          });
        });
        fireEvent.change(container.querySelectorAll('input[type="password"]')[0], {
          target: { value: submitResetPasswordInput.newPassword },
        });
        fireEvent.change(container.querySelectorAll('input[type="password"]')[1], {
          target: { value: submitResetPasswordInput.newPassword },
        });
      });
    });

    // Submit the form
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    });

    // Expect the form to be submitted
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    expect(await screen.findByText('Change password success!')).toBeInTheDocument();
  });

  it('should show an error message and/or disable the submit button when an input field is invalid or incomplete', async () => {
    // Render the component
    const { container } = render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks}>
          <AuthNewPasswordForm />
        </MockedProvider>
      </SnackbarProvider>
    );

    // Test invalid email address
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } });
    });
    expect(screen.getByText('Email must be a valid email address')).toBeInTheDocument();

    // Test missing/empty confirm password
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password1' },
      });

      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'password2' },
      });
    });
    expect(screen.getByText('Passwords must match')).toBeInTheDocument();

    // Test missing/empty code
    const input = screen.getAllByRole('spinbutton')[0];
    expect(screen.queryByText('Code is required')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.change(input, { target: { value: 2 } });
      fireEvent.change(input, { target: { value: null } });
    });
    expect(screen.getByText('Code is required')).toBeInTheDocument();
  });

  it('should render correctly with a query parameter', async () => {
    const token = '123456';

    useRouter.mockImplementation(() => ({
      push: jest.fn(),
      query: { email: 'test@test.com', token },
    }));

    render(
      <SnackbarProvider>
        <MockedProvider mocks={mocks}>
          <AuthNewPasswordForm />
        </MockedProvider>
      </SnackbarProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('form')).toHaveFormValues({
        email: 'test@test.com',
        code1: parseInt(token[0]),
        code2: parseInt(token[1]),
        code3: parseInt(token[2]),
        code4: parseInt(token[3]),
        code5: parseInt(token[4]),
        code6: parseInt(token[5]),
      });
    });
  });
});
