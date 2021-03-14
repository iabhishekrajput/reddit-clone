import { Post } from "../entities/Post";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    if (root.text.length > 50) {
      return root.text.slice(0, 50) + "...";
    }

    return root.text;
  }

  @FieldResolver(() => Int)
  async voteStatus(
    @Root() root: Post,
    @Ctx() { req }: MyContext
  ): Promise<number> {
    const userId = req.session.userId;

    console.log(req.session);

    if (!userId) {
      return 0;
    }

    const updoot = await Updoot.findOne({
      where: {
        postId: root.id,
        userId,
      },
    });

    if (updoot) {
      return updoot.value;
    }

    return 0;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    let realValue = 0;

    if (value > 0) {
      realValue = 1;
    } else if (value < 0) {
      realValue = -1;
    }

    const userId = req.session.userId;

    const updoot = await Updoot.findOne({ where: { postId, userId } });

    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `UPDATE updoot SET value = $1 WHERE "postId" = $2 and "userId" = $3`,
          [realValue, postId, userId]
        );

        await tm.query(
          `UPDATE post SET points = points + $1 WHERE id = $2 RETURNING *`,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `INSERT INTO updoot ("userId", "postId", value) VALUES ($1, $2, $3)`,
          [userId, postId, realValue]
        );

        await tm.query(
          `UPDATE post SET points = points + $1 WHERE id = $2 RETURNING *`,
          [realValue, postId]
        );
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async getAllPosts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const results = getConnection()
      .getRepository(Post)
      .createQueryBuilder("post")
      .innerJoinAndSelect("post.creator", "creator")
      .orderBy("post.createdAt", "DESC")
      .take(realLimitPlusOne);

    if (cursor) {
      results.where("post.createdAt < :cursor", {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await results.getMany();

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  getPostById(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ["creator"] });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("options") options: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | undefined> {
    const post = await Post.create({
      ...options,
      creatorId: req.session.userId,
    }).save();

    return Post.findOne(post.id, { relations: ["creator"] });
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
