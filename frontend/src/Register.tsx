import { useEffect } from "react";
import { gql } from "@apollo/client";
import { CreateUserInput, useSignupMutation } from "./generated/graphql";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Box, Input, TextField, Button } from "@mui/material";

export default function Signin() {
  const [signupMutation, signupMutationResult] = useSignupMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserInput>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: CreateUserInput) => {
    signupMutation({
      variables: {
        createUserInput: data,
      },
    });
  };

  useEffect(() => {
    if (signupMutationResult.data) {
      const { token } = signupMutationResult.data.register;

      localStorage.setItem("token", token);
      router.push("/verify");
    }
  }, [signupMutationResult, router]);

  return (
    <Box
      component="form"
      sx={{
        "& .MuiTextField-root": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <Controller
          name="username"
          control={control}
          render={({ field, fieldState, formState }) => (
            <TextField
              label="Username"
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field, fieldState, formState }) => (
            <TextField
              label="Password"
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          rules={{
            required: "Required",
            pattern: { value: /^\S+@\S+$/i, message: "input must match @" },
          }}
          render={({ field, fieldState, formState }) => (
            <TextField
              label="Email"
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Button variant="contained" type="submit">
          Submit
        </Button>
      </div>
    </Box>
  );
}

gql`
  mutation Signup($createUserInput: CreateUserInput!) {
    register(createUserInput: $createUserInput) {
      token
    }
  }
`;
