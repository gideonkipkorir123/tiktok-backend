import { InputType, Field } from "@nestjs/graphql";
import * as GraphQLUpload from "graphql-upload/GraphQLUpload.js";

@InputType()
export class CreatePostInput {
  @Field()
  text: string;
  @Field(() => GraphQLUpload, { nullable: true })
  video: string;
}
