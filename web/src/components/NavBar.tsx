import React from "react";
import {
  Avatar,
  Box,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  const [, logout] = useLogoutMutation();
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
      <Flex color="white" alignItems="center">
        <Box>
          <NextLink href="/create-post">
            <Link mx={4}>Create Post</Link>
          </NextLink>
        </Box>
        <Box alignItems="center">
          <Menu>
            <Link>
              <MenuButton as={Box}>
                <Flex alignItems="center">
                  <Avatar size="xs" ml={2} />
                  <Box mx={2}>
                    {data.me !== null && typeof data.me !== "undefined"
                      ? data.me.username
                      : "User"}
                  </Box>
                  <ChevronDownIcon />
                </Flex>
              </MenuButton>
            </Link>
            <MenuList>
              <MenuItem
                onClick={() => {
                  logout();
                }}
              >
                <Text color="black">Logout</Text>
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="teal" p={4}>
      <Flex align="center" flex={1} margin="auto" maxW={800}>
        <Box mr={"auto"}>
          <Flex color="white">
            <NextLink href="/">
              <Link mx={2} fontWeight="bold">
                LiReddit
              </Link>
            </NextLink>
          </Flex>
        </Box>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
