import React, { useState } from "react";
import { Box, Button, Flex, Stack } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useGetAllPostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import Post from "../components/Post";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = useGetAllPostsQuery({
    variables,
  });

  if (!data && !fetching) {
    return <div>Some Error Occurred!</div>;
  }

  return (
    <Layout>
      {!data && fetching ? (
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
            onClick={() => {
              let index = data!.getAllPosts.posts.length;
              while (index-- && !data!.getAllPosts.posts[index]);
              setVariables((prevState) => ({
                limit: prevState.limit,
                cursor: data!.getAllPosts.posts[index].createdAt,
              }));
            }}
            isLoading={fetching}
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
