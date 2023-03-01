import { useEffect } from "react";
import { gql } from "@apollo/client";
import { LoginUserInput, useLoginMutation } from "./generated/graphql";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Box, Input, TextField, Button } from "@mui/material";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

let userSchema = yup.object({
  username: yup.string().required(),
  password: yup.string().required(),
});

export default function Login() {
  const [signupMutation, { loading }] = useLoginMutation({
    onCompleted: (data) => {
      console.log(data);
      if (data) {
        localStorage.setItem("token", data.login.token);
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      if (error.graphQLErrors) {
        error.graphQLErrors.forEach((gqlE) => {
          if (gqlE.extensions.code === "BAD_USER_INPUT") {
            const invalidArgs = gqlE.extensions.invalidArgs as (
              | "username"
              | "password"
            )[];
            invalidArgs.forEach((arg) => {
              setError(arg, { type: "required", message: "missing" });
            });
          }
        });
      }
    },
  });
  const router = useRouter();

  const { handleSubmit, control, setError } = useForm<LoginUserInput>({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: yupResolver(userSchema),
  });

  const onSubmit = (data: LoginUserInput) => {
    signupMutation({
      variables: {
        loginUserInput: data,
      },
    });
  };

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
              disabled={loading}
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
              disabled={loading}
              label="Password"
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Button disabled={loading} variant="contained" type="submit">
          Submit
        </Button>
      </div>
    </Box>
  );
}

gql`
  mutation Login($loginUserInput: LoginUserInput!) {
    login(loginUserInput: $loginUserInput) {
      token
    }
  }
`;
