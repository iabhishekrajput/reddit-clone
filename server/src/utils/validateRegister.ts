import { InputType, Field } from "type-graphql";

@InputType()
class UsernamePasswordEmailInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

export const validateRegister = (options: UsernamePasswordEmailInput) => {
  if (options.username.length < 5) {
    return [
      {
        field: "username",
        message: "Username must be atleast 5 characters long",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Username must not contain '@' character",
      },
    ];
  }

  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email address!",
      },
    ];
  }

  if (options.password.length < 8) {
    return [
      {
        field: "password",
        message: "Password must be atleast 8 characters long",
      },
    ];
  }

  return null;
};
