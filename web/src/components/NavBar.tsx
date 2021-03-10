import React from "react";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" mx={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white" mx={2}>
            Register
          </Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex color="white">
        <Box mx={2}>{data.me.username}</Box>
        <Button variant="link" mx={2}>
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="teal" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
