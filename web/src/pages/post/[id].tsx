import React from "react";
import { useRouter } from "next/router";
import { useGetPostByIdQuery } from "../../generated/graphql";
import { Layout } from "../../components/Layout";
import { Heading, Text } from "@chakra-ui/layout";
import { Box, Skeleton, SkeletonText } from "@chakra-ui/react";
import { withApollo } from "../../utils/withApollo";

interface PostDetailsProps {}

const PostDetails: React.FC<PostDetailsProps> = ({}) => {
  const router = useRouter();
  const id =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const { data, loading } = useGetPostByIdQuery({
    skip: id === -1,
    variables: {
      id,
    },
  });

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
    <Layout>
      <Box>
        <Heading my={2}>{data.getPostById.title}</Heading>
        <Text my={4}>{data.getPostById.text}</Text>
      </Box>
    </Layout>
  );
};

export default withApollo({ ssr: true })(PostDetails);
