import { useState, useEffect } from 'react';
import * as Yup from 'yup';
// next
import { useRouter } from 'next/router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, IconButton, InputAdornment, FormHelperText } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFTextField, RHFCodes } from '../../components/hook-form';
import { gql } from '@apollo/client';
// graphql
import { useSubmitResetPasswordMutation } from '@/generated/graphql';

// ----------------------------------------------------------------------

type FormValuesProps = {
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  code5: string;
  code6: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function AuthNewPasswordForm() {
  const { push, query } = useRouter();
  const [submitResetPasswordMutation] = useSubmitResetPasswordMutation();

  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required('Code is required'),
    code2: Yup.string().required('Code is required'),
    code3: Yup.string().required('Code is required'),
    code4: Yup.string().required('Code is required'),
    code5: Yup.string().required('Code is required'),
    code6: Yup.string().required('Code is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });

  const defaultValues = {
    code1: '',
    code2: '',
    code3: '',
    code4: '',
    code5: '',
    code6: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
    shouldUnregister: false,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
    reset,
  } = methods;

  useEffect(() => {
    if (query.email && typeof query.email === 'string')
      setTimeout(() => {
        setValue('email', query.email && typeof query.email === 'string' ? query.email : '');
      });
  }, [query.email]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const { errors } = await submitResetPasswordMutation({
        variables: {
          submitResetPasswordInput: {
            email: data.email,
            emailVerificationToken: `${data.code1}${data.code2}${data.code3}${data.code4}${data.code5}${data.code6}`,
            newPassword: data.password,
          },
        },
      });
      if (errors) throw errors;

      enqueueSnackbar('Change password success!');

      push(PATH_DASHBOARD.root);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (query.token && typeof query.token === 'string' && query.token.length === 6) {
      reset({
        code1: query.token[0],
        code2: query.token[1],
        code3: query.token[2],
        code4: query.token[3],
        code5: query.token[4],
        code6: query.token[5],
      });
    }
  }, [query.token]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField
          name="email"
          label="Email"
          disabled={!!query.email}
          InputLabelProps={{ shrink: true }}
        />

        <RHFCodes keyName="code" inputs={['code1', 'code2', 'code3', 'code4', 'code5', 'code6']} />

        {(!!errors.code1 ||
          !!errors.code2 ||
          !!errors.code3 ||
          !!errors.code4 ||
          !!errors.code5 ||
          !!errors.code6) && (
          <FormHelperText error sx={{ px: 2 }}>
            Code is required
          </FormHelperText>
        )}

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="confirmPassword"
          label="Confirm New Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ mt: 3 }}
        >
          Update Password
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

gql`
  mutation SubmitResetPassword($submitResetPasswordInput: SubmitResetPasswordInput!) {
    submitResetPassword(submitResetPasswordInput: $submitResetPasswordInput) {
      id
    }
  }
`;
