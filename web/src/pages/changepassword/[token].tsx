import React, { useState } from "react";
import { NextPage } from "next";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import { InputField } from "../../components/InputField";
import { NavBar } from "../../components/NavBar";
import { Wrapper } from "../../components/Wrapper";
import { toErrorMap } from "../../utils/toErrorMap";
import { useChangePasswordMutation } from "../../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import NextLink from "next/link";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const [, changePassword] = useChangePasswordMutation();
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");
  return (
    <>
      <NavBar />
      <Wrapper variant="small">
        <Formik
          initialValues={{
            newPassword: "",
          }}
          onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({
              token,
              newPassword: values.newPassword,
            });
            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              }

              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Box mt={4}>
                <InputField
                  name="newPassword"
                  placeholder="New Password"
                  label="New Password"
                  type="password"
                />
              </Box>
              {tokenError ? (
                <Flex>
                  <Box mr={2} style={{ color: "red" }} mt={4}>
                    {tokenError}
                  </Box>
                  <Box mr={2} mt={4}>
                    <NextLink href="/forgotpassword">
                      <Link>Click here to reset again.</Link>
                    </NextLink>
                  </Box>
                </Flex>
              ) : null}
              <Box mt={4}>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="teal"
                >
                  Change Password
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
