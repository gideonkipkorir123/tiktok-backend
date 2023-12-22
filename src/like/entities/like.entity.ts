import { ObjectType, Field } from "@nestjs/graphql";

@ObjectType()
export class LikeType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  postId: string;
}
