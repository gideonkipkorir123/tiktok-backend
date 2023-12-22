import { Field, ObjectType } from "@nestjs/graphql";
import { PostType } from "../../post/entities/post.type";
import { User } from "../../user/entities/user.entity";

@ObjectType()
export class Comment {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  postId: string;

  @Field(() => User)
  user: User;

  // Assuming Post model exists
  @Field(() => PostType)
  post: PostType;

  @Field()
  text: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
