import React from "react";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
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
        <Button
          variant="link"
          color="white"
          mx={2}
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="teal" p={4}>
      <Box mr={"auto"}>
        <Heading as="h3" size="md" color="white">
          Flux
        </Heading>
      </Box>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
