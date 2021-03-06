import React, { useState } from "react";
import { NextPage } from "next";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import { InputField } from "../../components/InputField";
import { toErrorMap } from "../../utils/toErrorMap";
import {
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from "../../generated/graphql";
import NextLink from "next/link";
import { Layout } from "../../components/Layout";
import { withApollo } from "../../utils/withApollo";

const ChangePassword: NextPage = () => {
  const [changePassword] = useChangePasswordMutation();
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");
  return (
    <Layout variant="small">
      <Formik
        initialValues={{
          newPassword: "",
        }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            variables: {
              token:
                typeof router.query.token === "string"
                  ? router.query.token
                  : "",
              newPassword: values.newPassword,
            },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.changePassword.user,
                },
              });
              cache.evict({ fieldName: "getAllPosts:{}" });
            },
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
                  <NextLink href="/forgot-password">
                    <Link>Click here to reset again.</Link>
                  </NextLink>
                </Box>
              </Flex>
            ) : null}
            <Box mt={4}>
              <Button type="submit" isLoading={isSubmitting} colorScheme="teal">
                Change Password
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(ChangePassword);
