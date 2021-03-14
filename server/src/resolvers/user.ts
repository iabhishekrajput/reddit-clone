import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@InputType()
class UsernamePasswordEmailInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (user.id === req.session.userId) {
      return user.email;
    }

    return "";
  }

  @FieldResolver(() => String)
  createdAt(@Root() user: User, @Ctx() { req }: MyContext) {
    if (user.id === req.session.userId) {
      return user.createdAt;
    }

    return "";
  }

  @FieldResolver(() => String)
  updatedAt(@Root() user: User, @Ctx() { req }: MyContext) {
    if (user.id === req.session.userId) {
      return user.updatedAt;
    }

    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 8) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password must be atleast 8 characters long",
          },
        ],
      };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Link expired!",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User doesnot exist!",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    req.session.userId = user.id;
    await redis.del(key);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return true;
    }

    const token = v4();
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 10
    );

    const body = `<p>Hello User,</p>
        <p>We have received a password reset request for your account: ${email}</p>
      <br/>
      <p>If this is requested by you, kindly click on <a href="http://localhost:3000/change-password/${token}">Reset Password</a> to reset your password, ignore otherwise.</p>`;

    await sendEmail(email, body);

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }

    const user = await User.findOne(req.session.userId);

    if (!user) {
      return null;
    }

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordEmailInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);

    const usernameExists = await User.findOne({
      where: {
        username: options.username.toLowerCase(),
      },
    });

    const emailExists = await User.findOne({
      where: {
        email: options.email.toLowerCase(),
      },
    });

    if (usernameExists?.username) {
      return {
        errors: [
          {
            field: "username",
            message: "Username already exists!",
          },
        ],
      };
    }

    if (emailExists?.email) {
      return {
        errors: [
          {
            field: "email",
            message: "Email already registered!",
          },
        ],
      };
    }

    const user = await User.create({
      username: options.username.toLowerCase(),
      password: hashedPassword,
      email: options.email.toLowerCase(),
    }).save();

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: usernameOrEmail.includes("@")
        ? {
            email: usernameOrEmail.toLowerCase(),
          }
        : {
            username: usernameOrEmail.toLowerCase(),
          },
    });

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Invalid Username or Email!",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Invalid Password!",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.error(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
