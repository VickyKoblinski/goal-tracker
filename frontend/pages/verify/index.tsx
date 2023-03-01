import { useEffect } from "react";
import Container from "@mui/material/Container";
import { useRouter } from "next/router";
import { gql } from "@apollo/client";
import { useVerifyEmailMutation } from "src/generated/graphql";
import { Button, LinearProgress } from "@mui/material";

export default function Verify() {
  const router = useRouter();
  const [verifyEmailMutation, { data, error, loading }] =
    useVerifyEmailMutation({
      variables: {
        emailVerificationToken:
          typeof router.query.token === "string" ? router.query.token : "",
      },
      errorPolicy: "all",
    });

  useEffect(() => {
    if (router.query.token) {
      verifyEmailMutation();
    }
  }, [router.query.token, verifyEmailMutation]);

  if (error) {
    return (
      <pre>
        Bad:{" "}
        {error.graphQLErrors.map(({ message }, i) => (
          <span key={i}>{message}</span>
        ))}
      </pre>
    );
  }

  if (data) {
    return (
      <>
        <Button onClick={() => router.push("/dashboard")}>
          go to dashboard
        </Button>
      </>
    );
  }

  return (
    <>
      <LinearProgress
        sx={{ visibility: router.query.token ? "visible" : "hidden" }}
      />
      <Container maxWidth="lg">Verify your email</Container>
    </>
  );
}

gql`
  mutation VerifyEmail($emailVerificationToken: String!) {
    verifyEmail(emailVerificationToken: $emailVerificationToken) {
      id
    }
  }
`;
