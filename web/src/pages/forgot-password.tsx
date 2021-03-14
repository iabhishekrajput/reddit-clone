import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useForgotPasswordMutation } from "../generated/graphql";
import { Layout } from "../components/Layout";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{
          email: "",
        }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              <p>
                If user with this email exists, you will receive an email with
                the next steps to get back to your account.
              </p>
            </Box>
          ) : (
            <Form>
              <Box mt={4}>
                <InputField
                  name="email"
                  placeholder="Email"
                  label="Email"
                  type="email"
                />
              </Box>
              <Box mt={4}>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="teal"
                >
                  Proceed
                </Button>
              </Box>
            </Form>
          )
        }
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
