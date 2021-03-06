import React from "react";
import { Box, Button, Skeleton, SkeletonText } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
  useGetPostByIdQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { useRouter } from "next/router";
import { withApollo } from "../../../utils/withApollo";

interface EditPostProps {}

const EditPost: React.FC<EditPostProps> = ({}) => {
  const router = useRouter();
  const id =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const { data, loading } = useGetPostByIdQuery({
    skip: id === -1,
    variables: {
      id,
    },
  });

  const [updatePost] = useUpdatePostMutation();

  if (loading) {
    return (
      <Layout>
        <Box>
          <Skeleton isLoaded={!loading} height={10} />
          <SkeletonText isLoaded={!loading} mt="4" noOfLines={4} spacing="4" />
        </Box>
      </Layout>
    );
  }

  if (!data?.getPostById) {
    return (
      <Layout>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            textAlign: "center",
            height: "80vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              display: "inline-block",
              borderRight: "1px solid rgba(0, 0, 0, .3)",
              margin: 0,
              marginRight: "20px",
              padding: "10px 23px 10px 0",
              fontSize: "24px",
              fontWeight: 500,
              verticalAlign: "top",
            }}
          >
            404
          </h1>
          <div
            style={{
              display: "inline-block",
              textAlign: "left",
              lineHeight: "49px",
              height: "49px",
              verticalAlign: "middle",
            }}
          >
            <h1
              style={{
                fontSize: "14px",
                fontWeight: "normal",
                lineHeight: "inherit",
                margin: 0,
                padding: 0,
              }}
            >
              No Post Found
            </h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{
          title: data?.getPostById?.title ? data.getPostById.title : "",
          text: data?.getPostById?.text ? data.getPostById.text : "",
        }}
        onSubmit={async (values) => {
          const { errors } = await updatePost({
            variables: {
              id,
              title: values.title,
              text: values.text,
            },
          });
          if (!errors) {
            router.push("/");
          } else {
            errors.map((e) => console.log(e.message));
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField name="title" placeholder="Title" label="Title" />
            </Box>
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="Text"
                label="Text"
                textarea={true}
              />
            </Box>
            <Box mt={4}>
              <Button type="submit" isLoading={isSubmitting} colorScheme="teal">
                Update Post
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(EditPost);
