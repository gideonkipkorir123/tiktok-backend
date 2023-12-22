import { Module } from "@nestjs/common";
import { PostService } from "./post.service";
import { PostResolver } from "./post.resolver";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [PostResolver, PostService, PrismaService, ConfigService],
})
export class PostModule {}
