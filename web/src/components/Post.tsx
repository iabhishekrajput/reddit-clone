import React, { useState } from "react";
import { TriangleUpIcon, TriangleDownIcon, CheckIcon } from "@chakra-ui/icons";
import { Flex, Box, IconButton, Heading, Text } from "@chakra-ui/react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface PostProps {
  post: PostSnippetFragment;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [voteLoading, setVoteLoading] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex p={5} shadow="md" borderWidth="1px">
      <Flex
        direction="column"
        justifyContent="space-between"
        alignItems="center"
        top={0}
        mx={4}
      >
        <Box>
          <IconButton
            variant="ghost"
            aria-label="Upvote"
            icon={
              post.voteStatus === 1 ? (
                <CheckIcon color={"green"} w={6} h={6} />
              ) : (
                <TriangleUpIcon color={"gray"} w={6} h={6} />
              )
            }
            isLoading={voteLoading === "upvote-loading"}
            onClick={async () => {
              if (post.voteStatus === 1) {
                return;
              }
              setVoteLoading("upvote-loading");
              await vote({ postId: post.id, value: 1 });
              setVoteLoading("not-loading");
            }}
          >
            Upvote
          </IconButton>
        </Box>
        <Box>
          <Text>{post.points}</Text>
        </Box>
        <Box>
          <IconButton
            variant="ghost"
            aria-label="Downvote"
            icon={
              post.voteStatus === -1 ? (
                <CheckIcon color={"red"} w={6} h={6} />
              ) : (
                <TriangleDownIcon color={"gray"} w={6} h={6} />
              )
            }
            isLoading={voteLoading === "downvote-loading"}
            onClick={async () => {
              if (post.voteStatus === -1) {
                return;
              }
              setVoteLoading("downvote-loading");
              await vote({ postId: post.id, value: -1 });
              setVoteLoading("not-loading");
            }}
          >
            Downvote
          </IconButton>
        </Box>
      </Flex>
      <Box>
        <Heading fontSize="xl">{post.title}</Heading>
        <Text as="sub">Posted by {post.creator.username}</Text>
        <Text mt={4}>{post.textSnippet}</Text>
      </Box>
    </Flex>
  );
};

export default Post;
