import React from "react";
import { Box, Button, Flex, Stack } from "@chakra-ui/react";
import { useGetAllPostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import Post from "../components/Post";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  const { data, error, loading, fetchMore, variables } = useGetAllPostsQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (!data && !loading) {
    return (
      <div>
        <div>Some Error Occurred!</div>
        <div>{error?.message}</div>
      </div>
    );
  }

  return (
    <Layout>
      {!data && loading ? (
        <div>Loading</div>
      ) : (
        <Stack spacing={8}>
          {data!.getAllPosts.posts.map((post) =>
            !post ? null : <Post key={post.id} post={post} />
          )}
        </Stack>
      )}
      {data && data.getAllPosts.hasMore ? (
        <Flex>
          <Button
            m="auto"
            my={8}
            onClick={async () => {
              await fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor: data!.getAllPosts.posts[
                    data!.getAllPosts.posts.length - 1
                  ].createdAt,
                },
              });
            }}
            isLoading={loading}
          >
            Load More
          </Button>
        </Flex>
      ) : (
        <Flex>
          <Box my={8} color="red">
            No more posts found!
          </Box>
        </Flex>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
