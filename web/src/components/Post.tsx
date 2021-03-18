import React, { useState } from "react";
import {
  TriangleUpIcon,
  TriangleDownIcon,
  CheckIcon,
  DeleteIcon,
  EditIcon,
} from "@chakra-ui/icons";
import { Flex, Box, IconButton, Heading, Text, Link } from "@chakra-ui/react";
import {
  PostSnippetFragment,
  useDeletePostMutation,
  useMeQuery,
  useVoteMutation,
} from "../generated/graphql";
import NextLink from "next/link";
import { isServer } from "../utils/isServer";

interface PostProps {
  post: PostSnippetFragment;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [voteLoading, setVoteLoading] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  const [{ fetching: deleteFetching }, deletePost] = useDeletePostMutation();
  const [{ data: meData, fetching: meFetching }] = useMeQuery({
    pause: isServer(),
  });

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
      <Box flex={1}>
        <NextLink href="/post/[id]" as={`/post/${post.id}`}>
          <Link>
            <Heading fontSize="xl">{post.title}</Heading>
          </Link>
        </NextLink>
        <Text as="sub">Posted by {post.creator.username}</Text>
        <Flex alignItems="center">
          <Text flex={1} mt={4}>
            {post.textSnippet}
          </Text>
          {!meFetching &&
          meData &&
          meData.me &&
          meData.me.id === post.creator.id ? (
            <Box ml="auto">
              <NextLink href="/post/edit/[id]" as={`/post/edit/${post.id}`}>
                <IconButton
                  as={Link}
                  mx={2}
                  icon={<EditIcon />}
                  aria-label="Edit Post"
                  variant="outline"
                />
              </NextLink>
              <IconButton
                mx={2}
                icon={<DeleteIcon />}
                aria-label="Delete Post"
                variant="outline"
                isLoading={deleteFetching}
                onClick={async () => {
                  await deletePost({ id: post.id });
                }}
              />
            </Box>
          ) : null}
        </Flex>
      </Box>
    </Flex>
  );
};

export default Post;
