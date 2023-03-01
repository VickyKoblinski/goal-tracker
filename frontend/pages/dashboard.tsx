import { useEffect } from "react";
import Container from "@mui/material/Container";
import { useRouter } from "next/router";
import { gql } from "@apollo/client";
import { useWhoAmIQuery } from "src/generated/graphql";
import { Button, LinearProgress } from "@mui/material";

export default function Dashboard() {
  const router = useRouter();
  const { data, error, loading } = useWhoAmIQuery();

  if (loading) return "loading";

  return <Container maxWidth="lg">Hello {data?.whoAmI.username}</Container>;
}

gql`
  query WhoAmI {
    whoAmI {
      id
      username
    }
  }
`;
