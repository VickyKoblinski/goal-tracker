import { useRef, useEffect } from 'react';
import * as Yup from 'yup';
// next
import { useRouter } from 'next/router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, FormHelperText } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import { useSnackbar } from '../../components/snackbar';
import FormProvider, { RHFCodes } from '../../components/hook-form';
import { useAuthContext } from '@/auth/useAuthContext';

// ----------------------------------------------------------------------

type FormValuesProps = {
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  code5: string;
  code6: string;
};

export default function AuthVerifyCodeForm() {
  const { push, query } = useRouter();
  const { verify } = useAuthContext();
  const ref = useRef<HTMLButtonElement>(null);

  const { enqueueSnackbar } = useSnackbar();

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required('Code is required'),
    code2: Yup.string().required('Code is required'),
    code3: Yup.string().required('Code is required'),
    code4: Yup.string().required('Code is required'),
    code5: Yup.string().required('Code is required'),
    code6: Yup.string().required('Code is required'),
  });

  const defaultValues = {
    code1: '',
    code2: '',
    code3: '',
    code4: '',
    code5: '',
    code6: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifyCodeSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    reset,
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await verify(data.code1 + data.code2 + data.code3 + data.code4 + data.code5 + data.code6);
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

      ref.current?.click();
    }
  }, [query.token]);

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <RHFCodes
            keyName="code"
            inputs={['code1', 'code2', 'code3', 'code4', 'code5', 'code6']}
          />

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

          <LoadingButton
            ref={ref}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{ mt: 3 }}
          >
            Verify
          </LoadingButton>
        </Stack>
      </FormProvider>
    </>
  );
}
