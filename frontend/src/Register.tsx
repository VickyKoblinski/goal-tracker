import { useEffect } from "react";
import { gql } from "@apollo/client";
import { CreateUserInput, useSignupMutation } from "./generated/graphql";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

export default function Signin() {
  const [signupMutation, signupMutationResult] = useSignupMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserInput>();
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder="Username"
        {...register("username", { required: true, maxLength: 80 })}
      />
      <input
        type="text"
        placeholder="Email"
        {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
      />
      <input
        type="password"
        placeholder="Password"
        {...register("password", { required: true, maxLength: 100 })}
      />

      <input type="submit" />
    </form>
  );
}

gql`
  mutation Signup($createUserInput: CreateUserInput!) {
    register(createUserInput: $createUserInput) {
      token
    }
  }
`;
