import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { Auth } from "./entities/auth.entity";

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => [Auth], { name: "auth" })
  findAll() {
    return this.authService.findAll();
  }

  @Query(() => Auth, { name: "auth" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.authService.findOne(id);
  }

  @Mutation(() => Auth)
  removeAuth(@Args("id", { type: () => Int }) id: number) {
    return this.authService.remove(id);
  }
}
