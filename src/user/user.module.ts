import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserResolver } from "./user.resolver";
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [
    UserResolver,
    UserService,
    AuthService,
    PrismaService,
    ConfigService,
  ],
})
export class UserModule {}
