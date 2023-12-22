import { ObjectType, Field } from "@nestjs/graphql";
import { LikeType } from "../../like/entities/like.entity";
import { User } from "../../user/entities/user.entity";

@ObjectType()
export class PostType {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field()
  createdAt: Date;

  @Field()
  video: string;
  @Field(() => User)
  user?: User;

  @Field(() => [LikeType], { nullable: true })
  likes?: LikeType[];
}

@ObjectType()
export class PostDetails extends PostType {
  @Field(() => [String], { nullable: true })
  otherPostIds?: string[];
}
