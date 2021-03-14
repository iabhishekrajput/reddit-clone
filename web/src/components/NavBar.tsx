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

  if (!data?.me || fetching) {
    body = (
      <Flex>
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
      </Flex>
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
    <Flex zIndex={1} position="sticky" top={0} bg="teal" p={4}>
      <Flex mr={"auto"}>
        <Heading mx={12} as="h3" size="md" color="white">
          Flux
        </Heading>
        <NextLink href="/">
          <Link color="white" mx={2}>
            Home
          </Link>
        </NextLink>
        <NextLink href="/create-post">
          <Link color="white" mx={2}>
            Create Post
          </Link>
        </NextLink>
      </Flex>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
