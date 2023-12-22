import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { LikeService } from "./like.service";
import { LikeType } from "./entities/like.entity";
import { CreateLikeInput } from "./dto/create-like.input";
import { UpdateLikeInput } from "./dto/update-like.input";

@Resolver(() => LikeType)
export class LikeResolver {
  constructor(private readonly likeService: LikeService) {}

  @Mutation(() => LikeType)
  createLike(@Args("createLikeInput") createLikeInput: CreateLikeInput) {
    return this.likeService.create(createLikeInput);
  }

  @Query(() => [LikeType], { name: "like" })
  findAll() {
    return this.likeService.findAll();
  }

  @Query(() => LikeType, { name: "like" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.likeService.findOne(id);
  }

  @Mutation(() => LikeType)
  updateLike(@Args("updateLikeInput") updateLikeInput: UpdateLikeInput) {
    return this.likeService.update(updateLikeInput.id, updateLikeInput);
  }

  @Mutation(() => LikeType)
  removeLike(@Args("id", { type: () => Int }) id: number) {
    return this.likeService.remove(id);
  }
}
